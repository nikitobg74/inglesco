// js/u4/u4_l6_p4.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";

  // Each question:
  //   image      — filename in /images/u4/
  //   context    — the prompt shown above the sentence
  //   before     — text before the blank
  //   after      — text after the blank (empty string if blank is at the end)
  //   answer     — the correct adjective
  //   distractors — exactly 2 wrong adjectives shown alongside the correct one
  const QUESTIONS = [
    // ── Scenario 1: brother ──────────────────────────────────────────────
    {
      image:       "u4.l6.p4.women.jpg",
      context:     "Tell me about your brother.",
      before:      "Is he short or",
      after:       "?",
      answer:      "tall",
      distractors: ["pretty", "cheap"]
    },
    {
      image:       "u4.l6.p4.women.jpg",
      context:     "Tell me about your brother.",
      before:      "Is he handsome or",
      after:       "?",
      answer:      "ugly",
      distractors: ["noisy", "young"]
    },
    {
      image:       "u4.l6.p4.women.jpg",
      context:     "Tell me about your brother.",
      before:      "Is he old or",
      after:       "?",
      answer:      "young",
      distractors: ["tall", "married"]
    },
    {
      image:       "u4.l6.p4.women.jpg",
      context:     "Tell me about your brother.",
      before:      "Is he single or",
      after:       "?",
      answer:      "married",
      distractors: ["small", "easy"]
    },
    // ── Scenario 2: apartment ────────────────────────────────────────────
    {
      image:       "u4.l6.p4.men.jpg",
      context:     "Tell me about the apartment.",
      before:      "Is it large or",
      after:       "?",
      answer:      "small",
      distractors: ["handsome", "married"]
    },
    {
      image:       "u4.l6.p4.men.jpg",
      context:     "Tell me about the apartment.",
      before:      "Is it quiet or",
      after:       "?",
      answer:      "noisy",
      distractors: ["ugly", "young"]
    },
    {
      image:       "u4.l6.p4.men.jpg",
      context:     "Tell me about the apartment.",
      before:      "Is it cheap or",
      after:       "?",
      answer:      "expensive",
      distractors: ["tall", "old"]
    },
    {
      image:       "u4.l6.p4.men.jpg",
      context:     "Tell me about the apartment.",
      before:      "Is it pretty or",
      after:       "?",
      answer:      "ugly",
      distractors: ["short", "single"]
    }
  ];

  const TOTAL = QUESTIONS.length;

  const exerciseImage    = document.getElementById("exerciseImage");
  const contextTextEl    = document.getElementById("contextText");
  const questionSentence = document.getElementById("questionSentence");
  const choicesWrap      = document.getElementById("choicesWrap");
  const feedbackEl       = document.getElementById("feedback");
  const exCounter        = document.getElementById("exCounter");
  const barFill          = document.getElementById("barFill");
  const slideArea        = document.getElementById("slideArea");
  const endScreen        = document.getElementById("endScreen");

  let current = 0;
  let locked  = false;   // prevent double-taps while animating

  // ── vocab toggle ──────────────────────────────────────────────────────
  document.getElementById("vocabToggle").addEventListener("click", () => {
    const body    = document.getElementById("vocabBody");
    const chevron = document.getElementById("vocabChevron");
    const open    = body.classList.toggle("open");
    chevron.textContent = open ? "▲" : "▼";
  });

  // ── helpers ───────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function updateProgress(index) {
    exCounter.textContent = `${index + 1} / ${TOTAL}`;
    barFill.style.width   = `${(index / TOTAL) * 100}%`;
  }

  // ── build the sentence with a blank span ─────────────────────────────
  function buildSentence(before, after) {
    questionSentence.innerHTML = "";

    if (before) {
      const b = document.createTextNode(before + " ");
      questionSentence.appendChild(b);
    }

    const blankSpan = document.createElement("span");
    blankSpan.className = "blank";
    blankSpan.textContent = "___";
    questionSentence.appendChild(blankSpan);

    if (after) {
      const a = document.createTextNode(after);
      questionSentence.appendChild(a);
    }

    return blankSpan;
  }

  // ── load one question ─────────────────────────────────────────────────
  function loadQuestion(index) {
    locked = false;
    const q = QUESTIONS[index];

    updateProgress(index);
    exerciseImage.src        = IMG + q.image;
    exerciseImage.alt        = q.context;
    contextTextEl.textContent = q.context;

    const blankSpan = buildSentence(q.before, q.after);

    feedbackEl.textContent = "";
    feedbackEl.className   = "feedback";
    choicesWrap.innerHTML  = "";

    const choices = shuffle([q.answer, ...q.distractors]);

    choices.forEach(word => {
      const btn = document.createElement("button");
      btn.type        = "button";
      btn.className   = "choice-btn";
      btn.textContent = word;
      btn.addEventListener("click", () => onChoice(btn, word, q.answer, blankSpan));
      choicesWrap.appendChild(btn);
    });
  }

  // ── handle a tap ──────────────────────────────────────────────────────
  function onChoice(btn, chosen, correct, blankSpan) {
    if (locked) return;
    locked = true;

    // disable all choices
    choicesWrap.querySelectorAll(".choice-btn")
      .forEach(b => { b.disabled = true; });

    if (chosen === correct) {
      btn.classList.add("correct-flash");
      blankSpan.textContent = chosen;
      blankSpan.classList.add("filled-correct");
      feedbackEl.textContent = "¡Correcto! 🎉";
      feedbackEl.className   = "feedback correct";
      barFill.style.width    = `${((current + 1) / TOTAL) * 100}%`;
      // auto-advance after 1500 ms only on correct
      setTimeout(() => advance(), 1500);
    } else {
      btn.classList.add("wrong-flash", "shake");
      feedbackEl.textContent = "Inténtalo de nuevo.";
      feedbackEl.className   = "feedback wrong";
      // shake, then re-enable all buttons so student can try again
      setTimeout(() => {
        btn.classList.remove("wrong-flash", "shake");
        choicesWrap.querySelectorAll(".choice-btn")
          .forEach(b => { b.disabled = false; });
        locked = false;
      }, 600);
    }
  }

  // ── advance to next question or end ───────────────────────────────────
  function advance() {
    current += 1;
    if (current >= TOTAL) {
      barFill.style.width     = "100%";
      slideArea.style.display = "none";
      endScreen.classList.add("show");
    } else {
      loadQuestion(current);
    }
  }

  // ── init ──────────────────────────────────────────────────────────────
  loadQuestion(0);
})();
