const express = require('express');
const router = express.Router();
const { isLogin, isLoginAdmin } = require('../middleware');
const { index, create, insert, edit, update, swap, remove } = require('./controller');

router.use(isLogin);
router.get('/', index);
router.get('/create', isLoginAdmin, create);
router.post('/create', isLoginAdmin, insert);
router.get('/edit/:id', isLoginAdmin, edit);
router.put('/edit/:id', isLoginAdmin, update);
router.put('/switch/:id', isLoginAdmin, swap);
router.delete('/delete/:id', isLoginAdmin, remove);

module.exports = router;