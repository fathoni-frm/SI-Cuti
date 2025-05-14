const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorizeRoles, checkAlreadyLoggedIn, checkNotLoggedIn } = require('../middleware/authMiddleware');

router.get("/token", authController.refreshToken);
router.post("/register", verifyToken, authorizeRoles('Admin'), authController.register);
router.post("/login", checkAlreadyLoggedIn, authController.login);
router.delete("/logout", checkNotLoggedIn, authController.logout);

module.exports = router;