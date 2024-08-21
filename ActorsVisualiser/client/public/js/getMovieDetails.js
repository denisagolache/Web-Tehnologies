const tmdbApiKey = '524b8acb224e3bc712c2c9b11ddeca4e';
const tmdbApiUrl = 'https://api.themoviedb.org/3/search/movie?api_key=';
const localApiUrl = 'http://localhost:3001/api/awardsInfo';

async function fetchLocalMovies() {
    const response = await fetch(localApiUrl);
    return response.json();
}

async function fetchMovieDetailsFromTmdb(movieTitle) {
    const response = await fetch(`${tmdbApiUrl}${tmdbApiKey}&query=${encodeURIComponent(movieTitle)}`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
        return data.results[0]; // Return the first matched movie
    }
    return null;
}

fetchLocalMovies()
.then(async localMovies => {
    if (localMovies.length > 0) {
        let displayedMovies = 0;

        for (const localMovie of localMovies) {
            if (displayedMovies >= 3) break; // Display only 3 movies

            const movieDetails = await fetchMovieDetailsFromTmdb(localMovie.show);
            if (!movieDetails) {
                console.log(`${localMovie.show} is not found on TMDb. Skipping...`);
                continue;
            }

            const movieContainer = document.querySelector(`.movie${displayedMovies + 1}Container`);

            if (!movieContainer) {
                console.error(`Container for movie${displayedMovies + 1} not found`);
                continue;
            }

            movieContainer.innerHTML = `
                <h1>${movieDetails.title}</h1>
                <p>${movieDetails.overview}</p>
            `;

            fetch(`https://api.themoviedb.org/3/movie/${movieDetails.id}/credits?api_key=${tmdbApiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.cast && data.cast.length > 0) {
                    const actors = data.cast.slice(0, 5).map(actor => actor.name).join(', ');
                    movieContainer.innerHTML += `<p>Actors: ${actors}</p>`;
                }
            })
            .catch(error => console.error('Error fetching credits:', error));

            displayedMovies++;
        }
    } else {
        console.log('Nu s-au găsit filme locale');
    }
})
.catch(error => console.error('Error:', error));