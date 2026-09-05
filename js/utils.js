/**
 * Format timestamp to readable date/time
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string} format - 'date' or 'time'
 * @returns {string} Formatted date/time
 */
function formatTimestamp(timestamp, format = 'date') {
    const date = new Date(timestamp * 1000);
    return format === 'time'
        ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Convert temperature between Celsius and Fahrenheit
 * @param {number} temp - Temperature value
 * @param {string} unit - 'celsius' or 'fahrenheit'
 * @returns {number} Converted temperature
 */
function convertTemp(temp, unit) {
    if (unit === 'fahrenheit') {
        return (temp * 9/5) + 32;
    }
    return temp;
}

/**
 * Get weather icon based on condition code
 * @param {number} conditionCode - Open-Meteo WMO weather code
 * @returns {string} Fallback icon path
 */
function getWeatherIcon(conditionCode, isNight = false) {
    if ([95, 96, 99].includes(conditionCode)) return 'assets/icons/thunderstorm.svg';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(conditionCode)) return 'assets/icons/rain.svg';
    if ([71, 73, 75, 77, 85, 86].includes(conditionCode)) return 'assets/icons/snow.svg';
    if ([45, 48].includes(conditionCode)) return 'assets/icons/fog.svg';
    if (conditionCode === 0) return isNight ? 'assets/icons/moon.svg' : 'assets/icons/clear.svg';
    if ([1, 2, 3].includes(conditionCode)) return 'assets/icons/clouds.svg';
    return 'assets/icons/fallback.svg';
}

function getWeatherCondition(conditionCode) {
    if (conditionCode === 0) return { main: 'Clear', description: 'clear sky' };
    if ([1, 2].includes(conditionCode)) return { main: 'Clouds', description: 'partly cloudy' };
    if (conditionCode === 3) return { main: 'Clouds', description: 'overcast' };
    if ([45, 48].includes(conditionCode)) return { main: 'Fog', description: 'foggy' };
    if ([51, 53, 55].includes(conditionCode)) return { main: 'Rain', description: 'drizzle' };
    if ([56, 57].includes(conditionCode)) return { main: 'Rain', description: 'freezing drizzle' };
    if ([61, 63, 65].includes(conditionCode)) return { main: 'Rain', description: 'rain' };
    if ([66, 67].includes(conditionCode)) return { main: 'Rain', description: 'freezing rain' };
    if ([71, 73, 75, 77].includes(conditionCode)) return { main: 'Snow', description: 'snow' };
    if ([80, 81, 82].includes(conditionCode)) return { main: 'Rain', description: 'rain showers' };
    if ([85, 86].includes(conditionCode)) return { main: 'Snow', description: 'snow showers' };
    if ([95, 96, 99].includes(conditionCode)) return { main: 'Thunderstorm', description: 'thunderstorm' };
    return { main: 'Clouds', description: 'overcast' };
}

/**
 * Set background based on weather condition
 * @param {string} condition - Weather condition description
 */
function setBackgroundByCondition(condition, isNight = false) {
    const body = document.body;
    const normalized = String(condition || '').toLowerCase();
    body.className = '';
    if (isNight) body.classList.add('night');
    if (normalized.includes('thunder')) body.classList.add('thunderstorm');
    else if (normalized.includes('rain') || normalized.includes('drizzle')) body.classList.add('rain');
    else if (normalized.includes('snow')) body.classList.add('snow');
    else if (normalized.includes('cloud')) body.classList.add('clouds');
    else if (normalized.includes('mist') || normalized.includes('fog')) body.classList.add('fog');
    else body.classList.add('clear');
}

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Format wind direction to compass direction
 * @param {number} degrees - Wind direction in degrees
 * @returns {string} Compass direction
 */
function formatWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const safeDegrees = Number.isFinite(degrees) ? degrees : 0;
    const index = Math.round(safeDegrees / 22.5) % 16;
    return directions[index];
}
