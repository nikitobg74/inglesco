(() => {
  "use strict";

  const IMAGE_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l7/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const roundLabel      = document.getElementById("roundLabel");
  const exerciseBox     = document.getElementById("exerciseBox");
  const endScreen       = document.getElementById("endScreen");
  const instrLine       = document.getElementById("instrLine");

  const refToggle       = document.getElementById("refToggle");
  const refToggleLabel  = document.getElementById("refToggleLabel");
  const refBody         = document.getElementById("refBody");
  const refThQ          = document.getElementById("refThQ");
  const refThA          = document.getElementById("refThA");
  const refTableBody    = document.getElementById("refTableBody");

  const itemImg         = document.getElementById("itemImg");
  const playBtn         = document.getElementById("playBtn");
  const playLabel       = document.getElementById("playLabel");
  const dialoguePreview = document.getElementById("dialoguePreview");
  const previewQ        = document.getElementById("previewQ");
  const previewA        = document.getElementById("previewA");

  const buildBlock      = document.getElementById("buildBlock");
  const questionLine    = document.getElementById("questionLine");

  const partABlock      = document.getElementById("partABlock");
  const partALabel      = document.getElementById("partALabel");
  const dropZoneA       = document.getElementById("dropZoneA");
  const tilesA          = document.getElementById("tilesA");

  const partBBlock      = document.getElementById("partBBlock");
  const partBLabel      = document.getElementById("partBLabel");
  const dropZoneB       = document.getElementById("dropZoneB");
  const tilesB          = document.getElementById("tilesB");

  const statusLine      = document.getElementById("statusLine");
  const endTitle        = document.getElementById("endTitle");
  const endMsg1         = document.getElementById("endMsg1");
  const endMsg2         = document.getElementById("endMsg2");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:     "Escucha y ordena las palabras.",
    refLabel:  "📋 Palabras nuevas",
    colQ:      "Question",
    colA:      "Answer",
    vocabRows: [
      { q: "busy",      a: "ocupado / ocupada" },
      { q: "painting",  a: "pintando"          },
      { q: "feeding",   a: "alimentando"       },
      { q: "fixing",    a: "arreglando"        },
      { q: "brushing",  a: "cepillando"        },
      { q: "exercises", a: "ejercicios"        },
      { q: "cleaning",  a: "limpiando"         },
      { q: "reading",   a: "leyendo"           },
      { q: "bicycle",   a: "bicicleta"         },
      { q: "yard",      a: "jardín / patio"    },
      { q: "teeth",     a: "dientes"           },
      { q: "emails",    a: "correos"           }
    ],
    play:     "Escuchar",
    roundSep: " / ",
    partA:    "Parte A",
    partB:    "Parte B",
    end: {
      title: "¡Muy bien!",
      msg1:  "Felicitaciones.",
      msg2:  "Terminaste la parte 3."
    }
  };

  // ── Rounds ────────────────────────────────────────────────────────────────
  // partA / partB: arrays of word tokens in correct order (punctuation attached)
  const ROUNDS = [
    {
      image:    "u3.l7.p3.painting.jpg",
      audio:    "u3.l7.p3.painting.mp3",
      question: "Are they busy?",
      partA:    ["Yes,", "they", "are."],
      partB:    ["They", "are", "painting", "their", "house."]
    },
    {
      image:    "u3.l7.p3.feed.dog.jpg",
      audio:    "u3.l7.p3.feed.dog.mp3",
      question: "Is Tom busy?",
      partA:    ["Yes,", "he", "is."],
      partB:    ["He", "is", "feeding", "his", "dog."]
    },
    {
      image:    "u3.l7.p3.fix.bike.jpg",
      audio:    "u3.l7.p3.fix.bike.mp3",
      question: "Are you busy?",
      partA:    ["Yes,", "I", "am."],
      partB:    ["I", "am", "fixing", "my", "bicycle."]
    },
    {
      image:    "u3.l7.p3.fix.car.jpg",
      audio:    "u3.l7.p3.fix.car.mp3",
      question: "Is Karen busy?",
      partA:    ["Yes,", "she", "is."],
      partB:    ["She", "is", "fixing", "her", "car."]
    },
    {
      image:    "u3.l7.p3.brush.teeth.jpg",
      audio:    "u3.l7.p3.brush.teeth.mp3",
      question: "Are your children busy?",
      partA:    ["Yes,", "they", "are."],
      partB:    ["They", "are", "brushing", "their", "teeth."]
    },
    {
      image:    "u3.l7.p3.our.exercises.jpg",
      audio:    "u3.l7.p3.our.exercises.mp3",
      question: "Are you busy?",
      partA:    ["Yes,", "we", "are."],
      partB:    ["We", "are", "doing", "our", "exercises."]
    },
    {
      image:    "u3.l7.p3.clean.yard.jpg",
      audio:    "u3.l7.p3.clean.yard.mp3",
      question: "Is Pedro busy?",
      partA:    ["Yes,", "he", "is."],
      partB:    ["He", "is", "cleaning", "the", "yard."]
    },
    {
      image:    "u3.l7.p3.read.email.jpg",
      audio:    "u3.l7.p3.read.email.mp3",
      question: "Is Wendy busy?",
      partA:    ["Yes,", "she", "is."],
      partB:    ["She", "is", "reading", "her", "emails."]
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  function stopAudio() {
    if (!audio) return;
    try { audio.pause(); audio.currentTime = 0; } catch (e) {}
  }

  function clearEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function setStatus(type, text) {
    statusLine.textContent = text;
    statusLine.classList.remove("ok", "bad");
    if (type === "ok")  statusLine.classList.add("ok");
    if (type === "bad") statusLine.classList.add("bad");
  }

  // ── Build one ordering part ───────────────────────────────────────────────
  // correct: array of tokens in correct order
  // dropZone, tileBank: DOM elements to populate
  // onCorrect: callback when student completes correctly
  function buildPart(correct, dropZone, tileBank, onCorrect) {
    clearEl(dropZone);
    clearEl(tileBank);
    dropZone.classList.remove("correct");
    setStatus("", "");

    const placed = [];   // tokens currently in drop zone (in order)
    const shuffled = shuffle(correct.slice());

    // map from token to its tile button (handles duplicate words)
    // use index-based tracking to handle duplicates
    const tileButtons = [];

    shuffled.forEach((word, si) => {
      const btn = document.createElement("button");
      btn.className   = "tile";
      btn.type        = "button";
      btn.textContent = word;
      btn.dataset.idx = si;

      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        btn.disabled = true;

        // Add chip to drop zone
        const chip = document.createElement("button");
        chip.className   = "chip";
        chip.type        = "button";
        chip.textContent = word;
        chip.dataset.tileIdx = si;

        chip.addEventListener("click", () => {
          // Return chip to tile bank
          const tIdx = parseInt(chip.dataset.tileIdx, 10);
          const pidx = placed.indexOf(chip);
          if (pidx !== -1) placed.splice(pidx, 1);
          dropZone.removeChild(chip);
          tileButtons[tIdx].disabled = false;
          setStatus("", "");
          dropZone.classList.remove("correct");
        });

        placed.push(chip);
        dropZone.appendChild(chip);

        // Check answer after each placement
        if (placed.length === correct.length) {
          const attempt = placed.map(c => c.textContent);
          const isRight = attempt.every((w, i) => w === correct[i]);

          if (isRight) {
            // Lock all chips green
            placed.forEach(c => c.classList.add("correct-chip"));
            dropZone.classList.add("correct");
            setStatus("ok", "✓");
            setTimeout(() => {
              setStatus("", "");
              onCorrect();
            }, 900);
          } else {
            setStatus("bad", "✗");
            // Shake and reset after brief delay
            setTimeout(() => {
              // Return all chips to bank
              placed.forEach(c => {
                const tIdx = parseInt(c.dataset.tileIdx, 10);
                tileButtons[tIdx].disabled = false;
                dropZone.removeChild(c);
              });
              placed.length = 0;
              dropZone.classList.remove("correct");
              setStatus("", "");
            }, 700);
          }
        }
      });

      tileButtons.push(btn);
      tileBank.appendChild(btn);
    });
  }

  // ── Load round ────────────────────────────────────────────────────────────
  function loadRound(i) {
    idx = i;
    stopAudio();
    setStatus("", "");

    const round = SHUFFLED_ROUNDS[idx];
    roundLabel.textContent = `${idx + 1}${CONFIG.roundSep}${TOTAL}`;

    itemImg.src = IMAGE_BASE + round.image;
    itemImg.alt = "";

    playLabel.textContent = CONFIG.play;

    // Reset preview
    previewQ.textContent = round.question;
    previewA.textContent = round.partA.join(" ") + " " + round.partB.join(" ");
    dialoguePreview.classList.add("hidden");

    // Hide build block
    buildBlock.classList.add("hidden");
    partBBlock.classList.add("hidden");
  }

  // ── Play button ───────────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    stopAudio();
    const round = SHUFFLED_ROUNDS[idx];
    audio = new Audio(AUDIO_BASE + round.audio);

    // Show dialogue text immediately so student can read while listening
    dialoguePreview.classList.remove("hidden");

    const startBuild = () => {
      // Hide preview, show build block
      dialoguePreview.classList.add("hidden");
      buildBlock.classList.remove("hidden");
      partBBlock.classList.add("hidden");

      questionLine.textContent = round.question;
      partALabel.textContent   = CONFIG.partA;
      partBLabel.textContent   = CONFIG.partB;

      buildPart(round.partA, dropZoneA, tilesA, () => {
        // Part A done — show Part B
        partBBlock.classList.remove("hidden");
        partBBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
        buildPart(round.partB, dropZoneB, tilesB, () => {
          // Both parts done — advance
          setTimeout(advanceOrFinish, 400);
        });
      });
    };

    audio.onended = startBuild;
    audio.play().catch(startBuild);
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
    refThQ.textContent         = CONFIG.colQ;
    refThA.textContent         = CONFIG.colA;
    refToggleLabel.textContent = CONFIG.refLabel;
    CONFIG.vocabRows.forEach(row => {
      const tr  = document.createElement("tr");
      const tdQ = document.createElement("td");
      const tdA = document.createElement("td");
      tdQ.className   = "col-q";
      tdA.className   = "col-a";
      tdQ.textContent = row.q;
      tdA.textContent = row.a;
      tr.appendChild(tdQ);
      tr.appendChild(tdA);
      refTableBody.appendChild(tr);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  buildRefTable();
  loadRound(0);
})();
