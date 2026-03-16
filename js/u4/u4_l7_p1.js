// js/u4/u4_l7_p1.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG = BASE + "images/u4/";

  const EXERCISES = [
    {
      image: "u4.l7.p1.young.woman.jpg",
      question: "Is Kate young or old?",
      prefix: "She is",
      answer: "young",
      options: ["young", "old", "married"]
    },
    {
      image: "u4.l7.p1.old.woman.jpg",
      question: "Is Peggy young or old?",
      prefix: "She is",
      answer: "old",
      options: ["old", "young", "pretty"]
    },
    {
      image: "u4.l4.p1.married.jpg",
      question: "Is Gloria married or single?",
      prefix: "She is",
      answer: "married",
      options: ["married", "single", "young"]
    },
    {
      image: "u4.l4.p1.single.jpg",
      question: "Is Jake married or single?",
      prefix: "He is",
      answer: "single",
      options: ["single", "married", "old"]
    },
    {
      image: "u4.l2.p1.fast.car.jpg",
      question: "Is your car fast or slow?",
      prefix: "It is",
      answer: "fast",
      options: ["fast", "slow", "cheap"]
    },
    {
      image: "u4.l2.p1.cheap.watch.jpg",
      question: "Is your watch cheap or expensive?",
      prefix: "It is",
      answer: "cheap",
      options: ["cheap", "expensive", "slow"]
    },
    {
      image: "u4.l7.p1.pretty.woman.jpg",
      question: "Is Vanessa pretty or ugly?",
      prefix: "She is",
      answer: "pretty",
      options: ["pretty", "ugly", "old"]
    },
    {
      image: "u4.l5.p5.restaurant.jpg",
      question: "Is this new restaurant cheap or expensive?",
      prefix: "It is",
      answer: "expensive",
      options: ["expensive", "cheap", "small"]
    },
    {
      image: "u4.l6.p1.test.jpg",
      question: "Is your test easy or difficult?",
      prefix: "It is",
      answer: "difficult",
      options: ["difficult", "easy", "cheap"]
    },
    {
      image: "u4.l4.p3.small.house.jpg",
      question: "Is her house big or small?",
      prefix: "It is",
      answer: "small",
      options: ["small", "big", "ugly"]
    },
    {
      image: "u4.l4.p2.brian.tall.jpg",
      question: "Is Brian short or tall?",
      prefix: "He is",
      answer: "tall",
      options: ["tall", "short", "single"]
    },
    {
      image: "u4.l6.p1.noisy.jpg",
      question: "Are your neighbors noisy or quiet?",
      prefix: "They are",
      answer: "noisy",
      options: ["noisy", "quiet", "young"]
    }
  ];

  let current = 0;
  let locked = false;

  const exerciseImage = document.getElementById("exerciseImage");
  const questionText = document.getElementById("questionText");
  const answerPrefix = document.getElementById("answerPrefix");
  const answerBlank = document.getElementById("answerBlank");
  const optionsGrid = document.getElementById("optionsGrid");
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

  function updateProgress() {
    counterEl.textContent = `${current + 1} / ${EXERCISES.length}`;
    progressBar.style.width = `${((current + 1) / EXERCISES.length) * 100}%`;
  }

  function clearFeedback() {
    feedback.textContent = "";
    feedback.className = "feedback";
  }

  function renderExercise() {
    locked = false;
    const ex = EXERCISES[current];

    updateProgress();
    clearFeedback();

    exerciseImage.style.display = "block";
    exerciseImage.src = IMG + ex.image;
    exerciseImage.alt = ex.answer;

    questionText.textContent = ex.question;
    answerPrefix.textContent = ex.prefix;
    answerBlank.textContent = "_____";
    answerBlank.classList.remove("filled");
    questionBox.classList.remove("shake");

    renderOptions(ex);
  }

  function renderOptions(ex) {
    optionsGrid.innerHTML = "";
    const shuffledOptions = shuffle(ex.options);

    shuffledOptions.forEach(option => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.type = "button";
      btn.textContent = option;

      btn.addEventListener("click", () => handleAnswer(btn, option, ex));
      optionsGrid.appendChild(btn);
    });
  }

  function disableAllOptions() {
    const buttons = optionsGrid.querySelectorAll(".option-btn");
    buttons.forEach(btn => btn.disabled = true);
  }

  function handleAnswer(button, selected, ex) {
    if (locked) return;

    if (selected === ex.answer) {
      locked = true;
      button.classList.add("correct");
      disableAllOptions();

      answerBlank.textContent = ex.answer;
      answerBlank.classList.add("filled");

      feedback.textContent = "¡Correcto!";
      feedback.classList.add("good");

      setTimeout(() => {
        current++;
        if (current >= EXERCISES.length) {
          slideArea.style.display = "none";
          endScreen.classList.add("show");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          renderExercise();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 1000);

      return;
    }

    button.classList.add("wrong");
    feedback.textContent = "Inténtalo otra vez.";
    feedback.classList.add("bad");
    questionBox.classList.remove("shake");
    void questionBox.offsetWidth;
    questionBox.classList.add("shake");

    setTimeout(() => {
      button.classList.remove("wrong");
      questionBox.classList.remove("shake");
    }, 450);
  }

  renderExercise();
})();