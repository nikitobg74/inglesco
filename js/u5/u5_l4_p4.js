(() => {
  const UNIT   = 5;
  const LESSON = 4;
  const PART   = 4;

  const BASE       = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE   = BASE + "images/u5/";

  // ── Slides ─────────────────────────────────────────────────────────────────
  // Each slide has an image and one or more questions.
  // Flow:
  //   - Image loads, first question fades in immediately
  //   - Correct answer → locks green → 1000 ms → next question fades in
  //   - After last question on slide → 1000 ms → next slide
  //   - Wrong answer → shakes red, stays active

  const SLIDES = [
    {
      image: IMG_BASE + "u5.vacation.hawaii.jpg",
      questions: [
        {
          question: "Who is on vacation?",
          sentence: "My ______",
          options: [
            { text: "parents", correct: false },
            { text: "cousins", correct: true  }
          ]
        },
        {
          question: "Where are they?",
          sentence: "They are in ______",
          options: [
            { text: "Hawaii", correct: true  },
            { text: "Canada", correct: false }
          ]
        }
      ]
    },
    {
      image: IMG_BASE + "u5.hotel.jpg",
      questions: [
        {
          question: "Is the hotel expensive?",
          sentence: "It is ______",
          options: [
            { text: "expensive", correct: false },
            { text: "cheap",     correct: true  }
          ]
        },
        {
          question: "How is the hotel room?",
          sentence: "The hotel room is ______",
          options: [
            { text: "big",   correct: false },
            { text: "small", correct: true  }
          ]
        }
      ]
    },
    {
      image: IMG_BASE + "u5.tommy.surf.jpg",
      questions: [
        {
          question: "Who is at the beach?",
          sentence: "My ______ Tommy",
          options: [
            { text: "cousin",  correct: true  },
            { text: "brother", correct: false }
          ]
        },
        {
          question: "What is he doing?",
          sentence: "He is ______",
          options: [
            { text: "riding",    correct: false },
            { text: "swimming",  correct: true  }
          ]
        },
        {
          question: "What is he swimming with?",
          sentence: "He is swimming with a ______",
          options: [
            { text: "bicycle",   correct: false },
            { text: "surfboard", correct: true  }
          ]
        }
      ]
    },
    {
      image: IMG_BASE + "u5.shelly.sand.jpg",
      questions: [
        {
          question: "Who is at the beach too?",
          sentence: "My ______ Shelly",
          options: [
            { text: "cousin", correct: true  },
            { text: "sister", correct: false }
          ]
        },
        {
          question: "What is she doing?",
          sentence: "She is ______ a sandcastle",
          options: [
            { text: "building", correct: true  },
            { text: "eating",   correct: false }
          ]
        }
      ]
    },
    {
      image: IMG_BASE + "u5.dog.sand.jpg",
      questions: [
        {
          question: "Where is the dog?",
          sentence: "He is on the ______",
          options: [
            { text: "sand",  correct: true  },
            { text: "grass", correct: false }
          ]
        },
        {
          question: "What is he doing?",
          sentence: "He is ______",
          options: [
            { text: "sleeping", correct: false },
            { text: "running",  correct: true  }
          ]
        }
      ]
    },
    {
      image: IMG_BASE + "u5.aunt.uncle.beach.jpg",
      questions: [
        {
          question: "Who is reading a book?",
          sentence: "My ______",
          options: [
            { text: "aunt",  correct: true  },
            { text: "uncle", correct: false }
          ]
        },
        {
          question: "Who is drinking a cocktail?",
          sentence: "My ______",
          options: [
            { text: "aunt",  correct: false },
            { text: "uncle", correct: true  }
          ]
        }
      ]
    }
  ];

  // ── Shuffle (Fisher-Yates) ─────────────────────────────────────────────────
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Shuffle slide order at load
  shuffle(SLIDES);

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const imgEl        = document.getElementById("lessonImg");
  const counterEl    = document.getElementById("counter");
  const barEl        = document.getElementById("progressBar");
  const mainCard     = document.getElementById("mainCard");
  const endScreen    = document.getElementById("endScreen");
  const questionArea = document.getElementById("questionArea");

  let slideIndex = 0;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function updateCounter() {
    counterEl.textContent = `${slideIndex + 1} / ${SLIDES.length}`;
    barEl.style.width = ((slideIndex + 1) / SLIDES.length * 100) + "%";
  }

  // ── Show one question, resolves on correct answer ──────────────────────────
  function showQuestion(q) {
    return new Promise(resolve => {
      questionArea.innerHTML = "";

      const block = document.createElement("div");
      block.className = "q-block";

      const labelEl = document.createElement("p");
      labelEl.className = "q-label";
      labelEl.textContent = q.question;

      const sentenceEl = document.createElement("p");
      sentenceEl.className = "q-sentence";
      sentenceEl.textContent = q.sentence;

      const optRow = document.createElement("div");
      optRow.className = "options-row";

      // Shuffle a copy of the options so the originals stay intact
      const shuffledOptions = shuffle([...q.options]);

      shuffledOptions.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "opt-btn";
        btn.textContent = opt.text;

        btn.onclick = () => {
          if (btn.disabled) return;
          if (opt.correct) {
            btn.classList.add("correct");
            optRow.querySelectorAll(".opt-btn").forEach(b => b.disabled = true);
            sentenceEl.textContent = q.sentence.replace("______", opt.text);
            resolve();
          } else {
            btn.classList.add("wrong");
            setTimeout(() => btn.classList.remove("wrong"), 600);
          }
        };

        optRow.appendChild(btn);
      });

      block.appendChild(labelEl);
      block.appendChild(sentenceEl);
      block.appendChild(optRow);
      questionArea.appendChild(block);

      // Fade in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => block.classList.add("visible"));
      });
    });
  }

  // ── Run all questions for a slide ──────────────────────────────────────────
  async function runSlide(slide) {
    for (const q of slide.questions) {
      await showQuestion(q);
      await delay(1000);
    }
  }

  // ── Load slide ─────────────────────────────────────────────────────────────
  async function loadSlide(index) {
    slideIndex = index;
    updateCounter();
    questionArea.innerHTML = "";

    const slide = SLIDES[index];
    imgEl.src = slide.image;
    imgEl.alt = slide.questions[0].question;

    // Short pause to let image start loading
    await delay(200);

    await runSlide(slide);

    // After last question answered, advance
    const next = index + 1;
    if (next >= SLIDES.length) {
      mainCard.style.display = "none";
      endScreen.style.display = "block";
    } else {
      loadSlide(next);
    }
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  loadSlide(0);
})();
