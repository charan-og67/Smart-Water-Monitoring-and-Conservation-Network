// Experiment 4: ES6 + OpenWeatherMap + Graphs
// Demonstrates arrow functions, callbacks, promises, async/await,
// template literals, const/let, map(), reduce(), and localStorage.

// Sample water-quality measurements used for the graph.
// Replace these with database/API values in a later experiment.
const waterQuality = [
  { time: "08:00", ph: 7.1, tds: 310, temperature: 24.5 },
  { time: "10:00", ph: 7.3, tds: 325, temperature: 26.2 },
  { time: "12:00", ph: 7.2, tds: 340, temperature: 28.1 },
  { time: "14:00", ph: 7.0, tds: 355, temperature: 29.0 },
  { time: "16:00", ph: 7.2, tds: 330, temperature: 27.4 },
  { time: "18:00", ph: 7.4, tds: 315, temperature: 25.6 }
];

let temperatureChart;
let rainfallChart;
let waterChart;

const $ = (id) => document.getElementById(id);

// Callback example: receive processed data and update the UI.
const updateStatus = (message, type, callback) => {
  const box = $("weatherMsg");
  box.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  if (callback) callback();
};

// Promise example: converts the API response into the required structure.
const fetchWeatherPromise = (url) =>
  fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(`Weather request failed (${response.status}).`);
    }
    return response.json();
  }).then(data => ({
    city: data.city?.name ?? "Unknown",
    list: data.list ?? []
  }));

// Arrow function + map(): normalize the OpenWeatherMap forecast points.
const normalizeForecast = (list) => list.map(item => ({
  label: new Date(item.dt * 1000).toLocaleString([], {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  }),
  temperature: Number(item.main.temp),
  rainfall: Number(item.rain?.["3h"] ?? 0)
}));

// Reduce example: total expected rain in the displayed forecast.
const totalRainfall = (points) =>
  points.reduce((total, point) => total + point.rainfall, 0);

const drawTemperatureChart = (points) => {
  temperatureChart?.destroy();
  temperatureChart = new Chart($("temperatureChart"), {
    type: "line",
    data: {
      labels: points.map(p => p.label),
      datasets: [{
        label: "Weather temperature (°C)",
        data: points.map(p => p.temperature),
        tension: 0.3,
        fill: false
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
  $("temperatureChart").parentElement.style.height = "320px";
};

const drawRainfallChart = (points) => {
  rainfallChart?.destroy();
  rainfallChart = new Chart($("rainfallChart"), {
    type: "bar",
    data: {
      labels: points.map(p => p.label),
      datasets: [{
        label: "Rainfall (mm / 3h)",
        data: points.map(p => p.rainfall)
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
  $("rainfallChart").parentElement.style.height = "320px";
};

const drawWaterChart = () => {
  waterChart?.destroy();
  waterChart = new Chart($("waterChart"), {
    type: "line",
    data: {
      labels: waterQuality.map(row => row.time),
      datasets: [
        {
          label: "pH",
          data: waterQuality.map(row => row.ph),
          yAxisID: "y"
        },
        {
          label: "TDS (mg/L)",
          data: waterQuality.map(row => row.tds),
          yAxisID: "y1"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { position: "left", title: { display: true, text: "pH" } },
        y1: { position: "right", title: { display: true, text: "TDS (mg/L)" }, grid: { drawOnChartArea: false } }
      }
    }
  });
  $("waterChart").parentElement.style.height = "350px";
};

// Async/await example: the main weather-loading operation.
const loadWeather = async (event) => {
  event?.preventDefault();

  const apiKeyInput = $("apiKey");
  const city = $("city").value.trim();
  const country = $("country").value.trim().toUpperCase();
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    updateStatus("Enter an OpenWeatherMap API key first.", "warning");
    return;
  }

  localStorage.setItem("smartWaterApiKey", apiKey);
  localStorage.setItem("smartWaterCity", city);
  localStorage.setItem("smartWaterCountry", country);

  $("apiStatus").textContent = "Loading...";
  $("apiStatus").className = "badge text-bg-warning";

  try {
    const url =
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},${encodeURIComponent(country)}&units=metric&appid=${encodeURIComponent(apiKey)}`;

    // Promise is awaited here, demonstrating async/await.
    const weatherData = await fetchWeatherPromise(url);
    const points = normalizeForecast(weatherData.list);

    if (!points.length) throw new Error("No forecast data was returned.");

    $("currentTemp").textContent = `${points[0].temperature.toFixed(1)} °C`;
    $("currentRain").textContent = `${points[0].rainfall.toFixed(1)} mm / 3h`;
    $("apiStatus").textContent = `Connected: ${weatherData.city}`;
    $("apiStatus").className = "badge text-bg-success";

    drawTemperatureChart(points);
    drawRainfallChart(points);
    drawWaterChart();

    const rainTotal = totalRainfall(points);
    updateStatus(
      `Weather loaded for ${weatherData.city}. Displayed forecast rainfall total: ${rainTotal.toFixed(1)} mm.`,
      "success",
      () => console.log("Dashboard updated using callback.")
    );
  } catch (error) {
    $("apiStatus").textContent = "API error";
    $("apiStatus").className = "badge text-bg-danger";
    updateStatus(
      `${error.message} Check your API key, city, internet connection, and OpenWeatherMap access.`,
      "danger"
    );
  }
};

// Restore saved settings.
$("apiKey").value = localStorage.getItem("smartWaterApiKey") ?? "";
$("city").value = localStorage.getItem("smartWaterCity") ?? "Hyderabad";
$("country").value = localStorage.getItem("smartWaterCountry") ?? "IN";

$("weatherForm").addEventListener("submit", loadWeather);

// Draw water-quality graph immediately, even before a weather API key is entered.
drawWaterChart();
