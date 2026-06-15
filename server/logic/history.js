const path = require('path');
const { readJSON, writeJSON } = require('../services/storage.js');

const filePath = path.join(__dirname, '../stockage/history.json');

// Ajoute un film à l'historique
exports.addToHistory = (req, res) => {
    const profileId = req.session.profile.id;
    const film = req.body;
    if (!film.id || !film.titre || !film.poster) {
        return res.json({ message: 'Incomplete data, skipping' });
    }

    let history = readJSON(filePath);

    // Supprime l'entrée existante si déjà vu
    history = history.filter(
        h => !(String(h.filmId) === String(film.id) && h.profileId === profileId)
    );

    // Ajoute en tête de liste
    history.unshift({
        profileId,
        filmId: film.id,
        titre: film.titre,
        poster: film.poster,
        type: film.type || 'movie',
        date: new Date().toISOString()
    });

    // Garde max 50 entrées par utilisateur
    const userHistory = history.filter(h => h.profileId === profileId);
    if (userHistory.length > 50) {
        const toRemove = userHistory.slice(50).map(h => h.filmId);
        history = history.filter(
            h => !(h.profileId === profileId && toRemove.includes(h.filmId))
        );
    }

    writeJSON(filePath, history);
    res.json({ message: 'Added to history ✓' });
};

// Récupère l'historique de l'utilisateur
exports.getHistory = (req, res) => {
    const profileId = req.session.profile.id;
    const history = readJSON(filePath);

    const userHistory = history
        .filter(h => h.profileId === profileId)
        .map(h => ({
            id: h.filmId,
            titre: h.titre,
            poster: h.poster,
            type: h.type,
            date: h.date
        }));

    res.json(userHistory);
};

// Vide l'historique
exports.clearHistory = (req, res) => {
    const profileId = req.session.profile.id;
    let history = readJSON(filePath);
    history = history.filter(h => h.profileId !== profileId);
    writeJSON(filePath, history);
    res.json({ message: 'History cleared ✓' });
};
