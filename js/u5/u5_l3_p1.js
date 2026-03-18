(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  const EXERCISES = [
    {
      person:   "Mother",
      image:    BASE + "images/u5/u5.she.cooking.dinner.jpg",
      before:   "She",
      after:    "cooking dinner.",
      correct:  "is",
      wrong:    "are"
    },
    {
      person:   "Father",
      image:    BASE + "images/u5/u5.l1.p1.man.painting.jpg",
      before:   "He",
      after:    "painting the living room.",
      correct:  "is",
      wrong:    "are"
    },
    {
      person:   "Son",
      image:    BASE + "images/u5/u5.son.reading.jpg",
      before:   "He",
      after:    "reading a book.",
      correct:  "is",
      wrong:    "are"
    },
    {
      person:   "Daughter",
      image:    BASE + "images/u5/u5.daughter.english.jpg",
      before:   "She",
      after:    "studying English.",
      correct:  "is",
      wrong:    "are"
    },
    {
      person:   "Parents",
      image:    BASE + "images/u5/u5.l1.p2.mother.father.jpg",
      before:   "They",
      after:    "at the beach.",
      correct:  "are",
      wrong:    "is"
    },
    {
      person:   "Grandparents",
      image:    BASE + "images/u5/u5.grandparents.jpg",
      before:   "They",
      after:    "in Paris.",
      correct:  "are",
      wrong:    "is"
    },
    {
      person:   "Wife",
      image:    BASE + "images/u5/u5.wife.riding.jpg",
      before:   "She",
      after:    "riding a bicycle.",
      correct:  "is",
      wrong:    "are"
    },
    {
      person:   "Husband",
      image:    BASE + "images/u5/u5.husband.swim.jpg",
      before:   "He",
      after:    "swimming.",
      correct:  "is",
      wrong:    "are"
    },
    {
      person:   "Grandmother",
      image:    BASE + "images/u5/u5.grandmother.planting.jpg",
      before:   "She",
      after:    "planting flowers.",
      correct:  "is",
      wrong:    "are"
    },
    {
      person:   "Grandfather",
      image:    BASE + "images/u5/u5.grandfather.jpg",
      before:   "He",
      after:    "fixing the shower.",
      correct:  "is",
      wrong:    "are"
    }
  ];

  let exIndex = 0;
  let locked  = false;

  const imgEl       = document.getElementById("lessonImg");
  const personLabel = document.getElementById("personLabel");
  const sentenceBox = document.getElementById("sentenceBox");
  const answersEl   = document.getElementById("answers");
  const counter     = document.getElementById("counter");
  const bar         = document.getElementById("progressBar");
  const endScreen   = document.getElementById("endScreen");

  // ── Load exercise ─────────────────────────────────────────
  function loadExercise() {
    locked = false;
    const ex = EXERCISES[exIndex];

    counter.textContent = `${exIndex + 1} / ${EXERCISES.length}`;
    bar.style.width = ((exIndex + 1) / EXERCISES.length * 100) + "%";

    imgEl.src = ex.image;
    imgEl.alt = ex.person;
    personLabel.textContent = ex.person;

    // Build sentence with blank slot
    sentenceBox.innerHTML =
      `${ex.before} <span class="blank-slot" id="blankSlot">___</span> ${ex.after}`;

    // Build shuffled answer buttons
    const options = [
      { text: ex.correct, isCorrect: true  },
      { text: ex.wrong,   isCorrect: false }
    ];
    shuffle(options);

    answersEl.innerHTML = "";
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.textContent = opt.text;
      btn.onclick = () => selectAnswer(btn, opt.text, opt.isCorrect);
      answersEl.appendChild(btn);
    });
  }

  // ── Select answer ─────────────────────────────────────────
  function selectAnswer(btn, text, isCorrect) {
    if (locked) return;
    locked = true;

    answersEl.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);

    if (isCorrect) {
      btn.classList.add("correct");
      // Fill the blank slot
      const slot = document.getElementById("blankSlot");
      if (slot) {
        slot.textContent = text;
        slot.classList.add("correct");
      }
      setTimeout(advance, 1000);
    } else {
      btn.classList.add("wrong");
      setTimeout(() => {
        btn.classList.remove("wrong");
        answersEl.querySelectorAll(".answer-btn").forEach(b => b.disabled = false);
        locked = false;
      }, 600);
    }
  }

  // ── Advance ───────────────────────────────────────────────
  function advance() {
    exIndex++;
    if (exIndex >= EXERCISES.length) {
      document.querySelector(".card").style.display = "none";
      endScreen.style.display = "block";
      return;
    }
    loadExercise();
  }

  // ── Shuffle ───────────────────────────────────────────────
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  // ── Init — shuffle exercises then start ───────────────────
  shuffle(EXERCISES);
  loadExercise();
})();
