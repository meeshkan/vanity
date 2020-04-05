const express = require('express');
const api = require('../controllers');

const router = express.Router();

router.get('/preferences', api.preferences);
router.post('/preferences', api.updateRepos);
router.post('/unsubscribe', api.unsubscribe);

module.exports = router;
