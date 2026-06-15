const express = require('express');
const router = express.Router();
const { addToHistory, getHistory, clearHistory } = require('../logic/history.js');
const { ensureProfile } = require('../security/security.js');

router.get('/',     ensureProfile, getHistory);
router.post('/',    ensureProfile, addToHistory);
router.delete('/',  ensureProfile, clearHistory);

module.exports = router;