(() => {
  "use strict";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const instrLine      = document.getElementById("instrLine");
  const storyTitle     = document.getElementById("storyTitle");
  const storyText      = document.getElementById("storyText");
  const exerciseBox    = document.getElementById("exerciseBox");
  const endScreen      = document.getElementById("endScreen");
  const endTitle       = document.getElementById("endTitle");
  const endMsg1        = document.getElementById("endMsg1");
  const endScore       = document.getElementById("endScore");
  const endMsg2        = document.getElementById("endMsg2");
  const endBtn         = document.getElementById("endBtn");
  const retryBtn       = document.getElementById("retryBtn");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:          "Escucha la historia, luego decide: ¿verdadero o falso?",
    storyTitle:     "La familia Cooper",
    questionsTitle: "¿Verdadero o Falso?",
    trueLabel:      "Verdadero",
    falseLabel:     "Falso",
    scoreLabel:     "Respuestas correctas:",
    audioSrc:       "../../../../audio/u3/u3.l5.p4.cooper.mp3",
    audio: {
      listenNote:   "🔊 Escucha la historia antes de responder.",
      skipBtn:      "Ir a las preguntas →",
    },
    end: {
      titlePerfect: "¡Perfecto!",
      titleGood:    "¡Muy buen trabajo!",
      msg1:         "Terminaste la lección 5.",
      msg2perfect:  "¡Excelente! ¡Todo correcto!",
      msg2retry:    "¿Quieres intentarlo de nuevo?",
      retryBtn:     "Intentar de nuevo",
      backBtn:      "← Volver a las lecciones"
    }
  };

  // ── Story ─────────────────────────────────────────────────────────────────
  const STORY = [
    { text: "It is a beautiful morning. The Cooper family is at home.", gap: true },
    { text: "Mr. Cooper is in the kitchen. He is cooking breakfast." },
    { text: "Mrs. Cooper is in the living room. She is watching TV." },
    { text: "Tony is in the bedroom. He is listening to music." },
    { text: "Lisa is in the yard. She is playing with the dog." },
    { text: "The cat is in the dining room. It is eating fish." },
    { text: "Grandma Cooper is in the dining room. She is drinking coffee." }
  ];

  // ── Questions ─────────────────────────────────────────────────────────────
  const QUESTIONS = [
    { text: "The Cooper family is at the park.",    answer: false },
    { text: "Mr. Cooper is cooking breakfast.",     answer: true  },
    { text: "Mrs. Cooper is in the kitchen.",       answer: false },
    { text: "Tony is listening to music.",          answer: true  },
    { text: "Lisa is playing baseball.",            answer: false },
    { text: "The dog is in the yard.",              answer: true  },
    { text: "The cat is eating fish.",              answer: true  },
    { text: "Grandma Cooper is drinking milk.",     answer: false }
  ];

  const TOTAL = QUESTIONS.length;

  // ── State ─────────────────────────────────────────────────────────────────
  let results       = new Array(TOTAL).fill(null);
  let audioUnlocked = false;
  let storyParas    = [];
  let audio         = null;

  // ── Build story ───────────────────────────────────────────────────────────
  function buildStory() {
    storyTitle.textContent = CONFIG.storyTitle;
    storyText.innerHTML    = "";
    storyParas             = [];
    STORY.forEach(item => {
      const p = document.createElement("p");
      p.textContent = item.text;
      if (item.gap) p.classList.add("gap");
      storyText.appendChild(p);
      storyParas.push(p);
    });
  }

  // ── Sentence highlighting tied to audio playback ──────────────────────────
  function onTimeUpdate() {
    if (!audio || !audio.duration) return;
    const t      = audio.currentTime;
    const segLen = audio.duration / storyParas.length;
    const idx    = Math.min(Math.floor(t / segLen), storyParas.length - 1);
    storyParas.forEach((p, i) => {
      const on = i === idx;
      p.style.background   = on ? "rgba(37,99,235,.14)" : "";
      p.style.borderRadius = on ? "6px"                 : "";
      p.style.padding      = on ? "2px 6px"             : "";
      p.style.transition   = "background .25s";
    });
  }

  function clearHighlights() {
    storyParas.forEach(p => {
      p.style.background = p.style.borderRadius = p.style.padding = "";
    });
  }

  // ── Create audio section ──────────────────────────────────────────────────
  function createAudioSection() {
    const wrap = document.createElement("div");
    wrap.id = "audioSection";
    wrap.style.cssText = [
      "background:#eff6ff",
      "border:2px solid #93c5fd",
      "border-radius:16px",
      "padding:16px 14px 14px",
      "margin-bottom:20px",
      "text-align:center"
    ].join(";");

    const note = document.createElement("p");
    note.textContent = CONFIG.audio.listenNote;
    note.style.cssText = "margin:0 0 12px 0;font-size:15px;font-weight:700;color:#1e3a5f;";

    audio = new Audio(CONFIG.audioSrc);
    audio.preload = "auto";

    // Native controls via <audio> element in DOM
    const audioEl = document.createElement("audio");
    audioEl.src      = CONFIG.audioSrc;
    audioEl.preload  = "auto";
    audioEl.controls = true;
    audioEl.style.cssText = "width:100%;max-width:460px;display:block;margin:0 auto 12px;";

    // Keep the JS Audio object in sync with DOM element events
    audioEl.addEventListener("timeupdate", () => {
      if (!audioEl.duration) return;
      const segLen = audioEl.duration / storyParas.length;
      const idx    = Math.min(Math.floor(audioEl.currentTime / segLen), storyParas.length - 1);
      storyParas.forEach((p, i) => {
        const on = i === idx && !audioEl.paused;
        p.style.background   = on ? "rgba(37,99,235,.14)" : "";
        p.style.borderRadius = on ? "6px" : "";
        p.style.padding      = on ? "2px 6px" : "";
        p.style.transition   = "background .25s";
      });
    });
    audioEl.addEventListener("pause",  clearHighlights);
    audioEl.addEventListener("ended",  () => { clearHighlights(); unlockQuestions(); });
    audioEl.addEventListener("error",  () => { console.warn("Audio unavailable; unlocking."); unlockQuestions(); });

    const skipBtn = document.createElement("button");
    skipBtn.textContent = CONFIG.audio.skipBtn;
    skipBtn.style.cssText = [
      "margin-top:6px",
      "padding:9px 22px",
      "background:#6b7280",
      "color:#fff",
      "border:none",
      "border-radius:10px",
      "font-weight:700",
      "font-size:14px",
      "cursor:pointer"
    ].join(";");
    skipBtn.addEventListener("mouseenter", () => { skipBtn.style.background = "#4b5563"; });
    skipBtn.addEventListener("mouseleave", () => { skipBtn.style.background = "#6b7280"; });
    skipBtn.addEventListener("click", unlockQuestions);

    wrap.appendChild(note);
    wrap.appendChild(audioEl);
    wrap.appendChild(skipBtn);

    // Insert right after the story card (before questionsArea)
    const qArea = document.getElementById("questionsArea");
    exerciseBox.insertBefore(wrap, qArea);
  }

  // ── Unlock questions ──────────────────────────────────────────────────────
  function unlockQuestions() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    clearHighlights();

    const sec = document.getElementById("audioSection");
    if (sec) {
      sec.style.transition = "opacity .4s";
      sec.style.opacity    = "0";
      setTimeout(() => sec.remove(), 420);
    }

    const qArea = document.getElementById("questionsArea");
    if (qArea) {
      qArea.classList.remove("hidden");
      qArea.style.opacity    = "0";
      qArea.style.transition = "opacity .5s";
      setTimeout(() => { qArea.style.opacity = "1"; }, 50);
    }
  }

  // ── Progress bar + score ──────────────────────────────────────────────────
  function updateProgress() {
    const answered = results.filter(r => r !== null).length;
    const correct  = results.filter(r => r === true).length;
    document.getElementById("progressFill").style.width =
      Math.round((answered / TOTAL) * 100) + "%";
    document.getElementById("scoreLine").textContent =
      `${CONFIG.scoreLabel} ${correct} / ${TOTAL}`;
  }

  function countCorrect() { return results.filter(r => r === true).length; }
  function allAnswered()   { return results.every(r => r !== null); }

  // ── Build questions ───────────────────────────────────────────────────────
  function buildQuestions() {
    document.getElementById("questionsTitle").textContent = CONFIG.questionsTitle;
    const list = document.getElementById("questionsList");
    list.innerHTML = "";

    QUESTIONS.forEach((q, i) => {
      const item = document.createElement("div");
      item.className   = "question-item";
      item.dataset.idx = i;

      const qText = document.createElement("div");
      qText.className   = "question-text";
      qText.textContent = `${i + 1}. ${q.text}`;

      const btnWrap = document.createElement("div");
      btnWrap.className = "tf-buttons";

      makeTFButton(CONFIG.trueLabel,  true,  i, btnWrap);
      makeTFButton(CONFIG.falseLabel, false, i, btnWrap);

      item.appendChild(qText);
      item.appendChild(btnWrap);
      list.appendChild(item);

      if (results[i] === true) lockCorrect(btnWrap, QUESTIONS[i].answer);
    });

    updateProgress();
  }

  function makeTFButton(label, value, qIdx, btnWrap) {
    const btn = document.createElement("button");
    btn.className   = "tf-btn";
    btn.type        = "button";
    btn.textContent = label;

    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const correct = QUESTIONS[qIdx].answer;
      Array.from(btnWrap.querySelectorAll(".tf-btn")).forEach(b => { b.disabled = true; });

      if (value === correct) {
        btn.classList.add("correct");
        results[qIdx] = true;
      } else {
        btn.classList.add("wrong");
        results[qIdx] = false;
        Array.from(btnWrap.querySelectorAll(".tf-btn")).forEach(b => {
          if ((b.textContent === CONFIG.trueLabel  && correct === true) ||
              (b.textContent === CONFIG.falseLabel && correct === false))
            b.classList.add("correct");
        });
      }

      updateProgress();
      if (allAnswered()) setTimeout(finish, 800);
    });

    btnWrap.appendChild(btn);
  }

  function lockCorrect(btnWrap, correctAnswer) {
    Array.from(btnWrap.querySelectorAll(".tf-btn")).forEach(b => {
      b.disabled = true;
      if ((b.textContent === CONFIG.trueLabel  && correctAnswer === true) ||
          (b.textContent === CONFIG.falseLabel && correctAnswer === false))
        b.classList.add("correct");
    });
  }

  // ── Finish ────────────────────────────────────────────────────────────────
  function finish() {
    const correct = countCorrect();
    const perfect = correct === TOTAL;
    exerciseBox.classList.add("hidden");
    endTitle.textContent = perfect ? CONFIG.end.titlePerfect : CONFIG.end.titleGood;
    endMsg1.textContent  = CONFIG.end.msg1;
    endScore.textContent = `${correct} / ${TOTAL}`;
    endMsg2.textContent  = perfect ? CONFIG.end.msg2perfect : CONFIG.end.msg2retry;
    endBtn.textContent   = CONFIG.end.backBtn;
    if (!perfect) { retryBtn.textContent = CONFIG.end.retryBtn; retryBtn.classList.remove("hidden"); }
    else            retryBtn.classList.add("hidden");
    endScreen.classList.remove("hidden");
  }

  // ── Retry ─────────────────────────────────────────────────────────────────
  retryBtn.addEventListener("click", () => {
    results       = results.map(r => r === true ? true : null);
    audioUnlocked = true;  // skip audio on retry
    endScreen.classList.add("hidden");
    exerciseBox.classList.remove("hidden");
    const qArea = document.getElementById("questionsArea");
    if (qArea) { qArea.classList.remove("hidden"); qArea.style.opacity = "1"; }
    buildQuestions();
    exerciseBox.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ── Wrap progress + questions in a gated area ─────────────────────────────
  function wrapQuestionsArea() {
    const qArea = document.createElement("div");
    qArea.id    = "questionsArea";
    qArea.classList.add("hidden");

    ["progressFill", "scoreLine", "questionsTitle", "questionsList"].forEach(id => {
      // grab the wrapper element (progressFill lives inside progress-bar-wrap)
    });

    // Move the existing DOM nodes into qArea
    const progressBarWrap = document.querySelector(".progress-bar-wrap");
    const scoreLineEl     = document.getElementById("scoreLine");
    const qTitleEl        = document.getElementById("questionsTitle");
    const qListEl         = document.getElementById("questionsList");

    [progressBarWrap, scoreLineEl, qTitleEl, qListEl].forEach(el => {
      if (el) qArea.appendChild(el);
    });

    exerciseBox.appendChild(qArea);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  buildStory();
  wrapQuestionsArea();
  createAudioSection();
  buildQuestions();
})();
