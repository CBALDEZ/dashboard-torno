// DASHBOARD DO TORNO - histórico real do Supabase
const DEMO_MODE = false;

// Recoloque aqui os mesmos dados que você já usou:
const SUPABASE_URL = "https://vcnjemexbhxagtpjlzmp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_up662sIeTAobe0N5u4UcaA_1ES_2wUi";

const vibHistory = [];
const tempHistory = [];
const maxPoints = 50;

function fmt(n, digits = 2) {
  return Number(n).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function conditionFromData(d) {
  if (d.rms >= 0.40 || d.temperatura >= 70) return "ALARME";
  if (d.rms >= 0.25 || d.temperatura >= 60) return "ATENÇÃO";
  return "NORMAL";
}

function renderCurrentData(d) {
  document.getElementById("machineStatus").textContent = d.running ? "LIGADA" : "PARADA";
  document.getElementById("horimetro").textContent = fmt(d.horimetro, 2) + " h";
  document.getElementById("rms").textContent = fmt(d.rms, 3) + " g";
  document.getElementById("pico").textContent = fmt(d.pico, 3) + " g";
  document.getElementById("crest").textContent = fmt(d.crest, 2);
  document.getElementById("temperatura").textContent =
    d.temperatura == null ? "-- °C" : fmt(d.temperatura, 1) + " °C";
  document.getElementById("rmsNow").textContent = fmt(d.rms, 3) + " g";
  document.getElementById("tempNow").textContent =
    d.temperatura == null ? "-- °C" : fmt(d.temperatura, 1) + " °C";

  const status = conditionFromData(d);
  const cond = document.getElementById("overallStatus");
  cond.textContent = status;
  cond.className = "condition " +
    (status === "ALARME" ? "alarm" : status === "ATENÇÃO" ? "warning" : "normal");

  document.getElementById("lastUpdate").textContent =
    "Última atualização: " + new Date(d.created_at).toLocaleString("pt-BR");
}

function renderHistory(records) {
  vibHistory.length = 0;
  tempHistory.length = 0;

  records.forEach(d => {
    vibHistory.push(Number(d.rms) || 0);
    tempHistory.push(d.temperatura == null ? 0 : Number(d.temperatura));
  });

  drawChart("vibrationChart", vibHistory, "g");
  drawChart("temperatureChart", tempHistory, "°C");

  const tbody = document.getElementById("historyBody");
  const latestFirst = [...records].reverse().slice(0, 10);

  tbody.innerHTML = latestFirst.map(x => {
    const status = conditionFromData(x);
    return `
      <tr>
        <td>${new Date(x.created_at).toLocaleTimeString("pt-BR")}</td>
        <td>${x.running ? "LIGADA" : "PARADA"}</td>
        <td>${fmt(x.horimetro, 2)} h</td>
        <td>${fmt(x.rms, 3)} g</td>
        <td>${fmt(x.pico, 3)} g</td>
        <td>${fmt(x.crest, 2)}</td>
        <td>${x.temperatura == null ? "--" : fmt(x.temperatura, 1) + " °C"}</td>
        <td>${status}</td>
      </tr>`;
  }).join("");
}

function drawChart(canvasId, values, unit) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const w = Math.max(400, Math.floor(rect.width * ratio));
  const h = Math.max(220, Math.floor(270 * ratio));

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  ctx.clearRect(0, 0, w, h);
  if (!values.length) return;

  const padL = 58 * ratio, padR = 18 * ratio, padT = 20 * ratio, padB = 38 * ratio;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const minRaw = Math.min(...values), maxRaw = Math.max(...values);
  let range = maxRaw - minRaw;
  if (range < 0.01) range = unit === "g" ? 0.01 : 2.0;

  const minY = Math.max(0, minRaw - range * 0.20);
  const maxY = maxRaw + range * 0.20;

  ctx.strokeStyle = "#d9e0e6";
  ctx.lineWidth = 1 * ratio;
  ctx.fillStyle = "#68737d";
  ctx.font = `${11 * ratio}px Arial`;

  for (let i = 0; i <= 4; i++) {
    const y = padT + (plotH * i / 4);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();

    const val = maxY - ((maxY - minY) * i / 4);
    ctx.fillText(val.toFixed(unit === "g" ? 3 : 1), 5 * ratio, y + 4 * ratio);
  }

  if (values.length === 1) return;

  ctx.strokeStyle = "#2457a6";
  ctx.lineWidth = 2.2 * ratio;
  ctx.beginPath();

  values.forEach((v, i) => {
    const x = padL + (i / (values.length - 1)) * plotW;
    const y = padT + (1 - (v - minY) / (maxY - minY)) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

async function updateDashboard() {
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/machine_data?select=*&order=created_at.desc&limit=${maxPoints}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);

    let data = await response.json();
    if (!data.length) return;

    data = data.reverse(); // ordem cronológica para o gráfico
    const latest = data[data.length - 1];

    renderCurrentData(latest);
    renderHistory(data);

    document.getElementById("cloudBadge").textContent = "NUVEM CONECTADA";
    document.getElementById("cloudBadge").className = "badge online";
  } catch (erro) {
    console.error("Erro ao acessar Supabase:", erro);
    document.getElementById("cloudBadge").textContent = "ERRO NA NUVEM";
    document.getElementById("cloudBadge").className = "badge offline";
  }
}

document.getElementById("cloudBadge").textContent = "CONECTANDO...";
document.getElementById("cloudBadge").className = "badge offline";

updateDashboard();
setInterval(updateDashboard, 5000);

window.addEventListener("resize", () => {
  drawChart("vibrationChart", vibHistory, "g");
  drawChart("temperatureChart", tempHistory, "°C");
});
