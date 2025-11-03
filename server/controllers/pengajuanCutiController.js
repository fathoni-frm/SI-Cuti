const { PengajuanCuti, VerifikasiCuti, Pegawai, PelimpahanTugas, Notifikasi } = require("../models");
const { Op } = require("sequelize");

const getPengajuanCutiById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await PengajuanCuti.findByPk(id, {
            include: [
                {
                    model: VerifikasiCuti,
                    include: [
                        {
                            model: Pegawai,
                            as: 'verifikator',
                        },
                    ],
                },
                {
                    model: Pegawai,
                    as: 'pegawai'
                },
                {
                    model: PelimpahanTugas,
                    include: [
                        {
                            model: Pegawai,
                            as: 'penerima'
                        }
                    ]
                }
            ],
        });
        if (!data) return res.status(404).json({ msg: "Data tidak ditemukan" });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getRiwayatCutiByPegawai = async (req, res) => {
    try {
        const { idPegawai } = req.params;
        const pengajuan = await PengajuanCuti.findAll({
            where: {
                status: {
                    [Op.ne]: 'Draft',
                },
                idPegawai: idPegawai,
            },
            order: [['tanggalPengajuan', 'DESC']],
        });

        res.status(200).json(pengajuan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal mengambil riwayat cuti", error: error.message });
    }
};

const getDraftCutiByPegawai = async (req, res) => {
    try {
        const { idPegawai } = req.params;
        const pengajuan = await PengajuanCuti.findAll({
            where: { status: 'Draft', idPegawai: idPegawai },
            order: [['updatedAt', 'DESC']],
        });

        res.status(200).json(pengajuan);
    } catch (error) {
        res.status(500).json({ msg: "Gagal mengambil draft pengajuan", error: error.message });
    }
};

const getDraftById = async (req, res) => {
    try {
        const { id } = req.params;

        const draft = await PengajuanCuti.findOne({
            where: {
                id,
                status: 'Draft'
            },
            include: [VerifikasiCuti, PelimpahanTugas]
        });

        if (!draft) {
            return res.status(404).json({ msg: "Draft tidak ditemukan" });
        }

        res.status(200).json(draft);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal mengambil draft", error: error.message });
    }
};

const createPengajuanCuti = async (req, res) => {
    try {
        const {
            idPegawai,
            jenisCuti,
            tanggalPengajuan,
            totalKuota,
            sisaKuota,
            tanggalMulai,
            tanggalSelesai,
            durasi,
            isDraft
        } = req.body;

        let alasanCuti = req.body.alasanCuti;
        if (alasanCuti === "null" || alasanCuti === "") {
            alasanCuti = null;
        }
        let alamatCuti = req.body.alamatCuti;
        if (alamatCuti === "null" || alamatCuti === "") {
            alamatCuti = null;
        }
        let idPenerimaTugas = req.body.idPenerimaTugas;
        if (idPenerimaTugas === "null" || idPenerimaTugas === "") {
            idPenerimaTugas = null;
        }
        const lampiran = req.file ? req.file.filename : null;
        const statusPengajuan = isDraft === 'true' ? 'Draft' : 'Diproses';
        const statusVerifikasi = isDraft === 'true' ? 'Draft' : 'Belum Diverifikasi';

        const pengajuan = await PengajuanCuti.create({
            idPegawai,
            jenisCuti,
            tanggalPengajuan,
            totalKuota,
            sisaKuota,
            tanggalMulai,
            tanggalSelesai,
            durasi,
            alasanCuti,
            alamatCuti,
            lampiran: lampiran,
            status: statusPengajuan
        });

        const pengajuanId = pengajuan.id;

        // Membuat data pelimpahan tugas
        if (idPenerimaTugas) {
            await PelimpahanTugas.create({
                idPengajuan: pengajuanId,
                idPenerima: idPenerimaTugas,
                status: isDraft === 'true' ? 'Draft' : 'Belum Diverifikasi'
            });

            // kirim notifikasi ke penerima tugas
            if (isDraft !== 'true') {
                const pegawai = await Pegawai.findByPk(idPegawai);
                await Notifikasi.create({
                    idPenerima: idPenerimaTugas,
                    idPengajuan: pengajuanId,
                    judul: 'Pelimpahan Tugas Baru',
                    pesan: `Terdapat permohonan pelimpahan tugas dari ${pegawai.nama}.`
                });
            }
        }

        // Ambil daftar atasan dari frontend (opsional)
        const daftarAtasan = JSON.parse(req.body.daftarAtasan || "[]");

        // Tambahkan dari frontend dulu (jika ada)
        for (let i = 0; i < daftarAtasan.length; i++) {
            const verifikator = daftarAtasan[i];
            await VerifikasiCuti.create({
                idPengajuan: pengajuanId,
                idPimpinan: verifikator.id,
                urutanVerifikasi: i + 1,
                statusVerifikasi: statusVerifikasi,
                jenisVerifikator: verifikator.jenis,
            });
        }

        // Cari Kepala Bagian Umum
        const kabag = await Pegawai.findOne({
            where: { jabatanStruktural: "Kepala Bagian Umum" },
        });
        if (kabag) {
            await VerifikasiCuti.create({
                idPengajuan: pengajuanId,
                idPimpinan: kabag.id,
                urutanVerifikasi: daftarAtasan.length + 1,
                statusVerifikasi,
                jenisVerifikator: "Kepala Bagian Umum",
            });
        }

        // Cari Kepala Balai Besar
        const kabalai = await Pegawai.findOne({
            where: { jabatanStruktural: "Kepala Balai Besar" },
        });
        if (kabalai) {
            await VerifikasiCuti.create({
                idPengajuan: pengajuanId,
                idPimpinan: kabalai.id,
                urutanVerifikasi: daftarAtasan.length + 2,
                statusVerifikasi,
                jenisVerifikator: "Kepala Balai Besar",
            });
        }

        // Kirim notifikasi ke verifikator pertama (apabila tidak ada pelimpahan tugas dan bukan draft)
        if (!idPenerimaTugas && isDraft !== 'true') {
            const verifikatorPertama = await VerifikasiCuti.findOne({
                where: { idPengajuan: pengajuanId, urutanVerifikasi: 1 },
            });
            if (verifikatorPertama) {
                const pegawai = await Pegawai.findByPk(pengajuan.idPegawai);
                await Notifikasi.create({
                    idPenerima: verifikatorPertama.idPimpinan,
                    idPengajuan: pengajuanId,
                    judul: "Permohonan Cuti Baru",
                    pesan: `Anda perlu memverifikasi permohonan ${pengajuan.jenisCuti} dari ${pegawai.nama}.`,
                });
            }
        }

        res.status(201).json({ msg: "Pengajuan cuti berhasil dibuat", data: pengajuan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal membuat pengajuan cuti", error: error.message });
    }
};

const updatePengajuanCuti = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            tanggalMulai,
            tanggalSelesai,
            durasi,
            isDraft
        } = req.body;

        let alasanCuti = req.body.alasanCuti;
        if (alasanCuti === "null" || alasanCuti === "") {
            alasanCuti = null;
        }
        let alamatCuti = req.body.alamatCuti;
        if (alamatCuti === "null" || alamatCuti === "") {
            alamatCuti = null;
        }
        let idPenerimaTugas = req.body.idPenerimaTugas;
        if (idPenerimaTugas === "null" || idPenerimaTugas === "") {
            idPenerimaTugas = null;
        }
        const statusPengajuan = isDraft === 'true' ? 'Draft' : 'Diproses';
        const statusVerifikasi = isDraft === 'true' ? 'Draft' : 'Belum Diverifikasi';
        const tanggalPengajuan = isDraft === 'true' ? null : req.body.tanggalPengajuan;
        const totalKuota = isDraft === 'true' ? null : req.body.totalKuota;
        const sisaKuota = isDraft === 'true' ? null : req.body.sisaKuota;
        const lampiran = req.file ? req.file.filename : req.body.lampiran || null;

        // Update data pengajuan
        const pengajuan = await PengajuanCuti.findByPk(id);
        if (!pengajuan) return res.status(404).json({ msg: "Pengajuan cuti tidak ditemukan" });
        if (pengajuan.status !== "Draft") {
            return res.status(400).json({ msg: "Pengajuan cuti tidak dapat diubah karena sudah diajukan" });
        }
        await pengajuan.update({
            tanggalPengajuan,
            totalKuota,
            sisaKuota,
            tanggalMulai,
            tanggalSelesai,
            durasi,
            alasanCuti,
            alamatCuti,
            lampiran: lampiran,
            status: statusPengajuan,
        });

        // Memperbarui data pelimpahan tugas
        const existingPelimpahan = await PelimpahanTugas.findOne({ where: { idPengajuan: id } });

        if (idPenerimaTugas) {
          // masih/bakal ada pelimpahan tugas
          if (existingPelimpahan) {
            await existingPelimpahan.update({
              idPenerima: idPenerimaTugas,
              status: isDraft === 'true' ? 'Draft' : 'Belum Diverifikasi'
            });
          } else {
            await PelimpahanTugas.create({
              idPengajuan : id,
              idPenerima: idPenerimaTugas,
              status: isDraft === 'true' ? 'Draft' : 'Belum Diverifikasi'
            });
          }
          // kirim notifikasi ke penerima tugas
          if (isDraft !== 'true') {
            const pegawai = await Pegawai.findByPk(pengajuan.idPegawai);
            await Notifikasi.create({
                idPenerima: idPenerimaTugas,
                idPengajuan: id,
                judul: 'Pelimpahan Tugas Baru',
                pesan: `Terdapat permohonan pelimpahan tugas dari ${pegawai.nama}.`
            });
        }
        } else if (existingPelimpahan) {
          // user menghapus penerima tugas
          await existingPelimpahan.destroy();
        }
        
        // hapus dulu daftar verifikasi di database
        await VerifikasiCuti.destroy({ where: { idPengajuan: id } });

        // Ambil daftar atasan dari frontend (opsional)
        const daftarAtasan = JSON.parse(req.body.daftarAtasan || "[]");

        // Tambahkan dari frontend dulu (jika ada)
        for (let i = 0; i < daftarAtasan.length; i++) {
            const verifikator = daftarAtasan[i];
            await VerifikasiCuti.create({
                idPengajuan: id,
                idPimpinan: verifikator.id,
                urutanVerifikasi: i + 1,
                statusVerifikasi: statusVerifikasi,
                jenisVerifikator: verifikator.jenis,
            });
        }

        // Cari Kepala Bagian Umum
        const kabag = await Pegawai.findOne({
            where: { jabatanStruktural: "Kepala Bagian Umum" },
        });
        if (kabag) {
            await VerifikasiCuti.create({
                idPengajuan: id,
                idPimpinan: kabag.id,
                urutanVerifikasi: daftarAtasan.length + 1,
                statusVerifikasi,
                jenisVerifikator: "Kepala Bagian Umum",
            });
        }

        // Cari Kepala Balai Besar
        const kabalai = await Pegawai.findOne({
            where: { jabatanStruktural: "Kepala Balai Besar" },
        });
        if (kabalai) {
            await VerifikasiCuti.create({
                idPengajuan: id,
                idPimpinan: kabalai.id,
                urutanVerifikasi: daftarAtasan.length + 2,
                statusVerifikasi,
                jenisVerifikator: "Kepala Balai Besar",
            });
        }

        if (!idPenerimaTugas && isDraft !== 'true') {
            const verifikatorPertama = await VerifikasiCuti.findOne({
                where: { idPengajuan: pengajuan.id, urutanVerifikasi: 1 },
            });
            const pegawai = await Pegawai.findByPk(pengajuan.idPegawai);
            if (verifikatorPertama) {
                await Notifikasi.create({
                    idPenerima: verifikatorPertama.idPimpinan,
                    idPengajuan: pengajuan.id,
                    judul: "Permohonan Cuti Baru",
                    pesan: `Anda perlu memverifikasi permohonan ${pengajuan.jenisCuti} dari ${pegawai.nama}.`,
                });
            }
        }

        res.status(200).json({ msg: "Pengajuan cuti berhasil diperbarui / diajukan", data: pengajuan });
    } catch (error) {
        console.error('Gagal update pengajuan:', err);
        res.status(500).json({ msg: 'Pengajuan cuti gagal diperbarui / diajukan', error: err.message });
    }
};

const deletePengajuanCuti = async (req, res) => {
    try {
        const { id } = req.params;

        const pengajuan = await PengajuanCuti.findByPk(id);
        if (!pengajuan) return res.status(404).json({ msg: "Pengajuan cuti tidak ditemukan" });

        // Tidak bisa dihapus jika status bukan Draft
        if (pengajuan.status !== "Draft") {
            return res.status(400).json({ msg: "Pengajuan cuti tidak dapat dihapus karena sudah diverifikasi" });
        }

        // Hapus pengajuan cuti
        await pengajuan.destroy();

        res.status(200).json({ msg: "Pengajuan cuti berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getPengajuanCutiById,
    getRiwayatCutiByPegawai,
    getDraftCutiByPegawai,
    getDraftById,
    createPengajuanCuti,
    updatePengajuanCuti,
    deletePengajuanCuti
}