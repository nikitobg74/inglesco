// ../../../../js/u2/u2_l6_p4.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/l6/"
  };

  // ===== UI text from HTML (language-neutral JS) =====
  const uiSource = document.getElementById("uiText");
  const d = uiSource?.dataset || {};
  const UI = {
    ready: d.statusReady || "Press Play.",
    playing: d.statusPlaying || "Playing...",
    after: d.statusAfter || "Press Next.",
    done: d.statusDone || "✅ Excellent!",
    blocked: d.audioBlocked || "Audio blocked. Try again.",
    play: d.play || "▶ Play",
    replay: d.replay || "▶ Replay",
    noItems: d.noItems || "No items."
  };

  // ===== lesson data from HTML =====
  const dataEl = document.getElementById("lessonData");
  if (!dataEl) {
    console.error("lessonData not found");
    return;
  }

  let LESSON;
  try {
    LESSON = JSON.parse((dataEl.textContent || "").trim());
  } catch (e) {
    console.error("lessonData JSON invalid:", e);
    return;
  }

  const items = Array.isArray(LESSON.items) ? LESSON.items : [];

  // ===== DOM =====
  const classroomImg = document.getElementById("classroomImg");
  const objImg = document.getElementById("objImg");
  const playBtn = document.getElementById("playBtn");
  const nextWordBtn = document.getElementById("nextWordBtn");
  const statusEl = document.getElementById("status");
  const nowEl = document.getElementById("now");
  const totalEl = document.getElementById("total");
  const nextBtn = document.getElementById("nextBtn");
  const wordEl = document.getElementById("word");

  if (
    !classroomImg ||
    !objImg ||
    !playBtn ||
    !nextWordBtn ||
    !statusEl ||
    !nowEl ||
    !totalEl ||
    !nextBtn ||
    !wordEl
  ) {
    console.error("One or more required DOM elements are missing.");
    return;
  }

  // Progress step navigation
  document.querySelectorAll(".step").forEach(step => {
    step.addEventListener("click", () => {
      const go = step.getAttribute("data-go");
      if (go) window.location.href = go;
    });
  });

  // Classroom image
  if (LESSON.classroomImage) {
    classroomImg.src = CONFIG.IMG_BASE + LESSON.classroomImage;
  }
  classroomImg.alt = "Classroom";

  totalEl.textContent = String(items.length || 0);

  // ===== helpers =====
  const cleanLabelFromFilename = (filename) => {
    if (!filename || typeof filename !== "string") return "";
    const base = filename.split("/").pop().replace(/\.[^.]+$/, ""); // remove extension
    const parts = base.split(".");

    // Try to take the part AFTER "p1/p2/p3/p4" (common pattern: u2.l6.p4.clock)
    const pIndex = parts.findIndex(x => /^p\d+$/i.test(x));
    let labelParts = [];

    if (pIndex >= 0 && pIndex < parts.length - 1) {
      labelParts = parts.slice(pIndex + 1);
    } else {
      // fallback: drop leading u2/l6/etc if present, keep last 1-3 segments
      labelParts = parts.slice(-2);
    }

    const label = labelParts.join(" ").replace(/[-_]+/g, " ").trim();
    return label;
  };

  const getItemLabel = (item) => {
    if (item && typeof item.text === "string" && item.text.trim()) {
      return item.text.trim();
    }
    const fromAudio = cleanLabelFromFilename(item?.audio);
    if (fromAudio) return fromAudio;

    const fromImg = cleanLabelFromFilename(item?.img);
    if (fromImg) return fromImg;

    return "...";
  };

  // ===== Audio =====
  const audio = new Audio();
  audio.preload = "auto";

  const safePlay = async () => {
    try {
      const p = audio.play();
      if (p && typeof p.then === "function") await p;
      return true;
    } catch (e) {
      console.warn("Play blocked or failed:", e);
      return false;
    }
  };

  // ===== State =====
  let idx = 0;
  let hasPlayed = false;

  const disableAll = () => {
    playBtn.disabled = true;
    nextWordBtn.disabled = true;
  };

  const loadItem = () => {
    if (!items.length) {
      statusEl.textContent = UI.noItems;
      wordEl.textContent = "...";
      disableAll();
      return;
    }

    const item = items[idx];
    if (!item) {
      statusEl.textContent = UI.noItems;
      wordEl.textContent = "...";
      disableAll();
      return;
    }

    nowEl.textContent = String(idx + 1);
    hasPlayed = false;

    // Image
    if (item.img) {
      objImg.src = CONFIG.IMG_BASE + item.img;
    } else {
      objImg.removeAttribute("src");
    }
    objImg.alt = "Object";

    // ✅ Word label
    wordEl.textContent = getItemLabel(item);

    // Audio
    if (item.audio) {
      audio.src = CONFIG.AUDIO_BASE + item.audio;
    } else {
      audio.removeAttribute("src");
    }
    audio.currentTime = 0;
    audio.onended = null;

    statusEl.textContent = UI.ready;
    playBtn.textContent = UI.play;

    playBtn.disabled = !item.audio;
    nextWordBtn.disabled = true;
  };

  playBtn.addEventListener("click", async () => {
    const item = items[idx];
    if (!item || !item.audio) return;

    statusEl.textContent = UI.playing;
    playBtn.disabled = true;
    nextWordBtn.disabled = true;

    audio.currentTime = 0;
    audio.onended = null;

    const ok = await safePlay();
    if (!ok) {
      statusEl.textContent = UI.blocked;
      playBtn.disabled = false;
      return;
    }

    audio.onended = () => {
      hasPlayed = true;
      statusEl.textContent = UI.after;
      playBtn.textContent = UI.replay;
      playBtn.disabled = false;
      nextWordBtn.disabled = false;
    };
  });

  nextWordBtn.addEventListener("click", () => {
    if (!hasPlayed) return;

    if (idx >= items.length - 1) {
      statusEl.textContent = UI.done;
      disableAll();
      nextBtn.classList.remove("hidden");
      return;
    }

    idx += 1;
    loadItem();
  });

  // Start
  loadItem();
})();