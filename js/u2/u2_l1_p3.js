// u2_l1_p3.js (COPY/PASTE WHOLE FILE)
// P3: Random single photo. Build sentence: "I am in the ____"
// Must click person (play prompt) to unlock.

const IMG_BASE = "../../../../assets/images/u2/";
const AUDIO_BASE = "../../../../assets/audio/u2/";

const promptAudioFile = "u2.l1.p3.whereareyou.mp3";

// Rooms
const rooms = [
  { id: "livingroom", label: "living room", image: "u2.l1.p2.livingroom1.jpg" },
  { id: "kitchen",    label: "kitchen",     image: "u2.l1.p2.kitchen1.jpg" },
  { id: "bedroom",    label: "bedroom",     image: "u2.l1.p2.bedroom1.jpg" },
  { id: "garage",     label: "garage",      image: "u2.l1.p1.garage1.jpg" },
  { id: "bathroom",   label: "bathroom",    image: "u2.l1.p2.bathroom1.jpg" },
  { id: "basement",   label: "basement",    image: "u2.l1.p2.basement1.jpg" },
  { id: "yard",       label: "yard",        image: "u2.l1.p2.yard1.jpg" },
  { id: "attic",      label: "attic",       image: "u2.l1.p2.attic1.jpg" }
];

const FIXED_WORDS = ["I", "am", "in", "the"];
const TOTAL_ROUNDS = 4;

// DOM
const manBox = document.getElementById("manBox");
const wordBank = document.getElementById("wordBank");
const slotsWrap = document.getElementById("sentenceSlots");
const slots = Array.from(document.querySelectorAll(".slot"));
const roomImg = document.getElementById("roomImg");
const roomCard = document.getElementById("roomCard");
const roomPlaceholder = document.getElementById("roomPlaceholder");
const clearBtn = document.getElementById("clearBtn");
const checkBtn = document.getElementById("checkBtn");
const feedback = document.getElementById("feedback");
const miniProgress = document.getElementById("miniProgress");

// Audio state
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
  a.addEventListener("ended", () => (currentAudio = null));
  a.play().catch(() => (currentAudio = null));
}

// Progress steps
function wireProgressSteps() {
  document.querySelectorAll(".step").forEach(step => {
    step.addEventListener("click", () => {
      stopAudio();
      window.location.href = step.getAttribute("data-page");
    });
  });
}

// Helpers
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function setFeedback(text, state = "") {
  feedback.textContent = text || "";
  if (state) feedback.setAttribute("data-state", state);
  else feedback.removeAttribute("data-state");
}
function clearFeedback() { setFeedback("", ""); }

// Game state
let unlocked = false;
let roundIndex = 0;
let roundOrder = [];
let currentRoom = null;

// Sentence state
let selectedWord = null;
let slotValues = ["", "", "", "", ""];

function setControlsEnabled(on) {
  clearBtn.disabled = !on;
  checkBtn.disabled = !on;
  slots.forEach(s => (s.style.pointerEvents = on ? "auto" : "none"));
  wordBank.style.pointerEvents = on ? "auto" : "none";
  wordBank.style.opacity = on ? "1" : "0.55";
  slotsWrap.style.opacity = on ? "1" : "0.55";
}

function resetSlotsUI() {
  slotValues = ["", "", "", "", ""];
  slots.forEach(slot => {
    slot.textContent = "____";
    slot.classList.remove("filled");
  });
}

function unselectAllWords() {
  document.querySelectorAll(".word").forEach(x => x.classList.remove("selected"));
  selectedWord = null;
}

function buildWordBank(options2) {
  wordBank.innerHTML = "";
  selectedWord = null;

  const words = shuffle([...FIXED_WORDS, ...options2]);

  words.forEach(w => {
    const el = document.createElement("div");
    el.className = "word";
    el.textContent = w;

    el.addEventListener("click", () => {
      document.querySelectorAll(".word").forEach(x => x.classList.remove("selected"));
      el.classList.add("selected");
      selectedWord = w;
    });

    wordBank.appendChild(el);
  });
}

function renderSlots() {
  slots.forEach((slot, idx) => {
    const val = slotValues[idx];
    if (val) {
      slot.textContent = val;
      slot.classList.add("filled");
    } else {
      slot.textContent = "____";
      slot.classList.remove("filled");
    }
  });
}

/*
  ✅ NEW BEHAVIOR:
  - If a slot is filled, clicking it with a new selected word REPLACES the old word.
  - Optional: if user clicks a filled slot with NO selected word, it clears that slot (nice UX).
*/
function wireSlots() {
  slots.forEach((slot, idx) => {
    slot.addEventListener("click", () => {
      if (!unlocked) {
        setFeedback(feedback.dataset.locked || "Primero haz clic en la persona", "bad");
        return;
      }

      // If no word selected: allow "tap to clear" if already filled
      if (!selectedWord) {
        if (slotValues[idx]) {
          slotValues[idx] = "";
          renderSlots();
          clearFeedback();
        }
        return;
      }

      // Overwrite (even if filled)
      slotValues[idx] = selectedWord;
      renderSlots();
      clearFeedback();

      // Unselect after placing (keeps your intentional clicking behavior)
      unselectAllWords();
    });
  });
}

function pickTwoOptionsForRoom(room) {
  const correct = room.label;
  const distractors = rooms.filter(r => r.id !== room.id).map(r => r.label);
  const distractor = distractors[Math.floor(Math.random() * distractors.length)];
  return [correct, distractor];
}

function loadRound() {
  clearFeedback();
  roomCard.classList.remove("solved");
  resetSlotsUI();

  currentRoom = roundOrder[roundIndex];

  roomImg.src = IMG_BASE + currentRoom.image;
  roomImg.alt = currentRoom.label;
  roomImg.style.display = "block";

  if (roomPlaceholder) roomPlaceholder.style.display = "none";

  const options2 = pickTwoOptionsForRoom(currentRoom);
  buildWordBank(options2);

  miniProgress.textContent = `${roundIndex + 1}/${TOTAL_ROUNDS}`;
}

function startGame() {
  roundIndex = 0;
  roundOrder = shuffle(rooms).slice(0, TOTAL_ROUNDS);
  miniProgress.textContent = `0/${TOTAL_ROUNDS}`;

  roomImg.style.display = "none";
  roomImg.removeAttribute("src");
  if (roomPlaceholder) roomPlaceholder.style.display = "block";

  loadRound();
}

function isCorrectSentence() {
  const expected = ["I", "am", "in", "the", currentRoom.label];
  for (let i = 0; i < expected.length; i++) {
    if (slotValues[i] !== expected[i]) return false;
  }
  return true;
}

// Buttons
clearBtn.addEventListener("click", () => {
  clearFeedback();
  resetSlotsUI();
  unselectAllWords();
});

checkBtn.addEventListener("click", () => {
  clearFeedback();

  if (slotValues.some(v => !v)) {
    setFeedback(feedback.dataset.tryAgain || "Intenta otra vez", "bad");
    return;
  }

  if (isCorrectSentence()) {
    setFeedback(feedback.dataset.correct || "¡Correcto!", "ok");
    roomCard.classList.add("solved");

    setTimeout(() => {
      roundIndex++;

      if (roundIndex === TOTAL_ROUNDS) {
        miniProgress.textContent = `${TOTAL_ROUNDS}/${TOTAL_ROUNDS}`;
        setFeedback("✅ ¡Listo! Puedes ir a la Parte 4.", "ok");
        checkBtn.disabled = true;
        clearBtn.disabled = true;
        wordBank.style.pointerEvents = "none";
        slots.forEach(s => (s.style.pointerEvents = "none"));
        return;
      }

      loadRound();
    }, 700);
  } else {
    setFeedback(feedback.dataset.tryAgain || "Intenta otra vez", "bad");
    // ✅ Do NOT reset automatically. Let user fix it.
    // (If you want a tiny hint shake later, we can add it.)
  }
});

// Lock exercise until person clicked
setControlsEnabled(false);
setFeedback(feedback.dataset.locked || "Primero haz clic en la persona", "bad");

roomImg.style.display = "none";
roomImg.removeAttribute("src");

// Person click to unlock + play audio
manBox.addEventListener("click", () => {
  clearFeedback();
  playAudio(promptAudioFile);

  if (!unlocked) {
    unlocked = true;
    setControlsEnabled(true);
    startGame();
    setFeedback("", "");
  }

  manBox.style.outline = "3px solid #2563eb";
  manBox.style.boxShadow = "0 0 0 4px rgba(37, 99, 235, 0.12)";
  setTimeout(() => {
    manBox.style.outline = "";
    manBox.style.boxShadow = "";
  }, 450);
});

wireSlots();
wireProgressSteps();
window.addEventListener("beforeunload", () => stopAudio());