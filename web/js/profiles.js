// Charge les profils
function loadProfiles() {
    fetch('/api/profiles')
        .then(res => {
            if (res.status === 401) {
                window.location.href = 'login.html';
                return null;
            }
            return res.json();
        })
        .then(profiles => {
            if (!profiles) return;

            const container = document.getElementById('profiles-container');
            container.innerHTML = '';

            // Si aucun profil, redirige vers la création
            if (profiles.length === 0) {
                window.location.href = 'manage-profiles.html';
                return;
            }

            profiles.forEach(profile => {
                const div = document.createElement('div');
                div.className = 'profile-card';
                div.innerHTML = `
                    <div class="profile-avatar">${profile.avatar}</div>
                    <p class="profile-name">${profile.nom}</p>
                `;

                // Sélectionne le profil au clic
                div.addEventListener('click', () => {
                    fetch(`/api/profiles/select/${profile.id}`, { method: 'POST' })
                        .then(res => res.json())
                        .then(() => {
                            window.location.href = '/films';
                        });
                });

                container.appendChild(div);
            });
        });
}

// Bouton gérer les profils
document.getElementById('manage-btn').addEventListener('click', () => {
    window.location.href = 'manage-profiles.html';
});

loadProfiles();