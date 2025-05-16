const express = require("express");
const router = express.Router();
const validasiController = require("../controllers/validasiController");

router.get("/pengajuan/:id", validasiController.validasiPengajuan);
router.get("/verifikator/:id", validasiController.validasiVerifikator);

module.exports = router;