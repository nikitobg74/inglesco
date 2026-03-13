// ../../../../js/u4/u4_l1_p5.js
(() => {
  const AUDIO_BASE = "../../../../assets/audio/u4/l1/";
  const AUDIO_FILE = "u4.l1.p5.dialog.mp3";

  // ── Sentences for Phase 1 (read-along) ──────────────────────────────────
  // Timing: we spread 17 sentences across the audio.
  // We do NOT know exact duration yet, so we use proportional offsets (0–1).
  // JS will multiply by actual audio duration once metadata loads.
  // Adjust these fractions if highlighting feels off after testing.
  const SENTENCES = [
    "Everybody is busy today.",
    "Mrs. Rivera is at the restaurant.",
    "She is eating dinner.",
    "Mr. and Mrs. Chen are at the gym.",
    "They are exercising.",
    "Lisa and Tom are at the park.",
    "She is reading a book.",
    "He is listening to music.",
    "Carlos is at the laundromat.",
    "He is washing his clothes.",
    "Jenny is at the library.",
    "She is studying English.",
    "Mr. and Mrs. Molina are at the zoo.",
    "They are watching the monkeys.",
    "James is in the garage.",
    "He is fixing his car.",
    "And Sofia is at home. She is cleaning her windows.",
  ];

  // Proportional cue points (0.0 – 1.0) — one per sentence.
  // Evenly spaced as a safe default. Tune after hearing the audio.
  const CUE_FRACTIONS = [
    0.00, 0.06, 0.12, 0.18, 0.24,
    0.30, 0.35, 0.41, 0.47, 0.53,
    0.59, 0.64, 0.70, 0.76, 0.82,
    0.88, 0.93,
  ];

  // ── Gap data for Phase 2 ─────────────────────────────────────────────────
  // Each gap: { id, answer }
  // The paragraph is built as an array of segments: string | gap-object
  const PARA_SEGMENTS = [
    "Everybody is busy today. ",
    "Mrs. Rivera is at the restaurant. She is ", { id: 0, answer: "eating" }, " dinner. ",
    "Mr. and Mrs. Chen are at the gym. They are ", { id: 1, answer: "exercising" }, ". ",
    "Lisa and Tom are at the park. She is ", { id: 2, answer: "reading" }, " a book. ",
    "He is ", { id: 3, answer: "listening" }, " to music. ",
    "Carlos is at the laundromat. He is ", { id: 4, answer: "washing" }, " his clothes. ",
    "Jenny is at the library. She is ", { id: 5, answer: "studying" }, " English. ",
    "Mr. and Mrs. Molina are at the zoo. They are ", { id: 6, answer: "watching" }, " the monkeys. ",
    "James is in the garage. He is ", { id: 7, answer: "fixing" }, " his car. ",
    "And Sofia is at home. She is ", { id: 8, answer: "cleaning" }, " her windows.",
  ];

  const ANSWERS   = ["eating","exercising","reading","listening","washing","studying","watching","fixing","cleaning"];
  const DISTRACTORS = ["cooking","playing","sleeping"];
  const TOTAL_GAPS = ANSWERS.length;   // 9

  // ── Helpers ──────────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const phase1El   = document.getElementById("phase1");
  const phase2El   = document.getElementById("phase2");
  const playBtn    = document.getElementById("playBtn");
  const playLabel  = document.getElementById("playLabel");
  const readBar    = document.getElementById("readBar");
  const readPara   = document.getElementById("readPara");
  const phase1Hint = document.getElementById("phase1Hint");
  const clozePara  = document.getElementById("clozePara");
  const tileBank   = document.getElementById("tileBank");
  const scoreNum   = document.getElementById("scoreNum");
  const endScreen  = document.getElementById("endScreen");

  // ── PHASE 1 ──────────────────────────────────────────────────────────────
  const audio = new Audio(AUDIO_BASE + AUDIO_FILE);
  audio.preload = "metadata";

  let playPromise    = null;
  let isPlaying      = false;
  let cuePoints      = [];   // absolute seconds, filled once duration known
  let lastSentIdx    = -1;
  let highlightTimer = null;
  let audioDuration  = 0;

  // Build read-along paragraph
  function buildReadPara() {
    readPara.innerHTML = "";
    SENTENCES.forEach((text, i) => {
      const span = document.createElement("span");
      span.className = "sentence";
      span.id = "s" + i;
      span.textContent = text + " ";
      readPara.appendChild(span);
    });
  }

  function highlightSentence(idx) {
    SENTENCES.forEach((_, i) => {
      const el = document.getElementById("s" + i);
      if (!el) return;
      el.classList.remove("active", "done");
      if (i < idx)  el.classList.add("done");
      if (i === idx) el.classList.add("active");
    });
    // progress bar
    const pct = ((idx + 1) / SENTENCES.length) * 100;
    readBar.style.width = pct + "%";
  }

  function computeCuePoints(duration) {
    cuePoints = CUE_FRACTIONS.map(f => f * duration);
  }

  audio.addEventListener("loadedmetadata", () => {
    audioDuration = audio.duration;
    computeCuePoints(audioDuration);
  });

  audio.addEventListener("timeupdate", () => {
    if (!isPlaying || !cuePoints.length) return;
    const t = audio.currentTime;
    // find last cue that has passed
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
    isPlaying = false;
    playBtn.classList.remove("playing");
    playBtn.textContent = "▶";
    playLabel.textContent = "Escuchado ✓";
    readBar.style.width = "100%";
    // highlight last sentence as done
    highlightSentence(SENTENCES.length - 1);
    // transition to phase 2 after short pause
    setTimeout(startPhase2, 1400);
  });

  audio.addEventListener("error", () => {
    isPlaying = false;
    playBtn.classList.remove("playing");
    playBtn.textContent = "▶";
    playLabel.textContent = "Error de audio";
  });

  function stopAudio() {
    if (playPromise) {
      playPromise.then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => {});
      playPromise = null;
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
    isPlaying = false;
    lastSentIdx = -1;
    playBtn.classList.remove("playing");
    playBtn.textContent = "▶";
  }

  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      stopAudio();
      playLabel.textContent = "Toca para escuchar";
      return;
    }
    // If cue points not computed yet (metadata not loaded), compute now with default 40s
    if (!cuePoints.length) {
      computeCuePoints(audioDuration || 40);
    }
    audio.currentTime = 0;
    lastSentIdx = -1;
    isPlaying = true;
    playBtn.classList.add("playing");
    playBtn.textContent = "■";
    playLabel.textContent = "Escuchando...";
    phase1Hint.textContent = "Sigue el texto mientras escuchas.";

    playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => { playPromise = null; })
        .catch(err => {
          if (err.name !== "AbortError") {
            isPlaying = false;
            playBtn.classList.remove("playing");
            playBtn.textContent = "▶";
            playLabel.textContent = "No se pudo reproducir.";
          }
          playPromise = null;
        });
    }
  });

  // ── PHASE 2 ──────────────────────────────────────────────────────────────
  let selectedTile = null;
  let correctCount = 0;
  let gapEls = {};   // id → DOM element

  function startPhase2() {
    phase1El.style.display = "none";
    phase2El.style.display = "block";
    buildClozePara();
    buildTileBank();
  }

  function buildClozePara() {
    clozePara.innerHTML = "";
    PARA_SEGMENTS.forEach(seg => {
      if (typeof seg === "string") {
        clozePara.appendChild(document.createTextNode(seg));
      } else {
        const gap = document.createElement("span");
        gap.className = "gap";
        gap.dataset.id = seg.id;
        gap.dataset.answer = seg.answer;
        gap.textContent = seg.answer;   // sets natural width, hidden via color:transparent
        gap.style.color = "transparent";
        gap.addEventListener("click", () => handleGapClick(gap));
        gapEls[seg.id] = gap;
        clozePara.appendChild(gap);
      }
    });
  }

  function buildTileBank() {
    tileBank.innerHTML = "";
    const words = shuffle([...ANSWERS, ...DISTRACTORS]);
    words.forEach(word => {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.textContent = word;
      tile.dataset.word = word;
      tile.addEventListener("click", () => handleTileClick(tile));
      tileBank.appendChild(tile);
    });
  }

  function handleTileClick(tile) {
    if (tile.classList.contains("used")) return;

    // deselect if tapping same tile
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

    // If gap is already filled (wrong attempt sitting there), clear it
    if (gap.classList.contains("filled")) {
      clearGap(gap);
      return;
    }

    if (!selectedTile) {
      // Nudge: flash gap border
      gap.style.borderColor = "#f59e0b";
      setTimeout(() => { gap.style.borderColor = ""; }, 500);
      return;
    }

    placeInGap(gap);
  }

  function clearGap(gap) {
    // find the tile with this word and restore it
    const word = gap.textContent;
    const tile = [...tileBank.querySelectorAll(".tile")]
      .find(t => t.dataset.word === word);
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
    const chosen = selectedTile.dataset.word;
    const correct = gap.dataset.answer;

    gap.textContent = chosen;

    if (chosen === correct) {
      gap.classList.remove("filled", "wrong");
      gap.classList.add("correct");
      gap.style.color = "";   // reveal color from CSS .correct rule

      selectedTile.classList.add("used");
      selectedTile.classList.remove("selected");
      selectedTile = null;

      correctCount++;
      scoreNum.textContent = correctCount;

      if (correctCount === TOTAL_GAPS) {
        setTimeout(showEnd, 800);
      }
    } else {
      // wrong: show red, shake, return tile & reset gap
      gap.classList.add("filled", "wrong");
      gap.style.color = "#dc2626";

      selectedTile.classList.remove("selected");
      const returnedTile = selectedTile;
      selectedTile = null;

      setTimeout(() => {
        returnedTile.classList.remove("used");
        resetGap(gap);
      }, 650);
    }
  }

  function showEnd() {
    tileBank.style.display = "none";
    endScreen.classList.add("show");
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  buildReadPara();

})();
