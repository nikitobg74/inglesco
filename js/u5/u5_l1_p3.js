(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  const EXERCISES = [
    {
      image:    BASE + "images/u5/u5.l1.p1.wife.jpg",
      audio1:   BASE + "audio/u5/u5.who.she.mp3",
      audio2:   BASE + "audio/u5/u5.l1.p1.wife.mp3",
      lines: [
        { text: "Who is she?", t: 0.0 }
      ],
      question: "Who is she?",
      words:    ["She", "is", "my", "wife"],
    },
    {
      image:    BASE + "images/u5/u5.l1.p1.husband.statue.liberty.jpg",
      audio1:   BASE + "audio/u5/u5.who.he.mp3",
      audio2:   BASE + "audio/u5/u5.l1.p1.husband.mp3",
      lines: [
        { text: "Who is he?", t: 0.0 }
      ],
      question: "Who is he?",
      words:    ["He", "is", "my", "husband"],
    },
    {
      image:    BASE + "images/u5/u5.l1.p1.boy.swimming.jpg",
      audio1:   BASE + "audio/u5/u5.who.he.mp3",
      audio2:   BASE + "audio/u5/u5.l1.p1.son.mp3",
      lines: [
        { text: "Who is he?", t: 0.0 }
      ],
      question: "Who is he?",
      words:    ["He", "is", "my", "son"],
    },
    {
      image:    BASE + "images/u5/u5.l1.p1.daughter.riding.jpg",
      audio1:   BASE + "audio/u5/u5.who.she.mp3",
      audio2:   BASE + "audio/u5/u5.l1.p1.daughter.mp3",
      lines: [
        { text: "Who is she?", t: 0.0 }
      ],
      question: "Who is she?",
      words:    ["She", "is", "my", "daughter"],
    }
  ];

  let exIndex  = 0;
  let audio1   = null;
  let audio2   = null;
  let rafId    = null;
  let placed   = [];      // words placed in drop zone so far
  let solved   = false;

  const imgEl       = document.getElementById("lessonImg");
  const audioBtn    = document.getElementById("audioBtn");
  const karaokeBox  = document.getElementById("karaokeBox");
  const builderArea = document.getElementById("builderArea");
  const builderLabel= document.getElementById("builderLabel");
  const dropZone    = document.getElementById("dropZone");
  const tilesEl     = document.getElementById("tiles");
  const counter     = document.getElementById("counter");
  const bar         = document.getElementById("progressBar");
  const endScreen   = document.getElementById("endScreen");

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
    solved = false;
    placed = [];
    const ex = EXERCISES[exIndex];

    counter.textContent = `${exIndex + 1} / ${EXERCISES.length}`;
    bar.style.width = ((exIndex + 1) / EXERCISES.length * 100) + "%";

    imgEl.src = ex.image;
    imgEl.alt = ex.question;

    // Reset audio button
    audioBtn.className = "audio-btn";
    audioBtn.textContent = "▶";
    audioBtn.disabled = false;

    // Build karaoke
    karaokeBox.innerHTML = ex.lines
      .map((l, i) => `<span data-i="${i}">${l.text}</span>`)
      .join("<br>");

    // Hide builder
    builderArea.classList.remove("show");
    dropZone.className = "drop-zone";
    dropZone.innerHTML = "";
    tilesEl.innerHTML = "";

    stopAll();
  }

  // ── Play first audio (karaoke) ────────────────────────────
  window.playFirstAudio = function () {
    if (audioBtn.disabled) return;
    audioBtn.disabled = true;
    audioBtn.className = "audio-btn playing";
    audioBtn.textContent = "🔊";

    const ex = EXERCISES[exIndex];
    audio1 = new Audio(ex.audio1);
    audio1.play().catch(() => {});

    const spans = karaokeBox.querySelectorAll("span");

    function tick() {
      const t = audio1.currentTime;
      spans.forEach((sp, i) => {
        const lineT = ex.lines[i].t;
        const nextT = ex.lines[i + 1] ? ex.lines[i + 1].t : Infinity;
        sp.classList.toggle("highlight", t >= lineT && t < nextT);
      });
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    audio1.addEventListener("ended", () => {
      cancelAnimationFrame(rafId);
      karaokeBox.querySelectorAll("span").forEach(sp => sp.classList.remove("highlight"));
      audioBtn.className = "audio-btn done";
      audioBtn.textContent = "✓";
      showBuilder();
    });
  };

  // ── Show sentence builder ─────────────────────────────────
  function showBuilder() {
    const ex = EXERCISES[exIndex];
    builderLabel.textContent = ex.question;

    // Shuffle tiles — keep reshuffling until order differs from correct answer
    const shuffled = [...ex.words];
    do { shuffle(shuffled); }
    while (shuffled.join(" ") === ex.words.join(" "));

    tilesEl.innerHTML = "";
    shuffled.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.textContent = word;
      btn.dataset.word = word;
      btn.onclick = () => placeTile(btn);
      tilesEl.appendChild(btn);
    });

    builderArea.classList.add("show");
  }

  // ── Place a tile into the drop zone ──────────────────────
  function placeTile(btn) {
    if (solved) return;
    const word = btn.dataset.word;

    // Mark source tile as used
    btn.classList.add("used");
    placed.push({ word, btn });

    // Add to drop zone
    const chip = document.createElement("span");
    chip.className = "placed";
    chip.textContent = word;
    chip.onclick = () => removePlaced(chip, btn);
    dropZone.appendChild(chip);

    // Check if all 4 words are placed
    const ex = EXERCISES[exIndex];
    if (placed.length === ex.words.length) {
      checkAnswer();
    }
  }

  // ── Remove a placed chip (tap to undo) ───────────────────
  function removePlaced(chip, sourceBtn) {
    if (solved) return;
    chip.remove();
    placed = placed.filter(p => p.btn !== sourceBtn);
    sourceBtn.classList.remove("used");
    // Reset any error state on drop zone
    dropZone.classList.remove("error");
  }

  // ── Check the built sentence ──────────────────────────────
  function checkAnswer() {
    const ex = EXERCISES[exIndex];
    const builtSentence = placed.map(p => p.word).join(" ");
    const correctSentence = ex.words.join(" ");

    if (builtSentence === correctSentence) {
      solved = true;
      dropZone.classList.add("correct");
      // Disable all source tiles
      tilesEl.querySelectorAll(".tile").forEach(t => {
        t.classList.add("used");
        t.style.pointerEvents = "none";
      });
      // Disable undo on chips
      dropZone.querySelectorAll(".placed").forEach(c => {
        c.style.cursor = "default";
        c.onclick = null;
      });
      setTimeout(playSecondAudio, 700);
    } else {
      // Wrong — shake the drop zone, then clear it so student tries again
      dropZone.classList.add("error");
      setTimeout(() => {
        dropZone.classList.remove("error");
        // Return all chips and restore tiles
        placed.forEach(p => p.btn.classList.remove("used"));
        placed = [];
        dropZone.innerHTML = "";
      }, 500);
    }
  }

  // ── Play second audio then advance ───────────────────────
  function playSecondAudio() {
    const ex = EXERCISES[exIndex];
    audio2 = new Audio(ex.audio2);
    audio2.play().catch(() => {});
    audio2.addEventListener("ended", () => {
      setTimeout(advance, 2000);
    });
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

  // ── Helpers ───────────────────────────────────────────────
  function stopAll() {
    if (rafId)  { cancelAnimationFrame(rafId); rafId = null; }
    if (audio1) { audio1.pause(); audio1 = null; }
    if (audio2) { audio2.pause(); audio2 = null; }
  }

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
