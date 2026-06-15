const express = require('express');
const router = express.Router();
const { addReview, getReviews, getMyReviews, removeReview } = require('../logic/reviews.js');
const { ensureProfile } = require('../security/security.js');

router.get('/my',       ensureProfile, getMyReviews);      // Mes notes
router.get('/:id',      getReviews);                    // Notes d'un film (public)
router.post('/',        ensureProfile, addReview);          // Ajouter une note
router.delete('/:id',   ensureProfile, removeReview);       // Supprimer une note

module.exports = router;