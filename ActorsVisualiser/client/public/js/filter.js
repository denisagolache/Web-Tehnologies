document.addEventListener('DOMContentLoaded', async () => {
    const filter = sessionStorage.getItem('filter');
    if (filter === 'category') {
        const categoriesResponse = await fetch('http://localhost:3001/api/categories');
        const categories = await categoriesResponse.json();
        const categoriesContainer = document.getElementById('categories');

        if (categoriesContainer) {
            categories.forEach(category => {
                const button = document.createElement('button');
                button.classList.add('filter-category');
                button.innerText = category;
                categoriesContainer.appendChild(button);
            });
        }
    } else if (filter === 'edition') {
        const yearsResponse = await fetch('http://localhost:3001/api/years');
        const years = await yearsResponse.json();
        const yearsContainer = document.getElementById('years');

        if (yearsContainer) {
            years.forEach(year => {
                const button = document.createElement('button');
                button.classList.add('filter-year');
                button.innerText = year;
                yearsContainer.appendChild(button);
            });
        }
    } 

    const updateStatisticsPage = (data) => {
        console.log('Updating statistics page with data:', data);
        const statisticsPage = document.getElementById('statisticsPage');
        if (statisticsPage) {
            statisticsPage.innerHTML = '';
            data.forEach(item => {
                console.log(item); 
                const p = document.createElement('p');
                p.innerText = JSON.stringify(item, null, 2);
                statisticsPage.appendChild(p);
            });
        }
    };

    document.querySelectorAll('.filter-category').forEach(item => {
        item.addEventListener('click', async event => {
            const category = event.target.innerText;
            console.log(`Filtering category: ${category}`);

            const response = await fetch(`http://localhost:3001/api/awardsInfo?category=${encodeURIComponent(category)}`);
            const data = await response.json();

            updateStatisticsPage(data);
        });
    });

    document.querySelectorAll('.filter-year').forEach(item => {
        item.addEventListener('click', async event => {
            const year = event.target.innerText;
            console.log(`Filtering year: ${year}`);

            const response = await fetch(`http://localhost:3001/api/awardsInfo?year=${encodeURIComponent(year)}`);
            const data = await response.json();

            updateStatisticsPage(data);
        });
    });
});