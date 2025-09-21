const input = document.getElementById("shortUrl");
const historyList = document.getElementById("historyList");

let history = JSON.parse(localStorage.getItem("history")) || [];
renderHistory();

input.addEventListener("paste", (e) => {
  setTimeout(() => {
    let url = input.value.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    // abrir al toque
    window.open(url, "_blank");

    // expandir en segundo plano y guardar en historial
    expandUrl(url, false);
  }, 10);
});

async function expandUrl(url, autoOpen = true) {
  try {
    const res = await fetch("/expand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    if (data.error) return;

    const finalUrl = data.finalUrl;

    const item = {
      original: url,
      expanded: finalUrl,
      date: new Date().toLocaleString(),
    };
    history.unshift(item);
    if (history.length > 10) history.pop();
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();

    // solo abrir si lo pedimos
    if (autoOpen) {
      window.open(finalUrl, "_blank");
    }
  } catch (err) {
    console.error("Error expandiendo URL:", err);
  }
}

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
