(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  const EXERCISES = [
    {
      image: BASE + "images/u5/u5.daughter.english.jpg",
      audio1: BASE + "audio/u5/u5.daughter1.mp3",
      question1: "Who is she?",
      words1: ["This", "is", "my", "daughter."],
      audio2: BASE + "audio/u5/u5.daughter.study.mp3",
      question2: "What is she doing?",
      words2: ["She", "is", "studying", "English."]
    },
    {
      image: BASE + "images/u5/u5.wife.riding.jpg",
      audio1: BASE + "audio/u5/u5.this.wife.mp3",
      question1: "Who is she?",
      words1: ["This", "is", "my", "wife."],
      audio2: BASE + "audio/u5/u5.wife.riding.bicycle.mp3",
      question2: "What is she doing?",
      words2: ["She", "is", "riding", "her", "bicycle."]
    },
    {
      image: BASE + "images/u5/u5.husband.swim.jpg",
      audio1: BASE + "audio/u5/u5.husband1.mp3",
      question1: "Who is he?",
      words1: ["This", "is", "my", "husband."],
      audio2: BASE + "audio/u5/u5.husband.swim.mp3",
      question2: "What is he doing?",
      words2: ["He", "is", "swimming."]
    },
    {
      image: BASE + "images/u5/u5.son.reading.jpg",
      audio1: BASE + "audio/u5/u5.my.son.mp3",
      question1: "Who is he?",
      words1: ["This", "is", "my", "son."],
      audio2: BASE + "audio/u5/u5.son.reading.mp3",
      question2: "What is he doing?",
      words2: ["He", "is", "reading", "a book."]
    }
  ];

  let exIndex = 0;
  let audio = null;

  let placed1 = [];
  let placed2 = [];
  let solved1 = false;
  let solved2 = false;

  const imgEl = document.getElementById("lessonImg");
  const audioBtn = document.getElementById("audioBtn");
  const builder1Area = document.getElementById("builder1Area");
  const builder1Label = document.getElementById("builder1Label");
  const dropZone1 = document.getElementById("dropZone1");
  const tiles1El = document.getElementById("tiles1");
  const builder2Area = document.getElementById("builder2Area");
  const builder2Label = document.getElementById("builder2Label");
  const dropZone2 = document.getElementById("dropZone2");
  const tiles2El = document.getElementById("tiles2");
  const counter = document.getElementById("counter");
  const bar = document.getElementById("progressBar");
  const endScreen = document.getElementById("endScreen");
  const card = document.querySelector(".card");

  function loadExercise() {
    solved1 = false;
    solved2 = false;
    placed1 = [];
    placed2 = [];

    const ex = EXERCISES[exIndex];

    counter.textContent = `${exIndex + 1} / ${EXERCISES.length}`;
    bar.style.width = ((exIndex + 1) / EXERCISES.length * 100) + "%";

    imgEl.src = ex.image;
    imgEl.alt = ex.words1.join(" ");

    audioBtn.className = "audio-btn";
    audioBtn.textContent = "▶";
    audioBtn.disabled = false;

    builder1Area.classList.remove("show");
    builder2Area.classList.remove("show");

    builder1Label.innerHTML = "";
    builder2Label.innerHTML = "";

    dropZone1.className = "drop-zone";
    dropZone1.innerHTML = "";
    tiles1El.innerHTML = "";

    dropZone2.className = "drop-zone";
    dropZone2.innerHTML = "";
    tiles2El.innerHTML = "";

    if (audio) {
      audio.pause();
      audio = null;
    }
  }

  window.playFirstAudio = function () {
    if (audioBtn.disabled) return;

    audioBtn.disabled = true;
    audioBtn.className = "audio-btn playing";
    audioBtn.textContent = "🔊";

    const ex = EXERCISES[exIndex];
    audio = new Audio(ex.audio1);

    audio.play().catch(err => {
      console.error("Audio 1 failed:", err);
      audioBtn.disabled = false;
      audioBtn.className = "audio-btn";
      audioBtn.textContent = "▶";
    });

    audio.addEventListener("ended", () => {
      audioBtn.className = "audio-btn done";
      audioBtn.textContent = "✓";
      showBuilder1();
    }, { once: true });
  };

  function showBuilder1() {
    const ex = EXERCISES[exIndex];
    builder1Label.innerHTML = `
      <span class="question-text">${ex.question1}</span>
      <span class="helper-text">Order the words.</span>
    `;
    buildTiles(tiles1El, dropZone1, ex.words1, placed1, 1);
    builder1Area.classList.add("show");
  }

  function showBuilder2() {
    const ex = EXERCISES[exIndex];
    builder2Label.innerHTML = `
      <span class="question-text">${ex.question2}</span>
      <span class="helper-text">Order the words.</span>
    `;
    buildTiles(tiles2El, dropZone2, ex.words2, placed2, 2);
    builder2Area.classList.add("show");
  }

  function buildTiles(tilesEl, dropZone, words, placedArr, builderNum) {
    const shuffled = [...words];

    if (shuffled.length > 1) {
      do {
        shuffle(shuffled);
      } while (shuffled.join(" ") === words.join(" "));
    }

    tilesEl.innerHTML = "";
    dropZone.innerHTML = "";
    dropZone.className = "drop-zone";

    shuffled.forEach(word => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tile";
      btn.textContent = word;
      btn.dataset.word = word;
      btn.onclick = () => placeTile(btn, tilesEl, dropZone, words, placedArr, builderNum);
      tilesEl.appendChild(btn);
    });
  }

  function placeTile(btn, tilesEl, dropZone, words, placedArr, builderNum) {
    if ((builderNum === 1 && solved1) || (builderNum === 2 && solved2)) return;
    if (btn.classList.contains("used")) return;

    btn.classList.add("used");
    placedArr.push({ word: btn.dataset.word, btn });

    const chip = document.createElement("span");
    chip.className = "placed";
    chip.textContent = btn.dataset.word;
    chip.onclick = () => removeChip(chip, btn, dropZone, placedArr, builderNum);
    dropZone.appendChild(chip);

    if (placedArr.length === words.length) {
      checkBuilder(tilesEl, dropZone, words, placedArr, builderNum);
    }
  }

  function removeChip(chip, sourceBtn, dropZone, placedArr, builderNum) {
    if ((builderNum === 1 && solved1) || (builderNum === 2 && solved2)) return;

    chip.remove();

    const idx = placedArr.findIndex(p => p.btn === sourceBtn);
    if (idx !== -1) placedArr.splice(idx, 1);

    sourceBtn.classList.remove("used");
    dropZone.classList.remove("error");
  }

  function checkBuilder(tilesEl, dropZone, words, placedArr, builderNum) {
    const built = placedArr.map(p => p.word).join(" ");
    const correct = words.join(" ");

    if (built === correct) {
      if (builderNum === 1) {
        solved1 = true;
      } else {
        solved2 = true;
      }

      dropZone.classList.add("correct");

      dropZone.querySelectorAll(".placed").forEach(chip => {
        chip.onclick = null;
        chip.style.cursor = "default";
      });

      tilesEl.querySelectorAll(".tile").forEach(tile => {
        tile.classList.add("used");
        tile.style.pointerEvents = "none";
      });

      if (builderNum === 1) {
        const ex = EXERCISES[exIndex];

        if (audio) {
          audio.pause();
          audio = null;
        }

        audio = new Audio(ex.audio2);
        audio.play().catch(err => {
          console.error("Audio 2 failed:", err);
          showBuilder2();
        });

        audio.addEventListener("ended", () => {
          showBuilder2();
        }, { once: true });
      } else {
        setTimeout(advance, 2000);
      }
    } else {
      dropZone.classList.add("error");

      setTimeout(() => {
        dropZone.classList.remove("error");
        placedArr.forEach(p => p.btn.classList.remove("used"));
        placedArr.length = 0;
        dropZone.innerHTML = "";
      }, 500);
    }
  }

  function advance() {
    exIndex++;

    if (exIndex >= EXERCISES.length) {
      if (card) card.style.display = "none";
      endScreen.style.display = "block";
      return;
    }

    loadExercise();
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  shuffle(EXERCISES);
  loadExercise();
})();