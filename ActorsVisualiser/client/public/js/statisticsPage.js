document.addEventListener('DOMContentLoaded', async () => {
    let start = 0;
    const increment = 10;
    let filteredItems = [];
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');
    let displayedShows = new Set();
    let displayedActors = new Set();
    let barChart, lineChart, pieChart;
    let allChartData = [];
    const tmdbApiKey = '524b8acb224e3bc712c2c9b11ddeca4e';

    const loadImages = async (filterValue, resetStart = false, isBackgroundLoad = false) => {
        if (resetStart) {
            start = 0;
            filteredItems = [];
            displayedShows.clear();
            displayedActors.clear();
            allChartData = [];
            resetCharts([barChart, lineChart, pieChart]);
        }
        const resultsContainer = document.querySelector('.movies ul');
        if (resetStart) {
            resultsContainer.innerHTML = '';
        }

        let response;
        if (filter === 'year') {
            response = await fetch(`http://localhost:3001/api/awardsInfo?year=${encodeURIComponent(filterValue)}`);
        } else if (filter === 'category' || filter === 'movies') {
            response = await fetch(`http://localhost:3001/api/awardsInfo?category=${encodeURIComponent(filterValue)}`);
        } else if (filter === 'tv-series') {
            response = await fetch(`http://localhost:3001/api/seriesCategories`);
        }

        if (response) {
            const newItems = await response.json();
            let filteredNewItems;

            if (filter === 'year') {
                const otherItems = newItems.filter(item => item.year);
                otherItems.sort((a, b) => b.year.localeCompare(a.year));
                filteredNewItems = otherItems;
            } else if (filter === 'category' || filter === 'tv-series') {
                filteredNewItems = newItems.filter(item => item.category && item.category !== '');
            }

            filteredItems = filteredItems.concat(filteredNewItems);

            if (filteredItems.length === 0) {
                resultsContainer.innerHTML = '<p>Sorry, no data.</p>';
                return;
            }

            if (!isBackgroundLoad) {
                await displayItems(filteredItems.slice(start, start + increment), resetStart);
                start += increment;
            } else {
                await displayItems(filteredItems.slice(start, filteredItems.length));
            }
        }
    };

    const displayItems = async (items, resetStart = false) => {
        let chartData = [];
        let showNames = new Set();
        let actorNames = new Set();
    
        items.forEach(item => {
            const showName = item.show || '';
            if (showName && showName !== 'N/A' && !displayedShows.has(showName)) {
                showNames.add(showName);
            }
            if (item.full_name && !displayedActors.has(item.full_name)) {
                actorNames.add(item.full_name);
            }
        });
    
        const showResults = await fetchShowData(showNames);
        const actorResults = await fetchActorData(actorNames);
    
        let showDataMap = new Map();
        let actorDataMap = new Map();
    
        showResults.forEach((showResult, index) => {
            if (showResult.results && showResult.results.length > 0) {
                showDataMap.set(Array.from(showNames)[index], showResult.results[0]);
            }
        });
    
        actorResults.forEach((actorResult, index) => {
            if (actorResult.results && actorResult.results.length > 0) {
                actorDataMap.set(Array.from(actorNames)[index], actorResult.results[0]);
            }
        });
    
        const resultsContainer = document.querySelector('.movies ul');
        let responseText = '';
    
        Array.from(showNames).forEach(showName => {
            const showInfo = showDataMap.get(showName);
    
            if (showInfo) {
                const showImageUrl = showInfo.poster_path ? "https://image.tmdb.org/t/p/w500" + showInfo.poster_path : '';
                responseText += `<div class="show-container"><img class="fade show-image" src="${showImageUrl}" alt="${showName}"><p class="show-title">${showName}</p><div class="actors-container">`;
    
                const actors = filteredItems.filter(actorItem => actorItem.show === showName);
                console.log(`Actors for show: ${showName}`, actors);
    
                const wonCount = actors.filter(actor => actor.won).length;
                chartData.push({ show: showName, actorCount: actors.length, wonCount: wonCount });
                allChartData.push({ show: showName, actorCount: actors.length, wonCount: wonCount });
    
                let displayedActorsInShow = new Set();
    
                actors.forEach(actor => {
                    const actorInfo = actorDataMap.get(actor.full_name);
                    if (actorInfo && !displayedActorsInShow.has(actor.full_name)) {
                        const actorImageUrl = actorInfo.profile_path ? "https://image.tmdb.org/t/p/w500" + actorInfo.profile_path : '';
                        const actorPageUrl = `actorProfile.html?id=tmdb-${actorInfo.id}`;
                        if (actorImageUrl) {
                            responseText += `<div class="actor-item"><a href="${actorPageUrl}"><img class="fade actor-image" src="${actorImageUrl}" alt="${actorInfo.name}"></a><p class="actor-name">${actorInfo.name}</p></div>`;
                        } else {
                            responseText += `<div class="actor-item"><p class="actor-name">${actorInfo.name}</p></div>`;
                        }
                        displayedActorsInShow.add(actor.full_name);
                        displayedActors.add(actor.full_name);
                    }
                });
    
                responseText += `</div></div>`;
                displayedShows.add(showName);
            }
        });
    
        resultsContainer.innerHTML += responseText;

        if (filter === 'tv-series' && resetStart) {
            generateTvSeriesChart(barChart, chartData);
            generateTvSeriesChart(lineChart, chartData);
            generateTvSeriesChart(pieChart, chartData);
        } else {
            generateChart(barChart, chartData, 'percentage');
            generateChart(lineChart, chartData);
            generateChart(pieChart, chartData);
        }
    };

    const fetchShowData = async (showNames) => {
        const showResults = [];
        for (let showName of showNames) {
            const response = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(showName)}`);
            const data = await response.json();
            showResults.push(data);
        }
        return showResults;
    };
    
    const fetchActorData = async (actorNames) => {
        const actorResults = [];
        for (let actorName of actorNames) {
            const response = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${tmdbApiKey}&query=${encodeURIComponent(actorName)}`);
            const data = await response.json();
            actorResults.push(data);
        }
        return actorResults;
    };
    
    const resetCharts = (charts) => {
        charts.forEach(chart => {
            if (chart) {
                chart.data.labels = [];
                chart.data.datasets.forEach(dataset => {
                    dataset.data = [];
                });
                chart.update();
            }
        });
    };

    try {
        if (filter === 'year') {
            const yearsResponse = await fetch('http://localhost:3001/api/years');
            const years = await yearsResponse.json();
            const yearsContainer = document.querySelector('.years');
            if (!yearsContainer) {
                console.error('No element with class "years" found');
                return;
            }
            years.sort((a, b) => b.year - a.year).forEach(year => {
                if (year.year !== null) {
                    const button = document.createElement('button');
                    button.textContent = year.year;
                    button.classList.add('category-button');
                    button.addEventListener('click', () => loadImages(year.year, true));
                    yearsContainer.appendChild(button);
                }
            });
        } else if (filter === 'category') {
            const categoriesResponse = await fetch('http://localhost:3001/api/categories');
            const categories = await categoriesResponse.json();
            const categoriesContainer = document.querySelector('.categories');
            if (!categoriesContainer) {
                console.error('No element with class "categories" found');
                return;
            }
            categories.forEach(category => {
                const button = document.createElement('button');
                button.textContent = category.category;
                button.classList.add('category-button');
                button.addEventListener('click', () => loadImages(category.category, true));
                categoriesContainer.appendChild(button);
            });
        } else if (filter === 'tv-series') {
            await loadImages(filter, true);
        }

        barChart = createChartContext('barChart', 'bar');
        lineChart = createChartContext('lineChart', 'line');
        pieChart = createChartContext('pieChart', 'pie');
    } catch (error) {
        console.error('Error:', error);
    }

    const moreButton = document.getElementById('moreButton');
    moreButton.addEventListener('click', () => {
        const filterValue = urlParams.get('category') || urlParams.get('year') || 'tv-series';
        loadImages(filterValue, false);
    });
    const initialFilterValue = urlParams.get('category') || urlParams.get('year') || 'tv-series';
    if (initialFilterValue) {
        await loadImages(initialFilterValue, true);
    }

    document.getElementById('exportCSV').addEventListener('click', () => exportCSV(barChart)); 
    document.getElementById('exportWebP').addEventListener('click', () => exportWebP([barChart, lineChart, pieChart]));
    document.getElementById('exportSVG').addEventListener('click', () => exportSVG([barChart, lineChart, pieChart]));
});

function generateTvSeriesChart(chart, newData) {
    if (!chart || !chart.data) {
        return;
    }
    const tvSeriesData = {};
    newData.forEach(item => {
        if (!tvSeriesData[item.show]) {
            tvSeriesData[item.show] = { actorCount: 0, wonCount: 0 };
        }
        tvSeriesData[item.show].actorCount += item.actorCount;
        tvSeriesData[item.show].wonCount += item.wonCount;
    });

    if (chart.data.datasets.length < 3) {
        chart.data.datasets.push({ label: 'Win Percentage', data: [], backgroundColor: 'rgba(255, 206, 86, 0.2)', borderColor: 'rgba(255, 206, 86, 1)', borderWidth: 1 });
    }

    Object.keys(tvSeriesData).forEach(show => {
        const actorCount = tvSeriesData[show].actorCount;
        const wonCount = tvSeriesData[show].wonCount;
        const winPercentage = actorCount > 0 ? (wonCount / actorCount * 100).toFixed(2) : 0;
        const labelIndex = chart.data.labels.indexOf(show);

        if (labelIndex === -1) {
            chart.data.labels.push(show);
            chart.data.datasets[0].data.push(actorCount);
            chart.data.datasets[1].data.push(wonCount);
            chart.data.datasets[2].data.push(winPercentage);
        } else {
            chart.data.datasets[0].data[labelIndex] = actorCount;
            chart.data.datasets[1].data[labelIndex] = wonCount;
            chart.data.datasets[2].data[labelIndex] = winPercentage; 
        }
    });

    chart.update();
}
function generateChart(chart, newData, type = 'total') {
    if (!chart || !chart.data) {
        console.error("Chart or chart data is not defined");
        return;
    }

    if (type === 'average') {
        let showData = {};
        newData.forEach(item => {
            if (!showData[item.show]) {
                showData[item.show] = { actorCount: 0, wonCount: 0, count: 0 };
            }
            showData[item.show].actorCount += item.actorCount;
            showData[item.show].wonCount += item.wonCount;
            showData[item.show].count += 1;
        });

        Object.keys(showData).forEach(show => {
            const data = showData[show];
            const avgActorCount = data.actorCount / data.count;
            const avgWonCount = data.wonCount / data.count;
            const labelIndex = chart.data.labels.indexOf(show);

            if (labelIndex === -1) {
                chart.data.labels.push(show);
                chart.data.datasets[0].data.push(avgActorCount);
                chart.data.datasets[1].data.push(avgWonCount);
            } else {
                chart.data.datasets[0].data[labelIndex] = avgActorCount;
                chart.data.datasets[1].data[labelIndex] = avgWonCount;
            }
        });
    } else if (type === 'percentage') {
        newData.forEach(item => {
            const labelIndex = chart.data.labels.indexOf(item.show);
            const percentageWon = item.actorCount > 0 ? Math.min((item.wonCount / item.actorCount) * 100, 100) : 0;
            if (labelIndex === -1) {
                chart.data.labels.push(item.show);
                chart.data.datasets[0].data.push(item.actorCount);
                chart.data.datasets[1].data.push(percentageWon);
            } else {
                chart.data.datasets[0].data[labelIndex] = item.actorCount;
                chart.data.datasets[1].data[labelIndex] = percentageWon;
            }
        });
    } else {
        newData.forEach(item => {
            const labelIndex = chart.data.labels.indexOf(item.show);

            if (labelIndex === -1) {
                chart.data.labels.push(item.show);
                chart.data.datasets[0].data.push(item.actorCount);
                chart.data.datasets[1].data.push(item.wonCount);
            } else {
                chart.data.datasets[0].data[labelIndex] = item.actorCount;
                chart.data.datasets[1].data[labelIndex] = item.wonCount;
            }
        });
    }

    chart.update();
}


function createChartContext(elementId, chartType) {
    const ctx = document.getElementById(elementId).getContext('2d');
    return new Chart(ctx, {
        type: chartType,
        data: {
            labels: [],
            datasets: [{
                label: 'Number of Nominated Actors',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'Number of Winning Actors',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                         callback: function(value) {
                            return value;
                        }
                    }
                }
            }
        }
    });
}

function exportCSV(chart) {
    const csvRows = [];
    const headers = ['Show', 'Number of Nominated Actors', 'Number of Winning Actors', 'Percentage of Winning Actors'];
    csvRows.push(headers.join(','));

    if (chart && chart.data) {
        chart.data.labels.forEach((label, index) => {
            const row = [
                label,
                chart.data.datasets[0].data[index],
                chart.data.datasets[1].data[index],
                chart.data.datasets[1].data[index] > 0 ? (chart.data.datasets[1].data[index] / chart.data.datasets[0].data[index] * 100).toFixed(2) : 0
            ];
            csvRows.push(row.join(','));
        });
    }

    const csvData = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvData);

    const link = document.createElement('a');
    link.href = csvUrl;
    link.download = 'chart_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportWebP(charts) {
    if (!charts || charts.length === 0) {
        console.error("No charts provided for export");
        return;
    }

    const chartWidth = charts[0].width;
    const chartHeight = charts[0].height;
    const padding = 50;
    const canvasWidth = (chartWidth + padding) * charts.length;
    const canvasHeight = chartHeight;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    charts.forEach((chart, index) => {
        ctx.drawImage(chart.canvas, (chartWidth + padding) * index, 0, chartWidth, chartHeight);
    });

    canvas.toBlob(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'all_charts.webp';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, 'image/webp');
}

function exportSVG(charts, svgWidth = 1000, svgHeight = 700) {
    const svgContents = [];
    let completedRequests = 0;

    charts.forEach((chart, index) => {
        if (chart) {
            const labels = chart.data.labels;
            const datasets = chart.data.datasets;
            const chartType = chart.config.type;

            let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">`;
            svgContent += `<g transform="translate(${index * svgWidth}, 0)">`;

            if (chart.options.plugins && chart.options.plugins.title) {
                svgContent += `<text x="${svgWidth / 2}" y="20" font-size="16" text-anchor="middle">${chart.options.plugins.title.text}</text>`;
            }

            const xSpacing = (svgWidth - 50) / (labels.length + 1);
            const yScale = (svgHeight - 50) / Math.max(...datasets.flatMap(dataset => dataset.data));

            svgContent += `<line x1="30" y1="${svgHeight - 50}" x2="${svgWidth - 30}" y2="${svgHeight - 50}" stroke="black" />`;
            svgContent += `<line x1="30" y1="${svgHeight - 50}" x2="30" y2="20" stroke="black" />`;

            labels.forEach((label, labelIndex) => {
                const x = (labelIndex + 1) * xSpacing;
                svgContent += `<text x="${x + 30}" y="${svgHeight - 30}" font-size="10" text-anchor="middle">${label}</text>`;
            });

            datasets.forEach((dataset) => {
                dataset.data.forEach((value, dataIndex) => {
                    const x = (dataIndex + 1) * xSpacing;
                    const y = svgHeight - 50 - value * yScale;
                    const color = dataset.backgroundColor instanceof Array ? dataset.backgroundColor[dataIndex] : dataset.backgroundColor || 'black';

                    if (chartType === 'bar') {
                        const barWidth = xSpacing / 2;
                        svgContent += `<rect x="${x - barWidth / 2 + 30}" y="${y}" width="${barWidth}" height="${value * yScale}" fill="${color}" />`;
                    } else {
                        svgContent += `<circle cx="${x + 30}" cy="${y}" r="5" fill="${color}" />`;
                    }

                    svgContent += `<text x="${x + 30}" y="${y - 10}" font-size="10" text-anchor="middle">${value}</text>`;
                });
            });

            svgContent += `</g>`;
            svgContent += `</svg>`;

            svgContents.push(svgContent);
            completedRequests++;

            if (completedRequests === charts.length) {
                const combinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${charts.length * svgWidth}" height="${svgHeight}">${svgContents.join('')}</svg>`;
                console.log("Combined SVG Content:", combinedSvg);
                const blob = new Blob([combinedSvg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'all_charts.svg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    });
}
