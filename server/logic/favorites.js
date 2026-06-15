const { readJSON, writeJSON } = require('../services/storage.js'); // utilise storage
const path = require('path');

const filePath = path.join(__dirname, '../stockage/favorites.json');

// Ajoute un favori
exports.addFavorite = (req, res) => {
    const film = req.body;
    const profileId = req.session.profile.id;
    const favorites = readJSON(filePath);

    // Vérifie que ce film n'est pas déjà dans les favoris DE CET utilisateur
    const dejaPresent = favorites.some(
        f => String(f.filmId) === String(film.id) && f.profileId === profileId
    );
    if (dejaPresent) return res.json({ message: "Already in favorites" });

    // Ajoute avec l'id utilisateur
    favorites.push({
        profileId,
        filmId: film.id,
        titre: film.titre,
        poster: film.poster,
        type: film.type || 'movie'
    });

    writeJSON(filePath, favorites);
    res.json({ message: "Movie added to favorites ✓" });
};

// Récupère les favoris DE CET utilisateur uniquement
exports.getFavorites = (req, res) => {
    const profileId = req.session.profile.id;
    const favorites = readJSON(filePath);

    // Filtre par userId et reformate pour le frontend
    const userFavorites = favorites
        .filter(f => f.profileId === profileId)
        .map(f => ({
            id: f.filmId,
            titre: f.titre,
            poster: f.poster,
            type: f.type || 'movie'
        }));

    res.json(userFavorites);
};

// Supprime un favori DE CET utilisateur uniquement
exports.removeFavorite = (req, res) => {
    const profileId = req.session.profile.id;
    const filmId = req.params.id;
    let favorites = readJSON(filePath);

    // Supprime uniquement le favori qui appartient à cet utilisateur
    favorites = favorites.filter(
        f => !(String(f.filmId) === String(filmId) && f.profileId === profileId)
    );

    writeJSON(filePath, favorites);
    res.json({ message: "Film removed from favorites ✓" });
};