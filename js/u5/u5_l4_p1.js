(() => {
  const UNIT   = 5;
  const LESSON = 4;
  const PART   = 1;

  const BASE       = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE   = BASE + "images/u5/";
  const AUDIO_BASE = BASE + "audio/u5/";

  // ── Vocabulary bank ────────────────────────────────────────────────────────
  const VOCAB = [
    { word: "aunt",    es: "tía",     audio: AUDIO_BASE + "u5.aunt.mp3"    },
    { word: "uncle",   es: "tío",     audio: AUDIO_BASE + "u5.uncle.mp3"   },
    { word: "cousin",  es: "primo/a", audio: AUDIO_BASE + "u5.cousin.mp3"  },
    { word: "feeding", es: "dando de comer", audio: AUDIO_BASE + "u5.feeding.mp3" },
    { word: "mowing",  es: "cortando", audio: AUDIO_BASE + "u5.mowing.mp3"  },
    { word: "grass",   es: "césped",  audio: AUDIO_BASE + "u5.grass.mp3"   }
  ];

  // ── Slides ─────────────────────────────────────────────────────────────────
  // Each slide: image, audio (student must tap ▶), story lines, then one question.
  // question: { prompt, options: [{ text, correct }] }
  // After correct answer → 600 ms pause → auto-advance.

  const SLIDES = [
    {
      image:  IMG_BASE   + "u5.couple.house.jpg",
      audio:  AUDIO_BASE + "u5.uncle.aunt.mp3",
      lines:  [
        "This is my aunt Carla and my uncle Greg.",
        "They are from Chicago.",
        "Their house is small."
      ],
      question: {
        prompt:  "Their house is _____.",
        options: [
          { text: "small", correct: true  },
          { text: "big",   correct: false }
        ]
      }
    },
    {
      image:  IMG_BASE   + "u5.boy.riding.jpg",
      audio:  AUDIO_BASE + "u5.cousin.tommy.mp3",
      lines:  [
        "This is my cousin Tommy.",
        "He is at the park.",
        "He is riding his bicycle."
      ],
      question: {
        prompt:  "Tommy is my _____.",
        options: [
          { text: "brother", correct: false },
          { text: "cousin",  correct: true  }
        ]
      }
    },
    {
      image:  IMG_BASE   + "u5.feed.birds.jpg",
      audio:  AUDIO_BASE + "u5.cousin.shelly.mp3",
      lines:  [
        "This is my cousin Shelly.",
        "She is at the park.",
        "She is feeding the birds."
      ],
      question: {
        prompt:  "Shelly is my _____.",
        options: [
          { text: "cousin", correct: true  },
          { text: "sister", correct: false }
        ]
      }
    },
    {
      image:  IMG_BASE   + "u5.dog.barks.jpg",
      audio:  AUDIO_BASE + "u5.dog.bark.mp3",
      lines:  [
        "This is their dog Barky.",
        "He is small but noisy.",
        "Now he is in the yard. He is barking."
      ],
      question: {
        prompt:  "The dog is _____.",
        options: [
          { text: "barking", correct: true  },
          { text: "baking",  correct: false }
        ]
      }
    },
    {
      image:  IMG_BASE   + "u5.bake.cookies.jpg",
      audio:  AUDIO_BASE + "u5.aunt.baking.mp3",
      lines:  [
        "My aunt is in the kitchen now.",
        "She is baking cookies."
      ],
      question: {
        prompt:  "My _____ is baking cookies.",
        options: [
          { text: "mother", correct: false },
          { text: "aunt",   correct: true  }
        ]
      }
    },
    {
      image:  IMG_BASE   + "u5.mowing.grass.jpg",
      audio:  AUDIO_BASE + "u5.uncle.grass.mp3",
      lines:  [
        "My uncle is in the yard.",
        "He is mowing the grass."
      ],
      question: {
        prompt:  "My _____ is mowing the grass.",
        options: [
          { text: "uncle",  correct: true  },
          { text: "father", correct: false }
        ]
      }
    }
  ];

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const imgEl        = document.getElementById("lessonImg");
  const slideTextEl  = document.getElementById("slideText");
  const playBtn      = document.getElementById("playBtn");
  const counterEl    = document.getElementById("counter");
  const barEl        = document.getElementById("progressBar");
  const mainCard     = document.getElementById("mainCard");
  const endScreen    = document.getElementById("endScreen");
  const questionArea = document.getElementById("questionArea");
  const vocabToggle  = document.getElementById("vocabToggle");
  const vocabBody    = document.getElementById("vocabBody");

  let slideIndex   = 0;
  let currentAudio = null;
  let vocabAudio   = null;

  // ── Vocab panel ────────────────────────────────────────────────────────────
  function buildVocab() {
    VOCAB.forEach(v => {
      const item = document.createElement("div");
      item.className = "vocab-item";

      const btn = document.createElement("button");
      btn.className = "vocab-play";
      btn.innerHTML = "▶";
      btn.title = "Escuchar";

      const label = document.createElement("span");
      label.className = "vocab-word";
      label.textContent = v.word;

      const trans = document.createElement("span");
      trans.className = "vocab-es";
      trans.textContent = v.es;

      btn.onclick = () => {
        if (vocabAudio) { vocabAudio.pause(); vocabAudio.src = ""; }
        // Reset all vocab buttons
        document.querySelectorAll(".vocab-play").forEach(b => {
          b.innerHTML = "▶"; b.classList.remove("vplaying");
        });
        vocabAudio = new Audio(v.audio);
        btn.innerHTML = "⏸";
        btn.classList.add("vplaying");
        vocabAudio.play().catch(() => {});
        vocabAudio.onended = () => {
          btn.innerHTML = "▶";
          btn.classList.remove("vplaying");
        };
      };

      item.appendChild(btn);
      item.appendChild(label);
      item.appendChild(trans);
      vocabBody.appendChild(item);
    });
  }

  vocabToggle.onclick = () => {
    const open = vocabBody.classList.toggle("open");
    vocabToggle.querySelector(".toggle-arrow").textContent = open ? "▲" : "▼";
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  function updateCounter() {
    counterEl.textContent = `${slideIndex + 1} / ${SLIDES.length}`;
    barEl.style.width = ((slideIndex + 1) / SLIDES.length * 100) + "%";
  }

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

  // ── Render question ────────────────────────────────────────────────────────
  function renderQuestion(slide) {
    const q = slide.question;
    questionArea.innerHTML = "";
    questionArea.style.display = "block";

    const promptEl = document.createElement("p");
    promptEl.className = "q-prompt";
    promptEl.textContent = q.prompt;
    questionArea.appendChild(promptEl);

    const optRow = document.createElement("div");
    optRow.className = "options-row";

    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "opt-btn";
      btn.textContent = opt.text;

      btn.onclick = () => {
        if (btn.disabled) return;

        if (opt.correct) {
          btn.classList.add("correct");
          optRow.querySelectorAll(".opt-btn").forEach(b => b.disabled = true);
          // Fill blank
          promptEl.textContent = q.prompt.replace("_____", opt.text);
          // Auto-advance after 600 ms
          setTimeout(() => advance(), 600);
        } else {
          btn.classList.add("wrong");
          setTimeout(() => btn.classList.remove("wrong"), 600);
        }
      };

      optRow.appendChild(btn);
    });

    questionArea.appendChild(optRow);
  }

  // ── Advance ────────────────────────────────────────────────────────────────
  function advance() {
    const next = slideIndex + 1;
    if (next >= SLIDES.length) {
      mainCard.style.display = "none";
      endScreen.style.display = "block";
    } else {
      loadSlide(next);
    }
  }

  // ── Load slide ─────────────────────────────────────────────────────────────
  function loadSlide(index) {
    slideIndex = index;
    updateCounter();
    destroyAudio();
    questionArea.innerHTML = "";
    questionArea.style.display = "none";

    const slide = SLIDES[index];

    imgEl.src = slide.image;
    imgEl.alt = slide.lines[0] || "";
    slideTextEl.innerHTML = slide.lines.map(l => `<span>${l}</span>`).join("<br>");

    const audio = new Audio(slide.audio);
    currentAudio = audio;

    setPlayState("idle");
    playBtn.disabled = false;

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
      renderQuestion(slide);
    };
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  buildVocab();
  loadSlide(0);
})();
