const express = require('express');
const api = require('../controllers');

const router = express.Router();

router.get('/preferences', api.preferences);
router.post('/preferences/repos', api.updateRepos);
router.post('/preferences/metric-types', api.updateMetricTypes);
router.post('/unsubscribe', api.unsubscribe);

module.exports = router;
