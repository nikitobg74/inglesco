// ../../../../js/u2/u2_l6_p3.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/l6/"
  };

  // ===== Read UI text from HTML (language stays in HTML) =====
  const uiSource = document.getElementById("uiText");
  const d = uiSource?.dataset || {};
  const UI = {
    status1Ready: d.status1Ready || "Press Play.",
    status1AfterPlay: d.status1Afterplay || "Press Next.",
    status1Done: d.status1Done || "Great job. Practice now.",
    playing: d.playing || "Playing...",
    audioBlocked: d.audioBlocked || "Audio blocked. Try again.",
    play: d.play || "▶ Play",
    replay: d.replay || "▶ Replay",
    quizPick: d.quizPick || "Pick A, B, or C.",
    quizSelect: d.quizSelect || "Select an option first.",
    quizCorrect: d.quizCorrect || "✅ Correct!",
    quizWrong: d.quizWrong || "❌ Try again.",
    check: d.check || "Check"
  };

  // ===== Read lesson content from HTML JSON (language-neutral JS) =====
  const dataEl = document.getElementById("lessonData");
  if (!dataEl) {
    console.error("lessonData JSON not found.");
    return;
  }

  let LESSON;
  try {
    LESSON = JSON.parse(dataEl.textContent.trim());
  } catch (e) {
    console.error("lessonData JSON invalid:", e);
    return;
  }

  const examples = Array.isArray(LESSON.examples) ? LESSON.examples : [];
  const quiz = Array.isArray(LESSON.quiz) ? LESSON.quiz : [];

  // ===== DOM =====
  // Part 1
  const part1 = document.getElementById("part1");
  const onImg = document.getElementById("onImg");
  const exImg = document.getElementById("exImg");
  const sentenceEl = document.getElementById("sentence");
  const playBtn = document.getElementById("playBtn");
  const nextExBtn = document.getElementById("nextExBtn");
  const startQuizBtn = document.getElementById("startQuizBtn");
  const status1 = document.getElementById("status1");
  const exNow = document.getElementById("exNow");
  const exTotal = document.getElementById("exTotal");

  // Part 2
  const part2 = document.getElementById("part2");
  const qImg = document.getElementById("qImg");
  const qPlayBtn = document.getElementById("qPlayBtn");
  const qStatus = document.getElementById("qStatus");
  const optionsEl = document.getElementById("options");
  const checkBtn = document.getElementById("checkBtn");
  const qNow = document.getElementById("qNow");
  const qTotal = document.getElementById("qTotal");

  // Next page
  const nextPageBtn = document.getElementById("nextPageBtn");

  // Progress step navigation
  document.querySelectorAll(".step").forEach(step => {
    step.addEventListener("click", () => {
      const go = step.getAttribute("data-go");
      if (go) window.location.href = go;
    });
  });

  // ===== Audio helper =====
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

  // ===== Helpers =====
  const renderSentenceWithOnRed = (text) => {
    // Replace whole word "on" (case-insensitive) with red span.
    // Keeps other words untouched.
    const html = text.replace(/\bon\b/gi, (m) => `<span class="onword">${m}</span>`);
    sentenceEl.innerHTML = html;
  };

  // ===== PART 1: Examples =====
  let exIndex = 0;
  let exHasPlayed = false;

  exTotal.textContent = String(examples.length || 0);
  onImg.src = CONFIG.IMG_BASE + (LESSON.fixedOnImage || "");
  onImg.alt = "ON";

  const loadExample = () => {
    const item = examples[exIndex];
    exNow.textContent = String(exIndex + 1);
    exHasPlayed = false;

    exImg.src = CONFIG.IMG_BASE + item.img;
    exImg.alt = "Example";

    renderSentenceWithOnRed(item.sentence);

    audio.src = CONFIG.AUDIO_BASE + item.audio;
    audio.currentTime = 0;

    playBtn.disabled = false;
    nextExBtn.disabled = true;
    status1.textContent = UI.status1Ready;

    playBtn.textContent = UI.play;
    startQuizBtn.classList.add("hidden");
  };

  playBtn.addEventListener("click", async () => {
    const item = examples[exIndex];
    if (!item) return;

    status1.textContent = UI.playing;
    playBtn.disabled = true;
    nextExBtn.disabled = true;

    audio.currentTime = 0;
    audio.onended = null;

    const ok = await safePlay();
    if (!ok) {
      status1.textContent = UI.audioBlocked;
      playBtn.disabled = false;
      return;
    }

    audio.onended = () => {
      exHasPlayed = true;
      status1.textContent = UI.status1AfterPlay;
      playBtn.textContent = UI.replay;
      playBtn.disabled = false;
      nextExBtn.disabled = false;
    };
  });

  nextExBtn.addEventListener("click", () => {
    // Require at least one play before allowing Next
    if (!exHasPlayed) return;

    if (exIndex >= examples.length - 1) {
      // Done with examples
      status1.textContent = UI.status1Done;
      nextExBtn.disabled = true;
      playBtn.disabled = true;

      startQuizBtn.classList.remove("hidden");
      return;
    }

    exIndex += 1;
    loadExample();
  });

  startQuizBtn.addEventListener("click", () => {
    part1.classList.add("hidden");
    part2.classList.remove("hidden");
    startQuiz();
  });

  // ===== PART 2: Quiz =====
  let qIndex = 0;
  let selectedIndex = null;

  qTotal.textContent = String(quiz.length || 0);
  qPlayBtn.textContent = UI.play;
  checkBtn.textContent = UI.check;

  const renderOptions = (opts) => {
    optionsEl.innerHTML = "";
    opts.forEach((txt, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.innerHTML = `<span class="label">${idx === 0 ? "A." : idx === 1 ? "B." : "C."}</span> ${txt.replace(/\bon\b/gi, (m)=>`<span class="onword">${m}</span>`)}`;

      btn.addEventListener("click", () => {
        selectedIndex = idx;
        // UI selection styling
        optionsEl.querySelectorAll(".opt").forEach(el => el.classList.remove("selected"));
        btn.classList.add("selected");
        qStatus.textContent = UI.quizPick;
      });

      optionsEl.appendChild(btn);
    });
  };

  const loadQuestion = () => {
    const q = quiz[qIndex];
    selectedIndex = null;

    qNow.textContent = String(qIndex + 1);
    qImg.src = CONFIG.IMG_BASE + q.img;
    qImg.alt = "Question";

    audio.src = CONFIG.AUDIO_BASE + q.audio;
    audio.currentTime = 0;

    qPlayBtn.disabled = false;
    qStatus.textContent = UI.quizPick;
    qPlayBtn.textContent = UI.play;

    renderOptions(q.options || []);
  };

  qPlayBtn.addEventListener("click", async () => {
    const q = quiz[qIndex];
    if (!q) return;

    qStatus.textContent = UI.playing;
    qPlayBtn.disabled = true;

    audio.currentTime = 0;
    audio.onended = null;

    const ok = await safePlay();
    if (!ok) {
      qStatus.textContent = UI.audioBlocked;
      qPlayBtn.disabled = false;
      return;
    }

    audio.onended = () => {
      qPlayBtn.textContent = UI.replay;
      qPlayBtn.disabled = false;
      qStatus.textContent = UI.quizPick;
    };
  });

  const startQuiz = () => {
    if (!quiz.length) {
      qStatus.textContent = "No quiz data.";
      return;
    }
    qIndex = 0;
    loadQuestion();
  };

  checkBtn.addEventListener("click", () => {
    const q = quiz[qIndex];
    if (!q) return;

    if (selectedIndex === null) {
      qStatus.textContent = UI.quizSelect;
      return;
    }

    if (selectedIndex === q.correctIndex) {
      qStatus.textContent = UI.quizCorrect;

      setTimeout(() => {
        if (qIndex >= quiz.length - 1) {
          // Finished quiz
          nextPageBtn.classList.remove("hidden");
          qStatus.textContent = UI.quizCorrect;
          checkBtn.disabled = true;
          qPlayBtn.disabled = false;
          return;
        }

        qIndex += 1;
        loadQuestion();
      }, 650);
    } else {
      // Wrong: do NOT advance
      qStatus.textContent = UI.quizWrong;
    }
  });

  // ===== Start Part 1 =====
  if (examples.length) {
    loadExample();
  } else {
    status1.textContent = "No example data.";
    playBtn.disabled = true;
    nextExBtn.disabled = true;
  }
})();