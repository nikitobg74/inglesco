// ../../../../js/u2/u2_l3_p2.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/",
    autoAdvanceMs: 650
  };

  // Base list (NOT shuffled here). We will shuffle at runtime.
  // We store "correctImg" as a filename so it remains correct even when we swap left/right.
  const BASE_ROUNDS = [
    {
      leftImg:  "u2.l2.p4.supermarket1.jpg",
      rightImg: "u2.l3.p2.supermarket.jpg",
      audio:    "u2.l3.p2.she.supermarket.mp3",
      correctImg: "u2.l3.p2.supermarket.jpg"
    },
    {
      leftImg:  "u2.l3.p2.man.restaurant1.jpg",
      rightImg: "u2.l3.p1.woman.restaurant1.jpg",
      audio:    "u2.l3.p2.restaurant.mp3",
      correctImg: "u2.l3.p1.woman.restaurant1.jpg"
    },
    {
      leftImg:  "u2.l3.p1.man.office1.jpg",
      rightImg: "u2.l2.p4.office1.jpg",
      audio:    "u2.l3.p2.office.mp3",
      correctImg: "u2.l2.p4.office1.jpg"
    },
    {
      leftImg:  "u2.l2.p4.office1.jpg",
      rightImg: "u2.l3.p1.man.office1.jpg",
      audio:    "u2.l3.p2.office2.mp3",
      correctImg: "u2.l3.p1.man.office1.jpg"
    },
    {
      leftImg:  "u2.l3.p1.man.bank1.jpg",
      rightImg: "u2.l2.p4.park1.jpg",
      audio:    "u2.l3.p2.park.mp3",
      correctImg: "u2.l2.p4.park1.jpg"
    },
    {
      leftImg:  "u2.l3.p1.woman.library1.jpg",
      rightImg: "u2.l2.p4.library1.jpg",
      audio:    "u2.l3.p2.He.library3.mp3",
      correctImg: "u2.l2.p4.library1.jpg"
    },
    {
      leftImg:  "u2.l2.p4.supermarket1.jpg",
      rightImg: "u2.l2.p4.movietheater1.jpg",
      audio:    "u2.l3.p2.movietheatre.mp3",
      correctImg: "u2.l2.p4.movietheater1.jpg"
    },
    {
      leftImg:  "u2.l2.p4.library1.jpg",
      rightImg: "u2.l2.p3.library.jpg",
      audio:    "u2.l3.p2.library2.mp3",
      correctImg: "u2.l2.p3.library.jpg"
    },
    {
      leftImg:  "u2.l2.p4.park1.jpg",
      rightImg: "u2.l3.p1.man.bank1.jpg",
      audio:    "u2.l3.p2.bank.mp3",
      correctImg: "u2.l3.p1.man.bank1.jpg"
    },
    {
      leftImg:  "u2.l3.p2.she.supermarket.jpg",
      rightImg: "u2.l2.p4.supermarket1.jpg",
      audio:    "u2.l3.p2.supermarket.mp3",
      correctImg: "u2.l2.p4.supermarket1.jpg"
    }
  ];

  // ---------- Helpers ----------
  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Build runtime rounds:
  // 1) shuffle order
  // 2) randomly swap left/right position per round
  function buildRounds() {
    const copy = BASE_ROUNDS.map(r => ({ ...r }));
    shuffleInPlace(copy);

    return copy.map(r => {
      const swap = Math.random() < 0.5;
      if (!swap) return { ...r };

      return {
        ...r,
        leftImg: r.rightImg,
        rightImg: r.leftImg
        // correctImg stays the same filename, so correctness is preserved
      };
    });
  }

  const ROUNDS = buildRounds();
  const total = ROUNDS.length;

  // ---------- Elements ----------
  const steps = Array.from(document.querySelectorAll(".step"));
  const playBtn = document.getElementById("playBtn");
  const replayBtn = document.getElementById("replayBtn");
  const statusText = document.getElementById("statusText");
  const roundPill = document.getElementById("roundPill");
  const nextBtn = document.getElementById("nextBtn");

  const leftBox = document.getElementById("leftBox");
  const rightBox = document.getElementById("rightBox");
  const leftImg = document.getElementById("leftImg");
  const rightImg = document.getElementById("rightImg");

  // Messages (Spanish lives in HTML only)
  const msgPlayFirst = document.getElementById("msgPlayFirst");
  const msgCorrect = document.getElementById("msgCorrect");
  const msgWrong = document.getElementById("msgWrong");

  // One audio object to prevent overlap
  const audio = new Audio();
  audio.preload = "auto";

  let idx = 0;
  let hasPlayed = false;
  let locked = false;

  function hideMsgs() {
    msgPlayFirst.classList.add("hidden");
    msgCorrect.classList.add("hidden");
    msgWrong.classList.add("hidden");
  }

  function stopAudio() {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (_) {}
  }

  function resetBoxes() {
    leftBox.classList.remove("correct", "wrong");
    rightBox.classList.remove("correct", "wrong");
    leftBox.classList.add("disabled");
    rightBox.classList.add("disabled");
    locked = false;
  }

  function enableBoxes() {
    leftBox.classList.remove("disabled");
    rightBox.classList.remove("disabled");
  }

  function setCounter() {
    const shown = Math.min(idx + 1, total);
    roundPill.textContent = `${shown}/${total}`;
  }

  function loadRound(i) {
    hideMsgs();
    hasPlayed = false;
    locked = false;

    const r = ROUNDS[i];

    leftImg.src = CONFIG.IMG_BASE + r.leftImg;
    rightImg.src = CONFIG.IMG_BASE + r.rightImg;

    audio.src = CONFIG.AUDIO_BASE + r.audio;
    audio.currentTime = 0;

    resetBoxes();
    setCounter();

    statusText.textContent = "Play";
    nextBtn.classList.add("hidden");
  }

  function play() {
    hideMsgs();
    stopAudio();
    statusText.textContent = "Playing…";

    audio.play().catch(() => {
      // language-neutral: no text here
    });

    hasPlayed = true;
    enableBoxes();
  }

  audio.addEventListener("ended", () => {
    statusText.textContent = "Play";
  });

  function choose(side) {
    if (locked) return;

    if (!hasPlayed) {
      hideMsgs();
      msgPlayFirst.classList.remove("hidden");
      return;
    }

    hideMsgs();
    leftBox.classList.remove("wrong");
    rightBox.classList.remove("wrong");

    const r = ROUNDS[idx];

    // Determine chosen filename
    const chosenFilename = (side === "left") ? r.leftImg : r.rightImg;

    if (chosenFilename === r.correctImg) {
      msgCorrect.classList.remove("hidden");
      locked = true;

      if (side === "left") leftBox.classList.add("correct");
      else rightBox.classList.add("correct");

      // Lock both
      leftBox.classList.add("disabled");
      rightBox.classList.add("disabled");

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
      if (side === "left") leftBox.classList.add("wrong");
      else rightBox.classList.add("wrong");
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

  leftBox.addEventListener("click", () => choose("left"));
  rightBox.addEventListener("click", () => choose("right"));

  leftBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") choose("left");
  });
  rightBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") choose("right");
  });

  // Init
  loadRound(idx);
})();