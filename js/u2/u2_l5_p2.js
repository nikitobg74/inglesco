// u2_l5_p2.js ✅ One-by-one questions (no memory overload) ✅ COPY / PASTE
(() => {
  const CONFIG = {
    AUDIO_BASE: "../../../../assets/audio/u2/l5/",
    AUDIO_FILE: "u2.l5.p2.baker.mp3",
    GAP_MS: 450,
  };

  // One-by-one question set (same answers you gave)
  const QUESTIONS = [
    {
      q: "Where is Anna?",
      correct: "B",
      options: {
        A: "She is in the kitchen.",
        B: "She is in the living room.",
        C: "She is in the bathroom.",
      }
    },
    {
      q: "Where is Daniel?",
      correct: "B",
      options: {
        A: "He is in the bedroom.",
        B: "He is in the kitchen.",
        C: "He is in the yard.",
      }
    },
    {
      q: "Where is Lily?",
      correct: "A",
      options: {
        A: "She is in the bedroom.",
        B: "She is in the living room.",
        C: "She is in the garage.",
      }
    },
    {
      q: "Where is Ben?",
      correct: "B",
      options: {
        A: "He is in the yard.",
        B: "He is in the bathroom.",
        C: "He is in the kitchen.",
      }
    },
    {
      q: "Where is Emma?",
      correct: "A",
      options: {
        A: "She is in the yard.",
        B: "She is in the bathroom.",
        C: "She is in the kitchen.",
      }
    },
    {
      q: "Where is the car?",
      correct: "A",
      options: {
        A: "The car is in the garage.",
        B: "The car is in the living room.",
        C: "The car is in the yard.",
      }
    },
  ];

  const $ = (id) => document.getElementById(id);

  function gotoStepClicks() {
    document.querySelectorAll(".step").forEach(step => {
      step.addEventListener("click", () => {
        const page = step.getAttribute("data-page");
        if (page) window.location.href = page;
      });
    });
  }

  function initAudioFlow(unlockQuestions) {
    const playBtn = $("playBtn");
    const status = $("status");
    const hint = $("hint");
    const story = $("story");
    const playLabel = $("playLabel");

    const audio = new Audio();
    audio.preload = "auto";
    audio.src = CONFIG.AUDIO_BASE + CONFIG.AUDIO_FILE;

    let playCount = 0; // 0-> first play, 1-> second play, 2+-> replay

    // start hidden
    story.classList.add("hidden-text");
    status.textContent = "1ª escucha: texto escondido.";
    hint.textContent = "Pulsa ▶ para escuchar. Cuando termine, escucha otra vez para ver el texto.";
    playLabel.textContent = "Escuchar";

playBtn.addEventListener("click", async () => {

  // If audio is already playing → pause
  if (!audio.paused) {
    audio.pause();
    playBtn.textContent = "▶";
    playLabel.textContent = "Reanudar";
    return;
  }

  try {
    playBtn.disabled = true;

    // Show text logic (keep your existing logic here if needed)

    playBtn.textContent = "⏸";
    playLabel.textContent = "Pausar";

    await audio.play();
    playBtn.disabled = false;

  } catch (e) {
    playBtn.disabled = false;
    playLabel.textContent = "Error";
  }
});

    audio.addEventListener("ended", () => {
      playBtn.disabled = false;
      playCount++;

      if (playCount === 1) {
        status.textContent = "Listo. Ahora escucha otra vez.";
        hint.textContent = "2ª vez: el texto se mostrará. Pulsa ▶ y sigue el texto.";
        playLabel.textContent = "Escuchar otra vez";
      } else {
        story.classList.remove("hidden-text"); // keep visible now
        status.textContent = "Perfecto. Ahora responde las preguntas.";
        hint.textContent = "Puedes volver a escuchar si necesitas.";
        playLabel.textContent = "Repetir";
        unlockQuestions();

        // nice UX on mobile: scroll to questions after 2nd listen
        setTimeout(() => {
          $("qaSection").scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    });
audio.addEventListener("ended", () => {
  playBtn.textContent = "▶";
  playLabel.textContent = "Escuchar";
});
  }

  function initQuestionsOneByOne() {
    const qaWrap = $("qaWrap");
    const qBox = $("qBox");
    const qCounter = $("qCounter");
    const qStatus = $("qStatus");
    const checkBtn = $("checkBtn");
    const mark = $("mark");
    const great = $("great");
    const nextBtn = $("nextBtn");

    let idx = 0;
    let unlocked = false;

    function setLocked(locked) {
      if (locked) {
        qaWrap.classList.add("disabled-area");
        checkBtn.disabled = true;
        unlocked = false;
      } else {
        qaWrap.classList.remove("disabled-area");
        unlocked = true;
        checkBtn.disabled = true; // enabled once user selects option
      }
    }

    function setMark(ok) {
      if (ok) {
        mark.textContent = "✓";
        mark.className = "mark ok";
      } else {
        mark.textContent = "✗";
        mark.className = "mark bad";
      }
    }

    function getSelected() {
      const el = qBox.querySelector('input[name="q"]:checked');
      return el ? el.value : null;
    }

    function render() {
      const total = QUESTIONS.length;
      const item = QUESTIONS[idx];

      qCounter.textContent = `${idx + 1} / ${total}`;
      qStatus.textContent = "Selecciona la respuesta.";
      mark.textContent = "";
      mark.className = "mark";
      checkBtn.disabled = true;

      // build HTML for one question
      qBox.innerHTML = `
        <div class="q-title">${idx + 1}. ${item.q}</div>

        ${["A","B","C"].map(letter => {
          const id = `opt_${idx}_${letter}`;
          const text = item.options[letter];
          return `
            <div class="opt">
              <input type="radio" id="${id}" name="q" value="${letter}">
              <label for="${id}">${letter}) ${text}</label>
            </div>
          `;
        }).join("")}
      `;

      // enable button only after selection
      qBox.querySelectorAll('input[name="q"]').forEach(r => {
        r.addEventListener("change", () => {
          if (unlocked) checkBtn.disabled = false;
        });
      });
    }

    function finish() {
      qStatus.textContent = "¡Listo! ✅";
      setMark(true);
      great.classList.remove("hidden");
      nextBtn.classList.remove("hidden");
      checkBtn.disabled = true;
    }

    checkBtn.addEventListener("click", () => {
      if (!unlocked) return;

      const item = QUESTIONS[idx];
      const sel = getSelected();

      if (!sel) {
        setMark(false);
        qStatus.textContent = "Selecciona una opción.";
        return;
      }

      if (sel === item.correct) {
        setMark(true);
        qStatus.textContent = "¡Correcto! Siguiente…";
        checkBtn.disabled = true;

        setTimeout(() => {
          idx++;
          if (idx >= QUESTIONS.length) {
            finish();
          } else {
            render();
          }
        }, CONFIG.GAP_MS);
      } else {
        setMark(false);
        qStatus.textContent = "Intenta otra vez (puedes mirar el texto).";
      }
    });

    // start locked until 2nd listening ends
    setLocked(true);
    render();

    return {
      unlock: () => setLocked(false)
    };
  }

  function init() {
    gotoStepClicks();

    const qEngine = initQuestionsOneByOne();
    initAudioFlow(() => qEngine.unlock());
  }

  document.addEventListener("DOMContentLoaded", init);
})();