const express = require('express');
const api = require('../controllers');

const router = express.Router();

router.get('/preferences', api.preferences);
router.post('/preferences', api.updateRepos);

module.exports = router;
