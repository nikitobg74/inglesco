// ===============================
// Unit 1 - P5  Fill-in-the-blank
// ===============================

// ── i18n helpers ──────────────────────────────────────────────
function textFrom(id, fallback = "") {
  const el = document.getElementById(id);
  return el ? el.textContent.trim() : fallback;
}

const MSG_CORRECT     = textFrom("msg-correct",    "✅ ¡Correcto!");
const MSG_WRONG       = textFrom("msg-wrong",      "❌ Intenta de nuevo");
const MSG_HINT_PREFIX = textFrom("msg-hint-prefix","💡 Pista:");

// ── Load exercise data from embedded JSON ─────────────────────
const exercises = JSON.parse(
  document.getElementById("exercise-data").textContent
);

const MAX_WRONG = 2; // wrong attempts before hint appears

// ── State ─────────────────────────────────────────────────────
let currentIndex = 0;
const state = exercises.map(() => ({
  wrongCount : 0,
  solved     : false
}));

// ── DOM refs ──────────────────────────────────────────────────
const container  = document.getElementById("cards-container");
const prevBtn    = document.getElementById("prevBtn");
const nextBtn    = document.getElementById("nextBtn");
const counterEl  = document.getElementById("counter");

// ── Build all cards once ──────────────────────────────────────
const cards = exercises.map((ex, idx) => buildCard(ex, idx));

function buildCard(ex, idx) {
  // wrapper
  const card = document.createElement("div");
  card.className = "card" + (idx === 0 ? " active" : "");
  card.id = "card-" + idx;

  // image + audio overlay
  const imgWrap = document.createElement("div");
  imgWrap.className = "card-img-wrap";

  const img = document.createElement("img");
  img.src = ex.image;
  img.alt = ex.answer;

  const overlay = document.createElement("div");
  overlay.className = "audio-overlay";
  overlay.textContent = "🔊";

  const audio = new Audio(ex.audio);

  imgWrap.appendChild(img);
  imgWrap.appendChild(overlay);
  imgWrap.addEventListener("click", () => {
    audio.currentTime = 0;
    audio.play();
  });

  // body
  const body = document.createElement("div");
  body.className = "card-body";

  // phrase with blank
  const phrase = document.createElement("div");
  phrase.className = "phrase";

  const blankLen = Math.max(ex.answer.length + 2, 6);
  const placeholder = "_".repeat(blankLen);

  phrase.innerHTML =
    (ex.before ? escHtml(ex.before) + " " : "") +
    `<span style="color:#2563eb;font-weight:700">${placeholder}</span>` +
    (ex.after  ? " " + escHtml(ex.after)  : "");

  // attempt dots (2 dots = 2 allowed wrong attempts)
  const dots = document.createElement("div");
  dots.className = "attempts-dots";
  for (let i = 0; i < MAX_WRONG; i++) {
    const d = document.createElement("div");
    d.className = "dot";
    dots.appendChild(d);
  }

  // feedback + hint
  const feedbackEl = document.createElement("div");
  feedbackEl.className = "feedback";

  const hintEl = document.createElement("div");
  hintEl.className = "hint";

  // input + button row
  const inputRow = document.createElement("div");
  inputRow.className = "input-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "blank-input";
  input.placeholder = "Escribe aquí...";
  input.setAttribute("autocomplete", "off");
  input.setAttribute("autocorrect", "off");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("spellcheck", "false");

  const checkBtn = document.createElement("button");
  checkBtn.className = "check-btn";
  checkBtn.textContent = "Verificar ✓";

  inputRow.appendChild(input);
  inputRow.appendChild(checkBtn);

  // ── Check logic ────────────────────────────────────────────
  function doCheck() {
    if (state[idx].solved) return;

    const typed    = input.value.trim().toLowerCase();
    const expected = ex.answer.toLowerCase();

    if (typed === expected) {
      // Correct
      input.classList.remove("wrong");
      input.classList.add("correct");
      input.value = ex.answer;        // normalise capitalisation display
      input.disabled = true;
      checkBtn.disabled = true;
      feedbackEl.textContent = MSG_CORRECT;
      feedbackEl.style.color = "#22c55e";
      hintEl.textContent = "";
      state[idx].solved = true;

      // fill in the blank in the phrase display
      phrase.innerHTML =
        (ex.before ? escHtml(ex.before) + " " : "") +
        `<span style="color:#22c55e;font-weight:700">${escHtml(ex.answer)}</span>` +
        (ex.after  ? " " + escHtml(ex.after)  : "");

      updateNav();

    } else {
      // Wrong
      state[idx].wrongCount++;

      input.classList.remove("correct");
      input.classList.add("wrong");
      feedbackEl.textContent = MSG_WRONG;
      feedbackEl.style.color = "#ef4444";

      // Update dots
      const dotEls = dots.querySelectorAll(".dot");
      const fill = Math.min(state[idx].wrongCount, MAX_WRONG);
      for (let i = 0; i < dotEls.length; i++) {
        dotEls[i].classList.toggle("used", i < fill);
      }

      // Show hint after MAX_WRONG attempts
      if (state[idx].wrongCount >= MAX_WRONG) {
        hintEl.textContent = `${MSG_HINT_PREFIX} "${ex.answer}"`;

        // Hide hint after 4 s
        clearTimeout(hintEl._timer);
        hintEl._timer = setTimeout(() => {
          hintEl.textContent = "";
        }, 4000);
      }

      // Remove red border after short delay so shake re-triggers next time
      setTimeout(() => input.classList.remove("wrong"), 600);
    }
  }

  checkBtn.addEventListener("click", doCheck);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") doCheck();
  });
  // Clear feedback colour on new typing
  input.addEventListener("input", () => {
    feedbackEl.textContent = "";
  });

  body.appendChild(phrase);
  body.appendChild(dots);
  body.appendChild(hintEl);
  body.appendChild(feedbackEl);
  body.appendChild(inputRow);

  card.appendChild(imgWrap);
  card.appendChild(body);
  container.appendChild(card);

  return card;
}

// ── Navigation ────────────────────────────────────────────────
function showCard(idx) {
  cards.forEach((c, i) => c.classList.toggle("active", i === idx));
  currentIndex = idx;
  updateNav();
}

function updateNav() {
  counterEl.textContent = `Ejercicio ${currentIndex + 1} / ${exercises.length}`;
  prevBtn.disabled = currentIndex === 0;

  const isLast   = currentIndex === exercises.length - 1;
  const allSolved = state.every(s => s.solved);

  if (isLast) {
    nextBtn.textContent = "Finalizar →";
    nextBtn.disabled = !allSolved;
  } else {
    nextBtn.textContent = "Siguiente →";
    nextBtn.disabled = false;
  }
}

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) showCard(currentIndex - 1);
});

nextBtn.addEventListener("click", () => {
  if (currentIndex < exercises.length - 1) {
    showCard(currentIndex + 1);
  } else {
    // All done — go to next lesson page
    window.location.href = "final.html";
  }
});

// ── Progress bar ──────────────────────────────────────────────
const steps = document.querySelectorAll(".progress-container .step");
const currentPage = window.location.pathname.split("/").pop();

steps.forEach(step => {
  const target = step.dataset.page;
  if (!target) return;
  if (target === currentPage) step.classList.add("active");
  else step.classList.remove("active");
  step.addEventListener("click", () => { window.location.href = target; });
});

// ── Utility ───────────────────────────────────────────────────
function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Init ──────────────────────────────────────────────────────
updateNav();
