(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  // Each entry:
  //   word    — full correct word
  //   blank   — index of the letter to hide (0-based)
  //   options — 3 letter choices (correct first, will be shuffled)
  //   image   — image path
  //   audio   — audio file path
  // blank = index of the hidden letter (0-based)
  // options[0] is always the correct letter
  //
  // mother       m(0) o(1) t(2) h(3) e(4) r(5)        → hide o at 1  → m_ther
  // father       f(0) a(1) t(2) h(3) e(4) r(5)        → hide a at 1  → f_ther
  // son          s(0) o(1) n(2)                        → hide o at 1  → s_n
  // daughter     d(0) a(1) u(2) g(3) h(4) t(5) e(6) r(7) → hide u at 2 → da_ghter
  // wife         w(0) i(1) f(2) e(3)                  → hide i at 1  → w_fe
  // husband      h(0) u(1) s(2) b(3) a(4) n(5) d(6)   → hide a at 4  → husb_nd
  // grandmother  g(0)r(1)a(2)n(3)d(4)m(5)o(6)t(7)h(8)e(9)r(10) → hide o at 6 → grandm_ther
  // grandfather  g(0)r(1)a(2)n(3)d(4)f(5)a(6)t(7)h(8)e(9)r(10) → hide a at 6 → grandf_ther
  // parents      p(0) a(1) r(2) e(3) n(4) t(5) s(6)   → hide e at 3  → par_nts
  // grandparents g(0)r(1)a(2)n(3)d(4)p(5)a(6)r(7)e(8)n(9)t(10)s(11) → hide e at 8 → grandpar_nts

  const WORDS = [
    {
      word:    "mother",
      blank:   1,
      options: ["o","a","u"],
      image:   BASE + "images/u5/u5.she.cooking.dinner.jpg",
      audio:   BASE + "audio/u5/u5.mother.mp3"
    },
    {
      word:    "father",
      blank:   1,
      options: ["a","e","i"],
      image:   BASE + "images/u5/u5.l1.p1.man.painting.jpg",
      audio:   BASE + "audio/u5/u5.father.mp3"
    },
    {
      word:    "son",
      blank:   1,
      options: ["o","a","u"],
      image:   BASE + "images/u5/u5.son.reading.jpg",
      audio:   BASE + "audio/u5/u5.son.mp3"
    },
    {
      word:    "daughter",
      blank:   2,
      options: ["u","a","o"],
      image:   BASE + "images/u5/u5.daughter.english.jpg",
      audio:   BASE + "audio/u5/u5.daughter.mp3"
    },
    {
      word:    "wife",
      blank:   1,
      options: ["i","e","a"],
      image:   BASE + "images/u5/u5.wife.riding.jpg",
      audio:   BASE + "audio/u5/u5.wife.mp3"
    },
    {
      word:    "husband",
      blank:   4,
      options: ["a","e","i"],
      image:   BASE + "images/u5/u5.husband.swim.jpg",
      audio:   BASE + "audio/u5/u5.husband.mp3"
    },
    {
      word:    "grandmother",
      blank:   6,
      options: ["o","a","u"],
      image:   BASE + "images/u5/u5.grandmother.planting.jpg",
      audio:   BASE + "audio/u5/u5.grandmother1.mp3"
    },
    {
      word:    "grandfather",
      blank:   6,
      options: ["a","e","o"],
      image:   BASE + "images/u5/u5.grandfather.jpg",
      audio:   BASE + "audio/u5/u5.grandfather1.mp3"
    },
    {
      word:    "parents",
      blank:   3,
      options: ["e","a","i"],
      image:   BASE + "images/u5/u5.l1.p2.mother.father.jpg",
      audio:   BASE + "audio/u5/u5.parents.mp3"
    },
    {
      word:    "grandparents",
      blank:   8,
      options: ["e","a","i"],
      image:   BASE + "images/u5/u5.grandparents.jpg",
      audio:   BASE + "audio/u5/u5.grandparents.mp3"
    }
  ];

  let wIndex    = 0;
  let wordAudio = null;
  let solved    = false;

  const imgEl      = document.getElementById("lessonImg");
  const audioHint  = document.getElementById("audioHint");
  const wordTiles  = document.getElementById("wordTiles");
  const counter    = document.getElementById("counter");
  const bar        = document.getElementById("progressBar");
  const endScreen  = document.getElementById("endScreen");
  const overlay    = document.getElementById("pickerOverlay");
  const pickerLetters = document.getElementById("pickerLetters");

  // ── Load word ─────────────────────────────────────────────
  function loadWord() {
    solved = false;
    const w = WORDS[wIndex];

    counter.textContent = `${wIndex + 1} / ${WORDS.length}`;
    bar.style.width = ((wIndex + 1) / WORDS.length * 100) + "%";

    imgEl.src = w.image;
    imgEl.alt = w.word;
    audioHint.textContent = "🔊 Toca la imagen para escuchar";
    audioHint.classList.remove("playing");

    if (wordAudio) { wordAudio.pause(); wordAudio = null; }

    renderWordTiles();
  }

  // ── Render letter tiles ───────────────────────────────────
  function renderWordTiles() {
    const w = WORDS[wIndex];
    wordTiles.innerHTML = "";

    w.word.split("").forEach((letter, i) => {
      const tile = document.createElement("div");
      tile.className = "letter-tile";

      if (i === w.blank) {
        tile.classList.add("blank");
        tile.textContent = "_";
        tile.id = "blankTile";
        tile.onclick = openPicker;
      } else {
        tile.textContent = letter.toUpperCase();
      }

      wordTiles.appendChild(tile);
    });
  }

  // ── Play word audio (tap image) ───────────────────────────
  window.playWordAudio = function () {
    const w = WORDS[wIndex];
    if (wordAudio) { wordAudio.pause(); wordAudio = null; }
    audioHint.textContent = "🔊 Escuchando...";
    audioHint.classList.add("playing");
    wordAudio = new Audio(w.audio);
    wordAudio.play().catch(() => {});
    wordAudio.addEventListener("ended", () => {
      audioHint.textContent = "🔊 Toca la imagen para escuchar";
      audioHint.classList.remove("playing");
    });
  };

  // ── Open letter picker ────────────────────────────────────
  function openPicker() {
    if (solved) return;
    const w = WORDS[wIndex];

    // Mark blank as active
    const blankTile = document.getElementById("blankTile");
    if (blankTile) blankTile.classList.add("active");

    // Build shuffled letter buttons
    const opts = [...w.options];
    shuffle(opts);
    pickerLetters.innerHTML = "";
    opts.forEach(letter => {
      const btn = document.createElement("button");
      btn.className = "picker-letter";
      btn.textContent = letter.toUpperCase();
      btn.onclick = () => selectLetter(letter);
      pickerLetters.appendChild(btn);
    });

    overlay.classList.add("show");
  }

  // ── Close picker ──────────────────────────────────────────
  window.closePicker = function () {
    overlay.classList.remove("show");
    const blankTile = document.getElementById("blankTile");
    if (blankTile) blankTile.classList.remove("active");
  };

  // Close picker if tapping overlay background
  overlay.addEventListener("click", e => {
    if (e.target === overlay) window.closePicker();
  });

  // ── Select a letter ───────────────────────────────────────
  function selectLetter(letter) {
    overlay.classList.remove("show");
    const w = WORDS[wIndex];
    const blankTile = document.getElementById("blankTile");
    if (!blankTile) return;

    blankTile.classList.remove("active");

    if (letter === w.options[0]) {
      // Correct — options[0] is always the correct letter
      solved = true;
      blankTile.textContent = letter.toUpperCase();
      blankTile.classList.remove("blank");
      blankTile.classList.add("correct");
      blankTile.onclick = null;
      setTimeout(advance, 1000);
    } else {
      // Wrong — shake red then reset
      blankTile.classList.add("error");
      setTimeout(() => {
        blankTile.classList.remove("error");
        blankTile.textContent = "_";
      }, 500);
    }
  }

  // ── Advance to next word ──────────────────────────────────
  function advance() {
    wIndex++;
    if (wIndex >= WORDS.length) {
      // Mark lesson complete
      if (typeof markLessonComplete === "function") {
        markLessonComplete("u5-l2");
      }
      document.querySelector(".card").style.display = "none";
      endScreen.style.display = "block";
      return;
    }
    loadWord();
  }

  // ── Shuffle helper ────────────────────────────────────────
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  // ── Init — shuffle words then start ──────────────────────
  // Shuffle while keeping options[0] as correct answer
  shuffle(WORDS);
  loadWord();
})();