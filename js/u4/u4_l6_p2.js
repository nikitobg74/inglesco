// js/u4/u4_l6_p2.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG = BASE + "images/u4/";
  const AUD = BASE + "audio/u4/";

  const EXERCISES = [
    {
      image: "u4.l6.p1.noisy.jpg",
      audio: "u4.l6.p1.noisy.dial.mp3",
      prompt: "Tell me about your neighbours.",
      question: ["Are", "they", "quiet?"],
      answer1: ["No,", "they", "are not."],
      answer2: ["They", "are", "very", "noisy."]
    },
    {
      image: "u4.l6.p1.pretty.sister.jpg",
      audio: "u4.l6.p1.pretty.mp3",
      prompt: "Tell me about your sister.",
      question: ["Is", "she", "pretty?"],
      answer1: ["Yes,", "she", "is."],
      answer2: ["She", "is", "very", "pretty."]
    },
    {
      image: "u4.l6.p1.handsome.jpg",
      audio: "u4.l6.p1.handsome.mp3",
      prompt: "Tell me about your brother.",
      question: ["Is", "he", "handsome?"],
      answer1: ["Yes,", "he", "is."],
      answer2: ["He", "is", "very", "handsome."]
    },
    {
      image: "u4.l6.p1.ugly.jpg",
      audio: "u4.l6.p1.ugly.mp3",
      prompt: "Tell me about your house.",
      question: ["Is", "it", "pretty?"],
      answer1: ["No,", "it", "is not."],
      answer2: ["It", "is", "old", "and", "ugly."]
    },
    {
      image: "u4.l6.p1.noisy.dog.jpg",
      audio: "u4.l6.p1.noisy.dog.mp3",
      prompt: "Tell me about your dog.",
      question: ["Is", "it", "quiet?"],
      answer1: ["No,", "it", "is", "not."],
      answer2: ["It", "is", "very", "noisy."]
    },
    {
      image: "u4.l6.p1.test.jpg",
      audio: "u4.l6.p1.test.mp3",
      prompt: "Tell me about your English test.",
      question: ["Is", "it", "easy?"],
      answer1: ["No,", "it", "is", "not."],
      answer2: ["It", "is", "difficult."]
    }
  ];

  let current = 0;
  let currentAudio = null;
  let audioPlaying = false;
  let qSelected = [];
  let a1Selected = [];
  let a2Selected = [];
  let qSolved = false;
  let a1Solved = false;
  let a2Solved = false;

  const exerciseImage = document.getElementById("exerciseImage");
  const audioPlayBtn = document.getElementById("audioPlayBtn");
  const audioSub = document.getElementById("audioSub");
  const promptEl = document.getElementById("promptText");
  const questionPhase = document.getElementById("questionPhase");
  const answer1Phase = document.getElementById("answer1Phase");
  const answer2Phase = document.getElementById("answer2Phase");
  const qSlotsEl = document.getElementById("qSlots");
  const a1SlotsEl = document.getElementById("a1Slots");
  const a2SlotsEl = document.getElementById("a2Slots");
  const qTilesEl = document.getElementById("qTiles");
  const a1TilesEl = document.getElementById("a1Tiles");
  const a2TilesEl = document.getElementById("a2Tiles");
  const qFeedbackEl = document.getElementById("qFeedback");
  const a1FeedbackEl = document.getElementById("a1Feedback");
  const a2FeedbackEl = document.getElementById("a2Feedback");
  const nextBtn = document.getElementById("nextBtn");
  const counterEl = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const slideArea = document.getElementById("slideArea");
  const endScreen = document.getElementById("endScreen");

  document.getElementById("vocabToggle").addEventListener("click", () => {
    const body = document.getElementById("vocabBody");
    const chevron = document.getElementById("vocabChevron");
    const open = body.classList.toggle("open");
    chevron.textContent = open ? "▲" : "▼";
  });

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildSlots(container, count) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const slot = document.createElement("div");
      slot.className = "slot";
      container.appendChild(slot);
    }
  }

  function getSlots(container) {
    return Array.from(container.querySelectorAll(".slot"));
  }

  function buildTiles(container, words, onTap, extraClass = "") {
    container.innerHTML = "";
    shuffle(words).forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile-btn" + (extraClass ? " " + extraClass : "");
      btn.textContent = word;
      btn.dataset.word = word;
      btn.addEventListener("click", () => onTap(btn));
      container.appendChild(btn);
    });
  }

  function stopAudioUI(message = "Toca ▶ para escuchar") {
    audioPlaying = false;
    audioPlayBtn.innerHTML = "▶";
    audioPlayBtn.classList.remove("playing");
    audioSub.textContent = message;
  }

  function playCurrentAudio() {
    if (audioPlaying && currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      stopAudioUI("Toca ▶ para escuchar");
      return;
    }

    const ex = EXERCISES[current];
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(AUD + ex.audio);
    currentAudio.preload = "auto";
    currentAudio.play().then(() => {
      audioPlaying = true;
      audioPlayBtn.innerHTML = "⏸";
      audioPlayBtn.classList.add("playing");
      audioPlayBtn.classList.remove("done");
      audioSub.textContent = "Escuchando...";
    }).catch(() => {
      stopAudioUI("Audio no disponible");
    });

    currentAudio.addEventListener("ended", () => {
      audioPlaying = false;
      audioPlayBtn.innerHTML = "▶";
      audioPlayBtn.classList.remove("playing");
      audioPlayBtn.classList.add("done");
      audioSub.textContent = "¡Escuchado! Toca para repetir";
    });

    currentAudio.addEventListener("error", () => {
      stopAudioUI("Audio no disponible");
    });
  }

  function resetPhase(slotsEl, tilesEl, selectedArr, feedbackEl) {
    selectedArr.length = 0;
    getSlots(slotsEl).forEach(slot => {
      slot.textContent = "";
      slot.className = "slot";
    });
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    tilesEl.querySelectorAll(".tile-btn").forEach(btn => {
      btn.disabled = false;
      btn.classList.remove("used");
    });
  }

  function shakeSlots(slotsEl) {
    getSlots(slotsEl).forEach(slot => {
      slot.classList.add("shake");
      setTimeout(() => slot.classList.remove("shake"), 450);
    });
  }

  function showPhase(phaseEl) {
    phaseEl.style.display = "block";
    requestAnimationFrame(() => phaseEl.classList.add("show"));
    setTimeout(() => {
      phaseEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  }

  function hidePhase(phaseEl) {
    phaseEl.classList.remove("show");
    phaseEl.style.display = "none";
  }

  function loadExercise(index) {
    const ex = EXERCISES[index];
    qSelected = [];
    a1Selected = [];
    a2Selected = [];
    qSolved = false;
    a1Solved = false;
    a2Solved = false;

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    stopAudioUI();

    counterEl.textContent = `${index + 1} / ${EXERCISES.length}`;
    progressBar.style.width = `${((index + 1) / EXERCISES.length) * 100}%`;

    exerciseImage.src = IMG + ex.image;
    exerciseImage.alt = ex.prompt;
    promptEl.textContent = ex.prompt;

    buildSlots(qSlotsEl, ex.question.length);
    buildTiles(qTilesEl, ex.question, btn => handleTap(btn, ex.question, qSelected, qSlotsEl, qTilesEl, qFeedbackEl, "q"));
    qFeedbackEl.textContent = "";
    qFeedbackEl.className = "feedback";

    buildSlots(a1SlotsEl, ex.answer1.length);
    buildTiles(a1TilesEl, ex.answer1, btn => handleTap(btn, ex.answer1, a1Selected, a1SlotsEl, a1TilesEl, a1FeedbackEl, "a1"), "answer-tile");
    a1FeedbackEl.textContent = "";
    a1FeedbackEl.className = "feedback";

    buildSlots(a2SlotsEl, ex.answer2.length);
    buildTiles(a2TilesEl, ex.answer2, btn => handleTap(btn, ex.answer2, a2Selected, a2SlotsEl, a2TilesEl, a2FeedbackEl, "a2"), "answer-tile");
    a2FeedbackEl.textContent = "";
    a2FeedbackEl.className = "feedback";

    showPhase(questionPhase);
    hidePhase(answer1Phase);
    hidePhase(answer2Phase);

    nextBtn.disabled = true;
    nextBtn.classList.remove("ready");
  }

  function handleTap(btn, correctOrder, selected, slotsEl, tilesEl, feedbackEl, phase) {
    if (btn.disabled) return;
    if ((phase === "q" && qSolved) || (phase === "a1" && a1Solved) || (phase === "a2" && a2Solved)) return;

    const word = btn.dataset.word;
    const position = selected.length;
    if (position >= correctOrder.length) return;

    selected.push(word);
    const slots = getSlots(slotsEl);
    slots[position].textContent = word;
    slots[position].classList.add("filled");
    btn.disabled = true;
    btn.classList.add("used");

    if (selected.length === correctOrder.length) {
      const correct = correctOrder.every((word, i) => word.toLowerCase() === selected[i].toLowerCase());

      if (correct) {
        slots.forEach(slot => slot.classList.add("correct"));
        feedbackEl.textContent = "¡Correcto! 🎉";
        feedbackEl.className = "feedback correct";
        tilesEl.querySelectorAll(".tile-btn").forEach(tile => tile.disabled = true);

        if (phase === "q") {
          qSolved = true;
          setTimeout(() => showPhase(answer1Phase), 500);
        } else if (phase === "a1") {
          a1Solved = true;
          setTimeout(() => showPhase(answer2Phase), 500);
        } else {
          a2Solved = true;
          setTimeout(() => {
            nextBtn.disabled = false;
            nextBtn.classList.add("ready");
          }, 350);
        }
      } else {
        shakeSlots(slotsEl);
        feedbackEl.textContent = "¡Inténtalo de nuevo!";
        feedbackEl.className = "feedback wrong";
        setTimeout(() => resetPhase(slotsEl, tilesEl, selected, feedbackEl), 800);
      }
    }
  }

  audioPlayBtn.addEventListener("click", playCurrentAudio);

  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    current += 1;
    if (current >= EXERCISES.length) {
      slideArea.style.display = "none";
      endScreen.classList.add("show");
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      stopAudioUI();
    } else {
      loadExercise(current);
    }
  });

  loadExercise(0);
})();
