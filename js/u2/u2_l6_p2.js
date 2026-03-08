// ../../../../js/u2/u2_l6_p2.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/l6/",
    totalRounds: 8,
    feedbackMs: 650,
  };

  const ITEMS = [
    { key: "pen",        img: "u2.l6.p1.pen.jpg",        audio: "u2.l6.p1.pen.mp3" },
    { key: "book",       img: "u2.l6.p1.book.jpg",       audio: "u2.l6.p1.book.mp3" },
    { key: "desk",       img: "u2.l6.p1.desk.jpg",       audio: "u2.l6.p1.desk.mp3" },
    { key: "laptop",     img: "u2.l6.p1.laptop.jpg",     audio: "u2.l6.p1.laptop.mp3" },
    { key: "chair",      img: "u2.l6.p1.chair.jpg",      audio: "u2.l6.p1.chair.mp3" },
    { key: "backpack",   img: "u2.l6.p1.bag.jpg",    audio: "u2.l6.p1.bag.mp3" }, // your filename
    { key: "dictionary", img: "u2.l6.p1.dictionary.jpg", audio: "u2.l6.p1.dictionary.mp3" },
    { key: "globe",      img: "u2.l6.p1.globe.jpg",      audio: "u2.l6.p1.globe.mp3" },
  ];

  // ===== DOM =====
  const mainImg = document.getElementById("mainImg");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const playBtn = document.getElementById("playBtn");
  const statusEl = document.getElementById("status");
  const progNowEl = document.getElementById("progNow");
  const progTotalEl = document.getElementById("progTotal");
  const nextBtn = document.getElementById("nextBtn");

  // ===== UI TEXT (language-neutral JS) =====
  const uiSource = document.getElementById("uiText");
  const d = uiSource?.dataset || {};

  const UI = {
    statusReady:      d.statusReady      || "Press Play, then YES / NO.",
    statusPlaying:    d.statusPlaying    || "Playing...",
    statusAnswer:     d.statusAnswer     || "Now answer: YES or NO.",
    statusPlayFirst:  d.statusPlayFirst  || "Press Play first 🙂",
    statusBlocked:    d.statusBlocked    || "Audio blocked. Try again or answer.",
    statusCorrect:    d.statusCorrect    || "✅ Correct!",
    statusWrong:      d.statusWrong      || "❌ Try again. Press Replay.",
    statusDone:       d.statusDone       || "✅ Excellent!",
    playLabel:        d.playLabel        || "▶ Play",
    replayLabel:      d.replayLabel      || "▶ Replay",
  };

  // Progress step navigation
  document.querySelectorAll(".step").forEach(step => {
    step.addEventListener("click", () => {
      const go = step.getAttribute("data-go");
      if (go) window.location.href = go;
    });
  });

  progTotalEl.textContent = String(CONFIG.totalRounds);

  // ===== Audio =====
  const audio = new Audio();
  audio.preload = "auto";

  const safePlay = async () => {
    try {
      await audio.play();
      return true;
    } catch (e) {
      console.warn("Play blocked:", e);
      return false;
    }
  };

  const setLocked = (locked) => {
    yesBtn.disabled = locked;
    noBtn.disabled = locked;
    playBtn.disabled = locked;
  };

  const randInt = (max) => Math.floor(Math.random() * max);

  // ===== State =====
  let round = 1;
  let current = null; // { imgItem, audioItem, isMatch }
  let hasPlayedThisRound = false;

  const pickRound = () => {
    const imgItem = ITEMS[randInt(ITEMS.length)];
    const wantMatch = Math.random() < 0.5;

    let audioItem = imgItem;
    if (!wantMatch) {
      do {
        audioItem = ITEMS[randInt(ITEMS.length)];
      } while (audioItem.key === imgItem.key);
    }

    return {
      imgItem,
      audioItem,
      isMatch: (audioItem.key === imgItem.key),
    };
  };

  const renderRound = () => {
    progNowEl.textContent = String(round);

    current = pickRound();
    hasPlayedThisRound = false;

    mainImg.src = CONFIG.IMG_BASE + current.imgItem.img;
    mainImg.alt = current.imgItem.key;

    audio.src = CONFIG.AUDIO_BASE + current.audioItem.audio;
    audio.currentTime = 0;

    statusEl.textContent = UI.statusReady;
    playBtn.textContent = UI.playLabel;

    // Lock YES/NO until at least one play
    yesBtn.disabled = true;
    noBtn.disabled = true;
    playBtn.disabled = false;
  };

  const finish = () => {
    statusEl.textContent = UI.statusDone;
    nextBtn.classList.remove("hidden");
    setLocked(false);
  };

  const goNextRound = () => {
    if (round >= CONFIG.totalRounds) {
      finish();
      return;
    }
    round += 1;
    renderRound();
  };

  // ===== Events =====
  playBtn.addEventListener("click", async () => {
    if (!current) return;

    setLocked(true);
    statusEl.textContent = UI.statusPlaying;
    audio.currentTime = 0;
    audio.onended = null;

    const ok = await safePlay();
    if (!ok) {
      statusEl.textContent = UI.statusBlocked;
      hasPlayedThisRound = true;
      yesBtn.disabled = false;
      noBtn.disabled = false;
      playBtn.disabled = false;
      return;
    }

    audio.onended = () => {
      hasPlayedThisRound = true;
      statusEl.textContent = UI.statusAnswer;
      playBtn.textContent = UI.replayLabel;

      yesBtn.disabled = false;
      noBtn.disabled = false;
      playBtn.disabled = false;
    };
  });

  const handleAnswer = (userSaysYes) => {
    if (!current) return;

    if (!hasPlayedThisRound) {
      statusEl.textContent = UI.statusPlayFirst;
      return;
    }

    const correct = (userSaysYes === current.isMatch);

    if (correct) {
      statusEl.textContent = UI.statusCorrect;
      setLocked(true);
      setTimeout(() => {
        setLocked(false);
        goNextRound();
      }, CONFIG.feedbackMs);
    } else {
      statusEl.textContent = UI.statusWrong;
      yesBtn.disabled = false;
      noBtn.disabled = false;
      playBtn.disabled = false;
    }
  };

  yesBtn.addEventListener("click", () => handleAnswer(true));
  noBtn.addEventListener("click", () => handleAnswer(false));

  // Start
  renderRound();
})();