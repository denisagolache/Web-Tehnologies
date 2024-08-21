document.addEventListener('DOMContentLoaded', function() {
    const username = document.cookie.split('; ').find(row => row.startsWith('username')).split('=')[1];
    console.log('Username:', username);
    const urlParams = new URLSearchParams(window.location.search);
    const actorId = urlParams.get('id');
    const favoriteButton = document.getElementById('add-to-favorites');

    // Check if the actor is already in favorites on page load
    const favorites = JSON.parse(localStorage.getItem(username + '_favorites') || '[]');
    if (favorites.includes(actorId)) {
        favoriteButton.style.color = 'red';
    }

    favoriteButton.addEventListener('click', function() {
        if (favoriteButton.style.color === 'red') {
            // Remove from favorites
            fetch('http://localhost:3001/api/users/removeActorFromFavourites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, actorId }),
            })
            .then(response => response.json())
            .then(data => {
                favoriteButton.style.color = 'white';
                // Update localStorage
                const index = favorites.indexOf(actorId);
                if (index > -1) {
                    favorites.splice(index, 1);
                    localStorage.setItem(username + '_favorites', JSON.stringify(favorites));
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        } else {
            // Add to favorites
            fetch('http://localhost:3001/api/users/addActorToFavourites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, actorId }),
            })
            .then(response => response.json())
            .then(data => {
                favoriteButton.style.color = 'red';
                // Update localStorage
                favorites.push(actorId);
                localStorage.setItem(username + '_favorites', JSON.stringify(favorites));
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });
});