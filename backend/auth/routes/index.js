const express = require('express');
const auth = require('../controllers');

const router = new express.Router();

router.get('/', auth.sendUserData);
router.get('/github', auth.login);
router.get('/github/callback', auth.login, auth.setCookies);
router.get('/logout', auth.logout);

module.exports = router;
