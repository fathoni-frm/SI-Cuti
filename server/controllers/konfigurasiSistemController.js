const { KonfigurasiSistem, Pegawai } = require("../models");

const getKonfigurasi = async (req, res) => {
  try {
    const konfigurasi = await KonfigurasiSistem.findOne({
      include: [
        {
          model: Pegawai,
          as: "kepalaBalai",
          attributes: ["id", "nama", "nip", "jabatanFungsional"],
        },
        {
          model: Pegawai,
          as: "kepalaBagianUmum",
          attributes: ["id", "nama", "nip", "jabatanFungsional"],
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
    const { idKepalaBalai, idKepalaBagianUmum } = req.body;

    if (!idKepalaBalai || !idKepalaBagianUmum) {
      return res.status(400).json({ msg: "Kedua field wajib diisi." });
    }

    const konfigurasi = await KonfigurasiSistem.findOne();
    if (!konfigurasi) {
      return res.status(404).json({ msg: "Data konfigurasi belum ada." });
    }

    konfigurasi.idKepalaBalai = idKepalaBalai;
    konfigurasi.idKepalaBagianUmum = idKepalaBagianUmum;
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