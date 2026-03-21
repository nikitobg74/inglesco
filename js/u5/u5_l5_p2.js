(() => {
  const UNIT   = 5;
  const LESSON = 5;
  const PART   = 2;

  const BASE       = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE   = BASE + "images/u5/";

  const QUESTIONS = [
    {
      image: IMG_BASE + "u5.tom.dog.jpg",
      prompt: "👉 Tom's dog",
      options: [
        { text: "el perro de Tom", correct: true },
        { text: "Tom es el perro",  correct: false }
      ],
      feedbackCorrect: "✔ Correcto: <strong>el perro de Tom</strong>",
      feedbackWrong:   "❌ <em>Tom es el perro</em> = Tom is the dog"
    },
    {
      image: IMG_BASE + "u5.robert.house.jpg",
      prompt: "👉 Robert's house is big",
      options: [
        { text: "la casa de Robert es grande", correct: true },
        { text: "Robert es la casa",           correct: false }
      ],
      feedbackCorrect: "✔ Correcto: <strong>la casa de Robert es grande</strong>",
      feedbackWrong:   "❌ <em>Robert es la casa</em> = Robert is the house"
    },
    {
      image: IMG_BASE + "u5.linda.car.jpg",
      prompt: "👉 Linda's car is old",
      options: [
        { text: "el carro de Linda es viejo", correct: true },
        { text: "Linda es el carro",          correct: false }
      ],
      feedbackCorrect: "✔ Correcto: <strong>el carro de Linda es viejo</strong>",
      feedbackWrong:   "❌ <em>Linda es el carro</em> = Linda is the car"
    },
    {
      image: IMG_BASE + "u5.mike.car.jpg",
      prompt: "👉 Mike's car is new",
      options: [
        { text: "el carro de Mike es nuevo", correct: true },
        { text: "Mike es el carro",          correct: false }
      ],
      feedbackCorrect: "✔ Correcto: <strong>el carro de Mike es nuevo</strong>",
      feedbackWrong:   "❌ <em>Mike es el carro</em> = Mike is the car"
    },
    {
      image: IMG_BASE + "u5.george.apartment.jpg",
      prompt: "👉 George's apartment is small",
      options: [
        { text: "el apartamento de George es pequeño", correct: true },
        { text: "George es el apartamento",            correct: false }
      ],
      feedbackCorrect: "✔ Correcto: <strong>el apartamento de George es pequeño</strong>",
      feedbackWrong:   "❌ <em>George es el apartamento</em> = George is the apartment"
    },
    {
      image: IMG_BASE + "u5.dog.noisy.1.jpg",
      prompt: "👉 Carl's dog is noisy",
      options: [
        { text: "el perro de Carl es ruidoso", correct: true },
        { text: "Carl es el perro",            correct: false }
      ],
      feedbackCorrect: "✔ Correcto: <strong>el perro de Carl es ruidoso</strong>",
      feedbackWrong:   "❌ <em>Carl es el perro</em> = Carl is the dog"
    },
    {
      image: IMG_BASE + "u5.cat.eating.fish.jpg",
      prompt: "👉 Lisa's cat is eating a fish",
      options: [
        { text: "el gato de Lisa está comiendo un pez", correct: true },
        { text: "Lisa es el gato",                      correct: false }
      ],
      feedbackCorrect: "✔ Correcto: <strong>el gato de Lisa está comiendo un pez</strong>",
      feedbackWrong:   "❌ <em>Lisa es el gato</em> = Lisa is the cat"
    },
    {
      image: IMG_BASE + "u5.computer.slow.jpg",
      prompt: "👉 Greg's laptop is slow",
      options: [
        { text: "la computadora de Greg es lenta", correct: true },
        { text: "Greg es la computadora",          correct: false }
      ],
      feedbackCorrect: "✔ Correcto: <strong>la computadora de Greg es lenta</strong>",
      feedbackWrong:   "❌ <em>Greg es la computadora</em> = Greg is the computer"
    }
  ];

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const imgEl         = document.getElementById("lessonImg");
  const promptEl      = document.getElementById("questionPrompt");
  const optionsEl     = document.getElementById("options");
  const feedbackEl    = document.getElementById("feedbackBox");
  const continueBtn   = document.getElementById("continueBtn");
  const counterEl     = document.getElementById("counter");
  const scoreNumEl    = document.getElementById("scoreNum");
  const barEl         = document.getElementById("progressBar");
  const mainCard      = document.getElementById("mainCard");
  const endScreen     = document.getElementById("endScreen");
  const finalScoreEl  = document.getElementById("finalScore");
  const grammarToggle = document.getElementById("grammarToggle");
  const grammarBody   = document.getElementById("grammarBody");
  const grammarArrow  = document.getElementById("grammarArrow");

  let questionIndex = 0;
  let score         = 0;
  let answered      = false;

  // ── Grammar toggle ─────────────────────────────────────────────────────────
  grammarToggle.onclick = () => {
    const open = grammarBody.classList.toggle("open");
    grammarArrow.textContent = open ? "▲" : "▼";
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  function updateCounter() {
    counterEl.textContent = `${questionIndex + 1} / ${QUESTIONS.length}`;
    barEl.style.width = ((questionIndex + 1) / QUESTIONS.length * 100) + "%";
  }

  function showContinue() { continueBtn.classList.add("visible"); }
  function hideContinue()  { continueBtn.classList.remove("visible"); }

  // ── Load question ──────────────────────────────────────────────────────────
  function loadQuestion(index) {
    questionIndex = index;
    answered      = false;
    updateCounter();
    hideContinue();

    feedbackEl.className = "feedback-box";
    feedbackEl.innerHTML = "";

    const q = QUESTIONS[index];

    imgEl.src = q.image;
    imgEl.alt = q.prompt;

    promptEl.textContent = q.prompt;

    // Shuffle options each load
    const shuffled = [...q.options].sort(() => Math.random() - 0.5);

    optionsEl.innerHTML = "";
    shuffled.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className   = "opt-btn";
      btn.textContent = (i === 0 ? "A.  " : "B.  ") + opt.text;
      btn.onclick     = () => handleAnswer(btn, opt.correct, q);
      optionsEl.appendChild(btn);
    });
  }

  // ── Handle answer ──────────────────────────────────────────────────────────
  function handleAnswer(btn, isCorrect, q) {
    if (answered) return;

    const allBtns = optionsEl.querySelectorAll(".opt-btn");

    if (isCorrect) {
      answered = true;
      score++;
      scoreNumEl.textContent = score;

      btn.classList.add("correct");
      allBtns.forEach(b => { b.disabled = true; });

      feedbackEl.className = "feedback-box correct show";
      feedbackEl.innerHTML = q.feedbackCorrect;
      showContinue();
    } else {
      answered = true;
      btn.classList.add("wrong", "shake");
      btn.addEventListener("animationend", () => btn.classList.remove("shake"), { once: true });
      allBtns.forEach(b => { b.disabled = true; });

      feedbackEl.className = "feedback-box wrong show";
      feedbackEl.innerHTML = q.feedbackWrong;
      showContinue();
    }
  }

  // ── Level-based end screen ─────────────────────────────────────────────────
  function showEndScreen() {
    mainCard.style.display   = "none";
    restartBtn.style.display = "none";
    endScreen.style.display  = "block";

    const total = QUESTIONS.length;
    let trophy, heading, sub, nextBtn;

    if (score <= 3) {
      trophy  = "😓";
      heading = "Necesitas practicar más";
      sub     = "Recomendación: Repite la lección para mejorar.";
      nextBtn = `<a href="p2.html" style="display:inline-block;padding:12px 28px;background:#ef4444;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">🔁 Intentar de nuevo</a>`;
    } else if (score <= 6) {
      trophy  = "🙂";
      heading = "Buen trabajo, pero puedes mejorar";
      sub     = "Intenta otra vez para un mejor resultado.";
      nextBtn = `<a href="p2.html" style="display:inline-block;padding:12px 28px;background:#f59e0b;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">🔁 Intentar de nuevo</a>
                 &nbsp;
                 <a href="p3.html" style="display:inline-block;padding:12px 28px;background:#2563eb;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">Continuar → Parte 3</a>`;
    } else {
      trophy  = "🏆";
      heading = "¡Muy buen trabajo!";
      sub     = "¡Listo para continuar!";
      nextBtn = `<a href="p3.html" style="display:inline-block;padding:12px 28px;background:#2563eb;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">Continuar → Parte 3</a>`;
    }

    endScreen.innerHTML = `
      <div style="font-size:52px;margin-bottom:12px">${trophy}</div>
      <h2 style="font-size:22px;font-weight:900;color:#1e40af;margin-bottom:8px">${heading}</h2>
      <p style="font-size:16px;font-weight:700;color:#374151;margin-bottom:6px">Puntaje: ${score} / ${total}</p>
      <p style="font-size:14px;color:#64748b;margin-bottom:24px">${sub}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${nextBtn}</div>
    `;
  }

  // ── Continue ───────────────────────────────────────────────────────────────
  continueBtn.onclick = () => {
    const next = questionIndex + 1;
    if (next >= QUESTIONS.length) {
      showEndScreen();
    } else {
      loadQuestion(next);
    }
  };

  // ── Init ───────────────────────────────────────────────────────────────────
  loadQuestion(0);
})();
