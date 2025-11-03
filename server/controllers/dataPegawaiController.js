const { Pegawai, User, KuotaCuti } = require("../models");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const getAllPegawai = async (req, res) => {
    try {
        const pegawai = await Pegawai.findAll({
            include: [
                {
                    model: User,
                    where: { role: { [Op.notIn]: ["Admin"] } },
                    attributes: [],
                    required: true
                }
            ],
            attributes: ["id", "nama", "nip", "unitKerja", "golongan", "jabatanStruktural", "jabatanFungsional"],
            order: [["nama", "ASC"]]
        });
        res.json(pegawai);
    } catch (error) {
        console.error("Gagal mengambil data pegawai:", error);
        res.status(500).json({ msg: "Gagal mengambil data pegawai", error });
    }
};

const getDaftarKetuaTim = async (req, res) => {
    try {
        const daftarKetuaTim = await Pegawai.findAll({
            where: {
                jabatanStruktural: "Ketua Tim"
            },
            include: [
                {
                    model: User,
                    where: { role: "atasan" },
                    attributes: [],
                    required: true
                }
            ],
            attributes: ["id", "nama", "nip", "jabatanStruktural", "jabatanFungsional"],
            order: [["nama", "ASC"]]
        });

        res.status(200).json(daftarKetuaTim);
    } catch (error) {
        console.error("Gagal mengambil data ketua tim:", error);
        res.status(500).json({
            msg: "Terjadi kesalahan saat mengambil data ketua tim",
            error: error.message
        });
    }
};

const getDaftarKepalaSapel = async (req, res) => {
    try {
        const daftarKepalaSapel = await Pegawai.findAll({
            where: {
                jabatanStruktural: "Kepala Satuan Pelayanan"
            },
            include: [
                {
                    model: User,
                    where: { role: "atasan" },
                    attributes: [],
                    required: true
                }
            ],
            attributes: ["id", "nama", "nip", "jabatanStruktural", "jabatanFungsional"],
            order: [["nama", "ASC"]]
        });

        res.status(200).json(daftarKepalaSapel);
    } catch (error) {
        console.error("Gagal mengambil data kepala sapel:", error);
        res.status(500).json({
            msg: "Terjadi kesalahan saat mengambil data kepala sapel",
            error: error.message
        });
    }
};

const getDaftarPegawai = async (req, res) => {
    try {
        const idPegawaiLogin = req.user.idPegawai;
        const daftarPegawai = await Pegawai.findAll({
            where: {
                jabatanStruktural: {
                    [Op.notIn]: ["Kepala Balai Besar", "Kepala Bagian Umum"]
                }
            },
            include: [
                {
                    model: User,
                    where: { role: { [Op.notIn]: ["Admin"] }, idPegawai: { [Op.ne]: idPegawaiLogin } },
                    attributes: []
                }
            ],
            attributes: ["id", "nama", "nip", "pangkat", "golongan", "jabatanStruktural", "jabatanFungsional", "satuanKerja"],
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
        const existingPegawai = await Pegawai.findOne({ where: { nip }, paranoid: false });
        if (existingPegawai && existingPegawai.deletedAt === null) {
            return res.status(400).json({
                msg: "NIP sudah terdaftar",
                errors: {
                    nip: "NIP ini sudah terdaftar"
                },
            });
        } else if (existingPegawai && existingPegawai.deletedAt !== null) {
            return res.status(400).json({
                msg: "NIP sudah terdaftar",
                errors: {
                    nip: "NIP sudah terdaftar pada data yang telah dihapus"
                },
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
                await User.create({
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

        res.status(200).json({ message: "Data pegawai dan akun berhasil diperbarui" });
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
            errors.nip = ["NIP sudah terdaftar"];
        }

        // Cek duplikasi username
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            errors.username = ["Username sudah digunakan"];
        }

        // Kirim semua error sekaligus
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        res.status(200).json({ valid: true });
    } catch (error) {
        res.status(500).json({
            msg: "Gagal validasi data",
            error: error.message,
        });
    }
};

const importPegawai = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "File tidak ditemukan" });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);

        let berhasil = 0;
        let gagal = 0;
        let alasanGagal = [];

        for (const [i, row] of rows.entries()) {
            if (!row.nama || !row.nip) {
                gagal++;
                alasanGagal.push(`Baris ${i + 2}: Kolom 'nama' atau 'nip' kosong`);
                continue;
            }

            try {
                const pegawai = await Pegawai.create({
                    nama: row.nama,
                    nip: row.nip,
                    ttl: row.ttl || null,
                    karpeg: row.karpeg || null,
                    karisKarsu: row.karisKarsu || null,
                    npwp: row.npwp || null,
                    jenisKelamin: row.jenisKelamin || null,
                    agama: row.agama || null,
                    statusKeluarga: row.statusKeluarga || null,
                    pendidikanTerakhir: row.pendidikanTerakhir || null,
                    namaSekolah: row.namaSekolah || null,
                    namaUniversitas: row.namaUniversitas || null,
                    namaFakultas: row.namaFakultas || null,
                    namaJurusan: row.namaJurusan || null,
                    namaProgramStudi: row.namaProgramStudi || null,
                    unitKerja: row.unitKerja || null,
                    satuanKerja: row.satuanKerja || null,
                    pangkat: row.pangkat || null,
                    golongan: row.golongan || null,
                    jabatanStruktural: row.jabatanStruktural || null,
                    jabatanFungsional: row.jabatanFungsional || null,
                    alamatKantor: row.alamatKantor || null,
                    noHp: row.noHp || null,
                    emailKantor: row.emailKantor || null,
                    emailPribadi: row.emailPribadi || null,
                });

                const hashedPassword = await bcrypt.hash(String(row.password || row.nip), 10);
                await User.create({
                    idPegawai: pegawai.id,
                    username: row.username,
                    password: hashedPassword,
                    role: row.role || "Pegawai",
                });

                const jenisCutiList = [
                    { jenisCuti: 'Cuti Tahunan N-2', totalKuota: 0 },
                    { jenisCuti: 'Cuti Tahunan N-1', totalKuota: 0 },
                    { jenisCuti: 'Cuti Tahunan', totalKuota: 12 },
                    { jenisCuti: 'Cuti Besar', totalKuota: 90 },
                    { jenisCuti: 'Cuti Sakit', totalKuota: 30 },
                    { jenisCuti: 'Cuti Alasan Penting', totalKuota: 30 },
                    { jenisCuti: 'Cuti Di Luar Tanggungan Negara', totalKuota: 260 },
                    { jenisCuti: 'Cuti Melahirkan', totalKuota: 90 }
                ];
                const kuotaData = jenisCutiList.map((item) => ({
                    idPegawai: pegawai.id,
                    jenisCuti: item.jenisCuti,
                    totalKuota: item.totalKuota,
                    sisaKuota: item.totalKuota
                }));
                await KuotaCuti.bulkCreate(kuotaData);

                berhasil++;
            } catch (err) {
                gagal++;
                alasanGagal.push(`Baris ${i + 2}: ${err.message}`);
            }
        }

        fs.unlinkSync(req.file.path);

        return res.status(200).json({
            msg: "Import selesai",
            berhasil,
            gagal,
            detail: alasanGagal,
        });
    } catch (error) {
        console.error("Gagal import:", error);
        return res.status(500).json({ msg: "Gagal memproses file", error: error.message });
    }
};

const cetakProfilPegawai = async (req, res) => {
	try {
		const pegawai = await Pegawai.findByPk(req.params.id);
		if (!pegawai) {
			return res.status(404).json({ msg: "Pegawai tidak ditemukan" });
		}

		const sekolahList = ["SD / Sederajat", "SMP / Sederajat", "SMA / Sederajat"];
		const perguruanTinggiList = ["D1 / D2", "D3", "S1", "S2", "S3"];

		const pegawaiData = {
			...pegawai.dataValues,
			tanggalCetak: new Date().toLocaleString("id-ID"),
		};

		if (sekolahList.includes(pegawai.pendidikanTerakhir)) {
			pegawaiData.namaSekolah = pegawai.namaSekolah;
		} else if (perguruanTinggiList.includes(pegawai.pendidikanTerakhir)) {
			pegawaiData.namaUniversitas = pegawai.namaUniversitas;
			pegawaiData.namaFakultas = pegawai.namaFakultas;
			pegawaiData.namaJurusan = pegawai.namaJurusan;
			pegawaiData.namaProgramStudi = pegawai.namaProgramStudi;
		}

		// template HBS
		const templatePath = path.join(__dirname, "../uploads/template/profil_pegawai.hbs");
		const templateHtml = fs.readFileSync(templatePath, "utf-8");

		const compile = Handlebars.compile(templateHtml);
		const html = compile(pegawaiData);

		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: "networkidle0" });

		const pdfBuffer = await page.pdf({
			format: "A4",
			printBackground: true,
		});

		await browser.close();

		res.set({
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename=profil-${pegawai.nip}.pdf`,
			"Content-Length": pdfBuffer.length,
		});

		res.send(pdfBuffer);
	} catch (error) {
		console.error("Gagal mencetak PDF:", error);
		res.status(500).json({ msg: "Terjadi kesalahan pada server." });
	}
};

module.exports = {
    getAllPegawai,
    getPegawaiById,
    getDaftarKetuaTim,
    getDaftarKepalaSapel,
    getDaftarPegawai,
    createPegawai,
    updatePegawai,
    deletePegawai,
    validatePegawai,
    importPegawai,
    cetakProfilPegawai,
}