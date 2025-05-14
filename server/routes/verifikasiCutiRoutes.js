const express = require("express");
const router = express.Router();
const verifikasiCutiController = require("../controllers/verifikasiCutiController");
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('Admin', 'Atasan') );

router.get('/permohonan-cuti', verifikasiCutiController.getDataPermohonanCuti);
router.patch('/status-to-diproses/:id', verifikasiCutiController.updateStatusToDiproses);
router.patch('/verifikasi-cuti/:id', verifikasiCutiController.verifikasiCuti);
router.patch('/batalkan-cuti/:id', verifikasiCutiController.batalCutiOlehAdmin);

module.exports = router;