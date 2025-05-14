const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const QRCode = require('qrcode');

const { PengajuanCuti, Pegawai, VerifikasiCuti, KuotaCuti } = require('../models');

Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
});

Handlebars.registerHelper("getKuota", function (obj, key) {
    return obj && obj[key] ? obj[key] : 0;
});

Handlebars.registerHelper("uppercase", function (str) {
    return str?.toUpperCase?.() || '';
});

const formatTanggalJam = { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  
const cetakSuratCuti = async (req, res) => {
    try {
        const { id } = req.params;

        const pengajuan = await PengajuanCuti.findByPk(id, {
            include: [
                { model: Pegawai, as: 'Pegawai', include: [{ model: KuotaCuti }] },
                { model: Pegawai, as: 'PenerimaTugas', required: false },
                {
                    model: VerifikasiCuti,
                    include: [{ model: Pegawai, as: 'verifikator' }]
                },
            ],
            order: [[{ model: VerifikasiCuti }, 'urutanVerifikasi', 'ASC']],
        });

        if (!pengajuan) return res.status(404).json({ msg: 'Pengajuan tidak ditemukan' });

        const rawKuota = pengajuan.Pegawai.KuotaCutis;
        const kuota = {};
        rawKuota.forEach((item) => {
            const plain = item.get({ plain: true });
            kuota[plain.jenisCuti] = plain.sisaKuota;
        });

        const tahunKeterangan = new Date(pengajuan.tanggalPengajuan).getFullYear();

        const pegawai = pengajuan.Pegawai;
        const pegawaiQRText = `Nama: ${pegawai.nama}\nNIP: ${pegawai.nip}\nMengajukan: ${pengajuan.jenisCuti}\nPada Tanggal: ${pengajuan.tanggalPengajuan.toLocaleDateString('id-ID', formatTanggalJam).replace(/\./g, ':')}`;
        const qrCodePengaju = await generateQRCodeBase64(pegawaiQRText);

        const filteredVerifikator = await Promise.all(
            pengajuan.VerifikasiCutis
                .filter(v =>
                    ["Kepala Satuan Pelayanan", "Ketua Tim", "Kepala Sub Bagian Umum"].includes(v.jenisVerifikator)
                )
                .map(async v => {
                    const qrText = `Nama: ${v.verifikator?.nama}\nNIP: ${v.verifikator?.nip}\nStatus: ${v.statusVerifikasi}\nPada Tanggal: ${v.updatedAt.toLocaleString("id-ID", formatTanggalJam).replace(/\./g, ':')}`;
                    const qrCode = await generateQRCodeBase64(qrText);
                    return {
                        jenis: v.jenisVerifikator,
                        nama: v.verifikator?.nama,
                        nip: v.verifikator?.nip,
                        status: v.statusVerifikasi,
                        komentar: v.komentar,
                        tanggalVerifikasi: v.updatedAt.toLocaleString("id-ID", {
                            day: "2-digit", month: "long", year: "numeric"
                        }),
                        qrCode
                    };
                })
        );

        const verifikatorKepalaBalai = pengajuan.VerifikasiCutis.find(
            v => v.jenisVerifikator === "Kepala Balai Besar"
        );
        let kepalaBalai = null;
        if (verifikatorKepalaBalai) {
            const qrText = `Nama: ${verifikatorKepalaBalai.verifikator?.nama}\nNIP: ${verifikatorKepalaBalai.verifikator?.nip}\nStatus: ${verifikatorKepalaBalai.statusVerifikasi}\nPada Tanggal: ${verifikatorKepalaBalai.updatedAt.toLocaleString("id-ID", formatTanggalJam).replace(/\./g, ':')}`;
            const qrCode = await generateQRCodeBase64(qrText);

            kepalaBalai = {
                jenis: verifikatorKepalaBalai.jenisVerifikator,
                nama: verifikatorKepalaBalai.verifikator?.nama,
                nip: verifikatorKepalaBalai.verifikator?.nip,
                status: verifikatorKepalaBalai.statusVerifikasi,
                komentar: verifikatorKepalaBalai.komentar,
                tanggalVerifikasi: verifikatorKepalaBalai.updatedAt.toLocaleString("id-ID", {
                    day: "2-digit", month: "long", year: "numeric"
                }),
                qrCode
            };
        }

        let kuotaTahunanBreakdown = null;
        if (pengajuan.jenisCuti === "Cuti Tahunan") {
            let sisaKembali = pengajuan.durasi;
            kuotaTahunanBreakdown = {};

            for (const jenis of ["Cuti Tahunan", "Cuti Tahunan N-1", "Cuti Tahunan N-2"]) {
                const item = rawKuota.find(k => k.jenisCuti === jenis);
                if (!item) continue;

                const sisaSekarang = item.sisaKuota;
                const total = item.totalKuota;

                const maksimumPemakaian = total - sisaSekarang;
                const dikembalikan = Math.min(sisaKembali, maksimumPemakaian);
                const sebelumDipakai = sisaSekarang + dikembalikan;

                kuotaTahunanBreakdown[jenis] = sebelumDipakai;
                sisaKembali -= dikembalikan;
            }
        }

        const data = {
            pegawai: pengajuan.Pegawai.get({ plain: true }),
            jenisCuti: pengajuan.jenisCuti,
            tahunN: tahunKeterangan,
            tahunN1: tahunKeterangan - 1,
            tahunN2: tahunKeterangan - 2,
            alasanCuti: pengajuan.alasanCuti,
            durasi: pengajuan.durasi,
            tanggalMulai: new Date(pengajuan.tanggalMulai).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }),
            tanggalSelesai: new Date(pengajuan.tanggalSelesai).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }),
            sisaKuota: pengajuan.sisaKuota,
            kuota,
            kuotaTahunanBreakdown,
            tanggalPengajuan: new Date(pengajuan.tanggalPengajuan).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }),
            alamatCuti: pengajuan.alamatCuti,
            qrCodePengaju,
            filteredVerifikator,
            kepalaBalai,
            pelimpahan: pengajuan.PenerimaTugas
                ? pengajuan.PenerimaTugas.get({ plain: true })
                : null,
        };

        // Baca dan render template HTML dari handlebars
        const templatePath = path.join(__dirname, '../uploads/template/template_surat_cuti.hbs');
        const source = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(source);
        const html = template(data);

        // Gunakan puppeteer untuk generate PDF
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=SuratCuti_${id}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Gagal mencetak surat cuti:', error);
        res.status(500).json({ msg: 'Gagal mencetak surat cuti', error: error.message });
    }
};

const generateQRCodeBase64 = async (text) => {
    try {
        const dataUrl = await QRCode.toDataURL(text, { width: 200 });
        return dataUrl;
    } catch (err) {
        console.error("Gagal membuat QR:", err);
        return null;
    }
};

module.exports = {
    cetakSuratCuti,
};