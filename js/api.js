// ======================================================
// Weather App - API Layer
// Open-Meteo API
// ======================================================

// ======================================================
// API Error Messages
// ======================================================

const API_ERROR_MESSAGES = {
    400: 'Invalid request.',
    404: 'City not found.',
    429: 'Too many requests. Please try again in a moment.',
    500: 'Weather service is temporarily unavailable.',
    502: 'Weather service is temporarily unavailable.',
    503: 'Weather service is temporarily unavailable.'
};


// ======================================================
// Generic JSON Request
// ======================================================

async function requestJson(url, fallbackMessage = 'Something went wrong.') {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            let serverMessage = '';

            try {
                const details = await response.json();
                serverMessage = details.reason || details.message || '';
            } catch (error) {
                // Ignore JSON parsing errors
            }

            throw new Error(
                API_ERROR_MESSAGES[response.status] ||
                serverMessage ||
                fallbackMessage
            );
        }

        return await response.json();

    } catch (error) {

        // Fetch/network failure
        if (error instanceof TypeError) {
            throw new Error('Network error, try again');
        }

        throw error;
    }
}


// ======================================================
// Get City Coordinates
// Open-Meteo Geocoding API
// ======================================================

async function getCityCoordinates(cityName) {

    const query = String(cityName || '').trim();

    if (!query) {
        throw new Error('Please enter a city name.');
    }

    const language = /[\u0600-\u06FF]/.test(query) ? 'ar' : 'en';
    const url =
        `${GEOCODING_API_URL}?` +
        `name=${encodeURIComponent(query)}` +
        `&count=1` +
        `&language=${language}` +
        `&format=json`;

    const data = await requestJson(
        url,
        'City not found'
    );

    if (!data.results || !data.results.length) {
        throw new Error('City not found');
    }

    const city = data.results[0];
    if (!Number.isFinite(city.latitude) || !Number.isFinite(city.longitude)) {
        throw new Error('City coordinates are unavailable.');
    }

    return {
        name: city.name,
        country: city.country || '',
        countryCode: city.country_code || '',
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone || 'auto'
    };
}


// ======================================================
// Build Weather API URL
// ======================================================

function buildWeatherUrl(lat, lon, units = 'metric') {

    const temperatureUnit =
        units === 'imperial'
            ? 'fahrenheit'
            : 'celsius';

    const windSpeedUnit =
        units === 'imperial'
            ? 'mph'
            : 'kmh';

    const params = new URLSearchParams({

        latitude: lat,
        longitude: lon,

        current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'weather_code',
            'wind_speed_10m',
            'wind_direction_10m',
            'surface_pressure',
            'is_day'
        ].join(','),

        daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'sunrise',
            'sunset'
        ].join(','),

        temperature_unit: temperatureUnit,
        wind_speed_unit: windSpeedUnit,

        timezone: 'auto',

        forecast_days: 5
    });

    return `${WEATHER_API_URL}?${params.toString()}`;
}


// ======================================================
// Get Weather By Coordinates
// ======================================================

async function getWeatherByCoords(lat, lon, units = 'metric') {

    if (
        typeof lat !== 'number' ||
        typeof lon !== 'number' ||
        Number.isNaN(lat) ||
        Number.isNaN(lon)
    ) {
        throw new Error('Invalid location coordinates.');
    }

    const url = buildWeatherUrl(lat, lon, units);

    const weatherData = await requestJson(
        url,
        'Unable to load weather data.'
    );

    if (!weatherData.current || !weatherData.daily) {
        throw new Error('Weather data is incomplete.');
    }

    return weatherData;
}


// ======================================================
// Get Weather By City
// ======================================================

async function getWeatherByCity(cityName, units = 'metric') {

    const city = await getCityCoordinates(cityName);

    const weather = await getWeatherByCoords(
        city.latitude,
        city.longitude,
        units
    );

    return {
        city,
        weather
    };
}


// ======================================================
// Get Forecast By City
// ======================================================

async function getForecast(cityName, units = 'metric') {

    const city = await getCityCoordinates(cityName);

    const weather = await getWeatherByCoords(
        city.latitude,
        city.longitude,
        units
    );

    return {
        city,
        daily: weather.daily,
        daily_units: weather.daily_units
    };
}


// ======================================================
// Get Weather By Current Location
// ======================================================

async function getWeatherByCurrentLocation(units = 'metric') {

    return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {
            reject(
                new Error(
                    'Geolocation is not supported by your browser.'
                )
            );

            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {

                try {

                    const {
                        latitude,
                        longitude
                    } = position.coords;

                    const weather =
                        await getWeatherByCoords(
                            latitude,
                            longitude,
                            units
                        );

                    resolve({
                        latitude,
                        longitude,
                        weather
                    });

                } catch (error) {
                    reject(error);
                }
            },

            (error) => {

                switch (error.code) {

                    case 1:
                        reject(
                            new Error(
                                'Location permission was denied. Please search for a city manually.'
                            )
                        );
                        break;

                    case 2:
                        reject(
                            new Error(
                                'Your current location is unavailable.'
                            )
                        );
                        break;

                    case 3:
                        reject(
                            new Error(
                                'Location request timed out. Please try again.'
                            )
                        );
                        break;

                    default:
                        reject(
                            new Error(
                                'Unable to get your current location.'
                            )
                        );
                }
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    });
}