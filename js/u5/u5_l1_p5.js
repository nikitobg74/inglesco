(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  const EXERCISES = [
    {
      image:   BASE + "images/u5/u5.daughter.english.jpg",
      audio1:  BASE + "audio/u5/u5.daughter1.mp3",
      words1:  ["This", "is", "my", "daughter."],
      audio2:  BASE + "audio/u5/u5.daughter.study.mp3",
      words2:  ["She", "is", "studying", "English."]
    },
    {
      image:   BASE + "images/u5/u5.wife.riding.jpg",
      audio1:  BASE + "audio/u5/u5.this.wife.mp3",
      words1:  ["This", "is", "my", "wife."],
      audio2:  BASE + "audio/u5/u5.wife.riding.bicycle.mp3",
      words2:  ["She", "is", "riding", "her", "bicycle."]
    },
    {
      image:   BASE + "images/u5/u5.husband.swim.jpg",
      audio1:  BASE + "audio/u5/u5.husband1.mp3",
      words1:  ["This", "is", "my", "husband."],
      audio2:  BASE + "audio/u5/u5.husband.swim.mp3",
      words2:  ["He", "is", "swimming."]
    },
    {
      image:   BASE + "images/u5/u5.son.reading.jpg",
      audio1:  BASE + "audio/u5/u5.my.son.mp3",
      words1:  ["This", "is", "my", "son."],
      audio2:  BASE + "audio/u5/u5.son.reading.mp3",
      words2:  ["He", "is", "reading", "a book."]
    }
  ];

  let exIndex = 0;
  let audio   = null;

  // State for each builder
  let placed1 = [];
  let placed2 = [];
  let solved1 = false;
  let solved2 = false;

  const imgEl        = document.getElementById("lessonImg");
  const audioBtn     = document.getElementById("audioBtn");
  const builder1Area = document.getElementById("builder1Area");
  const builder1Label= document.getElementById("builder1Label");
  const dropZone1    = document.getElementById("dropZone1");
  const tiles1El     = document.getElementById("tiles1");
  const builder2Area = document.getElementById("builder2Area");
  const builder2Label= document.getElementById("builder2Label");
  const dropZone2    = document.getElementById("dropZone2");
  const tiles2El     = document.getElementById("tiles2");
  const counter      = document.getElementById("counter");
  const bar          = document.getElementById("progressBar");
  const endScreen    = document.getElementById("endScreen");

  // ── Vocab toggle ──────────────────────────────────────────
  window.toggleVocab = function () {
    const body   = document.getElementById("vocabBody");
    const toggle = document.getElementById("vocabToggle");
    const isOpen = !body.classList.contains("hidden");
    body.classList.toggle("hidden", isOpen);
    toggle.classList.toggle("open", !isOpen);
  };

  // ── Load exercise ─────────────────────────────────────────
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

    // Reset audio button
    audioBtn.className = "audio-btn";
    audioBtn.textContent = "▶";
    audioBtn.disabled = false;

    // Hide both builders
    builder1Area.classList.remove("show");
    builder2Area.classList.remove("show");
    dropZone1.className = "drop-zone";
    dropZone1.innerHTML = "";
    tiles1El.innerHTML = "";
    dropZone2.className = "drop-zone";
    dropZone2.innerHTML = "";
    tiles2El.innerHTML = "";

    if (audio) { audio.pause(); audio = null; }
  }

  // ── Play first audio ──────────────────────────────────────
  window.playFirstAudio = function () {
    if (audioBtn.disabled) return;
    audioBtn.disabled = true;
    audioBtn.className = "audio-btn playing";
    audioBtn.textContent = "🔊";

    const ex = EXERCISES[exIndex];
    audio = new Audio(ex.audio1);
    audio.play().catch(() => {});
    audio.addEventListener("ended", () => {
      audioBtn.className = "audio-btn done";
      audioBtn.textContent = "✓";
      showBuilder1();
    });
  };

  // ── Show first builder ────────────────────────────────────
  function showBuilder1() {
    const ex = EXERCISES[exIndex];
    builder1Label.textContent = "Ordena las palabras:";
    buildTiles(tiles1El, dropZone1, ex.words1, placed1, 1);
    builder1Area.classList.add("show");
  }

  // ── Show second builder ───────────────────────────────────
  function showBuilder2() {
    const ex = EXERCISES[exIndex];
    builder2Label.textContent = "Ordena las palabras:";
    buildTiles(tiles2El, dropZone2, ex.words2, placed2, 2);
    builder2Area.classList.add("show");
  }

  // ── Build shuffled tiles for a builder ───────────────────
  function buildTiles(tilesEl, dropZone, words, placedArr, builderNum) {
    const shuffled = [...words];
    do { shuffle(shuffled); }
    while (shuffled.join(" ") === words.join(" "));

    tilesEl.innerHTML = "";
    shuffled.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.textContent = word;
      btn.dataset.word = word;
      btn.onclick = () => placeTile(btn, tilesEl, dropZone, words, placedArr, builderNum);
      tilesEl.appendChild(btn);
    });
  }

  // ── Place a tile ──────────────────────────────────────────
  function placeTile(btn, tilesEl, dropZone, words, placedArr, builderNum) {
    if (builderNum === 1 && solved1) return;
    if (builderNum === 2 && solved2) return;

    btn.classList.add("used");
    placedArr.push({ word: btn.dataset.word, btn });

    const chip = document.createElement("span");
    chip.className = "placed";
    chip.textContent = btn.dataset.word;
    chip.onclick = () => removeChip(chip, btn, dropZone, placedArr, builderNum);
    dropZone.appendChild(chip);

    // Auto-check when all words placed
    if (placedArr.length === words.length) {
      checkBuilder(tilesEl, dropZone, words, placedArr, builderNum);
    }
  }

  // ── Remove a chip (undo) ──────────────────────────────────
  function removeChip(chip, sourceBtn, dropZone, placedArr, builderNum) {
    if (builderNum === 1 && solved1) return;
    if (builderNum === 2 && solved2) return;
    chip.remove();
    const idx = placedArr.findIndex(p => p.btn === sourceBtn);
    if (idx !== -1) placedArr.splice(idx, 1);
    sourceBtn.classList.remove("used");
    dropZone.classList.remove("error");
  }

  // ── Check builder answer ──────────────────────────────────
  function checkBuilder(tilesEl, dropZone, words, placedArr, builderNum) {
    const built   = placedArr.map(p => p.word).join(" ");
    const correct = words.join(" ");

    if (built === correct) {
      // Mark correct
      if (builderNum === 1) solved1 = true;
      else solved2 = true;

      dropZone.classList.add("correct");
      // Lock all chips and tiles
      dropZone.querySelectorAll(".placed").forEach(c => { c.onclick = null; c.style.cursor = "default"; });
      tilesEl.querySelectorAll(".tile").forEach(t => { t.classList.add("used"); t.style.pointerEvents = "none"; });

      if (builderNum === 1) {
        // Play second audio then show second builder
        const ex = EXERCISES[exIndex];
        if (audio) { audio.pause(); audio = null; }
        audio = new Audio(ex.audio2);
        audio.play().catch(() => {});
        audio.addEventListener("ended", () => {
          showBuilder2();
        });
      } else {
        // Both solved — advance after 2s
        setTimeout(advance, 2000);
      }

    } else {
      // Wrong — shake drop zone, clear it, return tiles
      dropZone.classList.add("error");
      setTimeout(() => {
        dropZone.classList.remove("error");
        placedArr.forEach(p => p.btn.classList.remove("used"));
        placedArr.splice(0, placedArr.length);
        dropZone.innerHTML = "";
      }, 500);
    }
  }

  // ── Advance ───────────────────────────────────────────────
  function advance() {
    exIndex++;
    if (exIndex >= EXERCISES.length) {
      document.querySelector(".card").style.display = "none";
      endScreen.style.display = "block";
      return;
    }
    loadExercise();
  }

  // ── Shuffle helper ────────────────────────────────────────
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  // ── Init — shuffle exercises then start ───────────────────
  shuffle(EXERCISES);
  loadExercise();
})();