// js/u4/u4_l3_p2.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // ── Slides ────────────────────────────────────────────────────────────────
  const SLIDES = [
    {
      image: IMG + "u4.l2.p1.old.car.jpg",
      audio: AUD + "u4.l3.p2.my.old.car.mp3",
      en: "This is my old car.",
    },
    {
      image: IMG + "u4.l2.p4.expensive.phone.jpg",
      audio: AUD + "u4.l3.p2.my.expensive.phone.mp3",
      en: "This is my expensive phone.",
    },
    {
      image: IMG + "u4.l2.p1.small.bedroom.jpg",
      audio: AUD + "u4.l3.p2.small.apartment.mp3",
      en: "This is my small apartment.",
    },
    {
      image: IMG + "u4.l2.p1.cheap.watch.jpg",
      audio: AUD + "u4.l3.p2.cheap.watch.mp3",
      en: "This is my cheap watch.",
    },
    {
      image: IMG + "u4.l2.p1.modern.house.jpg",
      audio: AUD + "u4.l3.p2.big.house.mp3",
      en: "This is my big house.",
    },
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let current     = 0;
  let audioPlayed = false;
  let isPlaying   = false;
  let playPromise = null;

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const slideImg    = document.getElementById("slideImg");
  const enText      = document.getElementById("enText");
  const playBtn     = document.getElementById("playBtn");
  const playLabel   = document.getElementById("playLabel");
  const nextBtn     = document.getElementById("nextBtn");
  const counterEl   = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const endScreen   = document.getElementById("endScreen");
  const slideArea   = document.getElementById("slideArea");

  // ── Audio ─────────────────────────────────────────────────────────────────
  let audio = new Audio();

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

  function loadSlide(idx, autoplay) {
    const s = SLIDES[idx];
    audioPlayed = false;
    isPlaying   = false;

    // image
    slideImg.style.opacity = "0";
    slideImg.src = s.image;
    slideImg.onload = () => { slideImg.style.opacity = "1"; };

    // text
    enText.textContent = s.en;

    // counter & bar
    counterEl.textContent = `${idx + 1} / ${SLIDES.length}`;
    progressBar.style.width = ((idx + 1) / SLIDES.length * 100) + "%";

    // reset play btn & next
    setPlayIdle();
    nextBtn.disabled = true;
    nextBtn.classList.remove("ready");

    // preload audio
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
      isPlaying = false;
      playLabel.textContent = "Audio no disponible";
      playBtn.classList.remove("playing");
      playBtn.innerHTML = "▶";
      audioPlayed = true;
      nextBtn.disabled = false;
      nextBtn.classList.add("ready");
    });

    if (autoplay) {
      setTimeout(() => playAudio(), 300);
    }
  }

  function setPlayIdle() {
    playBtn.innerHTML = "▶";
    playBtn.classList.remove("playing", "done");
    playLabel.textContent = "Toca para escuchar";
  }

  function setPlayDone() {
    playBtn.innerHTML = "▶";
    playBtn.classList.remove("playing");
    playBtn.classList.add("done");
    playLabel.textContent = "¡Escuchado! Toca para repetir";
  }

  // ── Play / pause / repeat ─────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      // pause
      if (playPromise) {
        playPromise.then(() => audio.pause()).catch(() => {});
        playPromise = null;
      } else {
        audio.pause();
      }
      isPlaying = false;
      playBtn.innerHTML = "▶";
      playBtn.classList.remove("playing");
      playLabel.textContent = "Toca ▶ para continuar";
      return;
    }

    // replay from start if already heard, otherwise resume
    if (audioPlayed) {
      audio.currentTime = 0;
    }
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
      loadSlide(current, true); // autoplay = true
    }
  });

  function showEnd() {
    slideArea.style.display = "none";
    endScreen.classList.add("show");
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  loadSlide(0, false); // first slide: student taps play themselves

})();
