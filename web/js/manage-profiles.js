let selectedAvatar = '🎬';

// Charge les profils en mode gestion
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

            profiles.forEach(profile => {
                const div = document.createElement('div');
                div.className = 'profile-card';
                div.innerHTML = `
                    <div class="profile-avatar">${profile.avatar}</div>
                    <p class="profile-name">${profile.nom}</p>
                    <button class="btn-delete-profile" data-id="${profile.id}">✕</button>
                `;

                // Supprime le profil
                div.querySelector('.btn-delete-profile').addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!confirm(`Delete profile "${profile.nom}" ?`)) return;
                    fetch(`/api/profiles/${profile.id}`, { method: 'DELETE' })
                        .then(res => res.json())
                        .then(data => {
                            if (data.error) return alert(data.error);
                            loadProfiles();
                        });
                });

                container.appendChild(div);
            });
        });
}

// Sélection avatar
document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedAvatar = opt.dataset.avatar;
    });
});

// Création profil
document.getElementById('create-btn').addEventListener('click', () => {
    const nom = document.getElementById('profile-name').value.trim();
    const message = document.getElementById('create-message');

    if (!nom) {
        message.textContent = 'Please enter a name';
        return;
    }

    fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, avatar: selectedAvatar })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                message.textContent = data.error;
                return;
            }
            document.getElementById('profile-name').value = '';
            message.textContent = '';
            loadProfiles();
        });
});

loadProfiles();