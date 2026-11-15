const express = require('express');
const router = express.Router();
const upload = require('../controllers/uploadController');

// Files are sent as the raw request body (max 5 MB); the real type is checked in the controller
const rawFile = express.raw({ type: () => true, limit: '5mb' });

router.post('/uploads/image', rawFile, upload.adminImage);

module.exports = router;
module.exports.rawFile = rawFile;