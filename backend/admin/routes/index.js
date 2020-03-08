const express = require('express');
const admin = require('../controllers');

const router = express.Router();

router.use('/queues', admin.queues);

module.exports = router;
