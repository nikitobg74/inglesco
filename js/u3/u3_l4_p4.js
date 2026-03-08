(() => {
  "use strict";

  const AUDIO_BASE = "../../../../assets/audio/u3/l4/";

  const roundLabel = document.getElementById("roundLabel");
  const exerciseBox = document.getElementById("exerciseBox");
  const endScreen = document.getElementById("endScreen");

  const questionBox = document.getElementById("questionBox");
  const questionTiles = document.getElementById("questionTiles");

  const answerBlock = document.getElementById("answerBlock");
  const answerBox = document.getElementById("answerBox");
  const answerTiles = document.getElementById("answerTiles");

  const statusLine = document.getElementById("statusLine");

  const ROUNDS = [
    { q: ["Where", "are", "you"], a: ["I", "am", "in", "the", "garage"], audio: "u3.l4.p4.garage.mp3" },
    { q: ["What", "is", "he", "doing"], a: ["He", "is", "cooking", "dinner"], audio: "u3.l4.p4.cooking.mp3" },
    { q: ["Where", "are", "they"], a: ["They", "are", "in", "the", "park"], audio: "u3.l4.p4.park.mp3" },
    { q: ["What", "are", "you", "doing"], a: ["We", "are", "playing", "with", "the", "dog"], audio: "u3.l4.p4.dog.mp3" },
    { q: ["Where", "is", "he"], a: ["He", "is", "in", "the", "attic"], audio: "u3.l4.p4.attic.mp3" },
    { q: ["What", "is", "she", "doing"], a: ["She", "is", "listening", "to", "the", "radio"], audio: "u3.l4.p4.radio.mp3" },
    { q: ["Where", "is", "she"], a: ["She", "is", "in", "the", "yard"], audio: "u3.l4.p4.yard.mp3" },
    { q: ["Where", "are", "you"], a: ["We", "are", "at", "the", "beach"], audio: "u3.l4.p4.beach.mp3" },
    { q: ["What", "is", "he", "doing"], a: ["He", "is", "sleeping"], audio: "u3.l4.p4.sleeping.mp3" },
    { q: ["What", "are", "they", "doing"], a: ["They", "are", "eating", "dinner"], audio: "u3.l4.p4.dinner.mp3" },
    { q: ["Where", "are", "you"], a: ["I", "am", "at", "the", "hospital"], audio: "u3.l4.p4.hospital.mp3" }
  ];

  const TOTAL = ROUNDS.length;

  let idx = 0;
  let audio = null;
  let isLocked = false;

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

  function setStatus(type, text = "") {
    statusLine.textContent = text;
    statusLine.classList.remove("ok", "bad");
    if (type === "ok") statusLine.classList.add("ok");
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
    chip.className = "word-chip";
    chip.textContent = word;
    box.appendChild(chip);
  }

  function stopAudio() {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {}
  }

  function playAudioAndContinue(round) {
    stopAudio();
    audio = new Audio(AUDIO_BASE + round.audio);

    audio.onended = () => {
      if (idx < TOTAL - 1) {
        loadRound(idx + 1);
      } else {
        finish();
      }
    };

    audio.play().catch(() => {
      if (idx < TOTAL - 1) {
        loadRound(idx + 1);
      } else {
        finish();
      }
    });
  }

  function getTileButtons(container) {
    return Array.from(container.querySelectorAll(".tile"));
  }

  function disableTiles(container) {
    getTileButtons(container).forEach(btn => {
      btn.disabled = true;
    });
  }

  function enableTiles(container) {
    getTileButtons(container).forEach(btn => {
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

  function checkAuto(box, container, targetWords, onCorrect) {
    const currentWords = getWords(box);

    if (currentWords.length < targetWords.length) return;

    if (arraysEqual(currentWords, targetWords)) {
      isLocked = true;
      paintCorrect(box);
      setStatus("ok", "✓");
      disableTiles(container);

      setTimeout(() => {
        setStatus("", "");
        onCorrect();
        isLocked = false;
      }, 1000);
    } else {
      isLocked = true;
      setStatus("bad", "✗");
      disableTiles(container);

      setTimeout(() => {
        resetStage(container, box);
      }, 700);
    }
  }

  function buildTiles(container, box, words, onCorrect) {
    clear(container);
    clear(box);

    const shuffled = shuffle(words);

    shuffled.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.type = "button";
      btn.textContent = word;

      btn.addEventListener("click", () => {
        if (isLocked || btn.disabled) return;

        addWord(box, word);
        btn.disabled = true;

        checkAuto(box, container, words, onCorrect);
      });

      container.appendChild(btn);
    });
  }

  function buildQuestion(round) {
    answerBlock.classList.add("hidden");
    clear(answerBox);
    clear(answerTiles);

    buildTiles(questionTiles, questionBox, round.q, () => {
      answerBlock.classList.remove("hidden");
      buildAnswer(round);
    });
  }

  function buildAnswer(round) {
    buildTiles(answerTiles, answerBox, round.a, () => {
      playAudioAndContinue(round);
    });
  }

  function loadRound(i) {
    idx = i;
    isLocked = false;
    setStatus("", "");
    stopAudio();

    const round = ROUNDS[idx];
    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;

    clear(questionBox);
    clear(questionTiles);
    clear(answerBox);
    clear(answerTiles);

    answerBlock.classList.add("hidden");
    exerciseBox.classList.remove("hidden");
    endScreen.classList.add("hidden");

    buildQuestion(round);
  }

  function finish() {
    stopAudio();
    exerciseBox.classList.add("hidden");
    endScreen.classList.remove("hidden");
  }

  loadRound(0);
})();