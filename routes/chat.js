const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const chatController = require('../controllers/chat');

router.post('/', wrapAsync(chatController.handleChat));

module.exports = router;
