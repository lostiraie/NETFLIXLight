const path = require('path');
const bcrypt = require('bcryptjs');
const { readJSON, writeJSON } = require('../services/storage.js');
const { randomUUID } = require('crypto');

// Fichier qui stocke les utilisateurs
const usersFile = path.join(__dirname, '../stockage/users.json');

// Inscription
async function registerUser(req, res) {
    const { email, pseudo, password } = req.body;

    // Vérifie que les champs sont remplis
    if (!email || !pseudo || !password)
        return res.status(400).json({ error: "Missing fields" });

    const users = readJSON(usersFile);

    // Vérifie que l'email n'est pas déjà utilisé
    if (users.find(u => u.email === email))
        return res.status(400).json({ error: "Existing user" });

    // Chiffre le mot de passe avant de le sauvegarder
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ajoute le nouvel utilisateur
    users.push({
        id: randomUUID(),
        email,
        pseudo,
        password: hashedPassword,
    });

    writeJSON(usersFile, users);

    // Démarre la session
    req.session.user = { id: users[users.length - 1].id, email, pseudo };
    res.json({ message: "Successful signup", user: { email, pseudo } });
}


// Connexion
async function loginUser(req, res) {
    const { email, password } = req.body;
    const users = readJSON(usersFile);

    // Cherche l'utilisateur par email
    const user = users.find(u => u.email === email || u.pseudo === pseudo);
    const isValid = user && await bcrypt.compare(password, user.password);

    if (!user || !isValid)
        return res.status(400).json({ error: "Incorrect email or password" });

    // Démarre la session
    req.session.user = { id: user.id, email: user.email, pseudo: user.pseudo };
    res.json({ message: "Login successful", user: { email: user.email, pseudo: user.pseudo } });
}

// Déconnexion
// APRÈS
function logoutUser(req, res) {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Logout error' });
        res.json({ success: true });
    });
}

module.exports = { registerUser, loginUser, logoutUser, };