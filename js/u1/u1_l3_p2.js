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
  // DATA
  // ==========================
  const dialogues = [
    { text: "I am Ana. Where are you from?", audio: "../../../../assets/audio/u1/u1_l3_p2_ana1.mp3", speaker: "ana" },
    { text: "Hello Ana. I am from Caracas.", audio: "../../../../assets/audio/u1/u1_l3_p2_george1.mp3", speaker: "george" },
    { text: "What is your address?", audio: "../../../../assets/audio/u1/u1_l3_p1_george2.mp3", speaker: "george" },
    { text: "My address is 213 Main Street. And you?", audio: "../../../../assets/audio/u1/u1_l3_p1_ana3.mp3", speaker: "ana" },
    { text: "My address is 94 River Street.", audio: "../../../../assets/audio/u1/u1_l3_p2_george3.mp3", speaker: "george" },
    { text: "What is your phone number?", audio: "../../../../assets/audio/u1/u1_l3_p1_george4.mp3", speaker: "george" },
    { text: "My telephone number is 758 9251.", audio: "../../../../assets/audio/u1/u1_l3_p2_ana4.mp3", speaker: "ana" },
    { text: "My phone number is 549 2137.", audio: "../../../../assets/audio/u1/u1_l3_p1_george5.mp3", speaker: "george" }
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
    currentAudio.addEventListener("ended", () => {
      currentAudio = null;
    });
    currentAudio.play();
  }

  // ==========================
  // HELPERS
  // ==========================
  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  function normalizeText(str) {
    return str.replace(/[^\w\s]/g, "").trim().toLowerCase();
  }

  // ==========================
  // RENDER
  // ==========================
  dialogues.forEach((item, index) => {
    const row = document.createElement("div");
    row.classList.add("dialogue-row");
    if (index !== 0) row.classList.add("locked");

    // Play button
    const playBtn = document.createElement("button");
    playBtn.textContent = "▶";
    playBtn.classList.add("play-btn");
    playBtn.addEventListener("click", () => playAudio(item.audio));

    // Word bank container
    const wordContainer = document.createElement("div");
    wordContainer.classList.add("dialogue-box", item.speaker === "ana" ? "ana-box" : "george-box");

    // Answer container
    const answerContainer = document.createElement("div");
    answerContainer.classList.add("dialogue-box", item.speaker === "ana" ? "ana-box" : "george-box");
    answerContainer.style.minHeight = "45px";
    answerContainer.style.marginTop = "6px";

    // Keep punctuation attached (split by spaces only)
    let bankWords = shuffle(item.text.split(" "));
    let userOrder = [];

    function renderAnswer() {
      answerContainer.innerHTML = "";

      userOrder.forEach((word, i) => {
        const span = document.createElement("span");
        span.textContent = word;
        span.classList.add("word");
        span.title = "Toca para quitar";
        span.style.cursor = "pointer";
        span.draggable = true;

        // tap to send back to bank (mobile friendly)
        onTap(span, () => {
          bankWords.push(userOrder[i]);
          userOrder.splice(i, 1);
          renderBank();
          renderAnswer();
        });

        span.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", String(i));
        });

        span.addEventListener("dragover", (e) => e.preventDefault());

        span.addEventListener("drop", (e) => {
          e.preventDefault();
          const fromIndex = Number(e.dataTransfer.getData("text/plain"));
          const toIndex = i;
          if (Number.isNaN(fromIndex)) return;

          const moved = userOrder[fromIndex];
          userOrder.splice(fromIndex, 1);
          userOrder.splice(toIndex, 0, moved);
          renderAnswer();
        });

        answerContainer.appendChild(span);
      });
    }

    function renderBank() {
      wordContainer.innerHTML = "";

      bankWords.forEach((word, i) => {
        const span = document.createElement("span");
        span.textContent = word;
        span.classList.add("word");

        onTap(span, () => {
          userOrder.push(word);
          bankWords.splice(i, 1);
          renderBank();
          renderAnswer();
        });

        wordContainer.appendChild(span);
      });
    }

    renderBank();
    renderAnswer();

    // Check button + feedback (LANGUAGE-NEUTRAL)
    const checkBtn = document.createElement("button");
    checkBtn.textContent = "✔";
    checkBtn.classList.add("check-btn");

    const feedback = document.createElement("span");
    feedback.classList.add("feedback");

    checkBtn.addEventListener("click", () => {
      const isCorrect = normalizeText(userOrder.join(" ")) === normalizeText(item.text);

      if (isCorrect) {
        feedback.textContent = "✅";
        feedback.style.color = "green";

        // Unlock next row
        const nextRow = container.children[index + 1];
        if (nextRow) nextRow.classList.remove("locked");
      } else {
        feedback.textContent = "❌";
        feedback.style.color = "red";
        setTimeout(() => (feedback.textContent = ""), 1200);
      }
    });

    row.appendChild(playBtn);
    row.appendChild(wordContainer);
    row.appendChild(checkBtn);
    row.appendChild(feedback);
    row.appendChild(answerContainer);

    container.appendChild(row);
  });

  // ==========================
  // PROGRESS NAVIGATION
  // ==========================
  const steps = document.querySelectorAll(".step");
  steps.forEach((step) => {
    step.addEventListener("click", function () {
      stopCurrentAudio();
      window.location.href = this.getAttribute("data-page");
    });
  });

  // ==========================
  // NEXT BUTTON
  // ==========================
  const nextBtn = document.getElementById("nextBtn");
  nextBtn.addEventListener("click", () => {
    stopCurrentAudio();
    window.location.href = "p3.html";
  });

  // Stop audio if user leaves page (extra safety)
  window.addEventListener("beforeunload", () => {
    stopCurrentAudio();
  });
});