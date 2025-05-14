const { Pegawai, User, KuotaCuti } = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const getAllPegawai = async (req, res) => {
    try {
        const pegawai = await Pegawai.findAll();
        res.json(pegawai);
    } catch (error) {
        console.error("Gagal mengambil data pegawai:", error);
        res.status(500).json({ msg: "Gagal mengambil data pegawai", error });
    }
};

//untuk form pengalihan tugas
const getDaftarPegawai = async (req, res) => {
    try {
        const daftarPegawai = await Pegawai.findAll({
            where: {
                jabatanStruktural: {
                    [Op.notIn]: ["Kepala Balai Besar", "Kepala Sub Bagian Umum"]
                }
            },
            include: [
                {
                    model: User,
                    where: { role: ['atasan', 'pegawai'] },
                    attributes: []
                }
            ],
            attributes: ["id", "nama", "nip", "pangkat", "golongan", "jabatanFungsional", "satuanKerja"],
            order: [["nama", "ASC"]]
        });

        res.status(200).json(daftarPegawai);
    } catch (error) {
        console.error("Gagal mengambil data pegawai:", error);
        res.status(500).json({
            msg: "Terjadi kesalahan saat mengambil data pegawai",
            error: error.message
        });
    }
};

const getDaftarAtasan = async (req, res) => {
    try {
        const daftarAtasan = await Pegawai.findAll({
            where: {
                jabatanStruktural: {
                    [Op.notIn]: ["Kepala Balai Besar", "Kepala Sub Bagian Umum"]
                }
            },
            include: [
                {
                    model: User,
                    where: { role: "atasan" },
                    attributes: [],
                    required: true
                }
            ],
            attributes: ["id", "nama", "nip", "jabatanFungsional"],
            order: [["nama", "ASC"]]
        });

        res.status(200).json(daftarAtasan);
    } catch (error) {
        console.error("Gagal mengambil data atasan:", error);
        res.status(500).json({
            msg: "Terjadi kesalahan saat mengambil data atasan",
            error: error.message
        });
    }
};

const getPegawaiById = async (req, res) => {
    try {
        const { id } = req.params;
        const pegawai = await Pegawai.findByPk(id, {
            include: [{
                model: User,
            }]
        });

        if (!pegawai) {
            return res.status(404).json({ msg: "Pegawai tidak ditemukan" });
        }

        res.json({
            ...pegawai.get({ plain: true }),
            user: pegawai.user // Data user akan tergabung
        });
    } catch (error) {
        console.error("Gagal mengambil data pegawai:", error);
        res.status(500).json({ msg: "Gagal mengambil data pegawai", error });
    }
};

const createPegawai = async (req, res) => {
    try {
        const { nama, nip, ttl, karpeg, karisKarsu, npwp, jenisKelamin, agama, statusKeluarga, pendidikanTerakhir, namaSekolah, namaUniversitas, namaFakultas, namaJurusan, namaProgramStudi, unitKerja, satuanKerja, pangkat, golongan, jabatanStruktural, jabatanFungsional, alamatKantor, noHp, emailKantor, emailPribadi } = req.body;
        const existingPegawai = await Pegawai.findOne({ where: { nip } });
        if (existingPegawai) {
            return res.status(400).json({
                msg: "NIP sudah terdaftar",
                errors: {
                    nip: "NIP ini sudah terdaftar"
                }
            });
        }
        const newPegawai = await Pegawai.create({ nama, nip, ttl, karpeg, karisKarsu, npwp, jenisKelamin, agama, statusKeluarga, pendidikanTerakhir, namaSekolah, namaUniversitas, namaFakultas, namaJurusan, namaProgramStudi, unitKerja, satuanKerja, pangkat, golongan, jabatanStruktural, jabatanFungsional, alamatKantor, noHp, emailKantor, emailPribadi });
        res.status(201).json(newPegawai);
    } catch (error) {
        console.error("Gagal menambahkan pegawai:", error);
        res.status(500).json({ msg: "Gagal menambahkan pegawai", error });
    }
};

const updatePegawai = async (req, res) => {
    const { id } = req.params;
    const { nama, nip, ttl, karpeg, karisKarsu, npwp, jenisKelamin, agama, statusKeluarga, pendidikanTerakhir, namaSekolah, namaUniversitas, namaFakultas, namaJurusan, namaProgramStudi, unitKerja, satuanKerja, pangkat, golongan, jabatanStruktural, jabatanFungsional, alamatKantor, noHp, emailKantor, emailPribadi } = req.body;
    const { user } = req.body;
    try {
        const pegawai = await Pegawai.findByPk(id);
        if (!pegawai) return res.status(404).json({ message: "Pegawai tidak ditemukan" });

        await pegawai.update({ nama, nip, ttl, karpeg, karisKarsu, npwp, jenisKelamin, agama, statusKeluarga, pendidikanTerakhir, namaSekolah, namaUniversitas, namaFakultas, namaJurusan, namaProgramStudi, unitKerja, satuanKerja, pangkat, golongan, jabatanStruktural, jabatanFungsional, alamatKantor, noHp, emailKantor, emailPribadi });

        if (user) {
            const akunPegawai = await User.findOne({ where: { idPegawai: id } });

            if (!akunPegawai) {
                // Jika akun belum ada, buat baru
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await Akun.create({
                    username: user.username,
                    password: hashedPassword,
                    role: user.role,
                    idPegawai: id
                });
            } else {
                // Update akun existing
                const updateData = {
                    username: user.username,
                    role: user.role,
                };

                // Hanya update password jika ada isian baru
                if (user.password && user.password.length >= 8) {
                    updateData.password = await bcrypt.hash(user.password, 10);
                }

                await akunPegawai.update(updateData);
            }
        }

        res.json({ message: "Data pegawai dan akun berhasil diperbarui" });
    } catch (err) {
        console.error("Gagal update pegawai:", err);
        res.status(500).json({ message: "Terjadi kesalahan saat update" });
    }

};

const deletePegawai = async (req, res) => {
    try {
        const { id } = req.params;
        const pegawai = await Pegawai.findByPk(id);
        if (!pegawai) return res.status(404).json({ msg: "Pegawai tidak ditemukan" });
        await User.destroy({ where: { idPegawai: id } });
        await KuotaCuti.destroy({ where: { idPegawai: id } }); 
        await pegawai.destroy();
        res.status(200).json({ msg: "Pegawai berhasil dihapus" });
    } catch (error) {
        console.error("Gagal menghapus pegawai:", error);
        res.status(500).json({ msg: "Gagal menghapus pegawai", error });
    }
};

const validatePegawai = async (req, res) => {
    try {
        const { nip, username } = req.body;
        const errors = {};

        // Cek duplikasi NIP
        const existingNip = await Pegawai.findOne({ where: { nip } });
        if (existingNip) {
            errors.nip = "NIP sudah terdaftar";
        }

        // Cek duplikasi username
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            errors.username = "Username sudah digunakan";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        res.json({ valid: true });
    } catch (error) {
        res.status(500).json({
            msg: "Gagal validasi data",
            error: error.message
        });
    }
};


module.exports = {
    getAllPegawai,
    getPegawaiById,
    getDaftarAtasan,
    getDaftarPegawai,
    createPegawai,
    updatePegawai,
    deletePegawai,
    validatePegawai
}