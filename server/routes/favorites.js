const express = require("express");
const router = express.Router();
const { addFavorite, getFavorites, removeFavorite } = require("../logic/favorites");
const { ensureProfile } = require('../security/security.js');

router.get("/",        ensureProfile, getFavorites);
router.post("/",       ensureProfile, addFavorite);
router.delete("/:id",  ensureProfile, removeFavorite);

module.exports = router;