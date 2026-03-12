(() => {
  const CONFIG = {
    IMG_BASE:       "../../../../assets/images/u2/",
    AUDIO_BASE:     "../../../../assets/audio/u2/l6/",
    totalRounds:    15,
    autoNextDelay:  1000,
    wrongFlashDelay: 500
  };

  const ITEMS = [
    { text: "pen",            img: "u2.l6.p1.pen.jpg",            audio: "u2.l6.p1.pen.mp3" },
    { text: "book",           img: "u2.l6.p1.book.jpg",           audio: "u2.l6.p1.book.mp3" },
    { text: "desk",           img: "u2.l6.p1.desk.jpg",           audio: "u2.l6.p1.desk.mp3" },
    { text: "laptop",         img: "u2.l6.p1.laptop.jpg",         audio: "u2.l6.p1.laptop.mp3" },
    { text: "chair",          img: "u2.l6.p1.chair.jpg",          audio: "u2.l6.p1.chair.mp3" },
    { text: "bag",            img: "u2.l6.p1.bag.jpg",            audio: "u2.l6.p1.bag.mp3" },
    { text: "dictionary",     img: "u2.l6.p1.dictionary.jpg",     audio: "u2.l6.p1.dictionary.mp3" },
    { text: "globe",          img: "u2.l6.p1.globe.jpg",          audio: "u2.l6.p1.globe.mp3" },
    { text: "bookshelf",      img: "u2.l6.p4.bookshelf.jpg",      audio: "u2.l6.p4.bookshelf.mp3" },
    { text: "pencil",         img: "u2.l6.p4.pencil.jpg",         audio: "u2.l6.p4.pencil.mp3" },
    { text: "map",            img: "u2.l6.p4.map.jpg",            audio: "u2.l6.p4.map.mp3" },
    { text: "board",          img: "u2.l6.p4.board.jpg",          audio: "u2.l6.p4.board.mp3" },
    { text: "clock",          img: "u2.l6.p4.clock.jpg",          audio: "u2.l6.p4.clock.mp3" },
    { text: "bulletin board", img: "u2.l6.p4.bulletin.board.jpg", audio: "u2.l6.p4.bulletin.mp3" },
    { text: "table",          img: "u2.l6.p4.table.jpg",          audio: "u2.l6.p4.table.mp3" }
  ];

  const audioBtn   = document.getElementById("audioBtn");
  const choicesEl  = document.getElementById("choices");
  const nextBtn    = document.getElementById("nextBtn");
  const finishBtn  = document.getElementById("finishBtn");
  const feedbackEl = document.getElementById("feedback");
  const roundBox   = document.getElementById("roundBox");
  const doneBadge  = document.getElementById("doneBadge");

  const stepButtons = document.querySelectorAll(".step");

  let rounds         = [];
  let currentRoundIndex = 0;
  let roundLocked    = false;
  let audioHasPlayed = false;
  let autoNextTimer  = null;

  // ── FIX 2: Single reusable Audio element — avoids "play interrupted" blocking ──
  const audioPlayer = new Audio();

  // ── FIX 2: Track whether a play() promise is in-flight ──
  let playPromise = null;

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildRounds() {
    rounds = shuffle(ITEMS).map(correctItem => {
      const distractors = shuffle(
        ITEMS.filter(item => item.text !== correctItem.text)
      ).slice(0, 2);
      return { correct: correctItem, options: shuffle([correctItem, ...distractors]) };
    });
  }

  function bindTopProgress() {
    stepButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const go = btn.getAttribute("data-go");
        if (go) window.location.href = go;
      });
    });
  }

  function updateRoundCounter() {
    roundBox.textContent = `${currentRoundIndex + 1} / ${CONFIG.totalRounds}`;
  }

  // ── FIX 2: Safe stop — wait for any in-flight promise before pausing ──
  function stopAudio() {
    if (playPromise) {
      playPromise.then(() => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }).catch(() => {});
      playPromise = null;
    } else {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }
  }

  function clearTimers() {
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
    }
  }

  // ── FIX 1: Render choices (with images) immediately — before audio plays ──
  function renderChoices() {
    const round = rounds[currentRoundIndex];
    choicesEl.innerHTML = "";

    round.options.forEach((option, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "choice";
      card.setAttribute("aria-label", option.text);

      // Images are shown right away; tapping is blocked until audio has played
      card.innerHTML = `<img src="${CONFIG.IMG_BASE + option.img}" alt="${option.text}">`;

      card.addEventListener("click", () => handleChoiceClick(card, index));
      choicesEl.appendChild(card);
    });

    choicesEl.classList.remove("hidden");
  }

  function resetRoundUI() {
    clearTimers();
    stopAudio();

    roundLocked    = false;
    audioHasPlayed = false;

    feedbackEl.textContent = "";
    feedbackEl.className   = "feedback";

    audioBtn.disabled  = false;
    audioBtn.textContent = "🔊 Escuchar audio";

    if (nextBtn)   nextBtn.classList.add("hidden");
    if (finishBtn) finishBtn.classList.add("hidden");
    if (doneBadge) doneBadge.classList.add("hidden");
  }

  // ── FIX 2: Robust playAudio — disables button until ended/error, no blocking ──
  function playAudio() {
    const round = rounds[currentRoundIndex];

    // If already playing, stop cleanly first
    stopAudio();

    audioBtn.disabled    = true;
    audioBtn.textContent = "🔊 Reproduciendo...";

    // Remove any stale listeners by replacing with a fresh src
    audioPlayer.src = CONFIG.AUDIO_BASE + round.correct.audio;
    audioPlayer.load();

    // One-shot "ended" handler
    function onEnded() {
      audioPlayer.removeEventListener("ended", onEnded);
      audioPlayer.removeEventListener("error", onError);
      audioHasPlayed       = true;
      audioBtn.disabled    = false;
      audioBtn.textContent = "🔁 Escuchar otra vez";
      feedbackEl.textContent = "";
    }

    function onError() {
      audioPlayer.removeEventListener("ended", onEnded);
      audioPlayer.removeEventListener("error", onError);
      audioBtn.disabled    = false;
      audioBtn.textContent = "🔊 Escuchar audio";
      feedbackEl.textContent = "Error al cargar el audio.";
      feedbackEl.className   = "feedback bad";
      playPromise = null;
    }

    audioPlayer.addEventListener("ended", onEnded);
    audioPlayer.addEventListener("error", onError);

    playPromise = audioPlayer.play();

    if (playPromise) {
      playPromise
        .then(() => { playPromise = null; })
        .catch(err => {
          // AbortError is harmless (user tapped again quickly); any other error surfaces
          if (err.name !== "AbortError") {
            onError();
          } else {
            // Quietly re-enable so user can tap again
            audioBtn.disabled    = false;
            audioBtn.textContent = "🔊 Escuchar audio";
          }
          playPromise = null;
        });
    }
  }

  function handleChoiceClick(card, index) {
    if (roundLocked) return;
    // ── FIX 1: Choices are visible immediately but tapping is blocked until audio played ──
    if (!audioHasPlayed) {
      feedbackEl.textContent = "Primero escucha el audio 🔊";
      feedbackEl.className   = "feedback bad";
      return;
    }

    const round          = rounds[currentRoundIndex];
    const selectedOption = round.options[index];
    const isCorrect      = selectedOption.text === round.correct.text;

    if (isCorrect) {
      roundLocked = true;
      removeChoiceStates();
      card.classList.add("correct");

      feedbackEl.textContent = "✅ Correcto";
      feedbackEl.className   = "feedback ok";

      autoNextTimer = setTimeout(() => {
        if (currentRoundIndex === rounds.length - 1) {
          finishLesson();
        } else {
          currentRoundIndex++;
          loadRound();
        }
      }, CONFIG.autoNextDelay);

    } else {
      card.classList.add("wrong");
      feedbackEl.textContent = "❌ Intenta otra vez.";
      feedbackEl.className   = "feedback bad";

      setTimeout(() => {
        if (!roundLocked) card.classList.remove("wrong");
      }, CONFIG.wrongFlashDelay);
    }
  }

  function removeChoiceStates() {
    choicesEl.querySelectorAll(".choice").forEach(c =>
      c.classList.remove("wrong", "correct", "selected")
    );
  }

  // ── FIX 3: Finish goes to p4.html, not index.html ──
  function finishLesson() {
    stopAudio();
    clearTimers();

    if (doneBadge) doneBadge.classList.remove("hidden");

    feedbackEl.textContent = "🎉 ¡Muy bien!";
    feedbackEl.className   = "feedback ok";

    audioBtn.disabled = true;

    // Update the finish button to point to p4.html
    if (finishBtn) {
      finishBtn.setAttribute("href", "p4.html");
      finishBtn.textContent = "Siguiente ▶ Parte 4";
      finishBtn.classList.remove("hidden");
    }
  }

  function loadRound() {
    resetRoundUI();
    updateRoundCounter();
    // ── FIX 1: Show images immediately when round loads ──
    renderChoices();
  }

  audioBtn.addEventListener("click", playAudio);

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentRoundIndex < rounds.length - 1) {
        currentRoundIndex++;
        loadRound();
      }
    });
  }

  buildRounds();
  bindTopProgress();
  loadRound();
})();
