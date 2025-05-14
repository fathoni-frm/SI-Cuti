const express = require('express');
const router = express.Router();
const dataPegawaiController = require('../controllers/dataPegawaiController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/pegawai', authorizeRoles('Admin'), dataPegawaiController.getAllPegawai);
router.post('/pegawai', authorizeRoles('Admin'), dataPegawaiController.createPegawai);
router.delete('/pegawai/:id', authorizeRoles('Admin'), dataPegawaiController.deletePegawai);

router.get('/pegawai/:id', dataPegawaiController.getPegawaiById);
router.get('/form/pegawai', dataPegawaiController.getDaftarPegawai);
router.get('/form/atasan', dataPegawaiController.getDaftarAtasan);
router.put('/pegawai/:id', dataPegawaiController.updatePegawai);
router.post('/pegawai/validate', dataPegawaiController.validatePegawai);

module.exports = router;