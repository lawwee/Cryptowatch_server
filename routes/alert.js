const express = require('express');

const router = express.Router();

const alertControl = require('../controllers/alert');
const isAuth = require('../middleware/is-auth');

router.get('/alerts', isAuth, alertControl.allAlerts);

// router.get('/addalert/:coin', alertControl.addAlert);
router.post('/addalert/:coin', isAuth, alertControl.addAlert);

router.delete('/deletealert/:coin', isAuth, alertControl.deleteAlert)

module.exports = router;