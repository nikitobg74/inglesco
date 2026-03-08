// js/u2/u2_l4_p2.js
(() => {
  "use strict";

  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/l4/",

    revealDelayMs: 250,
    afterCorrectDelayMs: 700,

    autoReplayOnWrong: true,
    wrongReplayDelayMs: 500,     // ✅ half a second
    preventSpamReplayMs: 250
  };

  const EXERCISES = [
    {
      dialogue: "u2.l4.p2.dial1.mp3",
      correction: "u2.l4.p2.laura.mp3",
      question: "Where is Laura?",
      answers: [
        { text: "She is at the hospital.", correct: false },
        { text: "She is at the movie theater.", correct: false },
        { text: "She is at the bank.", correct: true }
      ]
    },
    {
      dialogue: "u2.l4.p2.dial2.mp3",
      correction: "u2.l4.p2.daniel.mp3",
      question: "Where is Daniel?",
      answers: [
        { text: "He is at the hospital.", correct: false },
        { text: "He is at the library.", correct: false },
        { text: "He is at the movie theater.", correct: true }
      ]
    },
    {
      dialogue: "u2.l4.p2.dial3.mp3",
      correction: "u2.l4.p2.sofia.mp3",
      question: "Where is Sofia?",
      answers: [
        { text: "She is at the hospital.", correct: false },
        { text: "She is at the bank.", correct: false },
        { text: "She is at the library.", correct: true }
      ]
    },
    {
      dialogue: "u2.l4.p2.dial4.mp3",
      correction: "u2.l4.p2.carlos.mp3",
      question: "Where is Carlos?",
      answers: [
        { text: "He is at the hospital.", correct: false },
        { text: "He is at the supermarket.", correct: true },
        { text: "He is at the movie theater.", correct: false }
      ]
    },
    {
      dialogue: "u2.l4.p2.dial5.mp3",
      correction: "u2.l4.p2.maria.mp3",
      question: "Where is Maria?",
      answers: [
        { text: "She is at the hospital.", correct: true },
        { text: "She is at the library.", correct: false },
        { text: "She is at the post office.", correct: false }
      ]
    },
    {
      dialogue: "u2.l4.p2.dial6.mp3",
      correction: "u2.l4.p2.michael.mp3",
      question: "Where is Michael?",
      answers: [
        { text: "He is at the bank.", correct: false },
        { text: "He is at the library.", correct: true },
        { text: "He is at the supermarket.", correct: false }
      ]
    },
    {
      dialogue: "u2.l4.p2.dial7.mp3",
      correction: "u2.l4.p2.emma.mp3",
      question: "Where is Emma?",
      answers: [
        { text: "She is at the hospital.", correct: false },
        { text: "She is at the post office.", correct: true },
        { text: "She is at the library.", correct: false }
      ]
    },
    {
      dialogue: "u2.l4.p2.dial8.mp3",
      correction: "u2.l4.p2.mario.mp3",
      question: "Where is Mario?",
      answers: [
        { text: "He is at the park.", correct: false },
        { text: "He is at the hospital.", correct: false },
        { text: "He is at the bank.", correct: true }
      ]
    },
    {
      dialogue: "u2.l4.p2.dial9.mp3",
      correction: "u2.l4.p2.jane.mp3",
      question: "Where is Jane?",
      answers: [
        { text: "She is at the hospital.", correct: true },
        { text: "She is at the library.", correct: false },
        { text: "She is at the movie theater.", correct: false }
      ]
    },
    {
      dialogue: "u2.l4.p2.dial10.mp3",
      correction: "u2.l4.p2.david.mp3",
      question: "Where is David?",
      answers: [
        { text: "He is at the bank.", correct: false },
        { text: "He is at the post office.", correct: false },
        { text: "He is at the library.", correct: true }
      ]
    }
  ];

  // ---- DOM ----
  const playBtn = document.getElementById("playBtn");
  const counterPill = document.getElementById("counterPill");
  const statusText = document.getElementById("statusText");
  const qaWrap = document.getElementById("qaWrap");
  const hintWrap = document.getElementById("hintWrap");
  const questionText = document.getElementById("questionText");
  const answersWrap = document.getElementById("answersWrap");
  const nextBtn = document.getElementById("nextBtn");

  document.querySelectorAll(".step").forEach((step) => {
    step.addEventListener("click", () => {
      const page = step.getAttribute("data-page");
      if (page) window.location.href = page;
    });
  });

  // ---- audio ----
  const dialogueAudio = new Audio();
  const correctionAudio = new Audio();
  dialogueAudio.preload = "auto";
  correctionAudio.preload = "auto";

  // ---- state ----
  let idx = 0;
  let dialoguePlayed = false;
  let locked = false;

  let isReplaying = false;
  let lastReplayAt = 0;

  // race-condition protection
  let exerciseToken = 0;
  let pendingTimers = [];

  function clearPendingTimers() {
    pendingTimers.forEach((t) => clearTimeout(t));
    pendingTimers = [];
  }

  function audioUrl(file) {
    return CONFIG.AUDIO_BASE + file;
  }

  function stopAllAudio() {
    [dialogueAudio, correctionAudio].forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
  }

  function playAudio(audioEl) {
    return new Promise((resolve) => {
      audioEl.onended = () => resolve();
      audioEl.onerror = () => resolve();
      audioEl.currentTime = 0;
      const p = audioEl.play();
      if (p && typeof p.catch === "function") p.catch(() => resolve());
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

  function showQA(show) {
    if (show) {
      qaWrap.classList.remove("hidden");
document.getElementById("photoRow")?.classList.add("hidden");
      hintWrap.classList.add("hidden");
    } else {
      qaWrap.classList.add("hidden");
      hintWrap.classList.remove("hidden");
    }
  }

  function setCounter() {
    counterPill.textContent = `${idx + 1} / ${EXERCISES.length}`;
  }

  function setStatusToken(token) {
    statusText.textContent = token; // language-neutral tokens only
  }

  function disableAllAnswers() {
    [...answersWrap.querySelectorAll(".ans-btn")].forEach((b) => (b.disabled = true));
  }

  function maybeAutoReplayDialogue(myToken) {
    if (!CONFIG.autoReplayOnWrong) return;
    if (locked) return;
    if (exerciseToken !== myToken) return;

    const now = Date.now();
    if (isReplaying) return;
    if (now - lastReplayAt < CONFIG.preventSpamReplayMs) return;

    isReplaying = true;
    lastReplayAt = now;

    playBtn.disabled = true;

    pendingTimers.push(setTimeout(() => {
      if (locked) { isReplaying = false; playBtn.disabled = false; return; }
      if (exerciseToken !== myToken) { isReplaying = false; playBtn.disabled = false; return; }

      stopAllAudio();
      playAudio(dialogueAudio).finally(() => {
        isReplaying = false;
        playBtn.disabled = false;
      });
    }, CONFIG.wrongReplayDelayMs));
  }

  function renderExercise() {
    stopAllAudio();
    clearPendingTimers();
    exerciseToken++;

    locked = false;
    dialoguePlayed = false;
    isReplaying = false;

    nextBtn.classList.add("hidden");
    setCounter();
    setStatusToken("▶");

    const ex = EXERCISES[idx];
    dialogueAudio.src = audioUrl(ex.dialogue);
    correctionAudio.src = audioUrl(ex.correction);

    questionText.textContent = ex.question;
    answersWrap.innerHTML = "";

    showQA(false);

    const shuffledAnswers = shuffle(ex.answers);

    shuffledAnswers.forEach((ans) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ans-btn";
      btn.textContent = ans.text;

      btn.addEventListener("click", async () => {
        if (!dialoguePlayed || locked) return;

        const myToken = exerciseToken;

        if (ans.correct) {
          locked = true;
          clearPendingTimers();

          disableAllAnswers();
          btn.classList.add("correct");

          playBtn.disabled = true;
          stopAllAudio();
          await playAudio(correctionAudio);
          playBtn.disabled = false;

          pendingTimers.push(setTimeout(() => {
            if (idx < EXERCISES.length - 1) {
              idx++;
              renderExercise();
            } else {
              setStatusToken("✓");
              nextBtn.classList.remove("hidden");
            }
          }, CONFIG.afterCorrectDelayMs));
        } else {
          btn.classList.add("wrong");
          btn.disabled = true;

          // clear red after delay (only if still same exercise)
          pendingTimers.push(setTimeout(() => {
            if (exerciseToken !== myToken || locked) return;
            btn.classList.remove("wrong");
            btn.disabled = false;
          }, CONFIG.wrongReplayDelayMs));

          maybeAutoReplayDialogue(myToken);
        }
      });

      answersWrap.appendChild(btn);
    });

    playBtn.disabled = false;
  }

  playBtn.addEventListener("click", async () => {
    if (locked) return;

    playBtn.disabled = true;
    stopAllAudio();

    await playAudio(dialogueAudio);

    pendingTimers.push(setTimeout(() => {
      dialoguePlayed = true;
      showQA(true);
      playBtn.disabled = false;
    }, CONFIG.revealDelayMs));
  });

  // INIT: shuffle dialogues every reload
  (function init() {
    const shuffled = shuffle(EXERCISES);
    EXERCISES.length = 0;
    EXERCISES.push(...shuffled);

    idx = 0;
    renderExercise();
  })();
})();