// ===============================
// LESSON P4 SCRIPT (Unit 1 - P4)
// ===============================

let round = 1;
const arrangeRounds = 3; // 3 drag exercises
const totalRounds = 4;   // 3 arrange + 1 writing

const sentences = [
  { answer: "Hello my name is Ana", audio: "../../../audio/ana.mp3" },
  { answer: "Hello my name is Pedro", audio: "../../../audio/pedro.mp3" },
  { answer: "Hello my name is George", audio: "../../../audio/george.mp3" }
];

let current = null;

// ===============================
// DOM ELEMENTS
// ===============================

const wordBank = document.getElementById("wordBank");
const dropZone = document.getElementById("dropZone");
const feedback = document.getElementById("feedback");
const playAudio = document.getElementById("playAudio");
const checkBtn = document.getElementById("checkBtn");

const exercise1 = document.getElementById("exercise1");
const exercise2 = document.getElementById("exercise2");

const writeInput = document.getElementById("writeInput");
const writeFeedback = document.getElementById("writeFeedback");
const checkWrite = document.getElementById("checkWrite");
const playWriteAudio = document.getElementById("playWriteAudio");

const steps = document.querySelectorAll(".step");
const roundCounter = document.getElementById("roundCounter");

// ===============================
// UTILITIES
// ===============================

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function updateCounter() {
  roundCounter.textContent = `Exercise ${round} / ${totalRounds}`;
}

function updateProgress() {
  steps.forEach((step, index) => {
    step.classList.toggle("active", index === 3); // Step 4 is active page
  });
}

// ===============================
// LOAD ARRANGE ROUND
// ===============================

function loadRound() {
  current = sentences[round - 1];

  wordBank.innerHTML = "";
  dropZone.innerHTML = "";
  feedback.textContent = "";

  const words = shuffle(current.answer.split(" "));
  words.forEach(word => createWord(word, wordBank));

  updateCounter();
  enableDragDrop();
}

// ===============================
// CREATE WORD
// ===============================

function createWord(word, parent) {
  const div = document.createElement("div");
  div.textContent = word;
  div.className = "word";
  div.draggable = true;

  div.addEventListener("dragstart", () => {
    div.classList.add("dragging");
  });

  div.addEventListener("dragend", () => {
    div.classList.remove("dragging");
  });

  parent.appendChild(div);
}

// ===============================
// DRAG & DROP
// ===============================

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

// ===============================
// CHECK ARRANGE
// ===============================

checkBtn.addEventListener("click", () => {
  const formed = [...dropZone.children]
    .map(el => el.textContent)
    .join(" ");

  if (formed === current.answer) {
    feedback.textContent = "✅ Correct!";
    round++;

    setTimeout(() => {
      if (round <= arrangeRounds) {
        loadRound();
      } else {
        // Switch to writing
        exercise1.style.display = "none";
        exercise2.style.display = "block";

        updateCounter(); // show 4/4
      }
    }, 800);

  } else {
    feedback.textContent = "❌ Intenta otra vez!";
  }
});

// ===============================
// WRITE EXERCISE
// ===============================

checkWrite.addEventListener("click", () => {
  if (
    writeInput.value.trim().toLowerCase() ===
    current.answer.toLowerCase()
  ) {
    writeFeedback.textContent = "✅ Excelente!";

    setTimeout(() => {
      window.location.href = "final.html";
    }, 1000);

  } else {
    writeFeedback.textContent = "❌ Intenta otra vez!";
  }
});

// ===============================
// AUDIO
// ===============================

playAudio.addEventListener("click", () => {
  if (current) new Audio(current.audio).play();
  feedback.textContent = "";
});

playWriteAudio.addEventListener("click", () => {
  if (current) new Audio(current.audio).play();
  writeFeedback.textContent = "";
});

// ===============================
// STEP NAVIGATION
// ===============================

document.getElementById("step1").addEventListener("click", () => {
  window.location.href = "p1.html";
});
document.getElementById("step2").addEventListener("click", () => {
  window.location.href = "p2.html";
});
document.getElementById("step3").addEventListener("click", () => {
  window.location.href = "p3.html";
});

// ===============================
// INITIAL LOAD
// ===============================

updateProgress();
updateCounter();
loadRound();