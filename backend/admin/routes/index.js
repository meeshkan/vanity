const express = require('express');
const admin = require('../controllers');

const router = new express.Router();

router.use('/queues', admin.queues);

module.exports = router;
