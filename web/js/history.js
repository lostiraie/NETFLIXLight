const container = document.getElementById('history-container');
const empty = document.getElementById('history-empty');

function loadHistory() {
    container.innerHTML = '';

    fetch('/api/history')
        .then(res => {
            if (res.status === 401) {
                window.location.href = 'login.html';
                return null;
            }
            return res.json();
        })
        .then(films => {
            if (!films) return;

            // Met à jour le compteur
            document.getElementById('history-count').textContent =
                films.length === 0 ? 'No film' :
                    films.length === 1 ? '1 film' : `${films.length} films`;

            if (films.length === 0) {
                empty.classList.remove('hidden');
                return;
            }

            empty.classList.add('hidden');

            films.forEach(film => {
                if (!film.id || !film.poster) return;
                const card = document.createElement('div');
                card.classList.add('fav-card');

                // Formate la date
                const date = new Date(film.date).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });

                card.innerHTML = `
                    <img class="fav-poster" src="${film.poster}" alt="${film.titre}">
                    <div class="fav-overlay">
                        <p class="fav-movie-title">${film.titre}</p>
                        <p class="history-date">${date}</p>
                        <div class="fav-overlay-btns">
                            <a href="details.html?id=${film.id}&type=${film.type}">Details</a>
                        </div>
                    </div>
                `;

                container.appendChild(card);
            });

            // Barre de recherche
            document.getElementById('history-search').addEventListener('input', function () {
                const recherche = this.value.toLowerCase();
                document.querySelectorAll('.fav-card').forEach(card => {
                    const titre = card.querySelector('.fav-movie-title').textContent.toLowerCase();
                    card.style.display = titre.includes(recherche) ? 'block' : 'none';
                });
            });
        })
        .catch(err => console.error('History loading error:', err));
}

// Vider l'historique
document.getElementById('clear-history-btn').addEventListener('click', () => {
    if (!confirm('Clear all history ?')) return;
    fetch('/api/history', { method: 'DELETE' })
        .then(() => loadHistory());
});

loadHistory();