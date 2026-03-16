// js/u4/u4_l7_p4.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG = BASE + "images/u4/";

  const EXERCISES = [
    {
      img: "u4.l7.p1.young.woman.jpg",
      answer: [
        { display: "She", full: "She" },
        { display: "is", full: "is" },
        { display: "yo_ng", full: "young", missing: "u", choices: ["u", "i", "o"] }
      ]
    },
    {
      img: "u4.l7.p1.old.woman.jpg",
      answer: [
        { display: "She", full: "She" },
        { display: "is", full: "is" },
        { display: "o_d", full: "old", missing: "l", choices: ["l", "r", "n"] }
      ]
    },
    {
      img: "u4.l4.p1.married.jpg",
      answer: [
        { display: "She", full: "She" },
        { display: "is", full: "is" },
        { display: "marr_ed", full: "married", missing: "i", choices: ["i", "a", "o"] }
      ]
    },
    {
      img: "u4.l4.p1.single.jpg",
      answer: [
        { display: "He", full: "He" },
        { display: "is", full: "is" },
        { display: "s_ngle", full: "single", missing: "i", choices: ["i", "a", "o"] }
      ]
    },
    {
      img: "u4.l2.p1.fast.car.jpg",
      answer: [
        { display: "It", full: "It" },
        { display: "is", full: "is" },
        { display: "fa_t", full: "fast", missing: "s", choices: ["s", "r", "n"] }
      ]
    },
    {
      img: "u4.l2.p1.cheap.watch.jpg",
      answer: [
        { display: "It", full: "It" },
        { display: "is", full: "is" },
        { display: "ch_ap", full: "cheap", missing: "e", choices: ["e", "a", "i"] }
      ]
    },
    {
      img: "u4.l7.p1.pretty.woman.jpg",
      answer: [
        { display: "She", full: "She" },
        { display: "is", full: "is" },
        { display: "pr_tty", full: "pretty", missing: "e", choices: ["e", "a", "i"] }
      ]
    },
    {
      img: "u4.l5.p5.restaurant.jpg",
      answer: [
        { display: "It", full: "It" },
        { display: "is", full: "is" },
        { display: "exp_nsive", full: "expensive", missing: "e", choices: ["e", "a", "i"] }
      ]
    },
    {
      img: "u4.l6.p1.test.jpg",
      answer: [
        { display: "It", full: "It" },
        { display: "is", full: "is" },
        { display: "diff_cult", full: "difficult", missing: "i", choices: ["i", "a", "o"] }
      ]
    },
    {
      img: "u4.l4.p3.small.house.jpg",
      answer: [
        { display: "It", full: "It" },
        { display: "is", full: "is" },
        { display: "sm_ll", full: "small", missing: "a", choices: ["a", "o", "i"] }
      ]
    },
    {
      img: "u4.l4.p2.brian.tall.jpg",
      answer: [
        { display: "He", full: "He" },
        { display: "is", full: "is" },
        { display: "ta_l", full: "tall", missing: "l", choices: ["l", "r", "n"] }
      ]
    },
    {
      img: "u4.l6.p1.noisy.jpg",
      answer: [
        { display: "They", full: "They" },
        { display: "are", full: "are" },
        { display: "no_sy", full: "noisy", missing: "i", choices: ["i", "a", "o"] }
      ]
    }
  ];

  let current = 0;
  let userWords = [];
  let locked = false;

  let pendingTile = null;
  let pendingBtn = null;

  const image = document.getElementById("exerciseImage");
  const tiles = document.getElementById("tiles");
  const sentence = document.getElementById("sentence");
  const sentenceBox = document.getElementById("sentenceBox");
  const counter = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const endScreen = document.getElementById("endScreen");
  const cardArea = document.getElementById("cardArea");
  const feedback = document.getElementById("feedback");

  const popupBackdrop = document.getElementById("popupBackdrop");
  const popupWord = document.getElementById("popupWord");
  const letterOptions = document.getElementById("letterOptions");
  const popupNote = document.getElementById("popupNote");
  const letterPopup = document.getElementById("letterPopup");

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
    counter.textContent = `${current + 1} / ${EXERCISES.length}`;
    progressBar.style.width = `${((current + 1) / EXERCISES.length) * 100}%`;
  }

  function getExpectedWords() {
    return EXERCISES[current].answer.map(item => item.full);
  }

  function renderSentence() {
    sentence.textContent = userWords.join(" ");
  }

  function resetAttempt() {
    userWords = [];
    renderSentence();
    clearFeedback();
    sentence.classList.remove("correct");
    sentenceBox.classList.remove("shake");

    tiles.querySelectorAll(".tile").forEach(btn => {
      btn.classList.remove("used", "correct");
      btn.disabled = false;

      const full = btn.dataset.full;
      const display = btn.dataset.display;
      btn.textContent = display || full;
    });

    pendingTile = null;
    pendingBtn = null;
    closeLetterPopup(true);
  }

  function loadExercise() {
    const ex = EXERCISES[current];

    userWords = [];
    locked = false;
    pendingTile = null;
    pendingBtn = null;

    clearFeedback();
    sentence.textContent = "";
    sentence.classList.remove("correct");
    sentenceBox.classList.remove("shake");

    image.style.display = "block";
    image.src = IMG + ex.img;
    image.alt = "Imagen del ejercicio";

    updateProgress();

    tiles.innerHTML = "";
    const shuffled = shuffle(ex.answer.map(item => ({ ...item })));

    shuffled.forEach(item => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tile";
      btn.textContent = item.display;
      btn.dataset.display = item.display;
      btn.dataset.full = item.full;

      btn.addEventListener("click", () => {
        if (locked) return;
        if (btn.classList.contains("used")) return;
        if (popupBackdrop.classList.contains("show")) return;

        if (item.missing) {
          pendingTile = item;
          pendingBtn = btn;
          openLetterPopup(item);
        } else {
          addWord(item.full, btn);
        }
      });

      tiles.appendChild(btn);
    });
  }

  function addWord(word, btn) {
    userWords.push(word);
    btn.classList.add("used");
    btn.disabled = true;
    renderSentence();

    if (userWords.length === getExpectedWords().length) {
      checkAnswer();
    }
  }

  function openLetterPopup(tile) {
    popupWord.textContent = tile.display;
    popupNote.textContent = "";
    letterOptions.innerHTML = "";

    const choices = shuffle(tile.choices);

    choices.forEach(letter => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "letter-btn";
      btn.textContent = letter;

      btn.addEventListener("click", () => {
        if (!pendingTile || !pendingBtn) return;

        if (letter === tile.missing) {
          btn.classList.add("correct");
          popupWord.textContent = tile.full;
          popupNote.textContent = "¡Correcto!";

          // update the tile on the main screen before closing
          pendingBtn.textContent = tile.full;
          pendingBtn.dataset.display = tile.full;
          pendingBtn.classList.add("correct");

          const btnToUse = pendingBtn;
          const wordToUse = tile.full;

          setTimeout(() => {
            closeLetterPopup(false);
            addWord(wordToUse, btnToUse);
            pendingTile = null;
            pendingBtn = null;
          }, 300);
        } else {
          btn.classList.add("wrong");
          popupNote.textContent = "No. Inténtalo otra vez.";

          letterPopup.classList.remove("shake");
          void letterPopup.offsetWidth;
          letterPopup.classList.add("shake");

          setTimeout(() => {
            btn.classList.remove("wrong");
            letterPopup.classList.remove("shake");
          }, 400);
        }
      });

      letterOptions.appendChild(btn);
    });

    popupBackdrop.classList.add("show");
  }

  function closeLetterPopup(silent = false) {
    popupBackdrop.classList.remove("show");
    popupWord.textContent = "";
    popupNote.textContent = "";
    letterOptions.innerHTML = "";
    if (!silent) {
      letterPopup.classList.remove("shake");
    }
  }

  function markAllCorrect() {
    sentence.classList.add("correct");
    tiles.querySelectorAll(".tile.used").forEach(btn => {
      btn.classList.add("correct");
    });
  }

  function checkAnswer() {
    const expected = getExpectedWords().join(" ");
    const actual = userWords.join(" ");

    if (actual === expected) {
      locked = true;
      sentence.textContent = expected + ".";
      markAllCorrect();
      feedback.textContent = "¡Correcto!";
      feedback.classList.add("good");

      setTimeout(() => {
        current++;

        if (current >= EXERCISES.length) {
          cardArea.style.display = "none";
          endScreen.classList.add("show");
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        loadExercise();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1000);
    } else {
      feedback.textContent = "No. Inténtalo otra vez.";
      feedback.classList.add("bad");

      sentenceBox.classList.remove("shake");
      void sentenceBox.offsetWidth;
      sentenceBox.classList.add("shake");

      setTimeout(() => {
        sentenceBox.classList.remove("shake");
        resetAttempt();
      }, 450);
    }
  }

  loadExercise();
})();