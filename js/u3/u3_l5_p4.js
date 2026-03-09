(() => {
  "use strict";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const instrLine     = document.getElementById("instrLine");
  const storyTitle    = document.getElementById("storyTitle");
  const storyText     = document.getElementById("storyText");
  const progressFill  = document.getElementById("progressFill");
  const scoreLine     = document.getElementById("scoreLine");
  const questionsTitle = document.getElementById("questionsTitle");
  const questionsList = document.getElementById("questionsList");
  const exerciseBox   = document.getElementById("exerciseBox");
  const endScreen     = document.getElementById("endScreen");
  const endTitle      = document.getElementById("endTitle");
  const endMsg1       = document.getElementById("endMsg1");
  const endScore      = document.getElementById("endScore");
  const endMsg2       = document.getElementById("endMsg2");
  const endBtn        = document.getElementById("endBtn");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:          "Lee la historia y decide: ¿verdadero o falso?",
    storyTitle:     "La familia Cooper",
    questionsTitle: "¿Verdadero o Falso?",
    trueLabel:      "Verdadero",
    falseLabel:     "Falso",
    scoreLabel:     "Respuestas correctas:",
    end: {
      title:  "¡Muy buen trabajo!",
      msg1:   "Terminaste la lección 5.",
      msg2:   "¡Sigue adelante!",
      btn:    "← Volver a las lecciones"
    }
  };

  // ── Story paragraphs ──────────────────────────────────────────────────────
  const STORY = [
    { text: "It is a beautiful morning. The Cooper family is at home.", gap: true },
    { text: "Mr. Cooper is in the kitchen. He is cooking breakfast." },
    { text: "Mrs. Cooper is in the living room. She is watching TV." },
    { text: "Tony is in the bedroom. He is listening to music." },
    { text: "Lisa is in the yard. She is playing with the dog." },
    { text: "The cat is in the dining room. It is eating fish." },
    { text: "Grandma Cooper is in the dining room. She is drinking coffee.", gap: false }
  ];

  // ── Questions ─────────────────────────────────────────────────────────────
  // answer: true | false
  const QUESTIONS = [
    { text: "The Cooper family is at the park.",       answer: false },
    { text: "Mr. Cooper is cooking breakfast.",        answer: true  },
    { text: "Mrs. Cooper is in the kitchen.",          answer: false },
    { text: "Tony is listening to music.",             answer: true  },
    { text: "Lisa is playing baseball.",               answer: false },
    { text: "The dog is in the yard.",                 answer: true  },
    { text: "The cat is eating fish.",                 answer: true  },
    { text: "Grandma Cooper is drinking milk.",        answer: false }
  ];

  const TOTAL   = QUESTIONS.length;
  let answered  = 0;
  let correct   = 0;

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

  // ── Update progress ───────────────────────────────────────────────────────
  function updateProgress() {
    const pct = Math.round((answered / TOTAL) * 100);
    progressFill.style.width = pct + "%";
    scoreLine.textContent    = `${CONFIG.scoreLabel} ${correct} / ${TOTAL}`;
  }

  // ── Build questions ───────────────────────────────────────────────────────
  function buildQuestions() {
    questionsTitle.textContent = CONFIG.questionsTitle;
    questionsList.innerHTML    = "";

    QUESTIONS.forEach((q, i) => {
      const item = document.createElement("div");
      item.className = "question-item";

      const qText = document.createElement("div");
      qText.className   = "question-text";
      qText.textContent = `${i + 1}. ${q.text}`;

      const btnWrap = document.createElement("div");
      btnWrap.className = "tf-buttons";

      const trueBtn  = makeTFButton(CONFIG.trueLabel,  true,  q.answer, btnWrap);
      const falseBtn = makeTFButton(CONFIG.falseLabel, false, q.answer, btnWrap);

      btnWrap.appendChild(trueBtn);
      btnWrap.appendChild(falseBtn);

      item.appendChild(qText);
      item.appendChild(btnWrap);
      questionsList.appendChild(item);
    });

    updateProgress();
  }

  function makeTFButton(label, value, correctAnswer, btnWrap) {
    const btn = document.createElement("button");
    btn.className   = "tf-btn";
    btn.type        = "button";
    btn.textContent = label;

    btn.addEventListener("click", () => {
      if (btn.disabled) return;

      // Disable both buttons in this pair
      Array.from(btnWrap.querySelectorAll(".tf-btn"))
        .forEach(b => { b.disabled = true; });

      answered++;

      if (value === correctAnswer) {
        btn.classList.add("correct");
        correct++;
      } else {
        btn.classList.add("wrong");
        // Show which one was correct
        Array.from(btnWrap.querySelectorAll(".tf-btn"))
          .forEach(b => {
            if ((b.textContent === CONFIG.trueLabel  && correctAnswer === true) ||
                (b.textContent === CONFIG.falseLabel && correctAnswer === false)) {
              b.classList.add("correct");
            }
          });
      }

      updateProgress();

      if (answered === TOTAL) {
        setTimeout(() => finish(), 800);
      }
    });

    return btn;
  }

  // ── Finish ────────────────────────────────────────────────────────────────
  function finish() {
    exerciseBox.classList.add("hidden");
    endTitle.textContent = CONFIG.end.title;
    endMsg1.textContent  = CONFIG.end.msg1;
    endScore.textContent = `${correct} / ${TOTAL}`;
    endMsg2.textContent  = CONFIG.end.msg2;
    endBtn.textContent   = CONFIG.end.btn;
    endScreen.classList.remove("hidden");
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  buildStory();
  buildQuestions();
})();
