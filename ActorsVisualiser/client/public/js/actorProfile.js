document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const actorId = urlParams.get('id');
    const actorName = urlParams.get('name');

    if (actorId.startsWith('local-')) {
        // Handle local actors
        const id = actorId.replace('local-', '');
        fetch(`http://localhost:3001/api/actors/${id}`)
            .then(response => response.json())
            .then(data => {
                if (!data.image) {
                    document.getElementById('actor-profile-image').src = 'https://via.placeholder.com/200x450?text=No+Image+Available';
                } else {
                    document.getElementById('actor-profile-image').src = `http://localhost:3001/api/resources/images/${data.image}`;
                }
                document.getElementById('actor-name').textContent = data.actorname;
                document.getElementById('actor-details').textContent = data.details || 'Sorry, no biography available for this actor for now.';
                const birthday = data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : 'N/A';
                document.getElementById('actor-profile-birthday').textContent = `Birthday: ${birthday}`;
                const deathday = data.deathday ? new Date(data.deathday).toISOString().split('T')[0] : 'N/A';
                document.getElementById('actor-profile-deathday').textContent = `Deathday: ${deathday}`;
                document.getElementById('actor-profile-department').textContent = `Known for: ${data.knownfor || 'N/A'}`;
                document.getElementById('actor-profile-birthplace').textContent = `Place of Birth: ${data.birthplace || 'N/A'}`;

                // Fetch movies for the local actor
                fetch(`http://localhost:3001/api/actor/movies/${id}`)
                    .then(response => response.json())
                    .then(movies => {
                        let actorsMovies = document.getElementById('actors-movies');
                        actorsMovies.innerHTML = '';
                        if (movies && movies.length > 0) {
                            movies.forEach(movie => {
                                console.log("Movie", movie);
                                if (movie.image) {
                                    let movieElement = document.createElement('li');
                                    let movieImage = document.createElement('img');


                                    console.log("Movie Image ->", movie.image);
                                    movieImage.src = `http://localhost:3001/api/resources/image/movie/${movie.image}`;
                                    movieImage.alt = movie.name;
                                    movieElement.appendChild(movieImage);

                                    let movieTitle = document.createElement('p');
                                    movieTitle.textContent = movie.name;
                                    movieTitle.style.color = 'white';
                                    movieElement.appendChild(movieTitle);

                                    movieElement.addEventListener('click', () => {
                                        const query = encodeURIComponent(movie.name);
                                        window.open(`https://www.google.com/search?q=${query}`, '_blank');
                                    });

                                    actorsMovies.appendChild(movieElement);
                                }
                            })
                        } else {
                            let noMovies = document.createElement('p');
                            noMovies.textContent = 'Sorry, no movies available for this actor for now.';
                            noMovies.style.color = 'white';
                            actorsMovies.appendChild(noMovies);
                        }

                    })
                    .catch(error => console.error('Error:', error));
            })
            .catch(error => console.error('Error:', error));
    } else if (actorId.startsWith('tmdb-')) {
        // Handle TMDB actors
        const id = actorId.replace('tmdb-', '');
        fetch(`https://api.themoviedb.org/3/person/${id}?api_key=524b8acb224e3bc712c2c9b11ddeca4e`)
            .then(response => response.json())
            .then(data => {
                if (!data.profile_path) {
                    document.getElementById('actor-profile-image').src = 'https://via.placeholder.com/200x450?text=No+Image+Available';
                } else {
                    document.getElementById('actor-profile-image').src = `https://image.tmdb.org/t/p/w500${data.profile_path}`;
                }
                document.getElementById('actor-name').textContent = data.name;
                document.getElementById('actor-details').textContent = data.biography || 'Sorry, no biography available for this actor for now.';
                document.getElementById('actor-profile-birthday').textContent = `Birthday: ${data.birthday || 'N/A'}`;
                document.getElementById('actor-profile-deathday').textContent = `Deathday: ${data.deathday || 'N/A'}`;
                document.getElementById('actor-profile-department').textContent = `Known for: ${data.known_for_department || 'N/A'}`;
                document.getElementById('actor-profile-birthplace').textContent = `Place of Birth: ${data.place_of_birth || 'N/A'}`;
            })
            .catch(error => console.error('Error:', error));

        // Get the actor's movies
        fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=524b8acb224e3bc712c2c9b11ddeca4e`)
            .then(response => response.json())
            .then(data => {
                let actorsMovies = document.getElementById('actors-movies');

                actorsMovies.innerHTML = '';

                if (data.cast && data.cast.length > 0) {
                    data.cast.forEach(movie => {
                        console.log("Movie", movie);
                        if (movie.poster_path) {
                            let movieElement = document.createElement('li');
                            let movieImage = document.createElement('img');

                            movieImage.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
                            movieImage.alt = movie.title;
                            movieElement.appendChild(movieImage);

                            let movieTitle = document.createElement('p');
                            movieTitle.textContent = movie.title;
                            movieTitle.style.color = 'white';
                            movieElement.appendChild(movieTitle);

                            movieElement.addEventListener('click', () => {
                                const query = encodeURIComponent(movie.title);
                                window.open(`https://www.google.com/search?q=${query}`, '_blank');
                            });

                            actorsMovies.appendChild(movieElement);
                        }
                    });
                } else {
                    let noMovies = document.createElement('p');
                    noMovies.textContent = 'Sorry, no movies available for this actor for now.';
                    noMovies.style.color = 'white';
                    actorsMovies.appendChild(noMovies);
                }
            })
            .catch(error => console.error('Error:', error));
    }
});