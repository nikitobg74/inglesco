(() => {
  const UNIT   = 5;
  const LESSON = 6;
  const PART   = 1;

  const BASE      = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_U4    = BASE + "images/u4/";
  const IMG_U5    = BASE + "images/u5/";
  const AUD_BASE  = BASE + "audio/u5/";

  // ── Slides ─────────────────────────────────────────────────────────────────
  // Each slide: image, audio, then phrases with fill-in-the-blank options.
  // Wrong answer locks red permanently. Correct locks green.
  // Siguiente appears after all phrases on a slide are answered.

  const SLIDES = [
    {
      image: IMG_U4 + "u4.l6.p1.noisy.jpg",
      audio: AUD_BASE + "u5.neighbor.noisy.mp3",
      phrases: [
        {
          text:    "John's neighbors are very _____.",
          options: [
            { text: "noisy", correct: true  },
            { text: "quiet", correct: false }
          ]
        },
        {
          text:    "They are not _____.",
          options: [
            { text: "noisy", correct: false },
            { text: "quiet", correct: true  }
          ]
        }
      ]
    },
    {
      image: IMG_U4 + "u4.l6.p1.pretty.sister.jpg",
      audio: AUD_BASE + "u5.sister.pretty.mp3",
      phrases: [
        {
          text:    "John's sister is _____.",
          options: [
            { text: "pretty", correct: true  },
            { text: "ugly",   correct: false }
          ]
        },
        {
          text:    "In fact, she is very _____.",
          options: [
            { text: "pretty", correct: true  },
            { text: "ugly",   correct: false }
          ]
        }
      ]
    },
    {
      image: IMG_U4 + "u4.l6.p1.handsome.jpg",
      audio: AUD_BASE + "u5.brother.handsome.mp3",
      phrases: [
        {
          text:    "John's brother is _____.",
          options: [
            { text: "handsome", correct: true  },
            { text: "ugly",     correct: false }
          ]
        },
        {
          text:    "In fact, he is very _____.",
          options: [
            { text: "handsome", correct: true },
            { text: "tall",     correct: false }
          ]
        }
      ]
    },
    {
      image: IMG_U4 + "u4.l6.p1.ugly.jpg",
      audio: AUD_BASE + "u5.house.old.mp3",
      phrases: [
        {
          text:    "John's house is not _____.",
          options: [
            { text: "pretty", correct: true },
            { text: "ugly",   correct: false }
          ]
        },
        {
          text:    "It is _____.",
          options: [
            { text: "pretty", correct: false },
            { text: "old",    correct: true }
          ]
        }
      ]
    },
    {
      image: IMG_U4 + "u4.l6.p1.noisy.dog.jpg",
      audio: AUD_BASE + "u5.dog.noisy.2.mp3",
      phrases: [
        {
          text:    "John's dog is not _____.",
          options: [
            { text: "noisy", correct: false  },
            { text: "quiet", correct: true  }
          ]
        },
        {
          text:    "It is very _____.",
          options: [
            { text: "noisy", correct: true },
            { text: "quiet", correct:  false  }
          ]
        }
      ]
    },
    {
      image: IMG_U5 + "u5.hard.work.jpg",
      audio: AUD_BASE + "u5.work.difficult.mp3",
      phrases: [
        {
          text:    "John's work is not _____.",
          options: [
            { text: "easy",      correct: true  },
            { text: "difficult", correct: false  }
          ]
        },
        {
          text:    "It is _____.",
          options: [
            { text: "easy",      correct: false  },
            { text: "difficult", correct: true }
          ]
        }
      ]
    }
  ];

  // ── State ──────────────────────────────────────────────────────────────────
  let slideIndex   = 0;
  let correctCount = 0;
  let totalAnswered = 0;
  const TOTAL_PHRASES = SLIDES.reduce((s, sl) => s + sl.phrases.length, 0);

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const imgEl      = document.getElementById("lessonImg");
  const audioHint  = document.getElementById("audioHint");
  const imgWrap    = document.getElementById("imgWrap");
  const counterEl  = document.getElementById("counter");
  const barEl      = document.getElementById("progressBar");
  const mainCard   = document.getElementById("mainCard");
  const endScreen  = document.getElementById("endScreen");
  const phraseArea = document.getElementById("phraseArea");
  const sigBtn     = document.getElementById("sigBtn");
  const scoreNum   = document.getElementById("scoreNum");
  const scoreMsg   = document.getElementById("scoreMsg");
  const redoBtn    = document.getElementById("redoBtn");
  const vocabToggle = document.getElementById("vocabToggle");
  const vocabBody   = document.getElementById("vocabBody");

  // ── Vocab toggle ───────────────────────────────────────────────────────────
  vocabToggle.addEventListener("click", () => {
    const open = vocabToggle.classList.toggle("open");
    vocabBody.classList.toggle("hidden", !open);
  });

  // ── Audio ──────────────────────────────────────────────────────────────────
  let currentAudio = null;

  function setupAudio(src) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    currentAudio = new Audio(src);

    imgWrap.onclick = () => {
      currentAudio.currentTime = 0;
      currentAudio.play();
      audioHint.textContent = "▶ Reproduciendo...";
      audioHint.classList.add("playing");
      currentAudio.onended = () => {
        audioHint.textContent = "▶ Toca la imagen para escuchar";
        audioHint.classList.remove("playing");
      };
    };
  }

  // ── Counter / bar ──────────────────────────────────────────────────────────
  function updateCounter() {
    counterEl.textContent = `${slideIndex + 1} / ${SLIDES.length}`;
    barEl.style.width = ((slideIndex + 1) / SLIDES.length * 100) + "%";
  }

  // ── Render all phrases for the current slide ───────────────────────────────
  function renderPhrases(slide) {
    phraseArea.innerHTML = "";
    sigBtn.classList.remove("visible");

    let answeredOnSlide = 0;
    const totalOnSlide  = slide.phrases.length;

    slide.phrases.forEach((phrase, pi) => {
      const block = document.createElement("div");
      block.className = "phrase-block";

      const textEl = document.createElement("p");
      textEl.className = "phrase-text";
      textEl.textContent = phrase.text;

      const optRow = document.createElement("div");
      optRow.className = "options-row";

      phrase.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "opt-btn";
        btn.textContent = opt.text;

        btn.onclick = () => {
          if (btn.disabled) return;

          // Lock all buttons on this phrase
          optRow.querySelectorAll(".opt-btn").forEach(b => b.disabled = true);
          totalAnswered++;

          if (opt.correct) {
            btn.classList.add("correct");
            textEl.textContent = phrase.text.replace("_____", opt.text);
            correctCount++;
          } else {
            btn.classList.add("wrong");
            // Also show which was correct
            optRow.querySelectorAll(".opt-btn").forEach(b => {
              const isCorrectOpt = phrase.options.find(o => o.text === b.textContent && o.correct);
              if (isCorrectOpt) b.classList.add("correct");
            });
          }

          answeredOnSlide++;
          if (answeredOnSlide === totalOnSlide) {
            sigBtn.classList.add("visible");
          }
        };

        optRow.appendChild(btn);
      });

      block.appendChild(textEl);
      block.appendChild(optRow);
      phraseArea.appendChild(block);

      // Staggered fade in
      setTimeout(() => {
        requestAnimationFrame(() => block.classList.add("visible"));
      }, pi * 180);
    });
  }

  // ── Load slide ─────────────────────────────────────────────────────────────
  function loadSlide(index) {
    slideIndex = index;
    updateCounter();
    phraseArea.innerHTML = "";
    sigBtn.classList.remove("visible");

    const slide = SLIDES[index];
    imgEl.src = slide.image;
    imgEl.alt = slide.phrases[0].text;
    audioHint.textContent = "▶ Toca la imagen para escuchar";
    audioHint.classList.remove("playing");

    setupAudio(slide.audio);
    renderPhrases(slide);
  }

  // ── Siguiente button ───────────────────────────────────────────────────────
  sigBtn.addEventListener("click", () => {
    sigBtn.classList.remove("visible");
    const next = slideIndex + 1;
    if (next >= SLIDES.length) {
      showEndScreen();
    } else {
      loadSlide(next);
    }
  });

  // ── End screen ─────────────────────────────────────────────────────────────
  function showEndScreen() {
    if (currentAudio) currentAudio.pause();
    mainCard.style.display = "none";
    endScreen.style.display = "block";
    scoreNum.textContent = `${correctCount} / ${TOTAL_PHRASES}`;
    if (correctCount === TOTAL_PHRASES) {
      scoreMsg.textContent = "¡Perfecto! ¡Todo correcto!";
    } else if (correctCount >= TOTAL_PHRASES * 0.7) {
      scoreMsg.textContent = "¡Muy bien! Casi perfecto.";
    } else {
      scoreMsg.textContent = "¡Sigue practicando!";
    }
  }

  // ── Redo ───────────────────────────────────────────────────────────────────
  redoBtn.addEventListener("click", () => {
    correctCount  = 0;
    totalAnswered = 0;
    endScreen.style.display = "none";
    mainCard.style.display  = "block";
    loadSlide(0);
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  loadSlide(0);
})();
