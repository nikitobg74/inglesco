(() => {
  const UNIT   = 5;
  const LESSON = 4;
  const PART   = 3;

  const BASE       = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE   = BASE + "images/u5/";
  const AUDIO_BASE = BASE + "audio/u5/";

  // ── Vocabulary bank ────────────────────────────────────────────────────────
  const VOCAB = [
    { word: "ocean",      es: "océano",       audio: AUDIO_BASE + "u5.ocean.mp3"      },
    { word: "weather",    es: "clima",         audio: AUDIO_BASE + "u5.weather.mp3"    },
    { word: "sunny",      es: "soleado",       audio: AUDIO_BASE + "u5.sunny.mp3"      },
    { word: "sandcastle", es: "castillo de arena", audio: AUDIO_BASE + "u5.sandcastle.mp3" },
    { word: "sand",       es: "arena",         audio: AUDIO_BASE + "u5.sand.mp3"       },
    { word: "summer",     es: "verano",        audio: AUDIO_BASE + "u5.summer.mp3"     },
    { word: "look",       es: "mira",          audio: AUDIO_BASE + "u5.look.mp3"       }
  ];

  // ── Slides ─────────────────────────────────────────────────────────────────
  // Flow per slide:
  //   1. Image + text load → student taps ▶ to play audio
  //   2. Audio ends → questions appear one at a time
  //   3. Each correct answer: green → 1000 ms → hide that question → show next
  //   4. Wrong answer: shakes red, stays active
  //   5. After last question answered: 1000 ms → next slide

  const SLIDES = [
    {
      image: IMG_BASE   + "u5.vacation.hawaii.jpg",
      audio: AUDIO_BASE + "u5.vacation.hawaii.mp3",
      lines: [
        "My cousins are on vacation.",
        "This summer, my aunt and uncle are on vacation in Hawaii.",
        "The weather is sunny, and the ocean is blue."
      ],
      questions: [
        { statement: "The ocean is sunny.",   answer: false },
        { statement: "The weather is sunny.", answer: true  }
      ]
    },
    {
      image: IMG_BASE   + "u5.hotel.jpg",
      audio: AUDIO_BASE + "u5.hotel.mp3",
      lines: [
        "Look at the photo.",
        "Their hotel is old and not very expensive.",
        "Their hotel room is small and cheap."
      ],
      questions: [
        { statement: "The hotel is expensive.",   answer: false },
        { statement: "The hotel room is small.",  answer: true  }
      ]
    },
    {
      image: IMG_BASE   + "u5.tommy.surf.jpg",
      audio: AUDIO_BASE + "u5.tommy.surfing.mp3",
      lines: [
        "Look at cousin Tommy.",
        "He is at the beach.",
        "He is swimming with his surfboard."
      ],
      questions: [
        { statement: "Tommy is at the beach.",        answer: true  },
        { statement: "Tommy is riding a bicycle.",    answer: false },
        { statement: "Tommy is swimming.",            answer: true  }
      ]
    },
    {
      image: IMG_BASE   + "u5.shelly.sand.jpg",
      audio: AUDIO_BASE + "u5.shelly.mp3",
      lines: [
        "Look at cousin Shelly.",
        "She is at the beach too.",
        "She is building a sandcastle."
      ],
      questions: [
        { statement: "Shelly is at the beach.",          answer: true  },
        { statement: "Shelly is reading a book.",        answer: false },
        { statement: "Shelly is building a sandcastle.", answer: true  }
      ]
    },
    {
      image: IMG_BASE   + "u5.dog.sand.jpg",
      audio: AUDIO_BASE + "u5.dog.running.mp3",
      lines: [
        "Their dog Barky is on vacation too.",
        "He is running on the sand."
      ],
      questions: [
        { statement: "The dog is on the sand.", answer: true  },
        { statement: "The dog is sleeping.",    answer: false },
        { statement: "The dog is running.",     answer: true  }
      ]
    },
    {
      image: IMG_BASE   + "u5.aunt.uncle.beach.jpg",
      audio: AUDIO_BASE + "u5.uncle.aunt.hawaii.mp3",
      lines: [
        "My aunt is sitting and reading a book.",
        "My uncle is drinking a cocktail."
      ],
      questions: [
        { statement: "My aunt is reading a book.",       answer: true  },
        { statement: "My uncle is eating.",              answer: false },
        { statement: "My uncle is drinking a cocktail.", answer: true  }
      ]
    }
  ];

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const imgEl         = document.getElementById("lessonImg");
  const slideTextEl   = document.getElementById("slideText");
  const playBtn       = document.getElementById("playBtn");
  const counterEl     = document.getElementById("counter");
  const barEl         = document.getElementById("progressBar");
  const mainCard      = document.getElementById("mainCard");
  const endScreen     = document.getElementById("endScreen");
  const questionsArea = document.getElementById("questionsArea");
  const vocabToggle   = document.getElementById("vocabToggle");
  const vocabBody     = document.getElementById("vocabBody");

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

      const word = document.createElement("span");
      word.className = "vocab-word";
      word.textContent = v.word;

      const es = document.createElement("span");
      es.className = "vocab-es";
      es.textContent = v.es;

      btn.onclick = () => {
        if (vocabAudio) { vocabAudio.pause(); vocabAudio.src = ""; }
        document.querySelectorAll(".vocab-play").forEach(b => {
          b.innerHTML = "▶"; b.classList.remove("vplaying");
        });
        vocabAudio = new Audio(v.audio);
        btn.innerHTML = "⏸";
        btn.classList.add("vplaying");
        vocabAudio.play().catch(() => {});
        vocabAudio.onended = () => { btn.innerHTML = "▶"; btn.classList.remove("vplaying"); };
      };

      item.appendChild(btn);
      item.appendChild(word);
      item.appendChild(es);
      vocabBody.appendChild(item);
    });
  }

  vocabToggle.onclick = () => {
    const open = vocabBody.classList.toggle("open");
    vocabToggle.querySelector(".toggle-arrow").textContent = open ? "▲" : "▼";
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

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
    if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
  }

  // ── Run questions one at a time ────────────────────────────────────────────
  async function runQuestions(questions) {
    questionsArea.innerHTML = "";
    questionsArea.style.display = "block";

    for (const q of questions) {
      await showOneQuestion(q);
      await delay(1000);
      // Hide the answered block before showing next
      const blocks = questionsArea.querySelectorAll(".tf-block");
      blocks.forEach(b => { b.style.opacity = "0"; b.style.transform = "translateY(-6px)"; });
      await delay(300);
      questionsArea.innerHTML = "";
    }
  }

  function showOneQuestion(q) {
    return new Promise(resolve => {
      const block = document.createElement("div");
      block.className = "tf-block";

      const stmt = document.createElement("p");
      stmt.className = "tf-statement";
      stmt.textContent = q.statement;

      const row = document.createElement("div");
      row.className = "tf-row";

      ["True", "False"].forEach(label => {
        const isTrue = label === "True";
        const btn = document.createElement("button");
        btn.className = "tf-btn";
        btn.textContent = label;

        btn.onclick = () => {
          if (btn.disabled) return;
          const correct = (isTrue === q.answer);
          if (correct) {
            btn.classList.add("correct");
            row.querySelectorAll(".tf-btn").forEach(b => b.disabled = true);
            resolve();
          } else {
            btn.classList.add("wrong");
            setTimeout(() => btn.classList.remove("wrong"), 600);
          }
        };

        row.appendChild(btn);
      });

      block.appendChild(stmt);
      block.appendChild(row);
      questionsArea.appendChild(block);

      // Trigger fade-in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => block.classList.add("visible"));
      });
    });
  }

  // ── Load slide ─────────────────────────────────────────────────────────────
  function loadSlide(index) {
    slideIndex = index;
    updateCounter();
    destroyAudio();
    questionsArea.innerHTML = "";
    questionsArea.style.display = "none";

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

    audio.onended = async () => {
      setPlayState("done");
      await delay(400);
      await runQuestions(slide.questions);
      await delay(1500);
      const next = index + 1;
      if (next >= SLIDES.length) {
        mainCard.style.display = "none";
        endScreen.style.display = "block";
      } else {
        loadSlide(next);
      }
    };
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  buildVocab();
  loadSlide(0);
})();
