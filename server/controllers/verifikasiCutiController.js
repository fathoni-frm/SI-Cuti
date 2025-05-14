const { Op } = require('sequelize');
const { VerifikasiCuti, PengajuanCuti, Pegawai, KuotaCuti } = require('../models');

const getDataPermohonanCuti = async (req, res) => {
    try {
        const { role, idPegawai } = req.user;

        if (role === 'Admin') {
            const data = await PengajuanCuti.findAll({
                include: [
                    { model: Pegawai, as: 'Pegawai' },
                    { model: Pegawai, as: 'PenerimaTugas' }
                ],
                order: [['tanggalPengajuan', 'DESC']]
            });
            return res.json(data);
        }

        if (role === 'Atasan') {
            // Semua pengajuan pengajuan yang diverifikasi atasan tersebut
            const semuaVerifikasi = await VerifikasiCuti.findAll({
                where: { idPimpinan: idPegawai },
                include: [{
                    model: PengajuanCuti,
                    where: { status: { [Op.in]: ['Diproses', 'Disetujui', 'Ditolak', 'Dibatalkan'] } },
                    include: [{ model: Pegawai, as: 'Pegawai' }]
                }],
            });

            const permohonanCuti = [];
            const disetujui = [];
            const ditolak = [];

            for (const v of semuaVerifikasi) {
                // Ambil semua verifikator untuk pengajuan ini
                const semuaVerifikator = await VerifikasiCuti.findAll({
                    where: { idPengajuan: v.idPengajuan },
                    order: [['urutanVerifikasi', 'ASC']],
                });

                // Temukan posisi (urutan) verifikator ini
                const urutanSaya = semuaVerifikator.findIndex(
                    (vx) => vx.idPimpinan === idPegawai
                );

                // Cek semua verifikator sebelum saya, harus sudah "Disetujui"
                const semuaSebelumSayaDisetujui = semuaVerifikator
                    .slice(0, urutanSaya)
                    .every((vx) => vx.statusVerifikasi === 'Disetujui');

                const statusSaya = semuaVerifikator[urutanSaya]?.statusVerifikasi;

                // Jika semua sebelumnya "Disetujui", dan saya belum memverifikasi, maka tampilkan
                if (
                    semuaSebelumSayaDisetujui &&
                    (statusSaya === 'Belum Diverifikasi' || statusSaya === 'Diproses')
                ) {
                    permohonanCuti.push(v);
                } else if (statusSaya === 'Disetujui') {
                    disetujui.push(v);
                } else if (statusSaya === 'Ditolak' || statusSaya === 'Dibatalkan') {
                    ditolak.push(v);
                }
            }
            return res.json({
                permohonanCuti,
                disetujui,
                ditolak,
            });
        }
        return res.status(403).json({ msg: 'Akses ditolak' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateStatusToDiproses = async (req, res) => {
    try {
        const { idVerifikasi, statusVerifikasi } = req.body;

        const verifikasi = await VerifikasiCuti.findByPk(idVerifikasi);
        if (!verifikasi) {
            return res.status(404).json({ message: 'Data tidak ditemukan' });
        }

        // Update status
        verifikasi.statusVerifikasi = statusVerifikasi;
        await verifikasi.save();

        res.status(200).json({ message: 'Status verifikasi diperbarui', data: verifikasi });
    } catch (error) {
        console.error('Gagal update status verifikasi:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

const verifikasiCuti = async (req, res) => {
    const { id, statusVerifikasi, komentar, tanggalVerifikasi } = req.body;
    const { idPegawai, role } = req.user;

    try {
        const verifikasi = await VerifikasiCuti.findByPk(id);

        if (!verifikasi) {
            return res.status(404).json({ msg: "Data verifikasi tidak ditemukan" });
        }

        if (verifikasi.idPimpinan !== idPegawai || role !== "Atasan") {
            return res.status(403).json({ msg: "Anda tidak memiliki akses" });
        }

        // Update verifikasi saat ini
        verifikasi.statusVerifikasi = statusVerifikasi;
        verifikasi.komentar = komentar;
        verifikasi.tanggalVerifikasi = tanggalVerifikasi;
        await verifikasi.save();

        if (statusVerifikasi === "Ditolak") {
            await PengajuanCuti.update(
                { status: "Ditolak" },
                { where: { id: verifikasi.idPengajuan } }
            );
        }

        if (statusVerifikasi === "Disetujui") {
            const semuaVerifikasi = await VerifikasiCuti.findAll({
                where: { idPengajuan: verifikasi.idPengajuan },
            });

            const semuaSetuju = semuaVerifikasi.every(
                (v) => v.statusVerifikasi === "Disetujui"
            );

            if (semuaSetuju) {
                await PengajuanCuti.update(
                    { status: "Disetujui" },
                    { where: { id: verifikasi.idPengajuan } }
                );

                const pengajuan = await PengajuanCuti.findByPk(verifikasi.idPengajuan);

                if (pengajuan.jenisCuti === "Cuti Tahunan") {
                    let sisaCuti = pengajuan.durasi;
                    const urutanKuota = [
                        "Cuti Tahunan N-2",
                        "Cuti Tahunan N-1",
                        "Cuti Tahunan",
                    ];

                    for (const jenis of urutanKuota) {
                        const kuota = await KuotaCuti.findOne({
                            where: {
                                idPegawai: pengajuan.idPegawai,
                                jenisCuti: jenis,
                            },
                        });
                        if (kuota && sisaCuti > 0) {
                            const yangDipakai = Math.min(sisaCuti, kuota.sisaKuota);
                            kuota.sisaKuota -= yangDipakai;
                            sisaCuti -= yangDipakai;
                            await kuota.save();
                        }
                        if (sisaCuti === 0) break;
                    }
                }
                else {
                    const kuota = await KuotaCuti.findOne({
                        where: {
                            idPegawai: pengajuan.idPegawai,
                            jenisCuti: pengajuan.jenisCuti,
                        },
                    });

                    if (kuota) {
                        kuota.sisaKuota -= pengajuan.durasi;
                        await kuota.save();
                    }
                }
            }
        }

        return res.json({ msg: "Status verifikasi berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const batalCutiOlehAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { komentar, tanggalVerifikasi } = req.body;

        const pengajuan = await PengajuanCuti.findByPk(id);
        if (!pengajuan) return res.status(404).json({ msg: "Pengajuan tidak ditemukan" });

        if (pengajuan.status !== 'Disetujui') {
            return res.status(400).json({ msg: "Cuti hanya bisa dibatalkan jika statusnya Disetujui" });
        }

        pengajuan.status = "Dibatalkan";
        await pengajuan.save();

        const verifikasiSebelumnya = await VerifikasiCuti.findAll({
            where: { idPengajuan: pengajuan.id },
            order: [['urutanVerifikasi', 'DESC']],
            limit: 1,
        });

        const urutanAdmin = verifikasiSebelumnya.length > 0
            ? verifikasiSebelumnya[0].urutanVerifikasi + 1
            : 1;

        await VerifikasiCuti.create({
            idPengajuan: pengajuan.id,
            idPimpinan: req.user.idPegawai, // asumsi admin login
            jenisVerifikator: "Admin",
            urutanVerifikasi: urutanAdmin,
            statusVerifikasi: "Dibatalkan",
            komentar: komentar || "Dibatalkan oleh admin",
            tanggalVerifikasi: tanggalVerifikasi,
        });

        // Kembalikan kuota cuti (jika Cuti Tahunan)
        if (pengajuan.jenisCuti === "Cuti Tahunan") {
            let sisaCuti = pengajuan.durasi;
            const urutanKuota = [
                "Cuti Tahunan",
                "Cuti Tahunan N-1",
                "Cuti Tahunan  N-2",
            ];

            for (const jenis of urutanKuota) {
                const kuota = await KuotaCuti.findOne({
                    where: {
                        idPegawai: pengajuan.idPegawai,
                        jenisCuti: jenis,
                    },
                });
                if (kuota && sisaCuti > 0) {
                    const maksimumTambahan = kuota.totalKuota - kuota.sisaKuota;
                    const yangDikembalikan = Math.min(sisaCuti, maksimumTambahan);
                    kuota.sisaKuota += yangDikembalikan;
                    sisaCuti -= yangDikembalikan;
                    await kuota.save();
                }
                if (sisaCuti === 0) break;
            }
        } else {
            const kuota = await KuotaCuti.findOne({
                where: {
                    idPegawai: pengajuan.idPegawai,
                    jenisCuti: pengajuan.jenisCuti,
                },
            });
            if (kuota) {
                const maksimumTambahan = kuota.totalKuota - kuota.sisaKuota;
                const yangDikembalikan = Math.min(pengajuan.durasi, maksimumTambahan);
                kuota.sisaKuota += yangDikembalikan;
                await kuota.save();
            }
        }

        res.json({ msg: "Cuti berhasil dibatalkan oleh admin" });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getDataPermohonanCuti,
    updateStatusToDiproses,
    verifikasiCuti,
    batalCutiOlehAdmin
}