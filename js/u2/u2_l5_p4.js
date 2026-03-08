(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/l5/",
    GAP_MS: 450
  };

  const EXERCISES = [
    { img: "u2.l5.p4.weare1.jpg",  audio: "u2.l5.p4.we.are.mp3",   correct: "We are in the kitchen." },
    { img: "u2.l5.p4.weare2.jpg",  audio: "u2.l5.p4.we.are2.mp3",  correct: "We are in the living room." },
    { img: "u2.l5.p4.weare3.jpg",  audio: "u2.l5.p4.we.are3.mp3",  correct: "We are in the bedroom." },
    { img: "u2.l5.p4.weare4.jpg",  audio: "u2.l5.p4.we.are4.mp3",  correct: "We are in the bathroom." },

    { img: "u2.l5.p4.theyare1.jpg", audio: "u2.l5.p4.they.are1.mp3", correct: "They are in the kitchen." },
    { img: "u2.l5.p4.theyare2.jpg", audio: "u2.l5.p4.they.are2.mp3", correct: "They are in the living room." },
    { img: "u2.l5.p4.theyare3.jpg", audio: "u2.l5.p4.they.are3.mp3", correct: "They are in the bedroom." },
    { img: "u2.l5.p4.theyare4.jpg", audio: "u2.l5.p4.they.are4.mp3", correct: "They are in the bathroom." },
  ];

  // Distractors: always wrong but plausible
  const DISTRACTORS = [
    "I am in the kitchen.",
    "He is in the kitchen.",
    "I am in the living room.",
    "He is in the living room.",
    "I am in the bedroom.",
    "He is in the bedroom.",
    "I am in the bathroom.",
    "He is in the bathroom."
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

  function gotoStepClicks() {
    document.querySelectorAll(".step").forEach(step => {
      step.addEventListener("click", () => {
        const page = step.getAttribute("data-page");
        if (page) window.location.href = page;
      });
    });
  }

  let idx = 0;
  const audio = new Audio();
  audio.preload = "auto";

  function setExplanationForIndex(i) {
    const explainWe = $("explainWe");
    const explainThey = $("explainThey");

    if (i < 4) {
      explainWe.classList.remove("hidden");
      explainThey.classList.add("hidden");
    } else {
      explainWe.classList.add("hidden");
      explainThey.classList.remove("hidden");
    }
  }

  function renderOptions(correctText) {
    const box = $("optionsBox");
    box.innerHTML = "";

    // pick two wrong options that are NOT the correct one
    const wrongPool = shuffle(DISTRACTORS.filter(x => x !== correctText));
    const options = shuffle([correctText, wrongPool[0], wrongPool[1]]);

    options.forEach((opt, n) => {
      const id = `opt_${idx}_${n}`;

      // Whole row clickable: label wraps input + text
      const label = document.createElement("label");
      label.className = "option";
      label.setAttribute("for", id);

      label.innerHTML = `
        <input id="${id}" type="radio" name="option" value="${opt}">
        <span>${opt}</span>
      `;

      box.appendChild(label);
    });
  }

  function resetMark() {
    const mark = $("mark");
    mark.textContent = "";
    mark.className = "mark";
    $("great").classList.add("hidden");
  }

  function loadExercise() {
    const ex = EXERCISES[idx];

    setExplanationForIndex(idx);

    $("counter").textContent = `${idx + 1} / ${EXERCISES.length}`;
    $("exerciseImage").src = CONFIG.IMG_BASE + ex.img;
    audio.src = CONFIG.AUDIO_BASE + ex.audio;

    $("playBtn").textContent = "▶";
    resetMark();
    renderOptions(ex.correct);
    $("finishBtn").classList.add("hidden");
  }

  $("playBtn").addEventListener("click", async () => {
    // toggle play/pause
    if (!audio.paused) {
      audio.pause();
      $("playBtn").textContent = "▶";
      return;
    }

    try {
      $("playBtn").textContent = "⏸";
      audio.currentTime = 0;
      await audio.play();
    } catch (e) {
      $("playBtn").textContent = "▶";
    }
  });

  audio.addEventListener("ended", () => {
    $("playBtn").textContent = "▶";
  });

  $("checkBtn").addEventListener("click", () => {
    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) return;

    const correct = EXERCISES[idx].correct;
    const mark = $("mark");

    if (selected.value === correct) {
      mark.textContent = "✓";
      mark.className = "mark ok";

      setTimeout(() => {
        idx++;
        if (idx >= EXERCISES.length) {
          $("great").classList.remove("hidden");
          $("finishBtn").classList.remove("hidden");
          $("counter").textContent = `${EXERCISES.length} / ${EXERCISES.length}`;
        } else {
          loadExercise();
        }
      }, CONFIG.GAP_MS);

    } else {
      mark.textContent = "✗";
      mark.className = "mark bad";
    }
  });

  function init() {
    gotoStepClicks();
    loadExercise();
  }

  document.addEventListener("DOMContentLoaded", init);
})();