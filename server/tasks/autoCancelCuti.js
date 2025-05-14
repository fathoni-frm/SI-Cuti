const cron = require('node-cron');
const { PengajuanCuti, VerifikasiCuti } = require('../models');
const { Op } = require('sequelize');

// Cron job: jalan setiap hari jam 00:00
cron.schedule('0 0 * * *', async () => {
    const batasTanggal = new Date();
    batasTanggal.setDate(batasTanggal.getDate() - 3); // 3 hari sebelum hari ini

    const pengajuanTerlambat = await PengajuanCuti.findAll({
        where: {
            status: 'Diproses',
            tanggalPengajuan: { [Op.lte]: batasTanggal }
        },
        include: [{
            model: VerifikasiCuti,
            where: { statusVerifikasi: { [Op.in]: ['Belum Diverifikasi', 'Diproses'] } }
        }]
    });

    for (const pengajuan of pengajuanTerlambat) {
        pengajuan.status = 'Dibatalkan';
        await pengajuan.save();

        await VerifikasiCuti.update(
            { statusVerifikasi: 'Dibatalkan' },
            {
                where: {
                    idPengajuan: pengajuan.id,
                    statusVerifikasi: { [Op.in]: ['Belum Diverifikasi', 'Diproses'] }
                }
            }
        );

        console.log(`Pengajuan ID ${pengajuan.id} dibatalkan karena melewati batas waktu.`);
    }
});
