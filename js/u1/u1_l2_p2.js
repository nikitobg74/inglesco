// ===============================
// Unit 1 - Lesson 2 - P2
// Listen & Match
// ===============================
(() => {
  function textFrom(id, fb) { const e = document.getElementById(id); return e ? e.textContent.trim() : fb; }

  const MSG_CORRECT  = textFrom("msg-correct",  "✅ ¡Correcto!");
  const MSG_WRONG    = textFrom("msg-wrong",    "❌ Intenta de nuevo");
  const MSG_DONE     = textFrom("msg-well-done","🎉 ¡Muy bien!");
  const COUNTER_TPL  = textFrom("counter-tpl",  "Ronda {n} de {total}");

  const data       = JSON.parse(document.getElementById("exercise-data").textContent);
  const imgBase    = data.imgBase    || "";
  const audioBase  = data.audioBase  || "";
  const characters = data.characters || [];
  const rounds     = data.rounds     || [];
  const nextPage   = data.nextPage   || "p3.html";

  const playBtn      = document.getElementById("playBtn");
  const charGrid     = document.getElementById("charGrid");
  const feedbackEl   = document.getElementById("feedback");
  const roundCounter = document.getElementById("roundCounter");
  const continueBtn  = document.getElementById("continueBtn");

  let currentRound = 0;
  let currentAudio = null;
  let answered     = false;

  // ── Build character cards ────────────────────────────────────
  const cardMap = {};
  characters.forEach(ch => {
    const card = document.createElement("div");
    card.className = "char-card";
    card.dataset.key = ch.key;

    const img = document.createElement("img");
    img.src = imgBase + ch.img;
    img.alt = ch.name;

    const name = document.createElement("div");
    name.className = "char-name";
    name.textContent = ch.name;

    card.appendChild(img);
    card.appendChild(name);
    charGrid.appendChild(card);
    cardMap[ch.key] = card;

    card.addEventListener("click", () => handlePick(ch.key));
  });

  // ── Audio helpers ────────────────────────────────────────────
  function stopAudio() {
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; }
  }

  function playAudio(src, onEnd) {
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    playBtn.classList.add("playing");
    a.play();
    a.onended = () => {
      playBtn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
      if (onEnd) onEnd();
    };
  }

  window.addEventListener("beforeunload", stopAudio);

  // ── Round logic ──────────────────────────────────────────────
  function loadRound() {
    answered = false;
    feedbackEl.textContent = "";
    feedbackEl.style.color = "";

    Object.values(cardMap).forEach(c => {
      c.classList.remove("correct","wrong","disabled");
    });

    if (currentRound >= rounds.length) {
      showComplete(); return;
    }

    roundCounter.textContent = COUNTER_TPL
      .replace("{n}",     String(currentRound + 1))
      .replace("{total}", String(rounds.length));

    // No auto-play — student taps the 🔊 button to hear
  }

  function handlePick(key) {
    if (answered) return;
    const correct = rounds[currentRound].answer;

    if (key === correct) {
      answered = true;
      cardMap[key].classList.add("correct");
      // disable all others
      Object.entries(cardMap).forEach(([k, c]) => { if (k !== key) c.classList.add("disabled"); });
      feedbackEl.textContent = MSG_CORRECT;
      feedbackEl.style.color = "#22c55e";

      currentRound++;
      setTimeout(() => loadRound(), 900);
    } else {
      cardMap[key].classList.add("wrong");
      feedbackEl.textContent = MSG_WRONG;
      feedbackEl.style.color = "#ef4444";
      setTimeout(() => {
        cardMap[key].classList.remove("wrong");
        feedbackEl.textContent = "";
      }, 700);
    }
  }

  function showComplete() {
    roundCounter.textContent = "";
    feedbackEl.textContent = MSG_DONE;
    feedbackEl.style.color = "#22c55e";
    playBtn.disabled = true;
    continueBtn.disabled = false;
    continueBtn.classList.add("enabled");
  }

  // ── Play button (replay) ─────────────────────────────────────
  playBtn.addEventListener("click", () => {
    if (currentRound < rounds.length) {
      playAudio(audioBase + rounds[currentRound].audio);
    }
  });

  // ── Continue ─────────────────────────────────────────────────
  continueBtn.addEventListener("click", () => {
    if (continueBtn.disabled) return;
    stopAudio();
    window.location.href = nextPage;
  });

  // ── Progress bar ─────────────────────────────────────────────
  document.querySelectorAll(".progress-container .step").forEach(step => {
    const target = step.dataset.page;
    if (!target) return;
    step.addEventListener("click", () => { stopAudio(); window.location.href = target; });
  });

  // ── Init ─────────────────────────────────────────────────────
  loadRound();
})();
