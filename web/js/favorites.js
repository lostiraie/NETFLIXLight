const container = document.getElementById("favorites-container");
const empty = document.getElementById("fav-empty");

// Charger les favoris
function loadFavorites() {
    container.innerHTML = "";

    fetch("/api/favorites")
        .then(res => {
            if (res.status === 401) {
                window.location.href = 'login.html';
                return null;
            }
            return res.json();
        })
        .then(films => {
            if (!films) return;

            // Met à jour le compteur de films
            document.getElementById('fav-count').textContent =
                films.length === 0 ? "Aucun film" :
                    films.length === 1 ? "1 film" : `${films.length} films`;

            // Si il y a aucun favori ça affiche le message vide
            if (films.length === 0) {
                empty.classList.remove("hidden");
                return;
            }

            empty.classList.add("hidden");

            // Crée une carte pour chaques films favoris
            films.forEach((film, index) => {
                const card = document.createElement("div");
                card.classList.add("fav-card");
                card.dataset.id = film.id;

                card.innerHTML = `
                    <img class="fav-poster" src="${film.poster}" alt="${film.titre}">
                    <div class="fav-number">${index + 1}</div>
                    <div class="fav-overlay">
                        <p class="fav-movie-title">${film.titre}</p>
                        <div class="fav-overlay-btns">
                            <a href="details.html?id=${film.id}&type=${film.type || 'movie'}">Details</a>
                            <button class="fav-remove">✕ Delete </button>
                        </div>
                    </div>
                `;

                // Bouton supprimer
                card.querySelector(".fav-remove").addEventListener("click", () => {
                    removeFavorite(film.id);
                });

                container.appendChild(card);
            });

            // Barre de recherche
            document.getElementById("fav-search").addEventListener("input", function () {
                const recherche = this.value.toLowerCase();
                document.querySelectorAll(".fav-card").forEach(card => {
                    const titre = card.querySelector(".fav-movie-title").textContent.toLowerCase();
                    // Affiche ou cache la carte selon la recherche
                    card.style.display = titre.includes(recherche) ? "block" : "none";
                });
            });
        })
        .catch(err => console.error("Favorites loading error :", err));
}

// Supprimer un favoris
function removeFavorite(id) {
    fetch(`/api/favorites/${id}`, { method: "DELETE" })
        .then(res => {
            if (res.ok) loadFavorites(); // Recharge la liste après suppression
        })
        .catch(err => console.error("Deletion error :", err));
}

// Charge les favoris au démarrage
loadFavorites();