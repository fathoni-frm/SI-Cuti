const express = require("express");
const router = express.Router();
const konfigurasiSistemController = require("../controllers/konfigurasiSistemController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", verifyToken, authorizeRoles("Admin"), konfigurasiSistemController.getKonfigurasi);
router.put("/", verifyToken, authorizeRoles("Admin"), konfigurasiSistemController.updateKonfigurasi);

module.exports = router;