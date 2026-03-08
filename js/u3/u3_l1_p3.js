// ../../../../js/u3/u3_l1_p3.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u3/",
    AUDIO_BASE: "../../../../assets/audio/u3/l1/",
    delayAfterCorrectMs: 2000,
  };

  // Data only (language-neutral)
  const ROUNDS = [
    {
      img: "u3.l1.p1.woman.eating.jpg",
      audio: "u3.l1.p1.emma.mp3",
      correct: "She is eating.",
      wrong: ["He is eating.", "She is reading a book."],
    },
    {
      img: "u3.l1.p1.man.drinking2.jpg",
      audio: "u3.l1.p1.john.mp3",
      correct: "He is drinking.",
      wrong: ["She is cooking.", "He is watching TV."],
    },
    {
      img: "u3.l1.p1.woman.cooking2.jpg",
      audio: "u3.l1.p1.martha.mp3",
      correct: "She is cooking.",
      wrong: ["She is drinking.", "He is sleeping."],
    },
    {
      img: "u3.l1.p1.woman.reading2.jpg",
      audio: "u3.l1.p1.jane.mp3",
      correct: "She is reading a book.",
      wrong: ["He is reading a book.", "She is watching TV."],
    },
    {
      img: "u3.l1.p1.man.watching.jpg",
      audio: "u3.l1.p1.mateo.mp3",
      correct: "He is watching TV.",
      wrong: ["He is playing football.", "She is watching TV."],
    },
    {
      img: "u3.l1.p1.man.playing.jpg",
      audio: "u3.l1.p1.henry.mp3",
      correct: "He is playing football.",
      wrong: ["She is watching TV.", "He is reading a book."],
    },
    {
      img: "u3.l1.p1.woman.singing2.jpg",
      audio: "u3.l1.p1.sherri.mp3",
      correct: "She is singing.",
      wrong: ["He is singing.", "She is drinking."],
    },
    {
      img: "u3.l1.p1.man.listening.jpg",
      audio: "u3.l1.p1.iam.mp3",
      correct: "I am listening to music.",
      wrong: ["I am watching TV.", "He is reading a book."],
    },
  ];

  // DOM
  const $ = (sel) => document.querySelector(sel);
  const sceneImg = $("#sceneImg");
  const playBtn = $("#playBtn");
  const counter = $("#counter");
  const optionsBox = $("#options");
  const nextBtn = $("#nextBtn");

  const audio = new Audio();
  audio.preload = "auto";

  let idx = 0;
  let listened = false;
  let locked = false;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function wireProgressNav() {
    document.querySelectorAll(".step").forEach((step) => {
      step.addEventListener("click", () => {
        const go = step.dataset.go;
        if (!go) return;
        window.location.href = go;
      });
    });
  }

  function setCounter() {
    if (counter) counter.textContent = `${idx + 1}/${ROUNDS.length}`;
  }

  function setOptionsVisible(visible) {
    optionsBox.style.display = visible ? "grid" : "none";
  }

  function clearOptions() {
    optionsBox.innerHTML = "";
  }

  function disableOptions(disabled) {
    optionsBox.querySelectorAll(".opt").forEach((o) => {
      if (disabled) o.classList.add("disabled");
      else o.classList.remove("disabled");
    });
  }

  function loadRound(i) {
    idx = i;
    listened = false;
    locked = false;

    nextBtn?.classList.add("hidden");
    playBtn.disabled = false;

    const r = ROUNDS[idx];
    setCounter();

    sceneImg.src = CONFIG.IMG_BASE + r.img;

    setOptionsVisible(false);
    clearOptions();
  }

  async function playAudio() {
    if (locked) return;
    locked = true;
    playBtn.disabled = true;

    try {
      const r = ROUNDS[idx];
      audio.pause();
      audio.currentTime = 0;
      audio.src = CONFIG.AUDIO_BASE + r.audio;
      await audio.play();

      audio.onended = () => {
        locked = false;
        listened = true;
        // show options after audio
        renderOptions();
      };
    } catch {
      locked = false;
      playBtn.disabled = false; // allow retry
    }
  }

  function renderOptions() {
    if (!listened) return;

    const r = ROUNDS[idx];
    const choices = shuffle([r.correct, ...r.wrong]).slice(0, 3); // ensure 3
    const labels = ["a", "b", "c"];

    setOptionsVisible(true);
    clearOptions();

    choices.forEach((txt, i) => {
      const opt = document.createElement("div");
      opt.className = "opt";
      opt.dataset.choice = txt;
      opt.dataset.correct = (txt === r.correct) ? "1" : "0";

      opt.innerHTML = `
        <div class="badge">${labels[i]}</div>
        <div class="opt-text">${escapeHtml(txt)}</div>
      `;
      optionsBox.appendChild(opt);
    });

    playBtn.disabled = false; // allow replay if you want
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function handleChoice(opt) {
    if (!listened) return;
    if (opt.classList.contains("disabled")) return;

    disableOptions(true);

    const isCorrect = opt.dataset.correct === "1";
    if (isCorrect) {
      opt.classList.add("correct");

      setTimeout(() => {
        const next = idx + 1;
        if (next >= ROUNDS.length) {
          nextBtn?.classList.remove("hidden");
          return;
        }
        loadRound(next);
      }, CONFIG.delayAfterCorrectMs);
    } else {
      opt.classList.add("wrong");
      // allow another try after a short beat
      setTimeout(() => {
        disableOptions(false);
      }, 650);
    }
  }

  function wireEvents() {
    playBtn.addEventListener("click", playAudio);

    optionsBox.addEventListener("click", (e) => {
      const opt = e.target.closest(".opt");
      if (!opt) return;
      handleChoice(opt);
    });
  }

  function init() {
    wireProgressNav();
    wireEvents();
    loadRound(0);
  }

  document.addEventListener("DOMContentLoaded", init);
})();