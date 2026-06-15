const path = require('path');
const { readJSON, writeJSON } = require('../services/storage.js');

const filePath = path.join(__dirname, '../stockage/watchlist.json');

// Ajoute à la watchlist
exports.addToWatchlist = (req, res) => {
    const profileId = req.session.profile.id;
    const film = req.body;
    let watchlist = readJSON(filePath);

    const dejaPresent = watchlist.some(
        f => String(f.filmId) === String(film.id) && f.profileId === profileId
    );
    if (dejaPresent) return res.json({ message: 'Already in watchlist' });

    watchlist.push({
        profileId,
        filmId: film.id,
        titre: film.titre,
        poster: film.poster,
        type: film.type || 'movie',
        date: new Date().toISOString()
    });

    writeJSON(filePath, watchlist);
    res.json({ message: 'Added to watchlist ✓' });
};

// Récupère la watchlist
exports.getWatchlist = (req, res) => {
    const profileId = req.session.profile.id;
    const watchlist = readJSON(filePath);

    const userWatchlist = watchlist
        .filter(f => f.profileId === profileId)
        .map(f => ({
            id: f.filmId,
            titre: f.titre,
            poster: f.poster,
            type: f.type,
            date: f.date
        }));

    res.json(userWatchlist);
};

// Supprime de la watchlist
exports.removeFromWatchlist = (req, res) => {
    const profileId = req.session.profile.id;
    const filmId = req.params.id;
    let watchlist = readJSON(filePath);

    watchlist = watchlist.filter(
        f => !(String(f.filmId) === String(filmId) && f.profileId === profileId)
    );

    writeJSON(filePath, watchlist);
    res.json({ message: 'Removed from watchlist ✓' });
};