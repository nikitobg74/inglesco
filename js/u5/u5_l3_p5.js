(() => {
  const UNIT   = 5;
  const LESSON = 3;
  const PART   = 5;

  const BASE       = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE   = BASE + "images/u5/";
  const AUDIO_BASE = BASE + "audio/u5/";

  // ── Slide list ──────────────────────────────────────────────────────────────
  // Each slide: image, audio, autoPlay, then one or more QUESTIONS.
  // Each question has:
  //   prompt  – sentence with "______" marking the blank
  //   options – [{ text, correct }]  (exactly 2 options, one correct)

  const SLIDES = [
    {
      image:    IMG_BASE   + "u5.birthday.jpg",
      audio:    AUDIO_BASE + "u5.birthday.mp3",
      autoPlay: false,
      questions: [
        {
          prompt:  "Today is my ______.",
          options: [
            { text: "birthday",  correct: true  },
            { text: "vacation",  correct: false }
          ]
	 },
        {
          prompt:  "All my ______ is at home.",
          options: [
            { text: "friends", correct: false },
            { text: "family", correct: true  }
	]
        }
      ]
    },
    {
      image:    IMG_BASE   + "u5.parents.fireplace.jpg",
      audio:    AUDIO_BASE + "u5.birthday1.mp3",
      autoPlay: true,
      questions: [
        {
          prompt:  "My parents are in the ______.",
          options: [
            { text: "bedroom",     correct: false },
            { text: "living room", correct: true  }
          ]
        },
        {
          prompt:  "They are ______ to their friends.",
          options: [
            { text: "reading", correct: false },
            { text: "talking", correct: true  }
          ]
        }
      ]
    },
    {
      image:    IMG_BASE   + "u5.wife.baking2.jpg",
      audio:    AUDIO_BASE + "u5.birthday2.mp3",
      autoPlay: true,
      questions: [
        {
          prompt:  "My wife is in the ______.",
          options: [
            { text: "bathroom", correct: false },
            { text: "kitchen",  correct: true  }
          ]
        },
        {
          prompt:  "She is ______ a chocolate cake.",
          options: [
            { text: "baking",  correct: true  },
            { text: "cooking", correct: false }
          ]
        }
      ]
    },
    {
      image:    IMG_BASE   + "u5.boy.guitar.jpg",
      audio:    AUDIO_BASE + "u5.birthday3.mp3",
      autoPlay: true,
      questions: [
        {
          prompt:  "My son is in his ______.",
          options: [
            { text: "bathroom", correct: false },
            { text: "bedroom",  correct: true  }
          ]
        },
        {
          prompt:  "He is ______ the guitar.",
          options: [
            { text: "fixing",  correct: false },
            { text: "playing", correct: true  }
          ]
        }
      ]
    },
    {
      image:    IMG_BASE   + "u5.girls.playing.jpg",
      audio:    AUDIO_BASE + "u5.birthday4.mp3",
      autoPlay: true,
      questions: [
        {
          prompt:  "My daughter is in the ______.",
          options: [
            { text: "yard", correct: true  },
            { text: "zoo",  correct: false }
          ]
        },
        {
          prompt:  "She is ______ with her friend.",
          options: [
            { text: "riding",  correct: false },
            { text: "playing", correct: true  }
          ]
        }
      ]
    },
    {
      image:    IMG_BASE   + "u5.fixing.sink.jpg",
      audio:    AUDIO_BASE + "u5.birthday5.mp3",
      autoPlay: true,
      questions: [
        {
          prompt:  "My brother is in the ______.",
          options: [
            { text: "bedroom",  correct: false },
            { text: "bathroom", correct: true  }
          ]
        },
        {
          prompt:  "He is ______ the sink.",
          options: [
            { text: "fixing",   correct: true  },
            { text: "cleaning", correct: false }
          ]
        }
      ]
    },
    {
      image:    IMG_BASE   + "u5.wife.baking.jpg",
      audio:    AUDIO_BASE + "u5.birthday6.mp3",
      autoPlay: true,
      questions: [
        {
          prompt:  "She is ______ my wife.",
          options: [
            { text: "baking",  correct: false },
            { text: "helping", correct: true  }
          ]
        }
      ]
    },
    {
      image:    IMG_BASE   + "u5.sister.washing.jpg",
      audio:    AUDIO_BASE + "u5.birthday7.mp3",
      autoPlay: true,
      questions: [
        {
          prompt:  "My sister is not ______.",
          options: [
            { text: "married", correct: true  },
            { text: "single",  correct: false }
          ]
        },
        {
          prompt:  "She is ______ her car.",
          options: [
            { text: "fixing",  correct: false },
            { text: "washing", correct: true  }
          ]
        }
      ]
    }
  ];

  // ── DOM refs ────────────────────────────────────────────────────────────────
  const imgEl         = document.getElementById("lessonImg");
  const playBtn       = document.getElementById("playBtn");
  const continueBtn   = document.getElementById("continueBtn");
  const counterEl     = document.getElementById("counter");
  const barEl         = document.getElementById("progressBar");
  const mainCard      = document.getElementById("mainCard");
  const endScreen     = document.getElementById("endScreen");
  const questionsArea = document.getElementById("questionsArea");

  let slideIndex    = 0;
  let currentAudio  = null;

  // ── Counter / bar ───────────────────────────────────────────────────────────
  function updateCounter() {
    counterEl.textContent = `${slideIndex + 1} / ${SLIDES.length}`;
    barEl.style.width = ((slideIndex + 1) / SLIDES.length * 100) + "%";
  }

  // ── Audio helpers ───────────────────────────────────────────────────────────
  function setPlayState(state) {
    playBtn.className   = "play-btn " + state;
    playBtn.textContent = state === "playing" ? "⏸" : "▶";
    playBtn.disabled    = false;
  }

  function destroyAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    }
  }

  function togglePlay(audio) {
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlayState("playing")).catch(() => {});
    } else {
      audio.pause();
      setPlayState("idle");
    }
  }

  // ── Continue button ─────────────────────────────────────────────────────────
  function showContinue() { continueBtn.classList.add("visible"); }
  function hideContinue()  { continueBtn.classList.remove("visible"); }

  // ── Render questions ────────────────────────────────────────────────────────
  // Returns a promise that resolves when ALL questions on this slide are answered correctly.
  function renderQuestions(slide) {
    questionsArea.innerHTML = "";
    questionsArea.style.display = "block";

    const total     = slide.questions.length;
    let   answered  = 0;

    return new Promise(resolve => {
      slide.questions.forEach((q, qi) => {
        // Wrapper
        const block = document.createElement("div");
        block.className = "q-block";

        // Prompt
        const promptEl = document.createElement("p");
        promptEl.className = "q-prompt";
        promptEl.textContent = q.prompt;
        block.appendChild(promptEl);

        // Options row
        const optRow = document.createElement("div");
        optRow.className = "options-row";

        q.options.forEach(opt => {
          const btn = document.createElement("button");
          btn.className = "opt-btn";
          btn.textContent = opt.text;

          btn.onclick = () => {
            if (btn.disabled) return;

            if (opt.correct) {
              // Mark correct
              btn.classList.add("correct");
              // Disable all buttons in this question
              optRow.querySelectorAll(".opt-btn").forEach(b => b.disabled = true);
              // Fill blank in prompt
              promptEl.textContent = q.prompt.replace("______", opt.text);
              answered++;
              if (answered === total) resolve();
            } else {
              // Wrong – flash red briefly, keep active
              btn.classList.add("wrong");
              setTimeout(() => btn.classList.remove("wrong"), 600);
            }
          };

          optRow.appendChild(btn);
        });

        block.appendChild(optRow);
        questionsArea.appendChild(block);
      });
    });
  }

  // ── Load a slide ────────────────────────────────────────────────────────────
  function loadSlide(index) {
    slideIndex = index;
    updateCounter();
    destroyAudio();
    hideContinue();
    questionsArea.innerHTML = "";
    questionsArea.style.display = "none";

    const slide = SLIDES[index];

    imgEl.src = slide.image;
    imgEl.alt = slide.questions[0]?.prompt || "";

    const audio = new Audio(slide.audio);
    currentAudio = audio;

    playBtn.onclick = () => togglePlay(audio);

    // After audio ends → show questions
    audio.addEventListener("ended", () => {
      setPlayState("done");
      renderQuestions(slide).then(() => showContinue());
    });

    if (slide.autoPlay) {
      playBtn.disabled = true;
      setPlayState("idle");
      setTimeout(() => {
        audio.play()
          .then(() => setPlayState("playing"))
          .catch(() => { setPlayState("idle"); playBtn.disabled = false; });
      }, 600);
    } else {
      setPlayState("idle");
    }
  }

  // ── Continuar ───────────────────────────────────────────────────────────────
  continueBtn.onclick = () => {
    const next = slideIndex + 1;
    if (next >= SLIDES.length) {
      mainCard.style.display = "none";
      endScreen.style.display = "block";
      registerCompletion();
    } else {
      loadSlide(next);
    }
  };

  // ── Register lesson completion ───────────────────────────────────────────────
  function registerCompletion() {
    try {
      if (typeof registerLessonComplete === "function") {
        registerLessonComplete(UNIT, LESSON, PART);
      }
      if (typeof progress !== "undefined" && typeof progress.markComplete === "function") {
        progress.markComplete(UNIT, LESSON, PART);
      }
    } catch (e) {
      console.warn("Completion registration not available:", e);
    }
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  loadSlide(0);
})();
