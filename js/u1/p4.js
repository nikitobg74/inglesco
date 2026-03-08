// ===============================
// Unit 1 - P4 (click-based, mobile friendly)
// ===============================

function textFrom(id, fallback = "") {
  const el = document.getElementById(id);
  return el ? el.textContent : fallback;
}

const MSG_CORRECT    = textFrom("msg-correct",    "✅");
const MSG_TRY_AGAIN  = textFrom("msg-try-again",  "❌");
const MSG_EXCELLENT  = textFrom("msg-excellent",  "✅");
const COUNTER_TEMPLATE = textFrom("counter-template", "Exercise {n} / {total}");

let round = 1;
const arrangeRounds = 3;
const totalRounds   = 4;

const sentences = [
  { answer: "Hello my name is Ana",    audio: "../../../../assets/audio/u1/ana.mp3" },
  { answer: "Hello my name is Pedro",  audio: "../../../../assets/audio/u1/pedro.mp3" },
  { answer: "Hello my name is George", audio: "../../../../assets/audio/u1/george.mp3" }
];

let current = null;

const wordBank     = document.getElementById("wordBank");
const dropZone     = document.getElementById("dropZone");
const feedback     = document.getElementById("feedback");
const checkBtn     = document.getElementById("checkBtn");
const exercise1    = document.getElementById("exercise1");
const exercise2    = document.getElementById("exercise2");
const writeInput   = document.getElementById("writeInput");
const writeFeedback = document.getElementById("writeFeedback");
const checkWrite   = document.getElementById("checkWrite");
const roundCounter = document.getElementById("roundCounter");

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

// iOS-safe tap handler: fires on touchend OR click, never both
function onTap(el, handler) {
  let touchMoved = false;

  el.addEventListener("touchstart", () => { touchMoved = false; }, { passive: true });
  el.addEventListener("touchmove",  () => { touchMoved = true;  }, { passive: true });

  el.addEventListener("touchend", (e) => {
    if (touchMoved) return;        // was a scroll, not a tap
    e.preventDefault();            // stops the 300 ms ghost click
    handler(e);
  });

  el.addEventListener("click", handler); // desktop fallback
}

// Create a clickable word tile
function createWord(word) {
  const div = document.createElement("div");
  div.textContent = word;
  div.className = "word";

  // FIX: read current location from the DOM instead of a stale closure var
  onTap(div, () => {
    const inZone = div.classList.contains("in-zone");
    if (!inZone) {
      dropZone.appendChild(div);
      div.classList.add("in-zone");
    } else {
      wordBank.appendChild(div);
      div.classList.remove("in-zone");
    }
    feedback.textContent = "";
  });

  return div;
}

function loadRound() {
  current = sentences[round - 1];
  wordBank.innerHTML = "";
  dropZone.innerHTML = "";
  feedback.textContent = "";

  const words = shuffle(current.answer.split(" "));
  words.forEach(word => {
    wordBank.appendChild(createWord(word));
  });

  setCounter(round, totalRounds);
}

// Check word order
checkBtn.addEventListener("click", () => {
  const formed = [...dropZone.children].map(el => el.textContent).join(" ");

  if (formed === current.answer) {
    feedback.textContent = MSG_CORRECT;
    feedback.style.color = "#22c55e";
    round++;

    setTimeout(() => {
      if (round <= arrangeRounds) {
        loadRound();
      } else {
        exercise1.style.display = "none";
        exercise2.style.display = "block";
        setCounter(totalRounds, totalRounds);
      }
    }, 800);
  } else {
    feedback.textContent = MSG_TRY_AGAIN;
    feedback.style.color = "#ef4444";
  }
});

// Check written answer
checkWrite.addEventListener("click", () => {
  function normalizeText(s) {
    return (s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  const typed = normalizeText(writeInput.value);
  const ans   = normalizeText(current.answer);

  if (typed === ans) {
    writeFeedback.textContent = MSG_EXCELLENT;
    writeFeedback.style.color = "#22c55e";
    setTimeout(() => { window.location.href = "final.html"; }, 1000);
  } else {
    writeFeedback.textContent = MSG_TRY_AGAIN;
    writeFeedback.style.color = "#ef4444";
  }
});

// Audio buttons
document.getElementById("playAudio").addEventListener("click", () => {
  playCurrentAudio();
  feedback.textContent = "";
});

document.getElementById("playWriteAudio").addEventListener("click", () => {
  playCurrentAudio();
  writeFeedback.textContent = "";
});

// Progress bar
const steps = document.querySelectorAll(".progress-container .step");
const currentPage = window.location.pathname.split("/").pop();

steps.forEach(step => {
  const target = step.dataset.page;
  if (!target) return;
  if (target === currentPage) step.classList.add("active");
  else step.classList.remove("active");
  step.addEventListener("click", () => { window.location.href = target; });
});

// Init
setCounter(round, totalRounds);
loadRound();
