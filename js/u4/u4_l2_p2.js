// js/u4/u4_l2_p2.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // ── Rounds ────────────────────────────────────────────────────────────────
  // Each round: play audio, pick the correct image from two choices
  const ROUNDS = [
    {
      audio:   AUD + "u4.l2.p1.modern.house.mp3",
      choices: [
        { image: IMG + "u4.l2.p1.modern.house.jpg", label: "modern house",  correct: true  },
        { image: IMG + "u4.l2.p1.old.house.jpg",    label: "old house",     correct: false },
      ],
    },
    {
      audio:   AUD + "u4.l2.p1.old.car.mp3",
      choices: [
        { image: IMG + "u4.l2.p1.new.car.jpg", label: "new car",  correct: false },
        { image: IMG + "u4.l2.p1.old.car.jpg", label: "old car",  correct: true  },
      ],
    },
    {
      audio:   AUD + "u4.l2.p1.new.phone.mp3",
      choices: [
        { image: IMG + "u4.l2.p1.new.phone.jpg", label: "new phone",  correct: true  },
        { image: IMG + "u4.l2.p1.old.phone.jpg", label: "old phone",  correct: false },
      ],
    },
    {
      audio:   AUD + "u4.l2.p1.cheap.watch.mp3",
      choices: [
        { image: IMG + "u4.l2.p1.expensive.watch.jpg", label: "expensive watch", correct: false },
        { image: IMG + "u4.l2.p1.cheap.watch.jpg",     label: "cheap watch",     correct: true  },
      ],
    },
    {
      audio:   AUD + "u4.l2.p1.expensive.car.mp3",
      choices: [
        { image: IMG + "u4.l2.p1.expensive.car.jpg", label: "expensive car", correct: true  },
        { image: IMG + "u4.l2.p1.cheap.car.jpg",     label: "cheap car",     correct: false },
      ],
    },
    {
      audio:   AUD + "u4.l2.p1.new.car.mp3",
      choices: [
        { image: IMG + "u4.l2.p1.old.car.jpg",       label: "old car",  correct: false },
        { image: IMG + "u4.l2.p1.new.car.jpg",        label: "new car",  correct: true  },
      ],
    },
  ];

  const TOTAL = ROUNDS.length;

  // ── State ─────────────────────────────────────────────────────────────────
  let current     = 0;
  let audioPlayed = false;
  let answered    = false;
  let isPlaying   = false;
  let playPromise = null;
  let audio       = new Audio();

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const counterEl   = document.getElementById("counter");
  const progressBar = document.getElementById("progressBar");
  const playBtn     = document.getElementById("playBtn");
  const playLabel   = document.getElementById("playLabel");
  const choicesEl   = document.getElementById("choices");
  const hintEl      = document.getElementById("hint");
  const endScreen   = document.getElementById("endScreen");
  const slideArea   = document.getElementById("slideArea");

  // ── Load a round ──────────────────────────────────────────────────────────
  function loadRound(idx) {
    const round = ROUNDS[idx];
    audioPlayed = false;
    answered    = false;
    isPlaying   = false;

    // counter & bar
    counterEl.textContent    = `${idx + 1} / ${TOTAL}`;
    progressBar.style.width  = ((idx + 1) / TOTAL * 100) + "%";

    // reset play button
    playBtn.innerHTML        = "▶";
    playBtn.className        = "play-btn";
    playLabel.textContent    = "Toca para escuchar";
    hintEl.textContent       = "👂 Listen first, then pick the correct image.";
    hintEl.className         = "hint";

    // build choices
    choicesEl.innerHTML = "";

    // shuffle so correct is not always same side
    const shuffled = [...round.choices].sort(() => Math.random() - 0.5);

    shuffled.forEach(choice => {
      const card = document.createElement("div");
      card.className = "choice-card";

      const img = document.createElement("img");
      img.src = choice.image;
      img.alt = choice.label;

      const lbl = document.createElement("span");
      lbl.className   = "choice-label";
      lbl.textContent = choice.label;

      card.appendChild(img);
      card.appendChild(lbl);

      card.addEventListener("click", () => handlePick(card, choice.correct));
      choicesEl.appendChild(card);
    });

    // audio
    audio.pause();
    audio = new Audio(round.audio);
    audio.preload = "auto";

    audio.addEventListener("ended", () => {
      isPlaying   = false;
      audioPlayed = true;
      playBtn.innerHTML     = "▶";
      playBtn.classList.remove("playing");
      playBtn.classList.add("done");
      playLabel.textContent = "¡Escuchado! — Now pick the image.";
      hintEl.textContent    = "☝️ Tap the correct image!";
    });

    audio.addEventListener("error", () => {
      isPlaying   = false;
      audioPlayed = true;
      playLabel.textContent = "Audio no disponible";
      hintEl.textContent    = "☝️ Tap the correct image!";
    });
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
      playBtn.innerHTML     = "▶";
      playBtn.classList.remove("playing");
      playLabel.textContent = "Toca ▶ para continuar";
      return;
    }

    if (audioPlayed) audio.currentTime = 0;

    isPlaying = true;
    playBtn.innerHTML = "⏸";
    playBtn.classList.add("playing");
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

  // ── Pick handler ──────────────────────────────────────────────────────────
  function handlePick(card, correct) {
    if (answered) return;
    if (!audioPlayed) {
      hintEl.textContent  = "👂 Listen to the audio first!";
      hintEl.className    = "hint warn";
      playBtn.classList.add("pulse");
      setTimeout(() => playBtn.classList.remove("pulse"), 600);
      return;
    }

    answered = true;
    audio.pause();

    if (correct) {
      card.classList.add("correct");
      hintEl.textContent = "✅ Correct!";
      hintEl.className   = "hint correct";
      setTimeout(() => {
        current++;
        if (current >= TOTAL) {
          showEnd();
        } else {
          loadRound(current);
        }
      }, 1200);
    } else {
      card.classList.add("wrong");
      hintEl.textContent = "❌ Try again!";
      hintEl.className   = "hint wrong";
      setTimeout(() => {
        card.classList.remove("wrong");
        hintEl.textContent = "☝️ Try again — tap the correct image!";
        hintEl.className   = "hint";
        answered = false;
      }, 800);
    }
  }

  // ── End ───────────────────────────────────────────────────────────────────
  function showEnd() {
    slideArea.style.display = "none";
    endScreen.classList.add("show");
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  loadRound(0);

})();
