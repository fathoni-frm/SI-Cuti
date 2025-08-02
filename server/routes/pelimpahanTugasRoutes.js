const express = require("express");
const router = express.Router();
const pelimpahanTugasController = require("../controllers/pelimpahanTugasController");
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/pelimpahan-tugas/:id', authorizeRoles('Atasan', 'Pegawai'), pelimpahanTugasController.getPermohonanPelimpahanById);
router.get('/permohonan-pelimpahan-tugas', authorizeRoles('Atasan', 'Pegawai'), pelimpahanTugasController.getPermohonanPelimpahan);
router.patch('/status-pelimpahan-diproses/:id', authorizeRoles('Atasan', 'Pegawai'), pelimpahanTugasController.updateStatusToDiproses);
router.patch('/verifikasi-pelimpahan/:id', authorizeRoles('Atasan', 'Pegawai'), pelimpahanTugasController.verifikasiPelimpahan);

module.exports = router;