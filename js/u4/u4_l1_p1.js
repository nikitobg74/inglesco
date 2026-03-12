const AUDIO_BASE = "../../../../assets/audio/u4/l1/";

const ITEMS = [
  { audio: "u4.l1.p1.feed.mp3" },
  { audio: "u4.l1.p1.washing.mp3" },
  { audio: "u4.l1.p1.painting.mp3" },
  { audio: "u4.l1.p1.fixing.mp3" },
  { audio: "u4.l1.p1.dog.eating.mp3" },
  { audio: "u4.l1.p1.cleaning.mp3" },
  { audio: "u4.l1.p1.reading.mp3" }
];

(() => {
  const refToggle = document.getElementById("refToggle");
  const refBody = document.getElementById("refBody");
  const chips = document.querySelectorAll(".word-chip");
  const blanks = document.querySelectorAll(".blank");
  const scoreCount = document.getElementById("scoreCount");
  const exerciseBox = document.getElementById("exerciseBox");
  const endScreen = document.getElementById("endScreen");

  let selectedChip = null;
  let score = 0;
  let currentAudio = null;

  function toggleReference() {
    refToggle.classList.toggle("open");
    refBody.classList.toggle("open");
  }

  function stopCurrentAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  function playPhraseAudio(index) {
    const item = ITEMS[index];
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

  function clearSelectedChip() {
    if (selectedChip) {
      selectedChip.classList.remove("selected");
      selectedChip = null;
    }
  }

  function handleChipClick(chip) {
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
      blank.classList.remove("wrong");
      blank.textContent = "";
    }, 700);
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

    const audioIndex = Number(blank.dataset.audioIndex);
    playPhraseAudio(audioIndex);

    if (score === blanks.length) {
      setTimeout(() => {
        exerciseBox.style.display = "none";
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

  refToggle.addEventListener("click", toggleReference);

  chips.forEach((chip) => {
    chip.addEventListener("click", () => handleChipClick(chip));
  });

  blanks.forEach((blank) => {
    blank.addEventListener("click", () => handleBlankClick(blank));
  });
})();