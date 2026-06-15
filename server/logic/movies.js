const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { API_KEY, BASE_URL } = require('../stockage/tmdb.js');

// Films tendances
async function getTrending(req, res) {
    try {
        const pages = [1, 2, 3, 4, 5, 6, 7];

        const reponses = await Promise.all(
            pages.map(page =>
                fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`)
                    .then(r => r.json())
            )
        );

        const films = reponses
            .flatMap(data => data.results)
            .filter(film => film.poster_path)
            .map(film => ({
                id: film.id,
                titre: film.title || film.name, // séries ont name pas title
                poster: `https://image.tmdb.org/t/p/w500${film.poster_path}`,
                date_sortie: film.release_date || film.first_air_date,
                note: film.vote_average,
                type: film.media_type // ← TMDB retourne 'movie' ou 'tv' ici
            }))

        res.json({ films });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Détails d'un film
async function getMovieDetails(req, res) {
    const id = req.params.id;
    try {
        const reponse = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=fr-FR`);
        const film = await reponse.json();

        const creditsReponse = await fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`);
        const credits = await creditsReponse.json();
        const acteurs = (credits.cast || []).slice(0, 10).map(a => ({
            nom: a.name,
            photo: a.profile_path ? `https://image.tmdb.org/t/p/w185${a.profile_path}` : null,
            personnage: a.character
        }));

        res.json({
            id: film.id,
            titre: film.title,
            synopsis: film.overview,
            poster: film.poster_path ? `https://image.tmdb.org/t/p/w500${film.poster_path}` : null,
            date_sortie: film.release_date,
            note: film.vote_average,
            genres: film.genres.map(g => g.name),
            acteurs: acteurs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Films par genre
async function getByGenre(req, res) {
    const genres = {
        action: 28,
        comedy: 35,
        horror: 27,
        scifi: 878,
        drama: 18
    };

    try {
        const resultats = await Promise.all(
            Object.entries(genres).map(([nom, id]) =>
                fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${id}&sort_by=popularity.desc&language=fr-FR`)
                    .then(r => r.json())
                    .then(data => ({
                        categorie: nom,
                        films: data.results
                            .filter(f => f.poster_path)
                            .slice(0, 20)
                            .map(film => ({
                                id: film.id,
                                titre: film.title,
                                poster: `https://image.tmdb.org/t/p/w500${film.poster_path}`,
                                date_sortie: film.release_date,
                                note: film.vote_average
                            }))
                    }))
            )
        );

        res.json({ categories: resultats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Films les mieux notés
async function getTopRated(req, res) {
    try {
        const reponse = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=fr-FR`);
        const data = await reponse.json();

        const films = data.results
            .filter(f => f.poster_path)
            .slice(0, 20)
            .map(film => ({
                id: film.id,
                titre: film.title,
                poster: `https://image.tmdb.org/t/p/w500${film.poster_path}`,
                date_sortie: film.release_date,
                note: film.vote_average
            }));

        res.json({ films });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Trailer d'un film
async function getMovieTrailer(req, res) {
    const id = req.params.id;
    try {
        const reponse = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=fr-FR`);
        const data = await reponse.json();
        let trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

        if (!trailer) {
            const reponseEn = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`);
            const dataEn = await reponseEn.json();
            trailer = dataEn.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        }

        res.json({ trailerKey: trailer ? trailer.key : null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Séries tendances
async function getTrendingSeries(req, res) {
    try {
        const reponse = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=fr-FR`);
        const data = await reponse.json();

        const series = data.results
            .filter(s => s.poster_path)
            .slice(0, 20)
            .map(s => ({
                id: s.id,
                titre: s.name,
                poster: `https://image.tmdb.org/t/p/w500${s.poster_path}`,
                date_sortie: s.first_air_date,
                note: s.vote_average,
                type: 'serie'
            }));

        res.json({ films: series });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Détails d'une série
async function getSeriesDetails(req, res) {
    const id = req.params.id;
    try {
        const reponse = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=fr-FR`);
        const serie = await reponse.json();

        const creditsReponse = await fetch(`${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}`);
        const credits = await creditsReponse.json();
        const acteurs = (credits.cast || []).slice(0, 10).map(a => ({
            nom: a.name,
            photo: a.profile_path ? `https://image.tmdb.org/t/p/w185${a.profile_path}` : null,
            personnage: a.character
        }));

        res.json({
            id: serie.id,
            titre: serie.name,
            synopsis: serie.overview,
            poster: serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : null,
            date_sortie: serie.first_air_date,
            note: serie.vote_average,
            genres: (serie.genres || []).map(g => g.name),
            acteurs: acteurs,
            saisons: serie.number_of_seasons,
            episodes: serie.number_of_episodes,
            type: 'serie'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Trailer d'une série
async function getSeriesTrailer(req, res) {
    const id = req.params.id;
    try {
        const reponse = await fetch(`${BASE_URL}/tv/${id}/videos?api_key=${API_KEY}&language=fr-FR`);
        const data = await reponse.json();
        let trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

        if (!trailer) {
            const reponseEn = await fetch(`${BASE_URL}/tv/${id}/videos?api_key=${API_KEY}&language=en-US`);
            const dataEn = await reponseEn.json();
            trailer = dataEn.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        }

        res.json({ trailerKey: trailer ? trailer.key : null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Films similaires
async function getSimilarMovies(req, res) {
    const id = req.params.id;
    const type = req.params.type; // 'movie' ou 'serie'
    const endpoint = type === 'serie' ? 'tv' : 'movie';

    try {
        const reponse = await fetch(`${BASE_URL}/${endpoint}/${id}/similar?api_key=${API_KEY}&language=fr-FR`);
        const data = await reponse.json();

        const films = (data.results || [])
            .filter(f => f.poster_path)
            .slice(0, 10)
            .map(f => ({
                id: f.id,
                titre: f.title || f.name,
                poster: `https://image.tmdb.org/t/p/w500${f.poster_path}`,
                date_sortie: f.release_date || f.first_air_date,
                note: f.vote_average,
                type: type
            }));

        res.json({ films });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getTrending, getMovieDetails, getByGenre, getTopRated, getMovieTrailer, getTrendingSeries, getSeriesDetails, getSeriesTrailer, getSimilarMovies };