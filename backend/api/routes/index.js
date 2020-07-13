const express = require('express');
const api = require('../controllers');

const router = express.Router();

router.get('/preferences', api.preferences);
router.post('/preferences/repos', api.updateRepos);
router.post('/preferences/metric-types', api.updateMetricTypes);
router.post('/unsubscribe', api.unsubscribe);
router.post('/resubscribe', api.resubscribe);
router.post('/delete-account', api.destroy);
router.post('/cancel-deletion', api.cancelDestruction);

module.exports = router;
