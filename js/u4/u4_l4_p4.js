// js/u4/u4_l4_p4.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // ── Quiz items ────────────────────────────────────────────────────────────
  const QUIZ = [
    {
      lines:  ["This is my brother Craig.", "He is _____."],
      tiles:  ["tall", "short"],
      answer: "tall",
    },
    {
      lines:  ["His house is _____ and big."],
      tiles:  ["new", "old"],
      answer: "new",
    },
    {
      lines:  ["His car is fast and _____."],
      tiles:  ["expensive", "cheap"],
      answer: "expensive",
    },
    {
      lines:  ["Craig is not married.", "He is _____."],
      tiles:  ["single", "married"],
      answer: "single",
    },
    {
      lines:  ["He is at the bar.", "He is drinking a _____."],
      tiles:  ["beer", "car"],
      answer: "beer",
    },
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let isPlaying   = false;
  let audioPlayed = false;
  let playPromise = null;
  let currentQ    = 0;
  let phase       = "listen"; // "listen" | "exercise"
  let audio       = new Audio(AUD + "u4.l4.p4.craig.mp3");
  audio.preload   = "auto";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const playBtn      = document.getElementById("playBtn");
  const playLabel    = document.getElementById("playLabel");
  const exerciseBtn  = document.getElementById("exerciseBtn");
  const listenPhase  = document.getElementById("listenPhase");
  const exercisePhase = document.getElementById("exercisePhase");
  const quizPrompt   = document.getElementById("quizPrompt");
  const tilesWrap    = document.getElementById("tilesWrap");
  const progressEl   = document.getElementById("quizProgress");
  const endScreen    = document.getElementById("endScreen");
  const mainCard     = document.getElementById("mainCard");

  // ── Vocab panel toggle ────────────────────────────────────────────────────
  const vocabToggle  = document.getElementById("vocabToggle");
  const vocabBody    = document.getElementById("vocabBody");
  const vocabChevron = document.getElementById("vocabChevron");

  vocabToggle.addEventListener("click", () => {
    const open = vocabBody.classList.toggle("open");
    vocabChevron.textContent = open ? "▲" : "▼";
  });

  // ── Audio text tracker ────────────────────────────────────────────────────
  const storyLines = document.querySelectorAll(".story-line");
  let rafId = null;

  function highlightLine(t) {
    let active = null;
    storyLines.forEach(el => {
      if (parseFloat(el.dataset.t) <= t) active = el;
    });
    storyLines.forEach(el => el.classList.toggle("active", el === active));
  }

  function runTracker() {
    highlightLine(audio.currentTime);
    rafId = requestAnimationFrame(runTracker);
  }

  function stopTracker() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    storyLines.forEach(el => el.classList.remove("active"));
  }


  function playAudio() {
    if (isPlaying) return;
    isPlaying = true;
    playBtn.innerHTML = "⏸";
    playBtn.classList.add("playing");
    playBtn.classList.remove("done");
    playLabel.textContent = "Escuchando...";
    runTracker();

    playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => { playPromise = null; }).catch(err => {
        if (err.name !== "AbortError") {
          isPlaying = false;
          playBtn.classList.remove("playing");
          playBtn.innerHTML = "▶";
          playLabel.textContent = "No se pudo reproducir.";
        }
        playPromise = null;
      });
    }
  }

  audio.addEventListener("ended", () => {
    isPlaying   = false;
    audioPlayed = true;
    stopTracker();
    playBtn.innerHTML = "▶";
    playBtn.classList.remove("playing");
    playBtn.classList.add("done");
    playLabel.textContent = "¡Escuchado! Toca para repetir";
    exerciseBtn.disabled = false;
    exerciseBtn.classList.add("ready");
  });

  audio.addEventListener("error", () => {
    isPlaying   = false;
    audioPlayed = true;
    playLabel.textContent = "Audio no disponible";
    playBtn.classList.remove("playing");
    playBtn.innerHTML = "▶";
    exerciseBtn.disabled = false;
    exerciseBtn.classList.add("ready");
  });

  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      if (playPromise) {
        playPromise.then(() => audio.pause()).catch(() => {});
        playPromise = null;
      } else {
        audio.pause();
      }
      isPlaying = false;
      stopTracker();
      playBtn.innerHTML = "▶";
      playBtn.classList.remove("playing");
      playLabel.textContent = "Toca ▶ para continuar";
      return;
    }
    if (audioPlayed) audio.currentTime = 0;
    playAudio();
  });

  // ── Switch to exercise phase ───────────────────────────────────────────────
  exerciseBtn.addEventListener("click", () => {
    if (exerciseBtn.disabled) return;
    phase = "exercise";
    listenPhase.style.display  = "none";
    exercisePhase.style.display = "block";
    renderQuiz();
  });

  // ── Quiz ──────────────────────────────────────────────────────────────────
  function renderQuiz() {
    const q = QUIZ[currentQ];
    progressEl.textContent = `${currentQ + 1} / ${QUIZ.length}`;

    // Build prompt lines — highlight the blank line
    quizPrompt.innerHTML = q.lines.map(line => {
      if (line.includes("_____")) {
        return `<div class="prompt-line highlight">${line.replace("_____", '<span class="blank">_____</span>')}</div>`;
      }
      return `<div class="prompt-line">${line}</div>`;
    }).join("");

    // Tiles (shuffled)
    tilesWrap.innerHTML = "";
    const shuffled = [...q.tiles].sort(() => Math.random() - 0.5);
    shuffled.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile-btn";
      btn.textContent = word;
      btn.addEventListener("click", () => handleTile(btn, word, q));
      tilesWrap.appendChild(btn);
    });
  }

  function handleTile(btn, word, q) {
    if (btn.disabled || btn.classList.contains("shake")) return;

    if (word === q.answer) {
      btn.classList.add("correct");
      // Fill in the blank in the prompt
      quizPrompt.querySelectorAll(".prompt-line").forEach((div, i) => {
        if (q.lines[i] && q.lines[i].includes("_____")) {
          div.innerHTML = q.lines[i].replace("_____", `<span class="filled">${q.answer}</span>`);
          div.classList.add("highlight");
        }
      });
      tilesWrap.querySelectorAll(".tile-btn").forEach(b => b.disabled = true);

      setTimeout(() => {
        currentQ++;
        if (currentQ < QUIZ.length) {
          quizPrompt.classList.add("fade-out");
          setTimeout(() => {
            quizPrompt.classList.remove("fade-out");
            renderQuiz();
            void quizPrompt.offsetWidth;
            quizPrompt.classList.add("fade-in-anim");
            quizPrompt.addEventListener("animationend", () => quizPrompt.classList.remove("fade-in-anim"), { once: true });
          }, 250);
        } else {
          showEnd();
        }
      }, 750);

    } else {
      btn.classList.add("shake");
      btn.addEventListener("animationend", () => btn.classList.remove("shake"), { once: true });
    }
  }

  function showEnd() {
    exercisePhase.style.display = "none";
    endScreen.classList.add("show");
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  // Exercise button locked until audio played
  exerciseBtn.disabled = true;

})();
