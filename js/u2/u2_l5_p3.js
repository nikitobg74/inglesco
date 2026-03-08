// u2_l5_p3.js ✅ COPY / PASTE
(() => {
  const CONFIG = {
    AUDIO_BASE: "../../../../assets/audio/u2/l5/",
    AUDIO_FILE: "u2.l5.p3.baker2.mp3",
    GAP_MS: 450,
  };

  const QUESTIONS = [
    {
      q: "Where is Anna?",
      correct: "B",
      options: {
        A: "She is at the bank.",
        B: "She is at the office.",
        C: "She is at the library.",
      }
    },
    {
      q: "Where is Daniel?",
      correct: "A",
      options: {
        A: "He is at the hospital.",
        B: "He is at the supermarket.",
        C: "He is at the restaurant.",
      }
    },
    {
      q: "Where is Lily?",
      correct: "C",
      options: {
        A: "She is at the office.",
        B: "She is at the bank.",
        C: "She is at the supermarket.",
      }
    },
    {
      q: "Where is Ben?",
      correct: "B",
      options: {
        A: "He is at the hospital.",
        B: "He is at the library.",
        C: "He is at the office.",
      }
    },
    {
      q: "Where is Emma?",
      correct: "A",
      options: {
        A: "She is at the bank.",
        B: "She is at the supermarket.",
        C: "She is at the library.",
      }
    },
    {
      q: "Where are you?",
      correct: "C",
      options: {
        A: "I am at the hospital.",
        B: "I am at the office.",
        C: "I am at the restaurant.",
      }
    },
    {
      q: "Is the Baker family at home today?",
      correct: "B",
      options: {
        A: "Yes, the Baker family is at home today.",
        B: "No, the Baker family is not at home today.",
        C: "Yes, the Baker family is at the bank today.",
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

    // playCount = how many COMPLETED plays happened (ended)
    let playCount = 0;
    let revealed = false;

    // start hidden
    story.classList.add("hidden-text");
    status.textContent = "1ª escucha: texto escondido.";
    hint.textContent = "Pulsa ▶ para escuchar. Cuando termine, escucha otra vez para ver el texto.";
    playLabel.textContent = "Escuchar";
    playBtn.textContent = "▶";

    playBtn.addEventListener("click", async () => {
      // If audio is already playing → pause
      if (!audio.paused) {
        audio.pause();
        playBtn.textContent = "▶";
        playLabel.textContent = "Reanudar";
        return;
      }

      // ✅ FIX: On 2nd play START (playCount === 1), reveal immediately
      if (playCount === 1 && !revealed) {
        story.classList.remove("hidden-text");
        revealed = true;
        status.textContent = "2ª escucha: texto visible.";
        hint.textContent = "Sigue el texto mientras escuchas.";
      }

      try {
        playBtn.disabled = true;

        playBtn.textContent = "⏸";
        playLabel.textContent = "Pausar";

        await audio.play();

        playBtn.disabled = false;
      } catch (e) {
        playBtn.disabled = false;
        playBtn.textContent = "▶";
        playLabel.textContent = "Error";
      }
    });

    audio.addEventListener("ended", () => {
      playCount++;

      // reset play button UI
      playBtn.disabled = false;
      playBtn.textContent = "▶";
      playLabel.textContent = "Escuchar";

      if (playCount === 1) {
        status.textContent = "Listo. Ahora escucha otra vez.";
        hint.textContent = "2ª vez: el texto se mostrará al empezar. Pulsa ▶ y sigue el texto.";
        playLabel.textContent = "Escuchar otra vez";
      } else {
        // After 2nd completed play: unlock questions
        status.textContent = "Perfecto. Ahora responde las preguntas.";
        hint.textContent = "Puedes volver a escuchar si necesitas.";
        playLabel.textContent = "Repetir";
        unlockQuestions();

        setTimeout(() => {
          $("qaSection").scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
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
        checkBtn.disabled = true;
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
          if (idx >= QUESTIONS.length) finish();
          else render();
        }, CONFIG.GAP_MS);
      } else {
        setMark(false);
        qStatus.textContent = "Intenta otra vez (puedes mirar el texto).";
      }
    });

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