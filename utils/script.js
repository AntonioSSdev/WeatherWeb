const inputNav = document.getElementById("ciudad");
const botonNav = document.getElementById("buscar");
const inputRes = document.getElementById("ciudad2");
const botonRes = document.getElementById("buscar2");
const seccion = document.getElementById("navegacion");
const resultado = document.getElementById("resultado");

// Tabla de códigos del clima -> [emoji, texto]
const codigos = {
  0: ["☀️", "Despejado"],
  1: ["🌤️", "Mayormente despejado"],
  2: ["⛅", "Parcialmente nublado"],
  3: ["☁️", "Nublado"],
  45: ["🌫️", "Niebla"],
  48: ["🌫️", "Niebla"],
  51: ["🌦️", "Llovizna"],
  53: ["🌦️", "Llovizna"],
  55: ["🌦️", "Llovizna"],
  61: ["🌧️", "Lluvia ligera"],
  63: ["🌧️", "Lluvia"],
  65: ["🌧️", "Lluvia fuerte"],
  71: ["🌨️", "Nieve ligera"],
  73: ["🌨️", "Nieve"],
  75: ["❄️", "Nieve fuerte"],
  80: ["🌦️", "Chubascos"],
  81: ["🌧️", "Chubascos"],
  82: ["⛈️", "Chubascos fuertes"],
  95: ["⛈️", "Tormenta"]
};

function infoClima(codigo) {
  return codigos[codigo] || ["❓", "Sin datos"];
}

// Baja suavemente hasta la sección de resultados
function irAlResultado() {
  seccion.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Hace la búsqueda y dibuja el resultado
async function buscarClima(nombre) {
  resultado.textContent = "Buscando...";

  try {
    const resp1 = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nombre)}&count=1&language=es`);
    const datos1 = await resp1.json();

    if (!datos1.results) {
      resultado.textContent = "Ciudad no encontrada";
      return;
    }

    const { latitude, longitude, name } = datos1.results[0];

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,wind_speed_10m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&timezone=auto`;
    const resp2 = await fetch(url);
    const datos2 = await resp2.json();

    const [emoji, texto] = infoClima(datos2.current.weather_code);
    let html = `
      <h3>${name}</h3>
      <p class="actual">${emoji} ${datos2.current.temperature_2m}°C · ${texto}</p>
      <p>Viento: ${datos2.current.wind_speed_10m} km/h</p>
      <div class="dias">
    `;

    const d = datos2.daily;
    for (let i = 0; i < d.time.length; i++) {
      const [emojiDia] = infoClima(d.weather_code[i]);
      const dia = new Date(d.time[i] + "T00:00").toLocaleDateString("es-CL", { weekday: "short" });
      html += `
        <div class="tarjeta">
          <strong>${dia}</strong>
          <span>${emojiDia}</span>
          <small>${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°</small>
        </div>
      `;
    }

    html += `</div>`;
    resultado.innerHTML = html;
  } catch (error) {
    resultado.textContent = "Error de conexión, intenta de nuevo";
  }
}

// Se ejecuta desde cualquiera de los dos buscadores
function lanzarBusqueda(origen) {
  const nombre = origen.value.trim();

  if (!nombre) {
    origen.focus();
    return;
  }

  // Mantiene ambos inputs con el mismo texto
  inputNav.value = nombre;
  inputRes.value = nombre;

  irAlResultado();
  buscarClima(nombre);
}

// Botones
botonNav.addEventListener("click", () => lanzarBusqueda(inputNav));
botonRes.addEventListener("click", () => lanzarBusqueda(inputRes));

// Tecla Enter
inputNav.addEventListener("keydown", (e) => {
  if (e.key === "Enter") lanzarBusqueda(inputNav);
});
inputRes.addEventListener("keydown", (e) => {
  if (e.key === "Enter") lanzarBusqueda(inputRes);
});