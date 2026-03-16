// js/u4/u4_l7_p2.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG = BASE + "images/u4/";

  const EXERCISES = [
    {
      image: "u4.l6.p1.noisy.dog.jpg",
      positive: ["His", "dog", "is", "noisy."],
      negative: ["It", "is", "not", "quiet."]
    },
    {
      image: "u4.l2.p4.small.house.jpg",
      positive: ["Her", "house", "is", "small."],
      negative: ["It", "is", "not", "big."]
    },
    {
      image: "u4.l7.p1.pretty.woman.jpg",
      positive: ["My", "sister", "is", "pretty."],
      negative: ["She", "is", "not", "ugly."]
    },
    {
      image: "u4.l4.p4.rich.man.beer.jpg",
      positive: ["Her", "brother", "is", "single."],
      negative: ["He", "is", "not", "married."]
    },
    {
      image: "u4.l4.p1.married.jpg",
      positive: ["I", "am", "married."],
      negative: ["I", "am", "not", "single."]
    },
    {
      image: "u4.l6.p1.noisy.jpg",
      positive: ["His", "neighbors", "are", "noisy."],
      negative: ["They", "are", "not", "quiet."]
    },
    {
      image: "u4.l4.p3.expensive.watch.jpg",
      positive: ["His", "watch", "is", "expensive."],
      negative: ["It", "is", "not", "cheap."]
    }
  ];

  let exerciseIndex = 0;
  let phase = "positive";
  let selectedWords = [];
  let locked = false;

  const exerciseImage = document.getElementById("exerciseImage");
  const phaseBadge = document.getElementById("phaseBadge");
  const targetLine = document.getElementById("targetLine");
  const tilesGrid = document.getElementById("tilesGrid");
  const clearBtn = document.getElementById("clearBtn");
  const feedback = document.getElementById("feedback");
  const counterEl = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const slideArea = document.getElementById("slideArea");
  const endScreen = document.getElementById("endScreen");
  const questionBox = document.getElementById("questionBox");

  document.getElementById("vocabToggle").addEventListener("click", () => {
    const body = document.getElementById("vocabBody");
    const chevron = document.getElementById("vocabChevron");
    const open = body.classList.toggle("open");
    chevron.textContent = open ? "▲" : "▼";
  });

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getCurrentSentence() {
    const ex = EXERCISES[exerciseIndex];
    return phase === "positive" ? ex.positive : ex.negative;
  }

  function getGlobalStep() {
    return exerciseIndex * 2 + (phase === "positive" ? 1 : 2);
  }

  function updateProgress() {
    const totalSteps = EXERCISES.length * 2;
    const currentStep = getGlobalStep();
    counterEl.textContent = `${currentStep} / ${totalSteps}`;
    progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
  }

  function clearFeedback() {
    feedback.textContent = "";
    feedback.className = "feedback";
  }

  function renderTargetLine() {
    const sentence = getCurrentSentence();
    targetLine.innerHTML = "";

    sentence.forEach((_, index) => {
      const slot = document.createElement("span");
      slot.className = "slot";

      if (selectedWords[index]) {
        slot.textContent = selectedWords[index];
        slot.classList.add("filled");
      } else {
        slot.textContent = "_____";
      }

      targetLine.appendChild(slot);
    });
  }

  function renderTiles() {
    const sentence = getCurrentSentence();
    const shuffledWords = shuffle(sentence);

    tilesGrid.innerHTML = "";

    shuffledWords.forEach((word) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tile";
      btn.textContent = word;

      btn.addEventListener("click", () => {
        if (locked) return;
        if (selectedWords.length >= sentence.length) return;

        selectedWords.push(word);
        btn.classList.add("used");
        renderTargetLine();

        if (selectedWords.length === sentence.length) {
          autoCheckAnswer();
        }
      });

      tilesGrid.appendChild(btn);
    });
  }

  function renderPhase() {
    const ex = EXERCISES[exerciseIndex];
    selectedWords = [];
    locked = false;
    clearFeedback();
    questionBox.classList.remove("shake");

    exerciseImage.style.display = "block";
    exerciseImage.src = IMG + ex.image;
    exerciseImage.alt = "Imagen del ejercicio";

    phaseBadge.textContent = phase === "positive"
      ? "Oración afirmativa"
      : "Oración negativa";

    updateProgress();
    renderTargetLine();
    renderTiles();
  }

  function markCorrect() {
    const slots = targetLine.querySelectorAll(".slot");
    slots.forEach(slot => {
      slot.classList.add("correct");
    });

    const tiles = tilesGrid.querySelectorAll(".tile.used");
    tiles.forEach(tile => {
      tile.classList.add("correct");
    });
  }

  function markWrong() {
    feedback.textContent = "No. Inténtalo otra vez.";
    feedback.className = "feedback bad";
    questionBox.classList.remove("shake");
    void questionBox.offsetWidth;
    questionBox.classList.add("shake");

    setTimeout(() => {
      questionBox.classList.remove("shake");
    }, 450);
  }

  function goNext() {
    if (phase === "positive") {
      phase = "negative";
      renderPhase();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    exerciseIndex++;
    phase = "positive";

    if (exerciseIndex >= EXERCISES.length) {
      slideArea.style.display = "none";
      endScreen.classList.add("show");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    renderPhase();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function autoCheckAnswer() {
    if (locked) return;

    const sentence = getCurrentSentence();
    const correct = sentence.every((word, index) => selectedWords[index] === word);

    if (correct) {
      locked = true;
      markCorrect();
      feedback.textContent = "¡Correcto!";
      feedback.className = "feedback good";

      setTimeout(() => {
        goNext();
      }, 1000);
    } else {
      markWrong();
    }
  }

  clearBtn.addEventListener("click", () => {
    if (locked) return;
    renderPhase();
  });

  renderPhase();
})();