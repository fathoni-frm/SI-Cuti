const express = require("express");
const router = express.Router();
const upload = require('../middleware/addLampiranMiddleware');
const pengajuanCutiController = require("../controllers/pengajuanCutiController");
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Lihat detail pengajuan cuti
router.get("/:id", pengajuanCutiController.getPengajuanCutiById);

// Lihat pengajuan cuti berdasarkan pegawai (untuk pengguna yg login)
router.get("/riwayat/:idPegawai", pengajuanCutiController.getRiwayatCutiByPegawai);

// Lihat draft berdasarkan pegawai (untuk pengguna yg login)
router.get("/draft/:idPegawai", pengajuanCutiController.getDraftCutiByPegawai);
// Lihat detail draft pengguna untuk diedit
router.get("/draft/edit/:id", pengajuanCutiController.getDraftById);

// Buat pengajuan cuti (beserta pelimpahan tugas dan verifikasi cuti)
router.post("/", upload.single('lampiran'), pengajuanCutiController.createPengajuanCuti);
// Update pengajuan cuti + pelimpahan tugas + verifikasi cuti
router.put("/:id", upload.single('lampiran'), pengajuanCutiController.updatePengajuanCuti);
// Hapus pengajuan cuti + pelimpahan tugas + verifikasi cuti
router.delete("/:id", pengajuanCutiController.deletePengajuanCuti);

module.exports = router;
