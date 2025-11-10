const { Op } = require('sequelize');
const { VerifikasiCuti, PengajuanCuti, PelimpahanTugas, Pegawai, KuotaCuti, Notifikasi } = require('../models');
const { generateSuratCuti } = require('./cetakSuratCuti');

const getDataPermohonanCutiAdmin = async (req, res) => {
    try {
        const data = await PengajuanCuti.findAll({
            include: [
                { model: Pegawai, as: 'pegawai' }
            ],
            order: [['tanggalPengajuan', 'DESC']]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getDataPermohonanCutiAtasan = async (req, res) => {
    try {
        const { idPegawai } = req.user;

        const verifSaya = await VerifikasiCuti.findAll({
            where: { idPimpinan: idPegawai },
            include: [
                {
                    model: PengajuanCuti,
                    where: {
                        status: { [Op.in]: ['Diproses', 'Disetujui', 'Ditolak', 'Dibatalkan'] },
                    },
                    include: [
                        { model: Pegawai, as: 'pegawai', attributes: ['id', 'nama', 'nip'] },
                        {
                            model: PelimpahanTugas,
                            required: false,
                            attributes: ['status'],
                        },
                        {
                            model: VerifikasiCuti,
                            attributes: [
                                'id', 'idPimpinan', 'statusVerifikasi',
                                'urutanVerifikasi',
                            ],
                            order: [['urutanVerifikasi', 'ASC']],
                        },
                    ],
                },
            ],
            attributes: ['id', 'idPengajuan', 'statusVerifikasi', 'urutanVerifikasi', 'updatedAt'],
            order: [[{ model: PengajuanCuti }, 'tanggalPengajuan', 'DESC']],
        });

        const permohonanCuti = [];
        const disetujui = [];
        const ditolak = [];

        for (const row of verifSaya) {
            const peng = row.PengajuanCuti;

            /*  Pastikan pelimpahan tugas (jika ada) SUDAH disetujui */
            const pelimpahanOk =
                !peng.PelimpahanTuga ||
                peng.PelimpahanTuga.status === 'Disetujui';

            if (!pelimpahanOk) continue;

            /*  Dapatkan array semua verifikator (sudah di‑include) */
            const verArr = peng.VerifikasiCutis.sort(
                (a, b) => a.urutanVerifikasi - b.urutanVerifikasi
            );
            const urutanSaya = verArr.findIndex(v => v.idPimpinan === idPegawai);
            if (urutanSaya === -1) continue;                   // seharusnya tidak terjadi

            const semuaSebelum = verArr
                .slice(0, urutanSaya)
                .every(v => v.statusVerifikasi === 'Disetujui');

            const statusSaya = verArr[urutanSaya].statusVerifikasi;

            if (
                semuaSebelum &&
                (statusSaya === 'Belum Diverifikasi' || statusSaya === 'Diproses')
            ) {
                permohonanCuti.push(row);
            } else if (statusSaya === 'Disetujui') {
                disetujui.push(row);
            } else if (statusSaya === 'Ditolak') {
                ditolak.push(row);
            }
        }

        return res.status(200).json({
            permohonanCuti,
            disetujui,
            ditolak,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: err.message });
    }
}

const updateStatusToDiproses = async (req, res) => {
    try {
        const { idVerifikasi } = req.body;
        let verifikasi = null;

        verifikasi = await VerifikasiCuti.findByPk(idVerifikasi);

        if (!verifikasi) {
            return res.status(404).json({ message: 'Data tidak ditemukan' });
        }

        verifikasi.statusVerifikasi = "Diproses";
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

            // membuat notifikasi untuk pegawai
            const pengajuan = await PengajuanCuti.findByPk(verifikasi.idPengajuan, {
                include: [{ model: Pegawai, as: "pegawai" }, { model: PelimpahanTugas, required: false }],
            });
            const verifikator = await Pegawai.findByPk(idPegawai);
            await Notifikasi.create({
                idPenerima: pengajuan.idPegawai,
                idPengajuan: pengajuan.id,
                judul: "Permohonan Cuti Ditolak",
                pesan: `Permohonan ${pengajuan.jenisCuti} Anda telah ditolak oleh ${verifikator.nama}.`,
            });

            if (pengajuan.PelimpahanTuga) {
                await Notifikasi.create({
                    idPenerima: pengajuan.PelimpahanTuga.idPenerima,
                    idPengajuan: pengajuan.id,
                    judul: "Pelimpahan Tugas Dibatalkan",
                    pesan: `Pelimpahan tugas dari ${pengajuan.pegawai?.nama} telah dibatalkan karena permohonan cuti ditolak.`,
                });
            }
        }

        if (statusVerifikasi === "Disetujui") {
            const verifikatorSelanjutnya = await VerifikasiCuti.findOne({
                where: {
                    idPengajuan: verifikasi.idPengajuan,
                    urutanVerifikasi: verifikasi.urutanVerifikasi + 1,
                    statusVerifikasi: "Belum Diverifikasi",
                },
            });
            const pengajuan = await PengajuanCuti.findByPk(verifikasi.idPengajuan, {
                include: { model: Pegawai, as: "pegawai" },
            });
            // Membuat notifikasi untuk verifikator selanjutnya
            if (verifikatorSelanjutnya) {
                await Notifikasi.create({
                    idPenerima: verifikatorSelanjutnya.idPimpinan,
                    idPengajuan: verifikasi.idPengajuan,
                    judul: "Permohonan Cuti Baru",
                    pesan: `Anda perlu memverifikasi permohonan ${pengajuan.jenisCuti} dari ${pengajuan.pegawai.nama}.`,
                });
            }

            const semuaVerifikasi = await VerifikasiCuti.findAll({
                where: { idPengajuan: verifikasi.idPengajuan },
            });
            // Mengecek apakah semua verifikator telah menyetujui
            const semuaSetuju = semuaVerifikasi.every(
                (v) => v.statusVerifikasi === "Disetujui"
            );
            // Jika semua verifikator telah menyetujui
            if (semuaSetuju) {
                const pengajuan = await PengajuanCuti.findByPk(verifikasi.idPengajuan);

                await pengajuan.update({ status: "Disetujui" });

                // Membuat notifikasi untuk pegawai
                await Notifikasi.create({
                    idPenerima: pengajuan.idPegawai,
                    idPengajuan: pengajuan.id,
                    judul: "Permohonan Cuti Disetujui",
                    pesan: `Permohonan ${pengajuan.jenisCuti} Anda telah disetujui oleh seluruh verifikator.`,
                });

                generateSuratCuti(pengajuan.id)
                    .then((namaFile) => {
                        return pengajuan.update({ suratCuti: namaFile });
                    })
                    .catch((err) => {
                        console.error("Gagal generate surat cuti:", err);
                    });

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

        return res.status(200).json({ msg: "Status verifikasi berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const batalCutiOlehAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { komentar, tanggalVerifikasi } = req.body;

        const pengajuan = await PengajuanCuti.findByPk(id, {
            include: [{ model: Pegawai, as: "pegawai" }, { model: PelimpahanTugas, required: false }],
        });
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
            idPimpinan: req.user.idPegawai,
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
                "Cuti Tahunan N-2",
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

        await Notifikasi.create({
            idPenerima: pengajuan.idPegawai,
            idPengajuan: pengajuan.id,
            judul: "Cuti Dibatalkan oleh Admin",
            pesan: `Pengajuan cuti Anda telah dibatalkan oleh admin. Dan kuota cuti anda telah dikembalikan.`,
        });

        if (pengajuan.PelimpahanTuga) {
            await Notifikasi.create({
                idPenerima: pengajuan.PelimpahanTuga.idPenerima,
                idPengajuan: pengajuan.id,
                judul: "Pelimpahan Tugas Dibatalkan",
                pesan: `Pelimpahan tugas dari ${pengajuan.pegawai?.nama} telah dibatalkan karena permohonan cuti dibatalkan oleh admin.`,
            });
        }

        res.status(200).json({ msg: "Cuti berhasil dibatalkan oleh admin" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getDataPermohonanCutiAdmin,
    getDataPermohonanCutiAtasan,
    updateStatusToDiproses,
    verifikasiCuti,
    batalCutiOlehAdmin
}