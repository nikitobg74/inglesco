(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  const EXERCISES = [
    {
      image:    BASE + "images/u5/u5.wife.riding.jpg",
      q1:       "Who is she?",
      audio1:   BASE + "audio/u5/u5.this.wife.mp3",
      partial1: ["This is my", "_____", "."],
      correct1: "wife",
      options1: ["sister", "wife", "daughter"],
      q2:       "What is she doing?",
      audio2:   BASE + "audio/u5/u5.wife.riding.bicycle.mp3",
      partial2: ["She is", "_____", "her bicycle."],
      correct2: "riding",
      options2: ["riding", "reading", "cleaning"]
    },
    {
      image:    BASE + "images/u5/u5.husband.swim.jpg",
      q1:       "Who is he?",
      audio1:   BASE + "audio/u5/u5.husband1.mp3",
      partial1: ["This is my", "_____", "."],
      correct1: "husband",
      options1: ["husband", "son", "brother"],
      q2:       "What is he doing?",
      audio2:   BASE + "audio/u5/u5.husband.swim.mp3",
      partial2: ["He is", "_____", "."],
      correct2: "swimming",
      options2: ["fixing", "swimming", "cleaning"]
    },
    {
      image:    BASE + "images/u5/u5.daughter.english.jpg",
      q1:       "Who is she?",
      audio1:   BASE + "audio/u5/u5.daughter1.mp3",
      partial1: ["This is my", "_____", "."],
      correct1: "daughter",
      options1: ["sister", "wife", "daughter"],
      q2:       "What is she doing?",
      audio2:   BASE + "audio/u5/u5.daughter.study.mp3",
      partial2: ["She is", "_____", "English."],
      correct2: "studying",
      options2: ["riding", "studying", "cleaning"]
    },
    {
      image:    BASE + "images/u5/u5.son.reading.jpg",
      q1:       "Who is he?",
      audio1:   BASE + "audio/u5/u5.my.son.mp3",
      partial1: ["This is my", "_____", "."],
      correct1: "son",
      options1: ["husband", "son", "brother"],
      q2:       "What is he doing?",
      audio2:   BASE + "audio/u5/u5.son.reading.mp3",
      partial2: ["He is", "_____", "."],
      correct2: "reading",
      options2: ["reading", "riding", "studying"]
    }
  ];

  let exIndex = 0;
  let audio   = null;

  const imgEl      = document.getElementById("lessonImg");
  const audioBtn   = document.getElementById("audioBtn");
  const q1Label    = document.getElementById("q1Label");
  const answer1Area= document.getElementById("answer1Area");
  const answer1Row = document.getElementById("answer1Row");
  const tiles1El   = document.getElementById("tiles1");
  const answer2Area= document.getElementById("answer2Area");
  const q2Label    = document.getElementById("q2Label");
  const answer2Row = document.getElementById("answer2Row");
  const tiles2El   = document.getElementById("tiles2");
  const counter    = document.getElementById("counter");
  const bar        = document.getElementById("progressBar");
  const endScreen  = document.getElementById("endScreen");

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
    const ex = EXERCISES[exIndex];

    counter.textContent = `${exIndex + 1} / ${EXERCISES.length}`;
    bar.style.width = ((exIndex + 1) / EXERCISES.length * 100) + "%";

    imgEl.src = ex.image;
    imgEl.alt = ex.q1;

    // First question
    q1Label.textContent = ex.q1;

    // Reset audio button
    audioBtn.className = "audio-btn";
    audioBtn.textContent = "▶";
    audioBtn.disabled = false;

    // Hide both answer areas
    answer1Area.classList.remove("show");
    answer2Area.classList.remove("show");
    answer1Row.innerHTML = "";
    tiles1El.innerHTML = "";
    answer2Row.innerHTML = "";
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
      showAnswer1();
    });
  };

  // ── Show first fill-in ────────────────────────────────────
  function showAnswer1() {
    const ex = EXERCISES[exIndex];
    buildAnswerRow(answer1Row, ex.partial1, "blank1");
    buildTiles(tiles1El, ex.options1, ex.correct1, onCorrect1);
    answer1Area.classList.add("show");
  }

  // ── First answer correct ──────────────────────────────────
  function onCorrect1() {
    const ex = EXERCISES[exIndex];
    // Play second audio automatically
    if (audio) { audio.pause(); audio = null; }
    audio = new Audio(ex.audio2);
    audio.play().catch(() => {});
    audio.addEventListener("ended", () => {
      showAnswer2();
    });
  }

  // ── Show second fill-in ───────────────────────────────────
  function showAnswer2() {
    const ex = EXERCISES[exIndex];
    q2Label.textContent = ex.q2;
    buildAnswerRow(answer2Row, ex.partial2, "blank2");
    buildTiles(tiles2El, ex.options2, ex.correct2, onCorrect2);
    answer2Area.classList.add("show");
  }

  // ── Second answer correct → advance ──────────────────────
  function onCorrect2() {
    setTimeout(advance, 2000);
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

  // ── Build answer row with blank span ─────────────────────
  function buildAnswerRow(rowEl, partial, blankId) {
    rowEl.innerHTML = "";
    partial.forEach(part => {
      if (part === "_____") {
        const blank = document.createElement("span");
        blank.className = "blank-word";
        blank.id = blankId;
        blank.textContent = "_____";
        rowEl.appendChild(blank);
      } else {
        const txt = document.createElement("span");
        txt.textContent = part;
        rowEl.appendChild(txt);
      }
    });
  }

  // ── Build shuffled tile buttons ───────────────────────────
  function buildTiles(containerEl, options, correct, onCorrectCb) {
    const opts = [...options];
    shuffle(opts);
    containerEl.innerHTML = "";
    opts.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.textContent = word;
      btn.onclick = () => selectTile(btn, word, correct, containerEl, onCorrectCb);
      containerEl.appendChild(btn);
    });
  }

  // ── Select a tile ─────────────────────────────────────────
  function selectTile(btn, word, correct, containerEl, onCorrectCb) {
    // Find which blank this tile set belongs to
    const blankId = containerEl === tiles1El ? "blank1" : "blank2";
    const blank = document.getElementById(blankId);

    if (word === correct) {
      blank.textContent = word;
      blank.classList.add("correct");
      btn.classList.add("correct");
      // Disable all tiles in this set
      containerEl.querySelectorAll(".tile").forEach(t => t.classList.add("used"));
      onCorrectCb();
    } else {
      // Shake tile red, then reset it
      btn.classList.add("error");
      setTimeout(() => btn.classList.remove("error"), 400);
    }
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
