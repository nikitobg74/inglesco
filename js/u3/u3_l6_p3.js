(() => {
  "use strict";

  const IMAGE_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l6/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const roundLabel     = document.getElementById("roundLabel");
  const exerciseBox    = document.getElementById("exerciseBox");
  const endScreen      = document.getElementById("endScreen");
  const instrLine      = document.getElementById("instrLine");

  const itemImg        = document.getElementById("itemImg");
  const playBtn        = document.getElementById("playBtn");
  const playLabel      = document.getElementById("playLabel");

  const buildBlock     = document.getElementById("buildBlock");
  const buildTitle     = document.getElementById("buildTitle");
  const sentenceBox    = document.getElementById("sentenceBox");
  const tilesContainer = document.getElementById("tilesContainer");

  const statusLine     = document.getElementById("statusLine");
  const endTitle       = document.getElementById("endTitle");
  const endMsg1        = document.getElementById("endMsg1");
  const endMsg2        = document.getElementById("endMsg2");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:      "Escucha y ordena las palabras para formar la oración.",
    buildTitle: "Ordena las palabras:",
    play:       "Escuchar",
    correct:    "✓",
    wrong:      "✗",
    end: {
      title: "¡Excelente trabajo!",
      msg1:  "Felicitaciones.",
      msg2:  "Terminaste la parte 3."
    }
  };

  // ── Rounds ────────────────────────────────────────────────────────────────
  // answer: correct word order (array of individual words/tokens)
  // distractors: one extra verb + one extra possessive pronoun
  const ROUNDS = [
    {
      image:       "u3.l6.p1.fix.car.jpg",
      audio:       "u3.l6.p3.fix.car.mp3",
      answer:      ["I", "am", "fixing", "my", "car."],
      distractors: ["washing", "her"]
    },
    {
      image:       "u3.l6.p1.woman.fix.car.jpg",
      audio:       "u3.l6.p3.woman.fix.car.mp3",
      answer:      ["She", "is", "fixing", "her", "car."],
      distractors: ["washing", "his"]
    },
    {
      image:       "u3.l6.p1.fix.sink.jpg",
      audio:       "u3.l6.p3.fix.sink.mp3",
      answer:      ["He", "is", "fixing", "his", "sink."],
      distractors: ["cleaning", "her"]
    },
    {
      image:       "u3.l6.p1.woman.clean.apartment.jpg",
      audio:       "u3.l6.p3.woman.clean.apartment.mp3",
      answer:      ["She", "is", "cleaning", "her", "apartment."],
      distractors: ["fixing", "his"]
    },
    {
      image:       "u3.l6.p1.man.clean.window.jpg",
      audio:       "u3.l6.p3.man.clean.window.mp3",
      answer:      ["He", "is", "cleaning", "his", "window."],
      distractors: ["washing", "her"]
    },
    {
      image:       "u3.l6.p1.feed.cat.jpg",
      audio:       "u3.l6.p3.feed.cat.mp3",
      answer:      ["I", "am", "feeding", "my", "cat."],
      distractors: ["washing", "her"]
    },
    {
      image:       "u3.l6.p1.doing.homework.jpg",
      audio:       "u3.l6.p3.doing.homework.mp3",
      answer:      ["They", "are", "doing", "their", "homework."],
      distractors: ["fixing", "our"]
    },
    {
      image:       "u3.l6.p1.woman.washing.clothes.jpg",
      audio:       "u3.l6.p3.woman.washing.clothes.mp3",
      answer:      ["She", "is", "washing", "her", "clothes."],
      distractors: ["cleaning", "his"]
    },
    {
      image:       "u3.l6.p1.painting.jpg",
      audio:       "u3.l6.p3.painting.mp3",
      answer:      ["We", "are", "painting", "our", "bedroom."],
      distractors: ["cleaning", "their"]
    },
    {
      image:       "u3.l6.p1.girl.brushing.teeth.jpg",
      audio:       "u3.l6.p3.girl.brushing.teeth.mp3",
      answer:      ["I", "am", "brushing", "my", "teeth."],
      distractors: ["washing", "her"]
    },
    {
      image:       "u3.l6.p1.man.read.email.jpg",
      audio:       "u3.l6.p3.man.read.email.mp3",
      answer:      ["He", "is", "reading", "his", "emails."],
      distractors: ["washing", "her"]
    }
  ];

  // ── Shuffle ───────────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const SHUFFLED_ROUNDS = shuffle(ROUNDS);
  const TOTAL           = SHUFFLED_ROUNDS.length;
  let idx               = 0;
  let audio             = null;
  let isLocked          = false;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
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

  function getWords(box) {
    return Array.from(box.children).map(el => el.dataset.word);
  }

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  function paintCorrect(box) {
    Array.from(box.children).forEach(el => el.classList.add("correct"));
  }

  function addChip(box, word, displayText) {
    const chip = document.createElement("span");
    chip.className        = "word-chip";
    chip.dataset.word     = word;
    chip.textContent      = displayText;
    box.appendChild(chip);
  }

  function disableTiles() {
    Array.from(tilesContainer.querySelectorAll(".tile"))
      .forEach(b => { b.disabled = true; });
  }

  function enableTiles() {
    Array.from(tilesContainer.querySelectorAll(".tile"))
      .forEach(b => { b.disabled = false; b.classList.remove("wrong", "correct", "used"); });
  }

  // ── Build tiles: answer words + distractors, all shuffled ────────────────
  function buildTiles(round) {
    clear(tilesContainer);
    clear(sentenceBox);
    isLocked = false;

    const answerSet   = new Set(round.answer);
    const allWords    = shuffle([...round.answer, ...round.distractors]);

    allWords.forEach(word => {
      const btn = document.createElement("button");
      btn.className   = "tile";
      btn.type        = "button";
      btn.textContent = word;
      btn.dataset.word = word;

      btn.addEventListener("click", () => {
        if (isLocked || btn.disabled) return;

        // Distractor tapped
        if (!answerSet.has(word)) {
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

        // Correct word tapped — add to sentence, hide tile
        addChip(sentenceBox, word, word);
        btn.disabled = true;
        btn.classList.add("used");

        const current = getWords(sentenceBox);

        // Not yet enough words placed
        if (current.length < round.answer.length) return;

        // All answer words placed — check order
        if (arraysEqual(current, round.answer)) {
          isLocked = true;
          paintCorrect(sentenceBox);
          setStatus("ok", CONFIG.correct);
          disableTiles();
          setTimeout(() => {
            setStatus("", "");
            isLocked = false;
            advanceOrFinish();
          }, 1000);
        } else {
          // Wrong order — reset
          isLocked = true;
          setStatus("bad", CONFIG.wrong);
          disableTiles();
          setTimeout(() => {
            clear(sentenceBox);
            enableTiles();
            setStatus("", "");
            isLocked = false;
          }, 700);
        }
      });

      tilesContainer.appendChild(btn);
    });
  }

  // ── Load round ────────────────────────────────────────────────────────────
  function loadRound(i) {
    idx = i;
    stopAudio();
    setStatus("", "");
    isLocked = false;

    const round = SHUFFLED_ROUNDS[idx];
    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;
    itemImg.src            = IMAGE_BASE + round.image;
    itemImg.alt            = "";
    playLabel.textContent  = CONFIG.play;

    buildBlock.classList.add("hidden");
    clear(sentenceBox);
    clear(tilesContainer);
  }

  // ── Play button ───────────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    stopAudio();
    const round = SHUFFLED_ROUNDS[idx];
    audio = new Audio(AUDIO_BASE + round.audio);

    const showBuild = () => {
      if (buildBlock.classList.contains("hidden")) {
        buildTitle.textContent = CONFIG.buildTitle;
        buildTiles(round);
        buildBlock.classList.remove("hidden");
        buildBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    };

    audio.onended = showBuild;
    audio.play().catch(showBuild);
  });

  function advanceOrFinish() {
    if (idx < TOTAL - 1) {
      loadRound(idx + 1);
    } else {
      finish();
    }
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

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  loadRound(0);
})();
