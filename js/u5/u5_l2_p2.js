(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  const EXERCISES = [
    {
      image:   BASE + "images/u5/u5.she.cooking.dinner.jpg",
      audio1:  BASE + "audio/u5/u5.who.she.mp3",
      q1:      "Who is she?",
      words1:  ["She", "is", "my", "mother."],
      extra1:  "grandmother",                          // distractor
      correct1Audio: BASE + "audio/u5/u5.my.mother2.mp3",
      audio2:  BASE + "audio/u5/u5.what.she.doing.mp3",
      q2:      "What is she doing?",
      words2:  ["She", "is", "cooking", "dinner."],
      extra2:  "eating",
      correct2Audio: BASE + "audio/u5/u5.she.cooking.mp3"
    },
    {
      image:   BASE + "images/u5/u5.l1.p1.man.painting.jpg",
      audio1:  BASE + "audio/u5/u5.who.he.mp3",
      q1:      "Who is he?",
      words1:  ["He", "is", "my", "father."],
      extra1:  "grandfather",
      correct1Audio: BASE + "audio/u5/u5.my.father.mp3",
      audio2:  BASE + "audio/u5/u5.what.he.doing.mp3",
      q2:      "What is he doing?",
      words2:  ["He", "is", "painting", "the", "living room."],
      extra2:  "bedroom",
      correct2Audio: BASE + "audio/u5/u5.he.painting.mp3"
    },
    {
      image:   BASE + "images/u5/u5.grandmother.planting.jpg",
      audio1:  BASE + "audio/u5/u5.who.she.mp3",
      q1:      "Who is she?",
      words1:  ["She", "is", "my", "grandmother."],
      extra1:  "mother",
      correct1Audio: BASE + "audio/u5/u5.my.grandmother2.mp3",
      audio2:  BASE + "audio/u5/u5.what.she.doing.mp3",
      q2:      "What is she doing?",
      words2:  ["She", "is", "planting", "flowers."],
      extra2:  "eating",
      correct2Audio: BASE + "audio/u5/u5.she.planting.mp3"
    },
    {
      image:   BASE + "images/u5/u5.grandfather.jpg",
      audio1:  BASE + "audio/u5/u5.who.he.mp3",
      q1:      "Who is he?",
      words1:  ["He", "is", "my", "grandfather."],
      extra1:  "father",
      correct1Audio: BASE + "audio/u5/u5.my.grandfather.mp3",
      audio2:  BASE + "audio/u5/u5.what.he.doing.mp3",
      q2:      "What is he doing?",
      words2:  ["He", "is", "fixing", "the", "shower."],
      extra2:  "car",
      correct2Audio: BASE + "audio/u5/u5.he.shower.mp3"
    }
  ];

  let exIndex = 0;
  let audio   = null;

  // Builder state
  let placed1 = [], placed2 = [];
  let solved1 = false, solved2 = false;

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

  // ── Load exercise ─────────────────────────────────────────
  function loadExercise() {
    solved1 = false; solved2 = false;
    placed1 = []; placed2 = [];

    const ex = EXERCISES[exIndex];
    counter.textContent = `${exIndex + 1} / ${EXERCISES.length}`;
    bar.style.width = ((exIndex + 1) / EXERCISES.length * 100) + "%";

    imgEl.src = ex.image;
    imgEl.alt = ex.q1;

    audioBtn.className = "audio-btn";
    audioBtn.textContent = "▶";
    audioBtn.disabled = false;

    builder1Area.classList.remove("show");
    builder2Area.classList.remove("show");
    dropZone1.className = "drop-zone"; dropZone1.innerHTML = "";
    dropZone2.className = "drop-zone"; dropZone2.innerHTML = "";
    tiles1El.innerHTML = ""; tiles2El.innerHTML = "";

    if (audio) { audio.pause(); audio = null; }
  }

  // ── Play first audio — question hidden until it ends ──────
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
    builder1Label.textContent = ex.q1;
    const words = [...ex.words1, ex.extra1];
    buildTiles(tiles1El, dropZone1, words, ex.words1, placed1, 1);
    builder1Area.classList.add("show");
  }

  // ── Show second builder ───────────────────────────────────
  function showBuilder2() {
    const ex = EXERCISES[exIndex];
    builder2Label.textContent = ex.q2;
    const words = [...ex.words2, ex.extra2];
    buildTiles(tiles2El, dropZone2, words, ex.words2, placed2, 2);
    builder2Area.classList.add("show");
  }

  // ── Build shuffled tiles ──────────────────────────────────
  function buildTiles(tilesEl, dropZone, allWords, correctWords, placedArr, num) {
    const shuffled = [...allWords];
    shuffle(shuffled);
    tilesEl.innerHTML = "";
    shuffled.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.textContent = word;
      btn.dataset.word = word;
      btn.onclick = () => placeTile(btn, tilesEl, dropZone, correctWords, placedArr, num);
      tilesEl.appendChild(btn);
    });
  }

  // ── Place a tile ──────────────────────────────────────────
  function placeTile(btn, tilesEl, dropZone, correctWords, placedArr, num) {
    if (num === 1 && solved1) return;
    if (num === 2 && solved2) return;

    btn.classList.add("used");
    placedArr.push({ word: btn.dataset.word, btn });

    const chip = document.createElement("span");
    chip.className = "placed";
    chip.textContent = btn.dataset.word;
    chip.onclick = () => removeChip(chip, btn, dropZone, placedArr, num);
    dropZone.appendChild(chip);

    // Auto-check when correct word count is reached
    if (placedArr.length === correctWords.length) {
      checkBuilder(tilesEl, dropZone, correctWords, placedArr, num);
    }
  }

  // ── Remove a chip (undo) ──────────────────────────────────
  function removeChip(chip, sourceBtn, dropZone, placedArr, num) {
    if (num === 1 && solved1) return;
    if (num === 2 && solved2) return;
    chip.remove();
    const idx = placedArr.findIndex(p => p.btn === sourceBtn);
    if (idx !== -1) placedArr.splice(idx, 1);
    sourceBtn.classList.remove("used");
    dropZone.classList.remove("error");
  }

  // ── Check builder ─────────────────────────────────────────
  function checkBuilder(tilesEl, dropZone, correctWords, placedArr, num) {
    const built   = placedArr.map(p => p.word).join(" ");
    const correct = correctWords.join(" ");

    if (built === correct) {
      if (num === 1) solved1 = true;
      else solved2 = true;

      dropZone.classList.add("correct");
      dropZone.querySelectorAll(".placed").forEach(c => { c.onclick = null; c.style.cursor = "default"; });
      tilesEl.querySelectorAll(".tile").forEach(t => { t.classList.add("used"); t.style.pointerEvents = "none"; });

      const ex = EXERCISES[exIndex];
      const confirmAudio = new Audio(num === 1 ? ex.correct1Audio : ex.correct2Audio);
      confirmAudio.play().catch(() => {});

      if (num === 1) {
        // After correct audio ends, play second question audio then show builder 2
        confirmAudio.addEventListener("ended", () => {
          if (audio) { audio.pause(); audio = null; }
          audio = new Audio(ex.audio2);
          audio.play().catch(() => {});
          audio.addEventListener("ended", () => showBuilder2());
        });
      } else {
        // Both done — advance after 2s
        setTimeout(advance, 2000);
      }

    } else {
      // Wrong — shake, clear after 500ms
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

  // ── Shuffle ───────────────────────────────────────────────
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  // ── Init ──────────────────────────────────────────────────
  shuffle(EXERCISES);
  loadExercise();
})();
