const form = document.getElementById("urlForm");
const input = document.getElementById("shortUrl");
const historyList = document.getElementById("historyList");
const expandBtn = document.getElementById("expandBtn");
const btnText = expandBtn.querySelector(".btn-text");
const loader = expandBtn.querySelector(".loader");

let history = JSON.parse(localStorage.getItem("history")) || [];
renderHistory();

input.addEventListener("paste", () => {
  setTimeout(() => {
    form.requestSubmit();
  }, 50);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = input.value.trim();
  if (!url) return;

  btnText.style.display = "none";
  loader.style.display = "inline-block";
  expandBtn.disabled = true;

  try {
    await expandUrl(url);
    input.value = "";
  } finally {
    btnText.style.display = "inline";
    loader.style.display = "none";
    expandBtn.disabled = false;
  }
});

async function expandUrl(url) {
  try {
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

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
    const item = {
      original: url,
      expanded: finalUrl,
      date: new Date().toLocaleString(),
    };

    history.unshift(item);
    if (history.length > 10) history.pop();
    localStorage.setItem("history", JSON.stringify(history));

    renderHistory();
    window.open(finalUrl, "_blank");
  } catch {
    alert("Error de conexión con el servidor");
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
