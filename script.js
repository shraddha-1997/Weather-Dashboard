const apiKey = 'e0944675bf4208328f7acb08a5691f8c'; // Your API key

const customWeatherIcons = {
    "01d": "assets/sunny.png",   // Clear sky (day)
    "01n": "assets/clear-night.png",
    "02d": "assets/partly-cloudy.png", 
    "02n": "assets/partly-cloudy-night.png",
    "03d": "assets/cloudy.png",
    "03n": "assets/cloudy.png",
    "04d": "assets/overcast.png",
    "04n": "assets/overcast.png",
    "09d": "assets/rain.png",
    "09n": "assets/rain.png",
    "10d": "assets/heavy-rain.png",
    "10n": "assets/heavy-rain.png",
    "11d": "assets/thunderstorm.png",
    "11n": "assets/thunderstorm.png",
    "13d": "assets/snow.png",
    "13n": "assets/snow.png",
    "50d": "assets/mist.png",
    "50n": "assets/mist.png"
};
 


// ✅ Function to Fetch Weather Data by City Name
async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");

        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        alert(error.message);
    }
}

// ✅ Get Weather by Geolocation
document.getElementById("locationBtn").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Location not found");

            const data = await response.json();
            displayWeather(data);
        } catch (error) {
            alert(error.message);
        }
    });






});// ✅ FIXED Function to Display Weather Data
function displayWeather(data) {
    console.log("🌍 Full weather data:", data); // Debugging log

    // ✅ Update City Name
    if (data.city && data.city.name) {
        document.getElementById("cityName").innerText = data.city.name;
    } else {
        console.error("⛔ City name is missing in API response!");
    }

    // ✅ Update Clock if Timezone Exists
    if (data.city && data.city.timezone) {
        updateClock(data.city.timezone);
    } else {
        console.error("⛔ Timezone is missing!");
    }

    // ✅ Get CURRENT Weather Data (data.list[0])
    if (!data.list || data.list.length === 0) {
        console.error("⛔ No forecast data available!");
        return; // Stop execution if no weather data
    }

    const weather = data.list[0];

    // ✅ Update Current Weather Details
    document.getElementById("temperature").innerText = `${Math.round(weather.main.temp)}°C`;
    document.getElementById("feelsLike").innerText = `${Math.round(weather.main.feels_like)}°C`;
    document.getElementById("weatherDescription").innerText = weather.weather[0].description;

    // ✅ Use Custom Weather Icon for Main Weather Display
    const weatherCode = weather.weather[0].icon; // e.g., "01d", "10n"
    const customIcon = customWeatherIcons[weatherCode] || "assets/default.png"; // Fallback if icon is missing
    document.getElementById("weatherIcon").src = customIcon;

    document.getElementById("humidity").innerText = `${weather.main.humidity}%`;
    document.getElementById("windSpeed").innerText = `${weather.wind.speed} km/h`;
    document.getElementById("pressure").innerText = `${weather.main.pressure} hPa`;

   if (data.city && data.city.sunrise && data.city.sunset) {
    const timezoneOffset = data.city.timezone; // Timezone offset in SECONDS
    const sunriseUTC = data.city.sunrise; // Sunrise time in UNIX UTC (Seconds)
    const sunsetUTC = data.city.sunset;   // Sunset time in UNIX UTC (Seconds)

    console.log("🌅 Raw API Data:", {
        sunriseUTC,
        sunsetUTC,
        timezoneOffset
    });

    // Convert timestamps using fixed function
    const sunriseTime = convertTimestamp(sunriseUTC, timezoneOffset);
    const sunsetTime = convertTimestamp(sunsetUTC, timezoneOffset);

    // Show in UI
    document.getElementById("sunrise").innerText = sunriseTime;
    document.getElementById("sunset").innerText = sunsetTime;

    console.log(`✅ Converted Sunrise: ${sunriseTime} | Sunset: ${sunsetTime}`);
} else {
    console.error("⛔ Sunrise/Sunset data is missing from API!");
}

    
    // ✅ FIXED Timestamp Conversion Function
    function convertTimestamp(utcSeconds, timezoneOffset) {
        // Create a Date object in UTC
        const utcDate = new Date(utcSeconds * 1000);
    
        // Convert UTC time to local time using the offset
        const localDate = new Date(utcDate.getTime() + (timezoneOffset * 1000));
    
        // Debugging logs
        console.log("🕒 Debugging Timestamp Conversion:", {
            "UTC Timestamp": utcSeconds,
            "UTC Date": utcDate.toISOString(),
            "Timezone Offset (Seconds)": timezoneOffset,
            "Local Date": localDate.toISOString(),
            "Final Display Time": localDate.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })
        });
    
        // Format it in 24-hour format
        return localDate.toLocaleTimeString("en-GB", { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false // Ensures 24-hour format
        });
    }
    
    

    // ✅ Update the 5-Day Forecast Display with Custom Icons
    const fiveDayForecast = document.getElementById("fiveDayForecast");
    fiveDayForecast.innerHTML = ""; // Clear old data

    const dailyData = getFiveDayForecast(data);
    dailyData.forEach(entry => {
        const dateObj = new Date(entry.dt_txt);
        const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'long' });
        const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        // ✅ Use custom weather icon instead of OpenWeather icon
        const dailyWeatherCode = entry.weather[0].icon;
        const dailyCustomIcon = customWeatherIcons[dailyWeatherCode] || "assets/default.png";

        fiveDayForecast.innerHTML += `
        <div class="forecast-item">
            <img src="${dailyCustomIcon}" alt="Weather Icon">
            <span class="temp">${Math.round(entry.main.temp)}°C</span>
            <span class="date">${dayName}, ${formattedDate}</span>
        </div>
    `;
    });

    // ✅ Wind Icons Array (KEPT UNCHANGED)
    const windIcons = [
        "assets/1.png",
        "assets/2.png",
        "assets/3.png",
        "assets/1.png",
        "assets/2.png"
    ];

    // ✅ Update the Hourly Forecast Display with Custom Icons
    const hourlyForecast = document.getElementById("hourlyForecast");
    hourlyForecast.innerHTML = ""; // Clear old data

    const hourlyData = getHourlyForecast(data);
    hourlyData.forEach((entry, index) => {
        const time = new Date(entry.dt_txt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        // ✅ Use custom weather icon for hourly forecast
        const hourlyWeatherCode = entry.weather[0].icon;
        const hourlyCustomIcon = customWeatherIcons[hourlyWeatherCode] || "assets/default.png";

        hourlyForecast.innerHTML += `
        <div class="hourly-item">
            <span class="time">${time}</span>
            <img src="${hourlyCustomIcon}" alt="Weather Icon">
            <span class="temp">${Math.round(entry.main.temp)}°C</span>
            <img src="${windIcons[index % windIcons.length]}" alt="Wind Icon" class="wind-icon">
            <span class="wind">${entry.wind.speed} km/h</span>
        </div>
    `;
    });

} // ✅ END of displayWeather function
function convertTimestamp(timestamp, timezoneOffset) {
    const localMilliseconds = (timestamp + timezoneOffset) * 1000; // Convert both to milliseconds
    const localTime = new Date(localMilliseconds);
    
    return localTime.toLocaleTimeString("en-GB", { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false // Ensures 24-hour format
    });
}







if (data.city && data.city.name) {
    document.getElementById("cityName").innerText = data.city.name;
}

const weather = data.list[0]; // Current weather data
document.getElementById("temperature").innerText = `${Math.round(weather.main.temp)}°C`;
document.getElementById("feelsLike").innerText = `${Math.round(weather.main.feels_like)}°C`;
document.getElementById("weatherDescription").innerText = weather.weather[0].description;
document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;

document.getElementById("humidity").innerText = `${weather.main.humidity}%`;
document.getElementById("windSpeed").innerText = `${weather.wind.speed} km/h`;
document.getElementById("pressure").innerText = `${weather.main.pressure} hPa`;
document.getElementById("uvIndex").innerText = "--"; // (Need API for UV data)

// ✅ Fixes the timezone offset issue
function convertTimestamp(timestamp, timezoneOffset) {
    const localTime = new Date((timestamp + timezoneOffset) * 1000); // Convert UNIX time + offset
    return localTime.toLocaleTimeString("en-GB", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Ensures 24-hour format
    });
}







// ✅ Extract 5-Day Forecast (1 Entry Per Day)
function getFiveDayForecast(data) {
    const dailyForecast = {};

    data.list.forEach(entry => {
        const date = new Date(entry.dt_txt).toDateString();
        if (!dailyForecast[date]) {
            dailyForecast[date] = entry; // Store only the first entry per day
        }
    });

    return Object.values(dailyForecast).slice(0, 5); // Get only 5 days
}

// ✅ Extract Hourly Forecast (Next 5 Hours)
function getHourlyForecast(data) {
    return data.list.slice(0, 5); // First 5 data points = next 5 hours
}


// ✅ Function to Update Clock Based on Timezone
function updateClock(timezoneOffset) {
    setTimeout(() => {
        const clockTimeElement = document.getElementById("clock-time");
        const clockDateElement = document.getElementById("clock-date");

        if (!clockTimeElement || !clockDateElement) {
            console.error("⛔ Clock elements not found! Check your HTML IDs.");
            return;
        }

        function update() {
            const nowUTC = new Date();
            const cityTime = new Date(nowUTC.getTime() + timezoneOffset * 1000);

            // ✅ Format Time: HH:MM
            const hours = cityTime.getUTCHours().toString().padStart(2, '0');
            const minutes = cityTime.getUTCMinutes().toString().padStart(2, '0');
            clockTimeElement.innerText = `${hours}:${minutes}`;

            // ✅ Format Date: "Thursday, 31 Aug"
            const options = { weekday: 'long', day: 'numeric', month: 'short' };
            clockDateElement.innerText = cityTime.toLocaleDateString('en-GB', options);
        }

        update(); // Run immediately
        setInterval(update, 1000); // Update every second
    }, 500); // ✅ Small delay to ensure elements exist
}
































































