// u2_l5_p1.js — tap-to-select, 3 tiles at a time ✅
(() => {
  const CONFIG = {
    AUDIO_BASE: "../../../../assets/audio/u2/l5/",
    REVEAL_MS: 3000,
    GAP_MS: 700,
    TILES: 3,          // how many tiles to show at once
  };

  const LOCATIONS = [
    "restaurant", "bank", "hospital", "supermarket",
    "library", "park", "zoo", "post office",
    "movie theater", "office",
  ];

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

  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z]/g, "");

  /** Pick `count` items: always include `correct`, fill rest with random others */
  function pickTiles(correct, count) {
    const others = LOCATIONS.filter(l => norm(l) !== norm(correct));
    const picks = shuffle(others).slice(0, count - 1);
    return shuffle([correct, ...picks]);
  }

  function buildSentence(item) {
    if (item.type === "iam" || item.subject === "I") return "I am at the ";
    return `${item.subject} is at the `;
  }

  const gotoStepClicks = () => {
    document.querySelectorAll(".step").forEach(step => {
      step.addEventListener("click", () => {
        const page = step.getAttribute("data-page");
        if (page) window.location.href = page;
      });
    });
  };

  function setupPart({
    items,
    counterEl,
    statusEl,
    playBtn,
    promptEl,
    slotEl,
    bankEl,
    msgEl,
    onComplete,
  }) {
    const audio = new Audio();
    audio.preload = "auto";

    let list = shuffle(items);
    let idx = 0;
    let canTap = false;   // tiles only active after audio plays

    function setCounter() {
      counterEl.textContent = `${idx + 1} / ${list.length}`;
    }

    function renderTiles(item) {
      bankEl.innerHTML = "";
      const tiles = pickTiles(item.location, CONFIG.TILES);

      tiles.forEach(loc => {
        const btn = document.createElement("button");
        btn.className = "tile locked";   // locked until audio plays
        btn.textContent = loc;
        btn.setAttribute("data-loc", loc);
        btn.addEventListener("click", () => handleTap(btn, item));
        bankEl.appendChild(btn);
      });
    }

    function unlockTiles() {
      bankEl.querySelectorAll(".tile").forEach(t => t.classList.remove("locked"));
      canTap = true;
    }

    function handleTap(btn, item) {
      if (!canTap) return;
      const chosen = btn.getAttribute("data-loc");

      if (norm(chosen) === norm(item.location)) {
        // ✅ Correct
        canTap = false;
        btn.classList.add("correct");
        slotEl.textContent = item.location;
        slotEl.classList.add("correct");
        msgEl.textContent = "¡Correcto! 🎉";

        // Lock all other tiles
        bankEl.querySelectorAll(".tile").forEach(t => {
          if (t !== btn) t.classList.add("locked");
        });

        setTimeout(() => {
          idx++;
          if (idx >= list.length) {
            statusEl.textContent = "¡Listo!";
            playBtn.disabled = true;
            if (typeof onComplete === "function") onComplete();
            return;
          }
          resetUIForNewItem();
        }, CONFIG.GAP_MS);

      } else {
        // ✗ Wrong — shake then return to normal
        btn.classList.add("wrong", "locked");
        msgEl.textContent = "Intenta otra vez 🔁";

        setTimeout(() => {
          btn.classList.remove("wrong", "locked");
          msgEl.textContent = "";
        }, 600);
      }
    }

    function resetUIForNewItem() {
      canTap = false;
      playBtn.disabled = false;
      msgEl.textContent = "";
      statusEl.textContent = "Pulsa ▶ para escuchar";
      setCounter();

      const item = list[idx];
      promptEl.textContent = buildSentence(item);
      slotEl.textContent = "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0";
      slotEl.classList.remove("correct");

      audio.src = CONFIG.AUDIO_BASE + item.audio;
      renderTiles(item);
    }

    playBtn.addEventListener("click", async () => {
      try {
        playBtn.disabled = true;
        statusEl.textContent = "Reproduciendo…";
        audio.currentTime = 0;
        await audio.play();
      } catch (e) {
        playBtn.disabled = false;
        statusEl.textContent = "No se pudo reproducir. Intenta otra vez.";
      }
    });

    audio.addEventListener("ended", () => {
      playBtn.disabled = false;
      statusEl.textContent = "Toca el lugar correcto 👆";
      unlockTiles();
    });

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

    const mask   = () => bankB.classList.add("masked");
    const unmask = () => bankB.classList.remove("masked");

    revealBtn.addEventListener("click", () => {
      unmask();
      revealBtn.disabled = true;
      revealBtn.textContent = "Mostrando…";
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        mask();
        revealBtn.disabled = false;
        revealBtn.textContent = "Mostrar palabras (3s)";
      }, CONFIG.REVEAL_MS);
    });

    mask();
  }

  function init() {
    gotoStepClicks();

    const toPartBBtn = $("toPartB");
    const partAWrap  = $("partA");
    const partBWrap  = $("partB");
    const greatA     = $("greatA");
    const greatB     = $("greatB");
    const nextBtn    = $("nextBtn");

    // Part A
    setupPart({
      items:     PART_A_ITEMS,
      counterEl: $("counterA"),
      statusEl:  $("statusA"),
      playBtn:   $("playA"),
      promptEl:  $("promptA"),
      slotEl:    $("slotA"),
      bankEl:    $("bankA"),
      msgEl:     $("msgA"),
      onComplete: () => {
        greatA.classList.remove("hidden");
        toPartBBtn.classList.remove("hidden");
      }
    });

    // Part B
    const partBEngine = setupPart({
      items:     PART_B_ITEMS,
      counterEl: $("counterB"),
      statusEl:  $("statusB"),
      playBtn:   $("playB"),
      promptEl:  $("promptB"),
      slotEl:    $("slotB"),
      bankEl:    $("bankB"),
      msgEl:     $("msgB"),
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
