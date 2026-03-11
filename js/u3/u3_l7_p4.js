(() => {
  "use strict";

  const IMAGE_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l7/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const instrLine        = document.getElementById("instrLine");

  const refToggle        = document.getElementById("refToggle");
  const refToggleLabel   = document.getElementById("refToggleLabel");
  const refBody          = document.getElementById("refBody");
  const refThEn          = document.getElementById("refThEn");
  const refThEs          = document.getElementById("refThEs");
  const refTableBody     = document.getElementById("refTableBody");

  const paragraphBlock   = document.getElementById("paragraphBlock");
  const audioProgressWrap= document.getElementById("audioProgressWrap");
  const audioProgressFill= document.getElementById("audioProgressFill");
  const playBtn          = document.getElementById("playBtn");
  const playIcon         = document.getElementById("playIcon");
  const pauseIcon        = document.getElementById("pauseIcon");
  const playLabel        = document.getElementById("playLabel");

  const roundLabel       = document.getElementById("roundLabel");
  const exerciseBox      = document.getElementById("exerciseBox");
  const sentenceDisplay  = document.getElementById("sentenceDisplay");
  const tilesContainer   = document.getElementById("tilesContainer");
  const statusLine       = document.getElementById("statusLine");

  const endScreen        = document.getElementById("endScreen");
  const endTitle         = document.getElementById("endTitle");
  const endMsg1          = document.getElementById("endMsg1");
  const endMsg2          = document.getElementById("endMsg2");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:    "Lee el texto, escucha y completa los ejercicios.",
    audio:    "u3.l7.p4.story.mp3",
    refLabel: "📋 Palabras nuevas",
    colEn:    "English",
    colEs:    "Español",
    vocabRows: [
      { en: "everybody",  es: "todos"   },
      { en: "street",     es: "calle"   },
      { en: "neighbors",  es: "vecinos" }
    ],
    paragraph: [
      "Everybody on our street is very busy today.",
      "Mr. Davis is fixing his car in the garage.",
      "Mrs. Lopez is painting her bedroom.",
      "Carlos is feeding his cat.",
      "The cat is eating a fish.",
      "Mr. and Mrs. Patel are washing their clothes.",
      "Linda is cleaning her kitchen.",
      "And Tom and Sarah are playing baseball.",
      "Their dog is playing with a ball in the yard.",
      "I am busy, too.",
      "I am washing my car and I am watching all my neighbors.",
      "It is a very busy day on our street."
    ],
    play:     "Escuchar",
    pause:    "Pausar",
    resume:   "Continuar",
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
  const EXERCISES = [
    {
      template: ["Mr. Davis is ", "{0}", " his car in the garage."],
      answer:   "fixing",
      wrong:    ["washing", "painting"]
    },
    {
      template: ["Mrs. Lopez is painting ", "{0}", " bedroom."],
      answer:   "her",
      wrong:    ["his", "their"]
    },
    {
      template: ["Carlos is ", "{0}", " his cat."],
      answer:   "feeding",
      wrong:    ["fixing", "painting"]
    },
    {
      template: ["Mr. and Mrs. Patel ", "{0}", " washing their clothes."],
      answer:   "are",
      wrong:    ["is", "am"]
    },
    {
      template: ["Linda is ", "{0}", " her kitchen."],
      answer:   "cleaning",
      wrong:    ["washing", "playing"]
    },
    {
      template: ["Tom and Sarah are ", "{0}", " baseball."],
      answer:   "playing",
      wrong:    ["washing", "fixing"]
    },
    {
      template: ["I am washing ", "{0}", " car."],
      answer:   "my",
      wrong:    ["their", "her"]
    }
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  const TOTAL    = EXERCISES.length;
  let idx        = 0;
  let audio      = null;
  let isPlaying  = false;
  let isLocked   = false;
  let rafId      = null;
  let sentenceEls = [];   // <p> elements in paragraph

  // ── Helpers ───────────────────────────────────────────────────────────────
  function stopAudio() {
    if (!audio) return;
    try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    cancelAnimationFrame(rafId);
    isPlaying = false;
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

  // ── Icon swap ─────────────────────────────────────────────────────────────
  function showPlayIcon() {
    playIcon.style.display  = "";
    pauseIcon.style.display = "none";
    playLabel.textContent   = CONFIG.play;
  }

  function showPauseIcon() {
    playIcon.style.display  = "none";
    pauseIcon.style.display = "";
    playLabel.textContent   = CONFIG.pause;
  }

  function showResumeIcon() {
    playIcon.style.display  = "";
    pauseIcon.style.display = "none";
    playLabel.textContent   = CONFIG.resume;
  }

  // ── Highlight sentences ───────────────────────────────────────────────────
  // Divides audio duration evenly across sentences.
  // Called on every animation frame while audio plays.
  function updateHighlight() {
    if (!audio || audio.paused) return;

    const duration = audio.duration || 1;
    const current  = audio.currentTime;
    const count    = sentenceEls.length;
    const segLen   = duration / count;
    const activeIdx = Math.min(Math.floor(current / segLen), count - 1);

    sentenceEls.forEach((el, i) => {
      el.classList.remove("active", "done");
      if (i < activeIdx)  el.classList.add("done");
      if (i === activeIdx) el.classList.add("active");
    });

    // Update progress bar
    const pct = (current / duration) * 100;
    audioProgressFill.style.width = pct + "%";

    rafId = requestAnimationFrame(updateHighlight);
  }

  // ── Play / Pause toggle ───────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    if (!audio) {
      // First play
      audio = new Audio(AUDIO_BASE + CONFIG.audio);
      audioProgressWrap.classList.add("visible");

      audio.addEventListener("ended", () => {
        isPlaying = false;
        cancelAnimationFrame(rafId);
        audioProgressFill.style.width = "100%";
        // Clear highlights
        sentenceEls.forEach(el => {
          el.classList.remove("active");
          el.classList.add("done");
        });
        showPlayIcon();
        // Show exercises
        roundLabel.classList.remove("hidden");
        exerciseBox.classList.remove("hidden");
        loadExercise(0);
      });

      audio.play().catch(() => {});
      isPlaying = true;
      showPauseIcon();
      rafId = requestAnimationFrame(updateHighlight);
      return;
    }

    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      cancelAnimationFrame(rafId);
      showResumeIcon();
    } else {
      audio.play().catch(() => {});
      isPlaying = true;
      showPauseIcon();
      rafId = requestAnimationFrame(updateHighlight);
    }
  });

  // ── Build exercise ────────────────────────────────────────────────────────
  function buildExercise(ex) {
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
    sentenceEls = [];
    CONFIG.paragraph.forEach(sentence => {
      const p = document.createElement("p");
      p.textContent = sentence;
      paragraphBlock.appendChild(p);
      sentenceEls.push(p);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  buildRefTable();
  buildParagraph();
  showPlayIcon();
})();
