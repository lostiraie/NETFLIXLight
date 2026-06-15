const path = require('path');
const { readJSON, writeJSON } = require('../services/storage.js');
const { randomUUID } = require('crypto');

const usersFile = path.join(__dirname, '../stockage/users.json');

// Récupère les profils d'un compte
exports.getProfiles = (req, res) => {
    const userId = req.session.user.id;
    const users = readJSON(usersFile);
    const user = users.find(u => u.id === userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user.profiles || []);
};

// Crée un profil
exports.createProfile = (req, res) => {
    const userId = req.session.user.id;
    const { nom } = req.body;

    if (!nom) return res.status(400).json({ error: 'Missing name' });

    const users = readJSON(usersFile);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    if (!users[userIndex].profiles) users[userIndex].profiles = [];

    // Max 5 profils
    if (users[userIndex].profiles.length >= 5)
        return res.status(400).json({ error: 'Maximum 5 profiles reached' });

    // Vérifie que le nom n'est pas déjà pris
    if (users[userIndex].profiles.find(p => p.nom === nom))
        return res.status(400).json({ error: 'Profile name already taken' });

    const newProfile = {
        id: randomUUID(),
        nom,
        avatar: req.body.avatar || '🎬'
    };

    users[userIndex].profiles.push(newProfile);
    writeJSON(usersFile, users);

    res.json({ message: 'Profile created ✓', profile: newProfile });
};

// Supprime un profil
exports.deleteProfile = (req, res) => {
    const userId = req.session.user.id;
    const profileId = req.params.id;
    const users = readJSON(usersFile);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    // Empêche de supprimer le dernier profil
    if (users[userIndex].profiles.length <= 1)
        return res.status(400).json({ error: 'Cannot delete last profile' });

    users[userIndex].profiles = users[userIndex].profiles.filter(p => p.id !== profileId);
    writeJSON(usersFile, users);

    res.json({ message: 'Profile deleted ✓' });
};

// Sélectionne un profil — stocke dans la session
exports.selectProfile = (req, res) => {
    const userId = req.session.user.id;
    const profileId = req.params.id;
    const users = readJSON(usersFile);
    const user = users.find(u => u.id === userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = (user.profiles || []).find(p => p.id === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Stocke le profil sélectionné dans la session
    req.session.profile = profile;
    res.json({ message: 'Profile selected ✓', profile });
};