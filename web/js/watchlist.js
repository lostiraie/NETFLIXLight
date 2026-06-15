const container = document.getElementById('watchlist-container');
const empty = document.getElementById('watchlist-empty');

function loadWatchlist() {
    container.innerHTML = '';

    fetch('/api/watchlist')
        .then(res => {
            if (res.status === 401) {
                window.location.href = 'login.html';
                return null;
            }
            return res.json();
        })
        .then(films => {
            if (!films) return;

            document.getElementById('watchlist-count').textContent =
                films.length === 0 ? 'No film' :
                    films.length === 1 ? '1 film' : `${films.length} films`;

            if (films.length === 0) {
                empty.classList.remove('hidden');
                return;
            }

            empty.classList.add('hidden');

            films.forEach(film => {
                const card = document.createElement('div');
                card.classList.add('fav-card');

                card.innerHTML = `
                    <img class="fav-poster" src="${film.poster}" alt="${film.titre}">
                    <div class="fav-number">🔔</div>
                    <div class="fav-overlay">
                        <p class="fav-movie-title">${film.titre}</p>
                        <div class="fav-overlay-btns">
                            <a href="details.html?id=${film.id}&type=${film.type}">Details</a>
                            <button class="fav-remove">✕ Remove</button>
                        </div>
                    </div>
                `;

                card.querySelector('.fav-remove').addEventListener('click', () => {
                    removeFromWatchlist(film.id);
                });

                container.appendChild(card);
            });

            // Barre de recherche
            document.getElementById('watchlist-search').addEventListener('input', function () {
                const recherche = this.value.toLowerCase();
                document.querySelectorAll('.fav-card').forEach(card => {
                    const titre = card.querySelector('.fav-movie-title').textContent.toLowerCase();
                    card.style.display = titre.includes(recherche) ? 'block' : 'none';
                });
            });
        })
        .catch(err => console.error('Watchlist loading error:', err));
}

function removeFromWatchlist(id) {
    fetch(`/api/watchlist/${id}`, { method: 'DELETE' })
        .then(res => {
            if (res.ok) loadWatchlist();
        })
        .catch(err => console.error('Removal error:', err));
}

loadWatchlist();