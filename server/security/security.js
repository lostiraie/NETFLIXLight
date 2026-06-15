// Vérification de la connexion
function ensureAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Not allowed' });
    }
}

// Vérifie qu'un profil est sélectionné
function ensureProfile(req, res, next) {
    if (req.session.user && req.session.profile) {
        next();
    } else {
        res.status(403).json({ error: 'No profile selected' });
    }
}

module.exports = { ensureAuth, ensureProfile };