// js/u4/u4_l2_p5.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // ── Slides ────────────────────────────────────────────────────────────────
  // answer: correct words IN ORDER
  // distractor1: opposite adjective
  // distractor2: extra adjective distractor
  const SLIDES = [
    {
      image: IMG + "u4.l2.p1.new.car.jpg",
      audio: AUD + "u4.l2.p4.new.car.mp3",
      answer: ["My", "new", "car."],
      distractor1: "old",
      distractor2: "cheap",
    },
    {
      image: IMG + "u4.l2.p1.old.car.jpg",
      audio: AUD + "u4.l2.p4.old.car.mp3",
      answer: ["My", "old", "car."],
      distractor1: "new",
      distractor2: "slow",
    },
    {
      image: IMG + "u4.l2.p1.modern.house.jpg",
      audio: AUD + "u4.l2.p4.modern.house.mp3",
      answer: ["My", "modern", "house."],
      distractor1: "old",
      distractor2: "big",
    },
    {
      image: IMG + "u4.l2.p1.expensive.watch.jpg",
      audio: AUD + "u4.l2.p4.expensive.watch.mp3",
      answer: ["My", "expensive", "watch."],
      distractor1: "cheap",
      distractor2: "old",
    },
    {
      image: IMG + "u4.l2.p1.cheap.watch.jpg",
      audio: AUD + "u4.l2.p4.cheap.watch.mp3",
      answer: ["My", "cheap", "watch."],
      distractor1: "expensive",
      distractor2: "new",
    },
    {
      image: IMG + "u4.l2.p4.fast.car.jpg",
      audio: AUD + "u4.l2.p4.fast.car.mp3",
      answer: ["My", "fast", "car."],
      distractor1: "slow",
      distractor2: "old",
    },
    {
      image: IMG + "u4.l2.p4.slow.car.jpg",
      audio: AUD + "u4.l2.p4.slow.car.mp3",
      answer: ["My", "slow", "car."],
      distractor1: "fast",
      distractor2: "cheap",
    },
    {
      image: IMG + "u4.l2.p1.big.house.jpg",
      audio: AUD + "u4.l2.p4.big.house.mp3",
      answer: ["My", "big", "house."],
      distractor1: "small",
      distractor2: "modern",
    },
    {
      image: IMG + "u4.l2.p4.small.house.jpg",
      audio: AUD + "u4.l2.p4.small.house.mp3",
      answer: ["My", "small", "house."],
      distractor1: "big",
      distractor2: "old",
    },
  ];

  const TOTAL = SLIDES.length;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let slideOrder  = [];
  let current     = 0;
  let audioPlayed = false;
  let isPlaying   = false;
  let playPromise = null;
  let audio       = new Audio();

  // built sentence so far
  let built       = [];
  let target      = [];

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const slideImg    = document.getElementById("slideImg");
  const builtEl     = document.getElementById("builtSentence");
  const tilesEl     = document.getElementById("tiles");
  const hintEl      = document.getElementById("hint");
  const playBtn     = document.getElementById("playBtn");
  const playLabel   = document.getElementById("playLabel");
  const counterEl   = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const endScreen   = document.getElementById("endScreen");
  const slideArea   = document.getElementById("slideArea");

  // ── Init slide order (shuffled) ───────────────────────────────────────────
  function initOrder() {
    slideOrder = shuffle([...Array(TOTAL).keys()]);
  }

  // ── Load slide ────────────────────────────────────────────────────────────
  function loadSlide(pos) {
    const s = SLIDES[slideOrder[pos]];
    audioPlayed = false;
    isPlaying = false;
    built = [];
    target = s.answer;

    // image
    slideImg.style.opacity = "0";
    slideImg.src = s.image;
    slideImg.onload = () => {
      slideImg.style.opacity = "1";
    };

    // counter & bar
    counterEl.textContent = `${pos + 1} / ${TOTAL}`;
    progressBar.style.width = ((pos + 1) / TOTAL * 100) + "%";

    // reset built sentence display
    renderBuilt();

    // build tile pool: answer words + 2 distractors, shuffled
    const pool = shuffle([...s.answer, s.distractor1, s.distractor2]);
    buildTiles(pool);

    // hint & play btn
    // leave hint empty at start to avoid duplicate Spanish instruction
    hintEl.textContent = "";
    hintEl.className = "hint";

    playBtn.innerHTML = "▶";
    playBtn.className = "play-btn";
    playLabel.textContent = "Toca para escuchar";

    // audio
    audio.pause();
    audio = new Audio(s.audio);
    audio.preload = "auto";

    audio.addEventListener("ended", () => {
      isPlaying = false;
      audioPlayed = true;
      playBtn.innerHTML = "🔁";
      playBtn.classList.remove("playing");
      playBtn.classList.add("replay");
      playLabel.textContent = "Toca para repetir";
      hintEl.textContent = "☝️ ¡Forma la oración!";
      hintEl.className = "hint";
    });

    audio.addEventListener("error", () => {
      isPlaying = false;
      audioPlayed = true;
      playBtn.innerHTML = "▶";
      playBtn.classList.remove("playing");
      playLabel.textContent = "Audio no disponible";
      hintEl.textContent = "☝️ ¡Forma la oración!";
      hintEl.className = "hint";
    });
  }

  // ── Render built sentence ─────────────────────────────────────────────────
  function renderBuilt() {
    builtEl.innerHTML = "";

    if (built.length === 0) {
      const placeholder = document.createElement("span");
      placeholder.className = "placeholder";
      placeholder.textContent = "_ _ _";
      builtEl.appendChild(placeholder);
      return;
    }

    built.forEach((word, idx) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = word;
      chip.addEventListener("click", () => removeWord(idx));
      builtEl.appendChild(chip);
    });
  }

  // ── Remove word from built (tap chip to undo) ─────────────────────────────
  function removeWord(idx) {
    const word = built[idx];
    built.splice(idx, 1);
    renderBuilt();

    // re-enable tile
    const tiles = tilesEl.querySelectorAll(".tile");
    tiles.forEach(t => {
      if (t.dataset.word === word && t.classList.contains("used")) {
        t.classList.remove("used");
      }
    });

    hintEl.textContent = "☝️ ¡Forma la oración!";
    hintEl.className = "hint";
  }

  // ── Build tile pool ───────────────────────────────────────────────────────
  function buildTiles(pool) {
    tilesEl.innerHTML = "";

    pool.forEach(word => {
      const tile = document.createElement("button");
      tile.className = "tile";
      tile.textContent = word;
      tile.dataset.word = word;
      tile.addEventListener("click", () => handleTile(tile, word));
      tilesEl.appendChild(tile);
    });
  }

  // ── Tile click ────────────────────────────────────────────────────────────
  function handleTile(tile, word) {
    if (tile.classList.contains("used")) return;

    if (!audioPlayed) {
      hintEl.textContent = "👂 ¡Escucha el audio primero!";
      hintEl.className = "hint warn";
      playBtn.classList.add("pulse");
      setTimeout(() => playBtn.classList.remove("pulse"), 600);
      return;
    }

    const nextExpected = target[built.length];

    if (word === nextExpected) {
      built.push(word);
      tile.classList.add("used");
      renderBuilt();
      hintEl.textContent = "✅ ¡Correcto! Sigue...";
      hintEl.className = "hint correct";

      if (built.length === target.length) {
        hintEl.textContent = "🎉 ¡Oración completa!";
        builtEl.querySelectorAll(".chip").forEach(c => c.classList.add("done"));

        setTimeout(() => {
          current++;
          if (current >= TOTAL) {
            showEnd();
          } else {
            loadSlide(current);
          }
        }, 900);
      }
    } else {
      tile.classList.add("wrong");
      hintEl.textContent = "❌ ¡Palabra incorrecta! Intenta de nuevo.";
      hintEl.className = "hint wrong";

      setTimeout(() => {
        tile.classList.remove("wrong");
        hintEl.textContent = "☝️ ¡Forma la oración!";
        hintEl.className = "hint";
      }, 700);
    }
  }

  // ── Play button ───────────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      if (playPromise) {
        playPromise.then(() => audio.pause()).catch(() => {});
        playPromise = null;
      } else {
        audio.pause();
      }

      isPlaying = false;
      playBtn.innerHTML = audioPlayed ? "🔁" : "▶";
      playBtn.classList.remove("playing");
      playLabel.textContent = audioPlayed ? "Toca para repetir" : "Toca para escuchar";
      return;
    }

    if (audioPlayed) audio.currentTime = 0;

    isPlaying = true;
    playBtn.innerHTML = "⏸";
    playBtn.classList.add("playing");
    playBtn.classList.remove("replay");
    playLabel.textContent = "Escuchando...";

    playPromise = audio.play();

    if (playPromise) {
      playPromise.then(() => {
        playPromise = null;
      }).catch(err => {
        if (err.name !== "AbortError") {
          isPlaying = false;
          playBtn.classList.remove("playing");
          playBtn.innerHTML = "▶";
          playLabel.textContent = "No se pudo reproducir.";
        }
        playPromise = null;
      });
    }
  });

  // ── End ───────────────────────────────────────────────────────────────────
  function showEnd() {
    slideArea.style.display = "none";
    endScreen.classList.add("show");
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  initOrder();
  loadSlide(0);
})();