const AUDIO_BASE = "../../../../assets/audio/u4/l1/";

// tokens: correct tiles in order
// distractors: { subject: wrong subject+aux tile, verb: wrong verb tile }
const SENTENCES = [
  {
    tokens: ["He is", "washing", "his", "hair."],
    distractors: { subject: "She is", verb: "painting" },
    audio: "u4.l1.p2.washing.mp3"
  },
  {
    tokens: ["We are", "doing", "our", "exercises."],
    distractors: { subject: "They are", verb: "cleaning" },
    audio: "u4.l1.p2.exercise.mp3"
  },
  {
    tokens: ["They are", "cleaning", "their", "yard."],
    distractors: { subject: "We are", verb: "doing" },
    audio: "u4.l1.p2.clean.mp3"
  },
  {
    tokens: ["She is", "painting", "her", "living room."],
    distractors: { subject: "He is", verb: "washing" },
    audio: "u4.l1.p2.painting.mp3"
  },
  {
    tokens: ["He is", "fixing", "the", "sink."],
    distractors: { subject: "She is", verb: "cooking" },
    audio: "u4.l1.p2.fixing.mp3"
  },
  {
    tokens: ["She is", "cooking", "dinner."],
    distractors: { subject: "He is", verb: "fixing" },
    audio: "u4.l1.p2.cooking.mp3"
  },
  {
    tokens: ["I am", "feeding", "my", "cat."],
    distractors: { subject: "We are", verb: "reading" },
    audio: "u4.l1.p2.feed.mp3"
  },
  {
    tokens: ["He is", "reading", "his", "email."],
    distractors: { subject: "She is", verb: "feeding" },
    audio: "u4.l1.p2.read.mp3"
  }
];

(() => {
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const order = shuffle(SENTENCES.map((_, i) => i));

  let currentIndex = 0;
  let currentAudio = null;
  let selectedTile  = null;
  let filledSlots   = [];
  let correctCount  = 0;

  const playBtn    = document.getElementById("playBtn");
  const playLabel  = document.getElementById("playLabel");
  const buildArea  = document.getElementById("buildArea");
  const tileBank   = document.getElementById("tileBank");
  const endScreen  = document.getElementById("endScreen");
  const currentNum = document.getElementById("currentNum");

  // ── Audio ──────────────────────────────────────────────────────────────
  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    playBtn.classList.remove("playing");
    playBtn.textContent = "▶";
    playLabel.textContent = "Toca para escuchar";
  }

  function playAudio(audioFile, onEnd) {
    stopAudio();
    const audio = new Audio(AUDIO_BASE + audioFile);
    currentAudio = audio;
    playBtn.classList.add("playing");
    playBtn.textContent = "■";
    playLabel.textContent = "Escuchando...";

    audio.play().catch(err => console.error("Audio error:", err));

    audio.addEventListener("ended", () => {
      if (currentAudio === audio) {
        stopAudio();
        if (onEnd) onEnd();
      }
    });
    audio.addEventListener("error", () => {
      if (currentAudio === audio) stopAudio();
    });
  }

  playBtn.addEventListener("click", () => {
    const sentence = SENTENCES[order[currentIndex]];
    playAudio(sentence.audio);
  });

  // ── Build a sentence ───────────────────────────────────────────────────
  function buildSentence(sentenceIdx) {
    const sentence = SENTENCES[sentenceIdx];
    const tokens   = sentence.tokens;
    // tokens[0] = "He is" / "She is" / "We are" etc  (subject+aux merged)
    // tokens[1] = verb
    // tokens[2..] = tail
    const distSubject = sentence.distractors.subject;
    const distVerb    = sentence.distractors.verb;

    stopAudio();
    selectedTile = null;
    filledSlots  = new Array(tokens.length).fill(null);
    correctCount = 0;

    currentNum.textContent = currentIndex + 1;
    buildArea.classList.remove("all-correct");
    buildArea.innerHTML = "";
    tileBank.innerHTML  = "";

    // ── Slots ──
    tokens.forEach((token, i) => {
      const slot = document.createElement("div");
      slot.className = "slot empty";
      slot.dataset.index = i;
      slot.dataset.token = token;
      // token text sizes the slot but stays invisible via CSS color:transparent
      slot.textContent = token;
      slot.addEventListener("click", () => handleSlotClick(slot, i, tokens));
      buildArea.appendChild(slot);
    });

    // ── Tiles ──
    // Order: [subject pair shuffled] [verb pair shuffled] [tail in order]
    const subjectPair = shuffle([tokens[0], distSubject]);
    const verbPair    = shuffle([tokens[1], distVerb]);
    const tail        = tokens.slice(2);

    const tileList = [
      ...subjectPair.map(w => ({ word: w, type: "subject" })),
      ...verbPair.map(w    => ({ word: w, type: "verb" })),
      ...tail.map(w        => ({ word: w, type: "tail" }))
    ];

    tileList.forEach(({ word, type }) => {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.textContent = word;
      tile.dataset.word = word;
      tile.dataset.type = type;
      tile.addEventListener("click", () => handleTileClick(tile));
      tileBank.appendChild(tile);
    });
  }

  // ── Tile interaction ───────────────────────────────────────────────────
  function handleTileClick(tile) {
    if (tile.classList.contains("used")) return;

    if (selectedTile === tile) {
      tile.classList.remove("selected");
      selectedTile = null;
      return;
    }

    if (selectedTile) selectedTile.classList.remove("selected");
    selectedTile = tile;
    tile.classList.add("selected");
  }

  function handleSlotClick(slot, slotIndex, tokens) {
    if (slot.classList.contains("correct")) return;

    // Tap a filled (wrong) slot to return the tile
    if (slot.classList.contains("filled")) {
      returnTileFromSlot(slot, slotIndex);
      return;
    }

    if (!selectedTile) {
      slot.style.borderColor = "#f59e0b";
      setTimeout(() => { slot.style.borderColor = ""; }, 500);
      return;
    }

    placeTile(slot, slotIndex, tokens);
  }

  function returnTileFromSlot(slot, slotIndex) {
    const tile = filledSlots[slotIndex];
    if (tile) {
      tile.classList.remove("used", "selected");
      filledSlots[slotIndex] = null;
    }
    resetSlot(slot);
  }

  function resetSlot(slot) {
    slot.textContent = slot.dataset.token; // restores sizing text, color:transparent hides it
    slot.classList.remove("filled", "wrong");
    slot.classList.add("empty");
    slot.style.borderColor = "";
  }

  function placeTile(slot, slotIndex, tokens) {
    const chosenWord = selectedTile.dataset.word;
    const correct    = tokens[slotIndex];

    slot.textContent = chosenWord;

    if (chosenWord === correct) {
      slot.classList.remove("empty", "filled", "wrong");
      slot.classList.add("correct");

      selectedTile.classList.add("used");
      filledSlots[slotIndex] = selectedTile;
      selectedTile = null;

      correctCount++;
      if (correctCount === tokens.length) onSentenceComplete();

    } else {
      slot.classList.remove("empty");
      slot.classList.add("filled", "wrong");

      const tileToReturn = selectedTile;
      tileToReturn.classList.remove("selected");
      selectedTile = null;

      setTimeout(() => resetSlot(slot), 650);
    }
  }

  // ── Sentence complete ──────────────────────────────────────────────────
  function onSentenceComplete() {
    buildArea.classList.add("all-correct");

    const sentence = SENTENCES[order[currentIndex]];
    setTimeout(() => playAudio(sentence.audio, advance), 300);
  }

  function advance() {
    currentIndex++;
    if (currentIndex >= SENTENCES.length) {
      showEnd();
    } else {
      buildSentence(order[currentIndex]);
    }
  }

  function showEnd() {
    stopAudio();
    buildArea.style.display  = "none";
    tileBank.style.display   = "none";
    document.querySelector(".audio-area").style.display  = "none";
    document.querySelector(".counter").style.display     = "none";
    endScreen.classList.add("show");
  }

  // ── Start ──────────────────────────────────────────────────────────────
  buildSentence(order[currentIndex]);

})();
