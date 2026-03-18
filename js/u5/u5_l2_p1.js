(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  // ── Vocabulary words with audio ───────────────────────────
  const VOCAB = [
    { en: "mother",       es: "madre",      audio: "u5.mother.mp3"       },
    { en: "father",       es: "padre",      audio: "u5.father.mp3"       },
    { en: "grandmother",  es: "abuela",     audio: "u5.grandmother1.mp3" },
    { en: "grandfather",  es: "abuelo",     audio: "u5.grandfather1.mp3" },
    { en: "parents",      es: "padres",     audio: "u5.parents.mp3"      },
    { en: "grandparents", es: "abuelos",    audio: "u5.grandparents.mp3" }
  ];

  // ── Exercises ─────────────────────────────────────────────
  const EXERCISES = [
    {
      image:   BASE + "images/u5/u5.she.cooking.dinner.jpg",
      audio1:  BASE + "audio/u5/u5.mother.cooking.mp3",
      lines: [
        { text: "Who is she?",             t: 0.0 },
        { text: "She is my mother.",       t: 1.3 },
        { text: "Where is she?",           t: 3.0 },
        { text: "She is in the kitchen.",  t: 4.2 },
        { text: "What is she doing?",      t: 6.0 },
        { text: "She is cooking dinner.",  t: 7.3 }
      ],
      audio2:   BASE + "audio/u5/u5.my.mother.mp3",
      question: "Who is she?",
      partial:  ["She is my", "_____", "."],
      correct:  "mother",
      options:  ["wife", "sister", "mother"]
    },
    {
      image:   BASE + "images/u5/u5.l1.p1.man.painting.jpg",
      audio1:  BASE + "audio/u5/u5.father.painting.mp3",
      lines: [
        { text: "Who is he?",                      t: 0.0 },
        { text: "He is my father.",                t: 1.3 },
        { text: "Where is he?",                    t: 3.0 },
        { text: "He is at home.",                  t: 4.2 },
        { text: "What is he doing?",               t: 6.0 },
        { text: "He is painting the living room.", t: 7.3 }
      ],
      audio2:   BASE + "audio/u5/u5.my.father.mp3",
      question: "Who is he?",
      partial:  ["He is my", "_____", "."],
      correct:  "father",
      options:  ["husband", "father", "brother"]
    },
    {
      image:   BASE + "images/u5/u5.grandmother.planting.jpg",
      audio1:  BASE + "audio/u5/u5.grandmother.flowers.mp3",
      lines: [
        { text: "Who is she?",                t: 0.0 },
        { text: "She is my grandmother.",     t: 1.3 },
        { text: "Where is she?",              t: 3.0 },
        { text: "She is in the garden.",      t: 4.2 },
        { text: "What is she doing?",         t: 6.0 },
        { text: "She is planting flowers.",   t: 7.3 }
      ],
      audio2:   BASE + "audio/u5/u5.my.grandmother.mp3",
      question: "Who is she?",
      partial:  ["She is my", "_____", "."],
      correct:  "grandmother",
      options:  ["grandmother", "sister", "mother"]
    },
    {
      image:   BASE + "images/u5/u5.grandfather.jpg",
      audio1:  BASE + "audio/u5/u5.grandfather.fixing.mp3",
      lines: [
        { text: "Who is he?",                  t: 0.0 },
        { text: "He is my grandfather.",       t: 1.3 },
        { text: "Where is he?",                t: 3.0 },
        { text: "He is in the bathroom.",      t: 4.2 },
        { text: "What is he doing?",           t: 6.0 },
        { text: "He is fixing the shower.",    t: 8 }
      ],
      audio2:   BASE + "audio/u5/u5.my.grandfather.mp3",
      question: "Who is he?",
      partial:  ["He is my", "_____", "."],
      correct:  "grandfather",
      options:  ["husband", "grandfather", "brother"]
    },
    {
      image:   BASE + "images/u5/u5.grandparents.jpg",
      audio1:  BASE + "audio/u5/u5.grandparents.eiffel.mp3",
      lines: [
        { text: "Who are they?",                                      t: 0.0 },
        { text: "They are my grandparents.",                          t: 1.3 },
        { text: "Where are they?",                                    t: 3.2 },
        { text: "They are in Paris.",                                 t: 5.4 },
        { text: "What are they doing?",                               t: 7.1 },
        { text: "They are standing in front of the Eiffel Tower.",   t: 9.1 }
      ],
      audio2:   BASE + "audio/u5/u5.grandparents1.mp3",
      question: "Who are they?",
      partial:  ["They are my", "_____", "."],
      correct:  "grandparents",
      options:  ["grandparents", "parents", "family"]
    },
    {
      image:   BASE + "images/u5/u5.man.woman.beach.surfing.jpg",
      audio1:  BASE + "audio/u5/u5.parents.surfing.mp3",
      lines: [
        { text: "Who are they?",          t: 0.0 },
        { text: "They are my parents.",   t: 1.5 },
        { text: "Where are they?",        t: 3.2 },
        { text: "They are at the beach.", t: 5.5 },
        { text: "What are they doing?",   t: 7.5 },
        { text: "They are surfing.",      t: 9.3 }
      ],
      audio2:   BASE + "audio/u5/u5.my.parents.mp3",
      question: "Who are they?",
      partial:  ["They are my", "_____", "."],
      correct:  "parents",
      options:  ["grandparents", "parents", "brothers"]
    }
  ];

  let exIndex  = 0;
  let audio1   = null;
  let audio2   = null;
  let rafId    = null;
  let answered = false;
  let vocabAudio = null;

  const imgEl        = document.getElementById("lessonImg");
  const audioBtn     = document.getElementById("audioBtn");
  const karaokeBox   = document.getElementById("karaokeBox");
  const questionArea = document.getElementById("questionArea");
  const questionLabel= document.getElementById("questionLabel");
  const answerRow    = document.getElementById("answerRow");
  const tilesEl      = document.getElementById("tiles");
  const counter      = document.getElementById("counter");
  const bar          = document.getElementById("progressBar");
  const endScreen    = document.getElementById("endScreen");

  // ── Build vocabulary tiles ────────────────────────────────
  function buildVocab() {
    const grid = document.getElementById("vocabGrid");
    grid.innerHTML = "";
    VOCAB.forEach(v => {
      const tile = document.createElement("div");
      tile.className = "vocab-tile";
      tile.innerHTML = `
        <div class="vocab-left">
          <span class="vocab-en">${v.en}</span>
          <span class="vocab-es">${v.es}</span>
        </div>
        <span class="vocab-speaker">🔊</span>`;
      tile.onclick = () => playVocabWord(tile, v.audio);
      grid.appendChild(tile);
    });
  }

  function playVocabWord(tile, audioFile) {
    if (vocabAudio) { vocabAudio.pause(); vocabAudio = null; }
    // Clear all playing states
    document.querySelectorAll(".vocab-tile").forEach(t => t.classList.remove("playing"));
    tile.classList.add("playing");
    vocabAudio = new Audio(BASE + "audio/u5/" + audioFile);
    vocabAudio.play().catch(() => {});
    vocabAudio.addEventListener("ended", () => {
      tile.classList.remove("playing");
    });
  }

  // ── Vocab toggle ──────────────────────────────────────────
  window.toggleVocab = function () {
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
    imgEl.alt = ex.question;

    audioBtn.className = "audio-btn";
    audioBtn.textContent = "▶";
    audioBtn.disabled = false;

    // Build karaoke spans
    karaokeBox.innerHTML = ex.lines
      .map((l, i) => `<span data-i="${i}">${l.text}</span>`)
      .join("<br>");

    questionArea.classList.remove("show");
    tilesEl.innerHTML = "";
    answerRow.innerHTML = "";

    stopAll();
  }

  // ── Play first audio (karaoke) ────────────────────────────
  window.playFirstAudio = function () {
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
        const lineT = ex.lines[i].t;
        const nextT = ex.lines[i + 1] ? ex.lines[i + 1].t : Infinity;
        sp.classList.toggle("highlight", t >= lineT && t < nextT);
      });
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    audio1.addEventListener("ended", () => {
      cancelAnimationFrame(rafId);
      karaokeBox.querySelectorAll("span").forEach(sp => sp.classList.remove("highlight"));
      audioBtn.className = "audio-btn done";
      audioBtn.textContent = "✓";
      showQuestion();
    });
  };

  // ── Show fill-in question ─────────────────────────────────
  function showQuestion() {
    const ex = EXERCISES[exIndex];
    questionLabel.textContent = ex.question;

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
      btn.classList.add("correct");
      tilesEl.querySelectorAll(".tile").forEach(t => t.classList.add("used"));
      setTimeout(playSecondAudio, 600);
    } else {
      btn.classList.add("error");
      setTimeout(() => btn.classList.remove("error"), 400);
    }
  }

  // ── Play second audio then advance ────────────────────────
  function playSecondAudio() {
    const ex = EXERCISES[exIndex];
    audio2 = new Audio(ex.audio2);
    audio2.play().catch(() => {});
    audio2.addEventListener("ended", () => {
      setTimeout(advance, 2000);
    });
  }

  // ── Advance ───────────────────────────────────────────────
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
    if (rafId)  { cancelAnimationFrame(rafId); rafId = null; }
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
  buildVocab();
  shuffle(EXERCISES);
  loadExercise();
})();
