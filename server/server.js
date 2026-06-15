// Les imports
const express = require('express');              //Utiliser Express.js
const path = require('path');                   //Permet de gerer les chemins de fichiers
const session = require('express-session');     //Gere les sessions
const dotenv = require('dotenv');               //Permet de charger la clé API et Mots de passe dans le fichier .env
const WEB = path.join (__dirname, '../web');

// Charge le fichier (.env)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Permet de lire le JSON envoyé par le navigateur
app.use(express.json());

// Gère les sessions, pour savoir qui est connecter
app.use(session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: false
}));

// Pages
app.get('/', (req, res) => res.sendFile(`${WEB}/home.html`)); // Page home
app.get('/films', (req, res) => res.sendFile(`${WEB}/index.html`)); // Page des films
app.get('/profiles', (req, res) => res.sendFile(`${WEB}/profiles.html`));

// Routes
app.use('/api', require('./routes/movies.js')); // Routes films
app.use('/api/watchlist', require('./routes/watchlist.js'));
app.use('/api/history', require('./routes/history.js'));
app.use('/api/reviews', require('./routes/reviews.js'));
app.use('/api/profiles', require('./routes/profiles.js'));
app.use('/api/favorites', require('./routes/favorites.js')); // Routes favoris

// AUTHENTIFICATION
app.use('/auth', require('./routes/authentification.js')); // Routes connexion/inscription

// Permet de servir les fichiers (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../web')));

// PAGE ERREUR 404
app.use((req, res) => res.status(404).sendFile(`${WEB}/error.html`));

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`🎬 NetflixLight runs on http://localhost:${PORT}`);
});