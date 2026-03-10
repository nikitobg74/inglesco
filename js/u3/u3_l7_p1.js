(() => {
  "use strict";

  const IMAGE_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l7/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const roundLabel     = document.getElementById("roundLabel");
  const exerciseBox    = document.getElementById("exerciseBox");
  const endScreen      = document.getElementById("endScreen");
  const instrLine      = document.getElementById("instrLine");

  const refToggle      = document.getElementById("refToggle");
  const refToggleLabel = document.getElementById("refToggleLabel");
  const refBody        = document.getElementById("refBody");
  const refThEn        = document.getElementById("refThEn");
  const refThEs        = document.getElementById("refThEs");
  const refTableBody   = document.getElementById("refTableBody");

  const itemImg        = document.getElementById("itemImg");
  const playBtn        = document.getElementById("playBtn");
  const playLabel      = document.getElementById("playLabel");

  const buildBlock     = document.getElementById("buildBlock");
  const sentenceDisplay = document.getElementById("sentenceDisplay");
  const tilesContainer = document.getElementById("tilesContainer");

  const statusLine     = document.getElementById("statusLine");
  const endTitle       = document.getElementById("endTitle");
  const endMsg1        = document.getElementById("endMsg1");
  const endMsg2        = document.getElementById("endMsg2");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:      "Escucha y selecciona el verbo correcto.",
    refLabel:   "📋 Palabras nuevas",
    colEn:      "English",
    colEs:      "Español",
    vocabRows: [
      { en: "busy",     es: "ocupado / ocupada" },
      { en: "today",    es: "hoy"               },
      { en: "apartment",es: "apartamento"       },
      { en: "cat",      es: "gato"              },
      { en: "TV",       es: "televisión"        },
      { en: "bedroom",  es: "habitación"        },
      { en: "homework", es: "tarea"             },
      { en: "clothes",  es: "ropa"              },
      { en: "cleaning", es: "limpiando"         },
      { en: "feeding",  es: "alimentando"       },
      { en: "fixing",   es: "arreglando"        },
      { en: "painting", es: "pintando"          },
      { en: "doing",    es: "haciendo"          },
      { en: "washing",  es: "lavando"           }
    ],
    play:    "Escuchar",
    correct: "✓",
    wrong:   "✗",
    end: {
      title: "¡Muy bien!",
      msg1:  "Felicitaciones.",
      msg2:  "Terminaste la parte 1."
    }
  };

  // ── Rounds ────────────────────────────────────────────────────────────────
  // template: sentence split around the verb blank {0}
  // answer:   correct verb
  // wrong:    two distractor verbs
  const ROUNDS = [
    {
      image:    "u3.l7.p1.man.clean.apartment.jpg",
      audio:    "u3.l7.p1.man.clean.apartment.mp3",
      template: ["Carlos is busy today. He is ", "{0}", " his apartment."],
      answer:   "cleaning",
      wrong:    ["fixing", "washing"]
    },
    {
      image:    "u3.l7.p1.she.feed.cat.jpg",
      audio:    "u3.l7.p1.she.feed.cat.mp3",
      template: ["Rosa is busy today. She is ", "{0}", " her cat."],
      answer:   "feeding",
      wrong:    ["washing", "painting"]
    },
    {
      image:    "u3.l7.p1.fix.tv.jpg",
      audio:    "u3.l7.p1.fix.tv.mp3",
      template: ["We are busy today. We are ", "{0}", " our TV."],
      answer:   "fixing",
      wrong:    ["cleaning", "doing"]
    },
    {
      image:    "u3.l7.p1.painting.bedroom.jpg",
      audio:    "u3.l7.p1.painting.bedroom.mp3",
      template: ["Pedro and Ana are busy today. They are ", "{0}", " their bedroom."],
      answer:   "painting",
      wrong:    ["fixing", "cleaning"]
    },
    {
      image:    "u3.l7.p1.do.his.homework.jpg",
      audio:    "u3.l7.p1.do.his.homework.mp3",
      template: ["Tim is busy today. He is ", "{0}", " his homework."],
      answer:   "doing",
      wrong:    ["washing", "fixing"]
    },
    {
      image:    "u3.l7.p1.she.wash.clothes.jpg",
      audio:    "u3.l7.p1.she.wash.clothes.mp3",
      template: ["Tracy is busy today. She is ", "{0}", " her clothes."],
      answer:   "washing",
      wrong:    ["feeding", "painting"]
    }
  ];

  // ── Shuffle ───────────────────────────────────────────────────────────────
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

  // ── Build sentence with verb gap + tiles ─────────────────────────────────
  function buildExercise(round) {
    // sentence display
    while (sentenceDisplay.firstChild) sentenceDisplay.removeChild(sentenceDisplay.firstChild);

    round.template.forEach(part => {
      if (part === "{0}") {
        const blank = document.createElement("span");
        blank.className = "verb-blank";
        blank.id        = "verbBlank";
        blank.textContent = "___";
        sentenceDisplay.appendChild(blank);
      } else {
        const span = document.createElement("span");
        span.textContent = part;
        sentenceDisplay.appendChild(span);
      }
    });

    // tiles: correct + 2 wrong, shuffled
    while (tilesContainer.firstChild) tilesContainer.removeChild(tilesContainer.firstChild);
    isLocked = false;

    const allTiles = shuffle([round.answer, ...round.wrong]);

    allTiles.forEach(word => {
      const btn = document.createElement("button");
      btn.className   = "tile";
      btn.type        = "button";
      btn.textContent = word;

      btn.addEventListener("click", () => {
        if (isLocked || btn.disabled) return;

        if (word !== round.answer) {
          // Wrong
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
        // disable all tiles
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

  // ── Load round ────────────────────────────────────────────────────────────
  function loadRound(i) {
    idx = i;
    stopAudio();
    setStatus("", "");
    isLocked = false;

    const round = SHUFFLED_ROUNDS[idx];
    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;
    itemImg.src            = IMAGE_BASE + round.image;
    itemImg.alt            = "";
    playLabel.textContent  = CONFIG.play;

    buildBlock.classList.add("hidden");
    while (sentenceDisplay.firstChild) sentenceDisplay.removeChild(sentenceDisplay.firstChild);
    while (tilesContainer.firstChild)  tilesContainer.removeChild(tilesContainer.firstChild);
  }

  // ── Play button ───────────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    stopAudio();
    const round = SHUFFLED_ROUNDS[idx];
    audio = new Audio(AUDIO_BASE + round.audio);

    const showBuild = () => {
      if (buildBlock.classList.contains("hidden")) {
        buildExercise(round);
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

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  buildRefTable();
  loadRound(0);
})();
