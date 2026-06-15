const express = require('express');
const router = express.Router();
const { addToWatchlist, getWatchlist, removeFromWatchlist } = require('../logic/watchlist.js');
const { ensureProfile } = require('../security/security.js');

router.get('/',      ensureProfile, getWatchlist);
router.post('/',     ensureProfile, addToWatchlist);
router.delete('/:id', ensureProfile, removeFromWatchlist);

module.exports = router;