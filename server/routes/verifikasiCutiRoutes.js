const express = require("express");
const router = express.Router();
const verifikasiCutiController = require("../controllers/verifikasiCutiController");
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/permohonan-cuti/admin', authorizeRoles('Admin'), verifikasiCutiController.getDataPermohonanCutiAdmin);
router.get('/permohonan-cuti/atasan', authorizeRoles('Atasan'), verifikasiCutiController.getDataPermohonanCutiAtasan);
router.patch('/status-to-diproses/:id', authorizeRoles('Admin', 'Atasan'), verifikasiCutiController.updateStatusToDiproses);
router.patch('/verifikasi-cuti/:id', authorizeRoles('Admin', 'Atasan'), verifikasiCutiController.verifikasiCuti);
router.patch('/batalkan-cuti/:id', authorizeRoles('Admin', 'Atasan'), verifikasiCutiController.batalCutiOlehAdmin);

module.exports = router;