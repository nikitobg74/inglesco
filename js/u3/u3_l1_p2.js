// ../../../../js/u3/u3_l1_p2.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u3/",
    AUDIO_BASE: "../../../../assets/audio/u3/l1/",
    delayAfterCorrectMs: 1200,
  };

  // Only answer tokens kept. Distractor pronoun added per round.
  const ROUNDS = [
    {
      img:   "u3.l1.p1.woman.eating2.jpg",
      audio: "u3.l1.p2.eating.mp3",
      a:     ["She", "is", "eating."],
      distractor: "He",
    },
    {
      img:   "u3.l1.p1.man.drinking.jpg",
      audio: "u3.l1.p2.drinking.mp3",
      a:     ["He", "is", "drinking."],
      distractor: "She",
    },
    {
      img:   "u3.l1.p1.woman.cooking2.jpg",
      audio: "u3.l1.p2.cooking.mp3",
      a:     ["She", "is", "cooking."],
      distractor: "They",
    },
    {
      img:   "u3.l1.p1.woman.reading2.jpg",
      audio: "u3.l1.p2.reading.mp3",
      a:     ["She", "is", "reading a book."],
      distractor: "He",
    },
    {
      img:   "u3.l1.p1.man.watching.jpg",
      audio: "u3.l1.p2.watching.mp3",
      a:     ["He", "is", "watching TV."],
      distractor: "They",
    },
    {
      img:   "u3.l1.p1.man.playing.jpg",
      audio: "u3.l1.p2.playing.mp3",
      a:     ["He", "is", "playing football."],
      distractor: "She",
    },
    {
      img:   "u3.l1.p1.woman.singing2.jpg",
      audio: "u3.l1.p2.singing.mp3",
      a:     ["She", "is", "singing."],
      distractor: "They",
    },
    {
      img:   "u3.l1.p1.man.listening.jpg",
      audio: "u3.l1.p2.iam.listening.mp3",
      a:     ["I", "am", "listening to music."],
      distractor: "He",
    },
  ];

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const sceneImg  = $("#sceneImg");
  const playBtn   = $("#playBtn");
  const aSlots    = $("#aSlots");
  const bank      = $("#wordBank");
  const undoBtn   = $("#undoBtn");
  const resetBtn  = $("#resetBtn");
  const statusBox = $("#statusBox");
  const nextBtn   = $("#nextBtn");
  const counter   = $("#counter");

  // ---------- Helpers ----------
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function setStatus(type) {
    statusBox.classList.remove("good", "bad");
    if (type === "good") { statusBox.classList.add("good"); statusBox.textContent = "✓"; }
    else if (type === "bad") { statusBox.classList.add("bad"); statusBox.textContent = "—"; }
    else { statusBox.textContent = "—"; }
  }

  function wireProgressNav() {
    document.querySelectorAll(".step").forEach((step) => {
      step.addEventListener("click", () => {
        const go = step.dataset.go;
        if (go) window.location.href = go;
      });
    });
  }

  // ---------- State ----------
  const audio = new Audio();
  audio.preload = "auto";
  let playPromise = null;

  let roundIndex  = 0;
  let listened    = false;
  let placedStack = [];   // { slotIndex, word }

  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function setWordBankEnabled(enabled) {
    bank.querySelectorAll(".word").forEach((w) => {
      enabled ? w.classList.remove("disabled") : w.classList.add("disabled");
    });
    undoBtn.disabled = !enabled;
    resetBtn.disabled = !enabled;
  }

  function buildSlots(n) {
    clearChildren(aSlots);
    for (let i = 0; i < n; i++) {
      const s = document.createElement("div");
      s.className = "slot";
      s.dataset.slot = String(i);
      s.dataset.word = "";
      aSlots.appendChild(s);
    }
  }

  function buildBank(words) {
    clearChildren(bank);
    shuffle(words).forEach((w) => {
      const btn = document.createElement("div");
      btn.className = "word";
      btn.textContent = w;
      btn.dataset.word = w;
      bank.appendChild(btn);
    });
  }

  function getNextEmptySlot() {
    return [...aSlots.querySelectorAll(".slot")].find((s) => !s.dataset.word);
  }

  function placeWord(wordEl) {
    if (!listened) return;
    if (wordEl.classList.contains("disabled")) return;
    const target = getNextEmptySlot();
    if (!target) return;

    const word = wordEl.dataset.word || wordEl.textContent;
    target.dataset.word = word;
    target.textContent  = word;
    target.classList.add("filled");
    wordEl.classList.add("disabled");

    placedStack.push({ slotIndex: Number(target.dataset.slot), word });
    checkIfComplete();
  }

  function removeFromSlot(slotEl) {
    if (!listened) return;
    const word = slotEl.dataset.word;
    if (!word) return;

    const wordEl = [...bank.querySelectorAll(".word")]
      .find((w) => (w.dataset.word || w.textContent) === word);
    if (wordEl) wordEl.classList.remove("disabled");

    slotEl.dataset.word = "";
    slotEl.textContent  = "";
    slotEl.classList.remove("filled");

    for (let i = placedStack.length - 1; i >= 0; i--) {
      if (placedStack[i].word === word) { placedStack.splice(i, 1); break; }
    }
    setStatus("idle");
  }

  function undoLast() {
    if (!placedStack.length) return;
    const last   = placedStack.pop();
    const slotEl = aSlots.querySelector(`.slot[data-slot="${last.slotIndex}"]`);
    if (!slotEl) return;

    const wordEl = [...bank.querySelectorAll(".word")]
      .find((w) => (w.dataset.word || w.textContent) === last.word);
    if (wordEl) wordEl.classList.remove("disabled");

    slotEl.dataset.word = "";
    slotEl.textContent  = "";
    slotEl.classList.remove("filled");
    setStatus("idle");
  }

  function resetRound() {
    const r = ROUNDS[roundIndex];
    placedStack = [];
    buildSlots(r.a.length);
    buildBank([...r.a, r.distractor]);
    setStatus("idle");
  }

  function normalizeToken(t) {
    return String(t || "").trim().toLowerCase().replace(/[.,!?]$/, "");
  }

  function checkIfComplete() {
    const r    = ROUNDS[roundIndex];
    const now  = [...aSlots.querySelectorAll(".slot")].map((s) => s.dataset.word || "");

    if (now.includes("")) { setStatus("idle"); return; }

    const ok = now.length === r.a.length &&
      now.every((w, i) => normalizeToken(w) === normalizeToken(r.a[i]));

    if (ok) {
      setStatus("good");
      [...aSlots.querySelectorAll(".slot")].forEach((s) => {
        s.style.borderColor = "rgba(34,197,94,.65)";
        s.style.background  = "rgba(34,197,94,.10)";
      });
      lockAll(true);

      setTimeout(() => {
        roundIndex++;
        if (roundIndex >= ROUNDS.length) {
          nextBtn?.classList.remove("hidden");
          return;
        }
        loadRound(roundIndex);
      }, CONFIG.delayAfterCorrectMs);
    } else {
      setStatus("bad");
    }
  }

  function lockAll(lock) {
    playBtn.disabled = lock;
    setWordBankEnabled(!lock && listened);
    aSlots.querySelectorAll(".slot").forEach((s) => {
      s.style.pointerEvents = lock ? "none" : "auto";
    });
  }

  // ---------- Audio (safe: single instance, no AbortError blocking) ----------
  function stopAudio() {
    if (playPromise) {
      playPromise.then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => {});
      playPromise = null;
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  function playRoundAudio() {
    const r = ROUNDS[roundIndex];
    stopAudio();

    listened = false;
    setWordBankEnabled(false);
    playBtn.disabled    = true;
    playBtn.textContent = "🔊 Reproduciendo…";

    audio.src = CONFIG.AUDIO_BASE + r.audio;
    audio.load();

    function onEnded() {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onErr);
      listened            = true;
      playBtn.disabled    = false;
      playBtn.textContent = "🔁 Escuchar otra vez";
      setWordBankEnabled(true);
    }
    function onErr() {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onErr);
      playBtn.disabled    = false;
      playBtn.textContent = "🔊 Escuchar";
      playPromise = null;
    }
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onErr);

    playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => { playPromise = null; })
        .catch((err) => {
          if (err.name !== "AbortError") onErr();
          else { playBtn.disabled = false; playBtn.textContent = "🔊 Escuchar"; }
          playPromise = null;
        });
    }
  }

  // ---------- Load round ----------
  function loadRound(idx) {
    const r = ROUNDS[idx];
    if (counter) counter.textContent = `${idx + 1} / ${ROUNDS.length}`;

    listened    = false;
    placedStack = [];

    playBtn.disabled    = false;
    playBtn.textContent = "🔊 Escuchar";
    setStatus("idle");
    nextBtn?.classList.add("hidden");

    sceneImg.src = CONFIG.IMG_BASE + r.img;

    buildSlots(r.a.length);
    buildBank([...r.a, r.distractor]);
    setWordBankEnabled(false);

    [...aSlots.querySelectorAll(".slot")].forEach((s) => {
      s.style.borderColor = "rgba(15,23,42,.18)";
      s.style.background  = "#fff";
      s.style.pointerEvents = "auto";
    });
  }

  // ---------- Wire events ----------
  function wireEvents() {
    playBtn.addEventListener("click", playRoundAudio);

    bank.addEventListener("click", (e) => {
      const w = e.target.closest(".word");
      if (w) placeWord(w);
    });

    aSlots.addEventListener("click", (e) => {
      const slot = e.target.closest(".slot");
      if (slot && slot.dataset.word) removeFromSlot(slot);
    });

    undoBtn.addEventListener("click", undoLast);
    resetBtn.addEventListener("click", resetRound);
  }

  // ---------- Init ----------
  function init() {
    wireProgressNav();
    wireEvents();
    loadRound(0);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
