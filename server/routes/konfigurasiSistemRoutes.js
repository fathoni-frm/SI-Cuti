const express = require("express");
const router = express.Router();
const konfigurasiSistemController = require("../controllers/konfigurasiSistemController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", verifyToken, konfigurasiSistemController.getKonfigurasi);
router.put("/", verifyToken, authorizeRoles("Admin"), konfigurasiSistemController.updateKonfigurasi);
router.get("/template-import", verifyToken, konfigurasiSistemController.getTemplateImport);
router.get("/cetak-surat/:filename", konfigurasiSistemController.cetakSuratCuti);

module.exports = router;