(() => {
  "use strict";

  const IMAGE_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l6/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const refPanel       = document.getElementById("refPanel");
  const refToggle      = document.getElementById("refToggle");
  const refToggleLabel = document.getElementById("refToggleLabel");
  const refBody        = document.getElementById("refBody");
  const refThEn        = document.getElementById("refThEn");
  const refThEs        = document.getElementById("refThEs");
  const refTableBody   = document.getElementById("refTableBody");

  const roundLabel     = document.getElementById("roundLabel");
  const exerciseBox    = document.getElementById("exerciseBox");
  const endScreen      = document.getElementById("endScreen");
  const instrLine      = document.getElementById("instrLine");

  const itemImg        = document.getElementById("itemImg");
  const playBtn        = document.getElementById("playBtn");
  const playLabel      = document.getElementById("playLabel");

  const questionLabel  = document.getElementById("questionLabel");
  const questionText   = document.getElementById("questionText");

  const buildBlock     = document.getElementById("buildBlock");
  const buildTitle     = document.getElementById("buildTitle");
  const sentenceBox    = document.getElementById("sentenceBox");
  const tilesContainer = document.getElementById("tilesContainer");

  const statusLine     = document.getElementById("statusLine");
  const endTitle       = document.getElementById("endTitle");
  const endMsg1        = document.getElementById("endMsg1");
  const endMsg2        = document.getElementById("endMsg2");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:         "Escucha y construye la respuesta correcta.",
    questionLabel: "Pregunta:",
    buildTitle:    "Construye la respuesta:",
    refLabel:      "📋 Pronombres posesivos",
    colEn:         "English",
    colEs:         "Español",
    pronRows: [
      { en: "my",    es: "mi / mis" },
      { en: "his",   es: "su (de él)" },
      { en: "her",   es: "su (de ella)" },
      { en: "our",   es: "nuestro / nuestra" },
      { en: "your",  es: "tu / tus" },
      { en: "their", es: "su (de ellos)" }
    ],
    play:    "Escuchar",
    correct: "✓",
    wrong:   "✗",
    end: {
      title: "¡Muy buen trabajo!",
      msg1:  "Felicitaciones.",
      msg2:  "Terminaste la parte 2."
    }
  };

  // ── Rounds ────────────────────────────────────────────────────────────────
  // answer: 3 correct chunks [pronoun+verb, gerund, possessive+object]
  // wrong:  exactly 3 distractors — one per slot — so 6 tiles total on screen
  const ROUNDS = [
    {
      image:    "u3.l6.p1.fix.car.jpg",
      audio:    "u3.l6.p1.fix.car.mp3",
      question: "What are you doing?",
      answer:   ["I am",    "fixing",   "my car."],
      wrong:    ["She is",  "washing",  "her car."]
    },
    {
      image:    "u3.l6.p1.woman.fix.car.jpg",
      audio:    "u3.l6.p1.woman.fix.car.mp3",
      question: "What is she doing?",
      answer:   ["She is",  "fixing",   "her car."],
      wrong:    ["He is",   "washing",  "his car."]
    },
    {
      image:    "u3.l6.p1.fix.sink.jpg",
      audio:    "u3.l6.p1.fix.sink.mp3",
      question: "What is he doing?",
      answer:   ["He is",   "fixing",   "his sink."],
      wrong:    ["She is",  "cleaning", "her sink."]
    },
    {
      image:    "u3.l6.p1.woman.clean.apartment.jpg",
      audio:    "u3.l6.p1.woman.clean.apartment.mp3",
      question: "What is she doing?",
      answer:   ["She is",  "cleaning", "her apartment."],
      wrong:    ["He is",   "fixing",   "his apartment."]
    },
    {
      image:    "u3.l6.p1.man.clean.window.jpg",
      audio:    "u3.l6.p1.man.clean.window.mp3",
      question: "What is he doing?",
      answer:   ["He is",   "cleaning", "his window."],
      wrong:    ["She is",  "washing",  "her window."]
    },
    {
      image:    "u3.l6.p1.feed.cat.jpg",
      audio:    "u3.l6.p1.feed.cat.mp3",
      question: "What are you doing?",
      answer:   ["I am",    "feeding",  "my cat."],
      wrong:    ["She is",  "washing",  "her cat."]
    },
    {
      image:    "u3.l6.p1.doing.homework.jpg",
      audio:    "u3.l6.p1.doing.homework.mp3",
      question: "What are they doing?",
      answer:   ["They are","doing",    "their homework."],
      wrong:    ["We are",  "fixing",   "our homework."]
    },
    {
      image:    "u3.l6.p1.woman.washing.clothes.jpg",
      audio:    "u3.l6.p1.woman.washing.clothes.mp3",
      question: "What is she doing?",
      answer:   ["She is",  "washing",  "her clothes."],
      wrong:    ["He is",   "cleaning", "his clothes."]
    },
    {
      image:    "u3.l6.p1.painting.jpg",
      audio:    "u3.l6.p1.painting.mp3",
      question: "What are you doing?",
      answer:   ["We are",  "painting", "our bedroom."],
      wrong:    ["They are","cleaning", "their bedroom."]
    },
    {
      image:    "u3.l6.p1.girl.brushing.teeth.jpg",
      audio:    "u3.l6.p1.girl.brushing.teeth.mp3",
      question: "What are you doing?",
      answer:   ["I am",    "brushing", "my teeth."],
      wrong:    ["She is",  "washing",  "her teeth."]
    },
    {
      image:    "u3.l6.p1.man.read.email.jpg",
      audio:    "u3.l6.p1.man.read.email.mp3",
      question: "What is he doing?",
      answer:   ["He is",   "reading",  "his emails."],
      wrong:    ["She is",  "washing",  "her emails."]
    }
  ];

  // ── Shuffle rounds on every page load ────────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const SHUFFLED_ROUNDS = shuffle(ROUNDS);
  const TOTAL           = SHUFFLED_ROUNDS.length;
  let idx               = 0;
  let audio             = null;
  let isLocked          = false;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function stopAudio() {
    if (!audio) return;
    try { audio.pause(); audio.currentTime = 0; } catch (e) {}
  }

  function setStatus(type, text) {
    statusLine.textContent = text;
    statusLine.classList.remove("ok", "bad");
    if (type === "ok")  statusLine.classList.add("ok");
    if (type === "bad") statusLine.classList.add("bad");
  }

  function getChunks(box) {
    return Array.from(box.children).map(el => el.textContent);
  }

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function paintCorrect(box) {
    Array.from(box.children).forEach(el => el.classList.add("correct"));
  }

  function addChip(box, text) {
    const chip = document.createElement("span");
    chip.className   = "word-chip";
    chip.textContent = text;
    box.appendChild(chip);
  }

  function disableTiles() {
    Array.from(tilesContainer.querySelectorAll(".tile"))
      .forEach(b => { b.disabled = true; });
  }

  function enableTiles() {
    Array.from(tilesContainer.querySelectorAll(".tile"))
      .forEach(b => { b.disabled = false; b.classList.remove("wrong", "correct"); });
  }

  // ── Build 6 tiles (3 correct + 3 wrong) shuffled ─────────────────────────
  function buildTiles(round) {
    clear(tilesContainer);
    clear(sentenceBox);
    isLocked = false;

    const allTiles = shuffle([...round.answer, ...round.wrong]);

    allTiles.forEach(chunk => {
      const btn = document.createElement("button");
      btn.className   = "tile";
      btn.type        = "button";
      btn.textContent = chunk;

      btn.addEventListener("click", () => {
        if (isLocked || btn.disabled) return;

        // Wrong distractor
        if (!round.answer.includes(chunk)) {
          btn.classList.add("wrong");
          isLocked = true;
          setStatus("bad", CONFIG.wrong);
          setTimeout(() => {
            btn.classList.remove("wrong");
            isLocked = false;
            setStatus("", "");
          }, 600);
          return;
        }

        // Correct chunk tapped
        addChip(sentenceBox, chunk);
        btn.disabled = true;

        const current = getChunks(sentenceBox);
        if (current.length < round.answer.length) return;

        if (arraysEqual(current, round.answer)) {
          isLocked = true;
          paintCorrect(sentenceBox);
          setStatus("ok", CONFIG.correct);
          disableTiles();
          setTimeout(() => {
            setStatus("", "");
            isLocked = false;
            advanceOrFinish();
          }, 1000);
        } else {
          // Correct chunks, wrong order — full reset
          isLocked = true;
          setStatus("bad", CONFIG.wrong);
          disableTiles();
          setTimeout(() => {
            clear(sentenceBox);
            enableTiles();
            setStatus("", "");
            isLocked = false;
          }, 700);
        }
      });

      tilesContainer.appendChild(btn);
    });
  }

  // ── Load round ────────────────────────────────────────────────────────────
  function loadRound(i) {
    idx = i;
    stopAudio();
    setStatus("", "");
    isLocked = false;

    const round = SHUFFLED_ROUNDS[idx];
    roundLabel.textContent    = `${idx + 1} / ${TOTAL}`;
    itemImg.src               = IMAGE_BASE + round.image;
    itemImg.alt               = "";
    questionLabel.textContent = CONFIG.questionLabel;
    questionText.textContent  = round.question;
    playLabel.textContent     = CONFIG.play;

    buildBlock.classList.add("hidden");
    clear(sentenceBox);
    clear(tilesContainer);
  }

  // ── Play button — unlimited replays ──────────────────────────────────────
  playBtn.addEventListener("click", () => {
    stopAudio();
    const round = SHUFFLED_ROUNDS[idx];
    audio = new Audio(AUDIO_BASE + round.audio);

    const showBuild = () => {
      if (buildBlock.classList.contains("hidden")) {
        buildTitle.textContent = CONFIG.buildTitle;
        buildTiles(round);
        buildBlock.classList.remove("hidden");
        buildBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    };

    audio.onended = showBuild;
    audio.play().catch(showBuild);
  });

  function advanceOrFinish() {
    if (idx < TOTAL - 1) {
      loadRound(idx + 1);
    } else {
      finish();
    }
  }

  // ── Finish ────────────────────────────────────────────────────────────────
  function finish() {
    stopAudio();
    exerciseBox.classList.add("hidden");
    roundLabel.classList.add("hidden");
    refPanel.classList.add("hidden");
    endTitle.textContent = CONFIG.end.title;
    endMsg1.textContent  = CONFIG.end.msg1;
    endMsg2.textContent  = CONFIG.end.msg2;
    endScreen.classList.remove("hidden");
  }

  // ── Ref panel toggle ──────────────────────────────────────────────────────
  refToggle.addEventListener("click", () => {
    const isOpen = refBody.classList.contains("open");
    refBody.classList.toggle("open", !isOpen);
    refToggle.classList.toggle("open", !isOpen);
  });

  // ── Build ref table ───────────────────────────────────────────────────────
  function buildRefTable() {
    refThEn.textContent        = CONFIG.colEn;
    refThEs.textContent        = CONFIG.colEs;
    refToggleLabel.textContent = CONFIG.refLabel;
    CONFIG.pronRows.forEach(row => {
      const tr = document.createElement("tr");
      const tdEn = document.createElement("td");
      const tdEs = document.createElement("td");
      tdEn.className   = "col-en";
      tdEs.className   = "col-es";
      tdEn.textContent = row.en;
      tdEs.textContent = row.es;
      tr.appendChild(tdEn);
      tr.appendChild(tdEs);
      refTableBody.appendChild(tr);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  buildRefTable();
  loadRound(0);
})();
