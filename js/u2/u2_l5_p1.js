// u2_l5_p1.js (MATCHES p1.html + YOUR L5 AUDIO LIST) ✅ COPY / PASTE
(() => {
  const CONFIG = {
    AUDIO_BASE: "../../../../assets/audio/u2/l5/",
    REVEAL_MS: 3000,
    GAP_MS: 650,
  };

  // Word bank locations for this lesson
  const LOCATIONS = [
    "restaurant",
    "bank",
    "hospital",
    "supermarket",
    "library",
    "park",
    "zoo",
    "post office",
    "movie theater",
    "office",
  ];

  // Part A (dial#a.mp3)
  const PART_A_ITEMS = [
    { audio: "u2.l5.p1.dial1a.mp3",  subject: "Pam",    location: "restaurant",    type: "name" },
    { audio: "u2.l5.p1.dial2a.mp3",  subject: "Brian",  location: "bank",          type: "name" },
    { audio: "u2.l5.p1.dial3a.mp3",  subject: "Martha", location: "hospital",      type: "name" },
    { audio: "u2.l5.p1.dial4a.mp3",  subject: "Fred",   location: "supermarket",   type: "name" },
    { audio: "u2.l5.p1.dial5a.mp3",  subject: "Maria",  location: "library",       type: "name" },
    { audio: "u2.l5.p1.dial6a.mp3",  subject: "Henry",  location: "park",          type: "name" },
    { audio: "u2.l5.p1.dial7a.mp3",  subject: "Tom",    location: "zoo",           type: "name" },
    { audio: "u2.l5.p1.dial8a.mp3",  subject: "I",      location: "post office",   type: "iam"  },
    { audio: "u2.l5.p1.dial9a.mp3",  subject: "I",      location: "movie theater", type: "iam"  },
    { audio: "u2.l5.p1.dial10a.mp3", subject: "I",      location: "office",        type: "iam"  },
  ];

  // Part B (dial#b.mp3)
  const PART_B_ITEMS = [
    { audio: "u2.l5.p1.dial1b.mp3",  subject: "Michael", location: "restaurant",    type: "name" },
    { audio: "u2.l5.p1.dial2b.mp3",  subject: "Emily",   location: "bank",          type: "name" },
    { audio: "u2.l5.p1.dial3b.mp3",  subject: "Jason",   location: "hospital",      type: "name" },
    { audio: "u2.l5.p1.dial4b.mp3",  subject: "Olivia",  location: "supermarket",   type: "name" },
    { audio: "u2.l5.p1.dial5b.mp3",  subject: "Jim",     location: "library",       type: "name" },
    { audio: "u2.l5.p1.dial6b.mp3",  subject: "Jane",    location: "park",          type: "name" },
    { audio: "u2.l5.p1.dial7b.mp3",  subject: "Tim",     location: "zoo",           type: "name" },
    { audio: "u2.l5.p1.dial8b.mp3",  subject: "I",       location: "post office",   type: "iam"  },
    { audio: "u2.l5.p1.dial9b.mp3",  subject: "I",       location: "movie theater", type: "iam"  },
    // Audio script says: "Where is Greg? He is at the office."
    // We keep the NAME visible on screen, so learners see "Greg is at the ..."
    { audio: "u2.l5.p1.dial10b.mp3", subject: "Greg",    location: "office",        type: "name" },
  ];

  const $ = (id) => document.getElementById(id);

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Normalize: ignore spaces/punct (movie theater == movietheater)
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z]/g, "");

  const renderBank = (el) => {
    el.innerHTML = "";
    LOCATIONS.forEach(loc => {
      const d = document.createElement("div");
      d.className = "pill";
      d.textContent = loc;
      el.appendChild(d);
    });
  };

  const gotoStepClicks = () => {
    document.querySelectorAll(".step").forEach(step => {
      step.addEventListener("click", () => {
        const page = step.getAttribute("data-page");
        if (page) window.location.href = page;
      });
    });
  };

  function createAudioPlayer() {
    const audio = new Audio();
    audio.preload = "auto";
    return audio;
  }

  function buildSentence(item) {
    if (item.type === "iam" || item.subject === "I") return "I am at the ";
    return `${item.subject} is at the `;
  }

  function setupPart({
    items,
    counterEl,
    statusEl,
    playBtn,
    promptEl,
    inputEl,
    checkBtn,
    markEl,
    bankEl,
    onComplete,
  }) {
    const audio = createAudioPlayer();
    let list = shuffle(items);
    let idx = 0;
    let unlocked = false;

    function setCounter() {
      counterEl.textContent = `${idx + 1} / ${list.length}`;
    }

    function resetUIForNewItem() {
      unlocked = false;
      inputEl.value = "";
      inputEl.disabled = true;
      checkBtn.disabled = true;
      playBtn.disabled = false;

      markEl.textContent = "";
      markEl.className = "mark";

      statusEl.textContent = "Play ▶";
      setCounter();

      const item = list[idx];
      promptEl.textContent = buildSentence(item);
      audio.src = CONFIG.AUDIO_BASE + item.audio;
    }

    function unlockInput() {
      unlocked = true;
      inputEl.disabled = false;
      checkBtn.disabled = false;
      statusEl.textContent = "Escribe el lugar y pulsa Revisar.";
      setTimeout(() => inputEl.focus(), 80);
    }

    function setMark(ok) {
      if (ok) {
        markEl.textContent = "✓";
        markEl.className = "mark ok";
      } else {
        markEl.textContent = "✗";
        markEl.className = "mark bad";
      }
    }

    function checkAnswer() {
      if (!unlocked) return;

      const item = list[idx];
      const ok = norm(inputEl.value) === norm(item.location);
      setMark(ok);

      if (ok) {
        statusEl.textContent = "¡Correcto! Siguiente…";
        setTimeout(() => {
          idx++;
          if (idx >= list.length) {
            statusEl.textContent = "¡Listo!";
            playBtn.disabled = true;
            inputEl.disabled = true;
            checkBtn.disabled = true;
            if (typeof onComplete === "function") onComplete();
            return;
          }
          resetUIForNewItem();
        }, CONFIG.GAP_MS);
      } else {
        statusEl.textContent = "Intenta otra vez (puedes escuchar otra vez).";
        setTimeout(() => inputEl.focus(), 80);
      }
    }

    playBtn.addEventListener("click", async () => {
      try {
        playBtn.disabled = true;
        statusEl.textContent = "Playing…";
        audio.currentTime = 0;
        await audio.play();
      } catch (e) {
        playBtn.disabled = false;
        statusEl.textContent = "No se pudo reproducir el audio. Intenta otra vez.";
      }
    });

    audio.addEventListener("ended", () => {
      playBtn.disabled = false;
      unlockInput();
    });

    checkBtn.addEventListener("click", checkAnswer);
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") checkAnswer();
    });

    renderBank(bankEl);
    resetUIForNewItem();

    return {
      reset: () => {
        idx = 0;
        list = shuffle(items);
        resetUIForNewItem();
      }
    };
  }

  function setupReveal() {
    const bankB = $("bankB");
    const revealBtn = $("revealBtn");
    let t = null;

    const mask = () => bankB.classList.add("masked");
    const unmask = () => bankB.classList.remove("masked");

    const revealForAWhile = () => {
      unmask();
      revealBtn.disabled = true;
      revealBtn.textContent = "Mostrando…";
      if (t) clearTimeout(t);

      t = setTimeout(() => {
        mask();
        revealBtn.disabled = false;
        revealBtn.textContent = "Mostrar palabras (3s)";
      }, CONFIG.REVEAL_MS);
    };

    revealBtn.addEventListener("click", revealForAWhile);

    $("inputB").addEventListener("focus", () => {
      if (!bankB.classList.contains("masked")) {
        mask();
        revealBtn.disabled = false;
        revealBtn.textContent = "Mostrar palabras (3s)";
        if (t) clearTimeout(t);
      }
    });

    mask();
  }

  function init() {
    gotoStepClicks();

    const toPartBBtn = $("toPartB");
    const partAWrap = $("partA");
    const partBWrap = $("partB");

    const greatA = $("greatA");
    const greatB = $("greatB");
    const nextBtn = $("nextBtn");

    // Part A
    setupPart({
      items: PART_A_ITEMS,
      counterEl: $("counterA"),
      statusEl: $("statusA"),
      playBtn: $("playA"),
      promptEl: $("promptA"),
      inputEl: $("inputA"),
      checkBtn: $("checkA"),
      markEl: $("markA"),
      bankEl: $("bankA"),
      onComplete: () => {
        greatA.classList.remove("hidden");
        toPartBBtn.classList.remove("hidden");
      }
    });

    // Part B (initialized now but hidden until user clicks)
    const partBEngine = setupPart({
      items: PART_B_ITEMS,
      counterEl: $("counterB"),
      statusEl: $("statusB"),
      playBtn: $("playB"),
      promptEl: $("promptB"),
      inputEl: $("inputB"),
      checkBtn: $("checkB"),
      markEl: $("markB"),
      bankEl: $("bankB"),
      onComplete: () => {
        greatB.classList.remove("hidden");
        nextBtn.classList.remove("hidden");
      }
    });

    // Switch to Part B
    toPartBBtn.addEventListener("click", () => {
      partAWrap.classList.add("hidden");
      partBWrap.classList.remove("hidden");

      setupReveal();
      partBEngine.reset();

      setTimeout(() => {
        partBWrap.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();