const { Notifikasi, PengajuanCuti, VerifikasiCuti } = require("../models");

const getNotifikasiByUser = async (req, res) => {
  try {
    const notifikasi = await Notifikasi.findAll({
      where: { idPenerima: req.user.idPegawai },
      include: [{ model: PengajuanCuti }],
      order: [["createdAt", "DESC"]],
    });
    res.json(notifikasi);
  } catch (error) {
    res.status(500).json({ msg: "Gagal mengambil notifikasi", error: error.message });
  }
};

const tandaiSudahDibaca = async (req, res) => {
  try {
    const { id } = req.params;
    const { idPegawai, idPengajuan } = req.body;

    const notifikasi = await Notifikasi.findByPk(id);
    if (!notifikasi) {
      return res.status(404).json({ msg: "Notifikasi tidak ditemukan" });
    }
    if (notifikasi.idPenerima !== idPegawai) {
      return res.status(403).json({ msg: "Akses ditolak" });
    }
    await notifikasi.update({ isRead: true });

    const verifikasi = await VerifikasiCuti.findOne({ where: { idPengajuan, idPimpinan: idPegawai } });
    if (verifikasi && verifikasi.statusVerifikasi === "Belum Diverifikasi") {
      await verifikasi.update({ statusVerifikasi: "Diproses" });
    }

    res.json({ msg: "Notifikasi ditandai sudah dibaca" });
  } catch (error) {
    res.status(500).json({ msg: "Gagal update notifikasi", error: error.message });
  }
};

const hapusNotifikasi = async (req, res) => {
  try {
    const { id } = req.params;
    const notifikasi = await Notifikasi.findByPk(id);

    if (!notifikasi || notifikasi.idPenerima !== req.user.idPegawai) {
      return res.status(403).json({ msg: 'Akses ditolak' });
    }

    await notifikasi.destroy();
    res.json({ msg: 'Notifikasi berhasil dihapus' });
  } catch (err) {
    console.error("Gagal menghapus notifikasi:", err);
    res.status(500).json({ msg: 'Gagal menghapus notifikasi', error: err.message });
  }
};

module.exports = {
  getNotifikasiByUser,
  tandaiSudahDibaca,
  hapusNotifikasi,
}