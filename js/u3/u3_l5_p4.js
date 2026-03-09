(() => {
  "use strict";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const instrLine      = document.getElementById("instrLine");
  const storyTitle     = document.getElementById("storyTitle");
  const storyText      = document.getElementById("storyText");
  const progressFill   = document.getElementById("progressFill");
  const scoreLine      = document.getElementById("scoreLine");
  const questionsTitle = document.getElementById("questionsTitle");
  const questionsList  = document.getElementById("questionsList");
  const exerciseBox    = document.getElementById("exerciseBox");
  const endScreen      = document.getElementById("endScreen");
  const endTitle       = document.getElementById("endTitle");
  const endMsg1        = document.getElementById("endMsg1");
  const endScore       = document.getElementById("endScore");
  const endMsg2        = document.getElementById("endMsg2");
  const endBtn         = document.getElementById("endBtn");
  const retryBtn       = document.getElementById("retryBtn");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:          "Lee la historia y decide: ¿verdadero o falso?",
    storyTitle:     "La familia Cooper",
    questionsTitle: "¿Verdadero o Falso?",
    trueLabel:      "Verdadero",
    falseLabel:     "Falso",
    scoreLabel:     "Respuestas correctas:",
    end: {
      titlePerfect: "¡Perfecto!",
      titleGood:    "¡Muy buen trabajo!",
      msg1:         "Terminaste la lección 5.",
      msg2perfect:  "¡Excelente! ¡Todo correcto!",
      msg2retry:    "¿Quieres intentarlo de nuevo?",
      retryBtn:     "Intentar de nuevo",
      backBtn:      "← Volver a las lecciones"
    }
  };

  // ── Story ─────────────────────────────────────────────────────────────────
  const STORY = [
    { text: "It is a beautiful morning. The Cooper family is at home.", gap: true },
    { text: "Mr. Cooper is in the kitchen. He is cooking breakfast." },
    { text: "Mrs. Cooper is in the living room. She is watching TV." },
    { text: "Tony is in the bedroom. He is listening to music." },
    { text: "Lisa is in the yard. She is playing with the dog." },
    { text: "The cat is in the dining room. It is eating fish." },
    { text: "Grandma Cooper is in the dining room. She is drinking coffee." }
  ];

  // ── Questions ─────────────────────────────────────────────────────────────
  const QUESTIONS = [
    { text: "The Cooper family is at the park.",    answer: false },
    { text: "Mr. Cooper is cooking breakfast.",     answer: true  },
    { text: "Mrs. Cooper is in the kitchen.",       answer: false },
    { text: "Tony is listening to music.",          answer: true  },
    { text: "Lisa is playing baseball.",            answer: false },
    { text: "The dog is in the yard.",              answer: true  },
    { text: "The cat is eating fish.",              answer: true  },
    { text: "Grandma Cooper is drinking milk.",     answer: false }
  ];

  const TOTAL = QUESTIONS.length;

  // ── State — track each question result ───────────────────────────────────
  // null = unanswered, true = correct, false = wrong
  let results = new Array(TOTAL).fill(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function countAnswered() {
    return results.filter(r => r !== null).length;
  }
  function countCorrect() {
    return results.filter(r => r === true).length;
  }
  function allAnswered() {
    return results.every(r => r !== null);
  }

  // ── Build story ───────────────────────────────────────────────────────────
  function buildStory() {
    storyTitle.textContent = CONFIG.storyTitle;
    storyText.innerHTML    = "";
    STORY.forEach(item => {
      const p = document.createElement("p");
      p.textContent = item.text;
      if (item.gap) p.classList.add("gap");
      storyText.appendChild(p);
    });
  }

  // ── Update progress bar ───────────────────────────────────────────────────
  function updateProgress() {
    const answered = countAnswered();
    const correct  = countCorrect();
    const pct      = Math.round((answered / TOTAL) * 100);
    progressFill.style.width = pct + "%";
    scoreLine.textContent    = `${CONFIG.scoreLabel} ${correct} / ${TOTAL}`;
  }

  // ── Build all questions ───────────────────────────────────────────────────
  function buildQuestions() {
    questionsTitle.textContent = CONFIG.questionsTitle;
    questionsList.innerHTML    = "";

    QUESTIONS.forEach((q, i) => {
      const item = document.createElement("div");
      item.className  = "question-item";
      item.dataset.idx = i;

      const qText = document.createElement("div");
      qText.className   = "question-text";
      qText.textContent = `${i + 1}. ${q.text}`;

      const btnWrap = document.createElement("div");
      btnWrap.className = "tf-buttons";

      const trueBtn  = makeTFButton(CONFIG.trueLabel,  true,  i, btnWrap);
      const falseBtn = makeTFButton(CONFIG.falseLabel, false, i, btnWrap);

      btnWrap.appendChild(trueBtn);
      btnWrap.appendChild(falseBtn);

      item.appendChild(qText);
      item.appendChild(btnWrap);
      questionsList.appendChild(item);

      // Restore state if already answered correctly
      if (results[i] === true) {
        lockCorrect(btnWrap, QUESTIONS[i].answer);
      }
    });

    updateProgress();
  }

  function makeTFButton(label, value, qIdx, btnWrap) {
    const btn = document.createElement("button");
    btn.className   = "tf-btn";
    btn.type        = "button";
    btn.textContent = label;

    btn.addEventListener("click", () => {
      if (btn.disabled) return;

      const correctAnswer = QUESTIONS[qIdx].answer;

      // Disable both in pair
      Array.from(btnWrap.querySelectorAll(".tf-btn"))
        .forEach(b => { b.disabled = true; });

      if (value === correctAnswer) {
        // Correct
        btn.classList.add("correct");
        results[qIdx] = true;
      } else {
        // Wrong — show red on tapped, green on correct one
        btn.classList.add("wrong");
        results[qIdx] = false;
        Array.from(btnWrap.querySelectorAll(".tf-btn")).forEach(b => {
          if ((b.textContent === CONFIG.trueLabel  && correctAnswer === true) ||
              (b.textContent === CONFIG.falseLabel && correctAnswer === false)) {
            b.classList.add("correct");
          }
        });
      }

      updateProgress();

      if (allAnswered()) {
        setTimeout(() => finish(), 800);
      }
    });

    return btn;
  }

  // Lock a question item as permanently correct (used on retake)
  function lockCorrect(btnWrap, correctAnswer) {
    Array.from(btnWrap.querySelectorAll(".tf-btn")).forEach(b => {
      b.disabled = true;
      if ((b.textContent === CONFIG.trueLabel  && correctAnswer === true) ||
          (b.textContent === CONFIG.falseLabel && correctAnswer === false)) {
        b.classList.add("correct");
      }
    });
  }

  // ── Finish ────────────────────────────────────────────────────────────────
  function finish() {
    const correct  = countCorrect();
    const perfect  = correct === TOTAL;

    exerciseBox.classList.add("hidden");
    endTitle.textContent = perfect ? CONFIG.end.titlePerfect : CONFIG.end.titleGood;
    endMsg1.textContent  = CONFIG.end.msg1;
    endScore.textContent = `${correct} / ${TOTAL}`;
    endMsg2.textContent  = perfect ? CONFIG.end.msg2perfect : CONFIG.end.msg2retry;
    endBtn.textContent   = CONFIG.end.backBtn;

    // Show retry button only if not perfect
    if (!perfect) {
      retryBtn.textContent = CONFIG.end.retryBtn;
      retryBtn.classList.remove("hidden");
    } else {
      retryBtn.classList.add("hidden");
    }

    endScreen.classList.remove("hidden");
  }

  // ── Smart retake — only reset wrong answers ───────────────────────────────
  retryBtn.addEventListener("click", () => {
    // Reset only wrong answers
    results = results.map(r => r === true ? true : null);

    endScreen.classList.add("hidden");
    exerciseBox.classList.remove("hidden");

    buildQuestions();
    exerciseBox.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  buildStory();
  buildQuestions();
})();
