// Language-neutral JS (no Spanish strings inside)
// User-facing messages come from HTML data- attributes.

const IMG_BASE   = "../../../../assets/images/u2/";
const AUDIO_BASE = "../../../../assets/audio/u2/";

const promptAudioFile = "u2.l1.p2.whereareyou.mp3";

const items = [
  { id: "livingroom", display: "Living room", image: "u2.l1.p2.livingroom1.jpg", audio: "u2.l1.p2.livingroom.mp3" },
  { id: "kitchen",    display: "Kitchen",     image: "u2.l1.p2.kitchen1.jpg",    audio: "u2.l1.p2.kitchen.mp3" },
  { id: "bedroom",    display: "Bedroom",     image: "u2.l1.p2.bedroom1.jpg",    audio: "u2.l1.p2.bedroom.mp3" },
  { id: "garage",     display: "Garage",      image: "u2.l1.p1.garage.jpg",      audio: "u2.l1.p2.garage.mp3" },
  { id: "bathroom",   display: "Bathroom",    image: "u2.l1.p2.bathroom1.jpg",   audio: "u2.l1.p2.bathroom.mp3" },
  { id: "basement",   display: "Basement",    image: "u2.l1.p2.basement1.jpg",   audio: "u2.l1.p2.basement.mp3" },
  { id: "yard",       display: "Yard",        image: "u2.l1.p2.yard1.jpg",       audio: "u2.l1.p2.yard.mp3" },
  { id: "attic",      display: "Attic",       image: "u2.l1.p2.attic1.jpg",      audio: "u2.l1.p2.attic.mp3" }
];

// DOM
const feedback     = document.getElementById("feedback");
const manBox       = document.getElementById("manBox");
const playPhraseBox = document.getElementById("playPhraseBox");
const counterBadge = document.getElementById("counterBadge");
const choicesWrap  = document.getElementById("choicesWrap");
const nextBtn      = document.getElementById("nextBtn");

// State
let currentAudio  = null;
let remaining     = [];
let solvedCount   = 0;
let currentItem   = null;
let currentChoices = [];
let isLocked      = false;

// ── Helpers ──────────────────────────────────────────────
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stopAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
}

function playAudio(file) {
  stopAudio();
  const audio = new Audio(AUDIO_BASE + file);
  currentAudio = audio;
  audio.addEventListener("ended", () => { currentAudio = null; });
  audio.play().catch(() => { currentAudio = null; });
}

function clearFeedback() {
  feedback.textContent = "";
  feedback.className = "";
}

function setFeedback(type) {
  const map = { tryAgain: "data-try-again", correct: "data-correct", complete: "data-complete" };
  feedback.textContent = feedback.getAttribute(map[type]) || "";
  feedback.className = type === "correct" || type === "complete" ? "correct" : "wrong";
}

function updateCounter() {
  counterBadge.textContent = `${Math.min(solvedCount + 1, 8)}/8`;
}

function enableNext() {
  nextBtn.classList.remove("disabled");
}

function lockUI(ms = 650) {
  isLocked = true;
  setTimeout(() => { isLocked = false; }, ms);
}

// ── Round logic ───────────────────────────────────────────
function buildChoicesFor(correct) {
  const others = items.filter(x => x.id !== correct.id);
  return shuffleArray([correct, ...shuffleArray(others).slice(0, 2)]);
}

function renderChoices() {
  choicesWrap.innerHTML = "";

  currentChoices.forEach(choice => {
    const card = document.createElement("div");
    card.className = "choice-card";
    card.dataset.id = choice.id;

    const img = document.createElement("img");
    img.src = IMG_BASE + choice.image;
    img.alt = choice.display;
    img.loading = "lazy";

    const label = document.createElement("div");
    label.className = "choice-label";
    label.textContent = choice.display;

    card.appendChild(img);
    card.appendChild(label);

    card.addEventListener("click", () => {
      if (isLocked || !currentItem) return;

      if (choice.id === currentItem.id) {
        // ✅ Correct
        card.classList.add("correct-pick");
        setFeedback("correct");
        lockUI(700);
        solvedCount += 1;

        if (solvedCount >= 8) {
          counterBadge.textContent = "8/8";
          setTimeout(() => { setFeedback("complete"); enableNext(); }, 500);
          return;
        }

        setTimeout(() => { clearFeedback(); startNextRound(); }, 700);

      } else {
        // ❌ Wrong
        card.classList.add("wrong-pick");
        setFeedback("tryAgain");
        lockUI(550);

        setTimeout(() => {
          card.classList.remove("wrong-pick");
          clearFeedback();
        }, 600);
      }
    });

    choicesWrap.appendChild(card);
  });
}

function startNextRound() {
  updateCounter();

  if (remaining.length === 0) {
    currentItem = null;
    currentChoices = [];
    choicesWrap.innerHTML = "";
    counterBadge.textContent = "8/8";
    setFeedback("complete");
    enableNext();
    return;
  }

  currentItem = remaining.shift();
  currentChoices = buildChoicesFor(currentItem);
  renderChoices();
}

// ── Play phrase button ────────────────────────────────────
playPhraseBox.addEventListener("click", () => {
  if (isLocked || solvedCount >= 8) return;
  clearFeedback();

  if (currentItem) {
    playAudio(currentItem.audio);
    return;
  }

  startNextRound();
  if (currentItem) playAudio(currentItem.audio);
});

// ── Man question button ───────────────────────────────────
manBox.addEventListener("click", () => {
  clearFeedback();
  playAudio(promptAudioFile);
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
remaining = shuffleArray(items);
updateCounter();
