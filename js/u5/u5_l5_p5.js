(() => {
  const UNIT   = 5;
  const LESSON = 5;
  const PART   = 5;

  const BASE       = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE   = BASE + "images/u5/";
  const AUDIO_BASE = BASE + "audio/u5/";

  // ── Slide + question data ──────────────────────────────────────────────────
  // Each SLIDE has:
  //   image    — image file
  //   audio    — narration audio
  //   who      — "Who are they?" label text
  //   lines    — array of text lines shown under the label
  //   questions — array of { prompt, answer, wrong } shown one by one after audio

  const SLIDES = [
    {
      image: IMG_BASE   + "u5.brother.sister.grandparents.jpg",
      audio: AUDIO_BASE + "u5.who.are.they.mp3",
      who:   "Who are they?",
      lines: [
        "They are David and Susan.",
        "They are Mary and Tom's grandparents.",
        "Mary is their granddaughter.",
        "Tom is their grandson.",
        "David is their grandfather.",
        "Susan is their grandmother."
      ],
      questions: [
        { prompt: "👉 Who is David?",    answer: "grandfather",  wrong: "father"   },
        { prompt: "👉 Who is Susan?",    answer: "grandmother",  wrong: "mother"   },
        { prompt: "👉 Mary is their ___", answer: "granddaughter", wrong: "daughter" },
        { prompt: "👉 Tom is their ___",  answer: "grandson",     wrong: "brother"  }
      ]
    },
    {
      image: IMG_BASE   + "u5.baby.grandparents.jpg",
      audio: AUDIO_BASE + "u5.who.are.they2.mp3",
      who:   "Who are they?",
      lines: [
        "They are David and Susan.",
        "They are Bill's grandparents.",
        "Bill is their grandson.",
        "David is Bill's grandfather.",
        "Susan is Bill's grandmother."
      ],
      questions: [
        { prompt: "👉 David is Bill's ___", answer: "grandfather", wrong: "uncle" },
        { prompt: "👉 Susan is Bill's ___", answer: "grandmother", wrong: "aunt"  }
      ]
    }
  ];

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const mainCard    = document.getElementById("mainCard");
  const barFill     = document.getElementById("barFill");
  const slideImg    = document.getElementById("slideImg");
  const whoLabel    = document.getElementById("whoLabel");
  const slideLines  = document.getElementById("slideLines");
  const playBtn     = document.getElementById("playBtn");
  const quizSection = document.getElementById("quizSection");
  const scoreNum    = document.getElementById("scoreNum");
  const scoreTotal  = document.getElementById("scoreTotal");
  const qPrompt     = document.getElementById("qPrompt");
  const optionsWrap = document.getElementById("optionsWrap");
  const feedbackBox = document.getElementById("feedbackBox");
  const btnNext     = document.getElementById("btnNext");
  const endScreen   = document.getElementById("endScreen");
  const vocabToggle = document.getElementById("vocabToggle");
  const vocabBody   = document.getElementById("vocabBody");
  const vocabArrow  = document.getElementById("vocabArrow");

  let slideIndex = 0;
  let qIndex     = 0;
  let score      = 0;
  let totalQs    = SLIDES.reduce((sum, s) => sum + s.questions.length, 0);
  let currentAudio = null;

  // ── Vocab toggle ───────────────────────────────────────────────────────────
  vocabToggle.onclick = () => {
    const open = vocabBody.classList.toggle("open");
    vocabArrow.textContent = open ? "▲" : "▼";
  };

  document.querySelectorAll(".vocab-tap").forEach(btn => {
    btn.onclick = () => new Audio(AUDIO_BASE + btn.dataset.audio).play().catch(() => {});
  });

  // ── Progress bar (across all slides) ──────────────────────────────────────
  function updateBar() {
    // count questions answered so far across completed slides + current qIndex
    const doneSlides = SLIDES.slice(0, slideIndex).reduce((s, sl) => s + sl.questions.length, 0);
    const total      = totalQs;
    const done       = doneSlides + qIndex;
    barFill.style.width = (done / total * 100) + "%";
  }

  // ── Audio helpers ──────────────────────────────────────────────────────────
  function destroyAudio() {
    if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
  }

  function setPlayState(state) {
    playBtn.className   = "play-btn " + state;
    playBtn.textContent = state === "playing" ? "⏸" : "▶";
    playBtn.disabled    = false;
  }

  // ── Load slide ─────────────────────────────────────────────────────────────
  function loadSlide(index) {
    slideIndex = index;
    qIndex     = 0;
    destroyAudio();

    const sl = SLIDES[index];

    slideImg.src = sl.image;
    slideImg.alt = sl.who;
    whoLabel.textContent = sl.who;

    slideLines.innerHTML = sl.lines
      .map(l => `<span class="line-en">👉 ${l}</span>`)
      .join("");

    // Hide quiz until audio ends
    quizSection.classList.remove("visible");
    feedbackBox.className  = "feedback-box";
    feedbackBox.innerHTML  = "";
    btnNext.classList.remove("visible");
    optionsWrap.innerHTML  = "";
    qPrompt.textContent    = "";
    scoreTotal.textContent = totalQs;
    scoreNum.textContent   = score;

    updateBar();

    // Audio
    const audio = new Audio(sl.audio);
    currentAudio = audio;
    setPlayState("idle");

    playBtn.onclick = () => {
      if (!audio.paused) {
        audio.pause();
        setPlayState("idle");
      } else {
        audio.play().then(() => setPlayState("playing")).catch(() => {});
      }
    };

    audio.onended = () => {
      setPlayState("done");
      showQuestion(0);
    };
  }

  // ── Show question ──────────────────────────────────────────────────────────
  function showQuestion(index) {
    qIndex = index;
    updateBar();

    const sl = SLIDES[slideIndex];
    const q  = sl.questions[index];

    quizSection.classList.add("visible");
    feedbackBox.className  = "feedback-box";
    feedbackBox.innerHTML  = "";
    btnNext.classList.remove("visible");

    qPrompt.textContent = q.prompt;

    // Shuffle options
    const opts = [
      { text: q.answer, correct: true  },
      { text: q.wrong,  correct: false }
    ].sort(() => Math.random() - 0.5);

    optionsWrap.innerHTML = "";
    opts.forEach(opt => {
      const btn = document.createElement("button");
      btn.className   = "option-btn";
      btn.textContent = opt.text;
      btn.onclick     = () => handleAnswer(btn, opt.correct, q);
      optionsWrap.appendChild(btn);
    });
  }

  // ── Handle answer ──────────────────────────────────────────────────────────
  function handleAnswer(btn, isCorrect, q) {
    const allBtns = [...optionsWrap.querySelectorAll(".option-btn")];
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect) {
      score++;
      scoreNum.textContent = score;
      btn.classList.add("correct");
      feedbackBox.className = "feedback-box correct show";
      feedbackBox.innerHTML = `✔ Correcto: <strong>${q.answer}</strong>`;
    } else {
      btn.classList.add("wrong");
      allBtns.find(b => b.textContent === q.answer).classList.add("correct");
      feedbackBox.className = "feedback-box wrong show";
      feedbackBox.innerHTML = `❌ Incorrecto. Correcto: <strong>${q.answer}</strong>`;
    }

    btnNext.classList.add("visible");
  }

  // ── Next button ────────────────────────────────────────────────────────────
  btnNext.onclick = () => {
    const sl      = SLIDES[slideIndex];
    const nextQ   = qIndex + 1;

    feedbackBox.className = "feedback-box";
    feedbackBox.innerHTML = "";
    btnNext.classList.remove("visible");

    if (nextQ < sl.questions.length) {
      // More questions on this slide
      showQuestion(nextQ);
    } else {
      // Done with this slide's questions — next slide or end
      const nextSlide = slideIndex + 1;
      if (nextSlide < SLIDES.length) {
        loadSlide(nextSlide);
      } else {
        showEnd();
      }
    }
  };

  // ── Level-based end screen ─────────────────────────────────────────────────
  function showEnd() {
    mainCard.style.display  = "none";
    endScreen.style.display = "block";
    barFill.style.width     = "100%";

    let trophy, heading, sub, actions;

    if (score <= 2) {
      trophy  = "😓";
      heading = "Necesitas practicar más";
      sub     = "Recomendación: Repite la lección para mejorar.";
      actions = `<a href="p5.html" style="display:inline-block;padding:12px 28px;background:#ef4444;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">🔁 Intentar de nuevo</a>`;
    } else if (score <= 4) {
      trophy  = "🙂";
      heading = "Buen trabajo, pero puedes mejorar";
      sub     = "Intenta otra vez para un mejor resultado.";
      actions = `<a href="p5.html" style="display:inline-block;padding:12px 28px;background:#f59e0b;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">🔁 Intentar de nuevo</a>
                 &nbsp;
                 <a href="../index.html" style="display:inline-block;padding:12px 28px;background:#2563eb;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">Continuar →</a>`;
    } else {
      trophy  = "🏆";
      heading = "¡Muy buen trabajo!";
      sub     = "¡Listo para continuar!";
      actions = `<a href="../index.html" style="display:inline-block;padding:12px 28px;background:#2563eb;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">Continuar →</a>`;
    }

    endScreen.innerHTML = `
      <div style="font-size:52px;margin-bottom:12px">${trophy}</div>
      <h2 style="font-size:22px;font-weight:900;color:#1e40af;margin-bottom:8px">${heading}</h2>
      <p style="font-size:16px;font-weight:700;color:#374151;margin-bottom:6px">Puntaje: ${score} / ${totalQs}</p>
      <p style="font-size:14px;color:#64748b;margin-bottom:24px">${sub}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${actions}</div>
    `;
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  loadSlide(0);
})();
