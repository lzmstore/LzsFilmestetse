const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNWYzYTgxMjg4YjU2MzIzOTQ4ZGMwMDE0NzA5MzhmNSIsInN1YiI6IjY0YzZjN2E4ZWVjNWI1MDBhZDAyYTc5ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aUs9966NKFNZyQLqPyN2Ik_RXJCVLP_-Jyppvy9p2iY';

const btnSearch = document.getElementById('btn-search');
const inputSearch = document.getElementById('input-search');
const mediaType = document.getElementById('media-type'); // Novo: campo para escolher filme ou série
const resultsTable = document.getElementById('results-list');
const resultsMovies = document.getElementById('result-movies');
const popup = document.getElementById('movie-popup');
const popupQuestion = document.getElementById('popup-question');
const popupYesButton = document.getElementById('popup-yes');
const popupNoButton = document.getElementById('popup-no');
const player = document.getElementById('player');

btnSearch.addEventListener('click', async () => {
    const query = inputSearch.value.trim();
    const type = mediaType.value; // Obtém o tipo selecionado (filme ou série)
    if (!query) return;

    btnSearch.disabled = true;
    resultsMovies.innerHTML = '<tr id="loading"><td colspan="2">Carregando...</td></tr>';

    try {
        const data = await searchMedia(query, type); // Altera a chamada para a nova função
        document.getElementById('loading').remove();
        insertData(data);
    } catch (error) {
        console.error(error);
        resultsMovies.innerHTML = '<tr><td colspan="2">Erro ao carregar resultados</td></tr>';
    }

    btnSearch.disabled = false;
});

function onClickMovie(event) {
    const selectedRow = event.target.closest('tr');
    const selectedTitle = selectedRow.getAttribute('data-movie-title');
    const selectedId = selectedRow.getAttribute('data-movie-id');

    if (selectedId) {
        showPopup(`Deseja assistir "${selectedTitle}"?`, () => {
            setPlayer(selectedId); 
        });
    }
}

popupNoButton.addEventListener('click', () => {
    hidePopup(); 
});

function showPopup(question, onYes) {
    popupQuestion.textContent = question;
    popup.style.display = 'flex';
    popupYesButton.onclick = () => {
        onYes();
    };
}

function hidePopup() {
    popup.style.display = 'none';
}

// Função para buscar tanto filmes quanto séries
async function searchMedia(query, type) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };

    const endpoint = type === 'movie' 
        ? `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=true&language=pt-BR`
        : `https://api.themoviedb.org/3/search/tv?query=${query}&include_adult=true&language=pt-BR`; // Nova URL para séries

    const res = await fetch(endpoint, options);
    const data = await res.json();

    return data;
}

async function setPlayer(id) {
    const iframe = document.createElement('iframe');

    iframe.src = `https://embedder.net/e/${id}`;
    iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
    iframe.allowfullscreen = 'allowfullscreen';
    iframe.frameborder = '0';
    iframe.width = '660';
    iframe.height = '415';

    player.appendChild(iframe);
    resultsMovies.innerHTML = ''; 
    hidePopup();
}

function insertData(data) {
    if (data.results.length === 0) {
        resultsTable.innerHTML = '<tr><td colspan="2">Nenhum resultado encontrado</td></tr>';
        return;
    }

    for (const media of data.results) {
        const title = media.title || media.name; // Altera para lidar com séries

        const posterURL = media.poster_path ? `https://image.tmdb.org/t/p/w500/${media.poster_path}` : 'placeholder.jpg';

        const elem = document.createElement('tr');
        elem.setAttribute('data-movie-id', media.id);
        elem.setAttribute('data-movie-title', title);
        elem.setAttribute('data-movie-synopsis', media.overview);
        elem.id = 'movie';

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
        elem.addEventListener('click', onClickMovie);
    }
}
