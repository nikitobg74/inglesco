// ===============================
// Unit 1 - Lesson 2 - P3
// Word Order (tap tiles, click image to play audio)
// ===============================
(() => {
  function textFrom(id, fb) { const e = document.getElementById(id); return e ? e.textContent.trim() : fb; }

  const MSG_CORRECT   = textFrom("msg-correct",   "✅ ¡Correcto!");
  const MSG_TRY_AGAIN = textFrom("msg-try-again", "❌ Intenta otra vez");
  const MSG_EXCELLENT = textFrom("msg-excellent", "🎉 ¡Excelente! Lo lograste.");
  const COUNTER_TPL   = textFrom("counter-tpl",   "Ejercicio {n} / {total}");

  const data      = JSON.parse(document.getElementById("exercise-data").textContent);
  const imgBase   = data.imgBase   || "";
  const audioBase = data.audioBase || "";
  const nextPage  = data.nextPage  || "p4.html";
  const rounds    = data.rounds    || [];

  const portraitArea = document.getElementById("portraitArea");
  const dropZone     = document.getElementById("dropZone");
  const wordBank     = document.getElementById("wordBank");
  const checkBtn     = document.getElementById("checkBtn");
  const clearBtn     = document.getElementById("clearBtn");
  const feedback     = document.getElementById("feedback");
  const roundCounter = document.getElementById("roundCounter");
  const continueBtn  = document.getElementById("continueBtn");

  let currentRound = 0;
  let currentAudio = null;
  let portrait     = null;

  // ── Audio ────────────────────────────────────────────────────
  function stopAudio() {
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; }
  }
  function playAudio(src) {
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    a.play();
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
  }
  window.addEventListener("beforeunload", stopAudio);

  // ── Shuffle ──────────────────────────────────────────────────
  function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

  // ── iOS-safe tap ─────────────────────────────────────────────
  function onTap(el, handler) {
    let moved = false;
    el.addEventListener("touchstart", () => { moved = false; }, { passive: true });
    el.addEventListener("touchmove",  () => { moved = true;  }, { passive: true });
    el.addEventListener("touchend",   e  => { if (!moved) { e.preventDefault(); handler(e); } });
    el.addEventListener("click", handler);
  }

  // ── Word tile ────────────────────────────────────────────────
  function createTile(word) {
    const div = document.createElement("div");
    div.className = "word";
    div.textContent = word;
    onTap(div, () => {
      if (div.classList.contains("in-zone")) {
        wordBank.appendChild(div);
        div.classList.remove("in-zone");
      } else {
        dropZone.appendChild(div);
        div.classList.add("in-zone");
      }
      feedback.textContent = "";
      clearBtn.style.display = "none";
    });
    return div;
  }

  // ── Portrait ─────────────────────────────────────────────────
  function buildPortrait() {
    const wrap = document.createElement("div");
    wrap.className = "portrait-wrap";
    const img = document.createElement("img");
    img.alt = "";
    const badge = document.createElement("div");
    badge.className = "audio-badge";
    badge.textContent = "🔊";
    wrap.appendChild(img);
    wrap.appendChild(badge);
    // Click to play — user-initiated only, no auto-play
    onTap(wrap, () => {
      if (currentRound < rounds.length) playAudio(audioBase + rounds[currentRound].audio);
    });
    portraitArea.appendChild(wrap);
    return { wrap, img };
  }

  // ── Load round ───────────────────────────────────────────────
  function loadRound() {
    if (currentRound >= rounds.length) { showComplete(); return; }

    const round = rounds[currentRound];

    if (!portrait) portrait = buildPortrait();
    portrait.img.src = imgBase + round.img;
    portrait.img.alt = round.key;

    dropZone.innerHTML = "";
    wordBank.innerHTML = "";
    feedback.textContent = "";
    clearBtn.style.display = "none";

    roundCounter.textContent = COUNTER_TPL
      .replace("{n}",     String(currentRound + 1))
      .replace("{total}", String(rounds.length));

    const words = shuffle(round.answer.split(" "));
    words.forEach(w => wordBank.appendChild(createTile(w)));
    // No auto-play — student taps the portrait to hear
  }

  // ── Check ────────────────────────────────────────────────────
  checkBtn.addEventListener("click", () => {
    const formed  = [...dropZone.children].map(el => el.textContent).join(" ");
    const correct = rounds[currentRound].answer;

    if (formed === correct) {
      feedback.textContent = MSG_CORRECT;
      feedback.style.color = "#22c55e";
      clearBtn.style.display = "none";
      currentRound++;
      setTimeout(() => loadRound(), 850);
    } else {
      feedback.textContent = MSG_TRY_AGAIN;
      feedback.style.color = "#ef4444";
      clearBtn.style.display = "inline-block";
    }
  });

  // ── Clear ────────────────────────────────────────────────────
  clearBtn.addEventListener("click", () => {
    [...dropZone.children].forEach(tile => {
      tile.classList.remove("in-zone");
      wordBank.appendChild(tile);
    });
    feedback.textContent = "";
    clearBtn.style.display = "none";
  });

  // ── Complete ─────────────────────────────────────────────────
  function showComplete() {
    roundCounter.textContent = "";
    feedback.textContent = MSG_EXCELLENT;
    feedback.style.color = "#22c55e";
    continueBtn.disabled = false;
    continueBtn.classList.add("enabled");
  }

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
