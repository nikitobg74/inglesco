// js/u4/u4_l6_p5.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const AUD  = BASE + "audio/u4/";

  // ── Story lines with approximate cue times (seconds) within 33s audio ──
  // Each line: [text, startTime]
  // Times spread across 33s for 12 lines ≈ ~2.75s per line average
  const STORY_LINES = [
    ["Today my neighbors are not quiet.",          0.0],
    ["They are very noisy.",                        2.8],
    ["John is in apartment 4.",                     5.2],
    ["He is playing his piano.",                    7.8],
    ["Juanita is in apartment 3.",                 11.0],
    ["She is singing in her living room.",         13.8],
    ["Jake is in the garage.",                     17.5],
    ["He is fixing his old car.",                  20.0],
    ["But I am not noisy.",                        23.2],
    ["I am quiet.",                                25.5],
    ["I am in my bedroom.",                        27.2],
    ["I am reading a book and listening to my noisy neighbors.", 29.0]
  ];

  // ── Comprehension questions ───────────────────────────────────────────
  // answer is always the correct option; options order is shuffled by JS
  const QUESTIONS = [
    {
      question: "Are the neighbors quiet today?",
      answer:   "No, they are noisy.",
      wrong:    "Yes, they are quiet."
    },
    {
      question: "Where is John?",
      answer:   "In apartment 4.",
      wrong:    "In apartment 3."
    },
    {
      question: "What is John playing?",
      answer:   "A piano.",
      wrong:    "A guitar."
    },
    {
      question: "Where is Juanita?",
      answer:   "In apartment 3.",
      wrong:    "In the garage."
    },
    {
      question: "What is Juanita doing?",
      answer:   "She is singing in her living room.",
      wrong:    "She is reading a book."
    },
    {
      question: "Where is Jake?",
      answer:   "In the garage.",
      wrong:    "In the kitchen."
    },
    {
      question: "What is Jake doing?",
      answer:   "He is fixing his old car.",
      wrong:    "He is washing his car."
    },
    {
      question: "Where am I?",
      answer:   "In my bedroom.",
      wrong:    "In the living room."
    },
    {
      question: "Am I noisy?",
      answer:   "No.",
      wrong:    "Yes."
    }
  ];

  const TOTAL = QUESTIONS.length;

  // ── DOM refs ──────────────────────────────────────────────────────────
  const playBtn       = document.getElementById("playBtn");
  const audioSub      = document.getElementById("audioSub");
  const storyBox      = document.getElementById("storyBox");
  const startQuizBtn  = document.getElementById("startQuizBtn");
  const phase1El      = document.getElementById("phase1");
  const phase2El      = document.getElementById("phase2");
  const mainCard      = document.getElementById("mainCard");
  const endScreen     = document.getElementById("endScreen");
  const questionEl    = document.getElementById("questionSentence");
  const choicesWrap   = document.getElementById("choicesWrap");
  const feedbackEl    = document.getElementById("feedback");
  const exCounter     = document.getElementById("exCounter");
  const barFill       = document.getElementById("barFill");

  let audio        = null;
  let audioPlaying = false;
  let lineEls      = [];   // the rendered <p> elements
  let currentQ     = 0;
  let locked       = false;

  // ── vocab toggle ──────────────────────────────────────────────────────
  document.getElementById("vocabToggle").addEventListener("click", () => {
    const body    = document.getElementById("vocabBody");
    const chevron = document.getElementById("vocabChevron");
    const open    = body.classList.toggle("open");
    chevron.textContent = open ? "▲" : "▼";
  });

  // ── build story lines ─────────────────────────────────────────────────
  function buildStory() {
    storyBox.innerHTML = "";
    lineEls = [];
    STORY_LINES.forEach(([text]) => {
      const p = document.createElement("p");
      p.className   = "story-line";
      p.textContent = text;
      storyBox.appendChild(p);
      lineEls.push(p);
    });
  }

  // ── highlight lines based on audio currentTime ───────────────────────
  function highlightLines(currentTime) {
    let activeIdx = 0;
    for (let i = 0; i < STORY_LINES.length; i++) {
      if (currentTime >= STORY_LINES[i][1]) activeIdx = i;
    }
    lineEls.forEach((el, i) => {
      el.classList.remove("active", "done");
      if (i < activeIdx)  el.classList.add("done");
      if (i === activeIdx) el.classList.add("active");
    });
  }

  // ── audio controls ────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    if (audioPlaying && audio) {
      audio.pause();
      audioPlaying = false;
      playBtn.innerHTML = "▶";
      playBtn.classList.remove("playing");
      audioSub.textContent = "Toca ▶ para continuar";
      return;
    }

    if (!audio) {
      audio = new Audio(AUD + "u4.l6.p5.noisy.neighbor.mp3");
      audio.preload = "auto";

      audio.addEventListener("timeupdate", () => {
        highlightLines(audio.currentTime);
      });

      audio.addEventListener("ended", () => {
        audioPlaying = false;
        playBtn.innerHTML = "▶";
        playBtn.classList.remove("playing");
        playBtn.classList.add("done");
        audioSub.textContent = "¡Escuchado! Toca para repetir";
        // mark all lines done
        lineEls.forEach(el => { el.classList.remove("active"); el.classList.add("done"); });
        // unlock quiz button
        startQuizBtn.disabled = false;
        startQuizBtn.classList.add("ready");
      });

      audio.addEventListener("error", () => {
        audioPlaying = false;
        audioSub.textContent = "Audio no disponible";
      });
    } else {
      // replay from start
      audio.currentTime = 0;
      lineEls.forEach(el => el.classList.remove("active", "done"));
    }

    audio.play().then(() => {
      audioPlaying = true;
      playBtn.innerHTML = "⏸";
      playBtn.classList.add("playing");
      playBtn.classList.remove("done");
      audioSub.textContent = "Escuchando...";
    }).catch(() => {
      audioSub.textContent = "Audio no disponible";
      // allow quiz anyway
      startQuizBtn.disabled = false;
      startQuizBtn.classList.add("ready");
    });
  });

  // ── story ref toggle (phase 2) ────────────────────────────────────────
  document.getElementById("storyRefToggle").addEventListener("click", () => {
    const body    = document.getElementById("storyRefBody");
    const chevron = document.getElementById("storyRefChevron");
    const open    = body.classList.toggle("open");
    chevron.textContent = open ? "▲" : "▼";
  });

  // ── start quiz ────────────────────────────────────────────────────────
  startQuizBtn.addEventListener("click", () => {
    if (startQuizBtn.disabled) return;
    if (audio) { audio.pause(); audioPlaying = false; }
    phase1El.style.display = "none";
    phase2El.style.display = "block";
    loadQuestion(0);
  });

  // ── helpers ───────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function updateProgress(index) {
    exCounter.textContent = `${index + 1} / ${TOTAL}`;
    barFill.style.width   = `${(index / TOTAL) * 100}%`;
  }

  // ── load one question ─────────────────────────────────────────────────
  function loadQuestion(index) {
    locked = false;
    const q = QUESTIONS[index];
    updateProgress(index);

    questionEl.textContent = q.question;
    feedbackEl.textContent = "";
    feedbackEl.className   = "feedback";
    choicesWrap.innerHTML  = "";

    const options = shuffle([q.answer, q.wrong]);
    options.forEach(text => {
      const btn = document.createElement("button");
      btn.type        = "button";
      btn.className   = "choice-btn";
      btn.textContent = text;
      btn.addEventListener("click", () => onChoice(btn, text, q.answer));
      choicesWrap.appendChild(btn);
    });
  }

  // ── handle tap ────────────────────────────────────────────────────────
  function onChoice(btn, chosen, correct) {
    if (locked) return;
    locked = true;

    choicesWrap.querySelectorAll(".choice-btn")
      .forEach(b => { b.disabled = true; });

    if (chosen === correct) {
      btn.classList.add("correct-flash");
      feedbackEl.textContent = "¡Correcto! 🎉";
      feedbackEl.className   = "feedback correct";
      barFill.style.width    = `${((currentQ + 1) / TOTAL) * 100}%`;
      // auto-advance after 1 second
      setTimeout(() => advance(), 1000);
    } else {
      btn.classList.add("wrong-flash", "shake");
      feedbackEl.textContent = "Inténtalo de nuevo.";
      feedbackEl.className   = "feedback wrong";
      // re-enable after shake
      setTimeout(() => {
        btn.classList.remove("wrong-flash", "shake");
        choicesWrap.querySelectorAll(".choice-btn")
          .forEach(b => { b.disabled = false; });
        locked = false;
      }, 600);
    }
  }

  // ── advance ───────────────────────────────────────────────────────────
  function advance() {
    currentQ += 1;
    if (currentQ >= TOTAL) {
      barFill.style.width      = "100%";
      mainCard.style.display   = "none";
      endScreen.classList.add("show");
    } else {
      loadQuestion(currentQ);
    }
  }

  // ── init ──────────────────────────────────────────────────────────────
  buildStory();
})();
