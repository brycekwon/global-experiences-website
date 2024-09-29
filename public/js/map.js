document.addEventListener('DOMContentLoaded', function () {
    const MAP_SOURCE = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
    // Function to fetch the user's location based on their IP address
    async function fetchLocation() {
        try {
            // Get the user's IP address and location data
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const { latitude, longitude } = data;

            // Initialize the map with user coordinates
            const map = L.map('map', { attributionControl: false }).setView([latitude, longitude], 4);

            L.tileLayer(MAP_SOURCE, {
                maxZoom: 18
            }).addTo(map);
        } catch (error) {
            console.error('Error fetching location:', error);

            // Fallback to a default location if there's an error
            const defaultLatitude = 37.0902; // Default latitude (USA)
            const defaultLongitude = -95.7129; // Default longitude (USA)
            const map = L.map('map', { attributionControl: false }).setView([defaultLatitude, defaultLongitude], 4);

            L.tileLayer(MAP_SOURCE, {
                maxZoom: 18
            }).addTo(map);
        }
    }

    fetchLocation();
});
