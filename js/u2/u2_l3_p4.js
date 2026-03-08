// ../../../../js/u2/u2_l3_p4.js
(() => {
  const CONFIG = {
    AUDIO_BASE: "../../../../assets/audio/u2/",
    CORRECT_AUDIO: "correct.mp3",
    correctGapMs: 120
  };

  const BASE_EXERCISES = [
    // SHE
    { audio: "u2.l3.p2.she.supermarket.mp3", subject: "SHE", place: "supermarket" },
    { audio: "u2.l3.p2.restaurant.mp3",      subject: "SHE", place: "restaurant"  },
    { audio: "u2.l3.p2.office.mp3",          subject: "SHE", place: "office"      },
    { audio: "u2.l3.p2.park.mp3",            subject: "SHE", place: "park"        },
    { audio: "u2.l3.p2.library2.mp3",        subject: "SHE", place: "library"     },

    // HE
    { audio: "u2.l3.p2.He.library3.mp3",     subject: "HE",  place: "library"       },
    { audio: "u2.l3.p2.movietheatre.mp3",    subject: "HE",  place: "movie theater" },
    { audio: "u2.l3.p2.supermarket.mp3",     subject: "HE",  place: "supermarket"   },
    { audio: "u2.l3.p2.office2.mp3",         subject: "HE",  place: "office"        },
    { audio: "u2.l3.p2.bank.mp3",            subject: "HE",  place: "bank"          },

    // I
    { audio: "u2.l3.p3.Iam.restaurant.mp3",  subject: "I",   place: "restaurant"    },
    { audio: "u2.l3.p3.Iam.movie.mp3",       subject: "I",   place: "movie theater" },
    { audio: "u2.l3.p3.Iam.supermarket.mp3", subject: "I",   place: "supermarket"   },
    { audio: "u2.l3.p3.Iam.office.mp3",      subject: "I",   place: "office"        },
    { audio: "u2.l3.p3.Iam.library.mp3",     subject: "I",   place: "library"       }
  ];

  const ALL_PLACES = ["restaurant", "office", "supermarket", "park", "library", "movie theater", "bank"];
  const SUBJECT_TILES = ["I am", "He is", "She is"];
  const CONNECTOR_TILE = "at the";

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickDistractors(correctPlace, n = 1) {
    const pool = ALL_PLACES.filter(p => p !== correctPlace);
    shuffleInPlace(pool);
    return pool.slice(0, n);
  }

  function subjectText(subject) {
    if (subject === "I") return "I am";
    if (subject === "HE") return "He is";
    return "She is";
  }

  // Shuffle exercises
  const EXERCISES = BASE_EXERCISES.map(x => ({ ...x }));
  shuffleInPlace(EXERCISES);
  const total = EXERCISES.length;

  // Elements
  const steps = Array.from(document.querySelectorAll(".step"));
  const playBtn = document.getElementById("playBtn");
  const replayBtn = document.getElementById("replayBtn");
  const statusText = document.getElementById("statusText");
  const roundPill = document.getElementById("roundPill");

  const slot1 = document.getElementById("slot1");
  const slot2 = document.getElementById("slot2");
  const slot3 = document.getElementById("slot3");

  const tiles = [
    document.getElementById("t1"),
    document.getElementById("t2"),
    document.getElementById("t3"),
    document.getElementById("t4"),
    document.getElementById("t5"),
    document.getElementById("t6")
  ];

  const clearBtn = document.getElementById("clearBtn");
  const checkBtn = document.getElementById("checkBtn");
  const nextBtn = document.getElementById("nextBtn");

  const msgPlayFirst = document.getElementById("msgPlayFirst");
  const msgPickSlot = document.getElementById("msgPickSlot");
  const msgIncomplete = document.getElementById("msgIncomplete");
  const msgCorrect = document.getElementById("msgCorrect");
  const msgWrong = document.getElementById("msgWrong");

  // Audio
  const audioSentence = new Audio();
  audioSentence.preload = "auto";

  const audioCorrect = new Audio();
  audioCorrect.preload = "auto";
  audioCorrect.src = CONFIG.AUDIO_BASE + CONFIG.CORRECT_AUDIO;

  // State
  let idx = 0;
  let hasPlayed = false;
  let locked = false;
  let isAdvancing = false;

  let selection = { s1: "", s2: "", s3: "" };
  let selectedTileText = null;

  function hideMsgs() {
    [msgPlayFirst, msgPickSlot, msgIncomplete, msgCorrect, msgWrong].forEach(el => el.classList.add("hidden"));
  }

  function stopAllAudio() {
    try { audioSentence.pause(); audioSentence.currentTime = 0; } catch (_) {}
    try { audioCorrect.pause(); audioCorrect.currentTime = 0; } catch (_) {}
  }

  function setCounter() {
    const shown = Math.min(idx + 1, total);
    roundPill.textContent = `${shown}/${total}`;
  }

  function setSlotsEmptyUI() {
    selection = { s1: "", s2: "", s3: "" };

    // visually empty but still clickable
    slot1.innerHTML = "&nbsp;";
    slot2.innerHTML = "&nbsp;";
    slot3.innerHTML = "&nbsp;";

    [slot1, slot2, slot3].forEach(s => {
      s.classList.remove("filled", "wrong", "correct");
    });
  }

  function clearTileSelectionUI() {
    selectedTileText = null;
    tiles.forEach(t => t.classList.remove("selected"));
  }

  function enableTiles(enable) {
    tiles.forEach(t => (t.disabled = !enable));
  }

  function enableCheck(enable) {
    checkBtn.disabled = !enable;
  }

  function rebuildTileBank(ex) {
    const [d1] = pickDistractors(ex.place, 1);
    const list = ["I am", "He is", "She is", CONNECTOR_TILE, ex.place, d1];
    shuffleInPlace(list);

    tiles.forEach((btn, i) => {
      btn.textContent = list[i] || "";
      btn.disabled = true; // will enable after Play
      btn.classList.remove("selected");
    });
  }

  function resetUIForRound() {
    hideMsgs();
    locked = false;
    hasPlayed = false;
    isAdvancing = false;

    statusText.textContent = "Play";
    nextBtn.classList.add("hidden");

    clearTileSelectionUI();
    setSlotsEmptyUI();

    enableTiles(false);
    enableCheck(false);

    playBtn.disabled = false;
    replayBtn.disabled = false;
    clearBtn.disabled = false;
  }

  function loadRound(i) {
    resetUIForRound();
    setCounter();

    const ex = EXERCISES[i];
    audioSentence.src = CONFIG.AUDIO_BASE + ex.audio;
    audioSentence.currentTime = 0;

    rebuildTileBank(ex);
  }

  function playSentence() {
    hideMsgs();
    stopAllAudio();

    statusText.textContent = "Playing…";
    hasPlayed = true;

    audioSentence.play().catch(() => {});
    enableTiles(true);
  }

  audioSentence.addEventListener("ended", () => {
    statusText.textContent = "Play";
  });

  function isValidForSlot(slotNum, text) {
    if (slotNum === 1) return SUBJECT_TILES.includes(text);
    if (slotNum === 2) return text === CONNECTOR_TILE;
    if (slotNum === 3) return ALL_PLACES.includes(text);
    return false;
  }

  function setSlotValue(slotNum, text) {
    const el = slotNum === 1 ? slot1 : slotNum === 2 ? slot2 : slot3;
    if (slotNum === 1) selection.s1 = text;
    if (slotNum === 2) selection.s2 = text;
    if (slotNum === 3) selection.s3 = text;

    el.textContent = text;
    el.classList.add("filled");
  }

  function onTileClick(btn) {
    if (locked || isAdvancing) return;
    hideMsgs();

    if (!hasPlayed) {
      msgPlayFirst.classList.remove("hidden");
      return;
    }

    const text = btn.textContent;
    if (!text) return;

    if (selectedTileText === text) {
      clearTileSelectionUI();
      return;
    }

    tiles.forEach(t => t.classList.remove("selected"));
    btn.classList.add("selected");
    selectedTileText = text;
  }

  function onSlotClick(slotNum) {
    if (locked || isAdvancing) return;
    hideMsgs();

    if (!hasPlayed) {
      msgPlayFirst.classList.remove("hidden");
      return;
    }

    if (!selectedTileText) {
      msgPickSlot.classList.remove("hidden");
      return;
    }

    if (!isValidForSlot(slotNum, selectedTileText)) {
      msgWrong.classList.remove("hidden");
      window.setTimeout(() => msgWrong.classList.add("hidden"), 650);
      return;
    }

    setSlotValue(slotNum, selectedTileText);
    clearTileSelectionUI();

    const complete = selection.s1 && selection.s2 && selection.s3;
    enableCheck(complete);
  }

  function clearAll() {
    if (locked || isAdvancing) return;
    hideMsgs();
    clearTileSelectionUI();
    setSlotsEmptyUI();
    enableCheck(false);
  }

  function lockAllUI() {
    locked = true;
    enableTiles(false);
    playBtn.disabled = true;
    replayBtn.disabled = true;
    clearBtn.disabled = true;
    checkBtn.disabled = true;
    clearTileSelectionUI();
  }

  function markSlots(ok) {
    [slot1, slot2, slot3].forEach(s => {
      s.classList.remove("wrong", "correct");
      s.classList.add(ok ? "correct" : "wrong");
    });
  }

  function playAudioOnce(audioObj) {
    return new Promise(resolve => {
      try {
        audioObj.currentTime = 0;
        const done = () => resolve();
        audioObj.addEventListener("ended", done, { once: true });
        audioObj.play().catch(() => resolve());
      } catch (_) {
        resolve();
      }
    });
  }

  async function handleCorrectFlow() {
    // Guard: cannot run twice
    if (isAdvancing) return;
    isAdvancing = true;

    lockAllUI();
    stopAllAudio();

    // Correct! → small gap → replay sentence → advance
    await playAudioOnce(audioCorrect);
    await new Promise(r => setTimeout(r, CONFIG.correctGapMs));
    await playAudioOnce(audioSentence);

    idx += 1;
    if (idx >= total) {
      roundPill.textContent = `${total}/${total}`;
      nextBtn.classList.remove("hidden");
      statusText.textContent = "Play";
      return;
    }
    loadRound(idx);
  }

  function checkAnswer() {
    if (locked || isAdvancing) return;
    hideMsgs();

    if (!hasPlayed) {
      msgPlayFirst.classList.remove("hidden");
      return;
    }

    if (!(selection.s1 && selection.s2 && selection.s3)) {
      msgIncomplete.classList.remove("hidden");
      return;
    }

    const ex = EXERCISES[idx];
    const ok =
      selection.s1 === subjectText(ex.subject) &&
      selection.s2 === CONNECTOR_TILE &&
      selection.s3 === ex.place;

    if (ok) {
      msgCorrect.classList.remove("hidden");
      markSlots(true);
      handleCorrectFlow();
    } else {
      msgWrong.classList.remove("hidden");
      markSlots(false);
      window.setTimeout(() => {
        [slot1, slot2, slot3].forEach(s => s.classList.remove("wrong"));
      }, 700);
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
  playBtn.addEventListener("click", playSentence);
  replayBtn.addEventListener("click", playSentence);

  tiles.forEach(btn => btn.addEventListener("click", () => onTileClick(btn)));

  slot1.addEventListener("click", () => onSlotClick(1));
  slot2.addEventListener("click", () => onSlotClick(2));
  slot3.addEventListener("click", () => onSlotClick(3));

  clearBtn.addEventListener("click", clearAll);
  checkBtn.addEventListener("click", checkAnswer);

  // Init
  loadRound(idx);
})();