(() => {
  "use strict";

  const AUDIO_BASE = "../../../../assets/audio/u3/l5/";
  const IMAGE_BASE = "../../../../assets/images/u3/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const noteCard    = document.getElementById("noteCard");
  const noteTitle   = document.getElementById("noteTitle");
  const noteBody    = document.getElementById("noteBody");
  const dismissBtn  = document.getElementById("dismissBtn");

  const roundLabel  = document.getElementById("roundLabel");
  const exerciseBox = document.getElementById("exerciseBox");
  const endScreen   = document.getElementById("endScreen");

  const itemImg     = document.getElementById("itemImg");
  const playBtn     = document.getElementById("playBtn");
  const playLabel   = document.getElementById("playLabel");

  const q1Block     = document.getElementById("q1Block");
  const q1Title     = document.getElementById("q1Title");
  const q1Options   = document.getElementById("q1Options");

  const q2Block     = document.getElementById("q2Block");
  const q2Title     = document.getElementById("q2Title");
  const q2Options   = document.getElementById("q2Options");

  const statusLine  = document.getElementById("statusLine");

  const endTitle    = document.getElementById("endTitle");
  const endMsg1     = document.getElementById("endMsg1");
  const endMsg2     = document.getElementById("endMsg2");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    note: {
      title:   "Usamos \"it\" para animales y objetos.",
      body:    [
        "Por ejemplo:",
        "<br>",
        "<b>The dog is in the garage.</b>",
        "<b>It is in the garage.</b>",
        "<i>El perro está en el garaje.</i>",
        "<i>Está en el garaje.</i>"
      ],
      dismiss: "¡Entendido!"
    },
    play:    "Escuchar",
    correct: "✓",
    wrong:   "✗",
    end: {
      title: "¡Buen trabajo!",
      msg1:  "Felicitaciones.",
      msg2:  "Terminaste la parte 1."
    }
  };

  // ── Rounds data ───────────────────────────────────────────────────────────
  // type "animal" → two questions (where + doing)
  // type "object" → one question (where only)
  const ROUNDS = [
    {
      type:  "animal",
      label: "Dog",
      audio: "u3.l5.p1.dog.mp3",
      image: "u3.l5.p1.dog.garage.sleeping.jpg",
      q1: {
        question: "Where is the dog?",
        correct:  "It is in the garage.",
        wrong:    ["It is in the kitchen.", "It is in the yard."]
      },
      q2: {
        question: "What is it doing?",
        correct:  "It is sleeping.",
        wrong:    ["It is eating fish.", "It is eating a banana."]
      }
    },
    {
      type:  "animal",
      label: "Cat",
      audio: "u3.l5.p1.cat.mp3",
      image: "u3.l5.p1.cat.kitchen.eatingfish.jpg",
      q1: {
        question: "Where is the cat?",
        correct:  "It is in the kitchen.",
        wrong:    ["It is in the garage.", "It is in the yard."]
      },
      q2: {
        question: "What is it doing?",
        correct:  "It is eating fish.",
        wrong:    ["It is sleeping.", "It is eating a banana."]
      }
    },
    {
      type:  "animal",
      label: "Monkey",
      audio: "u3.l5.p1.monkey.mp3",
      image: "u3.l5.p1.monkey.zoo.banana.jpg",
      q1: {
        question: "Where is the monkey?",
        correct:  "It is at the zoo.",
        wrong:    ["It is in the kitchen.", "It is in the garage."]
      },
      q2: {
        question: "What is it doing?",
        correct:  "It is eating a banana.",
        wrong:    ["It is sleeping.", "It is eating fish."]
      }
    },
    {
      type:  "object",
      label: "Globe",
      audio: "u3.l5.p1.globe.mp3",
      image: "u3.l5.p1.globe.desk.jpg",
      q1: {
        question: "Where is the globe?",
        correct:  "It is on the desk.",
        wrong:    ["It is on the chair.", "It is on the table."]
      }
    },
    {
      type:  "object",
      label: "Bag",
      audio: "u3.l5.p1.bag.mp3",
      image: "u3.l5.p1.bag.chair.jpg",
      q1: {
        question: "Where is the bag?",
        correct:  "It is on the chair.",
        wrong:    ["It is on the desk.", "It is on the wall."]
      }
    },
    {
      type:  "object",
      label: "Book",
      audio: "u3.l5.p1.book.mp3",
      image: "u3.l5.p1.book.table.jpg",
      q1: {
        question: "Where is the book?",
        correct:  "It is on the table.",
        wrong:    ["It is on the chair.", "It is on the wall."]
      }
    },
    {
      type:  "object",
      label: "Clock",
      audio: "u3.l5.p1.clock.mp3",
      image: "u3.l5.p1.clock.wall.jpg",
      q1: {
        question: "Where is the clock?",
        correct:  "It is on the wall.",
        wrong:    ["It is on the desk.", "It is on the table."]
      }
    }
  ];

  const TOTAL = ROUNDS.length;
  let idx     = 0;
  let audio   = null;
  let stage   = "q1"; // "q1" | "q2"

  // ── Helpers ───────────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function stopAudio() {
    if (!audio) return;
    try { audio.pause(); audio.currentTime = 0; } catch (e) {}
  }

  function setStatus(type, text) {
    statusLine.textContent = text;
    statusLine.classList.remove("ok", "bad");
    if (type === "ok")  statusLine.classList.add("ok");
    if (type === "bad") statusLine.classList.add("bad");
  }

  function disableOptions(container) {
    Array.from(container.querySelectorAll(".option-btn"))
      .forEach(btn => { btn.disabled = true; });
  }

  // ── Build option buttons ──────────────────────────────────────────────────
  function buildOptions(container, qData, onCorrect) {
    container.innerHTML = "";
    const options = shuffle([qData.correct, ...qData.wrong]);

    options.forEach(text => {
      const btn = document.createElement("button");
      btn.className   = "option-btn";
      btn.type        = "button";
      btn.textContent = text;

      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        disableOptions(container);

        if (text === qData.correct) {
          btn.classList.add("correct");
          setStatus("ok", CONFIG.correct);
          setTimeout(() => {
            setStatus("", "");
            onCorrect();
          }, 900);
        } else {
          btn.classList.add("wrong");
          setStatus("bad", CONFIG.wrong);
          // Re-enable after short delay so student can try again
          setTimeout(() => {
            setStatus("", "");
            Array.from(container.querySelectorAll(".option-btn"))
              .forEach(b => {
                b.disabled = false;
                b.classList.remove("wrong", "correct");
              });
          }, 700);
        }
      });

      container.appendChild(btn);
    });
  }

  // ── Load a round ─────────────────────────────────────────────────────────
  function loadRound(i) {
    idx   = i;
    stage = "q1";
    stopAudio();
    setStatus("", "");

    const round = ROUNDS[idx];
    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;

    // Image
    itemImg.src = IMAGE_BASE + round.image;
    itemImg.alt = round.label;

    // Play button
    playLabel.textContent = CONFIG.play;
    playBtn.disabled = false;

    // Hide q2 until needed
    q2Block.classList.add("hidden");
    q1Block.classList.remove("hidden");

    // Build Q1 options (hidden until audio played)
    q1Title.textContent = round.q1.question;
    buildOptions(q1Options, round.q1, () => {
      if (round.type === "animal") {
        showQ2(round);
      } else {
        advanceOrFinish();
      }
    });

    // Disable Q1 options until play is pressed
    disableOptions(q1Options);
  }

  function showQ2(round) {
    stage = "q2";
    q2Title.textContent = round.q2.question;
    buildOptions(q2Options, round.q2, () => {
      advanceOrFinish();
    });
    q2Block.classList.remove("hidden");
    // Scroll q2 into view on mobile
    q2Block.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function advanceOrFinish() {
    if (idx < TOTAL - 1) {
      loadRound(idx + 1);
    } else {
      finish();
    }
  }

  // ── Play button ───────────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    stopAudio();
    const round = ROUNDS[idx];
    audio = new Audio(AUDIO_BASE + round.audio);

    audio.play().catch(() => {
      // If audio fails, enable options anyway
      enableCurrentQ();
    });

    audio.onended = () => { enableCurrentQ(); };
  });

  function enableCurrentQ() {
    Array.from(q1Options.querySelectorAll(".option-btn"))
      .forEach(b => { b.disabled = false; });
  }

  // ── Finish ────────────────────────────────────────────────────────────────
  function finish() {
    stopAudio();
    exerciseBox.classList.add("hidden");
    roundLabel.classList.add("hidden");
    endTitle.textContent = CONFIG.end.title;
    endMsg1.textContent  = CONFIG.end.msg1;
    endMsg2.textContent  = CONFIG.end.msg2;
    endScreen.classList.remove("hidden");
  }

  // ── Note card ─────────────────────────────────────────────────────────────
  function initNoteCard() {
    noteTitle.textContent = CONFIG.note.title;
    noteBody.innerHTML    = CONFIG.note.body.join(" ");
    dismissBtn.textContent = CONFIG.note.dismiss;

    dismissBtn.addEventListener("click", () => {
      noteCard.classList.add("hidden");
      roundLabel.classList.remove("hidden");
      exerciseBox.classList.remove("hidden");
      loadRound(0);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  initNoteCard();
})();
