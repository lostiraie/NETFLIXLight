const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, } = require('../logic/authentification.js');

// Routes authentifications

router.post('/register', registerUser);      // Inscription
router.post('/login', loginUser);            // Connexion
router.post('/logout', logoutUser);          // Déconnexion

router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({
            user: req.session.user,
            profile: req.session.profile || null
        });
    } else {
        res.json({ user: null, profile: null });
    }
});

module.exports = router;