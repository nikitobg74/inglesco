// u2/l2/u2_l2_p1.js
// ✅ Language-neutral engine: no UI strings hardcoded.
// ✅ Plays Q then (0.3s) A after correct check.
// ✅ After final exercise: show "Continuar" button -> goes to p2.html (configurable)

(function () {
  const CFG = window.P1_CONFIG;
  if (!CFG) {
    console.error("P1_CONFIG is missing. Define window.P1_CONFIG before loading this JS.");
    return;
  }

  // -----------------------------
  // Helpers
  // -----------------------------
  function $(id) { return document.getElementById(id); }

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function roomWord(display) {
    const mode = CFG.targets?.roomWordTransform || "none";
    if (mode === "lowercase") return String(display).toLowerCase();
    return String(display);
  }

  function chooseMsg(list, fallback = "") {
    if (!Array.isArray(list) || list.length === 0) return fallback;
    return list[Math.floor(Math.random() * list.length)];
  }

  // ✅ safe path join (handles base with/without trailing slash)
  function joinPath(base, file) {
    const b = String(base || "");
    const f = String(file || "");
    if (!b) return f;
    if (!f) return b;
    if (b.endsWith("/") && f.startsWith("/")) return b + f.slice(1);
    if (!b.endsWith("/") && !f.startsWith("/")) return b + "/" + f;
    return b + f;
  }

  function playAudioAndWait(url) {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(url);
        audio.addEventListener("ended", () => resolve(), { once: true });
        audio.addEventListener("error", () => resolve(), { once: true });
        audio.play().catch(() => resolve());
      } catch (e) {
        resolve();
      }
    });
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function goToNextPage() {
    const target = CFG.nextPage || "p2.html";
    window.location.href = target;
  }

  // -----------------------------
  // DOM
  // -----------------------------
  const roomImg = $("roomImg");

  const counterPill = $("counterPill");
  const feedbackEl = $("feedback");

  const qSlotsEl = $("qSlots");
  const qBankEl = $("qBank");
  const aSlotsEl = $("aSlots");
  const aBankEl = $("aBank");

  const resetQBtn = $("resetQBtn");
  const resetABtn = $("resetABtn");

  const shuffleBtn = $("shuffleBtn");
  const checkBtn = $("checkBtn");
  const nextBtn = $("nextBtn"); // used for "Siguiente" during exercises, and "Continuar" at the end.

  const UI = CFG.ui || {};
  const BTN = UI.buttons || {};
  const FB = UI.feedback || {};

  // Apply configurable button texts
  if (resetQBtn) resetQBtn.textContent = BTN.reset || resetQBtn.textContent;
  if (resetABtn) resetABtn.textContent = BTN.reset || resetABtn.textContent;
  if (shuffleBtn) shuffleBtn.textContent = BTN.shuffle || shuffleBtn.textContent;
  if (checkBtn) checkBtn.textContent = BTN.check || checkBtn.textContent;
  if (nextBtn) nextBtn.textContent = BTN.next || nextBtn.textContent;

  // -----------------------------
  // State
  // -----------------------------
  let exerciseIndex = 0;
  const totalExercises = Number(CFG.totalExercises || 4);

  let currentRoom = null;

  const questionTarget = (CFG.targets?.question || []).slice();
  const answerPrefix = (CFG.targets?.answerPrefix || []).slice();
  let answerTarget = [];

  let qSlotsState = [];
  let aSlotsState = [];

  let courseCompleted = false;
  let exerciseSolved = false;
  let isPlaying = false;

  // Drag state
  let draggedWord = null;

  // -----------------------------
  // UI helpers
  // -----------------------------
  function setFeedback(text, good) {
    if (!feedbackEl) return;
    feedbackEl.textContent = text;
    feedbackEl.className = "feedback " + (good ? "good" : "bad");
  }

  function setCounter(current, total) {
    const fmt = UI.counterFormat;
    if (typeof fmt === "function") counterPill.textContent = fmt(current, total);
    else counterPill.textContent = `${current}/${total}`;
  }

  function setBuilderStyle(builderEl, locked) {
    if (!builderEl) return;
    builderEl.style.border = locked ? "2px solid #16a34a" : "1px dashed #93c5fd";
    builderEl.style.background = locked ? "#ecfdf5" : "#ffffff";
  }

  function lockAll(locked) {
    const qBuilder = $("qBuilder");
    const aBuilder = $("aBuilder");

    if (qSlotsEl) qSlotsEl.style.pointerEvents = locked ? "none" : "auto";
    if (qBankEl) qBankEl.style.pointerEvents = locked ? "none" : "auto";
    if (aSlotsEl) aSlotsEl.style.pointerEvents = locked ? "none" : "auto";
    if (aBankEl) aBankEl.style.pointerEvents = locked ? "none" : "auto";

    if (resetQBtn) resetQBtn.disabled = locked;
    if (resetABtn) resetABtn.disabled = locked;

    setBuilderStyle(qBuilder, locked);
    setBuilderStyle(aBuilder, locked);
  }

  // -----------------------------
  // Token/Slot builders
  // -----------------------------
  function makeToken(word, kind) {
    const el = document.createElement("div");
    el.className = "token";
    el.textContent = word;
    el.setAttribute("draggable", "true");

    el.addEventListener("dragstart", () => {
      draggedWord = word;
    });

    el.addEventListener("click", () => {
      placeInFirstEmpty(kind, word);
    });

    return el;
  }

  function makeSlot(kind, index) {
    const el = document.createElement("div");
    el.className = "slot empty";
    el.textContent = "_____";

    el.addEventListener("dragover", (e) => e.preventDefault());
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedWord) return;
      placeWord(kind, index, draggedWord);
      draggedWord = null;
    });

    el.addEventListener("click", () => clearSlot(kind, index));

    return el;
  }

  function renderBuilder() {
    qSlotsEl.innerHTML = "";
    for (let i = 0; i < questionTarget.length; i++) {
      const slot = makeSlot("q", i);
      const placed = qSlotsState[i];
      if (placed) {
        slot.classList.remove("empty");
        slot.textContent = placed;
      }
      qSlotsEl.appendChild(slot);
    }

    aSlotsEl.innerHTML = "";
    for (let i = 0; i < answerTarget.length; i++) {
      const slot = makeSlot("a", i);
      const placed = aSlotsState[i];
      if (placed) {
        slot.classList.remove("empty");
        slot.textContent = placed;
      }
      aSlotsEl.appendChild(slot);
    }
  }

  function renderBanks(qWords, aWords) {
    qBankEl.innerHTML = "";
    aBankEl.innerHTML = "";
    qWords.forEach((w) => qBankEl.appendChild(makeToken(w, "q")));
    aWords.forEach((w) => aBankEl.appendChild(makeToken(w, "a")));
  }

  function placeInFirstEmpty(kind, word) {
    const state = kind === "q" ? qSlotsState : aSlotsState;
    const idx = state.findIndex((x) => !x);
    if (idx === -1) return;
    placeWord(kind, idx, word);
  }

  function placeWord(kind, index, word) {
    if (kind === "q") qSlotsState[index] = word;
    else aSlotsState[index] = word;
    renderBuilder();
  }

  function clearSlot(kind, index) {
    if (kind === "q") qSlotsState[index] = null;
    else aSlotsState[index] = null;
    renderBuilder();
  }

  function resetQuestion() {
    qSlotsState = new Array(questionTarget.length).fill(null);
    renderBuilder();
  }

  function resetAnswer() {
    aSlotsState = new Array(answerTarget.length).fill(null);
    renderBuilder();
  }

  // -----------------------------
  // Exercise generation
  // -----------------------------
  function startExercise() {
    if (courseCompleted) return;

    exerciseSolved = false;
    isPlaying = false;

    lockAll(false);
    if (nextBtn) nextBtn.style.display = "none";
    if (nextBtn) nextBtn.textContent = BTN.next || "Siguiente";
    setFeedback("", true);

    setCounter(Math.min(exerciseIndex + 1, totalExercises), totalExercises);

    currentRoom = pickRandom(CFG.items || []);
    if (roomImg && currentRoom) {
      roomImg.src = joinPath(CFG.IMG_BASE, currentRoom.image);
    }

    const rw = currentRoom ? roomWord(currentRoom.display) : "";
    answerTarget = [...answerPrefix, rw];

    qSlotsState = new Array(questionTarget.length).fill(null);
    aSlotsState = new Array(answerTarget.length).fill(null);

    const qBankWords = shuffleArray([...questionTarget]);

    // distractors: 2 other room words
    const otherRooms = shuffleArray((CFG.items || []).filter((x) => x.id !== currentRoom.id)).slice(0, 2);
    const distractors = otherRooms.map((r) => roomWord(r.display));
    const roomWords = shuffleArray([rw, ...distractors]);

    const aBankWords = shuffleArray([...answerPrefix, ...roomWords]);

    renderBanks(qBankWords, aBankWords);
    renderBuilder();

    if (shuffleBtn) shuffleBtn.disabled = false;
    if (checkBtn) checkBtn.disabled = false;
    if (resetQBtn) resetQBtn.disabled = false;
    if (resetABtn) resetABtn.disabled = false;
  }

  function isQuestionCorrect() {
    return qSlotsState.join(" ") === questionTarget.join(" ");
  }

  function isAnswerCorrect() {
    return aSlotsState.join(" ") === answerTarget.join(" ");
  }

  async function playQA() {
    if (isPlaying) return;
    isPlaying = true;

    // Prevent double-click chaos
    if (checkBtn) checkBtn.disabled = true;
    if (shuffleBtn) shuffleBtn.disabled = true;
    lockAll(true);

    const qAudio = CFG.questionAudio ? joinPath(CFG.AUDIO_BASE, CFG.questionAudio) : null;
    const aAudio = currentRoom?.audio ? joinPath(CFG.AUDIO_BASE, currentRoom.audio) : null;
    const pauseMs = Number(CFG.timing?.pauseBetweenQA_ms ?? 300);

    if (qAudio) await playAudioAndWait(qAudio);
    await sleep(pauseMs);
    if (aAudio) await playAudioAndWait(aAudio);

    isPlaying = false;
  }

  async function checkFlow() {
    if (courseCompleted) return;
    if (exerciseSolved) {
      setFeedback(chooseMsg(FB.success, ""), true);
      return;
    }

    if (!isQuestionCorrect() || !isAnswerCorrect()) {
      setFeedback(chooseMsg(FB.fail, ""), false);
      return;
    }

    // Correct
    exerciseSolved = true;
    setFeedback(chooseMsg(FB.success, ""), true);

    // Play Q + pause + A
    await playQA();

    // Move forward (once)
    exerciseIndex++;

    if (exerciseIndex >= totalExercises) {
      courseCompleted = true;
      setCounter(totalExercises, totalExercises);

      // End state: show CONTINUE button -> p2.html
      if (shuffleBtn) shuffleBtn.disabled = true;
      if (checkBtn) checkBtn.disabled = true;
      if (resetQBtn) resetQBtn.disabled = true;
      if (resetABtn) resetABtn.disabled = true;

      lockAll(true);

      if (nextBtn) {
        nextBtn.style.display = "inline-block";
        nextBtn.disabled = false;
        nextBtn.textContent = "Continuar";
      }
    } else {
      // Show next exercise button
      if (nextBtn) {
        nextBtn.style.display = "inline-block";
        nextBtn.disabled = false;
        nextBtn.textContent = BTN.next || "Siguiente";
      }
    }
  }

  // -----------------------------
  // Events
  // -----------------------------
  document.querySelectorAll(".step").forEach((step) => {
    step.addEventListener("click", () => {
      const page = step.getAttribute("data-page");
      if (page) window.location.href = page;
    });
  });

  if (resetQBtn) resetQBtn.addEventListener("click", resetQuestion);
  if (resetABtn) resetABtn.addEventListener("click", resetAnswer);

  if (shuffleBtn) shuffleBtn.addEventListener("click", () => {
    if (courseCompleted || isPlaying) return;
    startExercise();
  });

  if (checkBtn) checkBtn.addEventListener("click", () => {
    if (isPlaying) return;
    checkFlow();
  });

  if (nextBtn) nextBtn.addEventListener("click", () => {
    if (isPlaying) return;

    // ✅ If course completed, "Continuar" goes to p2.html
    if (courseCompleted) {
      goToNextPage();
      return;
    }

    // otherwise, next exercise
    startExercise();
  });

  // -----------------------------
  // Init
  // -----------------------------
  startExercise();
})();