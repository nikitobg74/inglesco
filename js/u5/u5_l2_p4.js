(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  const EXERCISES = [
    {
      image: BASE + "images/u5/u5.she.cooking.dinner.jpg",
      questions: [
        {
          q:       "Who is she?",
          correct: "She is my mother.",
          wrong:   "She is my grandmother."
        },
        {
          q:       "Where is she?",
          correct: "She is in the kitchen.",
          wrong:   "She is in the living room."
        },
        {
          q:       "What is she doing?",
          correct: "She is cooking dinner.",
          wrong:   "She is eating dinner."
        }
      ]
    },
    {
      image: BASE + "images/u5/u5.l1.p1.man.painting.jpg",
      questions: [
        {
          q:       "Who is he?",
          correct: "He is my father.",
          wrong:   "He is my grandfather."
        },
        {
          q:       "Where is he?",
          correct: "He is at home.",
          wrong:   "He is in the garage."
        },
        {
          q:       "What is he doing?",
          correct: "He is painting the living room.",
          wrong:   "He is fixing the sink."
        }
      ]
    },
    {
      image: BASE + "images/u5/u5.daughter.english.jpg",
      questions: [
        {
          q:       "Who is she?",
          correct: "She is my daughter.",
          wrong:   "She is my mother."
        },
        {
          q:       "What is she doing?",
          correct: "She is studying English.",
          wrong:   "She is swimming."
        }
      ]
    },
    {
      image: BASE + "images/u5/u5.son.reading.jpg",
      questions: [
        {
          q:       "Who is he?",
          correct: "He is my son.",
          wrong:   "He is my husband."
        },
        {
          q:       "What is he doing?",
          correct: "He is reading a book.",
          wrong:   "He is riding a bicycle."
        }
      ]
    }
  ];

  let exIndex = 0;
  let qIndex  = 0;
  let locked  = false;

  const imgEl        = document.getElementById("lessonImg");
  const subCounter   = document.getElementById("subCounter");
  const questionLabel= document.getElementById("questionLabel");
  const answersEl    = document.getElementById("answers");
  const counter      = document.getElementById("counter");
  const bar          = document.getElementById("progressBar");
  const endScreen    = document.getElementById("endScreen");

  // ── Load exercise (new image, reset to Q1) ────────────────
  function loadExercise() {
    qIndex = 0;
    locked = false;
    const ex = EXERCISES[exIndex];

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

    answersEl.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);

    if (isCorrect) {
      btn.classList.add("correct");
      setTimeout(nextQuestion, 1000);
    } else {
      btn.classList.add("wrong");
      setTimeout(() => {
        btn.classList.remove("wrong");
        answersEl.querySelectorAll(".answer-btn").forEach(b => b.disabled = false);
        locked = false;
      }, 600);
    }
  }

  // ── Next question or next exercise ────────────────────────
  function nextQuestion() {
    const ex = EXERCISES[exIndex];
    qIndex++;
    if (qIndex < ex.questions.length) {
      renderQuestion();
    } else {
      exIndex++;
      if (exIndex >= EXERCISES.length) {
        document.querySelector(".card").style.display = "none";
        endScreen.style.display = "block";
      } else {
        loadExercise();
      }
    }
  }

  // ── Shuffle ───────────────────────────────────────────────
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  // ── Init ──────────────────────────────────────────────────
  shuffle(EXERCISES);
  loadExercise();
})();
