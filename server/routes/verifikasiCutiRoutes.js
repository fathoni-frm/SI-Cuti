const express = require("express");
const router = express.Router();
const verifikasiCutiController = require("../controllers/verifikasiCutiController");
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/permohonan-cuti', authorizeRoles('Admin', 'Atasan'), verifikasiCutiController.getDataPermohonanCuti);
router.patch('/status-to-diproses/:id', authorizeRoles('Admin', 'Atasan'), verifikasiCutiController.updateStatusToDiproses);
router.patch('/verifikasi-cuti/:id', authorizeRoles('Admin', 'Atasan'), verifikasiCutiController.verifikasiCuti);
router.patch('/batalkan-cuti/:id', authorizeRoles('Admin', 'Atasan'), verifikasiCutiController.batalCutiOlehAdmin);

module.exports = router;