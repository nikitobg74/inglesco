// ---------------------------
// Utility: play audio and resolve on end
// ---------------------------
function playAudio(audio) {
  return new Promise(resolve => {
    if (!audio) return resolve();
    audio.currentTime = 0;
    audio.play();
    audio.onended = () => resolve();
  });
}

// ---------------------------
// Utility: shuffle
// ---------------------------
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ---------------------------
// Read language strings from HTML (no hardcoded text here)
// ---------------------------
const tryAgainTextEl = document.getElementById("msg-try-again");
const TRY_AGAIN_TEXT = tryAgainTextEl ? tryAgainTextEl.textContent : "✖";

// ---------------------------
// IDs used in this activity
// (These are not language; they are stable keys)
// ---------------------------
const characters = ["ana", "pedro", "george", "julie"];
const boxes = ["box1", "box2", "box3", "box4"];

// boxId -> assigned character key
const boxAssignments = {};
const shuffledChars = shuffle([...characters]);
boxes.forEach((boxId, i) => {
  boxAssignments[boxId] = shuffledChars[i];
});

// Track which character is already solved
const answered = Object.create(null);
characters.forEach(name => (answered[name] = false));

let correctCount = 0;
let currentBox = null;

// ---------------------------
// Audio box click
// ---------------------------
boxes.forEach(boxId => {
  const boxEl = document.getElementById(boxId);
  if (!boxEl) return;

  boxEl.addEventListener("click", async () => {
    currentBox = boxId;
    const charName = boxAssignments[boxId];
    const audio = document.getElementById(charName + "-audio");

    // Clear wrong feedback only for characters not solved
    characters.forEach(name => {
      if (answered[name]) return;
      const fb = document.getElementById(name + "-feedback");
      if (fb) fb.textContent = "";
    });

    await playAudio(audio);
  });
});

// ---------------------------
// Character click
// ---------------------------
characters.forEach(name => {
  const charEl = document.getElementById(name + "-card");
  const feedbackEl = document.getElementById(name + "-feedback");
  if (!charEl) return;

  charEl.addEventListener("click", () => {
    if (!currentBox) return;

    const correctChar = boxAssignments[currentBox];

    if (name === correctChar) {
      // correct
      if (feedbackEl) {
        feedbackEl.textContent = "✔";
        feedbackEl.style.color = "#22c55e";
      }
      answered[name] = true;
      correctCount++;

      // disable that box
      const boxEl = document.getElementById(currentBox);
      if (boxEl) {
        boxEl.style.opacity = 0.6;
        boxEl.style.pointerEvents = "none";
      }
      currentBox = null;
    } else {
      // wrong (text comes from HTML)
      if (feedbackEl) {
        feedbackEl.textContent = TRY_AGAIN_TEXT;
        feedbackEl.classList.add("feedback-wrong");
        setTimeout(() => feedbackEl.classList.remove("feedback-wrong"), 400);
      }
    }

    // enable continue if all correct
    if (correctCount === boxes.length) {
      const continueBtn = document.getElementById("continue-btn");
      if (continueBtn) {
        continueBtn.disabled = false;
        continueBtn.classList.add("enabled");
      }
    }
  });
});

// ---------------------------
// Continue button (next page comes from HTML)
// ---------------------------
const continueBtn = document.getElementById("continue-btn");
if (continueBtn) {
  continueBtn.addEventListener("click", () => {
    if (continueBtn.disabled) return;
    const next = continueBtn.dataset.next || "p4.html";
    window.location.href = next;
  });
}

// ---------------------------
// Progress bar (uses data-page from HTML)
// ---------------------------
const steps = document.querySelectorAll(".progress-container .step");
const currentPage = window.location.pathname.split("/").pop();

steps.forEach(step => {
  const target = step.dataset.page;
  if (!target) return;

  if (target === currentPage) step.classList.add("active");
  else step.classList.remove("active");

  step.addEventListener("click", () => {
    window.location.href = target;
  });
});