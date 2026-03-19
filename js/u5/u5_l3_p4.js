(() => {
  const BASE       = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG_BASE   = BASE + "images/u5/";
  const AUDIO_BASE = BASE + "audio/u5/";

  // ── Slide list ─────────────────────────────────────────────────────────────
  // autoPlay: true  → audio starts automatically 600ms after the image loads
  // autoPlay: false → student must tap ▶ to begin (first slide only)

  const SLIDES = [
    {
      image:    IMG_BASE   + "u5.birthday.jpg",
      audio:    AUDIO_BASE + "u5.birthday.mp3",
      lines:    ["My Birthday Party", "Today is my birthday.", "All my family is at home."],
      autoPlay: false
    },
    {
      image:    IMG_BASE   + "u5.parents.fireplace.jpg",
      audio:    AUDIO_BASE + "u5.birthday1.mp3",
      lines:    ["My parents are in the living room.", "They are talking to their friends and drinking lemonade."],
      autoPlay: true
    },
    {
      image:    IMG_BASE   + "u5.wife.baking2.jpg",
      audio:    AUDIO_BASE + "u5.birthday2.mp3",
      lines:    ["My wife is in the kitchen.", "She is baking a chocolate cake."],
      autoPlay: true
    },
    {
      image:    IMG_BASE   + "u5.boy.guitar.jpg",
      audio:    AUDIO_BASE + "u5.birthday3.mp3",
      lines:    ["My son is in his bedroom.", "He is playing the guitar."],
      autoPlay: true
    },
    {
      image:    IMG_BASE   + "u5.girls.playing.jpg",
      audio:    AUDIO_BASE + "u5.birthday4.mp3",
      lines:    ["My daughter is in the yard.", "She is playing with her friend."],
      autoPlay: true
    },
    {
      image:    IMG_BASE   + "u5.fixing.sink.jpg",
      audio:    AUDIO_BASE + "u5.birthday5.mp3",
      lines:    ["My brother is in the bathroom.", "He is fixing the sink."],
      autoPlay: true
    },
    {
      image:    IMG_BASE   + "u5.wife.baking.jpg",
      audio:    AUDIO_BASE + "u5.birthday6.mp3",
      lines:    ["His wife is in the kitchen.", "She is helping my wife."],
      autoPlay: true
    },
    {
      image:    IMG_BASE   + "u5.sister.washing.jpg",
      audio:    AUDIO_BASE + "u5.birthday7.mp3",
      lines:    ["My sister is not married. She is single.", "She is in the garage and she is washing her car."],
      autoPlay: true
    }
  ];

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const imgEl       = document.getElementById("lessonImg");
  const slideTextEl = document.getElementById("slideText");
  const playBtn     = document.getElementById("playBtn");
  const continueBtn = document.getElementById("continueBtn");
  const counterEl   = document.getElementById("counter");
  const barEl       = document.getElementById("progressBar");
  const mainCard    = document.getElementById("mainCard");
  const endScreen   = document.getElementById("endScreen");

  let slideIndex   = 0;
  let currentAudio = null;

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
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    }
  }

  function showContinue() { continueBtn.classList.add("visible"); }
  function hideContinue()  { continueBtn.classList.remove("visible"); }

  // ── Load a slide ───────────────────────────────────────────────────────────
  function loadSlide(index) {
    slideIndex = index;
    updateCounter();
    destroyAudio();
    hideContinue();

    const slide = SLIDES[index];

    imgEl.src = slide.image;
    imgEl.alt = slide.lines[0] || "";
    slideTextEl.innerHTML = slide.lines.map(l => `<span>${l}</span>`).join("<br>");

    const audio = new Audio(slide.audio);
    currentAudio = audio;

    audio.addEventListener("ended", () => {
      setPlayState("done");
      showContinue();
    });

    playBtn.onclick = () => togglePlay(audio);

    if (slide.autoPlay) {
      playBtn.disabled = true;
      setPlayState("idle");
      setTimeout(() => {
        audio.play()
          .then(() => setPlayState("playing"))
          .catch(() => { setPlayState("idle"); playBtn.disabled = false; });
      }, 600);
    } else {
      setPlayState("idle");
    }
  }

  // ── Toggle play / pause ────────────────────────────────────────────────────
  function togglePlay(audio) {
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlayState("playing")).catch(() => {});
    } else {
      audio.pause();
      setPlayState("idle");
    }
  }

  // ── Continuar ──────────────────────────────────────────────────────────────
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
