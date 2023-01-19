const express = require('express');
const router = express.Router();
const { index, create, insert, edit, update, remove } = require('./controller');
const { isLogin, isLoginAdmin } = require('../middleware');

router.use(isLogin);
router.get('/', index);
router.get('/create', isLoginAdmin, create);
router.post('/create', isLoginAdmin, insert);
router.get('/edit/:slug', isLoginAdmin, edit);
router.put('/edit/:slug', isLoginAdmin, update);
router.delete('/delete/:id', isLoginAdmin, remove);

module.exports = router;