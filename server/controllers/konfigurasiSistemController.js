const { KonfigurasiSistem, Pegawai } = require("../models");
const path = require("path");

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
    const {
      idKepalaBalai,
      idKepalaBagianUmum,
      formatNomorSurat,
      nomorTerakhir,
      resetBulanan,
    } = req.body;

    if (
      !idKepalaBalai ||
      !idKepalaBagianUmum ||
      !formatNomorSurat ||
      nomorTerakhir === undefined ||
      resetBulanan === undefined
    ) {
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

const getTemplateImport = async (req, res) => {
  const filePath = path.join(
    __dirname,
    "..",
    "uploads",
    "template",
    "template-import.xlsx"
  );

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending template:", err);
      res.status(500).json({ msg: "Gagal mengunduh template" });
    }
  });
};

const cetakSuratCuti = (req, res) => {
  const file = req.params.filename;

  const filePath = path.join(__dirname, "..", "uploads", "surat-cuti", file);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Gagal mengirim file surat cuti:", err);
      res.status(404).json({ msg: "File surat cuti tidak ditemukan" });
    }
  });
};

module.exports = {
  getKonfigurasi,
  updateKonfigurasi,
  getTemplateImport,
  cetakSuratCuti,
};
