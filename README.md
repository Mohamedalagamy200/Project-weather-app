# Weather App

A responsive weather dashboard built with vanilla HTML, CSS, and JavaScript. It lets users search for a city or use their current location to view current conditions, weather details, and a five-day forecast.

## Overview

The app combines Open-Meteo geocoding and forecast services with browser geolocation to provide weather information without requiring an API key. The interface supports English and Arabic labels, Celsius and Fahrenheit units, local weather icons, and backgrounds that adapt to the current condition and day/night state.

## Features

- Search for a city using the Open-Meteo Geocoding API
- Use the browser's current location through the Geolocation API
- Display current temperature, feels-like temperature, daily high and low, humidity, wind speed and direction, pressure, sunrise, and sunset
- Render a five-day forecast with daily temperatures, dates, descriptions, and icons
- Switch between Celsius and Fahrenheit, including corresponding wind-speed units
- Persist the last searched city and selected temperature unit with `localStorage`
- Map Open-Meteo WMO weather codes to readable conditions and local SVG icons
- Adapt the page background to clear, cloudy, foggy, rainy, snowy, thunderstorm, and night conditions
- Provide loading, validation, network, API, geolocation, and incomplete-data error states
- Support responsive layouts for desktop and mobile screen sizes
- Include keyboard focus styles, live status messaging, reduced-motion support, and descriptive image alternatives

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript using `fetch` and `URLSearchParams`
- Open-Meteo Forecast API
- Open-Meteo Geocoding API
- Browser Geolocation API
- Browser `localStorage` API
- Google Fonts: Cairo
- Local SVG weather icons

## How It Works

```text
City search
  -> Open-Meteo Geocoding API
  -> Latitude and longitude
  -> Open-Meteo Forecast API
  -> Weather-code and value formatting
  -> Current weather and five-day forecast rendering
```

For location-based weather, the browser first supplies coordinates through `navigator.geolocation`; those coordinates are then sent directly to the forecast endpoint. On the initial load, the app attempts to use the current location and falls back to Cairo if that request cannot be completed.

## API Integration

The app uses two Open-Meteo endpoints:

- **Geocoding API**: resolves a city name to coordinates, country information, and timezone. Arabic input selects Arabic geocoding results; other input uses English results.
- **Forecast API**: returns current conditions and five daily records. The request includes temperature, humidity, apparent temperature, weather code, wind, pressure, sunrise, sunset, day/night state, units, and automatic timezone handling.

The API layer validates coordinates and response shape, translates common HTTP failures into user-facing messages, and distinguishes network failures from service responses.

## Project Architecture

```text
.
├── index.html              # Application markup and script loading order
├── css/
│   └── style.css           # Layout, responsive rules, themes, and animations
├── js/
│   ├── config.js           # Open-Meteo endpoint constants
│   ├── api.js              # Geocoding, forecast, and geolocation requests
│   ├── main.js             # Application state and event coordination
│   ├── storage.js          # Persisted city and unit preferences
│   ├── ui.js               # Loading, errors, current weather, and forecast rendering
│   └── utils.js             # Formatting, WMO mapping, backgrounds, and debounce logic
├── assets/
│   └── icons/              # Local condition and fallback SVG icons
├── config.example.js       # Example endpoint configuration
└── .gitignore
```

The files are loaded as regular browser scripts in dependency order rather than as modules, so the project does not include a package manager, build step, or framework runtime.

## Technical Highlights

- Asynchronous API access is centralized in `api.js` and uses the Fetch API.
- `main.js` coordinates searches, location requests, unit changes, loading state, and stale-request protection through request IDs.
- `ui.js` creates forecast cards dynamically and updates the DOM with text content rather than injecting API response HTML.
- `utils.js` maps the full set of handled Open-Meteo WMO codes to readable descriptions and local icon assets.
- Weather data is requested in the selected unit system, using Celsius and km/h for metric mode or Fahrenheit and mph for imperial mode.
- The layout uses responsive flex-based sections, horizontal forecast scrolling on narrower widths, and dedicated mobile breakpoints.
- API and browser failures are surfaced through an alert region and an ARIA live status element, while loading disables the primary controls.

## User Experience

The interface presents a prominent city search, a separate current-location action, a temperature-unit toggle, and a weather summary that expands into detailed metrics and forecast cards after data is available. The visual atmosphere changes with the returned conditions, while subtle card and icon motion is disabled or reduced when the user prefers reduced motion. English and Arabic labels are presented together, and the search input adapts its direction for Arabic text.

## Author

Created by [Mohamed Alagamy](https://github.com/Mohamedalagamy200).