(() => {
  "use strict";

  const AUDIO_BASE = "../../../../assets/audio/u3/l5/";
  const IMAGE_BASE = "../../../../assets/images/u3/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const noteCard      = document.getElementById("noteCard");
  const noteTitle     = document.getElementById("noteTitle");
  const noteSubtitle  = document.getElementById("noteSubtitle");
  const thOrig        = document.getElementById("thOrig");
  const thIt          = document.getElementById("thIt");
  const noteTableBody = document.getElementById("noteTableBody");
  const noteFooter    = document.getElementById("noteFooter");
  const dismissBtn    = document.getElementById("dismissBtn");

  const roundLabel    = document.getElementById("roundLabel");
  const exerciseBox   = document.getElementById("exerciseBox");
  const endScreen     = document.getElementById("endScreen");

  const itemImg       = document.getElementById("itemImg");
  const playBtn       = document.getElementById("playBtn");
  const playLabel     = document.getElementById("playLabel");

  const q1Block       = document.getElementById("q1Block");
  const q1Title       = document.getElementById("q1Title");
  const q1Options     = document.getElementById("q1Options");

  const q2Block       = document.getElementById("q2Block");
  const q2Title       = document.getElementById("q2Title");
  const q2Options     = document.getElementById("q2Options");

  const statusLine    = document.getElementById("statusLine");

  const endTitle      = document.getElementById("endTitle");
  const endMsg1       = document.getElementById("endMsg1");
  const endMsg2       = document.getElementById("endMsg2");

  // ── Config (all UI strings here — language-neutral logic) ─────────────────
  const CONFIG = {
    note: {
      title:    "Usamos \"it\" para animales y objetos.",
      subtitle: "En inglés, cuando hablamos de un animal o un objeto, usamos \"it\" en lugar de repetir su nombre.",
      colOrig:  "Con nombre",
      colIt:    "Con \"it\"",
      rows: [
        {
          orig:   "The dog is in the garage.",
          origEs: "El perro está en el garaje.",
          it:     ["It", " is in the garage."],
          itEs:   "Está en el garaje."
        },
        {
          orig:   "The cat is in the kitchen.",
          origEs: "El gato está en la cocina.",
          it:     ["It", " is in the kitchen."],
          itEs:   "Está en la cocina."
        },
        {
          orig:   "The globe is on the desk.",
          origEs: "El globo está en el escritorio.",
          it:     ["It", " is on the desk."],
          itEs:   "Está en el escritorio."
        }
      ],
      footer:  "💡 \"It\" reemplaza el nombre del animal u objeto para no repetirlo.",
      dismiss: "¡Entendido, vamos!"
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

  // ── Rounds ────────────────────────────────────────────────────────────────
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
  let idx   = 0;
  let audio = null;

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

  function enableOptions(container) {
    Array.from(container.querySelectorAll(".option-btn"))
      .forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("wrong", "correct");
      });
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
          setTimeout(() => {
            setStatus("", "");
            enableOptions(container);
          }, 700);
        }
      });

      container.appendChild(btn);
    });
  }

  // ── Load a round ──────────────────────────────────────────────────────────
  function loadRound(i) {
    idx = i;
    stopAudio();
    setStatus("", "");

    const round = ROUNDS[idx];
    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;

    itemImg.src = IMAGE_BASE + round.image;
    itemImg.alt = round.label;

    playLabel.textContent = CONFIG.play;
    playBtn.disabled = false;

    // Reset blocks
    q2Block.classList.add("hidden");
    q1Block.classList.remove("hidden");

    q1Title.textContent = round.q1.question;
    buildOptions(q1Options, round.q1, () => {
      if (round.type === "animal") {
        showQ2(round);
      } else {
        advanceOrFinish();
      }
    });

    // Options locked until audio plays
    disableOptions(q1Options);
  }

  function showQ2(round) {
    q2Title.textContent = round.q2.question;
    buildOptions(q2Options, round.q2, () => {
      advanceOrFinish();
    });
    q2Block.classList.remove("hidden");
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
    audio = new Audio(AUDIO_BASE + ROUNDS[idx].audio);
    audio.onended = () => { enableOptions(q1Options); };
    audio.play().catch(() => { enableOptions(q1Options); });
  });

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
    noteTitle.textContent    = CONFIG.note.title;
    noteSubtitle.textContent = CONFIG.note.subtitle;
    thOrig.textContent       = CONFIG.note.colOrig;
    thIt.textContent         = CONFIG.note.colIt;
    noteFooter.textContent   = CONFIG.note.footer;
    dismissBtn.textContent   = CONFIG.note.dismiss;

    CONFIG.note.rows.forEach(row => {
      const tr = document.createElement("tr");

      // Original column
      const tdOrig = document.createElement("td");
      tdOrig.className = "col-orig";
      tdOrig.innerHTML = row.orig + `<span class="es">${row.origEs}</span>`;

      // Arrow column
      const tdArrow = document.createElement("td");
      tdArrow.className = "arrow";
      tdArrow.textContent = "→";

      // "It" column
      const tdIt = document.createElement("td");
      tdIt.className = "col-it";
      tdIt.innerHTML = `<b>${row.it[0]}</b>${row.it[1]}<span class="es">${row.itEs}</span>`;

      tr.appendChild(tdOrig);
      tr.appendChild(tdArrow);
      tr.appendChild(tdIt);
      noteTableBody.appendChild(tr);
    });

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
