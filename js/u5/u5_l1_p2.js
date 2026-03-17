(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  const EXERCISES = [
    {
      image:    BASE + "images/u5/u5.l1.p1.wife.jpg",
      audio:    BASE + "audio/u5/u5.wife.mp3",
      correct:  "wife",
      options:  ["wife", "sister"],
      sentence: "She is my wife."
    },
    {
      image:    BASE + "images/u5/u5.l1.p1.husband.statue.liberty.jpg",
      audio:    BASE + "audio/u5/u5.husband.mp3",
      correct:  "husband",
      options:  ["husband", "brother"],
      sentence: "He is my husband."
    },
    {
      image:    BASE + "images/u5/u5.l1.p1.boy.swimming.jpg",
      audio:    BASE + "audio/u5/u5.son.mp3",
      correct:  "son",
      options:  ["son", "brother"],
      sentence: "He is my son."
    },
    {
      image:    BASE + "images/u5/u5.l1.p1.daughter.riding.jpg",
      audio:    BASE + "audio/u5/u5.daughter.mp3",
      correct:  "daughter",
      options:  ["daughter", "sister"],
      sentence: "She is my daughter."
    }
  ];

  let exIndex  = 0;
  let audio    = null;
  let answered = false;

  const imgEl          = document.getElementById("lessonImg");
  const audioBtn       = document.getElementById("audioBtn");
  const tilesArea      = document.getElementById("tilesArea");
  const tilesEl        = document.getElementById("tiles");
  const confirmEl      = document.getElementById("confirmSentence");
  const nextBtn        = document.getElementById("nextBtn");
  const counter        = document.getElementById("counter");
  const bar            = document.getElementById("progressBar");
  const endScreen      = document.getElementById("endScreen");

  // ── Vocab toggle ─────────────────────────────────────────
  window.toggleVocab = function () {
    const body   = document.getElementById("vocabBody");
    const toggle = document.getElementById("vocabToggle");
    const isOpen = !body.classList.contains("hidden");
    body.classList.toggle("hidden", isOpen);
    toggle.classList.toggle("open", !isOpen);
  };

  // ── Load exercise ─────────────────────────────────────────
  function loadExercise() {
    answered = false;
    const ex = EXERCISES[exIndex];

    counter.textContent = `${exIndex + 1} / ${EXERCISES.length}`;
    bar.style.width = ((exIndex + 1) / EXERCISES.length * 100) + "%";

    imgEl.src = ex.image;
    imgEl.alt = ex.sentence;

    // Reset audio button
    audioBtn.className = "audio-btn";
    audioBtn.textContent = "▶";
    audioBtn.disabled = false;

    // Hide tiles and next button
    tilesArea.classList.remove("show");
    tilesEl.innerHTML = "";
    confirmEl.textContent = "";
    confirmEl.classList.remove("show");
    nextBtn.disabled = true;

    // Stop any previous audio
    if (audio) { audio.pause(); audio = null; }
  }

  // ── Play audio ────────────────────────────────────────────
  window.playAudio = function () {
    if (audioBtn.disabled && !answered) return;

    const ex = EXERCISES[exIndex];
    if (audio) { audio.pause(); audio = null; }

    audioBtn.className = "audio-btn playing";
    audioBtn.textContent = "🔊";
    audioBtn.disabled = true;

    audio = new Audio(ex.audio);
    audio.play().catch(() => {});

    audio.addEventListener("ended", () => {
      audioBtn.className = "audio-btn done";
      audioBtn.textContent = "✓";
      audioBtn.disabled = false; // allow replay

      if (!answered) {
        showTiles();
      }
    });
  };

  // ── Show word tiles ───────────────────────────────────────
  function showTiles() {
    const ex = EXERCISES[exIndex];
    const opts = [...ex.options];
    shuffle(opts);

    tilesEl.innerHTML = "";
    opts.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.textContent = word;
      btn.onclick = () => selectAnswer(btn, word);
      tilesEl.appendChild(btn);
    });

    tilesArea.classList.add("show");
  }

  // ── Select answer ─────────────────────────────────────────
  function selectAnswer(btn, word) {
    if (answered) return;
    const ex = EXERCISES[exIndex];

    if (word === ex.correct) {
      answered = true;

      // Mark correct tile green, disable all
      btn.classList.add("correct");
      tilesEl.querySelectorAll(".tile").forEach(t => {
        if (t !== btn) t.classList.add("disabled");
      });

      // Show confirmation sentence
      confirmEl.textContent = ex.sentence;
      confirmEl.classList.add("show");

      // Replay audio
      if (audio) { audio.pause(); audio = null; }
      audio = new Audio(ex.audio);
      audio.play().catch(() => {});

      // Enable next button
      nextBtn.disabled = false;

    } else {
      // Shake and turn tile red, then reset it
      btn.classList.add("error");
      setTimeout(() => btn.classList.remove("error"), 400);
    }
  }

  // ── Next exercise ─────────────────────────────────────────
  window.nextExercise = function () {
    exIndex++;
    if (exIndex >= EXERCISES.length) {
      document.querySelector(".card").style.display = "none";
      endScreen.style.display = "block";
      return;
    }
    loadExercise();
  };

  // ── Shuffle helper ────────────────────────────────────────
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
