// js/u4/u4_l5_p3.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const AUD  = BASE + "audio/u4/";

  const EXERCISES = [
    {
      prompt:   "Tell me about your brother.",
      question: ["Is", "he", "single?"],
      answer1:  ["No,", "he", "is", "not."],
      answer2:  ["He", "is", "married."]
    },
    {
      prompt:   "Tell me about your sister.",
      question: ["Is", "she", "married?"],
      answer1:  ["No,", "she", "is", "not."],
      answer2:  ["She", "is", "single."]
    },
  ];

  let current   = 0;
  let qSelected = [];
  let aSelected = [];
  let fSelected = [];
  let qSolved   = false;
  let aSolved   = false;
  let fSolved   = false;

  const promptEl    = document.getElementById("promptText");
  const phase1Area  = document.getElementById("phase1Area");
  const phase2Area  = document.getElementById("phase2Area");
  const phase3Area  = document.getElementById("phase3Area");
  const qSlotsEl    = document.getElementById("qSlots");
  const aSlotsEl    = document.getElementById("aSlots");
  const fSlotsEl    = document.getElementById("fSlots");
  const qFeedbackEl = document.getElementById("qFeedback");
  const aFeedbackEl = document.getElementById("aFeedback");
  const fFeedbackEl = document.getElementById("fFeedback");
  const qTilesEl    = document.getElementById("qTiles");
  const aTilesEl    = document.getElementById("aTiles");
  const fTilesEl    = document.getElementById("fTiles");
  const nextBtn     = document.getElementById("nextBtn");
  const counterEl   = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const slideArea   = document.getElementById("slideArea");
  const endScreen   = document.getElementById("endScreen");

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

  function showPhase(el) {
    el.style.display = "block";
    requestAnimationFrame(() => el.classList.add("show"));
  }

  function hidePhase(el) {
    el.classList.remove("show");
    el.style.display = "none";
  }

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

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildTiles(container, words, onTap, extraClass) {
    container.innerHTML = "";
    const shuffled = shuffleArray(words);
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
    fSelected = [];
    qSolved   = false;
    aSolved   = false;
    fSolved   = false;

    counterEl.textContent   = `${idx + 1} / ${EXERCISES.length}`;
    progressBar.style.width = ((idx + 1) / EXERCISES.length * 100) + "%";

    promptEl.textContent = ex.prompt;

    buildSlots(qSlotsEl, ex.question.length);
    buildTiles(qTilesEl, ex.question, (btn) => handleTap(btn, ex.question, qSelected, qSlotsEl, qTilesEl, qFeedbackEl, "q"), "");
    qFeedbackEl.textContent = "";
    qFeedbackEl.className = "feedback";

    buildSlots(aSlotsEl, ex.answer1.length);
    buildTiles(aTilesEl, ex.answer1, (btn) => handleTap(btn, ex.answer1, aSelected, aSlotsEl, aTilesEl, aFeedbackEl, "a"), "phase2-tile");
    aFeedbackEl.textContent = "";
    aFeedbackEl.className = "feedback";

    buildSlots(fSlotsEl, ex.answer2.length);
    buildTiles(fTilesEl, ex.answer2, (btn) => handleTap(btn, ex.answer2, fSelected, fSlotsEl, fTilesEl, fFeedbackEl, "f"), "phase2-tile");
    fFeedbackEl.textContent = "";
    fFeedbackEl.className = "feedback";

    showPhase(phase1Area);
    hidePhase(phase2Area);
    hidePhase(phase3Area);

    nextBtn.disabled = true;
    nextBtn.classList.remove("ready");
  }

  function handleTap(btn, correctOrder, selected, slotsEl, tilesEl, feedbackEl, phase) {
    if (btn.disabled) return;
    if (phase === "q" && qSolved) return;
    if (phase === "a" && aSolved) return;
    if (phase === "f" && fSolved) return;

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
            showPhase(phase2Area);
            phase2Area.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 450);
        } else if (phase === "a") {
          aSolved = true;
          setTimeout(() => {
            showPhase(phase3Area);
            phase3Area.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 450);
        } else if (phase === "f") {
          fSolved = true;
          setTimeout(() => {
            nextBtn.disabled = false;
            nextBtn.classList.add("ready");
          }, 350);
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
