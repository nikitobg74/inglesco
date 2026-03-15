// js/u4/u4_l6_p1.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  const EXERCISES = [
    {
      image: "u4.l6.p1.noisy.jpg",
      dialogAudio: "u4.l6.p1.noisy.dial.mp3",
      lines: [
        { speaker: "A", text: "Tell me about your neighbours. Are they quiet?" },
        { speaker: "B", text: "No, they are not. They are very noisy." }
      ],
      word: "noisy neighbours",
      vocabAudio: "u4.l6.p1.noisy2.mp3"
    },
    {
      image: "u4.l6.p1.pretty.sister.jpg",
      dialogAudio: "u4.l6.p1.pretty.mp3",
      lines: [
        { speaker: "A", text: "Tell me about your sister. Is she pretty?" },
        { speaker: "B", text: "Yes, she is. She is very pretty." }
      ],
      word: "pretty",
      vocabAudio: "u4.l6.p1.pretty2.mp3"
    },
    {
      image: "u4.l6.p1.handsome.jpg",
      dialogAudio: "u4.l6.p1.handsome.mp3",
      lines: [
        { speaker: "A", text: "Tell me about your brother. Is he handsome?" },
        { speaker: "B", text: "Yes, he is. He is very handsome." }
      ],
      word: "handsome",
      vocabAudio: "u4.l6.p1.handsome2.mp3"
    },
    {
      image: "u4.l6.p1.ugly.jpg",
      dialogAudio: "u4.l6.p1.ugly.mp3",
      lines: [
        { speaker: "A", text: "Tell me about your house. Is it pretty?" },
        { speaker: "B", text: "No, it is not. It is old and ugly." }
      ],
      word: "ugly",
      vocabAudio: "u4.l6.p1.ugly2.mp3"
    },
    {
      image: "u4.l6.p1.noisy.dog.jpg",
      dialogAudio: "u4.l6.p1.noisy.dog.mp3",
      lines: [
        { speaker: "A", text: "Tell me about your dog. Is it quiet?" },
        { speaker: "B", text: "No, it is not. It is very noisy." }
      ],
      word: "noisy dog",
      vocabAudio: "u4.l6.p1.noisy.dog2.mp3"
    },
    {
      image: "u4.l6.p1.test.jpg",
      dialogAudio: "u4.l6.p1.test.mp3",
      lines: [
        { speaker: "A", text: "Tell me about your English test. Is it easy?" },
        { speaker: "B", text: "No, it is not. It is difficult." }
      ],
      word: "difficult",
      vocabAudio: "u4.l6.p1.difficult.mp3"
    }
  ];

  let current = 0;
  let dialogAudio = null;
  let vocabAudio = null;
  let dialogPlaying = false;
  let vocabPlaying = false;
  let dialogTimers = [];
  let wordUnlocked = false;
  let vocabHeard = false;

  const exerciseImage = document.getElementById("exerciseImage");
  const dialogPlayBtn = document.getElementById("dialogPlayBtn");
  const dialogAudioSub = document.getElementById("dialogAudioSub");
  const scriptNote = document.getElementById("scriptNote");
  const scriptLinesEl = document.getElementById("scriptLines");
  const wordStage = document.getElementById("wordStage");
  const bigWord = document.getElementById("bigWord");
  const wordPlayBtn = document.getElementById("wordPlayBtn");
  const wordNote = document.getElementById("wordNote");
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

  function clearTimers() {
    dialogTimers.forEach(t => clearTimeout(t));
    dialogTimers = [];
  }

  function clearHighlights() {
    scriptLinesEl.querySelectorAll(".script-line").forEach(line => {
      line.classList.remove("active-line");
    });
  }

  function stopDialogUI(message = "Toca ▶ para escuchar") {
    dialogPlaying = false;
    dialogPlayBtn.innerHTML = "▶";
    dialogPlayBtn.classList.remove("playing");
    dialogAudioSub.textContent = message;
    clearTimers();
    clearHighlights();
  }

  function stopVocabUI(message = "Toca para escuchar la palabra o frase") {
    vocabPlaying = false;
    wordPlayBtn.classList.remove("playing");
    wordPlayBtn.textContent = vocabHeard ? "✅ Escuchado" : "🔊 Escuchar palabra";
    if (vocabHeard) wordPlayBtn.classList.add("done");
    wordNote.textContent = message;
  }

  function renderLines(lines) {
    scriptLinesEl.innerHTML = "";
    lines.forEach(({ speaker, text }) => {
      const row = document.createElement("div");
      row.className = "script-line";

      const sp = document.createElement("div");
      sp.className = "speaker " + speaker.toLowerCase();
      sp.textContent = speaker + ":";

      const tx = document.createElement("div");
      tx.className = "line-text";
      tx.textContent = text;

      row.appendChild(sp);
      row.appendChild(tx);
      scriptLinesEl.appendChild(row);
    });
  }

  function showWordStage(exercise) {
    wordUnlocked = true;
    bigWord.textContent = exercise.word;
    wordStage.classList.add("show");
    scriptNote.textContent = "Ahora escucha la palabra o frase grande.";
    wordNote.textContent = "Toca el botón verde para escuchar.";
  }

  function enableNextIfReady() {
    if (!vocabHeard) return;
    nextBtn.disabled = false;
    nextBtn.classList.add("ready");
  }

  function attachAudioHandlers() {
    if (dialogAudio) {
      dialogAudio.addEventListener("ended", () => {
        stopDialogUI("¡Escuchado! Toca para repetir");
        showWordStage(EXERCISES[current]);
      });
      dialogAudio.addEventListener("pause", () => {
        if (!dialogPlaying) return;
        clearTimers();
        clearHighlights();
      });
      dialogAudio.addEventListener("error", () => {
        stopDialogUI("Audio no disponible");
      });
    }

    if (vocabAudio) {
      vocabAudio.addEventListener("ended", () => {
        vocabHeard = true;
        stopVocabUI("¡Muy bien! Ya puedes continuar.");
        enableNextIfReady();
      });
      vocabAudio.addEventListener("error", () => {
        wordNote.textContent = "Audio no disponible";
      });
    }
  }

  function loadExercise(index) {
    current = index;
    const exercise = EXERCISES[index];

    clearTimers();
    if (dialogAudio) dialogAudio.pause();
    if (vocabAudio) vocabAudio.pause();

    dialogAudio = new Audio(AUD + exercise.dialogAudio);
    dialogAudio.preload = "auto";
    vocabAudio = new Audio(AUD + exercise.vocabAudio);
    vocabAudio.preload = "auto";

    dialogPlaying = false;
    vocabPlaying = false;
    wordUnlocked = false;
    vocabHeard = false;

    attachAudioHandlers();

    counterEl.textContent = `${index + 1} / ${EXERCISES.length}`;
    progressBar.style.width = ((index + 1) / EXERCISES.length * 100) + "%";

    exerciseImage.style.display = "block";
    exerciseImage.src = IMG + exercise.image;
    exerciseImage.alt = exercise.word;

    renderLines(exercise.lines);
    scriptLinesEl.querySelectorAll(".script-line").forEach(line => line.classList.remove("show", "active-line"));

    dialogPlayBtn.innerHTML = "▶";
    dialogPlayBtn.classList.remove("playing", "done");
    dialogAudioSub.textContent = "Escucha y lee";

    wordStage.classList.remove("show");
    bigWord.textContent = "";
    wordPlayBtn.classList.remove("playing", "done");
    wordPlayBtn.textContent = "🔊 Escuchar palabra";
    wordNote.textContent = "Primero escucha el diálogo.";

    nextBtn.disabled = true;
    nextBtn.classList.remove("ready");
  }

  dialogPlayBtn.addEventListener("click", () => {
    const exercise = EXERCISES[current];
    if (!dialogAudio) return;

    if (dialogPlaying) {
      dialogAudio.pause();
      stopDialogUI("Toca ▶ para continuar");
      return;
    }

    if (vocabPlaying && vocabAudio) {
      vocabAudio.pause();
      stopVocabUI("Toca otra vez para escuchar.");
    }

    dialogAudio.currentTime = 0;
    dialogAudio.play().catch(() => {});
    dialogPlaying = true;
    dialogPlayBtn.innerHTML = "⏸";
    dialogPlayBtn.classList.add("playing");
    dialogPlayBtn.classList.remove("done");
    dialogAudioSub.textContent = "Escuchando...";
    wordStage.classList.remove("show");
    clearTimers();
    clearHighlights();

    const lines = Array.from(scriptLinesEl.querySelectorAll(".script-line"));
    lines.forEach(line => line.classList.add("show"));

    const duration = dialogAudio.duration && Number.isFinite(dialogAudio.duration) ? dialogAudio.duration : 7;
    const step = duration / Math.max(lines.length, 1);

    lines.forEach((_, i) => {
      const timer = setTimeout(() => {
        clearHighlights();
        if (lines[i]) lines[i].classList.add("active-line");
      }, i * step * 1000);
      dialogTimers.push(timer);
    });
  });

  wordPlayBtn.addEventListener("click", () => {
    if (!wordUnlocked || !vocabAudio) return;

    if (vocabPlaying) {
      vocabAudio.pause();
      vocabPlaying = false;
      stopVocabUI("Toca otra vez para escuchar.");
      return;
    }

    if (dialogPlaying && dialogAudio) {
      dialogAudio.pause();
      stopDialogUI("Toca ▶ para escuchar");
    }

    vocabAudio.currentTime = 0;
    vocabAudio.play().catch(() => {});
    vocabPlaying = true;
    wordPlayBtn.classList.remove("done");
    wordPlayBtn.classList.add("playing");
    wordPlayBtn.textContent = "⏸ Escuchando";
    wordNote.textContent = "Escuchando la palabra o frase...";
  });

  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    const nextIndex = current + 1;
    if (nextIndex >= EXERCISES.length) {
      slideArea.style.display = "none";
      endScreen.classList.add("show");
    } else {
      loadExercise(nextIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  loadExercise(0);
})();
