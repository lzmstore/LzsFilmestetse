const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNWYzYTgxMjg4YjU2MzIzOTQ4ZGMwMDE0NzA5MzhmNSIsInN1YiI6IjY0YzZjN2E4ZWVjNWI1MDBhZDAyYTc5ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aUs9966NKFNZyQLqPyN2Ik_RXJCVLP_-Jyppvy9p2iY';

const btnSearch = document.getElementById('btn-search');
const inputSearch = document.getElementById('input-search');
const resultsMovies = document.getElementById('result-movies');
const popup = document.getElementById('movie-popup');
const popupQuestion = document.getElementById('popup-question');
const popupYesButton = document.getElementById('popup-yes');
const popupNoButton = document.getElementById('popup-no');
const player = document.getElementById('player');

btnSearch.addEventListener('click', async () => {
    const query = inputSearch.value.trim();
    if (!query) return;

    btnSearch.disabled = true;
    resultsMovies.innerHTML = '<tr id="loading"><td colspan="2">Carregando...</td></tr>';

    try {
        const data = await searchMedia(query);
        document.getElementById('loading').remove();
        insertData(data);
    } catch (error) {
        console.error(error);
        resultsMovies.innerHTML = '<tr><td colspan="2">Erro ao carregar resultados</td></tr>';
    }

    btnSearch.disabled = false;
});

function onClickMedia(event) {
    const selectedRow = event.target.closest('tr');
    const selectedId = selectedRow.getAttribute('data-media-id');
    const selectedType = selectedRow.getAttribute('data-media-type');

    if (selectedId) {
        if (selectedType === 'tv') {
            showSeasonPopup(selectedId);
        } else {
            setPlayer(selectedId); // Para filmes, apenas chama o player
        }
    }
}

function showSeasonPopup(tvId) {
    fetch(`https://api.themoviedb.org/3/tv/${tvId}?language=pt-BR`, {
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })
    .then(res => res.json())
    .then(data => {
        const seasonPopupContent = document.getElementById('season-popup-content');
        seasonPopupContent.innerHTML = '<h3>Selecione uma Temporada</h3>';
        
        data.seasons.forEach(season => {
            const btn = document.createElement('button');
            btn.textContent = `Temporada ${season.season_number}`;
            btn.onclick = () => {
                hideSeasonPopup();
                showEpisodePopup(tvId, season.season_number);
            };
            seasonPopupContent.appendChild(btn);
        });

        document.getElementById('season-popup').style.display = 'flex';
    })
    .catch(error => console.error(error));
}

function showEpisodePopup(tvId, seasonNumber) {
    fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?language=pt-BR`, {
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })
    .then(res => res.json())
    .then(data => {
        const episodePopupContent = document.getElementById('episode-popup-content');
        episodePopupContent.innerHTML = '<h3>Selecione um Episódio</h3>';
        
        data.episodes.forEach(episode => {
            const btn = document.createElement('button');
            btn.textContent = `Episódio ${episode.episode_number}: ${episode.name}`;
            btn.onclick = () => {
                setPlayer(episode.id); // Ajustar para obter o URL correto do episódio
                hideEpisodePopup();
            };
            episodePopupContent.appendChild(btn);
        });

        document.getElementById('episode-popup').style.display = 'flex';
    })
    .catch(error => console.error(error));
}

function hidePopup() {
    popup.style.display = 'none';
}

function hideSeasonPopup() {
    document.getElementById('season-popup').style.display = 'none';
}

function hideEpisodePopup() {
    document.getElementById('episode-popup').style.display = 'none';
}

async function searchMedia(query) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };

    const res = await fetch(`https://api.themoviedb.org/3/search/multi?query=${query}&include_adult=true&language=pt-BR`, options);
    const data = await res.json();
    return data;
}

async function setPlayer(id) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://embedder.net/e/${id}`; // Você pode precisar ajustar isso
    iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
    iframe.allowfullscreen = 'allowfullscreen';
    iframe.frameborder = '0';
    iframe.width = '660';
    iframe.height = '415';

    player.innerHTML = ''; // Limpa o player antes de adicionar
    player.appendChild(iframe);
}

function insertData(data) {
    if (data.results.length === 0) {
        resultsMovies.innerHTML = '<tr><td colspan="2">Nenhum resultado encontrado</td></tr>';
        return;
    }

    resultsMovies.innerHTML = ''; // Limpa resultados anteriores

    for (const media of data.results) {
        const title = media.title || media.name; // Altera para lidar com filmes e séries

        const posterURL = media.poster_path ? `https://image.tmdb.org/t/p/w500/${media.poster_path}` : 'placeholder.jpg';

        const elem = document.createElement('tr');
        elem.setAttribute('data-media-id', media.id);
        elem.setAttribute('data-media-title', title);
        elem.setAttribute('data-media-type', media.media_type); // Tipo de mídia (filme ou série)

        const img = document.createElement('img');
        const tdImg = document.createElement('td');
        img.src = posterURL;
        img.width = 100;
        tdImg.appendChild(img);

        const tdTitle = document.createElement('td');
        tdTitle.textContent = title;

        elem.appendChild(tdImg);
        elem.appendChild(tdTitle);

        resultsMovies.appendChild(elem);
        elem.addEventListener('click', onClickMedia);
    }
}
