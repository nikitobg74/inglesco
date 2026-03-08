// u3_l2_p2.js
(() => {
  const IMG_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l2/";

  const app = document.getElementById("app");
  const sceneImg = document.getElementById("sceneImg");
  const playBtn = document.getElementById("playBtn");
  const audioEl = document.getElementById("audioEl");
  const questionText = document.getElementById("questionText");
  const promptEl = document.getElementById("prompt");
  const choicesEl = document.getElementById("choices");
  const feedbackEl = document.getElementById("feedback");
  const roundStatus = document.getElementById("roundStatus");
  const stepStatus = document.getElementById("stepStatus");
  const nextBtn = document.getElementById("nextBtn");

  // Language-neutral UI text comes from HTML data attributes
  const UI = {
    correct: app.dataset.correctText || "Correct!",
    wrong: app.dataset.wrongText || "X",
    q1Text: app.dataset.q1Text || "Where are you?",
    q2Text: app.dataset.q2Text || "What are you doing?"
  };

  // Two global question audios (reused for every scene)
  const Q_AUDIO = {
    where: "u3.l2.p2.whereareyou.mp3",
    doing: "u3.l2.p2.whatareyoudoing.mp3"
  };

  // Scenes (same images as P1)
  // Each scene has two tasks:
  //  1) location: "in" or "at" + correct value + options
  //  2) activity: correct verb + options
  const SCENES = [
    {
      img: "u3.l2.p1.jones.jpg",
      location: { prep: "in", correct: "kitchen", options: ["park", "kitchen", "bedroom"] },
      activity:  { correct: "cooking", options: ["eating", "cooking", "watching"], object: "dinner" }
    },
    {
      img: "u3.l2.p1.miller.jpg",
      location: { prep: "in", correct: "dining room", options: ["dining room", "bedroom", "kitchen"] },
      activity:  { correct: "eating", options: ["cooking", "eating", "watching"], object: "dinner" }
    },
    {
      img: "u3.l2.p1.davis.jpg",
      location: { prep: "in", correct: "living room", options: ["living room", "bathroom", "bedroom"] },
      activity:  { correct: "playing", options: ["watching", "cooking", "playing"], object: "cards" }
    },
    {
      img: "u3.l2.p1.martinez.jpg",
      location: { prep: "at", correct: "beach", options: ["yard", "beach", "park"] },
      activity:  { correct: "playing", options: ["watching", "playing", "cooking"], object: "ball" }
    },
    {
      img: "u3.l2.p1.barns.jpg",
      location: { prep: "at", correct: "movie theater", options: ["beach", "movie theater", "dining room"] },
      activity:  { correct: "watching", options: ["cooking", "eating", "watching"], object: "a movie" }
    }
  ];

  let sceneIndex = 0;   // 0..4
  let phase = 0;        // 0 = where, 1 = doing
  let locked = false;

  // Must not autoplay on the very first question; after first user play, autoplay is allowed
  let autoplayAllowed = false;

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

  function setChoicesEnabled(enabled) {
    const btns = choicesEl.querySelectorAll("button");
    btns.forEach(b => (b.disabled = !enabled));
  }

  function clearChoiceStyles() {
    const btns = choicesEl.querySelectorAll("button");
    btns.forEach(b => {
      b.classList.remove("correct", "wrong");
    });
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function loadAudio(filename) {
    audioEl.pause();
    audioEl.currentTime = 0;
    audioEl.src = AUDIO_BASE + filename;
  }

  async function playAudio() {
    try {
      await audioEl.play();
      autoplayAllowed = true; // once user presses play at least once, future autoplay is ok
    } catch (e) {
      // If autoplay is blocked or user gesture required, do nothing.
    }
  }

  function render() {
    locked = false;
    setFeedback(null);
    nextBtn.classList.add("hidden");

    const s = SCENES[sceneIndex];
    sceneImg.src = IMG_BASE + s.img;

    // Status
    roundStatus.textContent = `${sceneIndex + 1}/${SCENES.length}`;
    stepStatus.textContent = phase === 0 ? "Q1/2" : "Q2/2";

    // Build prompt + choices based on phase
    if (phase === 0) {
      questionText.textContent = UI.q1Text;
      promptEl.textContent = `We are ${s.location.prep} the ______.`;

      const opts = shuffle(s.location.options);
      renderChoices(opts, s.location.correct);

      loadAudio(Q_AUDIO.where);
    } else {
      questionText.textContent = UI.q2Text;
      promptEl.textContent = `We are ______ ${s.activity.object}.`;

      const opts = shuffle(s.activity.options);
      renderChoices(opts, s.activity.correct);

      loadAudio(Q_AUDIO.doing);
    }

    // On the very first question: NO autoplay. User must press Play.
    // After that: autoplay is allowed.
    if (autoplayAllowed) {
      // Small delay helps on mobile
      setTimeout(() => { playAudio(); }, 250);
    }
  }

  function renderChoices(options, correctAnswer) {
    choicesEl.innerHTML = "";
    setChoicesEnabled(true);

    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = opt;

      btn.addEventListener("click", () => {
        if (locked) return;
        locked = true;

        clearChoiceStyles();

        const isCorrect = (opt === correctAnswer);

        if (isCorrect) {
          btn.classList.add("correct");
          setFeedback("ok");
          setChoicesEnabled(false);

          // Wait 2 seconds then advance
          setTimeout(() => {
            advance();
          }, 2000);
        } else {
          btn.classList.add("wrong");
          setFeedback("no");

          // Allow correction: unlock after short pause, do NOT advance
          setTimeout(() => {
            locked = false;
            setFeedback(null);
            btn.classList.remove("wrong");
          }, 700);
        }
      });

      choicesEl.appendChild(btn);
    });
  }

  function advance() {
    // Move from Q1 -> Q2, or next scene
    if (phase === 0) {
      phase = 1;
      render();
      return;
    }

    // finished Q2
    phase = 0;
    sceneIndex += 1;

    if (sceneIndex >= SCENES.length) {
      finish();
      return;
    }

    render();
  }

  function finish() {
    // Lock everything, show Next
    locked = true;
    setChoicesEnabled(false);
    playBtn.disabled = true;

    questionText.textContent = "";
    promptEl.textContent = "";
    choicesEl.innerHTML = "";
    setFeedback("ok");

    roundStatus.textContent = `${SCENES.length}/${SCENES.length}`;
    stepStatus.textContent = "Done";

    nextBtn.classList.remove("hidden");
  }

  // Play button
  playBtn.addEventListener("click", () => {
    playAudio();
  });

  // Init
  render();
})();