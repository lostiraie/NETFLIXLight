async function loadProfile() {
    const res = await fetch('/auth/me');
    const data = await res.json();

    if (!data.user) {
        window.location.href = 'login.html';
        return;
    }

    const user = data.user;
    document.getElementById('profile-pseudo').textContent = user.pseudo;
    document.getElementById('profile-email').textContent = user.email;

    // Affiche l'avatar du profil actuel
    const profileRes = await fetch('/api/profiles');
    const profiles = await profileRes.json();

// Cherche le profil actuel via /auth/me
    const meRes = await fetch('/auth/me');
    const meData = await meRes.json();

    if (meData.profile) {
        document.getElementById('profile-avatar').textContent = meData.profile.avatar || '🎬';
    }

    // Récupère toutes les données en parallèle
    const [favs, watchlist, history, reviews] = await Promise.all([
        fetch('/api/favorites').then(r => r.status === 401 ? [] : r.json()),
        fetch('/api/watchlist').then(r => r.status === 401 ? [] : r.json()),
        fetch('/api/history').then(r => r.status === 401 ? [] : r.json()),
        fetch('/api/reviews/my').then(r => r.status === 401 ? [] : r.json())
    ]);

    // Stats
    document.getElementById('stat-favoris').textContent = favs.length;
    document.getElementById('stat-watchlist').textContent = watchlist.length;
    document.getElementById('stat-history').textContent = history.length;
    document.getElementById('stat-reviews').textContent = reviews.length;

    // Historique récent — 6 derniers films
    const historyContainer = document.getElementById('recent-history');
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="profile-empty">No history yet.</p>';
    } else {
        history.slice(0, 6).forEach(film => {
            historyContainer.appendChild(createMiniCard(film));
        });
    }

    // Favoris récents — 6 derniers
    const favContainer = document.getElementById('recent-favorites');
    if (favs.length === 0) {
        favContainer.innerHTML = '<p class="profile-empty">No favorites yet.</p>';
    } else {
        favs.slice(0, 6).forEach(film => {
            favContainer.appendChild(createMiniCard(film));
        });
    }

    // Reviews récentes
    const reviewsContainer = document.getElementById('recent-reviews');
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="profile-empty">No reviews yet.</p>';
    } else {
        reviews.slice(0, 3).forEach(review => {
            if (!review.poster) return;
            const div = document.createElement('div');
            div.className = 'profile-review-card';
            div.innerHTML = `
                <img src="${review.poster}" alt="${review.titre}" class="profile-review-poster">
                <div class="profile-review-info">
                    <p class="profile-review-title">${review.titre}</p>
                    <p class="profile-review-stars">${'★'.repeat(review.note)}${'☆'.repeat(5 - review.note)}</p>
                    ${review.commentaire ? `<p class="profile-review-comment">"${review.commentaire}"</p>` : ''}
                    <p class="profile-review-date">${new Date(review.date).toLocaleDateString('fr-FR')}</p>
                </div>
            `;
            div.addEventListener('click', () => {
                window.location.href = `details.html?id=${review.filmId}&type=${review.type}`;
            });
            reviewsContainer.appendChild(div);
        });
    }
}

// Crée une mini carte film
function createMiniCard(film) {
    if (!film.poster) return document.createElement('div'); // ignore si pas de poster
    const div = document.createElement('div');
    div.className = 'profile-mini-card';
    div.innerHTML = `
        <img src="${film.poster}" alt="${film.titre || ''}">
        <div class="profile-mini-overlay">
            <p>${film.titre || ''}</p>
        </div>
    `;
    div.addEventListener('click', () => {
        window.location.href = `details.html?id=${film.id}&type=${film.type || 'movie'}`;
    });
    return div;
}

loadProfile();