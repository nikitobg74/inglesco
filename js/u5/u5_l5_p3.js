(() => {
  const UNIT   = 5;
  const LESSON = 5;
  const PART   = 3;

  const BASE       = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE   = BASE + "images/u5/";
  const AUDIO_BASE = BASE + "audio/u5/";

  // Each question:
  //   image      — image file
  //   audio      — sentence audio file
  //   before     — text before the blank
  //   after      — text after the blank
  //   answer     — correct word
  //   wrong      — wrong word
  //   es         — Spanish translation shown in feedback

  const QUESTIONS = [
    {
      image:  IMG_BASE   + "u5.brother.sister.jpg",
      audio:  AUDIO_BASE + "u5.mary.tom.mp3",
      before: "Mary is Tom's",
      after:  ".",
      answer: "sister",
      wrong:  "brother",
      es:     "Mary es la hermana de Tom."
    },
    {
      image:  IMG_BASE   + "u5.brother.sister.jpg",
      audio:  AUDIO_BASE + "u5.mary.tom.mp3",
      before: "Tom is Mary's",
      after:  ".",
      answer: "brother",
      wrong:  "sister",
      es:     "Tom es el hermano de Mary."
    },
    {
      image:  IMG_BASE   + "u5.craig.linda.jpg",
      audio:  AUDIO_BASE + "u5.linda.craig.mp3",
      before: "Craig is Linda's",
      after:  ".",
      answer: "husband",
      wrong:  "wife",
      es:     "Craig es el esposo de Linda."
    },
    {
      image:  IMG_BASE   + "u5.craig.linda.jpg",
      audio:  AUDIO_BASE + "u5.linda.craig.mp3",
      before: "Linda is Craig's",
      after:  ".",
      answer: "wife",
      wrong:  "husband",
      es:     "Linda es la esposa de Craig."
    },
    {
      image:  IMG_BASE   + "u5.brother.sister.uncle.jpg",
      audio:  AUDIO_BASE + "u5.niece.nephew.mp3",
      before: "Mary is Craig's",
      after:  ".",
      answer: "niece",
      wrong:  "daughter",
      es:     "Mary es la sobrina de Craig."
    },
    {
      image:  IMG_BASE   + "u5.brother.sister.uncle.jpg",
      audio:  AUDIO_BASE + "u5.niece.nephew.mp3",
      before: "Tom is Craig's",
      after:  ".",
      answer: "nephew",
      wrong:  "son",
      es:     "Tom es el sobrino de Craig."
    },
    {
      image:  IMG_BASE   + "u5.brother.sister.uncle.jpg",
      audio:  AUDIO_BASE + "u5.niece.nephew.mp3",
      before: "Craig is Mary and Tom's",
      after:  ".",
      answer: "uncle",
      wrong:  "aunt",
      es:     "Craig es el tío de Mary y Tom."
    },
    {
      image:  IMG_BASE   + "u5.brother.sister.uncle.jpg",
      audio:  AUDIO_BASE + "u5.niece.nephew.mp3",
      before: "Linda is Mary and Tom's",
      after:  ".",
      answer: "aunt",
      wrong:  "uncle",
      es:     "Linda es la tía de Mary y Tom."
    },
    {
      image:  IMG_BASE   + "u5.baby.bill.jpg",
      audio:  AUDIO_BASE + "u5.baby.bill.mp3",
      before: "Bill is Craig and Linda's",
      after:  ".",
      answer: "baby",
      wrong:  "dog",
      es:     "Bill es el bebé de Craig y Linda."
    },
    {
      image:  IMG_BASE   + "u5.brother.sister.baby.jpg",
      audio:  AUDIO_BASE + "u5.baby.bill.mp3",
      before: "Bill is Tom and Mary's",
      after:  ".",
      answer: "cousin",
      wrong:  "brother",
      es:     "Bill es el primo de Tom y Mary."
    }
  ];

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const imgEl       = document.getElementById("lessonImg");
  const playBtn     = document.getElementById("playBtn");
  const sentenceEl  = document.getElementById("sentenceWrap");
  const wordBankEl  = document.getElementById("wordBank");
  const feedbackEl  = document.getElementById("feedbackBox");
  const continueBtn = document.getElementById("continueBtn");
  const counterEl   = document.getElementById("counter");
  const scoreNumEl  = document.getElementById("scoreNum");
  const barEl       = document.getElementById("progressBar");
  const mainCard    = document.getElementById("mainCard");
  const endScreen   = document.getElementById("endScreen");
  const vocabToggle = document.getElementById("vocabToggle");
  const vocabBody   = document.getElementById("vocabBody");
  const vocabArrow  = document.getElementById("vocabArrow");

  let questionIndex = 0;
  let score         = 0;
  let answered      = false;
  let currentAudio  = null;

  // ── Vocab toggle ───────────────────────────────────────────────────────────
  vocabToggle.onclick = () => {
    const open = vocabBody.classList.toggle("open");
    vocabArrow.textContent = open ? "▲" : "▼";
  };

  // ── Vocab tap-to-listen ────────────────────────────────────────────────────
  document.querySelectorAll(".vocab-tap").forEach(btn => {
    btn.onclick = () => {
      const audio = new Audio(AUDIO_BASE + btn.dataset.audio);
      audio.play().catch(() => {});
    };
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  function updateCounter() {
    counterEl.textContent = `${questionIndex + 1} / ${QUESTIONS.length}`;
    barEl.style.width = ((questionIndex + 1) / QUESTIONS.length * 100) + "%";
  }

  function showContinue() { continueBtn.classList.add("visible"); }
  function hideContinue()  { continueBtn.classList.remove("visible"); }

  function destroyAudio() {
    if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
  }

  function setPlayState(state) {
    playBtn.className   = "play-btn " + state;
    playBtn.textContent = state === "playing" ? "⏸" : "▶";
    playBtn.disabled    = false;
  }

  // ── Render sentence with blank ─────────────────────────────────────────────
  function renderSentence(q, filledWord, state) {
    let blankClass = "blank";
    if (state === "correct") blankClass += " filled-correct";
    if (state === "wrong")   blankClass += " filled-wrong";

    const blankContent = filledWord
      ? filledWord
      : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

    sentenceEl.innerHTML =
      (q.before ? q.before + " " : "") +
      `<span class="${blankClass}" id="blankSpan">${blankContent}</span>` +
      (q.after || "");
  }

  // ── Load question ──────────────────────────────────────────────────────────
  function loadQuestion(index) {
    questionIndex = index;
    answered      = false;
    updateCounter();
    hideContinue();
    destroyAudio();

    feedbackEl.className = "feedback-box";
    feedbackEl.innerHTML = "";

    const q = QUESTIONS[index];

    imgEl.src = q.image;
    imgEl.alt = q.before;

    // Audio
    const audio = new Audio(q.audio);
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
    audio.onended = () => setPlayState("done");

    // Sentence
    renderSentence(q, null, null);

    // Word bank — shuffled
    const words = [q.answer, q.wrong].sort(() => Math.random() - 0.5);
    wordBankEl.innerHTML = "";
    words.forEach(word => {
      const chip = document.createElement("button");
      chip.className   = "chip";
      chip.textContent = word;
      chip.onclick     = () => handleChip(chip, word, q);
      wordBankEl.appendChild(chip);
    });
  }

  // ── Handle chip tap ────────────────────────────────────────────────────────
  function handleChip(chip, word, q) {
    if (answered) return;
    answered = true;

    const isCorrect = word.toLowerCase() === q.answer.toLowerCase();

    // Lock all chips
    wordBankEl.querySelectorAll(".chip").forEach(c => c.disabled = true);

    if (isCorrect) {
      score++;
      scoreNumEl.textContent = score;

      renderSentence(q, word, "correct");

      feedbackEl.className = "feedback-box correct show";
      feedbackEl.innerHTML =
        `✔ Correcto: <strong>${q.before} ${q.answer}${q.after}</strong><br>
         <span style="color:#0d9488">${q.es}</span>`;
    } else {
      renderSentence(q, word, "wrong");

      feedbackEl.className = "feedback-box wrong show";
      feedbackEl.innerHTML =
        `❌ Incorrecto: <strong>${q.before} ${word}${q.after}</strong><br>
         <span style="color:#0d9488">${q.es}</span>`;
    }

    showContinue();
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

  // ── Level-based end screen ─────────────────────────────────────────────────
  function showEndScreen() {
    mainCard.style.display   = "none";
    endScreen.style.display  = "block";

    const total = QUESTIONS.length;
    let trophy, heading, sub, nextBtn;

    if (score <= 4) {
      trophy  = "😓";
      heading = "Necesitas practicar más";
      sub     = "Recomendación: Repite la lección para mejorar.";
      nextBtn = `<a href="p3.html" style="display:inline-block;padding:12px 28px;background:#ef4444;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">🔁 Intentar de nuevo</a>`;
    } else if (score <= 7) {
      trophy  = "🙂";
      heading = "Buen trabajo, pero puedes mejorar";
      sub     = "Intenta otra vez para un mejor resultado.";
      nextBtn = `<a href="p3.html" style="display:inline-block;padding:12px 28px;background:#f59e0b;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">🔁 Intentar de nuevo</a>
                 &nbsp;
                 <a href="p4.html" style="display:inline-block;padding:12px 28px;background:#2563eb;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">Continuar → Parte 4</a>`;
    } else {
      trophy  = "🏆";
      heading = "¡Muy buen trabajo!";
      sub     = "¡Listo para continuar!";
      nextBtn = `<a href="p4.html" style="display:inline-block;padding:12px 28px;background:#2563eb;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">Continuar → Parte 4</a>`;
    }

    endScreen.innerHTML = `
      <div style="font-size:52px;margin-bottom:12px">${trophy}</div>
      <h2 style="font-size:22px;font-weight:900;color:#1e40af;margin-bottom:8px">${heading}</h2>
      <p style="font-size:16px;font-weight:700;color:#374151;margin-bottom:6px">Puntaje: ${score} / ${total}</p>
      <p style="font-size:14px;color:#64748b;margin-bottom:24px">${sub}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${nextBtn}</div>
    `;
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  loadQuestion(0);
})();
