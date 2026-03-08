// ===============================
// Unit 1 - P4 (language-neutral)
// ===============================

// ---- i18n (read text from HTML; no hard-coded Spanish here) ----
function textFrom(id, fallback = "") {
  const el = document.getElementById(id);
  return el ? el.textContent : fallback;
}

const MSG_CORRECT = textFrom("msg-correct", "✅");
const MSG_TRY_AGAIN = textFrom("msg-try-again", "❌");
const MSG_EXCELLENT = textFrom("msg-excellent", "✅");
const COUNTER_TEMPLATE = textFrom("counter-template", "Exercise {n} / {total}");

// ---- Rounds ----
let round = 1;
const arrangeRounds = 3; // 3 drag exercises
const totalRounds = 4;   // 3 arrange + 1 writing

// ✅ Correct audio paths (your working pattern)
const sentences = [
  { answer: "Hello my name is Ana",    audio: "../../../../assets/audio/u1/ana.mp3" },
  { answer: "Hello my name is Pedro",  audio: "../../../../assets/audio/u1/pedro.mp3" },
  { answer: "Hello my name is George", audio: "../../../../assets/audio/u1/george.mp3" }
];

let current = null;

// ---- DOM ----
const wordBank = document.getElementById("wordBank");
const dropZone = document.getElementById("dropZone");
const feedback = document.getElementById("feedback");
const playAudioBtn = document.getElementById("playAudio");
const checkBtn = document.getElementById("checkBtn");

const exercise1 = document.getElementById("exercise1");
const exercise2 = document.getElementById("exercise2");

const writeInput = document.getElementById("writeInput");
const writeFeedback = document.getElementById("writeFeedback");
const checkWrite = document.getElementById("checkWrite");
const playWriteAudioBtn = document.getElementById("playWriteAudio");

const roundCounter = document.getElementById("roundCounter");

// ---- Utils ----
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function setCounter(n, total) {
  if (!roundCounter) return;
  roundCounter.textContent = COUNTER_TEMPLATE
    .replace("{n}", String(n))
    .replace("{total}", String(total));
}

function playCurrentAudio() {
  if (!current) return;
  const a = new Audio(current.audio);
  a.play();
}

// ---- Drag helpers ----
function getDragAfterElement(container, x) {
  const elements = [...container.querySelectorAll(".word:not(.dragging)")];

  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = x - box.left - box.width / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function enableDragDrop() {
  [wordBank, dropZone].forEach(container => {
    container.addEventListener("dragover", e => {
      e.preventDefault();
      const dragging = document.querySelector(".dragging");
      if (!dragging) return;

      const afterElement = getDragAfterElement(container, e.clientX);
      if (afterElement == null) container.appendChild(dragging);
      else container.insertBefore(dragging, afterElement);
    });
  });
}

function createWord(word, parent) {
  const div = document.createElement("div");
  div.textContent = word;
  div.className = "word";
  div.draggable = true;

  div.addEventListener("dragstart", () => div.classList.add("dragging"));
  div.addEventListener("dragend", () => div.classList.remove("dragging"));

  parent.appendChild(div);
}

// ---- Load round ----
function loadRound() {
  current = sentences[round - 1];

  wordBank.innerHTML = "";
  dropZone.innerHTML = "";
  feedback.textContent = "";

  const words = shuffle(current.answer.split(" "));
  words.forEach(word => createWord(word, wordBank));

  setCounter(round, totalRounds);
  enableDragDrop();
}

// ---- Check arrange ----
checkBtn.addEventListener("click", () => {
  const formed = [...dropZone.children].map(el => el.textContent).join(" ");

  if (formed === current.answer) {
    feedback.textContent = MSG_CORRECT;
    round++;

    setTimeout(() => {
      if (round <= arrangeRounds) {
        loadRound();
      } else {
        // Switch to writing (keep same 'current' = last sentence)
        exercise1.style.display = "none";
        exercise2.style.display = "block";
        setCounter(totalRounds, totalRounds);
      }
    }, 800);
  } else {
    feedback.textContent = MSG_TRY_AGAIN;
  }
});

// ---- Write exercise ----
checkWrite.addEventListener("click", () => {
function normalizeText(s) {
  return (s || "")
    .toLowerCase()
    // replace any non-letter/number with space (removes punctuation)
    .replace(/[^a-z0-9]+/g, " ")
    // collapse multiple spaces
    .trim()
    .replace(/\s+/g, " ");
}

const typed = normalizeText(writeInput.value);
const ans = normalizeText(current.answer);

if (typed === ans) {
    writeFeedback.textContent = MSG_EXCELLENT;

    setTimeout(() => {
      // Keep as your original target
      window.location.href = "final.html";
    }, 1000);
  } else {
    writeFeedback.textContent = MSG_TRY_AGAIN;
  }
});

// ---- Audio buttons ----
playAudioBtn.addEventListener("click", () => {
  playCurrentAudio();
  feedback.textContent = "";
});

playWriteAudioBtn.addEventListener("click", () => {
  playCurrentAudio();
  writeFeedback.textContent = "";
});

// ---- Progress bar navigation (language-neutral) ----
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

// ---- Initial ----
setCounter(round, totalRounds);
loadRound();