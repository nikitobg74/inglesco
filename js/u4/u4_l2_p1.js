// js/u4/u4_l2_p1.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // ── New Words ─────────────────────────────────────────────────────────────
  const NEW_WORDS = [
    { en: "new",       es: "nuevo / nueva" },
    { en: "old",       es: "viejo / vieja" },
    { en: "expensive", es: "caro / cara" },
    { en: "cheap",     es: "barato / barata" },
    { en: "modern",    es: "moderno / moderna" },
    { en: "car",       es: "carro / auto" },
    { en: "house",     es: "casa" },
    { en: "watch",     es: "reloj" },
    { en: "phone",     es: "teléfono" },
  ];

  // ── Slides ────────────────────────────────────────────────────────────────
  const SLIDES = [
    {
      image: IMG + "u4.l2.p1.new.car.jpg",
      audio: AUD + "u4.l2.p1.new.car.mp3",
      en: "car — new car",
      es: "carro — carro nuevo",
    },
    {
      image: IMG + "u4.l2.p1.old.car.jpg",
      audio: AUD + "u4.l2.p1.old.car.mp3",
      en: "car — old car",
      es: "carro — carro viejo",
    },
    {
      image: IMG + "u4.l2.p1.modern.house.jpg",
      audio: AUD + "u4.l2.p1.modern.house.mp3",
      en: "house — modern house",
      es: "casa — casa moderna",
    },
    {
      image: IMG + "u4.l2.p1.old.house.jpg",
      audio: AUD + "u4.l2.p1.old.house.mp3",
      en: "house — old house",
      es: "casa — casa vieja",
    },
    {
      image: IMG + "u4.l2.p1.new.phone.jpg",
      audio: AUD + "u4.l2.p1.new.phone.mp3",
      en: "phone — new phone",
      es: "teléfono — teléfono nuevo",
    },
    {
      image: IMG + "u4.l2.p1.old.phone.jpg",
      audio: AUD + "u4.l2.p1.old.phone.mp3",
      en: "phone — old phone",
      es: "teléfono — teléfono viejo",
    },
    {
      image: IMG + "u4.l2.p1.expensive.watch.jpg",
      audio: AUD + "u4.l2.p1.expensive.watch.mp3",
      en: "watch — expensive watch",
      es: "reloj — reloj caro",
    },
    {
      image: IMG + "u4.l2.p1.cheap.watch.jpg",
      audio: AUD + "u4.l2.p1.cheap.watch.mp3",
      en: "watch — cheap watch",
      es: "reloj — reloj barato",
    },
    {
      image: IMG + "u4.l2.p1.cheap.car.jpg",
      audio: AUD + "u4.l2.p1.cheap.car.mp3",
      en: "cheap car",
      es: "carro barato",
    },
    {
      image: IMG + "u4.l2.p1.expensive.car.jpg",
      audio: AUD + "u4.l2.p1.expensive.car.mp3",
      en: "car — expensive car",
      es: "carro — carro caro",
    },
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let current    = 0;
  let audioPlayed = false;
  let isPlaying  = false;
  let playPromise = null;

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
  const wordsToggle = document.getElementById("wordsToggle");
  const wordsBody   = document.getElementById("wordsBody");
  const wordsChevron = document.getElementById("wordsChevron");

  // ── New Words accordion ───────────────────────────────────────────────────
  function buildWordList() {
    wordsBody.innerHTML = "";
    NEW_WORDS.forEach(w => {
      const row = document.createElement("div");
      row.className = "word-row";
      row.innerHTML = `<span class="word-en">${w.en}</span><span class="word-es">${w.es}</span>`;
      wordsBody.appendChild(row);
    });
  }

  wordsToggle.addEventListener("click", () => {
    const open = wordsBody.classList.toggle("open");
    wordsChevron.textContent = open ? "▲" : "▼";
    wordsToggle.setAttribute("aria-expanded", open);
  });

  // ── Audio ─────────────────────────────────────────────────────────────────
  let audio = new Audio();

  function loadSlide(idx) {
    const s = SLIDES[idx];
    audioPlayed = false;
    isPlaying   = false;

    // image
    slideImg.style.opacity = "0";
    slideImg.src = s.image;
    slideImg.onload = () => { slideImg.style.opacity = "1"; };

    // text
    enText.textContent = s.en;
    esText.textContent = s.es;

    // counter & bar
    counterEl.textContent = `${idx + 1} / ${SLIDES.length}`;
    progressBar.style.width = ((idx + 1) / SLIDES.length * 100) + "%";

    // reset play btn
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
      // still allow next
      audioPlayed = true;
      nextBtn.disabled = false;
      nextBtn.classList.add("ready");
    });
  }

  function setPlayIdle() {
    playBtn.innerHTML = "▶";
    playBtn.classList.remove("playing", "done");
    playLabel.textContent = "Toca para escuchar";
  }

  function setPlayDone() {
    playBtn.innerHTML = "✓";
    playBtn.classList.remove("playing");
    playBtn.classList.add("done");
    playLabel.textContent = "¡Escuchado!";
  }

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

    // play
    if (audioPlayed) {
      audio.currentTime = 0;
    }
    isPlaying = true;
    playBtn.innerHTML = "⏸";
    playBtn.classList.add("playing");
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
  buildWordList();
  loadSlide(0);

})();
