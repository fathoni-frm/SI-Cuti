const { Pegawai, KuotaCuti, Notifikasi } = require("../models");

const getKuotaCutiByUser = async (req, res) => {
    try {
        const { id } = req.params;
        const kuota = await KuotaCuti.findAll({
            where: { idPegawai: id },
            include: {
                model: Pegawai,
                attributes: ['nama', 'nip']
            }
        });

        res.status(200).json(kuota);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const createKuotaCuti = async (req, res) => {
    try {
        const { idPegawai } = req.body;

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
            idPegawai,
            jenisCuti: item.jenisCuti,
            totalKuota: item.totalKuota,
            sisaKuota: item.totalKuota
        }));

        const newKuotas = await KuotaCuti.bulkCreate(kuotaData);

        res.status(201).json({ msg: 'Kuota cuti berhasil ditambahkan', data: newKuotas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
};

const updateKuotaCuti = async (req, res) => {
    try {
        const kuotaArray = req.body;

        if (!Array.isArray(kuotaArray)) {
            return res.status(400).json({ msg: "Data harus berupa array" });
        }

        const updatedData = [];

        for (const item of kuotaArray) {
            const { id, idPegawai, totalKuota, sisaKuota } = item;

            const kuota = await KuotaCuti.findByPk(id);
            if (!kuota) continue;

            await kuota.update({
                totalKuota,
                sisaKuota,
            });

            updatedData.push(kuota);
        }

        await Notifikasi.create({
            idPenerima: kuotaArray[0].idPegawai,
            idPengajuan: null,
            judul: "Pembaruan Kuota Cuti",
            pesan: "Kuota cuti Anda telah diperbarui oleh Admin. Harap cek kuota cuti Anda.",
        });

        return res.status(200).json({
            msg: "Semua kuota cuti berhasil diperbarui",
            data: updatedData,
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const tambahKuotaCutiTahunan = async (req, res) => {
    try {
		const { idPegawai, jumlah } = req.body;

		if (!idPegawai || !jumlah) {
			return res.status(400).json({ message: "Pegawai dan jumlah wajib diisi" });
		}

		const kuota = await KuotaCuti.findOne({
			where: {
				idPegawai,
				jenisCuti: "Cuti Tahunan",
			},
		});

		if (!kuota) {
			return res.status(404).json({
				message: "Data kuota cuti tahunan tidak ditemukan untuk pegawai ini.",
			});
		}

		kuota.totalKuota += parseInt(jumlah);
		kuota.sisaKuota += parseInt(jumlah);
		await kuota.save();

        await Notifikasi.create({
            idPenerima: idPegawai,
            idPengajuan: null,
            judul: "Penambahan Kuota Cuti",
            pesan: `Kuota cuti tahunan Anda telah ditambahkan Admin sebanyak ${jumlah} hari.`,
        });

		return res.status(200).json({
			message: "Kuota cuti tahunan berhasil ditambahkan.",
			data: kuota,
		});
	} catch (error) {
		console.error("Error saat menambahkan kuota cuti tahunan:", error);
		return res.status(500).json({ message: "Terjadi kesalahan pada server." });
	}
};

module.exports = {
    getKuotaCutiByUser,
    createKuotaCuti,
    updateKuotaCuti,
    tambahKuotaCutiTahunan,
}