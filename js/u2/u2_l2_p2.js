// u2_l2_p2.js
// - Mobile friendly
// - No auto-advance after SHE/HE audio (user can replay)
// - "Next ▶" advances rounds 1→2→3→4
// - On round 4: after BOTH audios are played, "Siguiente →" unlocks immediately
//   and "Next ▶" hides (no extra click needed).

(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/",
    totalRounds: 4,
    gapMs: 650
  };

  const HE = [
    { img: "u2.l2.p2.man.bedroom.jpg",  audio1: "u2.l2.p2.he.mp3",  audio2: "u2.l2.p2.bedroom.mp3",  place: "bedroom"  },
    { img: "u2.l2.p2.man.garage.jpg",   audio1: "u2.l2.p2.he1.mp3", audio2: "u2.l2.p2.garage.mp3",   place: "garage"   },
    { img: "u2.l2.p2.man.bathroom.jpg", audio1: "u2.l2.p2.he.mp3",  audio2: "u2.l2.p2.bathroom.mp3", place: "bathroom" },
    { img: "u2.l2.p2.man.attic.jpg",    audio1: "u2.l2.p2.he1.mp3", audio2: "u2.l2.p2.attic.mp3",    place: "attic"    }
  ];

  const SHE = [
    { img: "u2.l2.p2.woman.kitchen.jpg",    audio1: "u2.l2.p2.she.mp3",  audio2: "u2.l2.p2.kitchen.mp3",    place: "kitchen"     },
    { img: "u2.l2.p2.woman.yard.jpg",       audio1: "u2.l2.p2.she1.mp3", audio2: "u2.l2.p2.yard.mp3",       place: "yard"        },
    { img: "u2.l2.p2.woman.livingroom.jpg", audio1: "u2.l2.p2.she1.mp3", audio2: "u2.l2.p2.livingroom.mp3", place: "living room" },
    { img: "u2.l2.p2.woman.basement.jpg",   audio1: "u2.l2.p2.she.mp3",  audio2: "u2.l2.p2.basement.mp3",   place: "basement"    }
  ];

  // DOM
  const heBox = document.getElementById("heBox");
  const sheBox = document.getElementById("sheBox");
  const heImg = document.getElementById("heImg");
  const sheImg = document.getElementById("sheImg");
  const hePlayBtn = document.getElementById("hePlayBtn");
  const shePlayBtn = document.getElementById("shePlayBtn");
  const heQA = document.getElementById("heQA");
  const sheQA = document.getElementById("sheQA");
  const roundNowEl = document.getElementById("roundNow");
  const nextBtn = document.getElementById("nextBtn");             // Siguiente → (to p3)
  const roundNextBtn = document.getElementById("roundNextBtn");   // Next ▶ (per-round)

  if (
    !heBox || !sheBox || !heImg || !sheImg ||
    !hePlayBtn || !shePlayBtn ||
    !heQA || !sheQA ||
    !roundNowEl || !nextBtn || !roundNextBtn
  ) return;

  // Progress dots navigation
  document.querySelectorAll(".step").forEach(step => {
    step.addEventListener("click", () => {
      const page = step.getAttribute("data-page");
      if (page) window.location.href = page;
    });
  });

  // Helpers
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  async function playSequence(audioFile1, audioFile2) {
    const a1 = new Audio(CONFIG.AUDIO_BASE + audioFile1);
    const a2 = new Audio(CONFIG.AUDIO_BASE + audioFile2);

    // play prompt (Where is he/she?)
    await a1.play();
    await new Promise((resolve) => {
      a1.addEventListener("ended", resolve, { once: true });
      a1.addEventListener("error", resolve, { once: true });
    });

    await sleep(CONFIG.gapMs);

    // play answer (location)
    await a2.play();
    await new Promise((resolve) => {
      a2.addEventListener("ended", resolve, { once: true });
      a2.addEventListener("error", resolve, { once: true });
    });
  }

  // State
  let round = 0;
  let playedHe = false;
  let playedShe = false;
  let lock = false;

  const heOrder = shuffle(HE);
  const sheOrder = shuffle(SHE);

  function setPageNextEnabled(enabled) {
    if (!enabled) {
      nextBtn.style.opacity = "0.5";
      nextBtn.style.pointerEvents = "none";
    } else {
      nextBtn.style.opacity = "";
      nextBtn.style.pointerEvents = "";
    }
  }

  function setRoundNextEnabled(enabled) {
    roundNextBtn.disabled = !enabled;
  }

  function showRoundNext() {
    roundNextBtn.style.display = "";
  }

  function hideRoundNext() {
    roundNextBtn.style.display = "none";
  }

  function renderQA() {
    const heItem = heOrder[round];
    const sheItem = sheOrder[round];

    // EN text for now (if you want fully language-neutral later, we can template from HTML)
    heQA.innerHTML = `
      <div class="q">Where is <span class="hl-he">he</span>?</div>
      <div class="a"><span class="hl-he">He</span> <span class="hl-is">is</span> in the ${heItem.place}.</div>
    `;
    sheQA.innerHTML = `
      <div class="q">Where is <span class="hl-she">she</span>?</div>
      <div class="a"><span class="hl-she">She</span> <span class="hl-is">is</span> in the ${sheItem.place}.</div>
    `;
  }

  function updateRoundUI() {
    roundNowEl.textContent = String(round + 1);

    heBox.classList.remove("played");
    sheBox.classList.remove("played");
    playedHe = false;
    playedShe = false;

    const heItem = heOrder[round];
    const sheItem = sheOrder[round];

    heImg.src = CONFIG.IMG_BASE + heItem.img;
    sheImg.src = CONFIG.IMG_BASE + sheItem.img;
    heImg.alt = "He";
    sheImg.alt = "She";

    renderQA();

    // Reset buttons for a new round
    showRoundNext();
    setRoundNextEnabled(false);

    // Siguiente stays locked until last round completed
    setPageNextEnabled(false);
  }

  function unlockContinueToP3() {
    hideRoundNext();
    setPageNextEnabled(true);
    nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function checkAfterPlayedBoth() {
    if (!(playedHe && playedShe)) return;

    // If this is the last round, unlock Siguiente immediately (no extra click)
    if (round === CONFIG.totalRounds - 1) {
      unlockContinueToP3();
      return;
    }

    // Otherwise allow user to go to the next round
    setRoundNextEnabled(true);
  }

  async function onPlayHe() {
    if (lock) return;
    lock = true;
    try {
      const item = heOrder[round];
      await playSequence(item.audio1, item.audio2);
      playedHe = true;
      heBox.classList.add("played");
      checkAfterPlayedBoth();
    } finally {
      lock = false;
    }
  }

  async function onPlayShe() {
    if (lock) return;
    lock = true;
    try {
      const item = sheOrder[round];
      await playSequence(item.audio1, item.audio2);
      playedShe = true;
      sheBox.classList.add("played");
      checkAfterPlayedBoth();
    } finally {
      lock = false;
    }
  }

  function onRoundNext() {
    // Only move forward if both audios played (round 1-3)
    if (!(playedHe && playedShe)) return;

    // If last round, we already unlock automatically; no action needed
    if (round === CONFIG.totalRounds - 1) return;

    round += 1;
    updateRoundUI();
  }

  // Click image OR play button (replay allowed)
  hePlayBtn.addEventListener("click", onPlayHe);
  heImg.addEventListener("click", onPlayHe);

  shePlayBtn.addEventListener("click", onPlayShe);
  sheImg.addEventListener("click", onPlayShe);

  roundNextBtn.addEventListener("click", onRoundNext);

  // Init
  updateRoundUI();
})();