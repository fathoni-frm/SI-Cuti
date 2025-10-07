const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const crypto = require("crypto");
const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const { PengajuanCuti, Pegawai, VerifikasiCuti, PelimpahanTugas, KuotaCuti } = require('../models');
const logoQRCode = path.join(__dirname, '../uploads/assets/logoQRCode.png');
const logoKop = path.resolve(__dirname, '../uploads/assets/logoKopSurat.png');
const SECRET = process.env.QR_HMAC_SECRET;

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

const qrWithLogo = async (text) => {
    try {
        const size = 300;
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        await QRCode.toCanvas(canvas, text, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 300
        });

        const logo = await loadImage(logoQRCode);
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

const makeSignedQr = async ({ doc, id, role, ts }) => {
    try {
        const raw = `${doc}/${id}/${role}`;
        const sig = crypto.createHmac("sha256", SECRET).update(`${raw}/${ts}`).digest("hex").slice(0, 32); // 128‑bit

        const url = `${process.env.FRONTEND_URL}/v/${raw}/${sig}`;
        return qrWithLogo(url);
    } catch (err) {
        console.error("Gagal membuat QR Code terenkripsi:", err);
        throw err;
    }
};

const generateSuratCuti = async (idPengajuan) => {
    try {
        const pengajuan = await PengajuanCuti.findByPk(idPengajuan, {
            include: [
                { model: Pegawai, as: 'pegawai', include: [{ model: KuotaCuti }] },
                { model: PelimpahanTugas, required: false, include: [{ model: Pegawai, as: 'penerima' }] },
                {
                    model: VerifikasiCuti,
                    include: [{ model: Pegawai, as: 'verifikator' }]
                },
            ],
            order: [[{ model: VerifikasiCuti }, 'urutanVerifikasi', 'ASC']],
        });

        if (!pengajuan) throw new Error('Pengajuan tidak ditemukan');

        const rawKuota = pengajuan.pegawai.KuotaCutis;
        const kuota = {};
        rawKuota.forEach((item) => {
            const plain = item.get({ plain: true });
            kuota[plain.jenisCuti] = plain.sisaKuota;
        });

        const tahunKeterangan = new Date(pengajuan.tanggalPengajuan).getFullYear();

        const qrCodePMCPengaju = await makeSignedQr({
            doc: "PMC",
            id: pengajuan.id,
            role: "pengaju",
            ts: pengajuan.tanggalPengajuan,
        });

        const filteredVerifikator = await Promise.all(
            pengajuan.VerifikasiCutis
                .filter(v =>
                    ["Kepala Satuan Pelayanan", "Ketua Tim", "Kepala Bagian Umum"].includes(v.jenisVerifikator)
                )
                .map(async v => {
                    const qrCode = await makeSignedQr({
                        doc: "PMC",
                        id: v.id,
                        role: "verifikator",
                        ts: v.tanggalVerifikasi,
                    });
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
            const qrCodePMC = await makeSignedQr({
                doc: "PMC",
                id: verifikatorKepalaBalai.id,
                role: "verifikator",
                ts: verifikatorKepalaBalai.tanggalVerifikasi,
            });
            const qrCodePSC = await makeSignedQr({
                doc: "PSC",
                id: verifikatorKepalaBalai.id,
                role: "verifikator",
                ts: verifikatorKepalaBalai.tanggalVerifikasi,
            });
            kepalaBalai = {
                jenis: verifikatorKepalaBalai.jenisVerifikator,
                nama: verifikatorKepalaBalai.verifikator?.nama,
                nip: verifikatorKepalaBalai.verifikator?.nip,
                status: verifikatorKepalaBalai.statusVerifikasi,
                komentar: verifikatorKepalaBalai.komentar,
                tanggal: new Date(verifikatorKepalaBalai.updatedAt).toLocaleDateString("id-ID", formatTanggal),
                qrCodePMC,
                qrCodePSC,
            };
        }

        let pelimpahan = null;
        if (pengajuan.PelimpahanTuga?.penerima) {
            const penerima = pengajuan.PelimpahanTuga.penerima.get({ plain: true });
            const qrCodePengaju = await makeSignedQr({
                doc: "PLT",
                id: pengajuan.id,
                role: "pengaju",
                ts: pengajuan.tanggalPengajuan,
            })
            const qrCodePenerima = await makeSignedQr({
                doc: "PLT",
                id: pengajuan.PelimpahanTuga.id,
                role: "penerima",
                ts: pengajuan.PelimpahanTuga.tanggalVerifikasi,
            });
            const qrCodeVerifikator = await makeSignedQr({
                doc: "PLT",
                id: verifikatorKepalaBalai.id,
                role: "verifikator",
                ts: verifikatorKepalaBalai.tanggalVerifikasi,
            })

            pelimpahan = {
                ...penerima,
                qrCodePengaju,
                qrCodePenerima,
                qrCodeVerifikator,
            };
        }

        const logoKopBase64 = fs.readFileSync(logoKop, "base64");        // <— penting: "base64"
        const logoKopSurat = `data:image/png;base64,${logoKopBase64}`;

        const data = {
            pegawai: pengajuan.pegawai.get({ plain: true }),
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
            qrCodePMCPengaju,
            filteredVerifikator,
            kepalaBalai,
            pelimpahan,
            logoKopSurat,
        };

        // Baca dan render template HTML dari handlebars
        const templatePath = path.join(__dirname, '../uploads/template/template_surat_cuti.hbs');
        const source = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(source);
        const html = template(data);

        // Gunakan puppeteer untuk generate PDF
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 120000 });

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