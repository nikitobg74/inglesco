// js/u4/u4_l4_p3.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // ── Slides (shuffled on load) ─────────────────────────────────────────────
  const SLIDES_SOURCE = [
    {
      image: IMG + "u4.l4.p3.fast.car.jpg",
      audio: AUD + "u4.l4.p3.fast.car.mp3",
      lines: ["This is my car.", "It is fast."],
      tiles: ["slow", "fast"],
      quiz:  [{ prompt: "It is _____.", answer: "fast" }],
    },
    {
      image: IMG + "u4.l4.p3.slow.car.jpg",
      audio: AUD + "u4.l4.p3.slow.car.mp3",
      lines: ["This is his car.", "It is slow."],
      tiles: ["slow", "fast"],
      quiz:  [{ prompt: "It is _____.", answer: "slow" }],
    },
    {
      image: IMG + "u4.l2.p1.big.house.jpg",
      audio: AUD + "u4.l4.p3.big.house.mp3",
      lines: ["This is my house.", "It is big."],
      tiles: ["big", "small"],
      quiz:  [{ prompt: "It is _____.", answer: "big" }],
    },
    {
      image: IMG + "u4.l4.p3.small.house.jpg",
      audio: AUD + "u4.l4.p3.small.house.mp3",
      lines: ["This is her house.", "It is small."],
      tiles: ["big", "small"],
      quiz:  [{ prompt: "It is _____.", answer: "small" }],
    },
    {
      image: IMG + "u4.l4.p3.expensive.watch.jpg",
      audio: AUD + "u4.l4.p3.expensive.watch.mp3",
      lines: ["This is my watch.", "It is expensive."],
      tiles: ["cheap", "expensive"],
      quiz:  [{ prompt: "It is _____.", answer: "expensive" }],
    },
    {
      image: IMG + "u4.l4.p3.cheap.watch.jpg",
      audio: AUD + "u4.l4.p3.cheap.watch.mp3",
      lines: ["This is his watch.", "It is cheap."],
      tiles: ["expensive", "cheap"],
      quiz:  [{ prompt: "It is _____.", answer: "cheap" }],
    },
    {
      image: IMG + "u4.l4.p3.big.dog.jpg",
      audio: AUD + "u4.l4.p3.big.dog.mp3",
      lines: ["This is my dog.", "It is big."],
      tiles: ["small", "big"],
      quiz:  [{ prompt: "It is _____.", answer: "big" }],
    },
    {
      image: IMG + "u4.l4.p3.small.cat.jpg",
      audio: AUD + "u4.l4.p3.small.cat.mp3",
      lines: ["This is her cat.", "It is small."],
      tiles: ["small", "big"],
      quiz:  [{ prompt: "It is _____.", answer: "small" }],
    },
  ];

  const SLIDES = [...SLIDES_SOURCE].sort(() => Math.random() - 0.5);

  // ── State ─────────────────────────────────────────────────────────────────
  let currentSlide = 0;
  let isPlaying    = false;
  let audioPlayed  = false;
  let playPromise  = null;
  let currentQuiz  = 0;
  let audio        = new Audio();

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const slideImg    = document.getElementById("slideImg");
  const line1El     = document.getElementById("line1");
  const line2El     = document.getElementById("line2");
  const playBtn     = document.getElementById("playBtn");
  const playLabel   = document.getElementById("playLabel");
  const nextBtn     = document.getElementById("nextBtn");
  const counterEl   = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const endScreen   = document.getElementById("endScreen");
  const slideArea   = document.getElementById("slideArea");
  const quizArea    = document.getElementById("quizArea");
  const quizPrompt  = document.getElementById("quizPrompt");
  const tilesWrap   = document.getElementById("tilesWrap");

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
    playLabel.textContent = "Toca para escuchar";
  }

  function setPlayDone() {
    playBtn.innerHTML = "▶";
    playBtn.classList.remove("playing");
    playBtn.classList.add("done");
    playLabel.textContent = "¡Escuchado! Toca para repetir";
  }

  // ── Load slide ────────────────────────────────────────────────────────────
  function loadSlide(idx) {
    const slide = SLIDES[idx];
    isPlaying   = false;
    audioPlayed = false;
    currentQuiz = 0;

    // Image
    slideImg.style.opacity = "0";
    slideImg.src = slide.image;
    slideImg.onload = () => { slideImg.style.opacity = "1"; };

    // Text — line 1 normal, line 2 bold (the "It is …" sentence)
    line1El.textContent = slide.lines[0];
    line2El.textContent = slide.lines[1];

    // Counter & bar
    counterEl.textContent = `${idx + 1} / ${SLIDES.length}`;
    progressBar.style.width = ((idx + 1) / SLIDES.length * 100) + "%";

    // Reset UI
    setPlayIdle();
    quizArea.style.display = "none";
    quizArea.classList.remove("quiz-complete", "fade-in");
    nextBtn.disabled = true;
    nextBtn.classList.remove("ready");

    // Audio
    audio.pause();
    audio = new Audio(slide.audio);
    audio.preload = "auto";

    audio.addEventListener("ended", () => {
      isPlaying   = false;
      audioPlayed = true;
      setPlayDone();
      setTimeout(() => showQuiz(slide), 400);
    });

    audio.addEventListener("error", () => {
      isPlaying   = false;
      audioPlayed = true;
      playLabel.textContent = "Audio no disponible";
      playBtn.classList.remove("playing");
      playBtn.innerHTML = "▶";
      setTimeout(() => showQuiz(slide), 400);
    });
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  function showQuiz(slide) {
    currentQuiz = 0;
    quizArea.style.display = "block";
    void quizArea.offsetWidth;
    quizArea.classList.add("fade-in");
    renderQuizPrompt(slide);
  }

  function renderQuizPrompt(slide) {
    const q = slide.quiz[currentQuiz];
    quizPrompt.innerHTML = q.prompt.replace("_____", '<span class="blank">_____</span>');

    tilesWrap.innerHTML = "";
    const shuffled = [...slide.tiles].sort(() => Math.random() - 0.5);
    shuffled.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile-btn";
      btn.textContent = word;
      btn.addEventListener("click", () => handleTile(btn, word, q.answer, slide));
      tilesWrap.appendChild(btn);
    });
  }

  function handleTile(btn, word, answer, slide) {
    if (btn.disabled || btn.classList.contains("shake")) return;

    if (word === answer) {
      btn.classList.add("correct");
      quizPrompt.innerHTML = slide.quiz[currentQuiz].prompt.replace(
        "_____",
        `<span class="filled">${answer}</span>`
      );
      tilesWrap.querySelectorAll(".tile-btn").forEach(b => b.disabled = true);

      setTimeout(() => {
        currentQuiz++;
        if (currentQuiz < slide.quiz.length) {
          quizArea.classList.remove("fade-in");
          void quizArea.offsetWidth;
          quizArea.classList.add("fade-in");
          renderQuizPrompt(slide);
        } else {
          quizArea.classList.add("quiz-complete");
          nextBtn.disabled = false;
          nextBtn.classList.add("ready");
        }
      }, 700);

    } else {
      btn.classList.add("shake");
      btn.addEventListener("animationend", () => btn.classList.remove("shake"), { once: true });
    }
  }

  // ── Play / pause / repeat ─────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    if (isPlaying) {
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
    if (audioPlayed) audio.currentTime = 0;
    playAudio();
  });

  // ── Next ──────────────────────────────────────────────────────────────────
  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    audio.pause();
    isPlaying = false;
    currentSlide++;
    if (currentSlide >= SLIDES.length) {
      showEnd();
    } else {
      loadSlide(currentSlide);
    }
  });

  function showEnd() {
    slideArea.style.display = "none";
    endScreen.classList.add("show");
  }

  // ── Vocabulary panel toggle ───────────────────────────────────────────────
  const vocabToggle  = document.getElementById("vocabToggle");
  const vocabBody    = document.getElementById("vocabBody");
  const vocabChevron = document.getElementById("vocabChevron");

  vocabToggle.addEventListener("click", () => {
    const open = vocabBody.classList.toggle("open");
    vocabChevron.textContent = open ? "▲" : "▼";
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  loadSlide(0);

})();
