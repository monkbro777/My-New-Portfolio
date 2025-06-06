// API Configuration
const API_KEY = '4865cf14f46f27a263ef6d61c0b87e8b'; // OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const temp = document.getElementById('temp');
const wind = document.getElementById('wind');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');
const weatherIcon = document.getElementById('weather-icon');
const forecast = document.getElementById('forecast');
const terminalLog = document.getElementById('terminal-log');

// Weather Icons Mapping
const weatherIcons = {
    'Clear': 'fa-sun',
    'Clouds': 'fa-cloud',
    'Rain': 'fa-cloud-rain',
    'Drizzle': 'fa-cloud-rain',
    'Thunderstorm': 'fa-bolt',
    'Snow': 'fa-snowflake',
    'Mist': 'fa-smog',
    'Smoke': 'fa-smog',
    'Haze': 'fa-smog',
    'Dust': 'fa-smog',
    'Fog': 'fa-smog',
    'Sand': 'fa-smog',
    'Ash': 'fa-smog',
    'Squall': 'fa-wind',
    'Tornado': 'fa-wind'
};

// Terminal Log Function
function addTerminalLog(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    
    // Add different colors for different types of messages
    switch(type) {
        case 'error':
            logEntry.style.color = '#ff0000';
            break;
        case 'success':
            logEntry.style.color = '#00ff00';
            break;
        case 'scan':
            logEntry.style.color = '#ffff00';
            break;
        case 'system':
            logEntry.style.color = '#00ffff';
            break;
    }
    
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    terminalLog.appendChild(logEntry);
    terminalLog.scrollTop = terminalLog.scrollHeight;
}

// Glitch Effect Function
function glitchEffect(element) {
    element.style.textShadow = '0.05em 0 0 rgba(255, 0, 0, 0.75), -0.025em -0.05em 0 rgba(0, 255, 0, 0.75), 0.025em 0.05em 0 rgba(0, 0, 255, 0.75)';
    setTimeout(() => {
        element.style.textShadow = '';
    }, 200);
}

// Fetch Weather Data
async function fetchWeatherData(city) {
    try {
        addTerminalLog(`Initializing weather scan for ${city}...`, 'system');
        addTerminalLog(`Connecting to weather servers...`, 'scan');
        
        // Fetch current weather
        const currentWeatherUrl = `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`;
        addTerminalLog(`Requesting current weather data...`, 'scan');
        
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        
        if (!currentWeatherResponse.ok) {
            const errorData = await currentWeatherResponse.json();
            throw new Error(`API Error: ${errorData.message || 'Unknown error'}`);
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        addTerminalLog(`Current weather data received successfully`, 'success');

        // Fetch 5-day forecast
        addTerminalLog(`Requesting 5-day forecast data...`, 'scan');
        const forecastUrl = `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`;
        
        const forecastResponse = await fetch(forecastUrl);
        
        if (!forecastResponse.ok) {
            const errorData = await forecastResponse.json();
            throw new Error(`Forecast API Error: ${errorData.message || 'Unknown error'}`);
        }
        
        const forecastData = await forecastResponse.json();
        addTerminalLog(`Forecast data received successfully`, 'success');

        updateWeatherUI(currentWeatherData, forecastData);
        addTerminalLog(`Weather dashboard updated for ${city}`, 'success');
    } catch (error) {
        console.error('Weather fetch error:', error);
        
        // More detailed error messages
        if (error.message.includes('API Error')) {
            addTerminalLog(`API Error: ${error.message}`, 'error');
            addTerminalLog('Please check your API key and internet connection', 'error');
        } else if (error.message.includes('Failed to fetch')) {
            addTerminalLog('Network Error: Unable to connect to weather servers', 'error');
            addTerminalLog('Please check your internet connection', 'error');
        } else {
            addTerminalLog(`Error: ${error.message}`, 'error');
        }
        
        glitchEffect(cityName);
    }
}

// Update UI with Weather Data
function updateWeatherUI(currentWeather, forecastData) {
    // Update current weather
    cityName.textContent = currentWeather.name;
    temp.textContent = Math.round(currentWeather.main.temp);
    wind.textContent = `${Math.round(currentWeather.wind.speed)} km/h`;
    humidity.textContent = `${currentWeather.main.humidity}%`;
    pressure.textContent = `${currentWeather.main.pressure} hPa`;

    // Update weather icon
    const weatherMain = currentWeather.weather[0].main;
    weatherIcon.className = `fas ${weatherIcons[weatherMain] || 'fa-question'}`;

    // Update forecast
    forecast.innerHTML = '';
    const dailyForecasts = forecastData.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    ).slice(0, 5);

    dailyForecasts.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        const date = new Date(day.dt * 1000);
        const weatherMain = day.weather[0].main;
        
        forecastItem.innerHTML = `
            <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <i class="fas ${weatherIcons[weatherMain] || 'fa-question'}"></i>
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
        `;
        
        forecast.appendChild(forecastItem);
    });

    // Add glitch effect to temperature
    glitchEffect(temp);
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        addTerminalLog('Please enter a city name', 'error');
        glitchEffect(cityInput);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Initial terminal animation
document.addEventListener('DOMContentLoaded', () => {
    addTerminalLog('System initialized...', 'system');
    addTerminalLog('Weather API connection established...', 'system');
    addTerminalLog('Ready to scan weather data...', 'system');
});

// Add typing effect to input
cityInput.addEventListener('focus', () => {
    cityInput.style.borderColor = 'var(--primary-color)';
    cityInput.style.boxShadow = '0 0 10px var(--glow-color)';
});

cityInput.addEventListener('blur', () => {
    cityInput.style.borderColor = '';
    cityInput.style.boxShadow = '';
}); 