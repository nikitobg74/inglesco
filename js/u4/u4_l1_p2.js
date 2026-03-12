const AUDIO_BASE = "../../../../assets/audio/u4/l1/";

const ITEMS = [
  { word: "washing",  audio: "u4.l1.p2.washing.mp3" },
  { word: "doing",    audio: "u4.l1.p2.exercise.mp3" },
  { word: "cleaning", audio: "u4.l1.p2.clean.mp3" },
  { word: "painting", audio: "u4.l1.p2.painting.mp3" },
  { word: "fixing",   audio: "u4.l1.p2.fixing.mp3" },
  { word: "cooking",  audio: "u4.l1.p2.cooking.mp3" },
  { word: "feeding",  audio: "u4.l1.p2.feed.mp3" },
  { word: "reading",  audio: "u4.l1.p2.read.mp3" }
];

(() => {
  const wordBank = document.getElementById("wordBank");
  const blanks = document.querySelectorAll(".blank");
  const scoreCount = document.getElementById("scoreCount");
  const exerciseBox = document.getElementById("exerciseBox");
  const endScreen = document.getElementById("endScreen");

  let selectedChip = null;
  let score = 0;
  let currentAudio = null;

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function stopCurrentAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  function playSentenceAudio(word) {
    const item = ITEMS.find(entry => entry.word === word);
    if (!item) return;

    stopCurrentAudio();

    const audio = new Audio(AUDIO_BASE + item.audio);
    currentAudio = audio;

    audio.play().catch((err) => {
      console.error("Audio playback failed:", err);
    });

    audio.addEventListener("ended", () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
    });

    audio.addEventListener("error", () => {
      console.error("Could not load audio:", AUDIO_BASE + item.audio);
      if (currentAudio === audio) {
        currentAudio = null;
      }
    });
  }

  function buildWordBank() {
    const shuffled = shuffle(ITEMS.map(item => item.word));

    wordBank.innerHTML = shuffled.map(word => `
      <div class="word-chip" data-word="${word}">${word}</div>
    `).join("");

    const chips = wordBank.querySelectorAll(".word-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => selectWord(chip));
    });
  }

  function clearSelectedChip() {
    if (selectedChip) {
      selectedChip.classList.remove("selected");
      selectedChip = null;
    }
  }

  function selectWord(chip) {
    if (chip.classList.contains("used")) return;

    if (selectedChip === chip) {
      chip.classList.remove("selected");
      selectedChip = null;
      return;
    }

    if (selectedChip) {
      selectedChip.classList.remove("selected");
    }

    selectedChip = chip;
    chip.classList.add("selected");
  }

  function showNeedSelection(blank) {
    blank.classList.add("active");
    setTimeout(() => {
      blank.classList.remove("active");
    }, 500);
  }

  function markWrong(blank, chosenWord) {
    blank.textContent = chosenWord;
    blank.classList.remove("correct");
    blank.classList.add("wrong");

    setTimeout(() => {
      blank.textContent = "";
      blank.classList.remove("wrong");
    }, 800);
  }

  function markCorrect(blank, chip, chosenWord) {
    blank.textContent = chosenWord;
    blank.classList.remove("wrong", "active");
    blank.classList.add("correct");

    chip.classList.remove("selected");
    chip.classList.add("used");
    selectedChip = null;

    score += 1;
    scoreCount.textContent = score;

    playSentenceAudio(chosenWord);

    if (score === blanks.length) {
      setTimeout(() => {
        exerciseBox.style.display = "none";
        wordBank.style.display = "none";
        endScreen.classList.add("show");
      }, 700);
    }
  }

  function handleBlankClick(blank) {
    if (blank.classList.contains("correct")) return;

    if (!selectedChip) {
      showNeedSelection(blank);
      return;
    }

    const chosenWord = selectedChip.dataset.word;
    const answer = blank.dataset.answer;

    if (chosenWord === answer) {
      markCorrect(blank, selectedChip, chosenWord);
    } else {
      markWrong(blank, chosenWord);
      clearSelectedChip();
    }
  }

  blanks.forEach(blank => {
    blank.addEventListener("click", () => handleBlankClick(blank));
  });

  buildWordBank();

  window.selectWord = () => {};
  window.fillBlank = () => {};
})();