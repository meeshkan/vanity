const express = require('express');
const api = require('../controllers');

const router = express.Router();

router.get('/preferences', api.preferences);
router.post('/preferences/repos', api.updateRepos);
router.post('/preferences/metric-types', api.updateMetricTypes);
router.delete('/subscription', api.unsubscribe);
router.post('/subscription', api.resubscribe);
router.delete('/user', api.destroy);
router.post('/user/recovery', api.cancelDestruction);

module.exports = router;
