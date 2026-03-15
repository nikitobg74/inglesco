// js/u4/u4_l5_p5.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  const EXERCISES = [
    {
      image: "u4.l5.p5.computer.jpg",
      audio: "u4.l5.p5.computer.mp3",
      prompt: "Tell me about your computer.",
      question: ["Is", "it", "new?"],
      answer: ["No,", "it", "is not."],
      fact: ["It", "is", "old."]
    },
    {
      image: "u4.l5.p5.brother.jpg",
      audio: "u4.l5.p5.brother.mp3",
      prompt: "Tell me about your brother.",
      question: ["Is", "he", "married?"],
      answer: ["No,", "he", "is not."],
      fact: ["He", "is", "single."]
    },
    {
      image: "u4.l5.p5.sister.jpg",
      audio: "u4.l5.p5.sister.mp3",
      prompt: "Tell me about your sister.",
      question: ["Is", "she", "single?"],
      answer: ["No,", "she", "is not."],
      fact: ["She", "is", "married."]
    },
    {
      image: "u4.l5.p5.apartment.jpg",
      audio: "u4.l5.p5.apartment.mp3",
      prompt: "Tell me about your apartment.",
      question: ["Is", "it", "small?"],
      answer: ["No,", "it", "is not."],
      fact: ["It", "is", "big."]
    },
    {
      image: "u4.l5.p5.restaurant.jpg",
      audio: "u4.l5.p5.restaurant.mp3",
      prompt: "Tell me about the new restaurant.",
      question: ["Is", "it", "cheap?"],
      answer: ["No,", "it", "is not."],
      fact: ["It", "is", "expensive."]
    },
    {
      image: "u4.l5.p5.slow.car.jpg",
      audio: "u4.l5.p5.slow.mp3",
      prompt: "Tell me about your car.",
      question: ["Is", "it", "fast?"],
      answer: ["No,", "it", "is not."],
      fact: ["It", "is", "slow."]
    }
  ];

  let current = 0;
  let audioPlaying = false;
  let lineTimers = [];
  let qSelected = [];
  let aSelected = [];
  let fSelected = [];
  let qSolved = false;
  let aSolved = false;
  let fSolved = false;
  let currentAudio = null;

  const exerciseImage = document.getElementById("exerciseImage");
  const audioPlayBtn = document.getElementById("audioPlayBtn");
  const audioSub = document.getElementById("audioSub");
  const scriptNote = document.getElementById("scriptNote");
  const scriptLinesEl = document.getElementById("scriptLines");
  const questionPhase = document.getElementById("questionPhase");
  const answerPhase = document.getElementById("answerPhase");
  const factPhase = document.getElementById("factPhase");
  const qSlotsEl = document.getElementById("qSlots");
  const aSlotsEl = document.getElementById("aSlots");
  const fSlotsEl = document.getElementById("fSlots");
  const qTilesEl = document.getElementById("qTiles");
  const aTilesEl = document.getElementById("aTiles");
  const fTilesEl = document.getElementById("fTiles");
  const qFeedbackEl = document.getElementById("qFeedback");
  const aFeedbackEl = document.getElementById("aFeedback");
  const fFeedbackEl = document.getElementById("fFeedback");
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

  function clearLineTimers() {
    lineTimers.forEach(timer => clearTimeout(timer));
    lineTimers = [];
  }

  function clearLineHighlights() {
    scriptLinesEl.querySelectorAll(".script-line").forEach(line => line.classList.remove("active-line"));
  }

  function highlightLine(index) {
    clearLineHighlights();
    const lines = scriptLinesEl.querySelectorAll(".script-line");
    if (lines[index]) lines[index].classList.add("active-line");
  }

  function stopAudioUI(message = "Toca ▶ para escuchar") {
    audioPlaying = false;
    audioPlayBtn.innerHTML = "▶";
    audioPlayBtn.classList.remove("playing");
    audioSub.textContent = message;
    clearLineTimers();
    clearLineHighlights();
  }

  function renderPrompt(exercise) {
    scriptLinesEl.innerHTML = "";
    scriptNote.textContent = "Escucha. Luego construye la pregunta y la respuesta.";

    const row = document.createElement("div");
    row.className = "script-line";

    const speaker = document.createElement("div");
    speaker.className = "speaker a";
    speaker.textContent = "A:";

    const text = document.createElement("div");
    text.className = "line-text";
    text.textContent = exercise.prompt;

    row.appendChild(speaker);
    row.appendChild(text);
    scriptLinesEl.appendChild(row);
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

  function solvePhase(phase) {
    if (phase === "q") {
      qSolved = true;
      setTimeout(() => {
        answerPhase.classList.remove("hidden");
        answerPhase.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 450);
      return;
    }

    if (phase === "a") {
      aSolved = true;
      setTimeout(() => {
        factPhase.classList.remove("hidden");
        factPhase.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 450);
      return;
    }

    fSolved = true;
    setTimeout(() => {
      nextBtn.disabled = false;
      nextBtn.classList.add("ready");
    }, 300);
  }

  function handleTap(btn, correctOrder, selected, slotsEl, tilesEl, feedbackEl, phase) {
    if (btn.disabled) return;
    if (phase === "q" && qSolved) return;
    if (phase === "a" && aSolved) return;
    if (phase === "f" && fSolved) return;

    const pos = selected.length;
    if (pos >= correctOrder.length) return;

    selected.push(btn.dataset.word);
    const slots = getSlots(slotsEl);
    slots[pos].textContent = btn.dataset.word;
    slots[pos].classList.add("filled");
    btn.disabled = true;
    btn.classList.add("used");

    if (selected.length === correctOrder.length) {
      const correct = correctOrder.every((word, index) => word.toLowerCase() === selected[index].toLowerCase());

      if (correct) {
        slots.forEach(slot => slot.classList.add("correct"));
        feedbackEl.textContent = "¡Correcto! 🎉";
        feedbackEl.className = "feedback correct";
        tilesEl.querySelectorAll(".tile-btn").forEach(tile => { tile.disabled = true; });
        solvePhase(phase);
      } else {
        feedbackEl.textContent = "¡Inténtalo de nuevo!";
        feedbackEl.className = "feedback wrong";
        shakeSlots(slotsEl);
        setTimeout(() => resetPhase(slotsEl, tilesEl, selected, feedbackEl), 800);
      }
    }
  }

  function loadExercise(index) {
    const exercise = EXERCISES[index];
    current = index;
    qSelected = [];
    aSelected = [];
    fSelected = [];
    qSolved = false;
    aSolved = false;
    fSolved = false;

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(AUD + exercise.audio);
    currentAudio.preload = "auto";

    currentAudio.addEventListener("ended", () => {
      audioPlaying = false;
      audioPlayBtn.innerHTML = "▶";
      audioPlayBtn.classList.remove("playing");
      audioPlayBtn.classList.add("done");
      audioSub.textContent = "¡Escuchado! Toca para repetir";
      clearLineTimers();
      clearLineHighlights();
    });

    currentAudio.addEventListener("error", () => {
      stopAudioUI("Audio no disponible");
    });

    exerciseImage.src = IMG + exercise.image;
    renderPrompt(exercise);

    counterEl.textContent = `${index + 1} / ${EXERCISES.length}`;
    progressBar.style.width = `${((index + 1) / EXERCISES.length) * 100}%`;

    questionPhase.classList.remove("hidden");
    answerPhase.classList.add("hidden");
    factPhase.classList.add("hidden");
    qFeedbackEl.textContent = "";
    qFeedbackEl.className = "feedback";
    aFeedbackEl.textContent = "";
    aFeedbackEl.className = "feedback";
    fFeedbackEl.textContent = "";
    fFeedbackEl.className = "feedback";

    nextBtn.disabled = true;
    nextBtn.classList.remove("ready");

    buildSlots(qSlotsEl, exercise.question.length);
    buildTiles(qTilesEl, exercise.question, (btn) => handleTap(btn, exercise.question, qSelected, qSlotsEl, qTilesEl, qFeedbackEl, "q"));

    buildSlots(aSlotsEl, exercise.answer.length);
    buildTiles(aTilesEl, exercise.answer, (btn) => handleTap(btn, exercise.answer, aSelected, aSlotsEl, aTilesEl, aFeedbackEl, "a"), "answer-tile");

    buildSlots(fSlotsEl, exercise.fact.length);
    buildTiles(fTilesEl, exercise.fact, (btn) => handleTap(btn, exercise.fact, fSelected, fSlotsEl, fTilesEl, fFeedbackEl, "f"), "fact-tile");

    stopAudioUI();
  }

  audioPlayBtn.addEventListener("click", () => {
    if (!currentAudio) return;

    if (audioPlaying) {
      currentAudio.pause();
      stopAudioUI("Toca ▶ para escuchar");
      return;
    }

    currentAudio.currentTime = 0;
    currentAudio.play().catch(() => {
      stopAudioUI("Audio no disponible");
    });

    audioPlaying = true;
    audioPlayBtn.innerHTML = "⏸";
    audioPlayBtn.classList.add("playing");
    audioPlayBtn.classList.remove("done");
    audioSub.textContent = "Escuchando...";

    clearLineTimers();
    clearLineHighlights();

    const lines = scriptLinesEl.querySelectorAll(".script-line");
    if (!lines.length) return;

    const duration = currentAudio.duration && Number.isFinite(currentAudio.duration)
      ? currentAudio.duration
      : 3.5;

    const step = duration / lines.length;
    lines.forEach((_, index) => {
      const timer = setTimeout(() => highlightLine(index), index * step * 1000);
      lineTimers.push(timer);
    });
  });

  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;

    const nextIndex = current + 1;
    if (nextIndex >= EXERCISES.length) {
      slideArea.style.display = "none";
      endScreen.classList.add("show");
      return;
    }

    loadExercise(nextIndex);
  });

  loadExercise(0);
})();
