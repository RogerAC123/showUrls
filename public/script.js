const input = document.getElementById("shortUrl");
const expandBtn = document.getElementById("expandBtn");
const historyList = document.getElementById("historyList");

// Cargar historial guardado
let history = JSON.parse(localStorage.getItem("history")) || [];
renderHistory();

expandBtn.addEventListener("click", async () => {
  const url = input.value.trim();
  if (!url) return alert("Por favor ingresa un enlace acortado");

  try {
    const res = await fetch("/expand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (data.error) {
      alert("Error al expandir: " + data.error);
      return;
    }

    const finalUrl = data.finalUrl;

    // Guardar en historial
    const item = {
      original: url,
      expanded: finalUrl,
      date: new Date().toLocaleString(),
    };
    history.unshift(item);
    if (history.length > 10) history.pop();
    localStorage.setItem("history", JSON.stringify(history));

    renderHistory();

    // Abrir automáticamente en una nueva pestaña
    window.open(finalUrl, "_blank");
  } catch (err) {
    alert("Error de conexión con el servidor");
  }
});

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.original}</strong>
      <div class="links">
        <a href="${item.expanded}" target="_blank">🔗 ${item.expanded}</a>
      </div>
      <small>${item.date}</small>
    `;
    historyList.appendChild(li);
  });
}
