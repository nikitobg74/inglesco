(() => {
  "use strict";

  const IMAGE_BASE = "../../../../assets/images/u3/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const roundLabel  = document.getElementById("roundLabel");
  const exerciseBox = document.getElementById("exerciseBox");
  const endScreen   = document.getElementById("endScreen");
  const instrLine   = document.getElementById("instrLine");

  const itemImg     = document.getElementById("itemImg");
  const promptWho   = document.getElementById("promptWho");
  const promptWhere = document.getElementById("promptWhere");
  const promptDoing = document.getElementById("promptDoing");

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

  // ── Config (all UI strings — language-neutral logic) ──────────────────────
  const CONFIG = {
    instr:   "Construye las oraciones con las palabras correctas.",
    s1Title: "Construye la oración 1:",
    s2Title: "Construye la oración 2:",
    correct: "✓",
    wrong:   "✗",
    end: {
      title: "¡Buen trabajo!",
      msg1:  "Felicitaciones.",
      msg2:  "Terminaste la parte 2."
    }
  };

  // ── Rounds ────────────────────────────────────────────────────────────────
  // s1: location sentence words (in order)
  // s2: pronoun+doing sentence words (in order)
  // prompt: what shows on the card (who / where / doing) — display only
  const ROUNDS = [
    {
      image:       "u3.l5.p2.woman.park.jpg",
      prompt:      { who: "Sofia", where: "park", doing: "eating lunch" },
      s1:          ["Sofia", "is", "in", "the", "park."],
      s2:          ["She", "is", "eating", "lunch."]
    },
    {
      image:       "u3.l5.p2.couple.jpg",
      prompt:      { who: "you", where: "dining room", doing: "eating dinner" },
      s1:          ["We", "are", "in", "the", "dining", "room."],
      s2:          ["We", "are", "eating", "dinner."]
    },
    {
      image:       "u3.l5.p2.man.guitar.jpg",
      prompt:      { who: "David", where: "bedroom", doing: "playing the guitar" },
      s1:          ["David", "is", "in", "the", "bedroom."],
      s2:          ["He", "is", "playing", "the", "guitar."]
    },
    {
      image:       "u3.l5.p2.cards.jpg",
      prompt:      { who: "you", where: "living room", doing: "playing cards" },
      s1:          ["We", "are", "in", "the", "living", "room."],
      s2:          ["We", "are", "playing", "cards."]
    },
    {
      image:       "u3.l5.p2.baseball.jpg",
      prompt:      { who: "Tom and Lisa", where: "backyard", doing: "playing baseball" },
      s1:          ["Tom", "and", "Lisa", "are", "in", "the", "backyard."],
      s2:          ["They", "are", "playing", "baseball."]
    },
    {
      image:       "u3.l5.p2.woman.coffee.jpg",
      prompt:      { who: "Miss Rivera", where: "cafeteria", doing: "drinking coffee" },
      s1:          ["Miss", "Rivera", "is", "in", "the", "cafeteria."],
      s2:          ["She", "is", "drinking", "coffee."]
    },
    {
      image:       "u3.l5.p2.library.jpg",
      prompt:      { who: "you", where: "library", doing: "studying English" },
      s1:          ["We", "are", "in", "the", "library."],
      s2:          ["We", "are", "studying", "English."]
    },
    {
      image:       "u3.l5.p2.man.teacher.jpg",
      prompt:      { who: "Mr. Patel", where: "classroom", doing: "teaching mathematics" },
      s1:          ["Mr.", "Patel", "is", "in", "the", "classroom."],
      s2:          ["He", "is", "teaching", "mathematics."]
    },
    {
      image:       "u3.l5.p2.man.bathroom.jpg",
      prompt:      { who: "Marco", where: "bathroom", doing: "singing" },
      s1:          ["Marco", "is", "in", "the", "bathroom."],
      s2:          ["He", "is", "singing."]
    },
    {
      image:       "u3.l5.p2.woman.hospital.jpg",
      prompt:      { who: "Emma", where: "hospital", doing: "watching TV" },
      s1:          ["Emma", "is", "in", "the", "hospital."],
      s2:          ["She", "is", "watching", "TV."]
    },
    {
      image:       "u3.l5.p2.man.park.jpg",
      prompt:      { who: "Brian", where: "park", doing: "listening to music" },
      s1:          ["Brian", "is", "in", "the", "park."],
      s2:          ["He", "is", "listening", "to", "music."]
    },
    {
      image:       "u3.l5.p2.dog.park.jpg",
      prompt:      { who: "The dog", where: "park", doing: "playing ball" },
      s1:          ["The", "dog", "is", "in", "the", "park."],
      s2:          ["It", "is", "playing", "ball."]
    },
    {
      image:       "u3.l5.p2.cat.fish.jpg",
      prompt:      { who: "The cat", where: "yard", doing: "eating fish" },
      s1:          ["The", "cat", "is", "in", "the", "yard."],
      s2:          ["It", "is", "eating", "fish."]
    }
  ];

  const TOTAL    = ROUNDS.length;
  let idx        = 0;
  let isLocked   = false;

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

  function getWords(box) {
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

  function addWord(box, word) {
    const chip = document.createElement("span");
    chip.className   = "word-chip";
    chip.textContent = word;
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

  // ── Tile builder ──────────────────────────────────────────────────────────
  function buildTiles(container, box, words, onCorrect) {
    clear(container);
    clear(box);

    const shuffled = shuffle(words);

    shuffled.forEach(word => {
      const btn = document.createElement("button");
      btn.className   = "tile";
      btn.type        = "button";
      btn.textContent = word;

      btn.addEventListener("click", () => {
        if (isLocked || btn.disabled) return;

        addWord(box, word);
        btn.disabled = true;

        const current = getWords(box);
        if (current.length < words.length) return;

        if (arraysEqual(current, words)) {
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

    // Prompt card
    itemImg.src          = IMAGE_BASE + round.image;
    itemImg.alt          = round.prompt.who;
    promptWho.textContent    = round.prompt.who;
    promptWhere.textContent  = "📍 " + round.prompt.where;
    promptDoing.textContent  = "▶ " + round.prompt.doing;

    // Titles
    s1Title.textContent = CONFIG.s1Title;
    s2Title.textContent = CONFIG.s2Title;

    // Hide s2 until s1 complete
    s2Block.classList.add("hidden");
    s1Block.classList.remove("hidden");

    // Build stage 1
    buildTiles(s1Tiles, s1Box, round.s1, () => {
      s2Block.classList.remove("hidden");
      s2Block.scrollIntoView({ behavior: "smooth", block: "nearest" });
      buildTiles(s2Tiles, s2Box, round.s2, () => {
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
