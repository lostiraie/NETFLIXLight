const express = require('express');
const router = express.Router();
const { getTrending, getMovieDetails, getByGenre, getTopRated, getMovieTrailer, getTrendingSeries, getSeriesDetails, getSeriesTrailer, getSimilarMovies } = require('../logic/movies.js');


// Routes films

router.get('/trending',          getTrending);       // Films en tendance
router.get('/toprated',          getTopRated);       // Films les mieux notés
router.get('/genres',            getByGenre);        // Films genre
router.get('/movie/:id',         getMovieDetails);   // Détails d'un film
router.get('/movie/:id/trailer', getMovieTrailer);   // Trailer d'un film
router.get('/trending/series', getTrendingSeries);
router.get('/serie/:id',         getSeriesDetails);
router.get('/serie/:id/trailer', getSeriesTrailer);
router.get('/similar/:type/:id', getSimilarMovies);

module.exports = router;