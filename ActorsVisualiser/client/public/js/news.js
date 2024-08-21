document.addEventListener('DOMContentLoaded', async () => {
    const newsList = document.getElementById('newsList');

    let searchBar = document.querySelector('#searchBox input');
    if (searchBar) {
        console.log("Search bar found.");
        let recommendationsDiv = document.querySelector('.search-recommendations');

        async function searchTmdbForActor(actorName) {
            const apiKey = '524b8acb224e3bc712c2c9b11ddeca4e';
            const response = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(actorName)}`);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results[0]; 
            }
            return null;
        }

        function searchLocalForActor(actorName) {
            const localApiUrl = 'http://localhost:3001/api/actorsFromDb';
            return fetch(localApiUrl)
                .then(response => response.json())
                .then(data => {
                    return data.filter(actor => 
                        actor.full_name && actor.full_name.toLowerCase().includes(actorName.toLowerCase())
                    );
                });
        }

        function searchLocalApiForActor(actorName) {
            const localApi = 'http://localhost:3001/api/actors';
            return fetch(localApi)
                .then(response => response.json())
                .then(data => {
                    return data.filter(actor => 
                        actor.actorname && actor.actorname.toLowerCase().includes(actorName.toLowerCase())
                    );
                });
        }

        async function fetchNewsForActor(actorName) {
            try {
                const response = await fetch(`http://localhost:3001/api/fetchNews?actorName=${encodeURIComponent(actorName)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const articles = await response.json();

                newsList.innerHTML = ''; 

                articles.forEach(article => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    const cleanedLink = cleanURL(article.link);
                    a.href = cleanedLink;
                    a.textContent = article.title;
                    a.target = '_blank'; 
                    li.appendChild(a);
                    newsList.appendChild(li);
                });
            } catch (error) {
                console.error('Error fetching news:', error);
                const errorMessage = document.createElement('p');
                errorMessage.textContent = 'Failed to load news articles.';
                newsList.appendChild(errorMessage);
            }
        }

        searchBar.addEventListener('input', function() {
            let searchTerm = this.value.toLowerCase();
            console.log(`Searching for: ${searchTerm}`);
            if (searchTerm) {
                Promise.all([searchLocalForActor(searchTerm), searchLocalApiForActor(searchTerm) ,searchTmdbForActor(searchTerm)])
                    .then(async results => {
                        let [localResultsFromDb, localResultsFromApi, tmdbResult] = results;

                        console.log("Local results from DB:", localResultsFromDb);
                        console.log("Local results from API:", localResultsFromApi);
                        console.log("TMDB result:", tmdbResult);

                        let recommendations = '';

                        if (localResultsFromDb.length > 0) {
                            for (const actor of localResultsFromDb) {
                                recommendations += `<li><a href="#" data-actor-name="${actor.full_name}" class="always-active">${actor.full_name}</a></li>`;
                            }
                        }

                        if (localResultsFromApi.length > 0) {
                            for (const actor of localResultsFromApi) {
                                recommendations += `<li><a href="#" data-actor-name="${actor.actorname}" class="always-active">${actor.actorname}</a></li>`;
                            }
                        }


                        if (recommendations) {
                            recommendationsDiv.innerHTML = `<ul class="always-active">${recommendations}</ul>`;
                            recommendationsDiv.style.display = 'block';
                        } else {
                            recommendationsDiv.innerHTML = '';
                            recommendationsDiv.style.display = 'none';
                        }
                    })
                    .catch(error => console.error('Error fetching actors:', error));
              
            } else {
                recommendationsDiv.innerHTML = '';
                recommendationsDiv.style.display = 'none';
                newsList.innerHTML = ''; 
            }
        });

        recommendationsDiv.addEventListener('click', function(event) {
            if (event.target.tagName === 'A') {
                event.preventDefault();
                let actorName = event.target.getAttribute('data-actor-name');
                fetchNewsForActor(actorName); 
            }
        });

        document.addEventListener('click', function(event) {
            if (!searchBar.contains(event.target) && !recommendationsDiv.contains(event.target)) {
                recommendationsDiv.style.display = 'none';
            }
        });
    } else {
        console.log("Search bar not found.");
    }
});

function cleanURL(url) {
    try {
        if (url.includes('/url?q=')) {
            const urlObj = new URL(url, 'http://127.0.0.1:5500'); 
            return urlObj.searchParams.get('q');
        }
    } catch (e) {
        console.error('Invalid URL:', url);
    }
    return url;
}
