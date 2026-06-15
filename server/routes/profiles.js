const express = require('express');
const router = express.Router();
const { getProfiles, createProfile, deleteProfile, selectProfile } = require('../logic/profiles.js');
const { ensureAuth } = require('../security/security.js');

router.get('/',           ensureAuth, getProfiles);
router.post('/',          ensureAuth, createProfile);
router.delete('/:id',     ensureAuth, deleteProfile);
router.post('/select/:id', ensureAuth, selectProfile);

module.exports = router;