let currentUnits = loadUnits();
let lastWeatherQuery = null;
let activeRequestId = 0;

async function loadWeather(loadRequest, cityToSave = '', queryOverride = null, fallbackCity = '') {
    const requestId = ++activeRequestId;
    clearError();
    showLoading();
    try {
        const data = await loadRequest();
        if (requestId !== activeRequestId) return;
        lastWeatherQuery = cityToSave ? { type: 'city', value: cityToSave } : queryOverride || lastWeatherQuery;
        renderCurrentWeather(data, currentUnits);
        renderForecast(data, currentUnits);
        if (cityToSave) {
            saveLastCity(cityToSave);
            document.getElementById('city-input').value = cityToSave;
        }
    } catch (error) {
        if (requestId !== activeRequestId) return;
        if (fallbackCity) {
            await loadWeather(() => getWeatherByCity(fallbackCity, currentUnits), fallbackCity);
            return;
        }
        renderError(error.message || 'Unable to load weather data.');
    } finally {
        if (requestId === activeRequestId) hideLoading();
    }
}

function searchCity() {
    const city = document.getElementById('city-input').value.trim();
    if (!city) {
        renderError('Please enter a city name');
        return;
    }
    loadWeather(() => getWeatherByCity(city, currentUnits), city);
}

function useCurrentLocation() {
    if (!navigator.geolocation) {
        renderError('Geolocation is not supported. Search for a city manually.');
        return;
    }
    loadWeather(
        async () => {
            const result = await getWeatherByCurrentLocation(currentUnits);
            return {
                city: { name: 'Your location', countryCode: '' },
                weather: result.weather
            };
        },
        '',
        null
    ).catch(() => {
        // loadWeather already renders the user-facing error.
    });
}

function changeUnits(units) {
    if (currentUnits === units) return;
    currentUnits = units;
    saveUnits(units);
    updateUnitToggle(units);
    if (!lastWeatherQuery) return;
    if (lastWeatherQuery.type === 'city') {
        loadWeather(() => getWeatherByCity(lastWeatherQuery.value, currentUnits), lastWeatherQuery.value);
    } else {
        loadWeather(() => getWeatherByCoords(lastWeatherQuery.lat, lastWeatherQuery.lon, currentUnits));
    }
}

document.getElementById('search-form').addEventListener('submit', event => {
    event.preventDefault();
    searchCity();
});
document.getElementById('geo-btn').addEventListener('click', useCurrentLocation);
const cityInput = document.getElementById('city-input');
cityInput.addEventListener('input', debounce(() => clearError(), 250));
document.getElementById('celsius').addEventListener('click', () => changeUnits('metric'));
document.getElementById('fahrenheit').addEventListener('click', () => changeUnits('imperial'));

updateUnitToggle(currentUnits);
const savedCity = loadLastCity();
if (savedCity) {
    document.getElementById('city-input').value = savedCity;
    loadWeather(() => getWeatherByCity(savedCity, currentUnits), savedCity);
} else {
    loadWeather(
        async () => {
            const result = await getWeatherByCurrentLocation(currentUnits);
            return {
                city: { name: 'Your location', countryCode: '' },
                weather: result.weather
            };
        },
        '',
        null,
        'Cairo'
    );
}
