// js/u4/u4_l5_p2.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const AUD  = BASE + "audio/u4/";

  // ── Exercises ─────────────────────────────────────────────────────────────
  // statement: shown to student
  // answer: correct order of the 3 tiles (verb, subject, adjective/noun)
  // audio: plays after correct answer
  const EXERCISES = [
    { statement: "Bill is tall.",         answer: ["Is", "Bill", "tall?"],      audio: AUD + "u4.l5.p2.bill.mp3" },
    { statement: "John is short.",        answer: ["Is", "John", "short?"],     audio: AUD + "u4.l5.p2.john.mp3" },
    { statement: "Kate is married.",      answer: ["Is", "Kate", "married?"],   audio: AUD + "u4.l5.p2.kate.mp3" },
    { statement: "Craig is single.",      answer: ["Is", "Craig", "single?"],   audio: AUD + "u4.l5.p2.craig.mp3" },
    { statement: "Your dog is big.",      answer: ["Is", "your dog", "big?"],   audio: AUD + "u4.l5.p2.dog.mp3" },
    { statement: "Her cat is small.",     answer: ["Is", "her cat", "small?"],  audio: AUD + "u4.l5.p2.cat.mp3" },
    { statement: "My house is new.",      answer: ["Is", "my house", "new?"],   audio: AUD + "u4.l5.p2.house.mp3" },
    { statement: "Their house is old.",   answer: ["Is", "their house", "old?"],audio: AUD + "u4.l5.p2.house.old.mp3" },
    { statement: "Her car is slow.",      answer: ["Is", "her car", "slow?"],   audio: AUD + "u4.l5.p2.car.mp3" },
    { statement: "His car is fast.",      answer: ["Is", "his car", "fast?"],   audio: AUD + "u4.l5.p2.car.fast.mp3" },
    { statement: "Your watch is expensive.", answer: ["Is", "your watch", "expensive?"], audio: AUD + "u4.l5.p2.expensive.mp3" },
    { statement: "His watch is cheap.",   answer: ["Is", "his watch", "cheap?"],audio: AUD + "u4.l5.p2.cheap.mp3" },
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let current    = 0;
  let selected   = [];   // tiles tapped so far (in order)
  let solved     = false;
  let audio      = new Audio();
  let isPlaying  = false;
  let playPromise = null;

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const statementEl = document.getElementById("statementText");
  const slot0       = document.getElementById("slot0");
  const slot1       = document.getElementById("slot1");
  const slot2       = document.getElementById("slot2");
  const slots       = [slot0, slot1, slot2];
  const tilesWrap   = document.getElementById("tilesWrap");
  const feedbackEl  = document.getElementById("feedback");
  const audioArea   = document.getElementById("audioArea");
  const playBtn     = document.getElementById("playBtn");
  const playLabel   = document.getElementById("playLabel");
  const nextBtn     = document.getElementById("nextBtn");
  const counterEl   = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const slideArea   = document.getElementById("slideArea");
  const endScreen   = document.getElementById("endScreen");

  // ── Vocab panel toggle ────────────────────────────────────────────────────
  document.getElementById("vocabToggle").addEventListener("click", () => {
    const body    = document.getElementById("vocabBody");
    const chevron = document.getElementById("vocabChevron");
    const open    = body.classList.toggle("open");
    chevron.textContent = open ? "▲" : "▼";
  });

  // ── Load exercise ─────────────────────────────────────────────────────────
  function loadExercise(idx) {
    const ex   = EXERCISES[idx];
    selected   = [];
    solved     = false;
    isPlaying  = false;

    // Counter & bar
    counterEl.textContent   = `${idx + 1} / ${EXERCISES.length}`;
    progressBar.style.width = ((idx + 1) / EXERCISES.length * 100) + "%";

    // Statement
    statementEl.textContent = ex.statement;

    // Reset slots
    slots.forEach(s => {
      s.textContent = "";
      s.className   = "slot";
    });

    // Reset feedback & audio
    feedbackEl.textContent  = "";
    feedbackEl.className    = "feedback";
    audioArea.style.display = "none";
    nextBtn.disabled        = true;
    nextBtn.classList.remove("ready");

    // Reset play btn
    playBtn.innerHTML = "▶";
    playBtn.classList.remove("playing", "done");
    playLabel.textContent = "Toca para escuchar la pregunta";

    // Build shuffled tiles
    tilesWrap.innerHTML = "";
    const shuffled = [...ex.answer].sort(() => Math.random() - 0.5);
    shuffled.forEach(word => {
      const btn = document.createElement("button");
      btn.className   = "tile-btn";
      btn.textContent = word;
      btn.dataset.word = word;
      btn.addEventListener("click", () => handleTileTap(btn, ex));
      tilesWrap.appendChild(btn);
    });

    // Load audio
    audio.pause();
    audio = new Audio(ex.audio);
    audio.preload = "auto";

    audio.addEventListener("ended", () => {
      isPlaying = false;
      playBtn.innerHTML = "▶";
      playBtn.classList.remove("playing");
      playBtn.classList.add("done");
      playLabel.textContent = "¡Escuchado! Toca para repetir";
      nextBtn.disabled = false;
      nextBtn.classList.add("ready");
    });

    audio.addEventListener("error", () => {
      isPlaying = false;
      playLabel.textContent = "Audio no disponible";
      playBtn.innerHTML = "▶";
      nextBtn.disabled = false;
      nextBtn.classList.add("ready");
    });
  }

  // ── Tile tap handler ──────────────────────────────────────────────────────
  function handleTileTap(btn, ex) {
    if (solved || btn.disabled) return;

    const word = btn.dataset.word;
    const pos  = selected.length;
    if (pos >= 3) return;

    // Place word in next slot
    selected.push(word);
    slots[pos].textContent = word;
    slots[pos].classList.add("filled");
    btn.disabled = true;
    btn.classList.add("used");

    // All 3 slots filled — check answer
    if (selected.length === 3) {
      const correct = ex.answer.every((w, i) => w === selected[i]);

      if (correct) {
        solved = true;
        slots.forEach(s => s.classList.add("correct"));
        feedbackEl.textContent = "¡Correcto! 🎉";
        feedbackEl.className   = "feedback correct";
        // Disable remaining tiles
        tilesWrap.querySelectorAll(".tile-btn").forEach(b => b.disabled = true);
        // Show audio after short delay
        setTimeout(() => {
          audioArea.style.display = "flex";
          playAudio();
        }, 500);
      } else {
        // Wrong — shake slots, then reset after animation
        slots.forEach(s => s.classList.add("shake"));
        feedbackEl.textContent = "¡Inténtalo de nuevo!";
        feedbackEl.className   = "feedback wrong";
        setTimeout(() => {
          // Reset slots and re-enable tiles
          selected = [];
          slots.forEach(s => {
            s.textContent = "";
            s.className   = "slot";
          });
          feedbackEl.textContent = "";
          feedbackEl.className   = "feedback";
          tilesWrap.querySelectorAll(".tile-btn").forEach(b => {
            b.disabled = false;
            b.classList.remove("used");
          });
        }, 800);
      }
    }
  }

  // ── Audio ─────────────────────────────────────────────────────────────────
  function playAudio() {
    if (isPlaying) return;
    isPlaying = true;
    playBtn.innerHTML = "⏸";
    playBtn.classList.add("playing");
    playBtn.classList.remove("done");
    playLabel.textContent = "Escuchando...";

    playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => { playPromise = null; }).catch(err => {
        if (err.name !== "AbortError") {
          isPlaying = false;
          playBtn.classList.remove("playing");
          playBtn.innerHTML = "▶";
          playLabel.textContent = "No se pudo reproducir.";
        }
        playPromise = null;
      });
    }
  }

  playBtn.addEventListener("click", () => {
    if (!solved) return;
    if (isPlaying) {
      if (playPromise) { playPromise.then(() => audio.pause()).catch(() => {}); playPromise = null; }
      else { audio.pause(); }
      isPlaying = false;
      playBtn.innerHTML = "▶";
      playBtn.classList.remove("playing");
      playLabel.textContent = "Toca ▶ para continuar";
      return;
    }
    audio.currentTime = 0;
    playAudio();
  });

  // ── Next ──────────────────────────────────────────────────────────────────
  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    audio.pause();
    isPlaying = false;
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

  // ── Init ──────────────────────────────────────────────────────────────────
  loadExercise(0);

})();
