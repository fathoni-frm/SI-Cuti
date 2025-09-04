const { PengajuanCuti, Pegawai, VerifikasiCuti, PelimpahanTugas } = require("../models");
const crypto = require("crypto");
const SECRET = process.env.QR_HMAC_SECRET;

const validasiQr = async (req, res) => {
    try {
        const { doc, id, role, sig } = req.params;
        let data;
        let ts;
        let pengajuan;

        switch (doc) {
            case "PMC":
                switch (role) {
                    case "pengaju":
                        data = await PengajuanCuti.findByPk(id, { include: [{ model: Pegawai, as: 'pegawai' }] });
                        ts = data?.tanggalPengajuan;
                        pengajuan = data;
                        break;
                    case "verifikator":
                        data = await VerifikasiCuti.findByPk(id, { include: [{ model: Pegawai, as: 'verifikator' }, { model: PengajuanCuti, include: [{ model: Pegawai, as: 'pegawai' }] }] });
                        ts = data?.tanggalVerifikasi;
                        pengajuan = data?.PengajuanCuti;
                        break;
                }
                break;
            case "PLT":
                switch (role) {
                    case "pengaju":
                        data = await PengajuanCuti.findByPk(id, { include: [{ model: Pegawai, as: 'pegawai' }] });
                        ts = data?.tanggalPengajuan;
                        pengajuan = data;
                        break;
                    case "penerima":
                        data = await PelimpahanTugas.findByPk(id, { include: [{ model: Pegawai, as: 'penerima' }, { model: PengajuanCuti, include: [{ model: Pegawai, as: 'pegawai' }] }] });
                        ts = data?.tanggalVerifikasi;
                        pengajuan = data?.PengajuanCuti;
                        break;
                    case "verifikator":
                        data = await VerifikasiCuti.findByPk(id, { include: [{ model: Pegawai, as: 'verifikator' }, { model: PengajuanCuti, include: [{ model: Pegawai, as: 'pegawai' }] }] });
                        ts = data?.tanggalVerifikasi;
                        pengajuan = data?.PengajuanCuti;
                        break;
                }
                break;
            case "PSC":
                data = await VerifikasiCuti.findByPk(id, { include: [{ model: Pegawai, as: 'verifikator' }, { model: PengajuanCuti, include: [{ model: Pegawai, as: 'pegawai' }] }] });
                ts = data?.tanggalVerifikasi;
                pengajuan = data?.PengajuanCuti;
                break;
            default:
                return res.status(400).json({ msg: "QR tidak valid" });
        }

        if (!data) {
            return res.status(404).json({ msg: "Data tidak ditemukan" });
        }

        const raw = `${doc}/${id}/${role}`;
        const expectedSig = crypto.createHmac("sha256", SECRET).update(`${raw}/${ts}`).digest("hex").slice(0, 32);

        if (sig !== expectedSig) {
            return res.status(403).json({ msg: "QR tidak valid" });
        }

        let penandatangan = {};
        if (role === "pengaju") {
            const p = data.pegawai ?? pengajuan.pegawai;
            penandatangan = {
                nama: p.nama,
                nip: p.nip,
                jabatan: p.jabatanStruktural === "Lainnya" ? p.jabatanFungsional : p.jabatanStruktural,
                tanggal: ts,
            };
        } else if (role === "verifikator" || role === "penerima") {
            const p = data.verifikator || data.penerima;
            penandatangan = {
                nama: p?.nama,
                nip: p?.nip,
                jabatan: role === "verifikator" ? p.jabatanStruktural : p.jabatanFungsional,
                tanggal: ts,
            };
        }

        const suratInfo = {
            perihal:
                doc === "PMC"
                    ? `Formulir Permintaan dan Pemberian Cuti`
                    : doc === "PLT"
                        ? "Surat Pelimpahan Tugas"
                        : "Surat Persetujuan Cuti",
            nama: pengajuan.pegawai?.nama,
            nip: pengajuan.pegawai?.nip,
        };

        return res.status(200).json({
            penandatangan,
            surat: suratInfo,
        });
    } catch (error) {
        console.error("Gagal verifikasi QR:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan saat verifikasi QR.", error: error.message });
    }
}

module.exports = {
    validasiQr,
}