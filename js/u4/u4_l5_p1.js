// js/u4/u4_l5_p1.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // ── Slides ────────────────────────────────────────────────────────────────
  const SLIDES = [
    {
      image:     IMG + "u4.l4.p2.brian.tall.jpg",
      statement: "He is tall.",
      question:  "Is he tall?",
      audio:     AUD + "u4.l5.p1.tall.mp3",
    },
    {
      image:     IMG + "u4.l4.p2.billy.short.jpg",
      statement: "He is short.",
      question:  "Is he short?",
      audio:     AUD + "u4.l5.p1.short.mp3",
    },
    {
      image:     IMG + "u4.l4.p1.single.jpg",
      statement: "He is single.",
      question:  "Is he single?",
      audio:     AUD + "u4.l5.p1.single.mp3",
    },
    {
      image:     IMG + "u4.l4.p1.married.jpg",
      statement: "She is married.",
      question:  "Is she married?",
      audio:     AUD + "u4.l5.p1.married.mp3",
    },
    {
      image:     IMG + "u4.l4.p1.old.couple.jpg",
      statement: "They are old.",
      question:  "Are they old?",
      audio:     AUD + "u4.l5.p1.old.mp3",
    },
    {
      image:     IMG + "u4.l4.p2.young.couple.jpg",
      statement: "They are young.",
      question:  "Are they young?",
      audio:     AUD + "u4.l5.p1.young.mp3",
    },
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let current     = 0;
  let audioPlayed = false;
  let isPlaying   = false;
  let playPromise = null;
  let audio       = new Audio();

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const slideImg    = document.getElementById("slideImg");
  const statementEl = document.getElementById("statementText");
  const questionEl  = document.getElementById("questionText");
  const playBtn     = document.getElementById("playBtn");
  const playLabel   = document.getElementById("playLabel");
  const nextBtn     = document.getElementById("nextBtn");
  const counterEl   = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const endScreen   = document.getElementById("endScreen");
  const slideArea   = document.getElementById("slideArea");

  // ── Vocab panel toggle ────────────────────────────────────────────────────
  document.getElementById("vocabToggle").addEventListener("click", () => {
    const body    = document.getElementById("vocabBody");
    const chevron = document.getElementById("vocabChevron");
    const open    = body.classList.toggle("open");
    chevron.textContent = open ? "▲" : "▼";
  });

  // ── Audio helpers ─────────────────────────────────────────────────────────
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

  function setPlayIdle() {
    playBtn.innerHTML = "▶";
    playBtn.classList.remove("playing", "done");
    playLabel.textContent = "Toca para escuchar la pregunta";
  }

  function setPlayDone() {
    playBtn.innerHTML = "▶";
    playBtn.classList.remove("playing");
    playBtn.classList.add("done");
    playLabel.textContent = "¡Escuchado! Toca para repetir";
  }

  // ── Load slide ────────────────────────────────────────────────────────────
  function loadSlide(idx) {
    const s     = SLIDES[idx];
    audioPlayed = false;
    isPlaying   = false;

    // Image
    slideImg.style.opacity = "0";
    slideImg.src = s.image;
    slideImg.onload = () => { slideImg.style.opacity = "1"; };

    // Text
    statementEl.textContent = s.statement;
    questionEl.textContent  = s.question;

    // Counter & bar
    counterEl.textContent = `${idx + 1} / ${SLIDES.length}`;
    progressBar.style.width = ((idx + 1) / SLIDES.length * 100) + "%";

    // Reset controls
    setPlayIdle();
    nextBtn.disabled = true;
    nextBtn.classList.remove("ready");

    // Audio
    audio.pause();
    audio = new Audio(s.audio);
    audio.preload = "auto";

    audio.addEventListener("ended", () => {
      isPlaying   = false;
      audioPlayed = true;
      setPlayDone();
      nextBtn.disabled = false;
      nextBtn.classList.add("ready");
    });

    audio.addEventListener("error", () => {
      isPlaying   = false;
      audioPlayed = true;
      playLabel.textContent = "Audio no disponible";
      playBtn.classList.remove("playing");
      playBtn.innerHTML = "▶";
      nextBtn.disabled = false;
      nextBtn.classList.add("ready");
    });
  }

  // ── Play / pause / repeat ─────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      if (playPromise) { playPromise.then(() => audio.pause()).catch(() => {}); playPromise = null; }
      else { audio.pause(); }
      isPlaying = false;
      playBtn.innerHTML = "▶";
      playBtn.classList.remove("playing");
      playLabel.textContent = "Toca ▶ para continuar";
      return;
    }
    if (audioPlayed) audio.currentTime = 0;
    playAudio();
  });

  // ── Next ──────────────────────────────────────────────────────────────────
  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    audio.pause();
    isPlaying = false;
    current++;
    if (current >= SLIDES.length) {
      showEnd();
    } else {
      loadSlide(current);
    }
  });

  function showEnd() {
    slideArea.style.display = "none";
    endScreen.classList.add("show");
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  loadSlide(0);

})();
