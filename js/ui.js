function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('search-btn').disabled = true;
    document.getElementById('geo-btn').disabled = true;
    document.getElementById('status').textContent = 'Loading weather data';
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('search-btn').disabled = false;
    document.getElementById('geo-btn').disabled = false;
}

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.classList.remove('hidden');
    document.getElementById('status').textContent = message;
}

function renderError(message) {
    showError(message);
}

function clearError() {
    document.getElementById('error').classList.add('hidden');
}

function updateUnitToggle(units) {
    const celsius = document.getElementById('celsius');
    const fahrenheit = document.getElementById('fahrenheit');
    celsius.classList.toggle('active', units === 'metric');
    fahrenheit.classList.toggle('active', units === 'imperial');
    celsius.setAttribute('aria-pressed', String(units === 'metric'));
    fahrenheit.setAttribute('aria-pressed', String(units === 'imperial'));
}

function renderCurrentWeather(data, units) {
    const weather = data && data.weather;
    const current = weather && weather.current;
    const daily = weather && weather.daily;
    if (!current || !daily || !Array.isArray(daily.time) || !daily.time.length) {
        throw new Error('Weather data is incomplete.');
    }
    const high = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max[0] : null;
    const low = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min[0] : null;
    const sunrise = Array.isArray(daily.sunrise) ? daily.sunrise[0] : null;
    const sunset = Array.isArray(daily.sunset) ? daily.sunset[0] : null;
    const symbol = units === 'metric' ? '°C' : '°F';
    const speedUnit = units === 'metric' ? 'km/h' : 'mph';
    const icon = document.getElementById('current-icon');
    const isNight = current.is_day === 0;
    const conditionCode = current.weather_code;
    const condition = getWeatherCondition(conditionCode);
    const city = data.city || { name: 'Your location', countryCode: '' };

    document.getElementById('city-name').textContent = `${city.name}${city.countryCode ? `, ${city.countryCode.toUpperCase()}` : ''}`;
    document.getElementById('last-updated').textContent = `Updated ${formatApiTime(current.time)}`;
    icon.src = getWeatherIcon(conditionCode, isNight);
    icon.alt = condition.description;
    icon.onerror = () => { icon.src = 'assets/icons/fallback.svg'; };
    document.getElementById('current-temp').textContent = formatValue(current.temperature_2m, symbol);
    document.getElementById('feels-like').textContent = `Feels like: ${formatValue(current.apparent_temperature, symbol)}`;
    document.getElementById('temp-range').textContent = `H:${formatValue(high, symbol)} L:${formatValue(low, symbol)}`;
    document.getElementById('weather-desc').textContent = condition.description;
    document.getElementById('humidity').textContent = `Humidity: ${formatValue(current.relative_humidity_2m, '%')}`;
    document.getElementById('wind').textContent = `Wind: ${formatValue(current.wind_speed_10m, ` ${speedUnit}`)} ${formatWindDirection(current.wind_direction_10m)}`;
    document.getElementById('pressure').textContent = `Pressure: ${formatValue(current.surface_pressure, ' hPa')}`;
    document.getElementById('sunrise').textContent = `Sunrise: ${formatApiTime(sunrise)}`;
    document.getElementById('sunset').textContent = `Sunset: ${formatApiTime(sunset)}`;
    document.getElementById('current-weather').classList.remove('hidden');

    setBackgroundByCondition(condition.main, isNight);
}

function renderForecast(data, units) {
    const symbol = units === 'metric' ? '°C' : '°F';
    const cards = document.getElementById('forecast-cards');

    cards.replaceChildren();
    const daily = data && data.weather && data.weather.daily;
    const dates = daily && Array.isArray(daily.time) ? daily.time : [];
    const weatherCodes = daily && Array.isArray(daily.weather_code) ? daily.weather_code : [];
    const highs = daily && Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
    const lows = daily && Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : [];
    if (!daily || !dates.length) {
        throw new Error('Forecast data is incomplete.');
    }
    const count = Math.min(5, dates.length, weatherCodes.length, highs.length, lows.length);
    dates.slice(0, count).forEach((date, index) => {
        const condition = getWeatherCondition(weatherCodes[index]);
        const card = document.createElement('article');
        card.className = 'forecast-card';
        const day = document.createElement('p');
        day.className = 'forecast-day';
        day.textContent = formatIsoDate(date);
        const image = document.createElement('img');
        image.className = 'forecast-icon';
        image.src = getWeatherIcon(weatherCodes[index], false);
        image.alt = condition.description;
        image.onerror = () => { image.src = 'assets/icons/fallback.svg'; };
        const temperature = document.createElement('p');
        temperature.className = 'forecast-temp';
        temperature.textContent = `${formatValue(highs[index], symbol)} / ${formatValue(lows[index], symbol)}`;
        const description = document.createElement('p');
        description.className = 'forecast-desc';
        description.textContent = condition.description;
        card.append(day, image, temperature, description);
        cards.appendChild(card);
    });

    document.getElementById('forecast').classList.remove('hidden');
}

function formatValue(value, suffix = '') {
    const number = Number(value);
    return Number.isFinite(number) ? `${Math.round(number)}${suffix}` : `--${suffix}`;
}

function formatIsoDate(value) {
    const [year, month, day] = String(value).split('-').map(Number);
    if (![year, month, day].every(Number.isFinite)) return '--';
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatApiTime(value) {
    const match = String(value || '').match(/T(\d{2}:\d{2})/);
    return match ? match[1] : '--:--';
}

