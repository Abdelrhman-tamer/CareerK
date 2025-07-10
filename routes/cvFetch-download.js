const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvFetch-download');
const {authenticateUser} = require('../middleware/authMiddleware'); 

router.get('/download', authenticateUser, cvController.downloadCvByContext);

module.exports = router;
