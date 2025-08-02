const express = require("express");
const router = express.Router();
const validasiController = require("../controllers/validasiController");

router.get("/:doc/:id/:role/:sig", validasiController.validasiQr);

module.exports = router;