document.addEventListener("DOMContentLoaded", function () {

  // ==========================
  // iOS-SAFE TAP HELPER
  // ==========================
  function onTap(el, handler) {
    let touchMoved = false;
    let handledByTouch = false;

    el.addEventListener("touchstart", () => {
      touchMoved = false;
      handledByTouch = false;
    }, { passive: true });

    el.addEventListener("touchmove", () => {
      touchMoved = true;
    }, { passive: true });

    el.addEventListener("touchend", (e) => {
      if (touchMoved) return;
      e.preventDefault();
      handledByTouch = true;
      handler(e);
    });

    el.addEventListener("click", (e) => {
      if (handledByTouch) { handledByTouch = false; return; }
      handler(e);
    });
  }

  // ==========================
  // DATA — chunks instead of single words
  // ==========================
  const dialogues = [
    {
      text: "I am Ana. Where are you from?",
      chunks: ["I am Ana.", "Where are you", "from?"],
      audio: "../../../../assets/audio/u1/u1_l3_p2_ana1.mp3",
      speaker: "ana"
    },
    {
      text: "Hello Ana. I am from Caracas.",
      chunks: ["Hello Ana.", "I am", "from", "Caracas."],
      audio: "../../../../assets/audio/u1/u1_l3_p2_george1.mp3",
      speaker: "george"
    },
    {
      text: "What is your address?",
      chunks: ["What is", "your address?"],
      audio: "../../../../assets/audio/u1/u1_l3_p1_george2.mp3",
      speaker: "george"
    },
    {
      text: "My address is 213 Main Street. And you?",
      chunks: ["My address is", "213 Main Street.", "And you?"],
      audio: "../../../../assets/audio/u1/u1_l3_p1_ana3.mp3",
      speaker: "ana"
    },
    {
      text: "My address is 94 River Street.",
      chunks: ["My address is", "94 River Street."],
      audio: "../../../../assets/audio/u1/u1_l3_p2_george3.mp3",
      speaker: "george"
    },
    {
      text: "What is your phone number?",
      chunks: ["What is", "your phone number?"],
      audio: "../../../../assets/audio/u1/u1_l3_p1_george4.mp3",
      speaker: "george"
    },
    {
      text: "My telephone number is 758 9251.",
      chunks: ["My telephone number is", "758 9251."],
      audio: "../../../../assets/audio/u1/u1_l3_p2_ana4.mp3",
      speaker: "ana"
    },
    {
      text: "My phone number is 549 2137.",
      chunks: ["My phone number is", "549 2137."],
      audio: "../../../../assets/audio/u1/u1_l3_p1_george5.mp3",
      speaker: "george"
    }
  ];

  const container = document.getElementById("dialogueContainer");

  // ==========================
  // AUDIO (NO OVERLAP)
  // ==========================
  let currentAudio = null;

  function stopCurrentAudio() {
    if (!currentAudio) return;
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (_) {}
    currentAudio = null;
  }

  function playAudio(src) {
    stopCurrentAudio();
    currentAudio = new Audio(src);
    currentAudio.currentTime = 0;
    currentAudio.addEventListener("ended", () => { currentAudio = null; });
    currentAudio.play();
  }

  // ==========================
  // HELPERS
  // ==========================

  // FIX: Iterative shuffle — no recursion, guaranteed different order when possible
  function shuffle(arr) {
    if (arr.length <= 1) return [...arr];
    let result;
    let attempts = 0;
    do {
      result = [...arr];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      attempts++;
    } while (result.join("|") === arr.join("|") && attempts < 10);
    return result;
  }

  // ==========================
  // RENDER
  // ==========================
  dialogues.forEach((item, index) => {
    const isAna = item.speaker === "ana";
    const boxClass = isAna ? "ana-box" : "george-box";

    const row = document.createElement("div");
    row.classList.add("dialogue-row");
    if (index !== 0) row.classList.add("locked");

    // --- Speaker avatar ---
    const avatar = document.createElement("img");
    avatar.src = isAna
      ? "../../../../assets/images/u1/ana.png"
      : "../../../../assets/images/u1/george.png";
    avatar.alt = isAna ? "Ana" : "George";
    avatar.classList.add("row-avatar");

    // --- Main content wrapper ---
    const contentWrap = document.createElement("div");
    contentWrap.classList.add("content-wrap");

    // Play button
    const playBtn = document.createElement("button");
    playBtn.textContent = "▶";
    playBtn.classList.add("play-btn");
    playBtn.addEventListener("click", () => playAudio(item.audio));

    // Chunk bank
    const wordContainer = document.createElement("div");
    wordContainer.classList.add("dialogue-box", boxClass, "bank-box");

    // Answer area
    const answerContainer = document.createElement("div");
    answerContainer.classList.add("dialogue-box", boxClass, "answer-box");

    // Buttons row
    const btnRow = document.createElement("div");
    btnRow.classList.add("btn-row");

    // Check button
    const checkBtn = document.createElement("button");
    checkBtn.textContent = "✔ Verificar";
    checkBtn.classList.add("check-btn");

    // Hint button
    const hintBtn = document.createElement("button");
    hintBtn.textContent = "💡 Ayuda";
    hintBtn.classList.add("hint-btn");

    const feedback = document.createElement("span");
    feedback.classList.add("feedback");

    btnRow.appendChild(playBtn);
    btnRow.appendChild(checkBtn);
    btnRow.appendChild(hintBtn);
    btnRow.appendChild(feedback);

    // --- State ---
    let bankChunks = shuffle(item.chunks);
    let userOrder = [];

    function renderAnswer() {
      answerContainer.innerHTML = "";

      // FIX: Only auto-check when user has actually placed ALL chunks (not on empty init)
      const allPlaced = userOrder.length > 0 && userOrder.length === item.chunks.length;

      if (userOrder.length === 0) {
        const placeholder = document.createElement("span");
        placeholder.classList.add("answer-placeholder");
        placeholder.textContent = "Toca las fichas para armar la oración...";
        answerContainer.appendChild(placeholder);
      }

      userOrder.forEach((chunk, i) => {
        const span = document.createElement("span");
        span.textContent = chunk;
        span.classList.add("word");
        span.title = "Toca para quitar";

        // FIX: Capture index at creation time via IIFE to avoid stale closure
        (function(capturedIndex) {
          onTap(span, () => {
            bankChunks.push(userOrder[capturedIndex]);
            userOrder.splice(capturedIndex, 1);
            renderBank();
            renderAnswer();
          });
        })(i);

        answerContainer.appendChild(span);
      });

      // Auto-check when all chunks are placed
      if (allPlaced) {
        setTimeout(checkAnswer, 150);
      }
    }

    function renderBank() {
      wordContainer.innerHTML = "";

      bankChunks.forEach((chunk, i) => {
        const span = document.createElement("span");
        span.textContent = chunk;
        span.classList.add("word");

        // FIX: Same stale-index fix for bank tiles
        (function(capturedIndex) {
          onTap(span, () => {
            userOrder.push(bankChunks[capturedIndex]);
            bankChunks.splice(capturedIndex, 1);
            renderBank();
            renderAnswer();
          });
        })(i);

        wordContainer.appendChild(span);
      });
    }

    renderBank();
    renderAnswer();

    function checkAnswer() {
      if (userOrder.length !== item.chunks.length) return;
      const isCorrect = userOrder.join(" ") === item.chunks.join(" ");

      if (isCorrect) {
        feedback.textContent = "✅";
        feedback.style.color = "green";
        checkBtn.disabled = true;
        hintBtn.disabled = true;
        wordContainer.style.display = "none";
        // Turn answer tiles green
        answerContainer.querySelectorAll(".word").forEach(w => {
          w.style.background = "#bbf7d0";
          w.style.borderColor = "#22c55e";
          w.style.cursor = "default";
          w.style.pointerEvents = "none";
        });

        // Unlock next row (no auto-play)
        const nextRow = container.children[index + 1];
        if (nextRow) {
          nextRow.classList.remove("locked");
        }
      }
    }

    // --- Check button (manual fallback) ---
    checkBtn.addEventListener("click", () => {
      if (userOrder.length !== item.chunks.length) return;
      const isCorrect = userOrder.join(" ") === item.chunks.join(" ");

      if (!isCorrect) {
        feedback.textContent = "❌";
        feedback.style.color = "red";
        setTimeout(() => (feedback.textContent = ""), 1200);
      } else {
        checkAnswer();
      }
    });

    // --- Hint: places the next correct chunk ---
    hintBtn.addEventListener("click", () => {
      for (let i = 0; i < item.chunks.length; i++) {
        if (userOrder[i] !== item.chunks[i]) {
          const correctChunk = item.chunks[i];
          const bankIdx = bankChunks.indexOf(correctChunk);

          if (bankIdx !== -1) {
            bankChunks.splice(bankIdx, 1);
            userOrder.splice(i, 0, correctChunk);
          } else {
            const wrongIdx = userOrder.indexOf(correctChunk, i + 1);
            if (wrongIdx !== -1) {
              userOrder.splice(wrongIdx, 1);
              userOrder.splice(i, 0, correctChunk);
            }
          }

          renderBank();
          renderAnswer();

          // Flash the placed chunk
          const spans = answerContainer.querySelectorAll(".word");
          if (spans[i]) {
            spans[i].classList.add("hint-highlight");
            setTimeout(() => spans[i].classList.remove("hint-highlight"), 1000);
          }
          return;
        }
      }
    });

    // --- Assemble row: avatar on outside, content inside ---
    if (isAna) {
      row.appendChild(avatar);
      row.appendChild(contentWrap);
    } else {
      row.appendChild(contentWrap);
      row.appendChild(avatar);
    }

    contentWrap.appendChild(btnRow);
    contentWrap.appendChild(wordContainer);
    contentWrap.appendChild(answerContainer);

    container.appendChild(row);
  });

  // ==========================
  // PROGRESS NAVIGATION
  // ==========================
  const steps = document.querySelectorAll(".step");
  steps.forEach(function(step) {
    step.addEventListener("click", function () {
      stopCurrentAudio();
      const page = this.getAttribute("data-page");
      if (page) window.location.href = page;
    });
  });

  // ==========================
  // NEXT BUTTON
  // ==========================
  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stopCurrentAudio();
      window.location.href = "p4.html";
    });
  }

  window.addEventListener("beforeunload", () => {
    stopCurrentAudio();
  });
});
