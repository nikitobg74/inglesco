// ../../../../js/u3/u3_l1_p2.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u3/",
    AUDIO_BASE: "../../../../assets/audio/u3/l1/",
    delayAfterCorrectMs: 3000,
  };

  // Language-neutral data: tokens only
  const ROUNDS = [
    {
      img: "u3.l1.p1.woman.eating2.jpg",
      audio: "u3.l1.p2.eating.mp3",
      q: ["What", "is", "she", "doing?"],
      a: ["She", "is", "eating."],
    },
    {
      img: "u3.l1.p1.man.drinking.jpg",
      audio: "u3.l1.p2.drinking.mp3",
      q: ["What", "is", "he", "doing?"],
      a: ["He", "is", "drinking."],
    },
    {
      img: "u3.l1.p1.woman.cooking2.jpg",
      audio: "u3.l1.p2.cooking.mp3",
      q: ["What", "is", "she", "doing?"],
      a: ["She", "is", "cooking."],
    },
{
  img: "u3.l1.p1.woman.reading2.jpg",
  audio: "u3.l1.p2.reading.mp3",
  q: ["What", "is", "she", "doing?"],
  a: ["She", "is", "reading a book."],
},
{
  img: "u3.l1.p1.man.watching.jpg",
  audio: "u3.l1.p2.watching.mp3",
  q: ["What", "is", "he", "doing?"],
  a: ["He", "is", "watching TV."],
},
{
  img: "u3.l1.p1.man.playing.jpg",
  audio: "u3.l1.p2.playing.mp3",
  q: ["What", "is", "he", "doing?"],
  a: ["He", "is", "playing football."],
},
    {
      img: "u3.l1.p1.woman.singing2.jpg",
      audio: "u3.l1.p2.singing.mp3",
      q: ["What", "is", "she", "doing?"],
      a: ["She", "is", "singing."],
    },
  {
  img: "u3.l1.p1.man.listening.jpg",
  audio: "u3.l1.p2.iam.listening.mp3",
  q: ["What", "are", "you", "doing?"],
  a: ["I", "am", "listening to music."],
},
  ];

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const sceneImg = $("#sceneImg");
  const playBtn = $("#playBtn");
  const qSlots = $("#qSlots");
  const aSlots = $("#aSlots");
  const bank = $("#wordBank");
  const undoBtn = $("#undoBtn");
  const resetBtn = $("#resetBtn");
  const statusBox = $("#statusBox");
  const nextBtn = $("#nextBtn");
const counter = $("#counter");
  // ---------- Helpers ----------
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function createAudio() {
    const a = new Audio();
    a.preload = "auto";
    return a;
  }

  function setStatus(type /* "good" | "bad" | "idle" */) {
    statusBox.classList.remove("good", "bad");
    if (type === "good") statusBox.classList.add("good");
    if (type === "bad") statusBox.classList.add("bad");
    // Keep text minimal / neutral
    statusBox.textContent = type === "good" ? "OK" : (type === "bad" ? "—" : "—");
  }

  function wireProgressNav() {
    document.querySelectorAll(".step").forEach((step) => {
      step.addEventListener("click", () => {
        const go = step.dataset.go;
        if (!go) return;
        window.location.href = go;
      });
    });
  }

  // ---------- State ----------
  const audio = createAudio();
  let roundIndex = 0;
  let listened = false;

  // placements stack for undo:
  // { side: "q"|"a", slotIndex, word }
  let placedStack = [];

  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function setWordBankEnabled(enabled) {
    bank.querySelectorAll(".word").forEach((w) => {
      if (enabled) w.classList.remove("disabled");
      else w.classList.add("disabled");
    });
    undoBtn.disabled = !enabled;
    resetBtn.disabled = !enabled;
  }

  function buildSlots(container, n) {
    clearChildren(container);
    for (let i = 0; i < n; i++) {
      const s = document.createElement("div");
      s.className = "slot";
      s.dataset.slot = String(i);
      s.dataset.word = "";
      s.textContent = ""; // empty slot
      container.appendChild(s);
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

  function getNextEmptySlot(side) {
    const container = side === "q" ? qSlots : aSlots;
    const slots = [...container.querySelectorAll(".slot")];
    return slots.find((s) => !s.dataset.word);
  }

  function placeWord(wordEl) {
    if (!listened) return;
    if (wordEl.classList.contains("disabled")) return;

    // Fill Question first, then Answer
    let target = getNextEmptySlot("q");
    let side = "q";
    if (!target) { target = getNextEmptySlot("a"); side = "a"; }
    if (!target) return;

    const word = wordEl.dataset.word || wordEl.textContent;

    // place
    target.dataset.word = word;
    target.textContent = word;
    target.classList.add("filled");

    // hide / disable bank word
    wordEl.classList.add("disabled");

    placedStack.push({ side, slotIndex: Number(target.dataset.slot), word });

    // re-check
    checkIfComplete();
  }

  function removeFromSlot(slotEl) {
    if (!listened) return;
    const word = slotEl.dataset.word;
    if (!word) return;

    // enable matching word in bank
    const wordEl = [...bank.querySelectorAll(".word")].find((w) => (w.dataset.word || w.textContent) === word);
    if (wordEl) wordEl.classList.remove("disabled");

    slotEl.dataset.word = "";
    slotEl.textContent = "";
    slotEl.classList.remove("filled");

    // remove last matching entry from stack (best effort)
    for (let i = placedStack.length - 1; i >= 0; i--) {
      if (placedStack[i].word === word) { placedStack.splice(i, 1); break; }
    }

    setStatus("idle");
  }

  function undoLast() {
    if (!placedStack.length) return;
    const last = placedStack.pop();
    const container = last.side === "q" ? qSlots : aSlots;
    const slotEl = container.querySelector(`.slot[data-slot="${last.slotIndex}"]`);
    if (!slotEl) return;

    // enable the word in bank
    const wordEl = [...bank.querySelectorAll(".word")].find((w) => (w.dataset.word || w.textContent) === last.word);
    if (wordEl) wordEl.classList.remove("disabled");

    slotEl.dataset.word = "";
    slotEl.textContent = "";
    slotEl.classList.remove("filled");

    setStatus("idle");
  }

  function resetRound() {
    const r = ROUNDS[roundIndex];
    placedStack = [];
    buildSlots(qSlots, r.q.length);
    buildSlots(aSlots, r.a.length);
    buildBank([...r.q, ...r.a]);
    setStatus("idle");
  }

  function readSentence(container) {
    return [...container.querySelectorAll(".slot")].map((s) => s.dataset.word || "");
  }

  function normalizeToken(t) {
  return String(t || "").trim().toLowerCase();
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (normalizeToken(a[i]) !== normalizeToken(b[i])) return false;
  }
  return true;
}

  function lockAllInteraction(lock) {
    playBtn.disabled = lock;
    setWordBankEnabled(!lock && listened);
    // disable removing from slots if locked
    const slots = document.querySelectorAll(".slot");
    slots.forEach((s) => { s.style.pointerEvents = lock ? "none" : "auto"; });
  }

  function checkIfComplete() {
    const r = ROUNDS[roundIndex];
    const qNow = readSentence(qSlots);
    const aNow = readSentence(aSlots);

    // not complete yet
    if (qNow.includes("") || aNow.includes("")) {
      setStatus("idle");
      return;
    }

    const qOk = arraysEqual(qNow, r.q);
    const aOk = arraysEqual(aNow, r.a);

    if (qOk && aOk) {
      setStatus("good");
      // turn all slots green
      [...qSlots.querySelectorAll(".slot"), ...aSlots.querySelectorAll(".slot")].forEach((s) => {
        s.style.borderColor = "rgba(34,197,94,.65)";
        s.style.background = "rgba(34,197,94,.10)";
      });

      lockAllInteraction(true);

      setTimeout(() => {
        roundIndex += 1;
        if (roundIndex >= ROUNDS.length) {
          nextBtn?.classList.remove("hidden");
          // allow progress navigation already (progress bar always works)
          return;
        }
        loadRound(roundIndex);
      }, CONFIG.delayAfterCorrectMs);
    } else {
      setStatus("bad");
    }
  }

  async function playRoundAudio() {
    const r = ROUNDS[roundIndex];
    listened = false;
    setWordBankEnabled(false);
    playBtn.disabled = true;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = CONFIG.AUDIO_BASE + r.audio;
      await audio.play();

   audio.onended = () => {
  listened = true;
  playBtn.disabled = false;
  setWordBankEnabled(true);
};

// fallback: if onended doesn’t fire, unlock after 8 seconds
setTimeout(() => {
  if (!listened) {
    listened = true;
    playBtn.disabled = false;
    setWordBankEnabled(true);
  }
}, 8000);
    } catch {
      // if autoplay fails, allow manual retry
      playBtn.disabled = false;
    }
  }

  function loadRound(idx) {
  const r = ROUNDS[idx];
if (counter) counter.textContent = `${idx + 1}/${ROUNDS.length}`;
  listened = false;
  placedStack = [];

  // IMPORTANT: re-enable play button for the new round
  playBtn.disabled = false;

  // reset styles
  setStatus("idle");
  nextBtn?.classList.add("hidden");

  // image
  sceneImg.src = CONFIG.IMG_BASE + r.img;

  // slots
  buildSlots(qSlots, r.q.length);
  buildSlots(aSlots, r.a.length);

  // bank (shuffled)
  buildBank([...r.q, ...r.a]);

  // disable bank until listened
  setWordBankEnabled(false);

  // clear any green styles
  [...qSlots.querySelectorAll(".slot"), ...aSlots.querySelectorAll(".slot")].forEach((s) => {
    s.style.borderColor = "rgba(15,23,42,.18)";
    s.style.background = "#fff";
  });
}

  // ---------- Events ----------
  function wireEvents() {
    playBtn.addEventListener("click", () => {
      playRoundAudio();
    });

    bank.addEventListener("click", (e) => {
      const w = e.target.closest(".word");
      if (!w) return;
      placeWord(w);
    });

    // tap filled slot to remove it back to bank
    function slotClickHandler(e) {
      const slot = e.target.closest(".slot");
      if (!slot) return;
      if (!slot.dataset.word) return;
      removeFromSlot(slot);
    }
    qSlots.addEventListener("click", slotClickHandler);
    aSlots.addEventListener("click", slotClickHandler);

    undoBtn.addEventListener("click", () => undoLast());
    resetBtn.addEventListener("click", () => resetRound());
  }

  // ---------- Init ----------
  function init() {
    wireProgressNav();
    wireEvents();
    loadRound(0);
  }

  document.addEventListener("DOMContentLoaded", init);
})();