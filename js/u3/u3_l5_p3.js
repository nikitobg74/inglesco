(() => {
  "use strict";

  const IMAGE_BASE = "../../../../assets/images/u3/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const roundLabel  = document.getElementById("roundLabel");
  const exerciseBox = document.getElementById("exerciseBox");
  const endScreen   = document.getElementById("endScreen");
  const instrLine   = document.getElementById("instrLine");

  const itemImg     = document.getElementById("itemImg");

  const s1Block     = document.getElementById("s1Block");
  const s1Title     = document.getElementById("s1Title");
  const s1Box       = document.getElementById("s1Box");
  const s1Tiles     = document.getElementById("s1Tiles");

  const s2Block     = document.getElementById("s2Block");
  const s2Title     = document.getElementById("s2Title");
  const s2Box       = document.getElementById("s2Box");
  const s2Tiles     = document.getElementById("s2Tiles");

  const statusLine  = document.getElementById("statusLine");

  const endTitle    = document.getElementById("endTitle");
  const endMsg1     = document.getElementById("endMsg1");
  const endMsg2     = document.getElementById("endMsg2");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:   "Elige las fichas correctas y construye las oraciones.",
    s1Title: "¿Dónde está?",
    s2Title: "¿Qué está haciendo?",
    correct: "✓",
    wrong:   "✗",
    end: {
      title: "¡Buen trabajo!",
      msg1:  "Felicitaciones.",
      msg2:  "Terminaste la parte 3."
    }
  };

  // ── Rounds ────────────────────────────────────────────────────────────────
  // s1.correct: two chunks that build the location sentence [pronoun+verb, place]
  // s1.wrong:   four distractor chunks
  // s2.correct: two chunks that build the activity sentence [pronoun+verb, activity]
  // s2.wrong:   four distractor chunks
  const ROUNDS = [
    {
      image: "u3.l5.p2.woman.park.jpg",
      s1: {
        correct: ["She is", "in the park."],
        wrong:   ["He is", "They are", "in the kitchen.", "in the yard."]
      },
      s2: {
        correct: ["She is", "eating lunch."],
        wrong:   ["He is", "sleeping.", "drinking coffee.", "watching TV."]
      }
    },
    {
      image: "u3.l5.p2.man.bathroom.jpg",
      s1: {
        correct: ["He is", "in the bathroom."],
        wrong:   ["She is", "They are", "in the bedroom.", "in the yard."]
      },
      s2: {
        correct: ["He is", "singing."],
        wrong:   ["She is", "sleeping.", "watching TV.", "drinking coffee."]
      }
    },
    {
      image: "u3.l5.p2.woman.hospital.jpg",
      s1: {
        correct: ["She is", "in the hospital."],
        wrong:   ["He is", "They are", "in the bedroom.", "in the park."]
      },
      s2: {
        correct: ["She is", "watching TV."],
        wrong:   ["He is", "sleeping.", "eating lunch.", "singing."]
      }
    },
    {
      image: "u3.l5.p2.man.park.jpg",
      s1: {
        correct: ["He is", "in the park."],
        wrong:   ["She is", "We are", "in the yard.", "in the library."]
      },
      s2: {
        correct: ["He is", "listening to music."],
        wrong:   ["She is", "singing.", "watching TV.", "playing cards."]
      }
    },
    {
      image: "u3.l5.p2.baseball.jpg",
      s1: {
        correct: ["They are", "in the backyard."],
        wrong:   ["He is", "She is", "in the park.", "in the yard."]
      },
      s2: {
        correct: ["They are", "playing baseball."],
        wrong:   ["He is", "eating dinner.", "playing cards.", "singing."]
      }
    },
    {
      image: "u3.l5.p2.man.teacher.jpg",
      s1: {
        correct: ["He is", "in the classroom."],
        wrong:   ["She is", "They are", "in the library.", "in the park."]
      },
      s2: {
        correct: ["He is", "teaching mathematics."],
        wrong:   ["She is", "studying English.", "singing.", "eating lunch."]
      }
    },
    {
      image: "u3.l5.p2.couple.jpg",
      s1: {
        correct: ["We are", "in the dining room."],
        wrong:   ["They are", "She is", "in the kitchen.", "in the living room."]
      },
      s2: {
        correct: ["We are", "eating dinner."],
        wrong:   ["They are", "eating lunch.", "drinking coffee.", "watching TV."]
      }
    },
    {
      image: "u3.l5.p2.cards.jpg",
      s1: {
        correct: ["We are", "in the living room."],
        wrong:   ["They are", "He is", "in the dining room.", "in the bedroom."]
      },
      s2: {
        correct: ["We are", "playing cards."],
        wrong:   ["They are", "playing baseball.", "eating dinner.", "singing."]
      }
    },
    {
      image: "u3.l5.p2.library.jpg",
      s1: {
        correct: ["We are", "in the library."],
        wrong:   ["They are", "She is", "in the classroom.", "in the park."]
      },
      s2: {
        correct: ["We are", "studying English."],
        wrong:   ["They are", "teaching mathematics.", "playing cards.", "singing."]
      }
    },
    {
      image: "u3.l5.p2.dog.park.jpg",
      s1: {
        correct: ["It is", "in the park."],
        wrong:   ["He is", "She is", "in the yard.", "in the backyard."]
      },
      s2: {
        correct: ["It is", "playing ball."],
        wrong:   ["He is", "eating fish.", "sleeping.", "watching TV."]
      }
    },
    {
      image: "u3.l5.p2.cat.fish.jpg",
      s1: {
        correct: ["It is", "in the yard."],
        wrong:   ["He is", "She is", "in the park.", "in the kitchen."]
      },
      s2: {
        correct: ["It is", "eating fish."],
        wrong:   ["He is", "playing ball.", "sleeping.", "drinking coffee."]
      }
    },
    {
      image: "u3.l5.p2.man.guitar.jpg",
      s1: {
        correct: ["He is", "in the bedroom."],
        wrong:   ["She is", "They are", "in the bathroom.", "in the living room."]
      },
      s2: {
        correct: ["He is", "playing the guitar."],
        wrong:   ["She is", "playing cards.", "singing.", "watching TV."]
      }
    },
    {
      image: "u3.l5.p2.woman.coffee.jpg",
      s1: {
        correct: ["She is", "in the cafeteria."],
        wrong:   ["He is", "We are", "in the kitchen.", "in the dining room."]
      },
      s2: {
        correct: ["She is", "drinking coffee."],
        wrong:   ["He is", "eating lunch.", "watching TV.", "playing cards."]
      }
    }
  ];

  const TOTAL  = ROUNDS.length;
  let idx      = 0;
  let isLocked = false;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function setStatus(type, text) {
    statusLine.textContent = text;
    statusLine.classList.remove("ok", "bad");
    if (type === "ok")  statusLine.classList.add("ok");
    if (type === "bad") statusLine.classList.add("bad");
  }

  function getChunks(box) {
    return Array.from(box.children).map(el => el.textContent);
  }

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function paintCorrect(box) {
    Array.from(box.children).forEach(el => el.classList.add("correct"));
  }

  function addChip(box, text) {
    const chip = document.createElement("span");
    chip.className   = "word-chip";
    chip.textContent = text;
    box.appendChild(chip);
  }

  function getTiles(container) {
    return Array.from(container.querySelectorAll(".tile"));
  }

  function disableTiles(container) {
    getTiles(container).forEach(btn => { btn.disabled = true; });
  }

  function enableTiles(container) {
    getTiles(container).forEach(btn => {
      btn.disabled = false;
      btn.classList.remove("wrong", "correct");
    });
  }

  function resetStage(container, box) {
    clear(box);
    enableTiles(container);
    setStatus("", "");
    isLocked = false;
  }

  // ── Chunk tile builder ────────────────────────────────────────────────────
  // correct: array of 2 chunks in order
  // wrong:   array of 4 distractor chunks
  function buildChunkTiles(container, box, correct, wrong, onCorrect) {
    clear(container);
    clear(box);

    const allChunks = shuffle([...correct, ...wrong]);

    allChunks.forEach(chunk => {
      const btn = document.createElement("button");
      btn.className   = "tile";
      btn.type        = "button";
      btn.textContent = chunk;

      btn.addEventListener("click", () => {
        if (isLocked || btn.disabled) return;

        // Wrong distractor tapped
        if (!correct.includes(chunk)) {
          btn.classList.add("wrong");
          isLocked = true;
          setStatus("bad", CONFIG.wrong);
          setTimeout(() => {
            btn.classList.remove("wrong");
            isLocked = false;
            setStatus("", "");
          }, 600);
          return;
        }

        // Correct chunk tapped
        addChip(box, chunk);
        btn.disabled = true;

        const current = getChunks(box);
        if (current.length < correct.length) return;

        if (arraysEqual(current, correct)) {
          isLocked = true;
          paintCorrect(box);
          setStatus("ok", CONFIG.correct);
          disableTiles(container);
          setTimeout(() => {
            setStatus("", "");
            isLocked = false;
            onCorrect();
          }, 1000);
        } else {
          // Correct chunks but wrong order
          isLocked = true;
          setStatus("bad", CONFIG.wrong);
          disableTiles(container);
          setTimeout(() => {
            resetStage(container, box);
          }, 700);
        }
      });

      container.appendChild(btn);
    });
  }

  // ── Load round ────────────────────────────────────────────────────────────
  function loadRound(i) {
    idx      = i;
    isLocked = false;
    setStatus("", "");

    const round = ROUNDS[idx];
    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;

    itemImg.src = IMAGE_BASE + round.image;
    itemImg.alt = "";

    s1Title.textContent = CONFIG.s1Title;
    s2Title.textContent = CONFIG.s2Title;

    s2Block.classList.add("hidden");
    s1Block.classList.remove("hidden");

    buildChunkTiles(s1Tiles, s1Box, round.s1.correct, round.s1.wrong, () => {
      s2Block.classList.remove("hidden");
      s2Block.scrollIntoView({ behavior: "smooth", block: "nearest" });
      buildChunkTiles(s2Tiles, s2Box, round.s2.correct, round.s2.wrong, () => {
        advanceOrFinish();
      });
    });
  }

  function advanceOrFinish() {
    if (idx < TOTAL - 1) {
      loadRound(idx + 1);
    } else {
      finish();
    }
  }

  // ── Finish ────────────────────────────────────────────────────────────────
  function finish() {
    exerciseBox.classList.add("hidden");
    endTitle.textContent = CONFIG.end.title;
    endMsg1.textContent  = CONFIG.end.msg1;
    endMsg2.textContent  = CONFIG.end.msg2;
    endScreen.classList.remove("hidden");
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  loadRound(0);
})();
