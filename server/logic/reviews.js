const path = require('path');
const { readJSON, writeJSON } = require('../services/storage.js');

const filePath = path.join(__dirname, '../stockage/reviews.json');

// Ajoute ou modifie une note
exports.addReview = (req, res) => {
    const profileId = req.session.profile.id;
    const { filmId, titre, poster, type, note, commentaire } = req.body;
    let reviews = readJSON(filePath);

    // Supprime l'ancienne note si elle existe
    reviews = reviews.filter(
        r => !(String(r.filmId) === String(filmId) && r.profileId === profileId)
    );

    // Ajoute la nouvelle note
    reviews.push({
        profileId,
        pseudo: req.session.user.pseudo,
        filmId,
        titre,
        poster,
        type: type || 'movie',
        note,
        commentaire,
        date: new Date().toISOString()
    });

    writeJSON(filePath, reviews);
    res.json({ message: 'Review added ✓' });
};

// Récupère les notes d'un film
exports.getReviews = (req, res) => {
    const filmId = req.params.id;
    const reviews = readJSON(filePath);

    const filmReviews = reviews
        .filter(r => String(r.filmId) === String(filmId))
        .map(r => ({
            pseudo: r.pseudo,
            note: r.note,
            commentaire: r.commentaire,
            date: r.date
        }));

    res.json(filmReviews);
};

// Récupère les notes de l'utilisateur connecté
exports.getMyReviews = (req, res) => {
    const profileId = req.session.profile.id;
    const reviews = readJSON(filePath);

    const myReviews = reviews
        .filter(r => r.profileId === profileId)
        .map(r => ({
            filmId: r.filmId,
            titre: r.titre,
            poster: r.poster,
            type: r.type,
            note: r.note,
            commentaire: r.commentaire,
            date: r.date
        }));

    res.json(myReviews);
};

// Supprime une note
exports.removeReview = (req, res) => {
    const profileId = req.session.profile.id;
    const filmId = req.params.id;
    let reviews = readJSON(filePath);

    reviews = reviews.filter(
        r => !(String(r.filmId) === String(filmId) && r.profileId === profileId)
    );

    writeJSON(filePath, reviews);
    res.json({ message: 'Review removed ✓' });
};