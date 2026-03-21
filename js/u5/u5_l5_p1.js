(() => {
  const UNIT   = 5;
  const LESSON = 5;
  const PART   = 1;

  const BASE       = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE   = BASE + "images/u5/";
  const AUDIO_BASE = BASE + "audio/u5/";

  // ── Slides ─────────────────────────────────────────────────────────────────
  // lines: array of { en, es } pairs — en shown in blue, es in teal below it.
  // es can be null to show only the English line.

  const SLIDES = [
    {
      image: IMG_BASE   + "u5.tom.dog.jpg",
      audio: AUDIO_BASE + "u5.tom.dog.mp3",
      lines: [
        { en: "This is Tom.",         es: "Este es Tom." },
        { en: "This is Tom's dog.",   es: "Este es el perro de Tom." }
      ]
    },
    {
      image: IMG_BASE   + "u5.robert.house.jpg",
      audio: AUDIO_BASE + "u5.robert.house.mp3",
      lines: [
        { en: "Robert's house is big.", es: "La casa de Robert es grande." }
      ]
    },
    {
      image: IMG_BASE   + "u5.linda.car.jpg",
      audio: AUDIO_BASE + "u5.linda.car.mp3",
      lines: [
        { en: "Linda's car is old.", es: "El carro de Linda es viejo." }
      ]
    },
    {
      image: IMG_BASE   + "u5.mike.car.jpg",
      audio: AUDIO_BASE + "u5.mike.car.mp3",
      lines: [
        { en: "Mike's car is new.", es: "El carro de Mike es nuevo." }
      ]
    },
    {
      image: IMG_BASE   + "u5.george.apartment.jpg",
      audio: AUDIO_BASE + "u5.george.apartment.mp3",
      lines: [
        { en: "George's apartment is small.", es: "El apartamento de George es pequeño." }
      ]
    },
    {
      image: IMG_BASE   + "u5.dog.noisy.1.jpg",
      audio: AUDIO_BASE + "u5.dog.noisy.mp3",
      lines: [
        { en: "Carl's dog is noisy.", es: "El perro de Carl es ruidoso." }
      ]
    },
    {
      image: IMG_BASE   + "u5.cat.eating.fish.jpg",
      audio: AUDIO_BASE + "u5.cat.eating.fish.mp3",
      lines: [
        { en: "Lisa's cat is eating a fish.", es: "El gato de Lisa está comiendo un pez." }
      ]
    },
    {
      image: IMG_BASE   + "u5.computer.slow.jpg",
      audio: AUDIO_BASE + "u5.computer.slow.mp3",
      lines: [
        { en: "Greg's laptop is slow.", es: "La computadora de Greg es lenta." }
      ]
    }
  ];

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const imgEl      = document.getElementById("lessonImg");
  const slideLinesEl = document.getElementById("slideLines");
  const playBtn    = document.getElementById("playBtn");
  const continueBtn = document.getElementById("continueBtn");
  const counterEl  = document.getElementById("counter");
  const barEl      = document.getElementById("progressBar");
  const mainCard   = document.getElementById("mainCard");
  const endScreen  = document.getElementById("endScreen");
  const grammarToggle = document.getElementById("grammarToggle");
  const grammarBody   = document.getElementById("grammarBody");
  const grammarArrow  = document.getElementById("grammarArrow");

  let slideIndex   = 0;
  let currentAudio = null;

  // ── Grammar toggle ─────────────────────────────────────────────────────────
  grammarToggle.onclick = () => {
    const open = grammarBody.classList.toggle("open");
    grammarArrow.textContent = open ? "▲" : "▼";
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  function updateCounter() {
    counterEl.textContent = `${slideIndex + 1} / ${SLIDES.length}`;
    barEl.style.width = ((slideIndex + 1) / SLIDES.length * 100) + "%";
  }

  function setPlayState(state) {
    playBtn.className   = "play-btn " + state;
    playBtn.textContent = state === "playing" ? "⏸" : "▶";
    playBtn.disabled    = false;
  }

  function destroyAudio() {
    if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
  }

  function showContinue() { continueBtn.classList.add("visible"); }
  function hideContinue()  { continueBtn.classList.remove("visible"); }

  // ── Load slide ─────────────────────────────────────────────────────────────
  function loadSlide(index) {
    slideIndex = index;
    updateCounter();
    destroyAudio();
    hideContinue();

    const slide = SLIDES[index];

    imgEl.src = slide.image;
    imgEl.alt = slide.lines[0].en;

    // Build EN + ES lines
    slideLinesEl.innerHTML = slide.lines.map(l =>
      `<span class="line-en">👉 ${l.en}</span>` +
      (l.es ? `<span class="line-es">${l.es}</span>` : "")
    ).join("");

    const audio = new Audio(slide.audio);
    currentAudio = audio;

    setPlayState("idle");

    playBtn.onclick = () => {
      if (!audio.paused) {
        audio.pause();
        setPlayState("idle");
      } else {
        audio.play().then(() => setPlayState("playing")).catch(() => {});
      }
    };

    audio.onended = () => {
      setPlayState("done");
      showContinue();
    };
  }

  // ── Continue ───────────────────────────────────────────────────────────────
  continueBtn.onclick = () => {
    const next = slideIndex + 1;
    if (next >= SLIDES.length) {
      mainCard.style.display = "none";
      endScreen.style.display = "block";
    } else {
      loadSlide(next);
    }
  };

  // ── Init ───────────────────────────────────────────────────────────────────
  loadSlide(0);
})();
