// Elements
const questionBox = document.getElementById("question-box");
const questionAudio = document.getElementById("question-audio");
const continueBtn = document.getElementById("continue-btn");

// Collect all character cards dynamically (no hard-coded names)
const characterCards = Array.from(document.querySelectorAll(".character"));

// Track completion dynamically
const answered = Object.create(null);
characterCards.forEach(card => {
  const key = card.dataset.key || card.id || Math.random().toString(16).slice(2);
  answered[key] = false;
});

// Play question on click
if (questionBox && questionAudio) {
  questionBox.addEventListener("click", () => {
    questionAudio.currentTime = 0;
    questionAudio.play();
  });
}

// Utility: play audio and resolve when ended
function playAudio(audioEl) {
  return new Promise(resolve => {
    if (!audioEl) return resolve();
    audioEl.currentTime = 0;
    audioEl.play();
    audioEl.onended = () => resolve();
  });
}

// Utility: small delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Click: question → pause → answer
characterCards.forEach(card => {
  const key = card.dataset.key || card.id;
  const answerAudio = card.querySelector('audio[data-role="answer"]');
  const playedMark = card.querySelector(".played");

  card.addEventListener("click", async () => {
    // Play question first
    await playAudio(questionAudio);

    // Small pause
    await delay(500);

    // Play answer
    await playAudio(answerAudio);

    // Mark completed
    if (key) answered[key] = true;

    if (playedMark) {
      playedMark.textContent = "✔";
      playedMark.classList.add("played-active");
      setTimeout(() => playedMark.classList.remove("played-active"), 500);
    }

    checkAllAnswered();
  });
});

// Enable continue when all answered
function checkAllAnswered() {
  const allDone = Object.values(answered).every(v => v === true);
  if (allDone) {
    continueBtn.disabled = false;
    continueBtn.classList.add("enabled");
  }
}

// Continue button click (next page comes from HTML)
continueBtn.addEventListener("click", () => {
  if (continueBtn.disabled) return;
  const nextPage = continueBtn.dataset.next || "p3.html";
  window.location.href = nextPage;
});

// Progress bar navigation (data-page in HTML)
const steps = document.querySelectorAll(".progress-container .step");
const currentPage = window.location.pathname.split("/").pop(); // "p2.html"

steps.forEach(step => {
  const target = step.dataset.page;
  if (!target) return;

  if (target === currentPage) step.classList.add("active");
  else step.classList.remove("active");

  step.addEventListener("click", () => {
    window.location.href = target;
  });
});