(() => {
  const UNIT   = 5;
  const LESSON = 4;
  const PART   = 5;

  const BASE     = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE = BASE + "images/u5/";

  // ── Slides ─────────────────────────────────────────────────────────────────
  // Each slide: image + two sentences with blanks.
  // Flow:
  //   1. Image loads → sentence 1 fades in
  //   2. Correct → locks green → sentence 2 fades in
  //   3. Correct → locks green → 600 ms → next slide
  //   Wrong → shakes red, stays active, blank NOT filled

  const SLIDES = [
    {
      image: IMG_BASE + "u5.vacation.hawaii.jpg",
      sentences: [
        {
          text:    "This is my ______.",
          options: [
            { text: "cousins",  correct: true  },
            { text: "parents",  correct: false }
          ]
        },
        {
          text:    "They are on ______.",
          options: [
            { text: "vacation", correct: true  },
            { text: "school",   correct: false }
          ]
        }
      ]
    },
    {
      image: IMG_BASE + "u5.hotel.jpg",
      sentences: [
        {
          text:    "Their hotel is ______.",
          options: [
            { text: "old", correct: true  },
            { text: "new", correct: false }
          ]
        },
        {
          text:    "Their hotel room is ______.",
          options: [
            { text: "small", correct: true  },
            { text: "big",   correct: false }
          ]
        }
      ]
    },
    {
      image: IMG_BASE + "u5.tommy.surf.jpg",
      sentences: [
        {
          text:    "This is my ______ Tommy.",
          options: [
            { text: "cousin",  correct: true  },
            { text: "brother", correct: false }
          ]
        },
        {
          text:    "He is ______ with his surfboard.",
          options: [
            { text: "swimming", correct: true  },
            { text: "riding",   correct: false }
          ]
        }
      ]
    },
    {
      image: IMG_BASE + "u5.shelly.sand.jpg",
      sentences: [
        {
          text:    "This is my ______ Shelly.",
          options: [
            { text: "cousin", correct: true  },
            { text: "sister", correct: false }
          ]
        },
        {
          text:    "She is ______ a sandcastle.",
          options: [
            { text: "building", correct: true  },
            { text: "reading",  correct: false }
          ]
        }
      ]
    },
    {
      image: IMG_BASE + "u5.dog.sand.jpg",
      sentences: [
        {
          text:    "This is our ______.",
          options: [
            { text: "dog", correct: true  },
            { text: "cat", correct: false }
          ]
        },
        {
          text:    "He is ______ on the sand.",
          options: [
            { text: "running",  correct: true  },
            { text: "sleeping", correct: false }
          ]
        }
      ]
    },
    {
      image: IMG_BASE + "u5.aunt.uncle.beach.jpg",
      sentences: [
        {
          text:    "My aunt is ______ a book.",
          options: [
            { text: "reading", correct: true  },
            { text: "cooking", correct: false }
          ]
        },
        {
          text:    "My uncle is drinking a ______.",
          options: [
            { text: "cocktail",  correct: true  },
            { text: "sandwich",  correct: false }
          ]
        }
      ]
    }
  ];

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

  // ── Show one sentence, resolves on correct answer ──────────────────────────
  function showSentence(s) {
    return new Promise(resolve => {
      questionArea.innerHTML = "";

      const block = document.createElement("div");
      block.className = "q-block";

      const sentEl = document.createElement("p");
      sentEl.className = "q-sentence";
      sentEl.textContent = s.text;

      const optRow = document.createElement("div");
      optRow.className = "options-row";

      s.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "opt-btn";
        btn.textContent = opt.text;

        btn.onclick = () => {
          if (btn.disabled) return;
          if (opt.correct) {
            btn.classList.add("correct");
            optRow.querySelectorAll(".opt-btn").forEach(b => b.disabled = true);
            sentEl.textContent = s.text.replace("______", opt.text);
            resolve();
          } else {
            btn.classList.add("wrong");
            setTimeout(() => btn.classList.remove("wrong"), 600);
          }
        };

        optRow.appendChild(btn);
      });

      block.appendChild(sentEl);
      block.appendChild(optRow);
      questionArea.appendChild(block);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => block.classList.add("visible"));
      });
    });
  }

  // ── Run all sentences for a slide ─────────────────────────────────────────
  async function runSlide(slide) {
    for (const s of slide.sentences) {
      await showSentence(s);
      // Small pause between sentence 1 and 2 so the green lock is visible
      await delay(400);
    }
  }

  // ── Load slide ─────────────────────────────────────────────────────────────
  async function loadSlide(index) {
    slideIndex = index;
    updateCounter();
    questionArea.innerHTML = "";

    const slide = SLIDES[index];
    imgEl.src = slide.image;
    imgEl.alt = slide.sentences[0].text;

    await delay(150);
    await runSlide(slide);

    // After last sentence answered → 600 ms → advance
    await delay(600);

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
