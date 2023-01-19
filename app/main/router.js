const express = require('express');
const router = express.Router();
const { overview, profile, settings, login, loginAction, registration, registrationAction, logout } = require('./controller');
const { isLogin } = require('../middleware');

router.get('/', isLogin, overview);
router.get('/settings', isLogin, profile);
router.put('/settings', isLogin, settings);
router.get('/login', login);
router.post('/login', loginAction);
router.get('/registration', registration);
router.post('/registration', registrationAction);
router.get('/logout', logout)

module.exports = router;