// js/u4/u4_l4_p1.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // ── Slides ────────────────────────────────────────────────────────────────
  // Each slide has one or more parts (sentence + audio).
  // parts[0] = manual play. quiz appears after all parts are heard.
  const SLIDES = [
    {
      image: IMG + "u4.l4.p1.short.tall.jpg",
      parts: [
        {
          text: "This is Bob and Jack.\nBob is tall.\nJack is short.",
          audio: AUD + "u4.l4.p1.bob.jack.mp3",
          autoplay: false,
        },
      ],
      tiles: ["tall", "short"],
      quiz: [
        { prompt: "Bob is _____.",  answer: "tall"  },
        { prompt: "Jack is _____.", answer: "short" },
      ],
    },
    {
      image: IMG + "u4.l4.p1.girl.short.tall.jpg",
      parts: [
        {
          text: "This is Ann and Kate.\nKate is tall.\nAnn is short.",
          audio: AUD + "u4.l4.p1.ann.kate.mp3",
          autoplay: false,
        },
      ],
      tiles: ["tall", "short"],
      quiz: [
        { prompt: "Ann is _____.",  answer: "short" },
        { prompt: "Kate is _____.", answer: "tall"  },
      ],
    },
    {
      image: IMG + "u4.l4.p1.young.couple.jpg",
      parts: [
        { text: "This is Carlos and Juanita.\nThey are young.", audio: AUD + "u4.l4.p1.they.young.mp3", autoplay: false },
      ],
      tiles: ["young", "old"],
      quiz: [
        { prompt: "Carlos and Juanita are _____.", answer: "young" },
      ],
    },
    {
      image: IMG + "u4.l4.p1.old.couple.jpg",
      parts: [
        { text: "This is Tim and Sally.\nThey are old.", audio: AUD + "u4.l4.p1.they.old.mp3", autoplay: false },
      ],
      tiles: ["young", "old"],
      quiz: [
        { prompt: "Tim and Sally are _____.", answer: "old" },
      ],
    },
    {
      image: IMG + "u4.l4.p1.married.jpg",
      parts: [
        { text: "This is my sister.\nShe is married.", audio: AUD + "u4.l4.p1.sister.married.mp3", autoplay: false },
      ],
      tiles: ["married", "young"],
      quiz: [
        { prompt: "My sister is _____.", answer: "married" },
      ],
    },
    {
      image: IMG + "u4.l4.p1.single.jpg",
      parts: [
        { text: "This is my brother.\nHe is single.", audio: AUD + "u4.l4.p1.brother.single.mp3", autoplay: false },
      ],
      tiles: ["married", "single"],
      quiz: [
        { prompt: "My brother is _____.", answer: "single" },
      ],
    },
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let currentSlide = 0;
  let currentPart  = 0;   // index into slide.parts
  let isPlaying    = false;
  let audioPlayed  = false;
  let playPromise  = null;
  let quizActive   = false;
  let currentQuiz  = 0;   // which quiz prompt we are on
  let quizDone     = false;
  let audio        = new Audio();

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

  // ── Load a part (sentence + audio) within the current slide ───────────────
  function loadPart(partIdx, slide) {
    const part = slide.parts[partIdx];
    audioPlayed = false;
    isPlaying   = false;

    // Update text (support \n line breaks)
    enText.innerHTML = part.text.replace(/\n/g, "<br>");

    // Reset play button state
    if (part.autoplay) {
      playBtn.style.display = "none";
      playLabel.style.display = "none";
    } else {
      playBtn.style.display = "flex";
      playLabel.style.display = "block";
      setPlayIdle();
    }

    // Stop previous audio cleanly
    audio.pause();
    audio = new Audio(part.audio);
    audio.preload = "auto";

    audio.addEventListener("ended", () => {
      isPlaying   = false;
      audioPlayed = true;

      const hasNextPart = partIdx + 1 < slide.parts.length;

      if (hasNextPart) {
        // Advance to next part automatically
        currentPart++;
        loadPart(currentPart, slide);
      } else {
        // All parts heard — show quiz
        setPlayDone();
        playBtn.style.display = "flex";
        playLabel.style.display = "block";
        setTimeout(() => showQuiz(slide), 400);
      }
    });

    audio.addEventListener("error", () => {
      isPlaying   = false;
      audioPlayed = true;
      playLabel.textContent = "Audio no disponible";
      playBtn.classList.remove("playing");
      playBtn.innerHTML = "▶";
      playBtn.style.display = "flex";
      playLabel.style.display = "block";

      const hasNextPart = partIdx + 1 < slide.parts.length;
      if (hasNextPart) {
        currentPart++;
        setTimeout(() => loadPart(currentPart, slide), 300);
      } else {
        setTimeout(() => showQuiz(slide), 400);
      }
    });

    if (part.autoplay) {
      setTimeout(() => {
        isPlaying = true;
        playPromise = audio.play();
        if (playPromise) {
          playPromise.then(() => { playPromise = null; }).catch(err => {
            playPromise = null;
            if (err.name !== "AbortError") {
              // skip silently to quiz
              const hasNextPart = partIdx + 1 < slide.parts.length;
              if (!hasNextPart) showQuiz(slide);
            }
          });
        }
      }, 300);
    }
  }

  // ── Load a full slide ─────────────────────────────────────────────────────
  function loadSlide(idx) {
    const slide  = SLIDES[idx];
    currentPart  = 0;
    quizActive   = false;
    quizDone     = false;
    currentQuiz  = 0;

    // Image
    slideImg.style.opacity = "0";
    slideImg.src = slide.image;
    slideImg.onload = () => { slideImg.style.opacity = "1"; };

    // Counter & bar
    counterEl.textContent = `${idx + 1} / ${SLIDES.length}`;
    progressBar.style.width = ((idx + 1) / SLIDES.length * 100) + "%";

    // Hide quiz, disable next
    quizArea.style.display = "none";
    nextBtn.disabled = true;
    nextBtn.classList.remove("ready");

    loadPart(0, slide);
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  function showQuiz(slide) {
    quizActive  = true;
    currentQuiz = 0;
    quizArea.style.display = "block";
    quizArea.classList.add("fade-in");
    renderQuizPrompt(slide);
  }

  function renderQuizPrompt(slide) {
    const q = slide.quiz[currentQuiz];
    quizPrompt.innerHTML = q.prompt.replace("_____", '<span class="blank">_____</span>');

    // Build tiles (shuffled copy)
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
    if (btn.classList.contains("correct") || btn.classList.contains("shake")) return;

    if (word === answer) {
      btn.classList.add("correct");
      // Show answer in prompt
      quizPrompt.innerHTML = slide.quiz[currentQuiz].prompt.replace(
        "_____",
        `<span class="filled">${answer}</span>`
      );

      // Disable all tiles
      tilesWrap.querySelectorAll(".tile-btn").forEach(b => b.disabled = true);

      setTimeout(() => {
        currentQuiz++;
        if (currentQuiz < slide.quiz.length) {
          // Next quiz prompt
          quizArea.classList.remove("fade-in");
          void quizArea.offsetWidth;
          quizArea.classList.add("fade-in");
          renderQuizPrompt(slide);
        } else {
          // All quiz prompts done
          quizDone = true;
          nextBtn.disabled = false;
          nextBtn.classList.add("ready");
          // Subtle celebration on quiz area
          quizArea.classList.add("quiz-complete");
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
  const vocabToggle = document.getElementById("vocabToggle");
  const vocabBody   = document.getElementById("vocabBody");
  const vocabChevron = document.getElementById("vocabChevron");

  vocabToggle.addEventListener("click", () => {
    const open = vocabBody.classList.toggle("open");
    vocabChevron.textContent = open ? "▲" : "▼";
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  loadSlide(0);

})();
