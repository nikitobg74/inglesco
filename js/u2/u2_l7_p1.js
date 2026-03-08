// u2_l7_p1.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/"
  };

  const STORY = {
    img: "u2.l6.p4.classroom.jpg",
    lines: [
      "I am not at home. I am at school.",
      "",
      "Mateo is not at home. He is at school.",
      "Emma is not at home. She is at school.",
      "Jane and Linda are not at home. They are at school too.",
      "",
      "Where is Mateo? He is in the classroom.",
      "Where is Emma? She is in the classroom.",
      "Where are Jane and Linda? They are in the classroom.",
      "",
      "We are at school today.",
      "All the students are in the classroom today."
    ].join("\n")
  };

  // Quiz now includes blanks that get filled on correct answers.
  // Added 2 "on" questions to reduce the heavy "at" feeling.
  // Changed park to "in the park" (very normal English).
  const QUIZ = [
    {
      img: null,
      qParts: ["Mateo is not at home.", "He is ", " school."],
      choices: ["in", "at", "on"],
      correctIndex: 1
    },
    {
      img: null,
      qParts: ["Emma is not at home.", "She is ", " school."],
      choices: ["in", "at", "on"],
      correctIndex: 1
    },
    {
      img: null,
      qParts: ["Jane and Linda are not at home.", "They are ", " school."],
      choices: ["in", "at", "on"],
      correctIndex: 1
    },
    {
      img: null,
      qParts: ["We are ", " school today."],
      choices: ["at", "in", "on"],
      correctIndex: 0
    },

    {
      img: null,
      qParts: ["Where is Mateo?", "He is ", " the classroom."],
      choices: ["at", "in", "on"],
      correctIndex: 1
    },
    {
      img: null,
      qParts: ["Where is Emma?", "She is ", " the classroom."],
      choices: ["at", "in", "on"],
      correctIndex: 1
    },
    {
      img: null,
      qParts: ["Where are Jane and Linda?", "They are ", " the classroom."],
      choices: ["at", "in", "on"],
      correctIndex: 1
    },
    {
      img: null,
      qParts: ["All the students are ", " the classroom today."],
      choices: ["in", "at", "on"],
      correctIndex: 0
    },

    // Added "ON" practice (use your existing classroom images)
    {
      img: "u2.l6.p1.pen.jpg",
      qParts: ["The pen is ", " the desk."],
      choices: ["in", "at", "on"],
      correctIndex: 2
    },
    {
      img: "u2.l6.p1.book.jpg",
      qParts: ["The book is ", " the desk."],
      choices: ["in", "at", "on"],
      correctIndex: 2
    },

    // Your images 9–12 (now display smaller + true image via CSS)
    {
      img: "u2.l2.p2.man.bedroom.jpg",
      qParts: ["Where is Mateo?", "He is ", " the bedroom."],
      choices: ["in", "at", "on"],
      correctIndex: 0
    },
    {
      img: "u2.l2.p4.park1.jpg",
      qParts: ["Where is Emma?", "She is ", " the park."],
      choices: ["at", "in", "on"],
      correctIndex: 1 // changed to IN the park
    },
    {
      img: "u2.l7.p1.women.livingroom.jpg",
      qParts: ["Where are Jane and Linda?", "They are ", " the living room."],
      choices: ["in", "at", "on"],
      correctIndex: 0
    },
    {
      img: "u2.l3.p1.man.bank1.jpg",
      qParts: ["Where are you?", "I am ", " the bank."],
      choices: ["at", "in", "on"],
      correctIndex: 0
    }
  ];

  // ===== Helpers =====
  const $ = (id) => document.getElementById(id);
  const joinPath = (base, file) => (file ? base + file : "");

  function setStory() {
    $("storyImg").src = joinPath(CONFIG.IMG_BASE, STORY.img);
    $("storyText").textContent = STORY.lines;
  }

  const state = { solved: new Array(QUIZ.length).fill(false) };

  function renderQuiz() {
    const wrap = $("quizWrap");
    wrap.innerHTML = "";

    QUIZ.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "q-card";
      card.dataset.index = String(idx);

      // Number
      const num = document.createElement("div");
      num.className = "exercise-num";
      num.textContent = `Exercise ${idx + 1}`;
      card.appendChild(num);

      // Optional image
      if (item.img) {
        const im = document.createElement("img");
        im.className = "q-img";
        im.alt = "Question image";
        im.src = joinPath(CONFIG.IMG_BASE, item.img);
        card.appendChild(im);
      }

      // Question with blank
      const q = document.createElement("div");
      q.className = "q-text";

      const parts = item.qParts;
      // Build: line1 (optional) + line2 with blank
      // We’ll join with newline if there are 3 parts and first part is a separate line.
      // If parts length is 2: ["The pen is ", " the desk."] (no extra line)
      if (parts.length === 3) {
        // first sentence on its own line
        q.appendChild(document.createTextNode(parts[0] + "\n"));

        // second line with blank
        q.appendChild(document.createTextNode(parts[1]));
        const blank = document.createElement("span");
        blank.className = "blank";
        blank.textContent = "____";
        blank.dataset.blank = "1";
        q.appendChild(blank);
        q.appendChild(document.createTextNode(parts[2]));
      } else if (parts.length === 2) {
        q.appendChild(document.createTextNode(parts[0]));
        const blank = document.createElement("span");
        blank.className = "blank";
        blank.textContent = "____";
        blank.dataset.blank = "1";
        q.appendChild(blank);
        q.appendChild(document.createTextNode(parts[1]));
      } else {
        // fallback
        q.textContent = "Choose the correct answer.";
      }

      card.appendChild(q);

      const choices = document.createElement("div");
      choices.className = "choices";

      item.choices.forEach((label, cIdx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-btn";
        btn.textContent = `${String.fromCharCode(65 + cIdx)}) ${label}`;
        btn.addEventListener("click", () => onAnswer(idx, cIdx, btn, choices, card, label));
        choices.appendChild(btn);
      });

      card.appendChild(choices);
      wrap.appendChild(card);
    });
  }

  function onAnswer(qIndex, choiceIndex, btn, choicesWrap, card, chosenLabel) {
    const item = QUIZ[qIndex];
    const buttons = Array.from(choicesWrap.querySelectorAll(".choice-btn"));
    buttons.forEach(b => b.classList.remove("wrong"));

    if (choiceIndex === item.correctIndex) {
      btn.classList.add("correct");
      buttons.forEach(b => (b.disabled = true));
      state.solved[qIndex] = true;

      // Fill the blank
      const blank = card.querySelector(".blank[data-blank='1']");
      if (blank) {
        blank.textContent = chosenLabel;
        blank.classList.add("filled");
      }

      checkAllDone();
    } else {
      btn.classList.add("wrong");
      // keep enabled so user can correct
    }
  }

  function checkAllDone() {
    const all = state.solved.every(Boolean);
    $("doneBadge").classList.toggle("hidden", !all);
    $("nextBtn").classList.toggle("hidden", !all);
  }

  function wireProgressNav() {
    document.querySelectorAll(".step").forEach(step => {
      step.addEventListener("click", () => {
        const go = step.getAttribute("data-go");
        if (go) window.location.href = go;
      });
    });
  }

  // Init
  setStory();
  renderQuiz();
  wireProgressNav();
})();