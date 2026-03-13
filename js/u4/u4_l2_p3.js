// js/u4/u4_l2_p3.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // ── Slides ────────────────────────────────────────────────────────────────
  const SLIDES = [
    {
      image: IMG + "u4.l2.p1.big.house.jpg",
      audio: AUD + "u4.l2.p3.big.house.mp3",
      en:    "big house",
      es:    "casa grande",
    },
    {
      image: IMG + "u4.l2.p1.small.house.jpg",
      audio: AUD + "u4.l2.p3.small.house.mp3",
      en:    "small house",
      es:    "casa pequeña",
    },
    {
      image: IMG + "u4.l2.p1.expensive.watch.jpg",
      audio: AUD + "u4.l2.p3.expensive.watch.mp3",
      en:    "expensive watch",
      es:    "reloj caro",
    },
    {
      image: IMG + "u4.l2.p1.cheap.watch.jpg",
      audio: AUD + "u4.l2.p3.cheap.watch.mp3",
      en:    "cheap watch",
      es:    "reloj barato",
    },
    {
      image: IMG + "u4.l2.p1.expensive.car.jpg",
      audio: AUD + "u4.l2.p3.expensive.car.mp3",
      en:    "expensive car",
      es:    "carro caro",
    },
    {
      image: IMG + "u4.l2.p1.cheap.car.jpg",
      audio: AUD + "u4.l2.p3.cheap.car.mp3",
      en:    "cheap car",
      es:    "carro barato",
    },
    {
      image: IMG + "u4.l2.p3.modern.phone.jpg",
      audio: AUD + "u4.l2.p3.modern.phone.mp3",
      en:    "modern phone",
      es:    "teléfono moderno",
    },
    {
      image: IMG + "u4.l2.p3.old.phone.jpg",
      audio: AUD + "u4.l2.p3.old.phone.mp3",
      en:    "old phone",
      es:    "teléfono viejo",
    },
  ];

  const TOTAL = SLIDES.length;

  // ── State ─────────────────────────────────────────────────────────────────
  let current     = 0;
  let audioPlayed = false;
  let isPlaying   = false;
  let playPromise = null;
  let audio       = new Audio();

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const slideImg    = document.getElementById("slideImg");
  const enText      = document.getElementById("enText");
  const esText      = document.getElementById("esText");
  const playBtn     = document.getElementById("playBtn");
  const playLabel   = document.getElementById("playLabel");
  const nextBtn     = document.getElementById("nextBtn");
  const counterEl   = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const endScreen   = document.getElementById("endScreen");
  const slideArea   = document.getElementById("slideArea");

  // ── Load slide ────────────────────────────────────────────────────────────
  function loadSlide(idx) {
    const s = SLIDES[idx];
    audioPlayed = false;
    isPlaying   = false;

    // image fade in
    slideImg.style.opacity = "0";
    slideImg.src = s.image;
    slideImg.onload = () => { slideImg.style.opacity = "1"; };

    // text
    enText.textContent = s.en;
    esText.textContent = s.es;

    // counter & bar
    counterEl.textContent   = `${idx + 1} / ${TOTAL}`;
    progressBar.style.width = ((idx + 1) / TOTAL * 100) + "%";

    // reset play btn & next btn
    setPlayIdle();
    nextBtn.disabled = true;
    nextBtn.classList.remove("ready");

    // load audio
    audio.pause();
    audio = new Audio(s.audio);
    audio.preload = "auto";

    audio.addEventListener("ended", () => {
      isPlaying   = false;
      audioPlayed = true;
      setPlayReady();
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

  function setPlayIdle() {
    playBtn.innerHTML = "▶";
    playBtn.classList.remove("playing", "replay");
    playLabel.textContent = "Toca para escuchar";
  }

  function setPlayReady() {
    playBtn.innerHTML = "🔁";
    playBtn.classList.remove("playing");
    playBtn.classList.add("replay");
    playLabel.textContent = "Toca para repetir";
  }

  // ── Play / Pause toggle ───────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      if (playPromise) {
        playPromise.then(() => audio.pause()).catch(() => {});
        playPromise = null;
      } else {
        audio.pause();
      }
      isPlaying = false;
      playBtn.innerHTML = audioPlayed ? "🔁" : "▶";
      playBtn.classList.remove("playing");
      playLabel.textContent = "Toca ▶ para continuar";
      return;
    }

    // replay from start if already played
    if (audioPlayed) audio.currentTime = 0;

    isPlaying = true;
    playBtn.innerHTML = "⏸";
    playBtn.classList.add("playing");
    playBtn.classList.remove("replay");
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
  });

  // ── Next button ───────────────────────────────────────────────────────────
  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    audio.pause();
    isPlaying = false;
    current++;
    if (current >= TOTAL) {
      showEnd();
    } else {
      loadSlide(current);
    }
  });

  // ── End screen ────────────────────────────────────────────────────────────
  function showEnd() {
    slideArea.style.display = "none";
    endScreen.classList.add("show");
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  loadSlide(0);

})();
