// ==========================
// GLOBAL STATE
// ==========================
let round = 0;
let currentExercise = null;

const exerciseContainer = document.getElementById("exerciseContainer");
const feedback = document.getElementById("feedback");
const roundCounter = document.getElementById("roundCounter");
const unitTitle = document.getElementById("unitTitle");
const progressContainer = document.getElementById("progressContainer");

// ==========================
// INIT
// ==========================
initLesson();
loadRound();

// ==========================
// INITIALIZATION
// ==========================
function initLesson() {
  // Set dynamic unit title
  unitTitle.textContent = `Unidad ${lessonData.unit} - Lección ${lessonData.lesson} - Parte ${lessonData.currentSubsection}`;

  // Create progress steps
  for (let i = 1; i <= lessonData.totalSubsections; i++) {
    const step = document.createElement("div");
    step.className = "step";
    if (i === lessonData.currentSubsection) step.classList.add("active");
    step.textContent = i;
    step.dataset.page = `p${i}.html`;
    step.addEventListener("click", () => window.location.href = step.dataset.page);
    progressContainer.appendChild(step);
  }
}

// ==========================
// LOAD ROUND / EXERCISE
// ==========================
function loadRound() {
  if (round >= lessonData.exercises.length) return;

  currentExercise = lessonData.exercises[round];
  exerciseContainer.innerHTML = ""; // Clear previous exercise
  feedback.textContent = "";

  // Update round counter
  roundCounter.textContent = `${round + 1} / ${lessonData.exercises.length}`;

  if (currentExercise.type === "arrange") {
    createArrangeExercise(currentExercise);
  } else if (currentExercise.type === "write") {
    createWriteExercise(currentExercise);
  }
}

// ==========================
// ARRANGE WORDS EXERCISE
// ==========================
function createArrangeExercise(exercise) {
  const container = document.createElement("div");

  const btnAudio = document.createElement("button");
  btnAudio.textContent = "🔊 Play Audio";
  btnAudio.addEventListener("click", () => {
    new Audio(exercise.audio).play();
    feedback.textContent = "";
  });
  container.appendChild(btnAudio);

  const wordBank = document.createElement("div");
  wordBank.className = "word-bank";
  const dropZone = document.createElement("div");
  dropZone.className = "drop-zone";

  shuffle(exercise.answer.split(" ")).forEach(word => {
    const div = document.createElement("div");
    div.textContent = word;
    div.className = "word";
    div.draggable = true;

    div.addEventListener("dragstart", e => div.classList.add("dragging"));
    div.addEventListener("dragend", e => div.classList.remove("dragging"));

    wordBank.appendChild(div);
  });

  enableDragDrop(wordBank, dropZone);

  container.appendChild(wordBank);
  container.appendChild(dropZone);

  const btnCheck = document.createElement("button");
  btnCheck.textContent = "Check";
  btnCheck.addEventListener("click", () => {
    const formed = [...dropZone.children].map(el => el.textContent).join(" ");
    if (formed === exercise.answer) {
      feedback.textContent = "✅ Correcto!";
      round++;
      setTimeout(loadRound, 800);
    } else {
      feedback.textContent = "❌ Intenta otra vez";
    }
  });
  container.appendChild(btnCheck);

  exerciseContainer.appendChild(container);
}

// ==========================
// WRITE EXERCISE
// ==========================
function createWriteExercise(exercise) {
  const container = document.createElement("div");

  const btnAudio = document.createElement("button");
  btnAudio.textContent = "🔊 Play Audio";
  btnAudio.addEventListener("click", () => {
    new Audio(exercise.audio).play();
    feedback.textContent = "";
  });
  container.appendChild(btnAudio);

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Escribe la frase completa";
  container.appendChild(input);

  const btnCheck = document.createElement("button");
  btnCheck.textContent = "Check";
  btnCheck.addEventListener("click", () => {
    if (input.value.trim().toLowerCase() === exercise.answer.toLowerCase()) {
      feedback.textContent = "✅ Excelente!";
      setTimeout(() => window.location.href = "final.html", 1200);
    } else {
      feedback.textContent = "❌ Intenta otra vez";
    }
  });
  container.appendChild(btnCheck);

  exerciseContainer.appendChild(container);
}

// ==========================
// DRAG & DROP HELPER
// ==========================
function enableDragDrop(bank, drop) {
  [bank, drop].forEach(container => {
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

// ==========================
// HELPER: horizontal drag placement
// ==========================
function getDragAfterElement(container, x) {
  const draggableElements = [...container.querySelectorAll(".word:not(.dragging)")];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = x - box.left - box.width / 2;
    if (offset < 0 && offset > (closest.offset || Number.NEGATIVE_INFINITY)) {
      return { offset: offset, element: child };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ==========================
// SHUFFLE HELPER
// ==========================
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}