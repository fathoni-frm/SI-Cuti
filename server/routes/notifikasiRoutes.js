const express = require("express");
const router = express.Router();
const notifikasiController = require("../controllers/notifikasiController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", notifikasiController.getNotifikasiByUser);
router.patch("/:id/baca", notifikasiController.tandaiSudahDibaca);
router.delete('/:id', notifikasiController.hapusNotifikasi);

module.exports = router;