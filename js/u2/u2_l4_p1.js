// js/u2/u2_l4_p1.js
(() => {
  "use strict";

  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/l4/",

    // timing
    revealDelayMs: 250,        // delay before showing Q/A after dialogue ends
    afterCorrectDelayMs: 700,  // pause after correction audio ends before next exercise

    // wrong behavior
    autoReplayOnWrong: true,
    wrongReplayDelayMs: 500,   // ✅ your request: half a second
    preventSpamReplayMs: 250
  };

  /** Lesson data */
  const EXERCISES = [
    {
      dialogue: "u2.l4.p1.dial1.mp3",
      correction: "u2.l4.p1.pedro.mp3",
      question: "Where is Pedro?",
      answers: [
        { text: "He is at the office.", correct: false },
        { text: "He is at the supermarket.", correct: true },
        { text: "He is at the movie theater.", correct: false }
      ]
    },
    {
      dialogue: "u2.l4.p1.dial2.mp3",
      correction: "u2.l4.p1.ana.mp3",
      question: "Where is Ana?",
      answers: [
        { text: "She is at the park.", correct: true },
        { text: "She is at the bank.", correct: false },
        { text: "She is at the post office.", correct: false }
      ]
    },
    {
      dialogue: "u2.l4.p1.dial3.mp3",
      correction: "u2.l4.p1.carlos.mp3",
      question: "Where is Carlos?",
      answers: [
        { text: "He is at the office.", correct: true },
        { text: "He is at the post office.", correct: false },
        { text: "He is at the restaurant.", correct: false }
      ]
    },
    {
      dialogue: "u2.l4.p1.dial4.mp3",
      correction: "u2.l4.p1.john.mp3",
      question: "Where is John?",
      answers: [
        { text: "He is at the park.", correct: false },
        { text: "He is at the restaurant.", correct: false },
        { text: "He is at the post office.", correct: true }
      ]
    },
    {
      dialogue: "u2.l4.p1.dial5.mp3",
      correction: "u2.l4.p1.maria.mp3",
      question: "Where is Maria?",
      answers: [
        { text: "She is at the hospital.", correct: false },
        { text: "She is at the movie theater.", correct: false },
        { text: "She is at the library.", correct: true }
      ]
    },
    {
      dialogue: "u2.l4.p1.dial6.mp3",
      correction: "u2.l4.p1.david.mp3",
      question: "Where is David?",
      answers: [
        { text: "He is at the movie theater.", correct: false },
        { text: "He is at the hospital.", correct: true },
        { text: "He is at the library.", correct: false }
      ]
    },
    {
      dialogue: "u2.l4.p1.dial7.mp3",
      correction: "u2.l4.p1.sofia.mp3",
      question: "Where is Sofia?",
      answers: [
        { text: "She is at the hospital.", correct: false },
        { text: "She is at the library.", correct: false },
        { text: "She is at the movie theater.", correct: true }
      ]
    },
    {
      dialogue: "u2.l4.p1.dial8.mp3",
      correction: "u2.l4.p1.michael.mp3",
      question: "Where is Michael?",
      answers: [
        { text: "He is at the hospital.", correct: false },
        { text: "He is at the library.", correct: false },
        { text: "He is at the movie theater.", correct: true }
      ]
    },
    {
      dialogue: "u2.l4.p1.dial9.mp3",
      correction: "u2.l4.p1.laura.mp3",
      question: "Where is Laura?",
      answers: [
        { text: "She is at the hospital.", correct: true },
        { text: "She is at the library.", correct: false },
        { text: "She is at the movie theater.", correct: false }
      ]
    },
    {
      dialogue: "u2.l4.p1.dial10.mp3",
      correction: "u2.l4.p1.daniel.mp3",
      question: "Where is Daniel?",
      answers: [
        { text: "He is at the hospital.", correct: false },
        { text: "He is at the movie theater.", correct: true },
        { text: "He is at the library.", correct: false }
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

  // progress step navigation
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
    // language-neutral tokens only
    statusText.textContent = token;
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

    // delay before replay
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

    // hide Q/A until dialogue is played
    showQA(false);

    // shuffle answers each exercise
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
          clearPendingTimers(); // ✅ kills any pending wrong replay/clear timers

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
          // wrong: show red briefly, then clear, then replay (if still same exercise)
          btn.classList.add("wrong");
          btn.disabled = true;

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

  // play button: play dialogue then reveal Q/A
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

  // ---- INIT: shuffle dialogues on every page load ----
  (function init() {
    const shuffled = shuffle(EXERCISES);
    EXERCISES.length = 0;
    EXERCISES.push(...shuffled);

    idx = 0;
    renderExercise();
  })();
})();