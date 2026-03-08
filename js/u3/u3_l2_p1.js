// ../../../../js/u3/u3_l2_p1.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u3/",
    AUDIO_BASE: "../../../../assets/audio/u3/l2/",
    waitAfterCorrectMs: 2000
  };

  const $ = (id) => document.getElementById(id);

  const sceneImg   = $("sceneImg");
  const replayBtn  = $("replayBtn");
  const roundLabel = $("roundLabel");

  const line1 = $("line1");
  const line2 = $("line2");
  const line3 = $("line3");

  const qABox     = $("qABox");
  const qBBox     = $("qBBox");
  const qAText    = $("qAText");
  const qBText    = $("qBText");
  const qAOptions = $("qAOptions");
  const qBOptions = $("qBOptions");
  const qAStatus  = $("qAStatus");
  const qBStatus  = $("qBStatus");

  const feedbackOk = $("feedbackOk");
  const endScreen  = $("endScreen");

  const rounds = [
    {
      img: "u3.l2.p1.jones.jpg",
      audio: "u3.l2.p1.jones.mp3",
      lines: [
        "We are the Jones family.",
        "We are in the kitchen.",
        "And we are cooking dinner."
      ],
      A: { prompt: "We are in the _____.", options: ["park","kitchen","bedroom"], correct: "kitchen" },
      B: { prompt: "We are _____ dinner.", options: ["eating","cooking","watching"], correct: "cooking" }
    },
    {
      img: "u3.l2.p1.miller.jpg",
      audio: "u3.l2.p1.miller.mp3",
      lines: [
        "We are the Miller family.",
        "We are in the dining room.",
        "And we are eating dinner."
      ],
      A: { prompt: "We are in the _____.", options: ["kitchen","bedroom","dining room"], correct: "dining room" },
      B: { prompt: "We are _____ dinner.", options: ["eating","cooking","watching"], correct: "eating" }
    },
    {
      img: "u3.l2.p1.davis.jpg",
      audio: "u3.l2.p1.davis.mp3",
      lines: [
        "We are the Davis family.",
        "We are in the living room.",
        "And we are playing cards."
      ],
      A: { prompt: "We are in the _____.", options: ["bathroom","bedroom","living room"], correct: "living room" },
      B: { prompt: "We are _____ cards.", options: ["cooking","playing","watching"], correct: "playing" }
    },
    {
      img: "u3.l2.p1.martinez.jpg",
      audio: "u3.l2.p1.martinez.mp3",
      lines: [
        "We are the Martinez family.",
        "We are at the beach.",
        "And we are playing ball."
      ],
      A: { prompt: "We are at the _____.", options: ["bathroom","yard","beach"], correct: "beach" },
      B: { prompt: "We are _____ ball.", options: ["playing","cooking","watching"], correct: "playing" }
    },
    {
      img: "u3.l2.p1.barns.jpg",
      audio: "u3.l2.p1.barnes.mp3",
      lines: [
        "We are the Barnes family.",
        "We are at the movie theater.",
        "And we are watching a movie."
      ],
      A: { prompt: "We are at the _____.", options: ["beach","movie theater","dining room"], correct: "movie theater" },
      B: { prompt: "We are _____ a movie.", options: ["eating","cooking","watching"], correct: "watching" }
    }
  ];

  let idx = 0;
  let audio = new Audio();
  let locked = false;

  // Round 1 should require manual play.
  // Once the student presses play even once, we allow autoplay from then on.
  let firstRoundNeedsManualPlay = true;

  function safePlay() {
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }

  function setStatus(el, state) {
    el.classList.remove("ok","bad");
    el.textContent = "";
    if (state === "ok") { el.classList.add("ok"); el.textContent = "✓"; }
    if (state === "bad") { el.classList.add("bad"); el.textContent = "✖"; }
  }

  function clearFeedback() {
    feedbackOk.classList.add("hidden");
    setStatus(qAStatus, null);
    setStatus(qBStatus, null);
    qABox.style.borderColor = "transparent";
    qBBox.style.borderColor = "transparent";
  }

  function setAllDisabled(container, disabled) {
    [...container.querySelectorAll("button")].forEach(btn => { btn.disabled = disabled; });
  }

  function renderOptions(container, opts, correctValue, onPick) {
    container.innerHTML = "";
    opts.forEach((text) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "opt";
      b.textContent = text;
      b.addEventListener("click", () => onPick(b, text, correctValue));
      container.appendChild(b);
    });
  }

  function markWrong(btn) {
    btn.classList.add("wrong");
    setTimeout(() => btn.classList.remove("wrong"), 550);
  }

  function showCorrect(container, correctValue) {
    [...container.querySelectorAll("button")].forEach(btn => {
      if (btn.textContent === correctValue) btn.classList.add("correct");
      btn.disabled = true;
    });
  }

  function showOkFlash() {
    const txt = feedbackOk.dataset.text || feedbackOk.textContent || "";
    feedbackOk.textContent = txt;
    feedbackOk.classList.remove("hidden");
    setTimeout(() => feedbackOk.classList.add("hidden"), 900);
  }

  function loadRound(i) {
    idx = i;
    locked = false;

    endScreen.classList.add("hidden");
    clearFeedback();

    const r = rounds[idx];
    roundLabel.textContent = `${idx + 1} / ${rounds.length}`;

    sceneImg.src = CONFIG.IMG_BASE + r.img;
    audio.src = CONFIG.AUDIO_BASE + r.audio;

    line1.textContent = r.lines[0] || "";
    line2.textContent = r.lines[1] || "";
    line3.textContent = r.lines[2] || "";

    // Question A
    qAText.textContent = `A. ${r.A.prompt}`;
    renderOptions(qAOptions, r.A.options, r.A.correct, handlePickA);

    // Reset Question B
    qBBox.classList.add("hidden");
    qBOptions.innerHTML = "";
    qBText.textContent = "B.";

    // Audio behavior:
    // - Round 1: student must press play
    // - Round 2+: autoplay is OK (or once they pressed play at least once)
    if (idx === 0 && firstRoundNeedsManualPlay) {
      // do nothing
    } else {
      safePlay();
    }
  }

  function handlePickA(btn, chosen, correct) {
    if (locked) return;

    if (chosen !== correct) {
      setStatus(qAStatus, "bad");
      markWrong(btn);
      return;
    }

    locked = true;
    setStatus(qAStatus, "ok");
    qABox.style.borderColor = "rgba(22,163,74,.55)";
    showCorrect(qAOptions, correct);
    showOkFlash();

    // show Question B
    const r = rounds[idx];
    qBBox.classList.remove("hidden");
    qBText.textContent = `B. ${r.B.prompt}`;
    renderOptions(qBOptions, r.B.options, r.B.correct, handlePickB);

    locked = false;
  }

  function handlePickB(btn, chosen, correct) {
    if (locked) return;

    if (chosen !== correct) {
      setStatus(qBStatus, "bad");
      markWrong(btn);
      return;
    }

    locked = true;
    setStatus(qBStatus, "ok");
    qBBox.style.borderColor = "rgba(22,163,74,.55)";
    showCorrect(qBOptions, correct);
    showOkFlash();

    setTimeout(() => {
      if (idx + 1 < rounds.length) {
        loadRound(idx + 1);
      } else {
        finish();
      }
    }, CONFIG.waitAfterCorrectMs);
  }

  function finish() {
    setAllDisabled(qAOptions, true);
    setAllDisabled(qBOptions, true);
    endScreen.classList.remove("hidden");
  }

  replayBtn.addEventListener("click", () => {
    firstRoundNeedsManualPlay = false; // from now on, autoplay is allowed
    safePlay();
  });

  loadRound(0);
})();