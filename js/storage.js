const LAST_CITY_KEY = 'weather-app:last-city';
const UNITS_KEY = 'weather-app:units';

function saveLastCity(cityName) {
    try {
        localStorage.setItem(LAST_CITY_KEY, cityName.trim());
    } catch (error) {
        // Storage can be unavailable in private or restricted browser contexts.
    }
}

function loadLastCity() {
    try {
        return localStorage.getItem(LAST_CITY_KEY) || '';
    } catch (error) {
        return '';
    }
}

function saveUnits(units) {
    try {
        localStorage.setItem(UNITS_KEY, units);
    } catch (error) {
        // Storage can be unavailable in private or restricted browser contexts.
    }
}

function loadUnits() {
    try {
        return localStorage.getItem(UNITS_KEY) === 'imperial' ? 'imperial' : 'metric';
    } catch (error) {
        return 'metric';
    }
}
