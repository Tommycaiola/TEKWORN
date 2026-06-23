/* ==============================================
   TEKWORN — Deploy CTA  |  Animation logic
   ============================================== */

// ↓ Replace with your local path, e.g. "/img/transparentlogo_whitecopia.png"
const LOGO_URL = "https://media.base44.com/images/public/6a3aaf6eb321a9a55f21b3d1/ace62fcf4_transparentlogo_whitecopia.png";

const PHASES = [
  { type: "word",    text: "connetti",           duration: 1800 },
  { type: "word",    text: "automatizza",        duration: 1800 },
  { type: "word",    text: "scala",              duration: 1800 },
  { type: "tagline", text: "SOLUZIONI SU MISURA", duration: 2400 },
  { type: "logo",                             duration: 4000 },
];

const LOG_LINES = [
  "$ initializing pipeline...",
  "→ connecting services [3/3]",
  "→ building automation layer",
  "→ deploying modules ████████ 100%",
  "→ scaling infrastructure...",
  "✓ all systems operational",
  "✓ deploy complete",
];

const stage           = document.getElementById("stage");
const terminal        = document.getElementById("terminal");
const progressFill    = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const scanLine        = document.getElementById("scanLine");

let started = false;
let currentPhase = -1;
let phaseTimeout = null;
let lineInterval = null;

/* ===== Auto-start when the section scrolls into view ===== */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !started) {
        started = true;
        scanLine.classList.remove("hidden");
        setTimeout(() => advance(0), 600);
      }
    });
  },
  { threshold: 0.4 }
);
observer.observe(document.getElementById("ctaSection"));

/* ===== Phase progression ===== */
function advance(index) {
  if (index >= PHASES.length) return;
  currentPhase = index;
  renderPhase(PHASES[index]);
  updateProgress(index);
  phaseTimeout = setTimeout(() => advance(index + 1), PHASES[index].duration);
}

function updateProgress(index) {
  const pct = Math.min(((index + 1) / PHASES.length) * 100, 100);
  progressFill.style.width = pct + "%";
  progressPercent.textContent = Math.round(pct) + "%";
  if (index === PHASES.length - 1) {
    scanLine.classList.add("hidden");
  }
}

/* ===== Render each phase ===== */
function renderPhase(phase) {
  // Exit animation for the previous stage item
  const oldItem = stage.querySelector(".stage-item");
  if (oldItem) {
    const word = oldItem.querySelector(".word");
    if (word) {
      word.classList.remove("anim-word-in");
      word.classList.add("anim-word-out");
    }
    setTimeout(() => oldItem.remove(), 500);
  }

  if (phase.type === "word") {
    renderWord(phase.text);
    renderTerminalLines(currentPhase);
  } else if (phase.type === "tagline") {
    renderTagline();
    renderTerminalLines(currentPhase);
  } else if (phase.type === "logo") {
    renderLogo();
    terminal.innerHTML = "";
  }
}

function renderWord(text) {
  const item = document.createElement("div");
  item.className = "stage-item";
  // Word sits inside a fixed-width container; cursor is absolutely
  // positioned at the right edge so it never pushes the text around.
  item.innerHTML = `
    <div class="word-container">
      <h2 class="word anim-word-in">${text}</h2>
      <span class="cursor">_</span>
    </div>
  `;
  stage.appendChild(item);
}

function renderTagline() {
  const item = document.createElement("div");
  item.className = "stage-item tagline-group";
  item.innerHTML = `
    <div class="deploy-success anim-tagline-success">✓ deploy successful</div>
    <h2 class="tagline anim-tagline-title">SOLUZIONI SU MISURA</h2>
  `;
  stage.appendChild(item);
}

function renderLogo() {
  const item = document.createElement("div");
  item.className = "stage-item logo-group";
  item.innerHTML = `
    <img src="${LOGO_URL}" alt="TEKWORN" class="logo-img anim-logo-in" />
    <div class="logo-line anim-logo-line"></div>
    <p class="logo-subtitle anim-logo-subtitle">ready to build the future</p>
  `;
  stage.appendChild(item);
}

function renderTerminalLines(phase) {
  terminal.innerHTML = "";
  if (lineInterval) clearInterval(lineInterval);

  const maxLines = Math.min(phase + 2, LOG_LINES.length);
  let i = 0;
  lineInterval = setInterval(() => {
    if (i < maxLines) {
      const line = document.createElement("div");
      line.className = "line";
      line.textContent = LOG_LINES[i];
      terminal.appendChild(line);
      i++;
    } else {
      clearInterval(lineInterval);
    }
  }, 220);
}