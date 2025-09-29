const API_KEY = "27f2ac3a022c0a20a9ba544face76008";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const input = document.getElementById("cityInput");
const button = document.getElementById("getWeatherBtn");
const result = document.getElementById("weatherResult");
const forecastDiv = document.getElementById("forecast");

// Format time using timezone offset
function formatLocalTime(timezone) {
  const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
  const localTime = new Date(nowUTC.getTime() + timezone * 1000);
  return localTime.toLocaleString("en-US", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// Get current weather
async function getWeather(city) {
  try {
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    const temperature = data.main.temp;
    const feelsLike = data.main.feels_like;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const countryCode = data.sys.country;
    const timezone = data.timezone; // seconds offset from UTC

    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const flagUrl = `https://flagsapi.com/${countryCode}/flat/32.png`;
    const localTime = formatLocalTime(timezone);

    result.innerHTML = `
      <h3>
        Weather in ${city}, ${countryCode} 
        <img src="${flagUrl}" alt="flag">
      </h3>
      <p><b>🕒 Local Time:</b> ${localTime}</p>
      <p>
        <img src="${iconUrl}" alt="weather"> 
        🌡 Temp: ${temperature}°C (Feels like ${feelsLike}°C)
      </p>
      <p>☁ Condition: ${description}</p>
      <p>💧 Humidity: ${humidity}% | 🌬 Wind: ${wind} m/s</p>
    `;

    changeBackground(description);
    getForecast(city);
  } catch (error) {
    result.innerHTML = `<p style="color:red;">❌ ${error.message}</p>`;
    forecastDiv.innerHTML = "";
  }
}

// Get 3-day forecast
async function getForecast(city) {
  try {
    const url = `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not available");

    const data = await response.json();

    const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 3);

    forecastDiv.innerHTML = `
      <h3>3-Day Forecast</h3>
      <div class="forecast">
        ${dailyForecasts.map(day => {
          const date = new Date(day.dt_txt).toDateString();
          const temp = day.main.temp;
          const icon = day.weather[0].icon;
          const desc = day.weather[0].description;
          return `
            <div class="forecast-day">
              <h4>${date}</h4>
              <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
              <p>${temp}°C</p>
              <p>${desc}</p>
            </div>
          `;
        }).join("")}
      </div>
    `;
  } catch (error) {
    forecastDiv.innerHTML = `<p style="color:red;">❌ ${error.message}</p>`;
  }
}

// Change background color by weather
function changeBackground(desc) {
  desc = desc.toLowerCase();
  if (desc.includes("cloud")) {
    document.body.style.background = "#d3d3d3";
  } else if (desc.includes("rain")) {
    document.body.style.background = "#87a6d5";
  } else if (desc.includes("clear")) {
    document.body.style.background = "#87ceeb";
  } else {
    document.body.style.background = "#f1f1f1";
  }
}

button.addEventListener("click", () => {
  const city = input.value.trim();
  if (city) {
    getWeather(city);
  } else {
    result.innerHTML = `<p style="color:red;">❌ Please enter a city name!</p>`;
    forecastDiv.innerHTML = "";
  }
});
