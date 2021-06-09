//LOGIQUE DE ROUTING
const express = require('express');
const router = express.Router();

// ON IMPORTE NOTRE CONTROLLER

const sauceCtrl = require('../controllers/sauce');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

router.post('/', auth, multer, sauceCtrl.createSauce );
router.put('/:id', auth, multer, sauceCtrl.modifySauce );
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.get('/', auth, sauceCtrl.getAllSauce );
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);

module.exports = router;