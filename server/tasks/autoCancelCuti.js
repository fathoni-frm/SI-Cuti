const cron = require('node-cron');
const { PengajuanCuti, VerifikasiCuti, PelimpahanTugas, Notifikasi } = require('../models');
const { Op } = require('sequelize');

// Cron job: jalan setiap hari jam 00:00
cron.schedule('0 0 * * *', async () => {
    await cancelPengajuanCuti();
});

const cancelPengajuanCuti = async () => {
    try {
        const batasTanggal = new Date();
        batasTanggal.setDate(batasTanggal.getDate() - 3); // 3 hari sebelum hari ini

        const pengajuanTerlambat = await PengajuanCuti.findAll({
            where: {
                status: 'Diproses',
                tanggalPengajuan: { [Op.lte]: batasTanggal }
            },
            include: [
                {
                    model: VerifikasiCuti,
                    where: { statusVerifikasi: { [Op.in]: ['Belum Diverifikasi', 'Diproses'] } }
                },
                {
                    model: PelimpahanTugas,
                    required: false
                }
            ]
        });

        for (const pengajuan of pengajuanTerlambat) {
            pengajuan.status = 'Dibatalkan';
            await pengajuan.save();
            
            if (pengajuan.PelimpahanTuga) {
                if (pengajuan.PelimpahanTuga.status === 'Belum Diverifikasi' || pengajuan.PelimpahanTuga.status === 'Diproses') {
                    await pengajuan.PelimpahanTuga.update({ status: 'Dibatalkan' }, { where: { status: { [Op.in]: ['Belum Diverifikasi', 'Diproses'] } } });
                } else if (pengajuan.PelimpahanTuga.status === 'Disetujui') {
                    await Notifikasi.create({
                        idPenerima: pengajuan.PelimpahanTuga.idPenerima,
                        idPengajuan: pengajuan.id,
                        judul: 'Pelimpahan Tugas Dibatalkan',
                        pesan:
                            'Pelimpahan tugas telah dibatalkan karena pengajuan cuti dari pegawai yang bersangkutan dibatalkan otomatis oleh sistem.',
                    });
                }
            }

            await VerifikasiCuti.update(
                { statusVerifikasi: 'Dibatalkan' },
                {
                    where: {
                        idPengajuan: pengajuan.id,
                        statusVerifikasi: {
                            [Op.in]: ['Belum Diverifikasi', 'Diproses'],
                        },
                    },
                }
            );

            await Notifikasi.create({
                idPenerima: pengajuan.idPegawai,
                idPengajuan: pengajuan.id,
                judul: "Cuti Dibatalkan Otomatis",
                pesan: "Permohonan cuti Anda dibatalkan otomatis oleh sistem karena tidak diverifikasi dalam waktu 3 hari.",
            });

            if (pengajuan.PelimpahanTuga && pengajuan.PelimpahanTuga.status === 'Disetujui') {
                await Notifikasi.create({
                    idPenerima: pengajuan.PelimpahanTuga.idPenerima,
                    idPengajuan: pengajuan.id,
                    judul: 'Pelimpahan Tugas Dibatalkan',
                    pesan: `Pelimpahan tugas dari ${pengajuan.pegawai?.nama} telah dibatalkan karena permohonan cuti dibatalkan oleh sistem.`,
                });
            }
            // console.log(`Pengajuan ID ${pengajuan.id} dibatalkan karena melewati batas waktu.`);
        }
        if (pengajuanTerlambat.length === 0) {
            console.log('Tidak ada pengajuan cuti yang harus dibatalkan.');
        } else {
            console.log('Ada pengajuan cuti yang harus dibatalkan.');
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
}

module.exports = {
    cancelPengajuanCuti
};