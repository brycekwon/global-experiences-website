document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.querySelector('.search-form');
    const resultsContainer = document.getElementById('resultsContainer');

    const infoName = document.getElementById('info-name');
    const infoLocation = document.getElementById('info-location');
    const infoDates = document.getElementById('info-dates');
    const infoDescription = document.getElementById('info-description');
    const infoEmail = document.getElementById('info-email');
    //const infoAffiliation = document.getElementById('info-affiliation');
    //const infoProgram = document.getElementById('info-program');
    //const infoInstitutions = document.getElementById('info-email');

    searchForm.addEventListener('submit', async(event) => {
        event.preventDefault();

        const searchTerm = document.getElementById('search-bar').value.trim();
        if (!searchTerm) {
            return;
        }

        const response = await fetch(`/experience/search?q=${encodeURIComponent(searchTerm)}`);
        const results = await response.json();

        // Clear the previous results
        resultsContainer.innerHTML = '';

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No results found</p>';
        } else {
            results.forEach(result => {
                const resultCard = document.createElement('div');
                resultCard.classList.add('result-card');

                resultCard.innerHTML = `
                    <h3>${result.name}</h3>
                    <p><strong>Location:</strong> ${result.city}, ${result.country}</p>
                    <p><strong>Date:</strong> ${result.startdate.split('T')[0]} - ${result.enddate.split('T')[0] || 'Ongoing'}</p>
                `;

                resultCard.addEventListener('click', () => {
                    populateInfoCard(result);
                });

                resultsContainer.appendChild(resultCard);
            });
        }
    });

    function populateInfoCard(data) {
        infoName.textContent = data.name;
        infoLocation.textContent = `Location: ${data.city}, ${data.country}`;
        infoDates.textContent = `Dates: ${data.startdate.split('T')[0]} - ${data.enddate.split('T')[0] || 'Ongoing'}`;
        infoDescription.textContent = data.description || 'No description available';

        if (data.email) {
            infoEmail.innerHTML = `
                <a href="mailto:${data.email}">
                    <img src="/images/envelope-solid.svg" class="svg-image">
                </a>
            `
        } else {
            infoEmail.innerHTML = '';
        }
    }
});
