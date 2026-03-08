/* u3_l4_p1.js
   - 2 rounds (Text A, Text B)
   - Must listen fully before questions appear
   - 4 questions per text (each character/action)
   - English prompts/options
   - Dynamic title (AT THE PARK / AT HOME IN THE YARD)
   - FIX: wrong answer shows ONLY red (does NOT reveal correct green)
   - Park audio corrected: u3.l4.p1.park.mp3
*/
(() => {
  "use strict";

  const IMG_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l4/";

  // ===== DOM =====
  const sceneImg   = document.getElementById("sceneImg");
  const playBtn    = document.getElementById("playBtn");
  const roundLabel = document.getElementById("roundLabel");

  const lessonTopic = document.getElementById("lessonTopic");

  const scriptBox  = document.getElementById("scriptBox");
  const line1El    = document.getElementById("line1");
  const line2El    = document.getElementById("line2");
  const line3El    = document.getElementById("line3");

  const feedbackOk = document.getElementById("feedbackOk");
  const endScreen  = document.getElementById("endScreen");

  // Q boxes A-D
  const Q = {
    A: {
      box: document.getElementById("qABox"),
      text: document.getElementById("qAText"),
      status: document.getElementById("qAStatus"),
      options: document.getElementById("qAOptions"),
    },
    B: {
      box: document.getElementById("qBBox"),
      text: document.getElementById("qBText"),
      status: document.getElementById("qBStatus"),
      options: document.getElementById("qBOptions"),
    },
    C: {
      box: document.getElementById("qCBox"),
      text: document.getElementById("qCText"),
      status: document.getElementById("qCStatus"),
      options: document.getElementById("qCOptions"),
    },
    D: {
      box: document.getElementById("qDBox"),
      text: document.getElementById("qDText"),
      status: document.getElementById("qDStatus"),
      options: document.getElementById("qDOptions"),
    }
  };

  // ===== CONTENT =====
  const ROUNDS = [
    {
      topic: "AT THE PARK",
      img: "u3.l4.p1.park2.jpg",
      audio: "u3.l4.p1.park.mp3", // ✅ corrected
      lines: [
        "AT THE PARK",
        "The Lopez family is at the park today.",
        "Mr. Lopez is reading a book. Mrs. Lopez is eating a sandwich. Carlos and Anna are playing with a ball. The Lopez family is very happy."
      ],
      questions: [
        {
          id: "A",
          prompt: "A. Where are they?",
          options: ["at the park", "at home in the yard", "at school"],
          answer: "at the park"
        },
        {
          id: "B",
          prompt: "B. What is Mr. Lopez doing?",
          options: ["reading a book", "drinking lemonade", "playing with a ball"],
          answer: "reading a book"
        },
        {
          id: "C",
          prompt: "C. What is Mrs. Lopez doing?",
          options: ["eating a sandwich", "planting flowers", "reading a text"],
          answer: "eating a sandwich"
        },
        {
          id: "D",
          prompt: "D. What are Carlos and Anna doing?",
          options: ["playing with a ball", "reading a book", "drinking lemonade"],
          answer: "playing with a ball"
        }
      ]
    },
    {
      topic: "AT HOME IN THE YARD",
      img: "u3.l4.p1.yard.jpg",
      audio: "u3.l4.p1.yard.mp3",
      lines: [
        "AT HOME IN THE YARD",
        "The Johnson family is at home in the yard today.",
        "Mr. Johnson is planting flowers. Mrs. Johnson is drinking lemonade. David and Tom are playing with a ball. The Johnson family is happy."
      ],
      questions: [
        {
          id: "A",
          prompt: "A. Where are they?",
          options: ["at home in the yard", "at the park", "at work"],
          answer: "at home in the yard"
        },
        {
          id: "B",
          prompt: "B. What is Mr. Johnson doing?",
          options: ["planting flowers", "reading a book", "eating a sandwich"],
          answer: "planting flowers"
        },
        {
          id: "C",
          prompt: "C. What is Mrs. Johnson doing?",
          options: ["drinking lemonade", "playing with a ball", "reading a text"],
          answer: "drinking lemonade"
        },
        {
          id: "D",
          prompt: "D. What are David and Tom doing?",
          options: ["playing with a ball", "planting flowers", "eating a sandwich"],
          answer: "playing with a ball"
        }
      ]
    }
  ];

  const TOTAL = ROUNDS.length;

  // ===== STATE =====
  let idx = 0;
  let audio = null;
  let isPlaying = false;
  let hasListened = false;
  let currentQuestionIndex = 0;

  // ===== UI HELPERS =====
  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }

  function setPlayLabel(state) {
    const ready = playBtn.dataset.labelReady || "▶ Play";
    const playing = playBtn.dataset.labelPlaying || "Playing...";
    const repeat = playBtn.dataset.labelRepeat || "🔁 Play again";
    playBtn.textContent = state === "playing" ? playing : (state === "repeat" ? repeat : ready);
  }

  function setStatus(el, type) {
    el.textContent = type === "ok" ? "✓" : type === "bad" ? "✗" : "";
    el.classList.remove("ok", "bad");
    if (type === "ok") el.classList.add("ok");
    if (type === "bad") el.classList.add("bad");
  }

  function clearOptions(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  function disableAllOptions(container, disabled) {
    container.querySelectorAll("button.opt").forEach(btn => (btn.disabled = !!disabled));
  }

  function showFeedback() {
    feedbackOk.textContent = feedbackOk.dataset.text || "Correct!";
    show(feedbackOk);
    setTimeout(() => hide(feedbackOk), 850);
  }

  function stopAudio() {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
    isPlaying = false;
    playBtn.disabled = false;
    setPlayLabel(hasListened ? "repeat" : "ready");
  }

  // ===== MARKING (FIXED) =====
  // Correct: show green ONLY on correct choice
  function markCorrect(container, correct) {
    container.querySelectorAll("button.opt").forEach(btn => {
      if (btn.textContent === correct) btn.classList.add("correct");
    });
  }

  // Wrong: show red ONLY on chosen wrong option
  function markWrongOnly(container, chosen) {
    container.querySelectorAll("button.opt").forEach(btn => {
      if (btn.textContent === chosen) btn.classList.add("wrong");
    });
  }

  function resetWrong(container) {
    container.querySelectorAll("button.opt").forEach(btn => btn.classList.remove("wrong"));
  }

  // ===== QUESTIONS (SEQUENTIAL) =====
  function hideAllQuestions() {
    Object.values(Q).forEach(q => {
      hide(q.box);
      setStatus(q.status, "none");
      clearOptions(q.options);
    });
  }

  function renderQuestion(round, qIndex) {
    hideAllQuestions();

    const qData = round.questions[qIndex];
    const qUI = Q[qData.id];

    qUI.text.textContent = qData.prompt;
    setStatus(qUI.status, "none");
    clearOptions(qUI.options);

    qData.options.forEach(opt => {
      const b = document.createElement("button");
      b.className = "opt";
      b.type = "button";
      b.textContent = opt;
      b.addEventListener("click", () => onAnswer(round, qData, qUI, opt));
      qUI.options.appendChild(b);
    });

    show(qUI.box);
  }

  function onAnswer(round, qData, qUI, chosen) {
    if (!hasListened) return;

    const correct = qData.answer;
    disableAllOptions(qUI.options, true);

    if (chosen === correct) {
      // ✅ DO NOT reveal anything except correct green
      markCorrect(qUI.options, correct);
      setStatus(qUI.status, "ok");
      showFeedback();

      setTimeout(() => {
        currentQuestionIndex += 1;

        if (currentQuestionIndex < round.questions.length) {
          renderQuestion(round, currentQuestionIndex);
        } else {
          // finished all questions for this round
          setTimeout(nextRound, 650);
        }
      }, 420);

    } else {
      // ✅ Only red on the chosen wrong answer
      setStatus(qUI.status, "bad");
      markWrongOnly(qUI.options, chosen);

      // allow retry (remove red, re-enable)
      setTimeout(() => {
        setStatus(qUI.status, "none");
        resetWrong(qUI.options);
        disableAllOptions(qUI.options, false);
      }, 650);
    }
  }

  // ===== AUDIO FLOW =====
  function playCurrent() {
    const round = ROUNDS[idx];

    if (!audio) audio = new Audio();
    audio.src = AUDIO_BASE + round.audio;

    isPlaying = true;
    playBtn.disabled = true;
    setPlayLabel("playing");

    hideAllQuestions();
    hide(feedbackOk);

    audio.onended = () => {
      isPlaying = false;
      hasListened = true;

      // reveal script now (prevents copying before listen)
      show(scriptBox);

      // start questions
      currentQuestionIndex = 0;
      renderQuestion(round, currentQuestionIndex);

      playBtn.disabled = false;
      setPlayLabel("repeat");
    };

    audio.play().catch(() => {
      isPlaying = false;
      playBtn.disabled = false;
      setPlayLabel("ready");
    });
  }

  // ===== ROUND CONTROL =====
  function loadRound(i) {
    idx = i;

    hasListened = false;
    currentQuestionIndex = 0;

    hide(endScreen);
    hide(feedbackOk);
    hideAllQuestions();
    hide(scriptBox);

    const round = ROUNDS[idx];

    // dynamic topic line above image
    if (lessonTopic) lessonTopic.textContent = round.topic;

    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;
    sceneImg.src = IMG_BASE + round.img;

    line1El.textContent = round.lines[0] || "";
    line2El.textContent = round.lines[1] || "";
    line3El.textContent = round.lines[2] || "";

    setPlayLabel("ready");
    stopAudio();
  }

  function nextRound() {
    stopAudio();

    if (idx < TOTAL - 1) {
      loadRound(idx + 1);
      return; // student presses Play again
    }

    // finished
    hideAllQuestions();
    show(endScreen);
    show(scriptBox);
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