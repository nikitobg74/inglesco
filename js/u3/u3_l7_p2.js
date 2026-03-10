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
  const refThQ         = document.getElementById("refThQ");
  const refThA         = document.getElementById("refThA");
  const refTableBody   = document.getElementById("refTableBody");

  const imgLeft        = document.getElementById("imgLeft");
  const imgRight       = document.getElementById("imgRight");
  const qLine          = document.getElementById("qLine");
  const aLine          = document.getElementById("aLine");

  const playBtn        = document.getElementById("playBtn");
  const playLabel      = document.getElementById("playLabel");
  const nextBtn        = document.getElementById("nextBtn");
  const nextLabel      = document.getElementById("nextLabel");

  const statusLine     = document.getElementById("statusLine");
  const endTitle       = document.getElementById("endTitle");
  const endMsg1        = document.getElementById("endMsg1");
  const endMsg2        = document.getElementById("endMsg2");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:      "Escucha y lee el diálogo.",
    refLabel:   "📋 Estructuras del diálogo",
    colQ:       "Pregunta",
    colA:       "Respuesta",
    vocabRows: [
      { q: "Is he busy?",           a: "Yes, he is."  },
      { q: "Is she busy?",          a: "Yes, she is." },
      { q: "Are they busy?",        a: "Yes, they are." },
      { q: "Are you busy?",         a: "Yes, I am. (yo soy)" },
      { q: "Are you busy?",         a: "Yes, we are. (nosotros)" }
    ],
    play:      "Escuchar",
    next:      "Siguiente",
    roundSep:  " / ",
    end: {
      title: "¡Muy bien!",
      msg1:  "Felicitaciones.",
      msg2:  "Terminaste la parte 2."
    }
  };

  // ── Rounds ────────────────────────────────────────────────────────────────
  // First round is always the example (not shuffled)
  const EXAMPLE_ROUND = {
    imageLeft:  "u3.l7.p2.busy2.jpg",
    imageRight: "u3.l7.p2.she.cooking.dinner.jpg",
    audio:      "u3.l7.p2.are.you.busy2.mp3",
    question:   "Are you busy?",
    answer:     "Yes, I am. I am cooking dinner."
  };

  const SHUFFLE_ROUNDS = [
    {
      imageLeft:  "u3.l7.p2.busy.jpg",
      imageRight: "u3.l7.p1.man.clean.apartment.jpg",
      audio:      "u3.l7.p2.man.clean.apartment.mp3",
      question:   "Is Carlos busy today?",
      answer:     "Yes, he is. He is cleaning his apartment."
    },
    {
      imageLeft:  "u3.l7.p2.busy.jpg",
      imageRight: "u3.l7.p1.she.feed.cat.jpg",
      audio:      "u3.l7.p2.she.feed.cat.mp3",
      question:   "Is Rosa busy today?",
      answer:     "Yes, she is. She is feeding her cat."
    },
    {
      imageLeft:  "u3.l7.p2.busy.jpg",
      imageRight: "u3.l7.p1.fix.tv.jpg",
      audio:      "u3.l7.p2.fix.tv.mp3",
      question:   "Are you busy today?",
      answer:     "Yes, we are. We are fixing our TV."
    },
    {
      imageLeft:  "u3.l7.p2.busy.jpg",
      imageRight: "u3.l7.p1.painting.bedroom.jpg",
      audio:      "u3.l7.p2.painting.bedroom.mp3",
      question:   "Are Pedro and Ana busy today?",
      answer:     "Yes, they are. They are painting their bedroom."
    },
    {
      imageLeft:  "u3.l7.p2.busy.jpg",
      imageRight: "u3.l7.p1.do.his.homework.jpg",
      audio:      "u3.l7.p2.do.his.homework.mp3",
      question:   "Is Tim busy today?",
      answer:     "Yes, he is. He is doing his homework."
    },
    {
      imageLeft:  "u3.l7.p2.busy.jpg",
      imageRight: "u3.l7.p1.she.wash.clothes.jpg",
      audio:      "u3.l7.p2.she.wash.clothes.mp3",
      question:   "Is Tracy busy today?",
      answer:     "Yes, she is. She is washing her clothes."
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

  const ROUNDS = [EXAMPLE_ROUND, ...shuffle(SHUFFLE_ROUNDS)];
  const TOTAL  = ROUNDS.length;
  let idx      = 0;
  let audio    = null;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function stopAudio() {
    if (!audio) return;
    try { audio.pause(); audio.currentTime = 0; } catch (e) {}
  }

  // ── Load round ────────────────────────────────────────────────────────────
  function loadRound(i) {
    idx = i;
    stopAudio();

    const round = ROUNDS[idx];
    roundLabel.textContent = `${idx + 1}${CONFIG.roundSep}${TOTAL}`;

    imgLeft.src  = IMAGE_BASE + round.imageLeft;
    imgLeft.alt  = "";
    imgRight.src = IMAGE_BASE + round.imageRight;
    imgRight.alt = "";

    qLine.textContent = round.question;
    aLine.textContent = round.answer;
    aLine.classList.remove("hidden");

    playLabel.textContent = CONFIG.play;
    nextLabel.textContent = CONFIG.next;

    playBtn.classList.remove("hidden");
    nextBtn.classList.add("hidden");
    statusLine.textContent = "";
  }

  // ── Play button ───────────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    stopAudio();
    const round = ROUNDS[idx];
    audio = new Audio(AUDIO_BASE + round.audio);

    const showNext = () => {
      playBtn.classList.add("hidden");
      nextBtn.classList.remove("hidden");
    };

    audio.onended = showNext;
    audio.play().catch(showNext);
  });

  // ── Next button ───────────────────────────────────────────────────────────
  nextBtn.addEventListener("click", () => {
    if (idx < TOTAL - 1) {
      loadRound(idx + 1);
    } else {
      finish();
    }
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
    refThQ.textContent         = CONFIG.colQ;
    refThA.textContent         = CONFIG.colA;
    refToggleLabel.textContent = CONFIG.refLabel;
    CONFIG.vocabRows.forEach(row => {
      const tr   = document.createElement("tr");
      const tdQ  = document.createElement("td");
      const tdA  = document.createElement("td");
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
