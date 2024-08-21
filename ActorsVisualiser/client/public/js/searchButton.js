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
