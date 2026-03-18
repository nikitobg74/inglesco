(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  // Each exercise has an image + 3 questions.
  // Each question has a correct answer and one wrong answer.
  // Answers are shuffled at runtime.
  const EXERCISES = [
    {
      image: BASE + "images/u5/u5.grandparents.jpg",
      questions: [
        {
          q:       "Who are they?",
          correct: "They are my grandparents.",
          wrong:   "They are my parents."
        },
        {
          q:       "Where are they?",
          correct: "They are in Paris.",
          wrong:   "They are at the beach."
        },
        {
          q:       "What are they doing?",
          correct: "They are standing in front of the Eiffel Tower.",
          wrong:   "They are surfing."
        }
      ]
    },
    {
      image: BASE + "images/u5/u5.grandfather.jpg",
      questions: [
        {
          q:       "Who is he?",
          correct: "He is my grandfather.",
          wrong:   "He is my grandmother."
        },
        {
          q:       "Where is he?",
          correct: "He is in the bathroom.",
          wrong:   "He is in the bedroom."
        },
        {
          q:       "What is he doing?",
          correct: "He is fixing the shower.",
          wrong:   "He is fixing the car."
        }
      ]
    },
    {
      image: BASE + "images/u5/u5.man.woman.beach.surfing.jpg",
      questions: [
        {
          q:       "Who are they?",
          correct: "They are my parents.",
          wrong:   "They are my grandparents."
        },
        {
          q:       "Where are they?",
          correct: "They are at the beach.",
          wrong:   "They are at the park."
        },
        {
          q:       "What are they doing?",
          correct: "They are surfing.",
          wrong:   "They are playing ball."
        }
      ]
    },
    {
      image: BASE + "images/u5/u5.grandmother.planting.jpg",
      questions: [
        {
          q:       "Who is she?",
          correct: "She is my grandmother.",
          wrong:   "She is my grandfather."
        },
        {
          q:       "Where is she?",
          correct: "She is in the garden.",
          wrong:   "She is at the park."
        },
        {
          q:       "What is she doing?",
          correct: "She is planting flowers.",
          wrong:   "She is playing with the dog."
        }
      ]
    }
  ];

  let exIndex = 0;   // which exercise (image)
  let qIndex  = 0;   // which question within that exercise
  let locked  = false;

  const imgEl       = document.getElementById("lessonImg");
  const subCounter  = document.getElementById("subCounter");
  const questionLabel = document.getElementById("questionLabel");
  const answersEl   = document.getElementById("answers");
  const counter     = document.getElementById("counter");
  const bar         = document.getElementById("progressBar");
  const endScreen   = document.getElementById("endScreen");

  // ── Vocab toggle ──────────────────────────────────────────
  // (defined inline in HTML — no duplicate needed here)

  // ── Load exercise (new image, reset to Q1) ────────────────
  function loadExercise() {
    qIndex = 0;
    locked = false;
    const ex = EXERCISES[exIndex];

    // Overall progress bar counts completed exercises
    counter.textContent = `${exIndex + 1} / ${EXERCISES.length}`;
    bar.style.width = ((exIndex + 1) / EXERCISES.length * 100) + "%";

    imgEl.src = ex.image;
    imgEl.alt = ex.questions[0].q;

    renderQuestion();
  }

  // ── Render current question ───────────────────────────────
  function renderQuestion() {
    const ex = EXERCISES[exIndex];
    const q  = ex.questions[qIndex];

    subCounter.textContent = `Pregunta ${qIndex + 1} / ${ex.questions.length}`;
    questionLabel.textContent = q.q;

    // Build shuffled answer buttons
    const options = [
      { text: q.correct, isCorrect: true  },
      { text: q.wrong,   isCorrect: false }
    ];
    shuffle(options);

    answersEl.innerHTML = "";
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.textContent = opt.text;
      btn.onclick = () => selectAnswer(btn, opt.isCorrect);
      answersEl.appendChild(btn);
    });

    locked = false;
  }

  // ── Select an answer ──────────────────────────────────────
  function selectAnswer(btn, isCorrect) {
    if (locked) return;
    locked = true;

    // Disable all buttons
    answersEl.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);

    if (isCorrect) {
      btn.classList.add("correct");
      setTimeout(nextQuestion, 1000);
    } else {
      btn.classList.add("wrong");
      // Re-enable after shake so student can retry
      setTimeout(() => {
        btn.classList.remove("wrong");
        answersEl.querySelectorAll(".answer-btn").forEach(b => {
          b.disabled = false;
        });
        locked = false;
      }, 600);
    }
  }

  // ── Move to next question or next exercise ────────────────
  function nextQuestion() {
    const ex = EXERCISES[exIndex];
    qIndex++;
    if (qIndex < ex.questions.length) {
      renderQuestion();
    } else {
      // All 3 questions done for this exercise
      exIndex++;
      if (exIndex >= EXERCISES.length) {
        showEndScreen();
      } else {
        loadExercise();
      }
    }
  }

  // ── End screen ────────────────────────────────────────────
  function showEndScreen() {
    document.querySelector(".card").style.display = "none";
    endScreen.style.display = "block";
  }

  // ── Shuffle helper ────────────────────────────────────────
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  // ── Init — shuffle exercises then start ───────────────────
  shuffle(EXERCISES);
  loadExercise();
})();
