const express = require('express');
const router = express.Router();

// ON IMPORTE NOTRE CONTROLLER

const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup );
router.post('/login', userCtrl.login);

module.exports = router;