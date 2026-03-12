// Unit 1 - Lesson 4 - Part 2
// Two students: tap-to-fill ID card + digit-by-digit phone (auto-check on keypress)

document.addEventListener("DOMContentLoaded", function () {

  // ============================================================
  // HELPERS
  // ============================================================
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // iOS-safe tap (no double-fire)
  function onTap(el, handler) {
    let moved = false, byTouch = false;
    el.addEventListener("touchstart", () => { moved = false; byTouch = false; }, { passive: true });
    el.addEventListener("touchmove",  () => { moved = true; }, { passive: true });
    el.addEventListener("touchend",   (e) => {
      if (moved) return;
      e.preventDefault(); byTouch = true; handler(e);
    });
    el.addEventListener("click", (e) => {
      if (byTouch) { byTouch = false; return; }
      handler(e);
    });
  }

  // i18n strings from HTML
  const M = {};
  document.querySelectorAll("[data-msg]").forEach(n => M[n.dataset.msg] = n.textContent.trim());

  // ============================================================
  // AUDIO — promise-based, no overlap
  // ============================================================
  const AUDIO_BASE = "../../../../assets/audio/u1/";
  let currentAudio = null;

  function stopAudio() {
    if (!currentAudio) return;
    try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (_) {}
    currentAudio = null;
  }

  function playOnce(src) {
    return new Promise((resolve) => {
      stopAudio();
      const a = new Audio(src);
      currentAudio = a;
      a.addEventListener("ended", () => { currentAudio = null; resolve(); });
      a.addEventListener("error", () => { currentAudio = null; resolve(); });
      a.play().catch(() => resolve());
    });
  }

  window.addEventListener("beforeunload", stopAudio);

  // Progress navigation
  document.querySelectorAll(".step").forEach(step => {
    step.addEventListener("click", () => {
      const page = step.dataset.page;
      if (page) { stopAudio(); window.location.href = page; }
    });
  });

  // ============================================================
  // DIGIT MAP
  // ============================================================
  const DIGIT_MAP = {
    "zero.mp3":"0","one.mp3":"1","two.mp3":"2","three.mp3":"3","four.mp3":"4",
    "five.mp3":"5","six.mp3":"6","seven.mp3":"7","eight.mp3":"8","nine.mp3":"9"
  };

  // ============================================================
  // STUDENT DATA
  // ============================================================
  const students = [
    {
      id: 1,
      firstName: "Maria",
      lastName:  "Lopez",
      address:   "45 Palm Avenue",
      city:      "Orlando",
      state:     "Florida",
      // Phone: 3 2 7 - 8 4 1 6
      phone: ["three.mp3","two.mp3","seven.mp3","eight.mp3","four.mp3","one.mp3","six.mp3"]
    },
    {
      id: 2,
      firstName: "Carlos",
      lastName:  "Ruiz",
      address:   "18 Oak Street",
      city:      "Houston",
      state:     "Texas",
      // Phone: 7 1 3 - 5 9 2 0
      phone: ["seven.mp3","one.mp3","three.mp3","five.mp3","nine.mp3","two.mp3","zero.mp3"]
    }
  ];

  // ============================================================
  // CARD EXERCISE — shared logic, instantiated per student
  // ============================================================
  function initCard(student) {
    const n         = student.id;
    const wordBank  = document.getElementById(`wordBank${n}`);
    const checkBtn  = document.getElementById(`checkForm${n}Btn`);
    const feedback  = document.getElementById(`formFeedback${n}`);
    const phoneSection = document.getElementById(`phoneSection${n}`);

    let selectedChip = null;

    const cardFields = [
      { field: "firstName", label: student.firstName },
      { field: "lastName",  label: student.lastName  },
      { field: "address",   label: student.address   },
      { field: "city",      label: student.city      },
      { field: "state",     label: student.state     },
    ];

    // ---- CHIP ----
    function makeChip(item) {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.textContent = item.label;
      chip.dataset.field = item.field;
      onTap(chip, () => {
        if (selectedChip === chip) { deselectChip(); return; }
        deselectChip();
        selectedChip = chip;
        chip.classList.add("selected");
      });
      return chip;
    }

    function deselectChip() {
      if (selectedChip) { selectedChip.classList.remove("selected"); selectedChip = null; }
    }

    // Build shuffled word bank
    shuffleArray(cardFields).forEach(item => wordBank.appendChild(makeChip(item)));

    // ---- DROPZONES ----
    document.querySelectorAll(`.dropzone[data-student="${n}"]`).forEach(zone => {
      onTap(zone, () => {
        if (selectedChip) {
          // return previous value to bank
          if (zone.dataset.placedField) {
            wordBank.appendChild(makeChip({ field: zone.dataset.placedField, label: zone.textContent }));
          }
          zone.textContent      = selectedChip.textContent;
          zone.dataset.placedField = selectedChip.dataset.field;
          zone.classList.add("filled");
          selectedChip.remove();
          deselectChip();
          feedback.textContent = "";
          feedback.className   = "feedback";
        } else if (zone.dataset.placedField) {
          wordBank.appendChild(makeChip({ field: zone.dataset.placedField, label: zone.textContent }));
          zone.textContent         = "";
          zone.dataset.placedField = "";
          zone.classList.remove("filled");
        }
      });
    });

    // ---- CHECK FORM ----
    checkBtn.addEventListener("click", () => {
      const zones = document.querySelectorAll(`.dropzone[data-student="${n}"]`);
      let allFilled = true, allCorrect = true;

      zones.forEach(zone => {
        const placed   = zone.dataset.placedField || "";
        const expected = zone.dataset.field;
        if (!placed)            allFilled   = false;
        else if (placed !== expected) allCorrect = false;
      });

      if (!allFilled) {
        feedback.textContent = M["fill_all"];
        feedback.className   = "feedback wrong";
        return;
      }
      if (!allCorrect) {
        feedback.textContent = M["try_again"];
        feedback.className   = "feedback wrong";
        return;
      }

      // All correct — lock green
      feedback.textContent = M["form_correct"];
      feedback.className   = "feedback correct";
      zones.forEach(z => { z.classList.add("correct-field"); z.classList.remove("filled"); });
      checkBtn.disabled = true;

      // Reveal phone section
      setTimeout(() => {
        phoneSection.classList.remove("hidden");
        phoneSection.scrollIntoView({ behavior: "smooth", block: "start" });
        // Start the digit sequence
        initPhone(student);
      }, 700);
    });
  }

  // ============================================================
  // PHONE EXERCISE — digit-by-digit state machine
  // ============================================================
  function initPhone(student) {
    const n          = student.id;
    const strip      = document.getElementById(`digitStrip${n}`);
    const input      = document.getElementById(`digitInput${n}`);
    const hint       = document.getElementById(`digitHint${n}`);
    const replayBtn  = document.getElementById(`replayBtn${n}`);
    const phoneFB    = document.getElementById(`phoneFeedback${n}`);

    const digits     = student.phone; // array of mp3 filenames
    let currentIdx   = 0;
    let wrongCount   = 0;  // wrong attempts for current digit
    let waitingInput = false;

    // Build bubbles
    strip.innerHTML = "";
    digits.forEach(() => {
      const b = document.createElement("div");
      b.className   = "digit-bubble";
      b.textContent = "•";
      strip.appendChild(b);
    });
    const bubbles = strip.querySelectorAll(".digit-bubble");

    // ---- State helpers ----
    function setActive(idx) {
      bubbles.forEach(b => b.classList.remove("active"));
      if (idx < digits.length) bubbles[idx].classList.add("active");
    }

    function markCorrect(idx) {
      bubbles[idx].classList.remove("active");
      bubbles[idx].classList.add("correct");
      bubbles[idx].textContent = DIGIT_MAP[digits[idx]];
    }

    function markRevealed(idx) {
      bubbles[idx].classList.remove("active");
      bubbles[idx].classList.add("revealed");
      bubbles[idx].textContent = DIGIT_MAP[digits[idx]];
    }

    function clearInput() {
      input.value = "";
      input.classList.remove("shake", "correct-flash");
    }

    function flashShake() {
      input.classList.remove("shake");
      void input.offsetWidth; // reflow to restart animation
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 400);
    }

    function flashCorrect(cb) {
      input.classList.add("correct-flash");
      setTimeout(() => { input.classList.remove("correct-flash"); clearInput(); cb && cb(); }, 400);
    }

    // ---- Play a digit and wait for input ----
    async function playDigit(idx) {
      if (idx >= digits.length) { onAllDone(); return; }
      setActive(idx);
      hint.textContent  = "";
      hint.className    = "digit-hint";
      waitingInput      = true;
      clearInput();
      input.disabled    = false;
      input.focus();
      replayBtn.classList.add("hidden");

      await playOnce(AUDIO_BASE + digits[idx]);
    }

    // ---- Handle single keypress ----
    function handleInput() {
      if (!waitingInput) return;
      const typed    = input.value.replace(/\D/g, ""); // digits only
      if (!typed) { input.value = ""; return; }

      const expected = DIGIT_MAP[digits[currentIdx]];

      if (typed === expected) {
        // ✅ CORRECT
        waitingInput = false;
        wrongCount   = 0;
        hint.textContent = M["digit_correct"] || "✅";
        hint.className   = "digit-hint correct";
        markCorrect(currentIdx);
        flashCorrect(() => {
          currentIdx++;
          hint.textContent = "";
          if (currentIdx < digits.length) {
            setTimeout(() => playDigit(currentIdx), 300);
          } else {
            onAllDone();
          }
        });
      } else {
        // ❌ WRONG
        input.value = ""; // clear immediately so they can try again
        wrongCount++;
        flashShake();

        if (wrongCount === 1) {
          // First wrong — replay the digit
          hint.textContent = M["digit_wrong1"];
          hint.className   = "digit-hint wrong";
          waitingInput = false;
          setTimeout(async () => {
            await playOnce(AUDIO_BASE + digits[currentIdx]);
            waitingInput = true;
            input.focus();
          }, 400);
        } else {
          // Second wrong — reveal it, wait for them to type the correct digit
          hint.textContent = M["digit_wrong2"];
          hint.className   = "digit-hint reveal";
          markRevealed(currentIdx);
          replayBtn.classList.remove("hidden");
          waitingInput = true;
          input.focus();
        }
      }
    }

    // Listen on input event (covers keyboard AND mobile tap-to-type)
    input.addEventListener("input", () => {
      handleInput();
    });

    // Replay button (shown after 2 wrong)
    replayBtn.addEventListener("click", async () => {
      clearInput();
      await playOnce(AUDIO_BASE + digits[currentIdx]);
      input.focus();
    });

    // ---- All digits done ----
    function onAllDone() {
      input.disabled   = true;
      replayBtn.classList.add("hidden");
      hint.textContent = "";
      phoneFB.textContent = M["phone_done"];
      phoneFB.className   = "feedback correct";

      if (student.id === 1) {
        // Unlock student 2
        setTimeout(() => {
          document.getElementById("student2Section").classList.remove("hidden");
          document.getElementById("student2Section").scrollIntoView({ behavior:"smooth", block:"start" });
          initCard(students[1]);
        }, 800);
      } else {
        // Both done — show finish
        setTimeout(() => {
          document.getElementById("finishSection").classList.remove("hidden");
          document.getElementById("finishSection").scrollIntoView({ behavior:"smooth", block:"start" });
        }, 800);
      }
    }

    // ---- Kick off first digit ----
    setTimeout(() => playDigit(0), 400);
  }

  // ============================================================
  // INIT — start with student 1 card only
  // ============================================================
  initCard(students[0]);
  // Student 2 card is hidden; it gets initialized after student 1 phone is done

});
