const express = require('express');
const router = express.Router();
const { handleEmailIngestion } = require('../controllers/emailIngestionController');

// Route to handle the incoming parsed data from emails
router.post('/ingest', handleEmailIngestion);

module.exports = router;
