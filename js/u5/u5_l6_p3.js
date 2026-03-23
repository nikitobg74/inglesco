(() => {
  const UNIT   = 5;
  const LESSON = 6;
  const PART   = 3;

  // ── Questions ──────────────────────────────────────────────────────────────
  const QUESTIONS = [
    {
      sentence: "👉 Carlos is Ana's ___",
      options: [
        { text: "brother", correct: true  },
        { text: "husband", correct: false }
      ]
    },
    {
      sentence: "👉 Ana is Luis's ___",
      options: [
        { text: "wife",   correct: true  },
        { text: "sister", correct: false }
      ]
    },
    {
      sentence: "👉 Mateo is their ___",
      options: [
        { text: "son",    correct: true  },
        { text: "cousin", correct: false }
      ]
    },
    {
      sentence: "👉 Carlos is Sofía and Mateo's ___",
      options: [
        { text: "uncle",  correct: true  },
        { text: "father", correct: false }
      ]
    },
    {
      sentence: "👉 Sofía is Ana and Luis's ___",
      options: [
        { text: "niece",    correct: true  },
        { text: "daughter", correct: false }
      ]
    },
    {
      sentence: "👉 Mateo is Sofía's ___",
      options: [
        { text: "cousin",  correct: true  },
        { text: "brother", correct: false }
      ]
    }
  ];

  const TOTAL = QUESTIONS.length;

  // ── State ──────────────────────────────────────────────────────────────────
  let currentIndex = 0;
  let correctCount = 0;

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const questionArea = document.getElementById("questionArea");
  const counterEl    = document.getElementById("counter");
  const barEl        = document.getElementById("progressBar");
  const mainCard     = document.getElementById("mainCard");
  const endScreen    = document.getElementById("endScreen");
  const scoreNum     = document.getElementById("scoreNum");
  const scoreMsg     = document.getElementById("scoreMsg");
  const redoBtn      = document.getElementById("redoBtn");

  // ── Helpers ────────────────────────────────────────────────────────────────
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function updateCounter(index) {
    counterEl.textContent = `${index + 1} / ${TOTAL}`;
    barEl.style.width = ((index + 1) / TOTAL * 100) + "%";
  }

  // ── Show one question ──────────────────────────────────────────────────────
  async function showQuestion(index) {
    updateCounter(index);
    questionArea.innerHTML = "";

    const q = QUESTIONS[index];

    const block = document.createElement("div");
    block.className = "q-block";

    const sentEl = document.createElement("p");
    sentEl.className = "q-sentence";
    sentEl.textContent = q.sentence;

    const optRow = document.createElement("div");
    optRow.className = "options-row";

    let answered = false;

    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "opt-btn";
      btn.textContent = opt.text;

      btn.onclick = async () => {
        if (answered) return;
        answered = true;

        // Lock all buttons
        optRow.querySelectorAll(".opt-btn").forEach(b => b.disabled = true);

        if (opt.correct) {
          btn.classList.add("correct");
          sentEl.textContent = q.sentence.replace("___", opt.text);
          correctCount++;
        } else {
          btn.classList.add("wrong");
          // Reveal correct
          optRow.querySelectorAll(".opt-btn").forEach(b => {
            const match = q.options.find(o => o.text === b.textContent && o.correct);
            if (match) b.classList.add("correct");
          });
        }

        await delay(2000);

        const next = index + 1;
        if (next >= TOTAL) {
          showEndScreen();
        } else {
          showQuestion(next);
        }
      };

      optRow.appendChild(btn);
    });

    block.appendChild(sentEl);
    block.appendChild(optRow);
    questionArea.appendChild(block);

    // Fade in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => block.classList.add("visible"));
    });
  }

  // ── End screen ─────────────────────────────────────────────────────────────
  function showEndScreen() {
    mainCard.style.display  = "none";
    endScreen.style.display = "block";
    scoreNum.textContent = `${correctCount} / ${TOTAL}`;
    if (correctCount === TOTAL) {
      scoreMsg.textContent = "¡Perfecto! ¡Todo correcto!";
    } else if (correctCount >= Math.ceil(TOTAL * 0.7)) {
      scoreMsg.textContent = "¡Muy bien! Casi perfecto.";
    } else {
      scoreMsg.textContent = "¡Sigue practicando!";
    }
  }

  // ── Redo ───────────────────────────────────────────────────────────────────
  redoBtn.addEventListener("click", () => {
    correctCount = 0;
    currentIndex = 0;
    endScreen.style.display = "none";
    mainCard.style.display  = "block";
    showQuestion(0);
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  showQuestion(0);
})();
