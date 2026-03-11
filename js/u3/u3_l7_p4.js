(() => {
  "use strict";

  const IMAGE_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l7/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const instrLine      = document.getElementById("instrLine");

  const refToggle      = document.getElementById("refToggle");
  const refToggleLabel = document.getElementById("refToggleLabel");
  const refBody        = document.getElementById("refBody");
  const refThEn        = document.getElementById("refThEn");
  const refThEs        = document.getElementById("refThEs");
  const refTableBody   = document.getElementById("refTableBody");

  const paragraphBlock  = document.getElementById("paragraphBlock");
  const playBtn         = document.getElementById("playBtn");
  const playLabel       = document.getElementById("playLabel");

  const roundLabel      = document.getElementById("roundLabel");
  const exerciseBox     = document.getElementById("exerciseBox");
  const exCounter       = document.getElementById("exCounter");
  const sentenceDisplay = document.getElementById("sentenceDisplay");
  const tilesContainer  = document.getElementById("tilesContainer");
  const statusLine      = document.getElementById("statusLine");

  const endScreen       = document.getElementById("endScreen");
  const endTitle        = document.getElementById("endTitle");
  const endMsg1         = document.getElementById("endMsg1");
  const endMsg2         = document.getElementById("endMsg2");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:    "Lee el texto, escucha y completa los ejercicios.",
    audio:    "u3.l7.p4.maple.avenue.mp3",
    refLabel: "📋 Palabras nuevas",
    colEn:    "English",
    colEs:    "Español",
    vocabRows: [
      { en: "everybody",  es: "todos"               },
      { en: "avenue",     es: "avenida"             },
      { en: "garage",     es: "garaje"              },
      { en: "bedroom",    es: "habitación"          },
      { en: "kitchen",    es: "cocina"              },
      { en: "yard",       es: "jardín / patio"      },
      { en: "neighbors",  es: "vecinos"             },
      { en: "fixing",     es: "arreglando"          },
      { en: "painting",   es: "pintando"            },
      { en: "feeding",    es: "alimentando"         },
      { en: "washing",    es: "lavando"             },
      { en: "cleaning",   es: "limpiando"           },
      { en: "playing",    es: "jugando"             },
      { en: "watching",   es: "mirando / observando"}
    ],
    paragraph: [
      "Everybody at 42 Maple Avenue is very busy today.",
      "Mr. Davis is fixing his car in the garage.",
      "Ana Lopez is painting her bedroom.",
      "Carlos Rivera is feeding his cat. The cat is eating a fish.",
      "Mr. and Mrs. Patel are washing their clothes.",
      "Linda Brown is cleaning her kitchen.",
      "And Tom and Sarah Wilson are playing with their dog. The dog is playing with a ball in the yard.",
      "I am busy, too. I am washing my car and I am watching all my neighbors.",
      "It is a very busy day at 42 Maple Avenue.\""
    ],
    play:     "Escuchar",
    roundSep: " / ",
    correct:  "✓",
    wrong:    "✗",
    end: {
      title: "¡Muy bien!",
      msg1:  "Felicitaciones.",
      msg2:  "Terminaste la lección 7."
    }
  };

  // ── Exercises ─────────────────────────────────────────────────────────────
  // template: sentence split around the blank {0}
  // answer:   correct word
  // wrong:    two distractor words (all pulled from the paragraph)
  const EXERCISES = [
    {
      template: ["Mr. Davis is ", "{0}", " his car in the garage."],
      answer:   "fixing",
      wrong:    ["washing", "painting"]
    },
    {
      template: ["Ana Lopez is painting ", "{0}", " bedroom."],
      answer:   "her",
      wrong:    ["his", "their"]
    },
    {
      template: ["Carlos Rivera is ", "{0}", " his cat."],
      answer:   "feeding",
      wrong:    ["fixing", "painting"]
    },
    {
      template: ["Mr. and Mrs. Patel ", "{0}", " washing their clothes."],
      answer:   "are",
      wrong:    ["is", "am"]
    },
    {
      template: ["Linda Brown is ", "{0}", " her kitchen."],
      answer:   "cleaning",
      wrong:    ["washing", "playing"]
    },
    {
      template: ["Tom and Sarah Wilson are ", "{0}", " with their dog."],
      answer:   "playing",
      wrong:    ["feeding", "washing"]
    },
    {
      template: ["I am washing ", "{0}", " car."],
      answer:   "my",
      wrong:    ["their", "her"]
    }
  ];

  const TOTAL = EXERCISES.length;
  let idx     = 0;
  let audio   = null;
  let isLocked = false;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function stopAudio() {
    if (!audio) return;
    try { audio.pause(); audio.currentTime = 0; } catch (e) {}
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function setStatus(type, text) {
    statusLine.textContent = text;
    statusLine.classList.remove("ok", "bad");
    if (type === "ok")  statusLine.classList.add("ok");
    if (type === "bad") statusLine.classList.add("bad");
  }

  function clearEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  // ── Build exercise ────────────────────────────────────────────────────────
  function buildExercise(ex) {
    // Sentence with blank
    clearEl(sentenceDisplay);
    ex.template.forEach(part => {
      if (part === "{0}") {
        const blank = document.createElement("span");
        blank.className   = "verb-blank";
        blank.id          = "verbBlank";
        blank.textContent = "___";
        sentenceDisplay.appendChild(blank);
      } else {
        const span = document.createElement("span");
        span.textContent = part;
        sentenceDisplay.appendChild(span);
      }
    });

    // Tiles
    clearEl(tilesContainer);
    isLocked = false;
    setStatus("", "");

    const allTiles = shuffle([ex.answer, ...ex.wrong]);

    allTiles.forEach(word => {
      const btn = document.createElement("button");
      btn.className   = "tile";
      btn.type        = "button";
      btn.textContent = word;

      btn.addEventListener("click", () => {
        if (isLocked || btn.disabled) return;

        if (word !== ex.answer) {
          btn.classList.add("wrong");
          setStatus("bad", CONFIG.wrong);
          isLocked = true;
          setTimeout(() => {
            btn.classList.remove("wrong");
            setStatus("", "");
            isLocked = false;
          }, 600);
          return;
        }

        // Correct
        isLocked = true;
        btn.classList.add("correct");
        const blank = document.getElementById("verbBlank");
        if (blank) {
          blank.textContent = word;
          blank.classList.add("filled");
        }
        setStatus("ok", CONFIG.correct);
        Array.from(tilesContainer.querySelectorAll(".tile"))
          .forEach(b => { b.disabled = true; });

        setTimeout(() => {
          setStatus("", "");
          isLocked = false;
          advanceOrFinish();
        }, 900);
      });

      tilesContainer.appendChild(btn);
    });
  }

  // ── Load exercise ─────────────────────────────────────────────────────────
  function loadExercise(i) {
    idx = i;
    roundLabel.textContent = `${idx + 1}${CONFIG.roundSep}${TOTAL}`;
    exCounter.textContent  = `${idx + 1}${CONFIG.roundSep}${TOTAL}`;
    buildExercise(EXERCISES[idx]);
    exerciseBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function advanceOrFinish() {
    if (idx < TOTAL - 1) {
      loadExercise(idx + 1);
    } else {
      finish();
    }
  }

  // ── Play button ───────────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    stopAudio();
    audio = new Audio(AUDIO_BASE + CONFIG.audio);

    const showExercises = () => {
      roundLabel.classList.remove("hidden");
      exerciseBox.classList.remove("hidden");
      loadExercise(0);
    };

    audio.onended = showExercises;
    audio.play().catch(showExercises);
  });

  // ── Finish ────────────────────────────────────────────────────────────────
  function finish() {
    stopAudio();
    exerciseBox.classList.add("hidden");
    roundLabel.classList.add("hidden");
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

  // ── Build vocab table ─────────────────────────────────────────────────────
  function buildRefTable() {
    refThEn.textContent        = CONFIG.colEn;
    refThEs.textContent        = CONFIG.colEs;
    refToggleLabel.textContent = CONFIG.refLabel;
    CONFIG.vocabRows.forEach(row => {
      const tr   = document.createElement("tr");
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

  // ── Build paragraph ───────────────────────────────────────────────────────
  function buildParagraph() {
    CONFIG.paragraph.forEach((sentence, i) => {
      const span = document.createElement("span");
      span.textContent = (i > 0 ? " " : "") + sentence;
      paragraphBlock.appendChild(span);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  buildRefTable();
  buildParagraph();
  playLabel.textContent = CONFIG.play;
})();
