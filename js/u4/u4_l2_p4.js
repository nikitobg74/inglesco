// js/u4/u4_l2_p4.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // ── Slides ────────────────────────────────────────────────────────────────
  // tiles: the two word choices shown
  // blank: the sentence with ___ placeholder
  // answer: correct tile word
  const SLIDES = [
    {
      image:  IMG + "u4.l2.p1.new.car.jpg",
      audio:  AUD + "u4.l2.p4.new.car.mp3",
      blank:  "My ___ car.",
      tiles:  ["new", "old"],
      answer: "new",
    },
    {
      image:  IMG + "u4.l2.p1.old.car.jpg",
      audio:  AUD + "u4.l2.p4.old.car.mp3",
      blank:  "My ___ car.",
      tiles:  ["new", "old"],
      answer: "old",
    },
    {
      image:  IMG + "u4.l2.p1.modern.house.jpg",
      audio:  AUD + "u4.l2.p4.modern.house.mp3",
      blank:  "My ___ house.",
      tiles:  ["modern", "old"],
      answer: "modern",
    },
    {
      image:  IMG + "u4.l2.p1.old.house.jpg",
      audio:  AUD + "u4.l2.p4.old.house.mp3",
      blank:  "My ___ house.",
      tiles:  ["modern", "old"],
      answer: "old",
    },
    {
      image:  IMG + "u4.l2.p4.expensive.phone.jpg",
      audio:  AUD + "u4.l2.p4.expensive.phone.mp3",
      blank:  "My ___ phone.",
      tiles:  ["expensive", "cheap"],
      answer: "expensive",
    },
    {
      image:  IMG + "u4.l2.p4.cheap.phone.jpg",
      audio:  AUD + "u4.l2.p4.cheap.phone.mp3",
      blank:  "My ___ phone.",
      tiles:  ["expensive", "cheap"],
      answer: "cheap",
    },
    {
      image:  IMG + "u4.l2.p1.expensive.watch.jpg",
      audio:  AUD + "u4.l2.p4.expensive.watch.mp3",
      blank:  "My ___ watch.",
      tiles:  ["expensive", "cheap"],
      answer: "expensive",
    },
    {
      image:  IMG + "u4.l2.p1.cheap.watch.jpg",
      audio:  AUD + "u4.l2.p4.cheap.watch.mp3",
      blank:  "My ___ watch.",
      tiles:  ["expensive", "cheap"],
      answer: "cheap",
    },
    {
      image:  IMG + "u4.l2.p4.fast.car.jpg",
      audio:  AUD + "u4.l2.p4.fast.car.mp3",
      blank:  "My ___ car.",
      tiles:  ["fast", "slow"],
      answer: "fast",
    },
    {
      image:  IMG + "u4.l2.p4.slow.car.jpg",
      audio:  AUD + "u4.l2.p4.slow.car.mp3",
      blank:  "My ___ car.",
      tiles:  ["fast", "slow"],
      answer: "slow",
    },
    {
      image:  IMG + "u4.l2.p1.big.house.jpg",
      audio:  AUD + "u4.l2.p4.big.house.mp3",
      blank:  "My ___ house.",
      tiles:  ["big", "small"],
      answer: "big",
    },
    {
      image:  IMG + "u4.l2.p4.small.house.jpg",
      audio:  AUD + "u4.l2.p4.small.house.mp3",
      blank:  "My ___ house.",
      tiles:  ["big", "small"],
      answer: "small",
    },
  ];

  const TOTAL = SLIDES.length;

  // ── State ─────────────────────────────────────────────────────────────────
  let current     = 0;
  let audioPlayed = false;
  let answered    = false;
  let isPlaying   = false;
  let playPromise = null;
  let audio       = new Audio();

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const slideImg    = document.getElementById("slideImg");
  const sentenceEl  = document.getElementById("sentence");
  const tilesEl     = document.getElementById("tiles");
  const hintEl      = document.getElementById("hint");
  const playBtn     = document.getElementById("playBtn");
  const playLabel   = document.getElementById("playLabel");
  const counterEl   = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const endScreen   = document.getElementById("endScreen");
  const slideArea   = document.getElementById("slideArea");

  // ── Load slide ────────────────────────────────────────────────────────────
  function loadSlide(idx) {
    const s     = SLIDES[idx];
    audioPlayed = false;
    answered    = false;
    isPlaying   = false;

    // image
    slideImg.style.opacity = "0";
    slideImg.src = s.image;
    slideImg.onload = () => { slideImg.style.opacity = "1"; };

    // counter & bar
    counterEl.textContent   = `${idx + 1} / ${TOTAL}`;
    progressBar.style.width = ((idx + 1) / TOTAL * 100) + "%";

    // sentence — show blank
    renderSentence(s.blank, null);

    // tiles
    buildTiles(s.tiles);

    // hint
    hintEl.textContent = "👂 Escucha primero y luego toca la palabra correcta.";
    hintEl.className   = "hint";

    // reset play button
    playBtn.innerHTML     = "▶";
    playBtn.className     = "play-btn";
    playLabel.textContent = "Toca para escuchar";

    // audio
    audio.pause();
    audio = new Audio(s.audio);
    audio.preload = "auto";

    audio.addEventListener("ended", () => {
      isPlaying   = false;
      audioPlayed = true;
      playBtn.innerHTML     = "🔁";
      playBtn.classList.remove("playing");
      playBtn.classList.add("replay");
      playLabel.textContent = "Toca para repetir";
      hintEl.textContent    = "☝️ Toca la palabra correcta!";
    });

    audio.addEventListener("error", () => {
      isPlaying   = false;
      audioPlayed = true;
      playLabel.textContent = "Audio no disponible";
      hintEl.textContent    = "☝️ Toca la palabra correcta!";
    });
  }

  // ── Render sentence with blank or filled word ─────────────────────────────
  function renderSentence(template, filledWord) {
    if (!filledWord) {
      sentenceEl.innerHTML = template.replace(
        "___",
        `<span class="blank">___</span>`
      );
    } else {
      sentenceEl.innerHTML = template.replace(
        "___",
        `<span class="filled">${filledWord}</span>`
      );
    }
  }

  // ── Build word tiles ──────────────────────────────────────────────────────
  function buildTiles(words) {
    tilesEl.innerHTML = "";
    // shuffle so correct is not always first
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    shuffled.forEach(word => {
      const tile = document.createElement("button");
      tile.className   = "tile";
      tile.textContent = word;
      tile.addEventListener("click", () => handleTile(tile, word));
      tilesEl.appendChild(tile);
    });
  }

  // ── Tile click ────────────────────────────────────────────────────────────
  function handleTile(tile, word) {
    if (answered) return;

    if (!audioPlayed) {
      hintEl.textContent = "👂 Escucha el audio primero!";
      hintEl.className   = "hint warn";
      playBtn.classList.add("pulse");
      setTimeout(() => playBtn.classList.remove("pulse"), 600);
      return;
    }

    const correct = SLIDES[current].answer;

    if (word === correct) {
      answered = true;
      tile.classList.add("correct");
      hintEl.textContent = "✅ Correct!";
      hintEl.className   = "hint correct";
      renderSentence(SLIDES[current].blank, word);
      audio.pause();

      setTimeout(() => {
        current++;
        if (current >= TOTAL) {
          showEnd();
        } else {
          loadSlide(current);
        }
      }, 1500);

    } else {
      tile.classList.add("wrong");
      hintEl.textContent = "❌ Intentar otra vez!";
      hintEl.className   = "hint wrong";
      setTimeout(() => {
        tile.classList.remove("wrong");
        hintEl.textContent = "☝️ Toca la palabra correcta!";
        hintEl.className   = "hint";
      }, 700);
    }
  }

  // ── Play button ───────────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    if (answered) return;

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
      playLabel.textContent = "Toca para continuar";
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
      playPromise.then(() => { playPromise = null; }).catch(err => {
        if (err.name !== "AbortError") {
          isPlaying = false;
          playBtn.classList.remove("playing");
          playBtn.innerHTML     = "▶";
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
  loadSlide(0);

})();
