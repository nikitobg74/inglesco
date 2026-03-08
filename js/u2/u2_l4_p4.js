// u2_l4_p4.js (MATCHES HTML + MATCHES YOUR AUDIO LIST) ✅ COPY / PASTE
(() => {
  const CONFIG = {
    AUDIO_BASE: "../../../../assets/audio/u2/l4/",
    REVEAL_MS: 3000,
    GAP_MS: 650,
  };

  const LOCATIONS = ["bedroom","bathroom","living room","kitchen","basement","attic","garage"];

  // Part A (unchanged from your file)
  const PART_A_ITEMS = [
    { audio: "u2.l4.p4.dial1a.mp3",  subject: "Sofia",   location: "bathroom",    type: "name" },
    { audio: "u2.l4.p4.dial2a.mp3",  subject: "David",   location: "kitchen",     type: "name" },
    { audio: "u2.l4.p4.dial3a.mp3",  subject: "Elena",   location: "garage",      type: "name" },
    { audio: "u2.l4.p4.dial4a.mp3",  subject: "Gabriel", location: "bedroom",     type: "name" },
    { audio: "u2.l4.p4.dial5a.mp3",  subject: "Maria",   location: "basement",    type: "name" },
    { audio: "u2.l4.p4.dial6a.mp3",  subject: "Carlos",  location: "attic",       type: "name" },
    { audio: "u2.l4.p4.dial7a.mp3",  subject: "Pedro",   location: "living room", type: "name" },
    { audio: "u2.l4.p4.dial8a.mp3",  subject: "I",       location: "bathroom",    type: "iam"  },
    { audio: "u2.l4.p4.dial9a.mp3",  subject: "I",       location: "bedroom",     type: "iam"  },
    { audio: "u2.l4.p4.dial10a.mp3", subject: "I",       location: "kitchen",     type: "iam"  },
  ];

  // ✅ Part B MUST match the audio scripts you provided (1–10)
  const PART_B_ITEMS = [
    // 1) Gabriel -> bathroom
    { audio: "u2.l4.p4.dial1.mp3",  subject: "Gabriel", location: "bathroom",    type: "name" },

    // 2) Maria -> kitchen
    { audio: "u2.l4.p4.dial2.mp3",  subject: "Maria",   location: "kitchen",     type: "name" },

    // 3) Pedro -> garage
    { audio: "u2.l4.p4.dial3.mp3",  subject: "Pedro",   location: "garage",      type: "name" },

    // 4) Sofia -> bedroom
    { audio: "u2.l4.p4.dial4.mp3",  subject: "Sofia",   location: "bedroom",     type: "name" },

    // 5) Carlos -> basement
    { audio: "u2.l4.p4.dial5.mp3",  subject: "Carlos",  location: "basement",    type: "name" },

    // 6) Elena -> attic
    { audio: "u2.l4.p4.dial6.mp3",  subject: "Elena",   location: "attic",       type: "name" },

    // 7) David -> living room
    { audio: "u2.l4.p4.dial7.mp3",  subject: "David",   location: "living room", type: "name" },

    // 8) I -> basement
    { audio: "u2.l4.p4.dial8.mp3",  subject: "I",       location: "basement",    type: "iam"  },

    // 9) I -> bedroom
    { audio: "u2.l4.p4.dial9.mp3",  subject: "I",       location: "bedroom",     type: "iam"  },

    // 10) I -> kitchen
    { audio: "u2.l4.p4.dial10.mp3", subject: "I",       location: "kitchen",     type: "iam"  },
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

  // Normalize: "living room" == "livingroom"
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
    if (item.type === "iam" || item.subject === "I") return "I am in the ";
    return `${item.subject} is in the `;
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