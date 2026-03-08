// ../../../../js/u2/u2_l3_p3.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/",
    autoAdvanceMs: 2000
  };

  // Exercise definitions (order will be shuffled at runtime)
  // correctLineType values: "SHE_AT", "HE_AT", "I_AT"
  const BASE_EXERCISES = [
    { audio: "u2.l3.p2.she.supermarket.mp3", correctWord: "supermarket", correctLineType: "SHE_AT" },
    { audio: "u2.l3.p2.restaurant.mp3",      correctWord: "restaurant",  correctLineType: "SHE_AT" },
    { audio: "u2.l3.p2.office.mp3",          correctWord: "office",      correctLineType: "SHE_AT" },
    { audio: "u2.l3.p2.park.mp3",            correctWord: "park",        correctLineType: "SHE_AT" },
    { audio: "u2.l3.p2.library2.mp3",        correctWord: "library",     correctLineType: "SHE_AT" },

    { audio: "u2.l3.p2.He.library3.mp3",     correctWord: "library",     correctLineType: "HE_AT" },
    { audio: "u2.l3.p2.movietheatre.mp3",    correctWord: "movie theater", correctLineType: "HE_AT" },
    { audio: "u2.l3.p2.supermarket.mp3",     correctWord: "supermarket", correctLineType: "HE_AT" },
    { audio: "u2.l3.p2.office2.mp3",         correctWord: "office",      correctLineType: "HE_AT" },
    { audio: "u2.l3.p2.bank.mp3",            correctWord: "bank",        correctLineType: "HE_AT" },

    { audio: "u2.l3.p3.Iam.restaurant.mp3",  correctWord: "restaurant",  correctLineType: "I_AT" },
    { audio: "u2.l3.p3.Iam.movie.mp3",       correctWord: "movie theater", correctLineType: "I_AT" },
    { audio: "u2.l3.p3.Iam.supermarket.mp3", correctWord: "supermarket", correctLineType: "I_AT" },
    { audio: "u2.l3.p3.Iam.office.mp3",      correctWord: "office",      correctLineType: "I_AT" },
    { audio: "u2.l3.p3.Iam.library.mp3",     correctWord: "library",     correctLineType: "I_AT" }
  ];

  const ALL_WORDS = ["restaurant", "office", "supermarket", "park", "library", "movie theater", "bank"];

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickTwoDistractors(correct) {
    const pool = ALL_WORDS.filter(w => w !== correct);
    shuffleInPlace(pool);
    return [pool[0], pool[1]];
  }

  function lineTextForType(type) {
    if (type === "I_AT") return "I am at the";
    if (type === "HE_AT") return "He is at the";
    return "She is at the";
  }

  // Build shuffled exercises
  const EXERCISES = BASE_EXERCISES.map(x => ({ ...x }));
  shuffleInPlace(EXERCISES);
  const total = EXERCISES.length;

  // ---------- Elements ----------
  const steps = Array.from(document.querySelectorAll(".step"));
  const playBtn = document.getElementById("playBtn");
  const replayBtn = document.getElementById("replayBtn");
  const statusText = document.getElementById("statusText");
  const roundPill = document.getElementById("roundPill");
  const nextBtn = document.getElementById("nextBtn");

  const lineA = document.getElementById("lineA");
  const lineB = document.getElementById("lineB");
  const lineC = document.getElementById("lineC");
  const textA = document.getElementById("textA");
  const textB = document.getElementById("textB");
  const textC = document.getElementById("textC");
  const blankA = document.getElementById("blankA");
  const blankB = document.getElementById("blankB");
  const blankC = document.getElementById("blankC");

  const word1 = document.getElementById("word1");
  const word2 = document.getElementById("word2");
  const word3 = document.getElementById("word3");

  // Messages (Spanish in HTML only)
  const msgPlayFirst = document.getElementById("msgPlayFirst");
  const msgPickWord = document.getElementById("msgPickWord");
  const msgCorrect = document.getElementById("msgCorrect");
  const msgWrong = document.getElementById("msgWrong");

  // One audio object (no overlap)
  const audio = new Audio();
  audio.preload = "auto";

  let idx = 0;
  let hasPlayed = false;
  let locked = false;

  let selectedWord = null;

  // Per-round mapping: A/B/C → lineType
  let mapping = null; // {A:"I_AT", B:"HE_AT", C:"SHE_AT"} shuffled each round

  function hideMsgs() {
    msgPlayFirst.classList.add("hidden");
    msgPickWord.classList.add("hidden");
    msgCorrect.classList.add("hidden");
    msgWrong.classList.add("hidden");
  }

  function stopAudio() {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (_) {}
  }

  function setCounter() {
    const shown = Math.min(idx + 1, total);
    roundPill.textContent = `${shown}/${total}`;
  }

  function resetUIForRound() {
    hideMsgs();
    selectedWord = null;

    // clear blanks
    blankA.textContent = "_____";
    blankB.textContent = "_____";
    blankC.textContent = "_____";

    // clear line colors
    [lineA, lineB, lineC].forEach(btn => {
      btn.classList.remove("correct", "wrong");
      btn.disabled = true;
    });

    // word buttons reset
    [word1, word2, word3].forEach(b => {
      b.classList.remove("selected");
      b.disabled = true;
    });

    locked = false;
    hasPlayed = false;

    nextBtn.classList.add("hidden");
    statusText.textContent = "Play";
  }

  function buildLineMapping() {
    const types = ["I_AT", "HE_AT", "SHE_AT"];
    shuffleInPlace(types);
    return { A: types[0], B: types[1], C: types[2] };
  }

  function applyLineMapping(map) {
    textA.textContent = lineTextForType(map.A);
    textB.textContent = lineTextForType(map.B);
    textC.textContent = lineTextForType(map.C);
  }

  function setWordBank(correctWord) {
    const [d1, d2] = pickTwoDistractors(correctWord);
    const words = [correctWord, d1, d2];
    shuffleInPlace(words);

    const buttons = [word1, word2, word3];
    buttons[0].textContent = words[0];
    buttons[1].textContent = words[1];
    buttons[2].textContent = words[2];

    buttons.forEach(btn => {
      btn.classList.remove("selected");
      btn.disabled = true;
    });
  }

  function enableInteractions() {
    // enable lines and word buttons
    [lineA, lineB, lineC].forEach(btn => (btn.disabled = false));
    [word1, word2, word3].forEach(btn => (btn.disabled = false));
  }

  function loadRound(i) {
    resetUIForRound();
    setCounter();

    const ex = EXERCISES[i];

    // audio
    audio.src = CONFIG.AUDIO_BASE + ex.audio;
    audio.currentTime = 0;

    // mapping for A/B/C
    mapping = buildLineMapping();
    applyLineMapping(mapping);

    // word bank
    setWordBank(ex.correctWord);
  }

  function play() {
    hideMsgs();
    stopAudio();
    statusText.textContent = "Playing…";

    audio.play().catch(() => {
      // language-neutral
    });

    hasPlayed = true;
    enableInteractions();
  }

  audio.addEventListener("ended", () => {
    statusText.textContent = "Play";
  });

  function selectWord(btn) {
    if (!hasPlayed || locked) return;

    [word1, word2, word3].forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedWord = btn.textContent;
  }

  function setBlankForLine(lineKey, word) {
    if (lineKey === "A") blankA.textContent = word;
    if (lineKey === "B") blankB.textContent = word;
    if (lineKey === "C") blankC.textContent = word;
  }

  function markLine(lineBtn, ok) {
    lineBtn.classList.remove("correct", "wrong");
    lineBtn.classList.add(ok ? "correct" : "wrong");
  }

  function lockAll() {
    locked = true;
    [lineA, lineB, lineC].forEach(btn => (btn.disabled = true));
    [word1, word2, word3].forEach(btn => (btn.disabled = true));
  }

  function handleChooseLine(lineKey) {
    if (locked) return;

    hideMsgs();

    if (!hasPlayed) {
      msgPlayFirst.classList.remove("hidden");
      return;
    }
    if (!selectedWord) {
      msgPickWord.classList.remove("hidden");
      return;
    }

    const ex = EXERCISES[idx];
    const chosenType = mapping[lineKey];

    // Fill the blank visually
    setBlankForLine(lineKey, selectedWord);

    const isCorrect = (selectedWord === ex.correctWord) && (chosenType === ex.correctLineType);

    const btn = (lineKey === "A") ? lineA : (lineKey === "B") ? lineB : lineC;

    if (isCorrect) {
      msgCorrect.classList.remove("hidden");
      markLine(btn, true);
      lockAll();

      window.setTimeout(() => {
        idx += 1;
        if (idx >= total) {
          roundPill.textContent = `${total}/${total}`;
          nextBtn.classList.remove("hidden");
          statusText.textContent = "Play";
          return;
        }
        loadRound(idx);
      }, CONFIG.autoAdvanceMs);

    } else {
      msgWrong.classList.remove("hidden");
      markLine(btn, false);

      // Optional: clear the wrong blank after a short moment to reduce confusion
      window.setTimeout(() => {
        if (lineKey === "A") blankA.textContent = "_____";
        if (lineKey === "B") blankB.textContent = "_____";
        if (lineKey === "C") blankC.textContent = "_____";
      }, 550);
    }
  }

  // Step navigation
  steps.forEach(step => {
    step.addEventListener("click", () => {
      const page = step.getAttribute("data-page");
      if (page) window.location.href = page;
    });
  });

  // Events
  playBtn.addEventListener("click", play);
  replayBtn.addEventListener("click", play);

  word1.addEventListener("click", () => selectWord(word1));
  word2.addEventListener("click", () => selectWord(word2));
  word3.addEventListener("click", () => selectWord(word3));

  lineA.addEventListener("click", () => handleChooseLine("A"));
  lineB.addEventListener("click", () => handleChooseLine("B"));
  lineC.addEventListener("click", () => handleChooseLine("C"));

  // Init
  loadRound(idx);
})();