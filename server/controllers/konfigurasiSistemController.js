const { KonfigurasiSistem, Pegawai } = require("../models");

const getKonfigurasi = async (req, res) => {
  try {
    const konfigurasi = await KonfigurasiSistem.findOne({
      include: [
        {
          model: Pegawai,
          as: "kepalaBalai",
          attributes: ["id", "nama", "nip", "jabatanStruktural"],
        },
        {
          model: Pegawai,
          as: "kepalaBagianUmum",
          attributes: ["id", "nama", "nip", "jabatanStruktural"],
        },
      ],
    });

    if (!konfigurasi) {
      return res.status(404).json({ msg: "Konfigurasi sistem belum diatur." });
    }

    res.status(200).json(konfigurasi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan server." });
  }
};

const updateKonfigurasi = async (req, res) => {
  try {
    const { idKepalaBalai, idKepalaBagianUmum, formatNomorSurat, nomorTerakhir, resetBulanan } = req.body;

    if (!idKepalaBalai || !idKepalaBagianUmum || !formatNomorSurat || nomorTerakhir === undefined || resetBulanan === undefined) {
      return res.status(400).json({ msg: "Semua field wajib diisi." });
    }

    const konfigurasi = await KonfigurasiSistem.findOne();
    if (!konfigurasi) {
      return res.status(404).json({ msg: "Data konfigurasi belum ada." });
    }

    konfigurasi.idKepalaBalai = idKepalaBalai;
    konfigurasi.idKepalaBagianUmum = idKepalaBagianUmum;
    konfigurasi.formatNomorSurat = formatNomorSurat;
    konfigurasi.nomorTerakhir = nomorTerakhir;
    konfigurasi.resetBulanan = resetBulanan;
    await konfigurasi.save();

    res.status(200).json({ msg: "Konfigurasi sistem berhasil diperbarui." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal memperbarui konfigurasi sistem." });
  }
};

module.exports = {
  getKonfigurasi,
  updateKonfigurasi,
};