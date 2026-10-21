const input = document.getElementById("ciudad");
const boton = document.getElementById("buscar");
const resultado = document.getElementById("resultado");

boton.addEventListener("click", async () => {
  const nombre = input.value.trim();

  if (!nombre) {
    resultado.textContent = "Escribe una ciudad primero";
    return;
  }

  try {
    // 1. Convertir el nombre en coordenadas
    const resp1 = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nombre)}&count=1&language=es`);
    const datos1 = await resp1.json();

    if (!datos1.results) {
      resultado.textContent = "Ciudad no encontrada";
      return;
    }

    const { latitude, longitude, name } = datos1.results[0];

    // 2. Pedir el clima con esas coordenadas
    const resp2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`);
    const datos2 = await resp2.json();

    // 3. Mostrarlo en la página
    resultado.textContent = `${name}: ${datos2.current.temperature_2m}°C, viento ${datos2.current.wind_speed_10m} km/h`;
  } catch (error) {
    resultado.textContent = "Error de conexión, intenta de nuevo";
  }
});