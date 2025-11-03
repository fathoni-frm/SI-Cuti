const express = require('express');
const router = express.Router();
const upload = require("../middleware/uploadExcel");
const dataPegawaiController = require('../controllers/dataPegawaiController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/pegawai', authorizeRoles('Admin'), dataPegawaiController.getAllPegawai);
router.post('/pegawai', authorizeRoles('Admin'), dataPegawaiController.createPegawai);
router.delete('/pegawai/:id', authorizeRoles('Admin'), dataPegawaiController.deletePegawai);
router.post('/pegawai/import', upload.single("file"), authorizeRoles('Admin'), dataPegawaiController.importPegawai);

router.get('/pegawai/:id', dataPegawaiController.getPegawaiById);
router.get('/form/pegawai', dataPegawaiController.getDaftarPegawai);
router.get('/form/ketua-tim', dataPegawaiController.getDaftarKetuaTim);
router.get('/form/kepala-sapel', dataPegawaiController.getDaftarKepalaSapel);
router.put('/pegawai/:id', dataPegawaiController.updatePegawai);
router.post('/pegawai/validate', dataPegawaiController.validatePegawai);
router.get('/pegawai/cetak/:id', dataPegawaiController.cetakProfilPegawai);

module.exports = router;