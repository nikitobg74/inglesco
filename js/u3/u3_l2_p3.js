// u3_l2_p3.js
(() => {
  const IMG_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l2/";

  const app = document.getElementById("app");
  const sceneImg = document.getElementById("sceneImg");
  const playBtn = document.getElementById("playBtn");
  const audioEl = document.getElementById("audioEl");
  const questionText = document.getElementById("questionText");
  const promptEl = document.getElementById("prompt");
  const slotsEl = document.getElementById("slots");
  const tilesEl = document.getElementById("tiles");
  const resetBtn = document.getElementById("resetBtn");
  const feedbackEl = document.getElementById("feedback");
  const roundStatus = document.getElementById("roundStatus");
  const stepStatus = document.getElementById("stepStatus");
  const nextBtn = document.getElementById("nextBtn");

  // Hide check button if it exists in HTML (safe)
  const checkBtn = document.getElementById("checkBtn");
  if (checkBtn) checkBtn.style.display = "none";

  const UI = {
    correct: app.dataset.correctText || "Correct!",
    wrong: app.dataset.wrongText || "X",
    q1Text: app.dataset.q1Text || "Where are you?",
    q2Text: app.dataset.q2Text || "What are you doing?"
  };

  const Q_AUDIO = {
    where: "u3.l2.p2.whereareyou.mp3",
    doing: "u3.l2.p2.whatareyoudoing.mp3"
  };

  // Scenes + decoys
  // Each phase: target tokens + decoy tokens (2 is enough)
  const SCENES = [
    {
      img: "u3.l2.p3.kitchen.cooking.jpg",
      location: { target: ["We are", "in", "the kitchen."],  decoys: ["at", "the park."] },
      doing:    { target: ["We are", "cooking", "dinner."],   decoys: ["eating", "a movie."] }
    },
    {
      img: "u3.l2.p3.dining.eating.jpg",
      location: { target: ["We are", "in", "the dining room."], decoys: ["at", "the kitchen."] },
      doing:    { target: ["We are", "eating", "dinner."],      decoys: ["cooking", "cards."] }
    },
    {
      img: "u3.l2.p3.livingroom.cards.jpg",
      location: { target: ["We are", "in", "the living room."], decoys: ["in", "the bathroom."] },
      doing:    { target: ["We are", "playing", "cards."],      decoys: ["watching", "dinner."] }
    },
    {
      img: "u3.l2.p3.beach.ball.jpg",
      location: { target: ["We are", "at", "the beach."],  decoys: ["in", "the yard."] },
      doing:    { target: ["We are", "playing", "ball."],  decoys: ["watching", "a movie."] }
    },
    {
      img: "u3.l2.p3.movie.watch.jpg",
      location: { target: ["We are", "at", "the movie theater."], decoys: ["in", "the dining room."] },
      doing:    { target: ["We are", "watching", "a movie."],      decoys: ["playing", "cards."] }
    }
  ];

  let sceneIndex = 0;
  let phase = 0; // 0=location, 1=doing
  let autoplayAllowed = false;

  let target = [];
  let pool = [];
  let chosen = [];
  let locked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function setFeedback(kind) {
    if (kind === "ok") {
      feedbackEl.textContent = UI.correct;
      feedbackEl.className = "feedback ok";
    } else if (kind === "no") {
      feedbackEl.textContent = UI.wrong;
      feedbackEl.className = "feedback no";
    } else {
      feedbackEl.textContent = "";
      feedbackEl.className = "feedback";
    }
  }

  function setSlotsState(state) {
    // state: null | "ok" | "no"
    // apply visual state to ALL filled slots
    const slots = slotsEl.querySelectorAll(".slot");
    slots.forEach(s => {
      s.classList.remove("ok", "no");
      if (state === "ok") s.classList.add("ok");
      if (state === "no") s.classList.add("no");
    });
  }

  function loadAudio(filename) {
    audioEl.pause();
    audioEl.currentTime = 0;
    audioEl.src = AUDIO_BASE + filename;
  }

  async function playAudio() {
    try {
      await audioEl.play();
      autoplayAllowed = true;
    } catch (e) {}
  }

  function renderStatus() {
    roundStatus.textContent = `${sceneIndex + 1}/${SCENES.length}`;
    stepStatus.textContent = phase === 0 ? "Q1/2" : "Q2/2";
  }

  function renderQuestionUI() {
    if (phase === 0) {
      questionText.textContent = UI.q1Text;
      promptEl.textContent = "Forma la frase (lugar):";
      loadAudio(Q_AUDIO.where);
    } else {
      questionText.textContent = UI.q2Text;
      promptEl.textContent = "Forma la frase (acción):";
      loadAudio(Q_AUDIO.doing);
    }
  }

  function renderImage() {
    sceneImg.src = IMG_BASE + SCENES[sceneIndex].img;
  }

  function renderSlots() {
    slotsEl.innerHTML = "";

    for (let i = 0; i < target.length; i++) {
      const slot = document.createElement("div");
      slot.className = "slot";

      if (chosen[i]) {
        slot.textContent = chosen[i];
        slot.classList.add("filled");
        slot.addEventListener("click", () => {
          if (locked) return;
          removeChosenAt(i);
        });
      } else {
        slot.textContent = "____";
      }

      slotsEl.appendChild(slot);
    }
  }

  function renderTiles() {
    tilesEl.innerHTML = "";

    pool.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tile";
      btn.textContent = t;
      btn.disabled = locked || chosen.includes(t);

      btn.addEventListener("click", () => {
        if (locked) return;
        addTile(t);
      });

      tilesEl.appendChild(btn);
    });
  }

  function addTile(tileText) {
    if (chosen.length >= target.length) return;
    chosen.push(tileText);

    setFeedback(null);
    setSlotsState(null);
    renderSlots();
    renderTiles();

    // Grade only AFTER all slots are filled
    if (chosen.length === target.length) {
      gradeNow();
    }
  }

  function removeChosenAt(index) {
    chosen.splice(index, 1);

    setFeedback(null);
    setSlotsState(null);
    renderSlots();
    renderTiles();
  }

  function resetBuild() {
    if (locked) return;
    chosen = [];
    setFeedback(null);
    setSlotsState(null);
    renderSlots();
    renderTiles();
  }

  function isCorrectBuild() {
    for (let i = 0; i < target.length; i++) {
      if (chosen[i] !== target[i]) return false;
    }
    return true;
  }

  function lockUI(state) {
    locked = state;
    renderTiles();
  }

  function gradeNow() {
    lockUI(true);

    if (isCorrectBuild()) {
      setSlotsState("ok");
      setFeedback("ok");

      setTimeout(() => {
        lockUI(false);
        advance();
      }, 2000);
    } else {
      setSlotsState("no");
      setFeedback("no");
      // Stay on same item; allow correction by tapping slots
      lockUI(false);
    }
  }

  function advance() {
    if (phase === 0) {
      phase = 1;
      startPhase();
      if (autoplayAllowed) setTimeout(() => playAudio(), 250);
      return;
    }

    phase = 0;
    sceneIndex += 1;

    if (sceneIndex >= SCENES.length) {
      finish();
      return;
    }

    startPhase();
    if (autoplayAllowed) setTimeout(() => playAudio(), 250);
  }

  function startPhase() {
    nextBtn.classList.add("hidden");
    setFeedback(null);
    setSlotsState(null);
    lockUI(false);

    renderImage();
    renderQuestionUI();
    renderStatus();

    const s = SCENES[sceneIndex];
    const pack = (phase === 0) ? s.location : s.doing;

    target = pack.target.slice();
    pool = shuffle(pack.target.concat(pack.decoys));
    chosen = [];

    renderSlots();
    renderTiles();

    // NO autoplay on first question until user hits Play
  }

  function finish() {
    lockUI(true);
    playBtn.disabled = true;
    tilesEl.innerHTML = "";
    slotsEl.innerHTML = "";
    questionText.textContent = "";
    promptEl.textContent = "";
    setFeedback("ok");
    roundStatus.textContent = `${SCENES.length}/${SCENES.length}`;
    stepStatus.textContent = "Done";
    nextBtn.classList.remove("hidden");
  }

  // Play
  playBtn.addEventListener("click", () => {
    playAudio();
  });

  // Reset
  resetBtn.addEventListener("click", () => {
    resetBuild();
  });

  // Add slot coloring styles (inject small CSS safely)
  const style = document.createElement("style");
  style.textContent = `
    .slot.ok{ border:2px solid rgba(16,185,129,0.95) !important; background: rgba(16,185,129,0.12) !important; color:#065f46 !important; }
    .slot.no{ border:2px solid rgba(239,68,68,0.95) !important; background: rgba(239,68,68,0.10) !important; color:#991b1b !important; }
  `;
  document.head.appendChild(style);

  // Init
  startPhase();
})();