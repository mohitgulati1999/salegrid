const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.createSession);
router.get('/salesperson/:salespersonId', sessionController.getSessions);
router.get('/:sessionId', sessionController.getSession);

module.exports = router;