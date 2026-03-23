(() => {
  const UNIT   = 5;
  const LESSON = 6;
  const PART   = 2;

  // ── Questions ──────────────────────────────────────────────────────────────
  const QUESTIONS = [
    {
      context: "Emma's brother isn't short.",
      sentence: "___ brother is tall.",
      options: [
        { text: "His", correct: false },
        { text: "Her", correct: true  }
      ]
    },
    {
      context: "Carlos and Sofia's apartment isn't cheap.",
      sentence: "___ apartment is expensive.",
      options: [
        { text: "His",   correct: false },
        { text: "Their", correct: true  }
      ]
    },
    {
      context: "Daniel's sister isn't single.",
      sentence: "___ sister is married.",
      options: [
        { text: "His", correct: true  },
        { text: "Her", correct: false }
      ]
    },
    {
      context: "Laura's neighbors aren't quiet.",
      sentence: "___ neighbors are noisy.",
      options: [
        { text: "Their", correct: false },
        { text: "Her",   correct: true  }
      ]
    },
    {
      context: "Their dog's name isn't Rover.",
      sentence: "___ name is Fido.",
      options: [
        { text: "Its",   correct: true  },
        { text: "Their", correct: false }
      ]
    },
    {
      context: "Isabella's car isn't large.",
      sentence: "___ car is small.",
      options: [
        { text: "His", correct: false },
        { text: "Her", correct: true  }
      ]
    },
    {
      context: "Leo's bicycle isn't new.",
      sentence: "___ bicycle is old.",
      options: [
        { text: "His", correct: true  },
        { text: "Its", correct: false }
      ]
    },
    {
      context: "Noah and Mia's son isn't single.",
      sentence: "___ son is married.",
      options: [
        { text: "Her",   correct: false },
        { text: "Their", correct: true  }
      ]
    }
  ];

  const TOTAL = QUESTIONS.length;

  // ── State ──────────────────────────────────────────────────────────────────
  let correctCount  = 0;
  let answeredCount = 0;

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const questionArea = document.getElementById("questionArea");
  const counterEl    = document.getElementById("counter");
  const barEl        = document.getElementById("progressBar");
  const mainCard     = document.getElementById("mainCard");
  const endScreen    = document.getElementById("endScreen");
  const sigBtn       = document.getElementById("sigBtn");
  const scoreNum     = document.getElementById("scoreNum");
  const scoreMsg     = document.getElementById("scoreMsg");
  const redoBtn      = document.getElementById("redoBtn");

  // ── Update counter / bar ───────────────────────────────────────────────────
  function updateCounter() {
    counterEl.textContent = `${answeredCount} / ${TOTAL}`;
    barEl.style.width = (answeredCount / TOTAL * 100) + "%";
  }

  // ── Render all questions ───────────────────────────────────────────────────
  function renderAll() {
    questionArea.innerHTML = "";
    correctCount  = 0;
    answeredCount = 0;
    updateCounter();
    sigBtn.classList.remove("visible");

    QUESTIONS.forEach((q, qi) => {
      const block = document.createElement("div");
      block.className = "q-block";

      const ctxEl = document.createElement("p");
      ctxEl.className = "q-context";
      ctxEl.textContent = q.context;

      const sentEl = document.createElement("p");
      sentEl.className = "q-sentence";
      sentEl.textContent = q.sentence;

      const optRow = document.createElement("div");
      optRow.className = "options-row";

      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "opt-btn";
        btn.textContent = opt.text;

        btn.onclick = () => {
          if (btn.disabled) return;

          // Lock all buttons on this question
          optRow.querySelectorAll(".opt-btn").forEach(b => b.disabled = true);

          if (opt.correct) {
            btn.classList.add("correct");
            sentEl.textContent = q.sentence.replace("___", opt.text);
            correctCount++;
          } else {
            btn.classList.add("wrong");
            // Reveal the correct answer
            optRow.querySelectorAll(".opt-btn").forEach(b => {
              const match = q.options.find(o => o.text === b.textContent && o.correct);
              if (match) b.classList.add("correct");
            });
          }

          answeredCount++;
          updateCounter();

          if (answeredCount === TOTAL) {
            sigBtn.classList.add("visible");
          }
        };

        optRow.appendChild(btn);
      });

      block.appendChild(ctxEl);
      block.appendChild(sentEl);
      block.appendChild(optRow);
      questionArea.appendChild(block);
    });
  }

  // ── Siguiente → show end screen ────────────────────────────────────────────
  sigBtn.addEventListener("click", () => {
    sigBtn.classList.remove("visible");
    mainCard.style.display = "none";
    endScreen.style.display = "block";
    scoreNum.textContent = `${correctCount} / ${TOTAL}`;
    if (correctCount === TOTAL) {
      scoreMsg.textContent = "¡Perfecto! ¡Todo correcto!";
    } else if (correctCount >= Math.ceil(TOTAL * 0.7)) {
      scoreMsg.textContent = "¡Muy bien! Casi perfecto.";
    } else {
      scoreMsg.textContent = "¡Sigue practicando!";
    }
  });

  // ── Redo ───────────────────────────────────────────────────────────────────
  redoBtn.addEventListener("click", () => {
    endScreen.style.display = "none";
    mainCard.style.display  = "block";
    renderAll();
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  renderAll();
})();
