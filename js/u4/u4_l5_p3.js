// js/u4/u4_l5_p3.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const AUD  = BASE + "audio/u4/";

  const EXERCISES = [
    {
      prompt:   "Tell me about your brother.",
      question: ["Is", "he", "single?"],
      answer:   ["No,", "he", "is not."],
      fact:     "He is married."
    },
    {
      prompt:   "Tell me about your sister.",
      question: ["Is", "she", "married?"],
      answer:   ["No,", "she", "is not."],
      fact:     "She is single."
    },
  ];

  let current   = 0;
  let qSelected = [];
  let aSelected = [];
  let qSolved   = false;
  let aSolved   = false;

  const promptEl    = document.getElementById("promptText");
  const phase2Area  = document.getElementById("phase2Area");
  const qSlotsEl    = document.getElementById("qSlots");
  const aSlotsEl    = document.getElementById("aSlots");
  const qFeedbackEl = document.getElementById("qFeedback");
  const aFeedbackEl = document.getElementById("aFeedback");
  const qTilesEl    = document.getElementById("qTiles");
  const aTilesEl    = document.getElementById("aTiles");
  const nextBtn     = document.getElementById("nextBtn");
  const counterEl   = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const slideArea   = document.getElementById("slideArea");
  const endScreen   = document.getElementById("endScreen");
  const factBox     = document.getElementById("factBox");
  const factText    = document.getElementById("factText");

  const dialogAudio    = new Audio(AUD + "u4.l5.p3.tell.me.about.dialog.mp3");
  dialogAudio.preload  = "auto";
  const dialogPlayBtn  = document.getElementById("dialogPlayBtn");
  const dialogAudioSub = document.getElementById("dialogAudioSub");
  const dialogTextEl   = document.getElementById("dialogText");
  const dialogLines    = Array.from(document.querySelectorAll(".dialog-line"));
  let dialogPlaying    = false;
  let highlightTimers  = [];

  function clearDialogHighlight() {
    dialogLines.forEach(line => line.classList.remove("active-line"));
  }

  function highlightDialogLine(index) {
    clearDialogHighlight();
    if (dialogLines[index]) {
      dialogLines[index].classList.add("active-line");
    }
  }

  function clearHighlightTimers() {
    highlightTimers.forEach(t => clearTimeout(t));
    highlightTimers = [];
  }

  dialogAudio.addEventListener("ended", () => {
    dialogPlaying = false;
    dialogPlayBtn.innerHTML = "▶";
    dialogPlayBtn.classList.remove("playing");
    dialogPlayBtn.classList.add("done");
    dialogAudioSub.textContent = "¡Escuchado! Toca para repetir";
    clearHighlightTimers();
    clearDialogHighlight();
  });

  dialogAudio.addEventListener("pause", () => {
    if (!dialogPlaying) return;
    clearHighlightTimers();
    clearDialogHighlight();
  });

  dialogAudio.addEventListener("error", () => {
    dialogPlaying = false;
    dialogPlayBtn.innerHTML = "▶";
    dialogAudioSub.textContent = "Audio no disponible";
    clearHighlightTimers();
    clearDialogHighlight();
  });

  dialogPlayBtn.addEventListener("click", () => {
    if (dialogPlaying) {
      dialogAudio.pause();
      dialogPlaying = false;
      dialogPlayBtn.innerHTML = "▶";
      dialogPlayBtn.classList.remove("playing");
      dialogAudioSub.textContent = "Toca ▶ para continuar";
      clearHighlightTimers();
      clearDialogHighlight();
      return;
    }

    dialogAudio.currentTime = 0;
    dialogAudio.play().catch(() => {});
    dialogPlaying = true;
    dialogPlayBtn.innerHTML = "⏸";
    dialogPlayBtn.classList.add("playing");
    dialogPlayBtn.classList.remove("done");
    dialogAudioSub.textContent = "Escuchando...";
    dialogTextEl.classList.add("visible");

    clearHighlightTimers();
    clearDialogHighlight();

    const lineCount = dialogLines.length;
    const duration = dialogAudio.duration && Number.isFinite(dialogAudio.duration)
      ? dialogAudio.duration
      : 18;
    const step = duration / lineCount;

    dialogLines.forEach((_, i) => {
      const timer = setTimeout(() => {
        highlightDialogLine(i);
      }, i * step * 1000);
      highlightTimers.push(timer);
    });
  });

  document.getElementById("vocabToggle").addEventListener("click", () => {
    const body    = document.getElementById("vocabBody");
    const chevron = document.getElementById("vocabChevron");
    const open    = body.classList.toggle("open");
    chevron.textContent = open ? "▲" : "▼";
  });

  function buildSlots(container, count) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      s.className = "slot";
      s.dataset.index = i;
      container.appendChild(s);
    }
  }

  function getSlots(container) {
    return Array.from(container.querySelectorAll(".slot"));
  }

  function buildTiles(container, words, onTap, extraClass) {
    container.innerHTML = "";
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    shuffled.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile-btn" + (extraClass ? " " + extraClass : "");
      btn.textContent = word;
      btn.dataset.word = word;
      btn.addEventListener("click", () => onTap(btn));
      container.appendChild(btn);
    });
  }

  function shakeSlots(slotsEl) {
    getSlots(slotsEl).forEach(s => {
      s.classList.add("shake");
      setTimeout(() => s.classList.remove("shake"), 450);
    });
  }

  function resetPhase(slotsEl, tilesEl, selectedArr, feedbackEl) {
    selectedArr.length = 0;
    getSlots(slotsEl).forEach(s => {
      s.textContent = "";
      s.className = "slot";
    });
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    tilesEl.querySelectorAll(".tile-btn").forEach(b => {
      b.disabled = false;
      b.classList.remove("used");
    });
  }

  function loadExercise(idx) {
    const ex = EXERCISES[idx];
    qSelected = [];
    aSelected = [];
    qSolved   = false;
    aSolved   = false;

    counterEl.textContent   = `${idx + 1} / ${EXERCISES.length}`;
    progressBar.style.width = ((idx + 1) / EXERCISES.length * 100) + "%";

    promptEl.textContent = ex.prompt;
    factText.textContent = "";
    factBox.classList.remove("show");

    buildSlots(qSlotsEl, ex.question.length);
    buildTiles(qTilesEl, ex.question, (btn) => handleTap(btn, ex.question, qSelected, qSlotsEl, qTilesEl, qFeedbackEl, "q"), "");
    qFeedbackEl.textContent = "";
    qFeedbackEl.className = "feedback";

    phase2Area.style.display = "none";
    buildSlots(aSlotsEl, ex.answer.length);
    buildTiles(aTilesEl, ex.answer, (btn) => handleTap(btn, ex.answer, aSelected, aSlotsEl, aTilesEl, aFeedbackEl, "a"), "phase2-tile");
    aFeedbackEl.textContent = "";
    aFeedbackEl.className = "feedback";

    nextBtn.disabled = true;
    nextBtn.classList.remove("ready");
  }

  function handleTap(btn, correctOrder, selected, slotsEl, tilesEl, feedbackEl, phase) {
    if (btn.disabled) return;
    if (phase === "q" && qSolved) return;
    if (phase === "a" && aSolved) return;

    const ex   = EXERCISES[current];
    const word = btn.dataset.word;
    const pos  = selected.length;
    if (pos >= correctOrder.length) return;

    selected.push(word);
    const slots = getSlots(slotsEl);
    slots[pos].textContent = word;
    slots[pos].classList.add("filled");
    btn.disabled = true;
    btn.classList.add("used");

    if (selected.length === correctOrder.length) {
      const correct = correctOrder.every((w, i) => w.toLowerCase() === selected[i].toLowerCase());

      if (correct) {
        slots.forEach(s => s.classList.add("correct"));
        feedbackEl.textContent = "¡Correcto! 🎉";
        feedbackEl.className   = "feedback correct";
        tilesEl.querySelectorAll(".tile-btn").forEach(b => b.disabled = true);

        if (phase === "q") {
          qSolved = true;
          setTimeout(() => {
            phase2Area.style.display = "block";
            phase2Area.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 600);
        } else {
          aSolved = true;
          factText.textContent = ex.fact;
          factBox.classList.add("show");
          setTimeout(() => {
            nextBtn.disabled = false;
            nextBtn.classList.add("ready");
          }, 400);
        }
      } else {
        shakeSlots(slotsEl);
        feedbackEl.textContent = "¡Inténtalo de nuevo!";
        feedbackEl.className   = "feedback wrong";
        setTimeout(() => resetPhase(slotsEl, tilesEl, selected, feedbackEl), 800);
      }
    }
  }

  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    current++;
    if (current >= EXERCISES.length) {
      showEnd();
    } else {
      loadExercise(current);
    }
  });

  function showEnd() {
    slideArea.style.display = "none";
    endScreen.classList.add("show");
  }

  loadExercise(0);
})();
