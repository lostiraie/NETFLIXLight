const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const rawType = params.get("type") || "movie";
const type = (rawType === 'tv' || rawType === 'serie') ? 'serie' : 'movie';
const container = document.getElementById("film-detail");

if (!id) {
    container.innerHTML = "<p>Movie not found</p>";
} else {
    const detailUrl = type === 'serie' ? `/api/serie/${id}` : `/api/movie/${id}`;
    const trailerUrl = type === 'serie' ? `/api/serie/${id}/trailer` : `/api/movie/${id}/trailer`;

    Promise.all([
        fetch(detailUrl).then(r => r.json()),
        fetch(trailerUrl).then(r => r.json())
    ])
        .then(([film, trailerData]) => {
            const trailerKey = trailerData.trailerKey;

            // Ajoute à l'historique si connecté
            fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: film.id,
                    titre: film.titre,
                    poster: film.poster,
                    type: type
                })
            }).catch(() => {});

            // Génère le HTML
            container.innerHTML = `
            <div class="detail-backdrop"
                ${film.poster ? `style="background-image: url('${film.poster.replace('w500','w1280')}')"` : ''}>
            </div>
            <div class="detail-content">
                <div class="detail-left">
                    ${film.poster ? `<img class="detail-poster" src="${film.poster}" alt="${film.titre}">` : ""}
                </div>
                <div class="detail-right">
                    <h1 class="detail-title">${film.titre}</h1>
                    <div class="detail-meta">
                        <span>★ ${film.note ? film.note.toFixed(1) : "?"}/10</span>
                        <span>${film.date_sortie ? film.date_sortie.slice(0,4) : ""}</span>
                        <span>${film.genres?.join(" · ")}</span>
                        ${film.saisons ? `<span>${film.saisons} saison${film.saisons > 1 ? 's' : ''}</span>` : ''}
                        ${film.episodes ? `<span>${film.episodes} épisodes</span>` : ''}
                    </div>
                    <p class="detail-synopsis">${film.synopsis || ''}</p>

                    <!-- Acteurs avec photos et flèches -->
                    <div class="detail-cast">
                        <span class="detail-label">Actors</span>
                        <div class="cast-wrapper">
                            <button class="cast-arrow" id="cast-prev">&#8592;</button>
                            <div class="cast-grid" id="cast-grid">
                                ${(film.acteurs || []).map(a => `
                                    <div class="cast-card">
                                        ${a.photo
                ? `<img src="${a.photo}" alt="${a.nom}" class="cast-photo">`
                : `<div class="cast-photo-placeholder">👤</div>`
            }
                                        <p class="cast-nom">${a.nom}</p>
                                        <p class="cast-role">${a.personnage || ''}</p>
                                    </div>
                                `).join('')}
                            </div>
                            <button class="cast-arrow" id="cast-next">&#8594;</button>
                        </div>
                    </div>

                    ${trailerKey ? `
                    <div class="detail-trailer">
                        <span class="detail-label">Trailer</span>
                        <div class="trailer-frame">
                            <iframe
                                src="https://www.youtube.com/embed/${trailerKey}"
                                frameborder="0"
                                allow="autoplay; encrypted-media"
                                allowfullscreen>
                            </iframe>
                        </div>
                    </div>` : ''}

                    <!-- Bouton watchlist -->
                    <div class="detail-watchlist">
                        <button id="watchlist-btn" class="btn-watchlist">🔔 Watch later</button>
                    </div>

                    <!-- Système de notes -->
                    <div class="detail-reviews">
                        <span class="detail-label">My review</span>
                        <div class="stars-input" id="stars-input">
                            <span class="star" data-value="1">★</span>
                            <span class="star" data-value="2">★</span>
                            <span class="star" data-value="3">★</span>
                            <span class="star" data-value="4">★</span>
                            <span class="star" data-value="5">★</span>
                        </div>
                        <textarea id="review-comment" class="review-textarea" placeholder="Leave a comment..."></textarea>
                        <button id="review-submit" class="btn-review">Submit review</button>
                        <div id="reviews-list" class="reviews-list"></div>
                    </div>

                    <!-- Films similaires -->
                    <div class="detail-similar">
                        <span class="detail-label">Similar</span>
                        <div id="similar-container" class="similar-row"></div>
                    </div>

                </div>
            </div>
        `;

            // ── Flèches acteurs ──
            const castGrid = document.getElementById('cast-grid');
            document.getElementById('cast-prev').addEventListener('click', () => {
                castGrid.scrollBy({ left: -300, behavior: 'smooth' });
            });
            document.getElementById('cast-next').addEventListener('click', () => {
                castGrid.scrollBy({ left: 300, behavior: 'smooth' });
            });

            // ── Watchlist ──
            const watchlistBtn = document.getElementById('watchlist-btn');

            fetch('/api/watchlist')
                .then(res => res.status === 401 ? [] : res.json())
                .then(watchlist => {
                    const dejaDedans = watchlist.some(f => String(f.id) === String(id));
                    if (dejaDedans) {
                        watchlistBtn.textContent = '✓ In watchlist';
                        watchlistBtn.classList.add('active');
                    }
                });

            watchlistBtn.addEventListener('click', () => {
                fetch('/api/watchlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: film.id,
                        titre: film.titre,
                        poster: film.poster,
                        type: type
                    })
                }).then(() => {
                    watchlistBtn.textContent = '✓ In watchlist';
                    watchlistBtn.classList.add('active');
                });
            });

            // ── Notes ──
            function renderReviews(reviews) {
                const list = document.getElementById('reviews-list');
                if (reviews.length === 0) {
                    list.innerHTML = '<p class="no-reviews">No reviews yet.</p>';
                    return;
                }
                list.innerHTML = reviews.map(r => `
                <div class="review-card">
                    <div class="review-header">
                        <span class="review-pseudo">${r.pseudo}</span>
                        <span class="review-stars">${'★'.repeat(r.note)}${'☆'.repeat(5 - r.note)}</span>
                        <span class="review-date">${new Date(r.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    ${r.commentaire ? `<p class="review-comment">${r.commentaire}</p>` : ''}
                </div>
            `).join('');
            }

            fetch(`/api/reviews/${id}`)
                .then(res => res.json())
                .then(reviews => renderReviews(reviews));

            let selectedNote = 0;
            const stars = document.querySelectorAll('.star');

            stars.forEach(star => {
                star.addEventListener('mouseover', () => {
                    const val = parseInt(star.dataset.value);
                    stars.forEach((s, i) => s.classList.toggle('hovered', i < val));
                });

                star.addEventListener('mouseout', () => {
                    stars.forEach((s, i) => {
                        s.classList.toggle('active', i < selectedNote);
                        s.classList.remove('hovered');
                    });
                });

                star.addEventListener('click', () => {
                    selectedNote = parseInt(star.dataset.value);
                    stars.forEach((s, i) => s.classList.toggle('active', i < selectedNote));
                });
            });

            fetch('/api/reviews/my')
                .then(res => res.status === 401 ? [] : res.json())
                .then(myReviews => {
                    const existing = myReviews.find(r => String(r.filmId) === String(id));
                    if (existing) {
                        selectedNote = existing.note;
                        stars.forEach((s, i) => s.classList.toggle('active', i < selectedNote));
                        document.getElementById('review-comment').value = existing.commentaire || '';
                        document.getElementById('review-submit').textContent = 'Update review';
                    }
                });

            document.getElementById('review-submit').addEventListener('click', () => {
                if (selectedNote === 0) return alert('Please select a rating !');
                const commentaire = document.getElementById('review-comment').value;

                fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filmId: id,
                        titre: film.titre,
                        poster: film.poster,
                        type: type,
                        note: selectedNote,
                        commentaire
                    })
                }).then(() => {
                    document.getElementById('review-submit').textContent = 'Update review';
                    fetch(`/api/reviews/${id}`)
                        .then(res => res.json())
                        .then(reviews => renderReviews(reviews));
                });
            });

            // ── Films similaires ──
            fetch(`/api/similar/${type}/${id}`)
                .then(res => res.json())
                .then(data => {
                    const similarContainer = document.getElementById('similar-container');
                    if (!data.films || data.films.length === 0) {
                        similarContainer.innerHTML = '<p class="no-reviews">No similar content found.</p>';
                        return;
                    }
                    data.films.forEach(similarFilm => {
                        const card = document.createElement('div');
                        card.className = 'similar-card';
                        card.innerHTML = `
                        <img src="${similarFilm.poster}" alt="${similarFilm.titre}">
                        <div class="similar-overlay">
                            <p>${similarFilm.titre}</p>
                            <span>★ ${similarFilm.note ? similarFilm.note.toFixed(1) : '?'}</span>
                        </div>
                    `;
                        card.addEventListener('click', () => {
                            window.location.href = `details.html?id=${similarFilm.id}&type=${similarFilm.type}`;
                        });
                        similarContainer.appendChild(card);
                    });
                })
                .catch(() => {});

        })
        .catch(err => {
            container.innerHTML = "<p>Loading error</p>";
            console.error(err);
        });
}