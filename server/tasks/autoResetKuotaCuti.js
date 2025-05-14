const cron = require('node-cron');
const { Pegawai, KuotaCuti } = require('../models');

// Cron job: jalan setiap jam 00:00 tanggal 1 januari ('0 0 1 1 *')
cron.schedule('0 0 1 1 *', async () => {
  console.log("!!!Menjalankan reset kuota cuti tahunan!!!");
  await resetKuotaCutiTahunan();
});

const resetKuotaCutiTahunan = async () => {
    try {
        const pegawai = await Pegawai.findAll();

        for (const user of pegawai) {
            const kuotas = await KuotaCuti.findAll({ where: { idPegawai: user.id } });
            // console.log('Memproses pegawai:', user.id);

            const jenisKuotaMap = {
                'Cuti Tahunan': 12,
                'Cuti Tahunan N-1': null,
                'Cuti Tahunan N-2': null,
                'Cuti Besar': 90,
                'Cuti Sakit': 30,
                'Cuti Alasan Penting': 30,
                'Cuti Di Luar Tanggungan Negara': 260,
                'Cuti Melahirkan': 90,
            };

            const kuotaByJenis = {};
            kuotas.forEach((item) => {
                kuotaByJenis[item.jenisCuti] = item;
            });

            // Reset cuti tahunan & turunannya
            const tahunan = kuotaByJenis['Cuti Tahunan'];
            const n1 = kuotaByJenis['Cuti Tahunan N-1'];
            const n2 = kuotaByJenis['Cuti Tahunan N-2'];

            if (tahunan && n1 && n2) {
                const sisaTahunan = Math.min(Number(tahunan.sisaKuota), 6);
                const sisaN1 = Math.min(Number(n1.sisaKuota), 6);

                await n2.update({ totalKuota: sisaN1, sisaKuota: sisaN1 });
                await n1.update({ totalKuota: sisaTahunan, sisaKuota: sisaTahunan });
                await tahunan.update({ totalKuota: 12, sisaKuota: 12 });
            }

            // Reset jenis cuti lainnya
            for (const [jenisCuti, defaultKuota] of Object.entries(jenisKuotaMap)) {
                if (['Cuti Tahunan', 'Cuti Tahunan N-1', 'Cuti Tahunan N-2'].includes(jenisCuti)) continue;

                const kuota = kuotaByJenis[jenisCuti];
                if (!kuota) continue;

                await kuota.update({
                    totalKuota: defaultKuota,
                    sisaKuota: defaultKuota,
                });
            }
        }

        console.log("Reset semua kuota cuti berhasil dilakukan");
    } catch (error) {
        console.error("Gagal reset kuota cuti:", error.message);
    }
};