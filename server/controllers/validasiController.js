const { PengajuanCuti, Pegawai, VerifikasiCuti } = require("../models");

const validasiPengajuan = async (req, res) => {
    try {
        const pengajuan = await PengajuanCuti.findOne({
            where: { id: req.params.id, status: "Disetujui" },
            include: { model: Pegawai, as: "Pegawai" },
        });

        if (!pengajuan) {
            return res.status(404).json({ msg: "Pengajuan tidak ditemukan atau belum disetujui" });
        }

        res.json(pengajuan);
    } catch (error) {
        console.error("Error validasi pengajuan:", error);
        res.status(500).json({ msg: "Gagal mengambil data pengajuan" });
    }
};

const validasiVerifikator = async (req, res) => {
    try {
        const verifikasi = await VerifikasiCuti.findOne({
            where: { id: req.params.id, statusVerifikasi: "Disetujui" },
            include: [
                { model: Pegawai, as: "verifikator" },
                {
                    model: PengajuanCuti,
                    include: [{ model: Pegawai, as: "Pegawai" }],
                },
            ],
        });

        if (!verifikasi) {
            return res.status(404).json({ msg: "Verifikasi tidak ditemukan atau belum disetujui" });
        }

        res.json(verifikasi);
    } catch (error) {
        console.error("Error validasi verifikator:", error);
        res.status(500).json({ msg: "Gagal mengambil data verifikasi" });
    }
};

module.exports = {
    validasiPengajuan,
    validasiVerifikator,
}