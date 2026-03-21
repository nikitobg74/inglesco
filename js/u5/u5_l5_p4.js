(() => {
  const UNIT   = 5;
  const LESSON = 5;
  const PART   = 4;

  const BASE       = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE   = BASE + "images/u5/";
  const AUDIO_BASE = BASE + "audio/u5/";

  const QUESTIONS = [
    {
      image:        IMG_BASE + "u5.brother.sister.jpg",
      prompt:       "Mary is Tom's...",
      options:      ["sister", "mother"],
      correct:      0,
      wrongMeaning: "Mary is Tom's mother = Mary es la madre de Tom.",
      correctAnswer:"Correcto: Mary is Tom's sister.",
      explain:      "sister = hermana"
    },
    {
      image:        IMG_BASE + "u5.brother.sister.jpg",
      prompt:       "Tom is Mary's...",
      options:      ["brother", "father"],
      correct:      0,
      wrongMeaning: "Tom is Mary's father = Tom es el padre de Mary.",
      correctAnswer:"Correcto: Tom is Mary's brother.",
      explain:      "brother = hermano"
    },
    {
      image:        IMG_BASE + "u5.craig.linda.jpg",
      prompt:       "Craig is Linda's...",
      options:      ["husband", "brother"],
      correct:      0,
      wrongMeaning: "Craig is Linda's brother = Craig es el hermano de Linda.",
      correctAnswer:"Correcto: Craig is Linda's husband.",
      explain:      "husband = esposo"
    },
    {
      image:        IMG_BASE + "u5.craig.linda.jpg",
      prompt:       "Linda is Craig's...",
      options:      ["wife", "sister"],
      correct:      0,
      wrongMeaning: "Linda is Craig's sister = Linda es la hermana de Craig.",
      correctAnswer:"Correcto: Linda is Craig's wife.",
      explain:      "wife = esposa"
    },
    {
      image:        IMG_BASE + "u5.baby.bill.jpg",
      prompt:       "Bill is my...",
      options:      ["nephew", "son"],
      correct:      0,
      wrongMeaning: "Bill is my son = Bill es mi hijo.",
      correctAnswer:"Correcto: Bill is my nephew.",
      explain:      "nephew = sobrino"
    },
    {
      image:        IMG_BASE + "u5.baby.bill.jpg",
      prompt:       "Bill is Tom and Mary's...",
      options:      ["cousin", "brother"],
      correct:      0,
      wrongMeaning: "Bill is Tom and Mary's brother = Bill es el hermano de Tom y Mary.",
      correctAnswer:"Correcto: Bill is Tom and Mary's cousin.",
      explain:      "cousin = primo"
    },
    {
      image:        IMG_BASE + "u5.brother.sister.uncle.jpg",
      prompt:       "Mary is Craig's...",
      options:      ["niece", "daughter"],
      correct:      0,
      wrongMeaning: "Mary is Craig's daughter = Mary es la hija de Craig.",
      correctAnswer:"Correcto: Mary is Craig's niece.",
      explain:      "niece = sobrina"
    },
    {
      image:        IMG_BASE + "u5.brother.sister.uncle.jpg",
      prompt:       "Tom is Craig's...",
      options:      ["nephew", "son"],
      correct:      0,
      wrongMeaning: "Tom is Craig's son = Tom es el hijo de Craig.",
      correctAnswer:"Correcto: Tom is Craig's nephew.",
      explain:      "nephew = sobrino"
    }
  ];

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const questionImg   = document.getElementById("questionImg");
  const questionText  = document.getElementById("questionText");
  const optionsWrap   = document.getElementById("optionsWrap");
  const feedbackBox   = document.getElementById("feedbackBox");
  const feedbackWrong = document.getElementById("feedbackWrong");
  const feedbackCorrect = document.getElementById("feedbackCorrect");
  const feedbackExplain = document.getElementById("feedbackExplain");
  const nextBtn       = document.getElementById("nextBtn");
  const counter       = document.getElementById("counter");
  const failBox       = document.getElementById("failBox");
  const barFill       = document.getElementById("barFill");
  const quizCard      = document.getElementById("quizCard");
  const endScreen     = document.getElementById("endScreen");
  const endTrophy     = document.getElementById("endTrophy");
  const endTitle      = document.getElementById("endTitle");
  const endSub        = document.getElementById("endSub");
  const scoreMain     = document.getElementById("scoreMain");
  const scoreDetail   = document.getElementById("scoreDetail");
  const endActions    = document.getElementById("endActions");
  const vocabToggle   = document.getElementById("vocabToggle");
  const vocabBody     = document.getElementById("vocabBody");
  const vocabArrow    = document.getElementById("vocabArrow");

  let index  = 0;
  let errors = 0;
  let locked = false;

  // ── Vocab toggle ───────────────────────────────────────────────────────────
  vocabToggle.onclick = () => {
    const open = vocabBody.classList.toggle("open");
    vocabArrow.textContent = open ? "▲" : "▼";
  };

  // ── Vocab tap-to-listen ────────────────────────────────────────────────────
  document.querySelectorAll(".vocab-tap").forEach(btn => {
    btn.onclick = () => new Audio(AUDIO_BASE + btn.dataset.audio).play().catch(() => {});
  });

  // ── Render question ────────────────────────────────────────────────────────
  function renderQuestion() {
    locked = false;
    const q = QUESTIONS[index];

    counter.textContent  = `${index + 1} / ${QUESTIONS.length}`;
    failBox.textContent  = `Errores: ${errors}`;
    barFill.style.width  = `${((index + 1) / QUESTIONS.length) * 100}%`;

    feedbackBox.classList.remove("show");
    feedbackWrong.textContent   = "";
    feedbackWrong.className     = "feedback-line";
    feedbackCorrect.textContent = "";
    feedbackExplain.textContent = "";

    questionImg.src  = q.image;
    questionImg.alt  = q.prompt;
    questionText.textContent = q.prompt;

    optionsWrap.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className   = "option-btn";
      btn.textContent = opt;
      btn.addEventListener("click", () => chooseOption(i, btn));
      optionsWrap.appendChild(btn);
    });
  }

  // ── Choose option ──────────────────────────────────────────────────────────
  function chooseOption(choice, btnEl) {
    if (locked) return;
    locked = true;

    const q       = QUESTIONS[index];
    const allBtns = [...optionsWrap.querySelectorAll(".option-btn")];
    allBtns.forEach(b => b.disabled = true);

    if (choice === q.correct) {
      btnEl.classList.add("correct");
      feedbackWrong.className     = "feedback-line good";
      feedbackWrong.textContent   = "✔ Correcto";
      feedbackCorrect.textContent = q.correctAnswer;
      feedbackExplain.textContent = q.explain;
    } else {
      errors++;
      failBox.textContent = `Errores: ${errors}`;
      btnEl.classList.add("wrong");
      allBtns[q.correct].classList.add("correct");
      feedbackWrong.className     = "feedback-line bad";
      feedbackWrong.textContent   = `✘ Incorrecto: ${q.wrongMeaning}`;
      feedbackCorrect.textContent = q.correctAnswer;
      feedbackExplain.textContent = q.explain;
    }

    feedbackBox.classList.add("show");
  }

  // ── Next ───────────────────────────────────────────────────────────────────
  nextBtn.addEventListener("click", () => {
    index++;
    if (index >= QUESTIONS.length) {
      showEnd();
    } else {
      renderQuestion();
    }
  });

  // ── Level-based end screen ─────────────────────────────────────────────────
  function showEnd() {
    quizCard.style.display  = "none";
    endScreen.style.display = "block";

    const score = QUESTIONS.length - errors;
    scoreMain.textContent = `Puntaje: ${score} / ${QUESTIONS.length}`;

    let trophy, title, detail, actions;

    if (score <= 3) {
      trophy  = "😓";
      title   = "Necesitas practicar más";
      detail  = "Recomendación: Repite la lección para mejorar.";
      actions = `<button class="restart-btn" id="restartBtn">🔁 Intentar de nuevo</button>`;
    } else if (score <= 6) {
      trophy  = "🙂";
      title   = "Buen trabajo, pero puedes mejorar";
      detail  = "Intenta otra vez para un mejor resultado.";
      actions = `<button class="restart-btn" id="restartBtn">🔁 Intentar de nuevo</button>
                 <a class="continue-btn" href="p5.html">Continuar → Parte 5</a>`;
    } else {
      trophy  = "🏆";
      title   = "¡Muy buen trabajo!";
      detail  = "¡Listo para continuar!";
      actions = `<a class="continue-btn" href="p5.html">Continuar → Parte 5</a>`;
    }

    endTrophy.textContent  = trophy;
    endTitle.textContent   = title;
    endSub.textContent     = `Puntaje: ${score} / ${QUESTIONS.length}`;
    scoreDetail.textContent = detail;
    endActions.innerHTML   = actions;

    const restartBtn = document.getElementById("restartBtn");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        index  = 0;
        errors = 0;
        quizCard.style.display  = "block";
        endScreen.style.display = "none";
        renderQuestion();
      });
    }
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  renderQuestion();
})();
