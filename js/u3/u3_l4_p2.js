/* u3_l4_p2.js
   - No audio
   - 10 rounds: image + 1 question + 2 options
   - Wrong = red only (no green reveal), retry allowed
   - Correct = green, auto-next
   - Options shuffled each round
*/
(() => {
  "use strict";

  const IMG_BASE = "../../../../assets/images/u3/";

  // ===== DOM =====
  const sceneImg   = document.getElementById("sceneImg");
  const roundLabel = document.getElementById("roundLabel");

  const qText      = document.getElementById("qText");
  const qStatus    = document.getElementById("qStatus");
  const qOptions   = document.getElementById("qOptions");

  const feedbackOk = document.getElementById("feedbackOk");
  const endScreen  = document.getElementById("endScreen");
  const qBox       = document.getElementById("qBox");

  // ===== DATA =====
  const ROUNDS = [
    {
      img: "u3.l4.p2.tom.drinking.jpg",
      question: "What is Tom doing?",
      options: ["He is drinking lemonade.", "He is eating dinner."],
      answer: "He is drinking lemonade."
    },
    {
      img: "u3.l4.p2.anna.eating.jpg",
      question: "What is Anna doing?",
      options: ["She is eating dinner.", "She is drinking."],
      answer: "She is eating dinner."
    },
    {
      img: "u3.l4.p2.lopez.reading.jpg",
      question: "What is Mr Lopez doing?",
      options: ["He is reading a book.", "He is planting flowers."],
      answer: "He is reading a book."
    },
    {
      img: "u3.l4.p2.lopez.eating.jpg",
      question: "What is Mrs Lopez doing?",
      options: ["She is eating burger.", "She is playing cards."],
      answer: "She is eating burger."
    },
    {
      img: "u3.l4.p2.carlos.playing.jpg",
      question: "What is Carlos doing?",
      options: ["He is playing baseball.", "He is reading a book."],
      answer: "He is playing baseball."
    },
    {
      img: "u3.l4.p2.man.planting.jpg",
      question: "What is Mr Johnson doing?",
      options: ["He is planting flowers.", "He is drinking lemonade."],
      answer: "He is planting flowers."
    },
    {
      img: "u3.l4.p2.studying.jpg",
      question: "What are they doing?",
      options: ["They are studying English.", "They are playing games."],
      answer: "They are studying English."
    },
    {
      img: "u3.l4.p2.we.cooking.jpg",
      question: "What are we doing?",
      options: ["We are drinking.", "We are cooking dinner."],
      answer: "We are cooking dinner."
    },
    {
      img: "u3.l4.p2.they.singing.jpg",
      question: "What are they doing?",
      options: ["They are playing.", "They are singing."],
      answer: "They are singing."
    },
    {
      img: "u3.l4.p2.sleeping.jpg",
      question: "What is he doing?",
      options: ["He is sleeping.", "He is singing."],
      answer: "He is sleeping."
    }
  ];

  const TOTAL = ROUNDS.length;
  let idx = 0;

  // ===== HELPERS =====
  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }

  function setStatus(type) {
    qStatus.textContent = type === "ok" ? "✓" : type === "bad" ? "✗" : "";
    qStatus.classList.remove("ok", "bad");
    if (type === "ok") qStatus.classList.add("ok");
    if (type === "bad") qStatus.classList.add("bad");
  }

  function clearOptions() {
    while (qOptions.firstChild) qOptions.removeChild(qOptions.firstChild);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function disableAll(disabled) {
    qOptions.querySelectorAll("button.opt").forEach(btn => (btn.disabled = !!disabled));
  }

  function resetWrongOnly() {
    qOptions.querySelectorAll("button.opt").forEach(btn => btn.classList.remove("wrong"));
  }

  function markCorrect(correct) {
    qOptions.querySelectorAll("button.opt").forEach(btn => {
      if (btn.textContent === correct) btn.classList.add("correct");
    });
  }

  function markWrongOnly(chosen) {
    qOptions.querySelectorAll("button.opt").forEach(btn => {
      if (btn.textContent === chosen) btn.classList.add("wrong");
    });
  }

  function showFeedback() {
    feedbackOk.textContent = feedbackOk.dataset.text || "Correct!";
    show(feedbackOk);
    setTimeout(() => hide(feedbackOk), 800);
  }

  // ===== RENDER =====
  function renderRound(i) {
    idx = i;

    hide(endScreen);
    show(qBox);
    hide(feedbackOk);

    setStatus("none");
    clearOptions();

    const r = ROUNDS[idx];

    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;
    sceneImg.src = IMG_BASE + r.img;
    qText.textContent = r.question;

    const opts = shuffle(r.options);

    opts.forEach(opt => {
      const b = document.createElement("button");
      b.className = "opt";
      b.type = "button";
      b.textContent = opt;

      b.addEventListener("click", () => {
        disableAll(true);

        if (opt === r.answer) {
          setStatus("ok");
          markCorrect(r.answer);
          showFeedback();

          setTimeout(() => {
            if (idx < TOTAL - 1) renderRound(idx + 1);
            else finish();
          }, 900);

        } else {
          setStatus("bad");
          markWrongOnly(opt);

          // allow retry (do NOT reveal correct)
          setTimeout(() => {
            setStatus("none");
            resetWrongOnly();
            disableAll(false);
          }, 650);
        }
      });

      qOptions.appendChild(b);
    });
  }

  function finish() {
    hide(qBox);
    show(endScreen);
  }

  // ===== INIT =====
  renderRound(0);
})();