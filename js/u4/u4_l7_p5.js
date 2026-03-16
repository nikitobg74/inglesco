// js/u4/u4_l7_p5.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG = BASE + "images/u4/";

  const EXERCISES = [
    {
      image: "u4.l7.p1.young.woman.jpg",
      question: "Is Kate young or old?",
      options: ["She is young.", "She is old.", "She is noisy."],
      correct: "She is young."
    },
    {
      image: "u4.l4.p2.brian.tall.jpg",
      question: "Is Brian tall or short?",
      options: ["He is tall.", "He is short.", "He is small."],
      correct: "He is tall."
    },
    {
      image: "u4.l4.p1.married.jpg",
      question: "Is Gloria married or single?",
      options: ["She is married.", "She is single.", "She is noisy."],
      correct: "She is married."
    },
    {
      image: "u4.l4.p1.single.jpg",
      question: "Is Jake married or single?",
      options: ["He is single.", "He is married.", "He is small."],
      correct: "He is single."
    },
    {
      image: "u4.l2.p1.fast.car.jpg",
      question: "Is the car fast or slow?",
      options: ["It is fast.", "It is slow.", "It is cheap."],
      correct: "It is fast."
    },
    {
      image: "u4.l2.p1.cheap.watch.jpg",
      question: "Is the watch cheap or expensive?",
      options: ["It is cheap.", "It is expensive.", "It is noisy."],
      correct: "It is cheap."
    },
    {
      image: "u4.l5.p5.restaurant.jpg",
      question: "Is this restaurant cheap or expensive?",
      options: ["It is expensive.", "It is cheap.", "It is small."],
      correct: "It is expensive."
    },
    {
      image: "u4.l4.p3.small.house.jpg",
      question: "Is the house big or small?",
      options: ["It is small.", "It is big.", "It is noisy."],
      correct: "It is small."
    },
    {
      image: "u4.l6.p1.test.jpg",
      question: "Is the test easy or difficult?",
      options: ["It is difficult.", "It is easy.", "It is noisy."],
      correct: "It is difficult."
    },
    {
      image: "u4.l6.p1.noisy.jpg",
      question: "Are the neighbors noisy or quiet?",
      options: ["They are noisy.", "They are quiet.", "They are married."],
      correct: "They are noisy."
    }
  ];

  let current = 0;
  let locked = false;

  const exerciseImage = document.getElementById("exerciseImage");
  const questionText = document.getElementById("questionText");
  const optionsGrid = document.getElementById("optionsGrid");
  const feedback = document.getElementById("feedback");
  const counterEl = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const questionBox = document.getElementById("questionBox");
  const quizCard = document.getElementById("quizCard");
  const endScreen = document.getElementById("endScreen");

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function clearFeedback() {
    feedback.textContent = "";
    feedback.className = "feedback";
  }

  function updateProgress() {
    counterEl.textContent = `${current + 1} / ${EXERCISES.length}`;
    progressBar.style.width = `${((current + 1) / EXERCISES.length) * 100}%`;
  }

  function renderExercise() {
    locked = false;
    const ex = EXERCISES[current];

    updateProgress();
    clearFeedback();

    exerciseImage.style.display = "block";
    exerciseImage.src = IMG + ex.image;
    exerciseImage.alt = "Imagen del ejercicio";

    questionText.textContent = ex.question;
    questionBox.classList.remove("shake");

    optionsGrid.innerHTML = "";
    const shuffledOptions = shuffle(ex.options);

    shuffledOptions.forEach(option => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.type = "button";
      btn.textContent = option;

      btn.addEventListener("click", () => handleAnswer(btn, option, ex.correct));
      optionsGrid.appendChild(btn);
    });
  }

  function disableAllOptions() {
    const buttons = optionsGrid.querySelectorAll(".option-btn");
    buttons.forEach(btn => btn.disabled = true);
  }

  function handleAnswer(button, selected, correct) {
    if (locked) return;

    if (selected === correct) {
      locked = true;
      button.classList.add("correct");
      disableAllOptions();

      feedback.textContent = "¡Correcto!";
      feedback.classList.add("good");

      setTimeout(() => {
        current++;
        if (current >= EXERCISES.length) {
          quizCard.style.display = "none";
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
    feedback.textContent = "No. Inténtalo otra vez.";
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