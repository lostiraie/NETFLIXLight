const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

// Inscription
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Récupère les données du formulaire
        const data = {
            pseudo:   registerForm.pseudo.value,
            email:    registerForm.email.value,
            password: registerForm.password.value,
        };

        try {
            // Envoie les données au serveur
            const res = await fetch('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            document.getElementById('register-message').textContent = result.message || result.error;

            // Si l'inscription est réussie, ca sauvegarde et redirige vers la page des films
            if (result.user) {
                window.location.href = '/profiles.html';
            }
        } catch (err) {
            document.getElementById('register-message').textContent = 'Sever error';
        }
    });
}

// Connexion
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Récupère les données du formulaire
        const data = {
            pseudo:   loginForm.pseudo.value,
            email:    loginForm.email.value,
            password: loginForm.password.value
        };

        try {
            // Envoie les données au serveur
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            document.getElementById('login-message').textContent = result.message || result.error;

            // Connexion réussie ça sauvegarde et redirige vers la page des films
            if (result.user) {
                window.location.href = '/profiles.html';
            }
        } catch (err) {
            document.getElementById('login-message').textContent = 'Server error';
        }
    });
}

// Vérification de la connexion
fetch('/auth/me')
    .then(res => res.json())
    .then(data => {
        if (data.user) {
            // Affiche déconnexion et profil
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.classList.remove('hidden');

            const profileLink = document.getElementById('user-profile-link');
            if (profileLink) {
                profileLink.classList.remove('hidden');
                profileLink.textContent = data.user.pseudo;
            }

            // Cache login et signup
            const loginLink = document.querySelector('a[href="login.html"]');
            const signupLink = document.querySelector('a[href="signup.html"]');
            if (loginLink) loginLink.classList.add('hidden');
            if (signupLink) signupLink.classList.add('hidden');

            // Affiche les liens si connecté
            const favLink = document.getElementById('favorites-link');
            const histLink = document.getElementById('history-link');
            const watchLink = document.getElementById('watchlist-link');
            if (favLink) favLink.classList.remove('hidden');
            if (histLink) histLink.classList.remove('hidden');
            if (watchLink) watchLink.classList.remove('hidden');

        } else {
            // Cache profil et déconnexion si pas connecté
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.classList.add('hidden');

            const profileLink = document.getElementById('user-profile-link');
            if (profileLink) profileLink.classList.add('hidden');

            // Cache les liens si pas connecté
            const favLink = document.getElementById('favorites-link');
            const histLink = document.getElementById('history-link');
            const watchLink = document.getElementById('watchlist-link');
            if (favLink) favLink.classList.add('hidden');
            if (histLink) histLink.classList.add('hidden');
            if (watchLink) watchLink.classList.add('hidden');
        }

        // Gère les séparateurs | selon ce qui est visible
        document.querySelectorAll('.sep').forEach(sep => {
            const prev = sep.previousElementSibling;
            const next = sep.nextElementSibling;
            const prevHidden = !prev || prev.classList.contains('hidden');
            const nextHidden = !next || next.classList.contains('hidden');
            sep.style.display = (prevHidden || nextHidden) ? 'none' : '';
        });
    });

// Déconnexion
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        fetch('/auth/logout', { method: 'POST' })
            .then(() => {
                window.location.href = '/films';
            });
    });
}