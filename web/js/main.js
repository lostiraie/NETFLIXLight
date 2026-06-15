let favorites = [];

// Favoris
async function loadFavorites() {
    const res = await fetch("/api/favorites");
    if (res.status === 401) {
        favorites = []; // pas connecté, tableau vide
        return;
    }
    favorites = await res.json();
}

async function addFavorite(film) {
    await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(film)
    });
}

async function removeFavorite(id) {
    await fetch(`/api/favorites/${id}`, { method: "DELETE" });
}

// Création d'une carte film
function createCard(film) {
    const isFavorite = favorites.some(f => f.id === film.id);
    const div = document.createElement('div');
    div.className = "film-card";

    div.innerHTML = `
        <a href="details.html?id=${film.id}&type=${film.type || 'movie'}">
            <img src="${film.poster}" alt="${film.titre}" loading="lazy">
            <div class="film-overlay"><span>${film.titre}</span></div>
        </a>
        <button class="favorite-btn ${isFavorite ? "active" : ""}" data-id="${film.id}">
            ${isFavorite ? "★" : "☆"}
        </button>
        <h3>${film.titre}</h3>
        <div class="film-meta">
            <span>★ ${film.note ? film.note.toFixed(1) : "?"}</span>
            <span>${film.date_sortie ? film.date_sortie.slice(0,4) : ""}</span>
        </div>
        <div class="playlist-menu hidden" id="pm-${film.id}"></div>
    `;

    // Bouton favori
    const btn = div.querySelector(".favorite-btn");
    btn.addEventListener("click", async () => {
        const isActive = btn.classList.contains("active");
        if (isActive) {
            btn.classList.remove("active");
            btn.textContent = "☆";
            await removeFavorite(film.id);
        } else {
            btn.classList.add("active");
            btn.textContent = "★";
            await addFavorite({ id: film.id, titre: film.titre, poster: film.poster, type: film.type || 'movie' });
        }
    });

    return div;
}

// Création d'une section film
function createSection(titre, films) {
    const section = document.createElement('div');
    section.className = "film-section";
    section.innerHTML = `
        <h2 class="section-title">${titre}</h2>
        <div class="film-row-wrapper">
            <button class="row-arrow row-arrow-left">&#8592;</button>
            <div class="film-row"></div>
            <button class="row-arrow row-arrow-right">&#8594;</button>
        </div>
    `;

    const row = section.querySelector('.film-row');
    const btnLeft = section.querySelector('.row-arrow-left');
    const btnRight = section.querySelector('.row-arrow-right');

    films.forEach(film => row.appendChild(createCard(film)));

    btnLeft.addEventListener('click', () => row.scrollBy({ left: -600, behavior: 'smooth' }));
    btnRight.addEventListener('click', () => row.scrollBy({ left: 600, behavior: 'smooth' }));

    return section;
}

// Banière principal
async function loadHeroBanner(films) {
    const heroFilms = films.slice(0, 8);
    let current = 0;
    let timer = null;

    const backdrop      = document.getElementById('hero-backdrop');
    const title         = document.getElementById('hero-film-title');
    const synopsis      = document.getElementById('hero-synopsis');
    const meta          = document.getElementById('hero-meta');
    const btnPlay       = document.getElementById('hero-btn-play');
    const btnFav        = document.getElementById('hero-btn-fav');
    const dotsContainer = document.getElementById('hero-dots');
    const btnPrev       = document.getElementById('hero-prev');
    const btnNext       = document.getElementById('hero-next');

    // Crée les points de navigation
    heroFilms.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('hero-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => { resetTimer(); showFilm(i); });
        dotsContainer.appendChild(dot);
    });

    btnPrev.addEventListener('click', () => {
        resetTimer();
        showFilm((current - 1 + heroFilms.length) % heroFilms.length);
    });
    btnNext.addEventListener('click', () => {
        resetTimer();
        showFilm((current + 1) % heroFilms.length);
    });

    function resetTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(() => showFilm((current + 1) % heroFilms.length), 15000);
    }

    // Affiche un film dans la banière
    async function showFilm(index) {
        current = index;
        const film = heroFilms[index];

        // Récupère les détails du film
        const detailRes = await fetch(`/api/movie/${film.id}`);
        const detail = await detailRes.json();

        // Met à jour la bannière
        backdrop.style.backgroundImage = `url('${film.poster.replace('w500', 'w1280')}')`;
        title.textContent = film.titre;
        synopsis.textContent = detail.synopsis || '';
        meta.innerHTML = `
            <span>★ ${film.note ? film.note.toFixed(1) : '?'}</span>
            <span>${film.date_sortie ? film.date_sortie.slice(0,4) : ''}</span>
            <span>${detail.genres ? detail.genres.slice(0,2).join(' · ') : ''}</span>
        `;

        btnPlay.href = `details.html?id=${film.id}`;

        btnFav.textContent = favorites.some(f => f.id === film.id) ? '✓ In my list': '+ My list';
        btnFav.onclick = async () => {
            await addFavorite({ id: film.id, titre: film.titre, poster: film.poster });
            btnFav.textContent = '✓ Dans ma liste';
        };

        document.querySelectorAll('.hero-dot').forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
    }

    showFilm(0);
    resetTimer();
}

// Chargement de la page
async function loadPage() {
    await loadFavorites();
    const container = document.getElementById("films-container");

    const labels = {
        action: "▶ Action",
        comedy: "▶ Comedy",
        horror: "▶ Horror",
        scifi:  "▶ Science-Fiction",
        drama:  "▶ Drama"
    };

    // Charge les films en tendance
    const trendingData = await fetch('/api/trending').then(r => r.json());
    if (trendingData.films) {
        await loadHeroBanner(trendingData.films);
        container.appendChild(createSection("▶ Trends of the week", trendingData.films.slice(0, 20)));
    }

    // Charge les films les mieux notés
    const topData = await fetch('/api/toprated').then(r => r.json());
    if (topData.films) {
        container.appendChild(createSection("▶ Top rated", topData.films));
    }

    // Charge les films par genre
    const genreData = await fetch('/api/genres').then(r => r.json());
    if (genreData.categories) {
        genreData.categories.forEach(cat => {
            container.appendChild(createSection(labels[cat.categorie] || cat.categorie, cat.films));
        });
    }

    // Charge les séries tendances
    const seriesData = await fetch('/api/trending/series').then(r => r.json()).catch(() => ({}));
    if (seriesData.films) {
        container.appendChild(createSection("▶ Trending Series", seriesData.films));
    }

    // Barre de recherche
    document.getElementById("fav-search").addEventListener("input", function () {
        const recherche = this.value.toLowerCase();
        document.querySelectorAll(".film-card").forEach(card => {
            const titre = card.querySelector("h3").textContent.toLowerCase();
            card.style.display = titre.includes(recherche) ? "block" : "none";
        });
    });
}

loadPage();