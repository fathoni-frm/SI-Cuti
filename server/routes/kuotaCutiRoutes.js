const express = require('express');
const router = express.Router();
const kuotaCutiController = require('../controllers/kuotaCutiController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/:id', kuotaCutiController.getKuotaCutiByUser);
router.post('/', authorizeRoles('Admin'), kuotaCutiController.createKuotaCuti);
router.put('/:id', authorizeRoles('Admin'), kuotaCutiController.updateKuotaCuti);
router.post('/tambah', authorizeRoles('Admin'), kuotaCutiController.tambahKuotaCutiTahunan);

// router.post('/reset-tahunan', authorizeRoles('Admin'), kuotaCutiController.resetKuotaCutiTahunan); //cuman untuk testing  

module.exports = router;