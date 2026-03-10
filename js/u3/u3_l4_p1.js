/* u3_l4_p1.js
   - 2 rounds (Text A, Text B)
   - Must listen fully before questions appear
   - 4 questions per text, options SHUFFLED each render
   - Sentence-by-sentence highlighting while audio plays
   - Visible audio progress bar
   - Wrong answer shows ONLY red (does NOT reveal correct green)
*/
(() => {
  "use strict";

  const IMG_BASE   = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l4/";

  // ===== DOM =====
  const sceneImg    = document.getElementById("sceneImg");
  const playBtn     = document.getElementById("playBtn");
  const roundLabel  = document.getElementById("roundLabel");
  const lessonTopic = document.getElementById("lessonTopic");
  const scriptBox   = document.getElementById("scriptBox");
  const feedbackOk  = document.getElementById("feedbackOk");
  const endScreen   = document.getElementById("endScreen");

  // We only ever show one Q box at a time — always reuse qABox
  const QBox     = document.getElementById("qABox");
  const QText    = document.getElementById("qAText");
  const QStatus  = document.getElementById("qAStatus");
  const QOptions = document.getElementById("qAOptions");

  // Hide the other Q boxes permanently — not needed
  ["qBBox","qCBox","qDBox"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  // ===== CONTENT =====
  const ROUNDS = [
    {
      topic: "AT THE PARK",
      img:   "u3.l4.p1.park2.jpg",
      audio: "u3.l4.p1.park.mp3",
      lines: [
        "AT THE PARK",
        "The Lopez family is at the park today.",
        "Mr. Lopez is reading a book.",
        "Mrs. Lopez is eating a sandwich.",
        "Carlos and Anna are playing with a ball.",
        "The Lopez family is very happy.",
        "They are at the park today."
      ],
      questions: [
        {
          prompt: "A. Where are they?",
          options: ["at the park", "at home in the yard", "at school"],
          answer: "at the park"
        },
        {
          prompt: "B. What is Mr. Lopez doing?",
          options: ["reading a book", "drinking lemonade", "playing with a ball"],
          answer: "reading a book"
        },
        {
          prompt: "C. What is Mrs. Lopez doing?",
          options: ["eating a sandwich", "planting flowers", "reading a text"],
          answer: "eating a sandwich"
        },
        {
          prompt: "D. What are Carlos and Anna doing?",
          options: ["playing with a ball", "reading a book", "drinking lemonade"],
          answer: "playing with a ball"
        }
      ]
    },
    {
      topic: "AT HOME IN THE YARD",
      img:   "u3.l4.p1.yard.jpg",
      audio: "u3.l4.p1.yard.mp3",
      lines: [
        "AT HOME IN THE YARD",
        "The Johnson family is at home in the yard today.",
        "Mr. Johnson is planting flowers.",
        "Mrs. Johnson is drinking lemonade.",
        "David and Tom are playing with a ball.",
        "The Johnson family is happy.",
        "They are at home in the yard today."
      ],
      questions: [
        {
          prompt: "A. Where are they?",
          options: ["at home in the yard", "at the park", "at work"],
          answer: "at home in the yard"
        },
        {
          prompt: "B. What is Mr. Johnson doing?",
          options: ["planting flowers", "reading a book", "eating a sandwich"],
          answer: "planting flowers"
        },
        {
          prompt: "C. What is Mrs. Johnson doing?",
          options: ["drinking lemonade", "playing with a ball", "reading a text"],
          answer: "drinking lemonade"
        },
        {
          prompt: "D. What are David and Tom doing?",
          options: ["playing with a ball", "planting flowers", "eating a sandwich"],
          answer: "playing with a ball"
        }
      ]
    }
  ];

  const TOTAL = ROUNDS.length;

  // ===== STATE =====
  let idx                  = 0;
  let audio                = null;
  let isPlaying            = false;
  let hasListened          = false;
  let currentQuestionIndex = 0;
  let sentenceEls          = [];   // <span> elements for each line
  let audioBarFill         = null;

  // ===== HELPERS =====
  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function setPlayLabel(state) {
    playBtn.textContent =
      state === "playing" ? (playBtn.dataset.labelPlaying  || "⏸ Playing...") :
      state === "repeat"  ? (playBtn.dataset.labelRepeat   || "🔁 Listen again") :
                            (playBtn.dataset.labelReady    || "▶ Listen / Play");
  }

  function setStatus(type) {
    QStatus.textContent = type === "ok" ? "✓" : type === "bad" ? "✗" : "";
    QStatus.classList.remove("ok", "bad");
    if (type === "ok")  QStatus.classList.add("ok");
    if (type === "bad") QStatus.classList.add("bad");
  }

  function showFeedback() {
    feedbackOk.textContent = feedbackOk.dataset.text || "Correct!";
    show(feedbackOk);
    setTimeout(() => hide(feedbackOk), 850);
  }

  // ===== AUDIO PROGRESS BAR =====
  function ensureAudioBar() {
    if (document.getElementById("audioProgressBar")) return;
    const wrap = document.createElement("div");
    wrap.id = "audioProgressBar";
    wrap.style.cssText = [
      "background:#bfdbfe",
      "border-radius:99px",
      "height:12px",
      "margin:10px 0 4px",
      "overflow:hidden",
      "width:100%",
      "max-width:520px"
    ].join(";");
    audioBarFill = document.createElement("div");
    audioBarFill.style.cssText = [
      "height:100%",
      "background:#2563eb",
      "border-radius:99px",
      "width:0%",
      "transition:width .25s linear"
    ].join(";");
    wrap.appendChild(audioBarFill);
    // Insert right after playBtn inside .controls
    playBtn.parentNode.insertBefore(wrap, playBtn.nextSibling);
  }

  function updateAudioBar() {
    if (!audioBarFill || !audio || !audio.duration) return;
    audioBarFill.style.width = (audio.currentTime / audio.duration * 100) + "%";
  }

  function resetAudioBar() {
    if (audioBarFill) audioBarFill.style.width = "0%";
  }

  // ===== SENTENCE HIGHLIGHTING =====
  function buildSentenceEls(lines) {
    scriptBox.innerHTML = "";
    sentenceEls = [];
    lines.forEach((text, i) => {
      const span = document.createElement("span");
      span.className   = "en";
      span.textContent = text;
      // Make the title line bold
      if (i === 0) {
        span.style.fontWeight = "900";
        span.style.fontSize   = "15px";
        span.style.marginBottom = "6px";
      }
      scriptBox.appendChild(span);
      sentenceEls.push(span);
    });
  }

  function highlightSentence(i) {
    sentenceEls.forEach((el, j) => {
      const on = j === i;
      el.style.background   = on ? "rgba(37,99,235,.18)" : "";
      el.style.borderRadius = on ? "7px"                 : "";
      el.style.padding      = on ? "2px 6px"             : "";
      el.style.transition   = "background .2s";
    });
  }

  function clearHighlights() {
    sentenceEls.forEach(el => {
      el.style.background = el.style.borderRadius = el.style.padding = "";
    });
  }

  // ===== QUESTIONS =====
  function renderQuestion(round, qIndex) {
    hide(QBox);
    setStatus("none");
    QOptions.innerHTML = "";

    const qData = round.questions[qIndex];
    QText.textContent = qData.prompt;

    // Shuffle options on every render
    shuffle(qData.options).forEach(opt => {
      const b = document.createElement("button");
      b.className   = "opt";
      b.type        = "button";
      b.textContent = opt;
      b.addEventListener("click", () => onAnswer(round, qData, opt));
      QOptions.appendChild(b);
    });

    show(QBox);
  }

  function onAnswer(round, qData, chosen) {
    if (!hasListened) return;

    const correct = qData.answer;
    QOptions.querySelectorAll("button.opt").forEach(b => { b.disabled = true; });

    if (chosen === correct) {
      QOptions.querySelectorAll("button.opt").forEach(b => {
        if (b.textContent === correct) b.classList.add("correct");
      });
      setStatus("ok");
      showFeedback();

      setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < round.questions.length) {
          renderQuestion(round, currentQuestionIndex);
        } else {
          setTimeout(nextRound, 650);
        }
      }, 420);

    } else {
      setStatus("bad");
      QOptions.querySelectorAll("button.opt").forEach(b => {
        if (b.textContent === chosen) b.classList.add("wrong");
      });
      setTimeout(() => {
        setStatus("none");
        QOptions.querySelectorAll("button.opt").forEach(b => {
          b.classList.remove("wrong");
          b.disabled = false;
        });
      }, 650);
    }
  }

  // ===== AUDIO =====
  function stopAudio() {
    if (!audio) return;
    try { audio.pause(); audio.currentTime = 0; } catch {}
    isPlaying        = false;
    playBtn.disabled = false;
    clearHighlights();
    resetAudioBar();
    setPlayLabel(hasListened ? "repeat" : "ready");
  }

  function playCurrent() {
    const round = ROUNDS[idx];
    if (!audio) audio = new Audio();
    audio.src = AUDIO_BASE + round.audio;

    isPlaying        = true;
    playBtn.disabled = true;
    setPlayLabel("playing");

    hide(QBox);
    hide(feedbackOk);
    resetAudioBar();
    ensureAudioBar();

    const n = sentenceEls.length;

    audio.ontimeupdate = () => {
      updateAudioBar();
      if (!audio.duration) return;
      const segLen = audio.duration / n;
      const i      = Math.min(Math.floor(audio.currentTime / segLen), n - 1);
      highlightSentence(i);
    };

    audio.onpause = () => { if (!audio.ended) clearHighlights(); };

    audio.onended = () => {
      isPlaying        = false;
      hasListened      = true;
      playBtn.disabled = false;
      clearHighlights();
      resetAudioBar();
      setPlayLabel("repeat");

      currentQuestionIndex = 0;
      renderQuestion(round, currentQuestionIndex);
    };

    audio.play().catch(() => {
      isPlaying        = false;
      playBtn.disabled = false;
      setPlayLabel("ready");
    });
  }

  // ===== ROUND CONTROL =====
  function loadRound(i) {
    idx                  = i;
    hasListened          = false;
    currentQuestionIndex = 0;

    hide(endScreen);
    hide(feedbackOk);
    hide(QBox);

    const round = ROUNDS[idx];
    if (lessonTopic) lessonTopic.textContent = round.topic;
    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;
    sceneImg.src           = IMG_BASE + round.img;

    buildSentenceEls(round.lines);
    show(scriptBox);

    setPlayLabel("ready");
    stopAudio();
  }

  function nextRound() {
    stopAudio();
    if (idx < TOTAL - 1) {
      loadRound(idx + 1);
      return;
    }
    hide(QBox);
    show(endScreen);
    setPlayLabel("repeat");
  }

  // ===== EVENTS =====
  playBtn.addEventListener("click", () => {
    if (isPlaying) return;
    playCurrent();
  });

  // ===== INIT =====
  loadRound(0);
})();
