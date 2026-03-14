// js/u4/u4_l4_p2.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // ── Slides (shuffled on load) ─────────────────────────────────────────────
  const SLIDES_SOURCE = [
    {
      image:   IMG + "u4.l4.p2.brian.tall.jpg",
      audio:   AUD + "u4.l4.p2.brian.tall.mp3",
      keyword: "tall",
      text:    "This is Brian.\nHe is tall.",
      tiles:   ["tall", "short"],
      quiz:    [{ prompt: "Brian is _____.", answer: "tall" }],
    },
    {
      image:   IMG + "u4.l4.p2.billy.short.jpg",
      audio:   AUD + "u4.l4.p2.billy.short.mp3",
      keyword: "short",
      text:    "This is Billy.\nHe is short.",
      tiles:   ["tall", "short"],
      quiz:    [{ prompt: "Billy is _____.", answer: "short" }],
    },
    {
      image:   IMG + "u4.l4.p1.girl.short.tall.jpg",
      audio:   AUD + "u4.l4.p2.kate.tall.mp3",
      keyword: "tall",
      text:    "This is Kate.\nShe is tall.",
      tiles:   ["tall", "short"],
      quiz:    [{ prompt: "Kate is _____.", answer: "tall" }],
    },
    {
      image:   IMG + "u4.l4.p1.girl.short.tall.jpg",
      audio:   AUD + "u4.l4.p2.ann.short.mp3",
      keyword: "short",
      text:    "This is Ann.\nShe is short.",
      tiles:   ["tall", "short"],
      quiz:    [{ prompt: "Ann is _____.", answer: "short" }],
    },
    {
      image:   IMG + "u4.l4.p2.young.couple.jpg",
      audio:   AUD + "u4.l4.p2.young.mp3",
      keyword: "young",
      text:    "This is Mario and Jane.\nThey are young.",
      tiles:   ["young", "old"],
      quiz:    [{ prompt: "Mario and Jane are _____.", answer: "young" }],
    },
    {
      image:   IMG + "u4.l4.p2.old.couple.jpg",
      audio:   AUD + "u4.l4.p2.old.mp3",
      keyword: "old",
      text:    "This is Brad and Peggy.\nThey are old.",
      tiles:   ["young", "old"],
      quiz:    [{ prompt: "Brad and Peggy are _____.", answer: "old" }],
    },
    {
      image:   IMG + "u4.l4.p1.married.jpg",
      audio:   AUD + "u4.l4.p2.married.mp3",
      keyword: "married",
      text:    "This is my sister.\nShe is married.",
      tiles:   ["married", "young"],
      quiz:    [{ prompt: "My sister is _____.", answer: "married" }],
    },
    {
      image:   IMG + "u4.l4.p1.single.jpg",
      audio:   AUD + "u4.l4.p2.single.mp3",
      keyword: "single",
      text:    "This is my brother.\nHe is single.",
      tiles:   ["married", "single"],
      quiz:    [{ prompt: "My brother is _____.", answer: "single" }],
    },
  ];

  // Shuffle once on page load
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
  const keywordEl   = document.getElementById("keyword");
  const enText      = document.getElementById("enText");
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
    const slide  = SLIDES[idx];
    isPlaying    = false;
    audioPlayed  = false;
    currentQuiz  = 0;

    // Image
    slideImg.style.opacity = "0";
    slideImg.src = slide.image;
    slideImg.onload = () => { slideImg.style.opacity = "1"; };

    // Keyword badge
    keywordEl.textContent = slide.keyword;

    // Sentences
    enText.innerHTML = slide.text.replace(/\n/g, "<br>");

    // Counter & bar
    counterEl.textContent = `${idx + 1} / ${SLIDES.length}`;
    progressBar.style.width = ((idx + 1) / SLIDES.length * 100) + "%";

    // Reset UI
    setPlayIdle();
    quizArea.style.display = "none";
    quizArea.classList.remove("quiz-complete", "fade-in");
    nextBtn.disabled = true;
    nextBtn.classList.remove("ready");

    // Load audio
    audio.pause();
    audio = new Audio(slide.audio);
    audio.preload = "auto";

    audio.addEventListener("ended", () => {
      isPlaying  = false;
      audioPlayed = true;
      setPlayDone();
      setTimeout(() => showQuiz(slide), 400);
    });

    audio.addEventListener("error", () => {
      isPlaying  = false;
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
