const { PengajuanCuti, VerifikasiCuti, Pegawai } = require("../models");
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
                    as: 'Pegawai' 
                },
                {
                    model: Pegawai,
                    as: 'PenerimaTugas', 
                    foreignKey: 'idPenerimaTugas' 
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
            include: [/* relasi jika perlu */],
            order: [['updatedAt', 'DESC']],
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
            include: [VerifikasiCuti]
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
            idPenerimaTugas,
            status: statusPengajuan
        });

        const pengajuanId = pengajuan.id;

        // 2. Ambil daftar atasan dari frontend (opsional)
        const daftarAtasan = JSON.parse(req.body.daftarAtasan || "[]");

        // 3. Tambahkan dari frontend dulu (jika ada)
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

        // 4. Cari Kepala Sub Bagian Umum
        const kasubag = await Pegawai.findOne({
            where: { jabatanStruktural: "Kepala Sub Bagian Umum" },
        });
        if (kasubag) {
            await VerifikasiCuti.create({
                idPengajuan: pengajuanId,
                idPimpinan: kasubag.id,
                urutanVerifikasi: daftarAtasan.length + 1,
                statusVerifikasi,
                jenisVerifikator: "Kepala Sub Bagian Umum",
            });
        }

        // 5. Cari Kepala Balai Besar
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
            idPenerimaTugas: rawIdPenerimaTugas,
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
        let idPenerimaTugas = rawIdPenerimaTugas;
        if (idPenerimaTugas === "null" || idPenerimaTugas === "") {
            idPenerimaTugas = null;
        }
        const statusPengajuan = isDraft === 'true' ? 'Draft' : 'Diproses';
        const statusVerifikasi = isDraft === 'true' ? 'Draft' : 'Belum Diverifikasi';
        const tanggalPengajuan = isDraft === 'true' ? null : req.body.tanggalPengajuan;
        const totalKuota = isDraft === 'true' ? null : req.body.totalKuota;
        const sisaKuota = isDraft === 'true' ? null : req.body.sisaKuota;
        const lampiran = req.file ? req.file.filename : req.body.lampiran || null;

        const pengajuan = await PengajuanCuti.findByPk(id);
        if (!pengajuan) return res.status(404).json({ msg: "Pengajuan cuti tidak ditemukan" });
        if (pengajuan.status !== "Draft") {
            return res.status(400).json({ msg: "Pengajuan cuti tidak dapat diubah karena sudah diajukan" });
        }
        // Update data pengajuan
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
            idPenerimaTugas,
            status: statusPengajuan,
        });

        await VerifikasiCuti.destroy({ where: { idPengajuan: id } });

        // 2. Ambil daftar atasan dari frontend (opsional)
        const daftarAtasan = JSON.parse(req.body.daftarAtasan || "[]");

        // 3. Tambahkan dari frontend dulu (jika ada)
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


        // 4. Cari Kepala Sub Bagian Umum
        const kasubag = await Pegawai.findOne({
            where: { jabatanStruktural: "Kepala Sub Bagian Umum" },
        });
        if (kasubag) {
            await VerifikasiCuti.create({
                idPengajuan: id,
                idPimpinan: kasubag.id,
                urutanVerifikasi: daftarAtasan.length + 1,
                statusVerifikasi,
                jenisVerifikator: "Kepala Sub Bagian Umum",
            });
        }

        // 5. Cari Kepala Balai Besar
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

        res.status(200).json({ msg: "Pengajuan cuti berhasil diperbarui / diajukan", data: pengajuan });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const deletePengajuanCuti = async (req, res) => {
    try {
        const { id } = req.params;

        const pengajuan = await PengajuanCuti.findByPk(id);
        if (!pengajuan) return res.status(404).json({ msg: "Pengajuan cuti tidak ditemukan" });

        // Tidak bisa dihapus jika status bukan Menunggu
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