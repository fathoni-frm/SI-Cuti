const { VerifikasiCuti, PelimpahanTugas, PengajuanCuti, Pegawai, Notifikasi } = require('../models');

const getPermohonanPelimpahanById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await PelimpahanTugas.findByPk(id, {
            include: [
                {
                    model: PengajuanCuti,
                    include: [{ model: Pegawai, as: 'pegawai' }],
                },
                {
                    model: Pegawai,
                    as: 'penerima',
                },
            ],
        });
        if (!data) return res.status(404).json({ msg: "Data tidak ditemukan" });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

const getPermohonanPelimpahan = async (req, res) => {
    try {
        const { idPegawai } = req.user;

        const semuaPelimpahan = await PelimpahanTugas.findAll({
            where: { idPenerima: idPegawai },
            include: [
                {
                    model: PengajuanCuti,
                    include: [{ model: Pegawai, as: 'pegawai' }],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        const permohonan = [];
        const disetujui = [];
        const ditolak = [];

        semuaPelimpahan.forEach((v) => {
            if (v.status === 'Belum Diverifikasi' || v.status === 'Diproses') {
                permohonan.push(v);
            } else if (v.status === 'Disetujui') {
                disetujui.push(v);
            } else if (v.status === 'Ditolak') {
                ditolak.push(v);

            }
        });

        return res.status(200).json({ permohonan, disetujui, ditolak });
    } catch (error) {
        res.status(500).json({ msg: 'Gagal mengambil permohonan pelimpahan', error: error.message });
    }
}

const updateStatusToDiproses = async (req, res) => {
    try {
        const { id } = req.params;
        let pelimpahan = null;

        pelimpahan = await PelimpahanTugas.findByPk(id);

        if (!pelimpahan) {
            return res.status(404).json({ message: 'Data tidak ditemukan' });
        }

        pelimpahan.status = "Diproses";
        await pelimpahan.save();

        res.status(200).json({ message: 'Status pelimpahan diperbarui', data: pelimpahan });
    } catch (error) {
        console.error('Gagal update status verifikasi:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' })
    }
}

const verifikasiPelimpahan = async (req, res) => {
    const { id } = req.params;
    const { status, komentar } = req.body;
    const { idPegawai } = req.user;

    try {
        const pelimpahan = await PelimpahanTugas.findByPk(id, {
            include: [{ model: PengajuanCuti }],
        });

        if (!pelimpahan)
            return res.status(404).json({ msg: 'Pelimpahan tidak ditemukan' });

        if (pelimpahan.idPenerima !== idPegawai)
            return res.status(403).json({ msg: 'Anda bukan penerima pelimpahan ini' });

        // update
        pelimpahan.status = status;
        pelimpahan.komentar = komentar.trim();
        pelimpahan.tanggalVerifikasi = new Date();
        await pelimpahan.save();

        // NOTIFIKASI KE PENGAJU CUTI
        const pengaju = pelimpahan.PengajuanCuti ? pelimpahan.PengajuanCuti.idPegawai : null;
        if (pengaju) {
            const penerima = await Pegawai.findByPk(idPegawai);
            await Notifikasi.create({
                idPenerima: pengaju,
                idPengajuan: pelimpahan.idPengajuan,
                judul: 'Konfirmasi Pelimpahan Tugas',
                pesan: `${penerima.nama} telah ${status === 'Disetujui' ? 'MENYETUJUI' : 'MENOLAK'} pelimpahan tugas Anda.`,
            });
        }

        // NOTIFIKASI KE VERIFIKATOR
        if (status === 'Disetujui') {
            // aktifkan verifikator pertama
            const verifikasiPertama = await VerifikasiCuti.findOne({
                where: { idPengajuan: pelimpahan.idPengajuan, urutanVerifikasi: 1 },
            });
            if (verifikasiPertama) {
                // notifikasi ke verifikator pertama
                const penerima = await Pegawai.findByPk(pengaju);
                await Notifikasi.create({
                    idPenerima: verifikasiPertama.idPimpinan,
                    idPengajuan: pelimpahan.idPengajuan,
                    judul: 'Permohonan Cuti Baru',
                    pesan: `Anda perlu memverifikasi permohonan ${pelimpahan.PengajuanCuti.jenisCuti} dari ${penerima.nama}.`,
                });
            }
        } else if (status === 'Ditolak') {
            // jika ditolak, otomatis tolak pengajuan cuti dan kirim notifikasi
            await PengajuanCuti.update(
                { status: 'Ditolak' },
                { where: { id: pelimpahan.PengajuanCuti.id } }
            );
        }

        return res.json({ msg: 'Konfirmasi berhasil', data: pelimpahan });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Gagal memproses konfirmasi', error: err.message });
    }

}

module.exports = {
    getPermohonanPelimpahanById,
    getPermohonanPelimpahan,
    updateStatusToDiproses,
    verifikasiPelimpahan,
}