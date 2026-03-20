(() => {
  const UNIT   = 5;
  const LESSON = 4;
  const PART   = 2;

  const BASE       = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE   = BASE + "images/u5/";
  const AUDIO_BASE = BASE + "audio/u5/";

  // ── Slides ─────────────────────────────────────────────────────────────────
  // Flow per slide:
  //   1. Image loads → Q1 fades in
  //   2. Q1 answered correctly → Q2 fades in
  //   3. Q2 answered correctly → 600 ms → audio plays (dots indicator shown)
  //   4. Audio ends → 1500 ms → next slide (or end screen)

  const SLIDES = [
    {
      image: IMG_BASE   + "u5.boy.riding.jpg",
      audio: AUDIO_BASE + "u5.riding.bike.2.mp3",
      q1: {
        question: "Where is your cousin Tommy?",
        sentence: "He is at the _____.",
        options: [
          { text: "park",      correct: true  },
          { text: "school", correct: false }
        ]
      },
      q2: {
        question: "What is he doing?",
        sentence: "He is _____ his bicycle.",
        options: [
          { text: "reading", correct: false },
          { text: "riding",  correct: true  }
        ]
      }
    },
    {
      image: IMG_BASE   + "u5.feed.birds.jpg",
      audio: AUDIO_BASE + "u5.feed.birds2.mp3",
      q1: {
        question: "Where is your cousin Shelly?",
        sentence: "She is at the _____.",
        options: [
          { text: "park",   correct: true  },
          { text: "zoo", correct: false }
        ]
      },
      q2: {
        question: "What is she doing?",
        sentence: "She is _____ the birds.",
        options: [
          { text: "reading", correct: false },
          { text: "feeding", correct: true  }
        ]
      }
    },
    {
      image: IMG_BASE   + "u5.bake.cookies.jpg",
      audio: AUDIO_BASE + "u5.bake.cookies.2.mp3",
      q1: {
        question: "Where is your aunt Carla?",
        sentence: "She is in the _____.",
        options: [
          { text: "bedroom", correct: false },
          { text: "kitchen", correct: true  }
        ]
      },
      q2: {
        question: "What is she doing?",
        sentence: "She is _____ cookies.",
        options: [
          { text: "baking",  correct: true  },
          { text: "cooking", correct: false }
        ]
      }
    },
    {
      image: IMG_BASE   + "u5.mowing.grass.jpg",
      audio: AUDIO_BASE + "u5.mowing.grass.2.mp3",
      q1: {
        question: "Where is your uncle Greg?",
        sentence: "He is in the _____.",
        options: [
          { text: "park", correct: false },
          { text: "yard", correct: true  }
        ]
      },
      q2: {
        question: "What is he doing?",
        sentence: "He is _____ the grass.",
        options: [
          { text: "mowing", correct: true  },
          { text: "fixing", correct: false }
        ]
      }
    }
  ];

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const imgEl         = document.getElementById("lessonImg");
  const counterEl     = document.getElementById("counter");
  const barEl         = document.getElementById("progressBar");
  const mainCard      = document.getElementById("mainCard");
  const endScreen     = document.getElementById("endScreen");
  const q1Block        = document.getElementById("q1Block");
  const q2Block        = document.getElementById("q2Block");
  const q1LabelEl      = document.getElementById("q1Label");
  const q1SentenceEl   = document.getElementById("q1Sentence");
  const q2LabelEl      = document.getElementById("q2Label");
  const q2SentenceEl   = document.getElementById("q2Sentence");
  const q1OptionsEl    = document.getElementById("q1Options");
  const q2OptionsEl    = document.getElementById("q2Options");
  const audioIndicator = document.getElementById("audioIndicator");

  let slideIndex   = 0;
  let currentAudio = null;

  // ── Counter / bar ──────────────────────────────────────────────────────────
  function updateCounter() {
    counterEl.textContent = `${slideIndex + 1} / ${SLIDES.length}`;
    barEl.style.width = ((slideIndex + 1) / SLIDES.length * 100) + "%";
  }

  // ── Build one question into a container ────────────────────────────────────
  // Returns a Promise that resolves when the student picks the correct answer.
  function buildQuestion(labelEl, sentenceEl, optionsEl, q) {
    labelEl.textContent    = q.question;
    sentenceEl.textContent = q.sentence;
    optionsEl.innerHTML    = "";

    return new Promise(resolve => {
      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "opt-btn";
        btn.textContent = opt.text;

        btn.onclick = () => {
          if (btn.disabled) return;
          if (opt.correct) {
            btn.classList.add("correct");
            optionsEl.querySelectorAll(".opt-btn").forEach(b => b.disabled = true);
            // Fill blank in sentence
            sentenceEl.textContent = q.sentence.replace("_____", opt.text);
            resolve();
          } else {
            btn.classList.add("wrong");
            setTimeout(() => btn.classList.remove("wrong"), 600);
          }
        };

        optionsEl.appendChild(btn);
      });
    });
  }

  // ── Play slide audio with indicator ───────────────────────────────────────
  function playSlideAudio(src) {
    return new Promise(resolve => {
      audioIndicator.classList.add("visible");
      if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; }
      const audio = new Audio(src);
      currentAudio = audio;
      audio.play().catch(() => {});
      audio.onended = () => {
        audioIndicator.classList.remove("visible");
        resolve();
      };
      // Safety fallback if audio fails to load
      audio.onerror = () => {
        audioIndicator.classList.remove("visible");
        resolve();
      };
    });
  }

  // ── Load slide ─────────────────────────────────────────────────────────────
  async function loadSlide(index) {
    slideIndex = index;
    updateCounter();

    // Reset blocks
    q1Block.classList.remove("visible");
    q2Block.classList.remove("visible");
    audioIndicator.classList.remove("visible");
    q1OptionsEl.innerHTML = "";
    q2OptionsEl.innerHTML = "";

    const slide = SLIDES[index];
    imgEl.src = slide.image;
    imgEl.alt = slide.q1.prompt;

    // Small delay so image starts loading before questions appear
    await delay(200);

    // Q1
    q1Block.classList.add("visible");
    await buildQuestion(q1LabelEl, q1SentenceEl, q1OptionsEl, slide.q1);

    // Q2 fades in after Q1 correct
    await delay(200);
    q2Block.classList.add("visible");
    await buildQuestion(q2LabelEl, q2SentenceEl, q2OptionsEl, slide.q2);

    // Both answered → 600 ms → play audio
    await delay(600);
    await playSlideAudio(slide.audio);

    // Audio done → 1500 ms → advance
    await delay(1500);

    const next = index + 1;
    if (next >= SLIDES.length) {
      mainCard.style.display = "none";
      endScreen.style.display = "block";
    } else {
      loadSlide(next);
    }
  }

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  loadSlide(0);
})();
