// u2/l1/u2_l1_p4.js
// ✅ Language-neutral engine: no UI strings hardcoded.
// ✅ Fix: prevent "Cambiar imágenes" from pushing counter to 5/4 after completion.

(function () {
  const CFG = window.P4_CONFIG;
  if (!CFG) {
    console.error("P4_CONFIG is missing. Define window.P4_CONFIG before loading this JS.");
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

  function playAudio(url) {
    try {
      const audio = new Audio(url);
      audio.play();
    } catch (e) {
      console.warn("Audio error:", e);
    }
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

  // -----------------------------
  // DOM
  // -----------------------------
  const personImg = $("personImg");
  const roomImg = $("roomImg");

  const counterPill = $("counterPill");
  const feedbackEl = $("feedback");

  const qSlotsEl = $("qSlots");
  const qBankEl = $("qBank");
  const aSlotsEl = $("aSlots");
  const aBankEl = $("aBank");

  const playPersonAudioBtn = $("playPersonAudioBtn");
  const playRoomAudioBtn = $("playRoomAudioBtn");

  const resetQBtn = $("resetQBtn");
  const resetABtn = $("resetABtn");

  const shuffleBtn = $("shuffleBtn");
  const checkBtn = $("checkBtn");
  const nextBtn = $("nextBtn");

  const goL2Link = $("goL2Link");

  const UI = CFG.ui || {};
  const BTN = UI.buttons || {};
  const FB = UI.feedback || {};

  // Apply configurable button texts (no hardcoded language)
  if (playPersonAudioBtn) playPersonAudioBtn.textContent = BTN.playQuestion || playPersonAudioBtn.textContent;
  if (playRoomAudioBtn) playRoomAudioBtn.textContent = BTN.playPlace || playRoomAudioBtn.textContent;
  if (resetQBtn) resetQBtn.textContent = BTN.reset || resetQBtn.textContent;
  if (resetABtn) resetABtn.textContent = BTN.reset || resetABtn.textContent;
  if (shuffleBtn) shuffleBtn.textContent = BTN.shuffle || shuffleBtn.textContent;
  if (checkBtn) checkBtn.textContent = BTN.check || checkBtn.textContent;
  if (nextBtn) nextBtn.textContent = BTN.next || nextBtn.textContent;
  if (goL2Link) goL2Link.textContent = BTN.goL2 || goL2Link.textContent;

  // -----------------------------
  // State
  // -----------------------------
  let exerciseIndex = 0;
  const totalExercises = Number(CFG.totalExercises || 4);

  let currentPerson = null;
  let currentRoom = null;

  const questionTarget = (CFG.targets?.question || []).slice();
  const answerPrefix = (CFG.targets?.answerPrefix || []).slice();
  let answerTarget = [];

  let qSlotsState = [];
  let aSlotsState = [];

  // Flow flags
  let phase = "question";      // "question" | "answer" | "done"
  let questionLocked = false;
  let answerLocked = false;
  let exerciseSolved = false;  // prevents multiple increments per exercise
  let courseCompleted = false; // ✅ prevents 5/4, 6/4 etc.

  // Drag state
  let draggedWord = null;

  // -----------------------------
  // UI Lock / highlight
  // -----------------------------
  function setBuilderStyle(builderEl, locked) {
    if (!builderEl) return;
    builderEl.style.border = locked ? "2px solid #16a34a" : "1px dashed #93c5fd";
    builderEl.style.background = locked ? "#ecfdf5" : "#ffffff";
  }

  function setQuestionLocked(locked) {
    questionLocked = locked;
    if (qSlotsEl) qSlotsEl.style.pointerEvents = locked ? "none" : "auto";
    if (qBankEl) qBankEl.style.pointerEvents = locked ? "none" : "auto";
    if (resetQBtn) resetQBtn.disabled = locked;

    const qBuilder = qSlotsEl ? qSlotsEl.closest(".builder") : null;
    setBuilderStyle(qBuilder, locked);
  }

  function setAnswerLocked(locked) {
    answerLocked = locked;
    if (aSlotsEl) aSlotsEl.style.pointerEvents = locked ? "none" : "auto";
    if (aBankEl) aBankEl.style.pointerEvents = locked ? "none" : "auto";
    if (resetABtn) resetABtn.disabled = locked;

    const aBuilder = aSlotsEl ? aSlotsEl.closest(".builder") : null;
    setBuilderStyle(aBuilder, locked);
  }

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

  function setCompleted(total) {
    const fmt = UI.completedFormat;
    if (typeof fmt === "function") counterPill.textContent = fmt(total);
    else counterPill.textContent = `${total}/${total}`;
  }

  function enterCompletedState() {
    courseCompleted = true;
    setCompleted(totalExercises);

    // Lock both sides
    setQuestionLocked(true);
    setAnswerLocked(true);

    // Hide next button
    if (nextBtn) nextBtn.style.display = "none";

    // Show L2 link
    if (goL2Link) {
      goL2Link.style.display = "inline-block";
      goL2Link.textContent = BTN.goL2 || goL2Link.textContent;
    }

    // Disable shuffle/check to prevent 5/4
    if (shuffleBtn) shuffleBtn.disabled = true;
    if (checkBtn) checkBtn.disabled = true;
    if (resetQBtn) resetQBtn.disabled = true;
    if (resetABtn) resetABtn.disabled = true;
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
    if (kind === "q" && questionLocked) return;
    if (kind === "a" && answerLocked) return;

    const state = kind === "q" ? qSlotsState : aSlotsState;
    const idx = state.findIndex((x) => !x);
    if (idx === -1) return;
    placeWord(kind, idx, word);
  }

  function placeWord(kind, index, word) {
    if (kind === "q" && questionLocked) return;
    if (kind === "a" && answerLocked) return;

    if (kind === "q") qSlotsState[index] = word;
    else aSlotsState[index] = word;

    renderBuilder();
  }

  function clearSlot(kind, index) {
    if (kind === "q" && questionLocked) return;
    if (kind === "a" && answerLocked) return;

    if (kind === "q") qSlotsState[index] = null;
    else aSlotsState[index] = null;

    renderBuilder();
  }

  function resetQuestion() {
    if (questionLocked) return;
    qSlotsState = new Array(questionTarget.length).fill(null);
    renderBuilder();
  }

  function resetAnswer() {
    if (answerLocked) return;
    aSlotsState = new Array(answerTarget.length).fill(null);
    renderBuilder();
  }

  // -----------------------------
  // Exercise generation
  // -----------------------------
  function startExercise() {
    // ✅ If fully completed, don't start new exercises
    if (courseCompleted) return;

    setFeedback("", true);

    phase = "question";
    exerciseSolved = false;

    setQuestionLocked(false);
    setAnswerLocked(false);

    // (Re)enable controls in case you came from previous exercise
    if (shuffleBtn) shuffleBtn.disabled = false;
    if (checkBtn) checkBtn.disabled = false;
    if (resetQBtn) resetQBtn.disabled = false;
    if (resetABtn) resetABtn.disabled = false;

    // Counter should never exceed total
    setCounter(Math.min(exerciseIndex + 1, totalExercises), totalExercises);

    currentPerson = pickRandom(CFG.people || []);
    currentRoom = pickRandom(CFG.items || []);

    if (personImg && currentPerson) personImg.src = CFG.IMG_BASE + currentPerson.image;
    if (roomImg && currentRoom) roomImg.src = CFG.IMG_BASE + currentRoom.image;

    const rw = currentRoom ? roomWord(currentRoom.display) : "";
    answerTarget = [...answerPrefix, rw];

    qSlotsState = new Array(questionTarget.length).fill(null);
    aSlotsState = new Array(answerTarget.length).fill(null);

    const qBankWords = shuffleArray([...questionTarget]);

    const otherRooms = shuffleArray((CFG.items || []).filter((x) => x.id !== currentRoom.id)).slice(0, 2);
    const distractors = otherRooms.map((r) => roomWord(r.display));
    const roomWords = shuffleArray([rw, ...distractors]);

    const aBankWords = shuffleArray([...answerPrefix, ...roomWords]);

    renderBanks(qBankWords, aBankWords);
    renderBuilder();

    if (nextBtn) nextBtn.style.display = "none";
    if (goL2Link) goL2Link.style.display = "none";
  }

  function isQuestionCorrect() {
    return qSlotsState.join(" ") === questionTarget.join(" ");
  }

  function isAnswerCorrect() {
    return aSlotsState.join(" ") === answerTarget.join(" ");
  }

  function finishExerciseOnce() {
    if (exerciseSolved || courseCompleted) return;

    exerciseSolved = true;
    phase = "done";

    // turn right side green + lock
    setAnswerLocked(true);

    setFeedback(chooseMsg(FB.success, ""), true);

    exerciseIndex++;

    if (exerciseIndex >= totalExercises) {
      enterCompletedState();
    } else {
      if (nextBtn) {
        nextBtn.style.display = "inline-block";
        nextBtn.textContent = BTN.next || nextBtn.textContent;
      }
    }
  }

  function checkFlow() {
    if (courseCompleted) return;

    if (exerciseSolved) {
      // solved already; don't increment again
      setFeedback(chooseMsg(FB.success, ""), true);
      return;
    }

    if (phase === "question") {
      if (isQuestionCorrect()) {
        setQuestionLocked(true);
        phase = "answer";
        setFeedback(chooseMsg(FB.questionOk, chooseMsg(FB.success, "")), true);
      } else {
        setFeedback(chooseMsg(FB.failQuestion, chooseMsg(FB.fail, "")), false);
      }
      return;
    }

    if (phase === "answer") {
      if (isAnswerCorrect()) finishExerciseOnce();
      else setFeedback(chooseMsg(FB.failAnswer, chooseMsg(FB.fail, "")), false);
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

  if (playPersonAudioBtn) {
    playPersonAudioBtn.addEventListener("click", () => {
      if (!currentPerson) return;
      playAudio(CFG.AUDIO_BASE + currentPerson.audio);
    });
  }

  if (playRoomAudioBtn) {
    playRoomAudioBtn.addEventListener("click", () => {
      if (!currentRoom) return;
      playAudio(CFG.AUDIO_BASE + currentRoom.audio);
    });
  }

  if (resetQBtn) resetQBtn.addEventListener("click", resetQuestion);
  if (resetABtn) resetABtn.addEventListener("click", resetAnswer);

  if (shuffleBtn) shuffleBtn.addEventListener("click", () => {
    // ✅ Do nothing after completion
    if (courseCompleted) return;
    startExercise();
  });

  if (checkBtn) checkBtn.addEventListener("click", checkFlow);
  if (nextBtn) nextBtn.addEventListener("click", startExercise);

  // -----------------------------
  // Init
  // -----------------------------
  startExercise();
})();