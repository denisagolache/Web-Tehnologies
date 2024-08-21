if (!document.cookie.includes('username')) {
    window.location.href = 'homePage.html';
}

document.addEventListener('DOMContentLoaded', function () {
    let username = document.cookie.split('; ').find(row => row.startsWith('username=')).split('=')[1];

    // Fetch favorite actorsIds
    fetch(`http://localhost:3001/api/favorites/user/${username}`)
        .then(response => response.json())
        .then(actorsIds => {
            const container = document.querySelector('.container');

            actorsIds.forEach(actorId => {
                if (actorId.startsWith('tmdb-')) {
                    console.log("Fetching TMDB actor data for:", actorId);
                    fetch(`https://api.themoviedb.org/3/person/${actorId.replace('tmdb-', '')}?api_key=524b8acb224e3bc712c2c9b11ddeca4e`)
                        .then(response => response.json())
                        .then(data => {
                            if (data) {
                                let actorDiv = document.createElement('div');
                                actorDiv.classList.add('actorCircle');
                                actorDiv.style.backgroundImage = `url('https://image.tmdb.org/t/p/w500${data.profile_path}')`;
                                actorDiv.style.backgroundSize = 'cover';
                                actorDiv.style.backgroundPosition = 'center';

                                let actorNameDiv = document.createElement('div');
                                actorNameDiv.textContent = data.name;
                                actorNameDiv.classList.add('actorName');
                                actorDiv.appendChild(actorNameDiv);

                                let actorAnchor = document.createElement('a');
                                actorAnchor.href = `actorProfile.html?id=tmdb-${data.id}`;
                                console.log(`Generated URL: actorProfile.html?id=tmdb-${data.id}`);
                                actorAnchor.appendChild(actorDiv);
                                container.appendChild(actorAnchor);
                            } else {
                                console.error("No data returned for TMDB actor:", actorId);
                            }
                        })
                        .catch(error => console.error('Error fetching TMDB actor data:', error));
                } else if (actorId.startsWith('local-')) {
                    console.log("Fetching local actor data for:", actorId);
                    fetch(`http://localhost:3001/api/actors/${actorId.replace('local-', '')}`)
                        .then(response => response.json())
                        .then(data => {
                            console.log("Local actor data:", data);
                            if (data) {
                                console.log("Local actor data:", data);
                                let actorDiv = document.createElement('div');
                                actorDiv.classList.add('actorCircle');

                                if (data.image === undefined || data.image === null || data.image === "") {
                                    actorDiv.style.backgroundImage = 'url("https://via.placeholder.com/200x450?text=No+Image+Available")';
                                } else {
                                    let imageUrl = `http://localhost:3001/api/resources/images/${data.image}`;
                                    actorDiv.style.backgroundImage = `url('${imageUrl}')`;
                                }

                                actorDiv.style.backgroundSize = 'cover';
                                actorDiv.style.backgroundPosition = 'center';

                                let actorNameDiv = document.createElement('div');
                                actorNameDiv.textContent = data.actorname;
                                actorNameDiv.classList.add('actorName');
                                actorDiv.appendChild(actorNameDiv);

                                let actorAnchor = document.createElement('a');
                                actorAnchor.href = `actorProfile.html?id=local-${data.id}&name=${encodeURIComponent(data.actorname)}`;
                                console.log(`Generated URL: actorProfile.html?id=local-${data.id}&name=${encodeURIComponent(data.actorname)}`);
                                actorAnchor.appendChild(actorDiv);
                                container.appendChild(actorAnchor);
                            } else {
                                console.error("No data returned for local actor:", actorId);
                            }
                        })
                        .catch(error => console.error('Error fetching local actor data:', error));
                }
            });
        })
        .catch(error => console.error('Error fetching favorite actors:', error));
        document.addEventListener('DOMContentLoaded', () => {
    let searchBar = document.querySelector('.search-button input');

    searchBar.addEventListener('keypress', function(event) {
        if (event.keyCode === 13) {
            let searchTerm = this.value.toLowerCase();
            let containers = document.querySelectorAll('.container');
            let found = false;

            containers.forEach(function(container) {
                if (!found) {
                    let containerText = container.innerText.toLowerCase();
                    if (containerText.includes(searchTerm)) {
                        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        found = true;
                    } else {
                        let actorNames = container.querySelectorAll('.actorName, .infoBox');
                        actorNames.forEach(function(actorName) {
                            let originalDisplay = actorName.style.display;
                            actorName.style.display = 'block'; 
                            if (actorName.innerText.toLowerCase().includes(searchTerm)) {
                                actorName.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                found = true;
                            }
                            actorName.style.display = originalDisplay; 
                        });
                    }
                }
            });

            if (!found) {
                alert('No matches found');
            }
        }
    });
});
let searchBar = document.querySelector('.search-button input');

searchBar.addEventListener('keypress', function(event) {
    if (event.keyCode === 13) {
        let searchTerm = this.value.toLowerCase();
        let actorCircles = document.querySelectorAll('.actorCircle');
        let found = false;

        actorCircles.forEach(function(actorCircle) {
            actorCircle.classList.remove('highlight'); 

            let actorName = actorCircle.querySelector('.actorName').innerText.toLowerCase();
                if (actorName.includes(searchTerm)) {
                    actorCircle.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    actorCircle.classList.add('highlight');
                    setTimeout(() => {
                        actorCircle.classList.remove('highlight');
                    }, 3000); 
                    found = true;
                }
        });

        if (!found) {
            alert('No matches found');
        }
    }
});

});
