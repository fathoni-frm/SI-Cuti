const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const { PengajuanCuti, Pegawai, VerifikasiCuti, KuotaCuti } = require('../models');
const logoPath = path.join(__dirname, '../uploads/assets/logoQRCode.png');

Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
});

Handlebars.registerHelper("getKuota", function (obj, key) {
    return obj && obj[key] ? obj[key] : 0;
});

Handlebars.registerHelper("uppercase", function (str) {
    return str?.toUpperCase?.() || '';
});

const frontendBaseURL = process.env.FRONTEND_URL;

const formatTanggal = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
};

const generateQRCodeWithLogo = async (text, logoPath) => {
    try {
        const size = 300;
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        await QRCode.toCanvas(canvas, text, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 300
        });

        const logo = await loadImage(logoPath);
        const logoSize = size * 0.4;
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;

        ctx.drawImage(logo, x, y, logoSize, logoSize);

        return canvas.toDataURL();
    } catch (err) {
        console.error("Gagal generate QR Code dengan logo:", err);
        throw err;
    }
};


const generateSuratCuti = async (idPengajuan) => {
    try {
        const pengajuan = await PengajuanCuti.findByPk(idPengajuan, {
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

        if (!pengajuan) throw new Error('Pengajuan tidak ditemukan');

        const rawKuota = pengajuan.Pegawai.KuotaCutis;
        const kuota = {};
        rawKuota.forEach((item) => {
            const plain = item.get({ plain: true });
            kuota[plain.jenisCuti] = plain.sisaKuota;
        });

        const tahunKeterangan = new Date(pengajuan.tanggalPengajuan).getFullYear();

        const pegawaiQRUrl = `${frontendBaseURL}/validasi/qr-code-pengajuan/${pengajuan.id}`;
        const qrCodePengaju = await generateQRCodeWithLogo(pegawaiQRUrl, logoPath);

        const filteredVerifikator = await Promise.all(
            pengajuan.VerifikasiCutis
                .filter(v =>
                    ["Kepala Satuan Pelayanan", "Ketua Tim", "Kepala Sub Bagian Umum"].includes(v.jenisVerifikator)
                )
                .map(async v => {
                    const qrUrl = `${frontendBaseURL}/validasi/qr-code-verifikator/${v.id}`;
                    const qrCode = await generateQRCodeWithLogo(qrUrl, logoPath);
                    return {
                        jenis: v.jenisVerifikator,
                        nama: v.verifikator?.nama,
                        nip: v.verifikator?.nip,
                        status: v.statusVerifikasi,
                        komentar: v.komentar,
                        qrCode,
                    };
                })
        );

        const verifikatorKepalaBalai = pengajuan.VerifikasiCutis.find(
            v => v.jenisVerifikator === "Kepala Balai Besar"
        );
        let kepalaBalai = null;
        if (verifikatorKepalaBalai) {
            const qrUrl = `${frontendBaseURL}/validasi/qr-code-verifikator/${verifikatorKepalaBalai.id}`;
            const qrCode = await generateQRCodeWithLogo(qrUrl, logoPath);
            kepalaBalai = {
                jenis: verifikatorKepalaBalai.jenisVerifikator,
                nama: verifikatorKepalaBalai.verifikator?.nama,
                nip: verifikatorKepalaBalai.verifikator?.nip,
                status: verifikatorKepalaBalai.statusVerifikasi,
                komentar: verifikatorKepalaBalai.komentar,
                qrCode,
            };
        }

        const data = {
            pegawai: pengajuan.Pegawai.get({ plain: true }),
            jenisCuti: pengajuan.jenisCuti,
            tahunN: tahunKeterangan,
            tahunN1: tahunKeterangan - 1,
            tahunN2: tahunKeterangan - 2,
            alasanCuti: pengajuan.alasanCuti,
            durasi: pengajuan.durasi,
            tanggalMulai: new Date(pengajuan.tanggalMulai).toLocaleDateString("id-ID", formatTanggal),
            tanggalSelesai: new Date(pengajuan.tanggalSelesai).toLocaleDateString("id-ID", formatTanggal),
            kuota,
            tanggalPengajuan: new Date(pengajuan.tanggalPengajuan).toLocaleDateString("id-ID", formatTanggal),
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

        const namaFile = `SuratCuti_${idPengajuan}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../uploads/surat-cuti', namaFile);

        await page.pdf({
            path: filePath,
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
        });

        await browser.close();

        // console.log(namaFile);
        return namaFile;
    } catch (error) {
        console.error('Gagal mencetak surat cuti:', error);
        throw new Error('Gagal generate surat cuti:', error);
    }
};

module.exports = {
    generateSuratCuti,
};