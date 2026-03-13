// ../../../../js/u4/u4_l1_p5.js
(() => {
  const AUDIO_BASE = "../../../../assets/audio/u4/l1/";
  const AUDIO_FILE = "u4.l1.p5.dialog.mp3";

  // ── Sentences grouped for mobile display ─────────────────────────────────
  // Each inner array = one visual card block
  const SENTENCE_GROUPS = [
    [
      "Everybody is busy today.",
      "Mrs. Rivera is at the restaurant.",
      "She is eating dinner.",
    ],
    [
      "Mr. and Mrs. Chen are at the gym.",
      "They are exercising.",
      "Lisa and Tom are at the park.",
      "She is reading a book.",
      "He is listening to music.",
    ],
    [
      "Carlos is at the laundromat.",
      "He is washing his clothes.",
      "Jenny is at the library.",
      "She is studying English.",
    ],
    [
      "Mr. and Mrs. Molina are at the zoo.",
      "They are watching the monkeys.",
    ],
    [
      "James is in the garage.",
      "He is fixing his car.",
      "And Sofia is at home.",
      "She is cleaning her windows.",
    ],
  ];

  // Flat list for highlighting (derived from groups)
  const SENTENCES = SENTENCE_GROUPS.flat();

  // Proportional cue fractions — one per sentence (17 total)
  // Evenly spaced; tune after hearing the audio
  const CUE_FRACTIONS = [
    0.00, 0.06, 0.12,
    0.18, 0.23, 0.29, 0.34, 0.40,
    0.46, 0.52, 0.57, 0.63,
    0.69, 0.75,
    0.81, 0.87, 0.93,
  ];

  // ── Phase 2 paragraph segments ────────────────────────────────────────────
  // Grouped to match read-along groups (same 5 blocks)
  const CLOZE_GROUPS = [
    [
      "Everybody is busy today. ",
      "Mrs. Rivera is at the restaurant. She is ", { id: 0, answer: "eating" }, " dinner. ",
    ],
    [
      "Mr. and Mrs. Chen are at the gym. They are ", { id: 1, answer: "exercising" }, ". ",
      "Lisa and Tom are at the park. She is ", { id: 2, answer: "reading" }, " a book. ",
      "He is ", { id: 3, answer: "listening" }, " to music. ",
    ],
    [
      "Carlos is at the laundromat. He is ", { id: 4, answer: "washing" }, " his clothes. ",
      "Jenny is at the library. She is ", { id: 5, answer: "studying" }, " English. ",
    ],
    [
      "Mr. and Mrs. Molina are at the zoo. They are ", { id: 6, answer: "watching" }, " the monkeys. ",
    ],
    [
      "James is in the garage. He is ", { id: 7, answer: "fixing" }, " his car. ",
      "And Sofia is at home. She is ", { id: 8, answer: "cleaning" }, " her windows.",
    ],
  ];

  // No distractors — exactly the 9 answer words
  const ANSWERS    = ["eating","exercising","reading","listening","washing","studying","watching","fixing","cleaning"];
  const TOTAL_GAPS = ANSWERS.length;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── DOM ───────────────────────────────────────────────────────────────────
  const phase1El   = document.getElementById("phase1");
  const phase2El   = document.getElementById("phase2");
  const playBtn    = document.getElementById("playBtn");
  const playLabel  = document.getElementById("playLabel");
  const readBar    = document.getElementById("readBar");
  const phase1Hint = document.getElementById("phase1Hint");
  const tileBank   = document.getElementById("tileBank");
  const scoreNum   = document.getElementById("scoreNum");
  const endScreen  = document.getElementById("endScreen");

  // ── PHASE 1: build grouped read-along ─────────────────────────────────────
  let sentenceIndex = 0;  // global index across groups

  function buildReadPara() {
    sentenceIndex = 0;
    SENTENCE_GROUPS.forEach((group, gi) => {
      const container = document.getElementById("pg" + gi);
      if (!container) return;
      container.innerHTML = "";
      group.forEach(text => {
        const span = document.createElement("span");
        span.className   = "sentence";
        span.id          = "s" + sentenceIndex;
        span.textContent = text + " ";
        container.appendChild(span);
        sentenceIndex++;
      });
    });
  }

  // ── Audio ─────────────────────────────────────────────────────────────────
  const audio = new Audio(AUDIO_BASE + AUDIO_FILE);
  audio.preload = "metadata";

  let playPromise   = null;
  let isPlaying     = false;
  let cuePoints     = [];
  let lastSentIdx   = -1;
  let audioDuration = 0;
  let audioFinished = false;

  function computeCuePoints(duration) {
    cuePoints = CUE_FRACTIONS.map(f => f * duration);
  }

  audio.addEventListener("loadedmetadata", () => {
    audioDuration = audio.duration;
    computeCuePoints(audioDuration);
  });

  function highlightSentence(idx) {
    SENTENCES.forEach((_, i) => {
      const el = document.getElementById("s" + i);
      if (!el) return;
      el.classList.remove("active", "done");
      if (i < idx)   el.classList.add("done");
      if (i === idx) el.classList.add("active");
    });
    readBar.style.width = ((idx + 1) / SENTENCES.length * 100) + "%";
  }

  audio.addEventListener("timeupdate", () => {
    if (!isPlaying || !cuePoints.length) return;
    const t = audio.currentTime;
    let idx = -1;
    for (let i = 0; i < cuePoints.length; i++) {
      if (t >= cuePoints[i]) idx = i;
    }
    if (idx !== lastSentIdx) {
      lastSentIdx = idx;
      if (idx >= 0) highlightSentence(idx);
    }
  });

  audio.addEventListener("ended", () => {
    isPlaying     = false;
    audioFinished = true;
    playBtn.classList.remove("playing");
    playBtn.textContent   = "▶";
    playLabel.textContent = "Escuchado ✓";
    readBar.style.width   = "100%";
    highlightSentence(SENTENCES.length - 1);
    setTimeout(startPhase2, 1400);
  });

  audio.addEventListener("error", () => {
    isPlaying = false;
    playBtn.classList.remove("playing");
    playBtn.textContent   = "▶";
    playLabel.textContent = "Error de audio";
  });

  function pauseAudio() {
    if (playPromise) {
      playPromise.then(() => { audio.pause(); }).catch(() => {});
      playPromise = null;
    } else {
      audio.pause();
    }
    isPlaying = false;
    playBtn.classList.remove("playing");
    playBtn.textContent   = "▶";
    playLabel.textContent = "Toca ▶ para continuar";
  }

  // ── Play / Pause toggle ───────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    if (isPlaying) { pauseAudio(); return; }

    if (!cuePoints.length) computeCuePoints(audioDuration || 40);

    if (audioFinished) {
      audio.currentTime = 0;
      lastSentIdx   = -1;
      audioFinished = false;
      SENTENCES.forEach((_, i) => {
        const el = document.getElementById("s" + i);
        if (el) el.classList.remove("active", "done");
      });
      readBar.style.width = "0%";
    }

    isPlaying = true;
    playBtn.classList.add("playing");
    playBtn.textContent   = "⏸";
    playLabel.textContent = "Escuchando...";
    if (phase1Hint) phase1Hint.textContent = "Sigue el texto mientras escuchas.";

    playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => { playPromise = null; })
        .catch(err => {
          if (err.name !== "AbortError") {
            isPlaying = false;
            playBtn.classList.remove("playing");
            playBtn.textContent   = "▶";
            playLabel.textContent = "No se pudo reproducir.";
          }
          playPromise = null;
        });
    }
  });

  // ── PHASE 2 ───────────────────────────────────────────────────────────────
  let selectedTile = null;
  let correctCount = 0;
  const gapEls     = {};

  function startPhase2() {
    phase1El.style.display = "none";
    phase2El.style.display = "block";
    buildClozePara();
    buildTileBank();
  }

  function buildClozePara() {
    CLOZE_GROUPS.forEach((segments, gi) => {
      const container = document.getElementById("cg" + gi);
      if (!container) return;
      container.innerHTML = "";
      segments.forEach(seg => {
        if (typeof seg === "string") {
          container.appendChild(document.createTextNode(seg));
        } else {
          const gap = document.createElement("span");
          gap.className      = "gap";
          gap.dataset.id     = seg.id;
          gap.dataset.answer = seg.answer;
          gap.textContent    = seg.answer;   // sizes the box naturally
          gap.style.color    = "transparent";
          gap.addEventListener("click", () => handleGapClick(gap));
          gapEls[seg.id] = gap;
          container.appendChild(gap);
        }
      });
    });
  }

  function buildTileBank() {
    tileBank.innerHTML = "";
    shuffle(ANSWERS).forEach(word => {
      const tile = document.createElement("div");
      tile.className    = "tile";
      tile.textContent  = word;
      tile.dataset.word = word;
      tile.addEventListener("click", () => handleTileClick(tile));
      tileBank.appendChild(tile);
    });
  }

  function handleTileClick(tile) {
    if (tile.classList.contains("used")) return;
    if (selectedTile === tile) {
      tile.classList.remove("selected");
      selectedTile = null;
      return;
    }
    if (selectedTile) selectedTile.classList.remove("selected");
    selectedTile = tile;
    tile.classList.add("selected");
  }

  function handleGapClick(gap) {
    if (gap.classList.contains("correct")) return;
    if (gap.classList.contains("filled")) { clearGap(gap); return; }
    if (!selectedTile) {
      gap.style.borderColor = "#f59e0b";
      setTimeout(() => { gap.style.borderColor = ""; }, 500);
      return;
    }
    placeInGap(gap);
  }

  function clearGap(gap) {
    const word = gap.textContent;
    const tile = [...tileBank.querySelectorAll(".tile")].find(t => t.dataset.word === word);
    if (tile) tile.classList.remove("used", "selected");
    if (selectedTile && selectedTile.dataset.word === word) {
      selectedTile.classList.remove("selected");
      selectedTile = null;
    }
    resetGap(gap);
  }

  function resetGap(gap) {
    gap.classList.remove("filled", "wrong");
    gap.textContent = gap.dataset.answer;
    gap.style.color = "transparent";
  }

  function placeInGap(gap) {
    const chosen  = selectedTile.dataset.word;
    const correct = gap.dataset.answer;
    gap.textContent = chosen;

    if (chosen === correct) {
      gap.classList.remove("filled","wrong");
      gap.classList.add("correct");
      gap.style.color = "";

      selectedTile.classList.add("used");
      selectedTile.classList.remove("selected");
      selectedTile = null;

      correctCount++;
      scoreNum.textContent = correctCount;
      if (correctCount === TOTAL_GAPS) setTimeout(showEnd, 800);

    } else {
      gap.classList.add("filled","wrong");
      gap.style.color = "#dc2626";
      selectedTile.classList.remove("selected");
      const ret = selectedTile;
      selectedTile = null;
      setTimeout(() => { ret.classList.remove("used"); resetGap(gap); }, 650);
    }
  }

  function showEnd() {
    tileBank.style.display = "none";
    endScreen.classList.add("show");
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  buildReadPara();

})();
