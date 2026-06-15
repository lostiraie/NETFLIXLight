const films = [];
let current = 0;
let timer = null;

fetch('/api/trending')
    .then(r => r.json())
    .then(data => {
        if (!data.films || data.films.length === 0) return;

        const heroFilms = data.films.slice(0, 5);
        heroFilms.forEach(f => films.push(f));

        // Crée les dots
        const indicator = document.getElementById('film-indicator');
        const titleEl = document.createElement('p');
        titleEl.className = 'film-indicator-title';
        titleEl.textContent = 'Now showing';

        const dotsEl = document.createElement('div');
        dotsEl.className = 'film-indicator-dots';

        heroFilms.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'film-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => { clearInterval(timer); showFilm(i); startTimer(); });
            dotsEl.appendChild(dot);
        });

        indicator.appendChild(titleEl);
        indicator.appendChild(dotsEl);

        function showFilm(index) {
            current = index;
            const film = heroFilms[index];
            const bg = document.getElementById('home-hero-bg');
            bg.style.backgroundImage = `url('${film.poster.replace('w500', 'original')}')`;

            document.querySelectorAll('.film-dot').forEach((d, i) => {
                d.classList.toggle('active', i === index);
            });

            titleEl.textContent = film.titre;
        }

        function startTimer() {
            timer = setInterval(() => {
                showFilm((current + 1) % heroFilms.length);
            }, 6000);
        }

        showFilm(0);
        startTimer();
    })
    .catch(() => {});