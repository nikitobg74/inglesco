(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  const EXERCISES = [
    {
      image:      BASE + "images/u5/u5.l1.p1.wife.jpg",
      audio1:     BASE + "audio/u5/u5.l1.p1.wife.pyramid.mp3",
      audio2:     BASE + "audio/u5/u5.l1.p1.wife.mp3",
      lines: [
        { text: "Who is she?",                              t: 0.0  },
        { text: "She is my wife.",                          t: 1.2  },
        { text: "Where is she?",                            t: 3.0  },
        { text: "She is in Egypt.",                         t: 4.2  },
        { text: "What is she doing?",                       t: 6.0  },
        { text: "She is standing in front of the pyramid.", t: 7.4  }
      ],
      question:   "Who is she?",
      partial:    ["She is my", "_____", "."],
      correct:    "wife",
      options:    ["wife", "sister", "mother"]
    },
    {
      image:      BASE + "images/u5/u5.l1.p1.husband.statue.liberty.jpg",
      audio1:     BASE + "audio/u5/u5.l1.p1.husband.new.york.mp3",
      audio2:     BASE + "audio/u5/u5.l1.p1.husband.mp3",
      lines: [
        { text: "Who is he?",                                          t: 0.0  },
        { text: "He is my husband.",                                   t: 1.2  },
        { text: "Where is he?",                                        t: 3.0  },
        { text: "He is in New York.",                                  t: 4.2  },
        { text: "What is he doing?",                                   t: 6.0  },
        { text: "He is standing in front of the Statue of Liberty.",   t: 7.4  }
      ],
      question:   "Who is he?",
      partial:    ["He is my", "_____", "."],
      correct:    "husband",
      options:    ["husband", "father", "brother"]
    },
    {
      image:      BASE + "images/u5/u5.l1.p1.boy.swimming.jpg",
      audio1:     BASE + "audio/u5/u5.l1.p1.son.swimming.mp3",
      audio2:     BASE + "audio/u5/u5.l1.p1.son.mp3",
      lines: [
        { text: "Who is he?",          t: 0.0 },
        { text: "He is my son.",        t: 1.2 },
        { text: "Where is he?",         t: 3.0 },
        { text: "He is at the beach.",  t: 4.2 },
        { text: "What is he doing?",    t: 6.0 },
        { text: "He is swimming.",      t: 7.4 }
      ],
      question:   "Who is he?",
      partial:    ["He is my", "_____", "."],
      correct:    "son",
      options:    ["son", "sister", "brother"]
    },
    {
      image:      BASE + "images/u5/u5.l1.p1.daughter.riding.jpg",
      audio1:     BASE + "audio/u5/u5.l1.p1.daughter.riding.mp3",
      audio2:     BASE + "audio/u5/u5.l1.p1.daughter.mp3",
      lines: [
        { text: "Who is she?",                   t: 0.0 },
        { text: "She is my daughter.",            t: 1.2 },
        { text: "Where is she?",                  t: 3.0 },
        { text: "She is in the park.",            t: 4.2 },
        { text: "What is she doing?",             t: 6.0 },
        { text: "She is riding her bicycle.",     t: 7.4 }
      ],
      question:   "Who is she?",
      partial:    ["She is my", "_____", "."],
      correct:    "daughter",
      options:    ["daughter", "sister", "mother"]
    }
  ];

  let exIndex = 0;
  let audio1 = null;
  let audio2 = null;
  let rafId   = null;
  let answered = false;

  const imgEl       = document.getElementById("lessonImg");
  const audioBtn    = document.getElementById("audioBtn");
  const karaokeBox  = document.getElementById("karaokeBox");
  const questionArea= document.getElementById("questionArea");
  const questionLabel= document.getElementById("questionLabel");
  const answerRow   = document.getElementById("answerRow");
  const tilesEl     = document.getElementById("tiles");
  const counter     = document.getElementById("counter");
  const bar         = document.getElementById("progressBar");
  const endScreen   = document.getElementById("endScreen");

  // ── Vocab toggle ──────────────────────────────────────────
  window.toggleVocab = function() {
    const body   = document.getElementById("vocabBody");
    const toggle = document.getElementById("vocabToggle");
    const isOpen = !body.classList.contains("hidden");
    body.classList.toggle("hidden", isOpen);
    toggle.classList.toggle("open", !isOpen);
  };

  // ── Load exercise ─────────────────────────────────────────
  function loadExercise() {
    answered = false;
    const ex = EXERCISES[exIndex];

    counter.textContent = `${exIndex + 1} / ${EXERCISES.length}`;
    bar.style.width = ((exIndex + 1) / EXERCISES.length * 100) + "%";

    imgEl.src = ex.image;
    imgEl.alt = ex.lines[0].text;

    // Reset audio button
    audioBtn.className = "audio-btn";
    audioBtn.textContent = "▶";
    audioBtn.disabled = false;

    // Build karaoke spans
    karaokeBox.innerHTML = ex.lines
      .map((l, i) => `<span data-i="${i}">${l.text}</span>`)
      .join("<br>");

    // Hide question
    questionArea.classList.remove("show");
    tilesEl.innerHTML = "";
    answerRow.innerHTML = "";

    // Stop any running audio
    stopAll();
  }

  // ── Play first audio (karaoke) ────────────────────────────
  window.playFirstAudio = function() {
    if (audioBtn.disabled) return;
    audioBtn.disabled = true;
    audioBtn.className = "audio-btn playing";
    audioBtn.textContent = "🔊";

    const ex = EXERCISES[exIndex];
    audio1 = new Audio(ex.audio1);
    audio1.play().catch(() => {});

    const spans = karaokeBox.querySelectorAll("span");

    function tick() {
      const t = audio1.currentTime;
      spans.forEach((sp, i) => {
        const lineT  = ex.lines[i].t;
        const nextT  = ex.lines[i + 1] ? ex.lines[i + 1].t : Infinity;
        sp.classList.toggle("highlight", t >= lineT && t < nextT);
      });
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    audio1.addEventListener("ended", () => {
      cancelAnimationFrame(rafId);
      spans.forEach(sp => sp.classList.remove("highlight"));
      audioBtn.className = "audio-btn done";
      audioBtn.textContent = "✓";
      showQuestion();
    });
  };

  // ── Show fill-in question ─────────────────────────────────
  function showQuestion() {
    const ex = EXERCISES[exIndex];
    questionLabel.textContent = ex.question;

    // Build answer row: "She is my _____ ."
    answerRow.innerHTML = "";
    ex.partial.forEach(part => {
      if (part === "_____") {
        const blank = document.createElement("span");
        blank.className = "blank-word";
        blank.id = "blankWord";
        blank.textContent = "_____";
        answerRow.appendChild(blank);
      } else {
        const txt = document.createElement("span");
        txt.textContent = part;
        answerRow.appendChild(txt);
      }
    });

    // Shuffle options
    const opts = [...ex.options];
    shuffle(opts);
    tilesEl.innerHTML = "";
    opts.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.textContent = word;
      btn.onclick = () => selectAnswer(btn, word);
      tilesEl.appendChild(btn);
    });

    questionArea.classList.add("show");
  }

  // ── Select answer tile ────────────────────────────────────
  function selectAnswer(btn, word) {
    if (answered) return;
    const ex = EXERCISES[exIndex];
    const blank = document.getElementById("blankWord");

    if (word === ex.correct) {
      answered = true;
      blank.textContent = word;
      blank.classList.add("correct");
      btn.classList.add("correct", "used");
      // Disable all tiles
      tilesEl.querySelectorAll(".tile").forEach(t => t.classList.add("used"));
      // Play second audio after short pause
      setTimeout(playSecondAudio, 600);
    } else {
      btn.classList.add("error");
      setTimeout(() => btn.classList.remove("error"), 400);
    }
  }

  // ── Play second audio then advance ───────────────────────
  function playSecondAudio() {
    const ex = EXERCISES[exIndex];
    audio2 = new Audio(ex.audio2);
    audio2.play().catch(() => {});
    audio2.addEventListener("ended", () => {
      setTimeout(advance, 2000);
    });
  }

  // ── Advance to next exercise or end screen ────────────────
  function advance() {
    exIndex++;
    if (exIndex >= EXERCISES.length) {
      document.querySelector(".card").style.display = "none";
      endScreen.style.display = "block";
      return;
    }
    loadExercise();
  }

  // ── Helpers ───────────────────────────────────────────────
  function stopAll() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (audio1) { audio1.pause(); audio1 = null; }
    if (audio2) { audio2.pause(); audio2 = null; }
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  // ── Init ──────────────────────────────────────────────────
  loadExercise();
})();
