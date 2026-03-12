(() => {
  const CONFIG = {
    AUDIO_BASE: "../../../../assets/audio/u2/l6/",
    totalRounds: 15,
    autoNextDelay: 1000,
    wrongFlashDelay: 500
  };

  const ITEMS = [
    { text: "pen",            audio: "u2.l6.p1.pen.mp3" },
    { text: "book",           audio: "u2.l6.p1.book.mp3" },
    { text: "desk",           audio: "u2.l6.p1.desk.mp3" },
    { text: "laptop",         audio: "u2.l6.p1.laptop.mp3" },
    { text: "chair",          audio: "u2.l6.p1.chair.mp3" },
    { text: "bag",       audio: "u2.l6.p1.bag.mp3" },
    { text: "dictionary",     audio: "u2.l6.p1.dictionary.mp3" },
    { text: "globe",          audio: "u2.l6.p1.globe.mp3" },
    { text: "bookshelf",      audio: "u2.l6.p4.bookshelf.mp3" },
    { text: "pencil",         audio: "u2.l6.p4.pencil.mp3" },
    { text: "map",            audio: "u2.l6.p4.map.mp3" },
    { text: "board",          audio: "u2.l6.p4.board.mp3" },
    { text: "clock",          audio: "u2.l6.p4.clock.mp3" },
    { text: "bulletin board", audio: "u2.l6.p4.bulletin.mp3" },
    { text: "table",          audio: "u2.l6.p4.table.mp3" }
  ];

  const audioBtn   = document.getElementById("audioBtn");
  const choicesEl  = document.getElementById("choices");
  const finishBtn  = document.getElementById("finishBtn");
  const feedbackEl = document.getElementById("feedback");
  const roundBox   = document.getElementById("roundBox");
  const doneBadge  = document.getElementById("doneBadge");
  const stepButtons = document.querySelectorAll(".step");

  let rounds = [];
  let currentRoundIndex = 0;
  let currentAudio = null;
  let roundLocked = false;
  let audioHasPlayed = false;
  let autoNextTimer = null;

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function bindTopProgress() {
    stepButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const go = btn.getAttribute("data-go");
        if (go) window.location.href = go;
      });
    });
  }

  function buildRounds() {
    const shuffledItems = shuffle(ITEMS);

    rounds = shuffledItems.map(correctItem => {
      const distractors = shuffle(
        ITEMS.filter(item => item.text !== correctItem.text)
      ).slice(0, 2);

      const options = shuffle([correctItem, ...distractors]);

      return {
        correct: correctItem,
        options
      };
    });
  }

  function updateRoundCounter() {
    roundBox.textContent = `${currentRoundIndex + 1} / ${CONFIG.totalRounds}`;
  }

  function stopCurrentAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  function clearTimers() {
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
    }
  }

  function resetRoundUI() {
    clearTimers();
    stopCurrentAudio();

    roundLocked = false;
    audioHasPlayed = false;

    choicesEl.innerHTML = "";
    choicesEl.classList.add("hidden");

    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";

    audioBtn.disabled = false;
    audioBtn.textContent = "🔊 Escuchar audio";

    finishBtn.classList.add("hidden");
    doneBadge.classList.add("hidden");
  }

  function renderChoices() {
    const round = rounds[currentRoundIndex];
    choicesEl.innerHTML = "";

    round.options.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.textContent = option.text;
      btn.setAttribute("aria-label", option.text);

      btn.addEventListener("click", () => {
        handleChoiceClick(btn, index);
      });

      choicesEl.appendChild(btn);
    });

    choicesEl.classList.remove("hidden");
  }

  function playAudio() {
    const round = rounds[currentRoundIndex];

    clearTimers();
    stopCurrentAudio();

    audioBtn.disabled = true;
    audioBtn.textContent = "🔊 Reproduciendo...";

    currentAudio = new Audio(CONFIG.AUDIO_BASE + round.correct.audio);

    currentAudio.addEventListener("ended", () => {
      audioHasPlayed = true;
      audioBtn.disabled = false;
      audioBtn.textContent = "🔁 Escuchar otra vez";
      renderChoices();
    });

    currentAudio.addEventListener("error", () => {
      audioBtn.disabled = false;
      audioBtn.textContent = "🔊 Escuchar audio";
      feedbackEl.textContent = "Error al cargar el audio.";
      feedbackEl.className = "feedback bad";
    });

    currentAudio.play().catch(() => {
      audioBtn.disabled = false;
      audioBtn.textContent = "🔊 Escuchar audio";
      feedbackEl.textContent = "No se pudo reproducir el audio.";
      feedbackEl.className = "feedback bad";
    });
  }

  function handleChoiceClick(btn, index) {
    if (roundLocked) return;
    if (!audioHasPlayed) return;

    const round = rounds[currentRoundIndex];
    const selectedOption = round.options[index];
    const isCorrect = selectedOption.text === round.correct.text;

    if (isCorrect) {
      roundLocked = true;
      clearChoiceStates();

      btn.classList.add("correct");
      feedbackEl.textContent = "✅ Correcto";
      feedbackEl.className = "feedback ok";

      autoNextTimer = setTimeout(() => {
        if (currentRoundIndex === rounds.length - 1) {
          finishLesson();
        } else {
          currentRoundIndex++;
          loadRound();
        }
      }, CONFIG.autoNextDelay);

    } else {
      btn.classList.add("wrong");
      feedbackEl.textContent = "❌ Intenta otra vez.";
      feedbackEl.className = "feedback bad";

      setTimeout(() => {
        if (!roundLocked) {
          btn.classList.remove("wrong");
        }
      }, CONFIG.wrongFlashDelay);
    }
  }

  function clearChoiceStates() {
    const buttons = choicesEl.querySelectorAll(".choice");
    buttons.forEach(btn => {
      btn.classList.remove("wrong", "correct");
    });
  }

  function finishLesson() {
    stopCurrentAudio();
    clearTimers();

    choicesEl.classList.add("hidden");
    audioBtn.disabled = true;
    audioBtn.textContent = "✅ Completado";

    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";

    finishBtn.classList.remove("hidden");
    doneBadge.classList.remove("hidden");

    roundBox.textContent = `${CONFIG.totalRounds} / ${CONFIG.totalRounds}`;
  }

  function loadRound() {
    resetRoundUI();
    updateRoundCounter();
  }

  audioBtn.addEventListener("click", playAudio);

  buildRounds();
  bindTopProgress();
  loadRound();
})();