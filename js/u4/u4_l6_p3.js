// js/u4/u4_l6_p3.js
(() => {
  const PAIRS = [
    ["single",    "married"],
    ["pretty",    "ugly"],
    ["cheap",     "expensive"],
    ["old",       "young"],
    ["big",       "small"],
    ["tall",      "short"],
    ["difficult", "easy"],
    ["handsome",  "ugly"],
    ["quiet",     "noisy"]
  ];

  // All possible answer words (right side) — used to pick distractors
  const ALL_ANSWERS = PAIRS.map(([, r]) => r);

  const promptWordEl  = document.getElementById("promptWord");
  const choicesWrap   = document.getElementById("choicesWrap");
  const feedbackEl    = document.getElementById("feedback");
  const nextBtn       = document.getElementById("nextBtn");
  const exCounter     = document.getElementById("exCounter");
  const barFill       = document.getElementById("barFill");
  const slideArea     = document.getElementById("slideArea");
  const endScreen     = document.getElementById("endScreen");

  // Shuffle the pair order so each run feels fresh
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const shuffledPairs = shuffle(PAIRS);
  let current = 0;

  // ── pick 2 distractors from ALL_ANSWERS, excluding the correct answer ──
  function getDistractors(correctAnswer) {
    const pool = ALL_ANSWERS.filter(w => w !== correctAnswer);
    return shuffle(pool).slice(0, 2);
  }

  // ── update progress bar and counter ──
  function updateProgress(index) {
    const total = shuffledPairs.length;
    exCounter.textContent = `${index + 1} / ${total}`;
    barFill.style.width   = `${((index) / total) * 100}%`;
  }

  // ── load one round ──
  function loadRound(index) {
    const [prompt, correct] = shuffledPairs[index];
    const distractors = getDistractors(correct);
    const choices = shuffle([correct, ...distractors]);

    updateProgress(index);

    promptWordEl.textContent = prompt;
    choicesWrap.innerHTML    = "";
    feedbackEl.textContent   = "";
    feedbackEl.className     = "feedback";
    nextBtn.disabled         = true;
    nextBtn.classList.remove("ready");

    choices.forEach(word => {
      const btn = document.createElement("button");
      btn.type        = "button";
      btn.className   = "choice-btn";
      btn.textContent = word;
      btn.addEventListener("click", () => onChoice(btn, word, correct));
      choicesWrap.appendChild(btn);
    });
  }

  // ── handle a tap on a choice ──
  function onChoice(btn, chosen, correct) {
    // Disable all choices immediately
    choicesWrap.querySelectorAll(".choice-btn")
      .forEach(b => { b.disabled = true; });

    if (chosen === correct) {
      btn.classList.add("correct-flash");
      setFeedback("¡Correcto! 🎉", "correct");
      // fill bar to reflect this pair is done
      barFill.style.width = `${((current + 1) / shuffledPairs.length) * 100}%`;
      setTimeout(() => {
        nextBtn.disabled = false;
        nextBtn.classList.add("ready");
      }, 350);
    } else {
      btn.classList.add("wrong-flash");
      // highlight the correct answer in green
      choicesWrap.querySelectorAll(".choice-btn").forEach(b => {
        if (b.textContent === correct) b.classList.add("correct-flash");
      });
      setFeedback(`La respuesta correcta es: ${correct}`, "wrong");
      setTimeout(() => {
        nextBtn.disabled = false;
        nextBtn.classList.add("ready");
      }, 700);
    }
  }

  function setFeedback(text, cls) {
    feedbackEl.textContent = text;
    feedbackEl.className   = "feedback" + (cls ? " " + cls : "");
  }

  // ── next button ──
  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    current += 1;
    if (current >= shuffledPairs.length) {
      // complete
      barFill.style.width = "100%";
      slideArea.style.display = "none";
      endScreen.classList.add("show");
    } else {
      loadRound(current);
    }
  });

  // ── init ──
  loadRound(0);
})();
