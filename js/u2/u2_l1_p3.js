// u2_l1_p3.js
// UX: tap a word → auto-fills the next empty slot (no need to tap slot separately)
//     tap a filled slot → removes that word back to available
//     tap an already-used word pill → no action (greyed out)

const IMG_BASE   = "../../../../assets/images/u2/";
const AUDIO_BASE = "../../../../assets/audio/u2/";

const promptAudioFile = "u2.l1.p3.whereareyou.mp3";

const rooms = [
  { id: "livingroom", label: "living room", image: "u2.l1.p2.livingroom1.jpg" },
  { id: "kitchen",    label: "kitchen",     image: "u2.l1.p2.kitchen1.jpg" },
  { id: "bedroom",    label: "bedroom",     image: "u2.l1.p2.bedroom1.jpg" },
  { id: "garage",     label: "garage",      image: "u2.l1.p1.garage.jpg" },
  { id: "bathroom",   label: "bathroom",    image: "u2.l1.p2.bathroom1.jpg" },
  { id: "basement",   label: "basement",    image: "u2.l1.p2.basement1.jpg" },
  { id: "yard",       label: "yard",        image: "u2.l1.p2.yard1.jpg" },
  { id: "attic",      label: "attic",       image: "u2.l1.p2.attic1.jpg" }
];

const FIXED_WORDS  = ["I", "am", "in", "the"];
const TOTAL_ROUNDS = 4;

// DOM
const manBox         = document.getElementById("manBox");
const wordBank       = document.getElementById("wordBank");
const slotsWrap      = document.getElementById("sentenceSlots");
const slots          = Array.from(document.querySelectorAll(".slot"));
const roomImg        = document.getElementById("roomImg");
const roomCard       = document.getElementById("roomCard");
const roomPlaceholder= document.getElementById("roomPlaceholder");
const clearBtn       = document.getElementById("clearBtn");
const checkBtn       = document.getElementById("checkBtn");
const feedback       = document.getElementById("feedback");
const miniProgress   = document.getElementById("miniProgress");

// ── Audio ─────────────────────────────────────────────────
let currentAudio = null;
function stopAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
}
function playAudio(file) {
  stopAudio();
  const a = new Audio(AUDIO_BASE + file);
  currentAudio = a;
  a.addEventListener("ended", () => { currentAudio = null; });
  a.play().catch(() => { currentAudio = null; });
}

// ── Helpers ───────────────────────────────────────────────
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setFeedback(type) {
  const map = { locked: "data-locked", tryAgain: "data-try-again", correct: "data-correct" };
  feedback.textContent = feedback.getAttribute(map[type]) || "";
  feedback.className   = (type === "correct") ? "ok" : (type === "tryAgain" || type === "locked") ? "bad" : "";
}
function clearFeedback() {
  feedback.textContent = "";
  feedback.className   = "";
}

function setControlsEnabled(on) {
  clearBtn.disabled = !on;
  checkBtn.disabled = !on;
}

// ── Game state ────────────────────────────────────────────
let unlocked    = false;
let roundIndex  = 0;
let roundOrder  = [];
let currentRoom = null;

// slotValues[i] = word string or ""
let slotValues  = ["", "", "", "", ""];
// wordEls: map word text → its DOM element (for marking used/unused)
let wordEls     = {};

// ── Slot highlighting ─────────────────────────────────────
function updateNextEmptyHighlight() {
  slots.forEach(s => s.classList.remove("next-empty"));
  const nextIdx = slotValues.indexOf("");
  if (nextIdx !== -1) slots[nextIdx].classList.add("next-empty");
}

// ── Render slots ──────────────────────────────────────────
function renderSlots() {
  slots.forEach((slot, idx) => {
    const val = slotValues[idx];
    if (val) {
      slot.textContent = val;
      slot.classList.add("filled");
      slot.classList.remove("next-empty");
    } else {
      slot.textContent = "____";
      slot.classList.remove("filled");
    }
  });
  updateNextEmptyHighlight();
}

// ── Mark word pills as used/unused ───────────────────────
function refreshWordUsed() {
  Object.entries(wordEls).forEach(([word, el]) => {
    if (slotValues.includes(word)) {
      el.classList.add("used");
    } else {
      el.classList.remove("used");
    }
  });
}

// ── Reset slots ───────────────────────────────────────────
function resetSlots() {
  slotValues = ["", "", "", "", ""];
  renderSlots();
  refreshWordUsed();
}

// ── Build word bank ───────────────────────────────────────
function buildWordBank(roomLabel) {
  wordBank.innerHTML = "";
  wordEls = {};

  // Pick one distractor room word
  const distractors = rooms.filter(r => r.label !== roomLabel).map(r => r.label);
  const distractor  = distractors[Math.floor(Math.random() * distractors.length)];

  const words = shuffle([...FIXED_WORDS, roomLabel, distractor]);

  words.forEach(w => {
    const el = document.createElement("div");
    el.className   = "word";
    el.textContent = w;
    wordEls[w]     = el;

    el.addEventListener("click", () => {
      if (el.classList.contains("used")) return;
      clearFeedback();

      // Find next empty slot
      const nextIdx = slotValues.indexOf("");
      if (nextIdx === -1) return; // all slots full

      slotValues[nextIdx] = w;
      renderSlots();
      refreshWordUsed();
    });

    wordBank.appendChild(el);
  });
}

// ── Wire slot taps (tap filled slot → remove word) ────────
function wireSlots() {
  slots.forEach((slot, idx) => {
    slot.addEventListener("click", () => {
      if (!unlocked) {
        setFeedback("locked");
        return;
      }
      // Only act if slot is filled — tap to remove
      if (slotValues[idx]) {
        slotValues[idx] = "";
        renderSlots();
        refreshWordUsed();
        clearFeedback();
      }
    });
  });
}

// ── Load a round ──────────────────────────────────────────
function loadRound() {
  clearFeedback();
  roomCard.classList.remove("solved");
  resetSlots();

  currentRoom    = roundOrder[roundIndex];
  roomImg.src    = IMG_BASE + currentRoom.image;
  roomImg.alt    = currentRoom.label;
  roomImg.style.display = "block";
  if (roomPlaceholder) roomPlaceholder.style.display = "none";

  buildWordBank(currentRoom.label);
  miniProgress.textContent = `${roundIndex + 1}/${TOTAL_ROUNDS}`;
}

// ── Start game ────────────────────────────────────────────
function startGame() {
  roundIndex  = 0;
  roundOrder  = shuffle(rooms).slice(0, TOTAL_ROUNDS);
  loadRound();
}

// ── Check answer ──────────────────────────────────────────
function isCorrect() {
  const expected = ["I", "am", "in", "the", currentRoom.label];
  return expected.every((w, i) => slotValues[i] === w);
}

checkBtn.addEventListener("click", () => {
  if (slotValues.some(v => !v)) {
    setFeedback("tryAgain");
    return;
  }

  if (isCorrect()) {
    setFeedback("correct");
    roomCard.classList.add("solved");

    setTimeout(() => {
      roundIndex++;

      if (roundIndex >= TOTAL_ROUNDS) {
        miniProgress.textContent = `${TOTAL_ROUNDS}/${TOTAL_ROUNDS}`;
        feedback.textContent     = "✅ ¡Listo! Puedes ir a la Parte 4.";
        feedback.className       = "ok";
        setControlsEnabled(false);
        wordBank.style.pointerEvents = "none";
        slots.forEach(s => s.style.pointerEvents = "none");
        return;
      }

      loadRound();
    }, 700);

  } else {
    setFeedback("tryAgain");
  }
});

clearBtn.addEventListener("click", () => {
  clearFeedback();
  resetSlots();
});

// ── Person tap → unlock + play audio ─────────────────────
manBox.addEventListener("click", () => {
  clearFeedback();
  playAudio(promptAudioFile);

  if (!unlocked) {
    unlocked = true;
    setControlsEnabled(true);
    startGame();
  }
});

// ── Progress steps ────────────────────────────────────────
document.querySelectorAll(".step").forEach(step => {
  step.addEventListener("click", () => {
    stopAudio();
    window.location.href = step.getAttribute("data-page");
  });
});

window.addEventListener("beforeunload", () => stopAudio());

// ── Init ──────────────────────────────────────────────────
setControlsEnabled(false);
setFeedback("locked");
roomImg.style.display = "none";
wireSlots();
