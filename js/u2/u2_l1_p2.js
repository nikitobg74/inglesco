// Language-neutral JS (no Spanish strings inside)
// User-facing messages come from HTML data- attributes.

const IMG_BASE = "../../../../assets/images/u2/";
const AUDIO_BASE = "../../../../assets/audio/u2/";

const promptAudioFile = "u2.l1.p2.whereareyou.mp3";

// ✅ Room items (images & room audio)
const items = [
  { id: "livingroom", display: "Living room", image: "u2.l1.p2.livingroom1.jpg", audio: "u2.l1.p2.livingroom.mp3" },
  { id: "kitchen",    display: "Kitchen",     image: "u2.l1.p2.kitchen1.jpg",    audio: "u2.l1.p2.kitchen.mp3" },
  { id: "bedroom",    display: "Bedroom",     image: "u2.l1.p2.bedroom1.jpg",    audio: "u2.l1.p2.bedroom.mp3" },
  { id: "garage",     display: "Garage",      image: "u2.l1.p1.garage1.jpg",     audio: "u2.l1.p2.garage.mp3" }, // your filename
  { id: "bathroom",   display: "Bathroom",    image: "u2.l1.p2.bathroom1.jpg",   audio: "u2.l1.p2.bathroom.mp3" },
  { id: "basement",   display: "Basement",    image: "u2.l1.p2.basement1.jpg",   audio: "u2.l1.p2.basement.mp3" },
  { id: "yard",       display: "Yard",        image: "u2.l1.p2.yard1.jpg",       audio: "u2.l1.p2.yard.mp3" },
  { id: "attic",      display: "Attic",       image: "u2.l1.p2.attic1.jpg",      audio: "u2.l1.p2.attic.mp3" }
];

// DOM
const feedback = document.getElementById("feedback");
const manBox = document.getElementById("manBox");
const playPhraseBox = document.getElementById("playPhraseBox");
const counterBadge = document.getElementById("counterBadge");
const choicesWrap = document.getElementById("choicesWrap");
const nextBtn = document.getElementById("nextBtn");

// State
let currentAudio = null;

let remaining = [];     // shuffled items to be asked (8)
let solvedCount = 0;    // 0..8

let currentItem = null; // the correct answer for this round
let currentChoices = []; // 3 choices for this round
let isLocked = false;    // prevent double clicks during feedback

// ----------------- Helpers -----------------
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

  audio.addEventListener("ended", () => {
    currentAudio = null;
  });

  audio.play().catch(() => {
    currentAudio = null;
  });
}

function clearFeedback() {
  feedback.textContent = "";
}

function setFeedbackTryAgain() {
  feedback.textContent = feedback.dataset.tryAgain || "";
}

function setFeedbackCorrect() {
  feedback.textContent = feedback.dataset.correct || "";
}

function setFeedbackComplete() {
  feedback.textContent = feedback.dataset.complete || "";
}

function updateCounter() {
  const n = Math.min(solvedCount + 1, 8);
  counterBadge.textContent = `${n}/8`;
}

function enableNext() {
  nextBtn.classList.remove("disabled");
}

function lockUI(ms = 650) {
  isLocked = true;
  setTimeout(() => { isLocked = false; }, ms);
}

// ----------------- Round logic -----------------
function buildChoicesFor(itemCorrect) {
  const others = items.filter(x => x.id !== itemCorrect.id);
  const picks = shuffleArray(others).slice(0, 2);
  return shuffleArray([itemCorrect, ...picks]);
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

    const label = document.createElement("div");
    label.className = "choice-label";
    label.textContent = choice.display;

    card.appendChild(img);
    card.appendChild(label);

    card.addEventListener("click", () => {
      if (isLocked) return;
      if (!currentItem) return;

      if (choice.id === currentItem.id) {
        // ✅ correct
        setFeedbackCorrect();
        card.style.borderColor = "#16a34a";
        card.style.boxShadow = "0 0 0 4px rgba(22, 163, 74, 0.15)";
        lockUI(700);

        solvedCount += 1;

        // finished all 8
        if (solvedCount >= 8) {
          counterBadge.textContent = "8/8";
          setTimeout(() => {
            setFeedbackComplete();
            enableNext();
          }, 500);
          return;
        }

        // next round
        setTimeout(() => {
          clearFeedback();
          startNextRound();
        }, 650);

      } else {
        // ❌ wrong
        setFeedbackTryAgain();
        card.style.borderColor = "#dc2626";
        card.style.boxShadow = "0 0 0 4px rgba(220, 38, 38, 0.15)";
        lockUI(500);

        setTimeout(() => {
          card.style.borderColor = "transparent";
          card.style.boxShadow = "";
          clearFeedback();
        }, 550);
      }
    });

    choicesWrap.appendChild(card);
  });
}

function startNextRound() {
  updateCounter();

  // if no remaining, complete
  if (remaining.length === 0) {
    currentItem = null;
    currentChoices = [];
    choicesWrap.innerHTML = "";
    counterBadge.textContent = "8/8";
    setFeedbackComplete();
    enableNext();
    return;
  }

  currentItem = remaining.shift();
  currentChoices = buildChoicesFor(currentItem);
  renderChoices();
}

function handlePlayPhraseClick() {
  if (isLocked) return;

  // If exercise complete, just do nothing
  if (solvedCount >= 8) return;

  clearFeedback();

  // If current round exists -> replay the same audio
  if (currentItem) {
    playAudio(currentItem.audio);
    return;
  }

  // Otherwise start first round and play
  startNextRound();
  if (currentItem) playAudio(currentItem.audio);
}

// ----------------- Wiring -----------------
function wireManQuestion() {
  if (!manBox) return;

  manBox.addEventListener("click", () => {
    clearFeedback();
    playAudio(promptAudioFile);

    manBox.style.outline = "3px solid #2563eb";
    manBox.style.boxShadow = "0 0 0 4px rgba(37, 99, 235, 0.12)";
    setTimeout(() => {
      manBox.style.outline = "";
      manBox.style.boxShadow = "";
    }, 450);
  });
}

function wireProgressSteps() {
  document.querySelectorAll(".step").forEach(step => {
    step.addEventListener("click", () => {
      stopAudio();
      window.location.href = step.getAttribute("data-page");
    });
  });
}

window.addEventListener("beforeunload", () => stopAudio());

// ----------------- Init -----------------
remaining = shuffleArray(items); // ✅ random order of the 8 audios
solvedCount = 0;
currentItem = null;
currentChoices = [];
updateCounter();
renderChoices(); // empty until first round starts

playPhraseBox.addEventListener("click", handlePlayPhraseClick);

wireManQuestion();
wireProgressSteps();