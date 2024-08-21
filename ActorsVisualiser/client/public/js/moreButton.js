
document.getElementById('moreButton').addEventListener('click', function(event) {
    event.preventDefault();
    currentPage++;  
    fetchAndDisplayActors(currentPage); 
});