// js/u4/u4_l2_p4.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

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

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const SHUFFLED_SLIDES = shuffleArray(SLIDES);

  let current     = 0;
  let audioPlayed = false;
  let answered    = false;
  let isPlaying   = false;
  let playPromise = null;
  let audio       = new Audio();

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

  function loadSlide(idx) {
    const s = SHUFFLED_SLIDES[idx];

    audioPlayed = false;
    answered = false;
    isPlaying = false;
    playPromise = null;

    slideImg.style.opacity = "0";
    slideImg.src = s.image;
    slideImg.onload = () => {
      slideImg.style.opacity = "1";
    };

    counterEl.textContent = `${idx + 1} / ${TOTAL}`;
    progressBar.style.width = ((idx + 1) / TOTAL * 100) + "%";

    renderSentence(s.blank, null);
    buildTiles(s.tiles);

    hintEl.textContent = "";
    hintEl.className = "hint";

    playBtn.innerHTML = "▶";
    playBtn.className = "play-btn";
    playLabel.textContent = "Toca para escuchar";

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
      hintEl.textContent = "☝️ Toca la palabra correcta!";
      hintEl.className = "hint";
    });

    audio.addEventListener("error", () => {
      isPlaying = false;
      audioPlayed = true;
      playBtn.classList.remove("playing");
      playBtn.innerHTML = "▶";
      playLabel.textContent = "Audio no disponible";
      hintEl.textContent = "☝️ Toca la palabra correcta!";
      hintEl.className = "hint";
    });
  }

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

  function buildTiles(words) {
    tilesEl.innerHTML = "";
    const shuffledWords = shuffleArray(words);

    shuffledWords.forEach(word => {
      const tile = document.createElement("button");
      tile.className = "tile";
      tile.textContent = word;
      tile.addEventListener("click", () => handleTile(tile, word));
      tilesEl.appendChild(tile);
    });
  }

  function handleTile(tile, word) {
    if (answered) return;

    if (!audioPlayed) {
      hintEl.textContent = "👂 Escucha el audio primero!";
      hintEl.className = "hint warn";
      playBtn.classList.add("pulse");
      setTimeout(() => playBtn.classList.remove("pulse"), 600);
      return;
    }

    const correct = SHUFFLED_SLIDES[current].answer;

    if (word === correct) {
      answered = true;
      tile.classList.add("correct");
      hintEl.textContent = "✅ ¡Correcto!";
      hintEl.className = "hint correct";
      renderSentence(SHUFFLED_SLIDES[current].blank, word);
      audio.pause();

      setTimeout(() => {
        current++;
        if (current >= TOTAL) {
          showEnd();
        } else {
          loadSlide(current);
        }
      }, 1200);
    } else {
      tile.classList.add("wrong");
      hintEl.textContent = "❌ ¡Intenta otra vez!";
      hintEl.className = "hint wrong";

      setTimeout(() => {
        tile.classList.remove("wrong");
        hintEl.textContent = "☝️ Toca la palabra correcta!";
        hintEl.className = "hint";
      }, 700);
    }
  }

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
      playLabel.textContent = audioPlayed ? "Toca para repetir" : "Toca para escuchar";
      return;
    }

    if (audioPlayed) {
      audio.currentTime = 0;
    }

    isPlaying = true;
    playBtn.innerHTML = "⏸";
    playBtn.classList.add("playing");
    playBtn.classList.remove("replay");
    playLabel.textContent = "Escuchando...";

    playPromise = audio.play();

    if (playPromise) {
      playPromise
        .then(() => {
          playPromise = null;
        })
        .catch(err => {
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

  function showEnd() {
    slideArea.style.display = "none";
    endScreen.classList.add("show");
  }

  loadSlide(0);
})();