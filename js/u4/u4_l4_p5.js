// js/u4/u4_l4_p5.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const AUD  = BASE + "audio/u4/";

  // ── Quiz items ────────────────────────────────────────────────────────────
  const QUIZ = [
    {
      lines:  ["This is my sister Jill.", "She is _____."],
      tiles:  ["short", "tall"],
      answer: "short",
    },
    {
      lines:  ["Her house is _____ and old."],
      tiles:  ["small", "big"],
      answer: "small",
    },
    {
      lines:  ["It is not _____."],
      tiles:  ["big", "small"],
      answer: "big",
    },
    {
      lines:  ["Her car is _____ and cheap."],
      tiles:  ["slow", "fast"],
      answer: "slow",
    },
    {
      lines:  ["It is not _____."],
      tiles:  ["fast", "cheap"],
      answer: "fast",
    },
    {
      lines:  ["Jill is _____."],
      tiles:  ["married", "single"],
      answer: "married",
    },
    {
      lines:  ["Today she is at _____."],
      tiles:  ["home", "bar"],
      answer: "home",
    },
    {
      lines:  ["She is cooking _____."],
      tiles:  ["dinner", "beer"],
      answer: "dinner",
    },
  ];

  // ── Karaoke timestamps (adjust if audio timing differs) ───────────────────
  // 9 lines spread across ~25 seconds
  const STORY_TIMES = [0, 3, 6, 9.5, 13, 16, 19, 21.5, 23.5];

  // ── State ─────────────────────────────────────────────────────────────────
  let isPlaying   = false;
  let audioPlayed = false;
  let playPromise = null;
  let currentQ    = 0;
  let audio       = new Audio(AUD + "u4.l4.p5.jill.mp3");
  audio.preload   = "auto";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const playBtn       = document.getElementById("playBtn");
  const playLabel     = document.getElementById("playLabel");
  const exerciseBtn   = document.getElementById("exerciseBtn");
  const listenPhase   = document.getElementById("listenPhase");
  const exercisePhase = document.getElementById("exercisePhase");
  const quizPrompt    = document.getElementById("quizPrompt");
  const tilesWrap     = document.getElementById("tilesWrap");
  const progressEl    = document.getElementById("quizProgress");
  const endScreen     = document.getElementById("endScreen");
  const storyLines    = document.querySelectorAll(".story-line");

  // ── Vocab panel toggle ────────────────────────────────────────────────────
  document.getElementById("vocabToggle").addEventListener("click", () => {
    const body    = document.getElementById("vocabBody");
    const chevron = document.getElementById("vocabChevron");
    const open    = body.classList.toggle("open");
    chevron.textContent = open ? "▲" : "▼";
  });

  // ── Audio tracker (karaoke highlight) ────────────────────────────────────
  let rafId = null;

  function highlightLine(t) {
    let activeIdx = -1;
    STORY_TIMES.forEach((time, i) => { if (time <= t) activeIdx = i; });
    storyLines.forEach((el, i) => el.classList.toggle("active", i === activeIdx));
  }

  function runTracker() {
    highlightLine(audio.currentTime);
    rafId = requestAnimationFrame(runTracker);
  }

  function stopTracker() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    storyLines.forEach(el => el.classList.remove("active"));
  }

  // ── Audio helpers ─────────────────────────────────────────────────────────
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
      if (playPromise) { playPromise.then(() => audio.pause()).catch(() => {}); playPromise = null; }
      else { audio.pause(); }
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

  // ── Switch to exercise phase ──────────────────────────────────────────────
  exerciseBtn.addEventListener("click", () => {
    if (exerciseBtn.disabled) return;
    audio.pause();
    stopTracker();
    isPlaying = false;
    listenPhase.style.display   = "none";
    exercisePhase.style.display = "block";
    renderQuiz();
  });

  // ── Quiz ──────────────────────────────────────────────────────────────────
  function renderQuiz() {
    const q = QUIZ[currentQ];
    progressEl.textContent = `${currentQ + 1} / ${QUIZ.length}`;

    quizPrompt.innerHTML = q.lines.map(line => {
      if (line.includes("_____")) {
        return `<div class="prompt-line highlight">${line.replace("_____", '<span class="blank">_____</span>')}</div>`;
      }
      return `<div class="prompt-line">${line}</div>`;
    }).join("");

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
  exerciseBtn.disabled = true;

})();
