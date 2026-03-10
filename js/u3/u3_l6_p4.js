(() => {
  "use strict";

  const IMAGE_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l6/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const roundLabel      = document.getElementById("roundLabel");
  const exerciseBox     = document.getElementById("exerciseBox");
  const endScreen       = document.getElementById("endScreen");
  const instrLine       = document.getElementById("instrLine");

  const itemImg         = document.getElementById("itemImg");
  const playBtn         = document.getElementById("playBtn");
  const playLabel       = document.getElementById("playLabel");

  const buildBlock      = document.getElementById("buildBlock");
  const sentenceDisplay = document.getElementById("sentenceDisplay");
  const checkBtn        = document.getElementById("checkBtn");
  const hintBox         = document.getElementById("hintBox");

  const statusLine      = document.getElementById("statusLine");
  const endTitle        = document.getElementById("endTitle");
  const endMsg1         = document.getElementById("endMsg1");
  const endMsg2         = document.getElementById("endMsg2");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr:     "Escucha y escribe el pronombre posesivo.",
    play:      "Escuchar",
    checkBtn:  "Verificar",
    correct:   "✓",
    wrong:     "✗",
    hintLabel: "💡",
    end: {
      title: "¡Fantástico!",
      msg1:  "Felicitaciones.",
      msg2:  "Terminaste la parte 4."
    }
  };

  // ── Rounds — blank is always the possessive pronoun ───────────────────────
  const ROUNDS = [
    {
      image:    "u3.l6.p1.fix.car.jpg",
      audio:    "u3.l6.p3.fix.car.mp3",
      template: ["I am fixing ", "{0}", " car."],
      blanks:   ["my"]
    },
    {
      image:    "u3.l6.p1.woman.fix.car.jpg",
      audio:    "u3.l6.p3.woman.fix.car.mp3",
      template: ["She is fixing ", "{0}", " car."],
      blanks:   ["her"]
    },
    {
      image:    "u3.l6.p1.fix.sink.jpg",
      audio:    "u3.l6.p3.fix.sink.mp3",
      template: ["He is fixing ", "{0}", " sink."],
      blanks:   ["his"]
    },
    {
      image:    "u3.l6.p1.woman.clean.apartment.jpg",
      audio:    "u3.l6.p3.woman.clean.apartment.mp3",
      template: ["She is cleaning ", "{0}", " apartment."],
      blanks:   ["her"]
    },
    {
      image:    "u3.l6.p1.man.clean.window.jpg",
      audio:    "u3.l6.p3.man.clean.window.mp3",
      template: ["He is cleaning ", "{0}", " window."],
      blanks:   ["his"]
    },
    {
      image:    "u3.l6.p1.feed.cat.jpg",
      audio:    "u3.l6.p3.feed.cat.mp3",
      template: ["I am feeding ", "{0}", " cat."],
      blanks:   ["my"]
    },
    {
      image:    "u3.l6.p1.doing.homework.jpg",
      audio:    "u3.l6.p3.doing.homework.mp3",
      template: ["They are doing ", "{0}", " homework."],
      blanks:   ["their"]
    },
    {
      image:    "u3.l6.p1.woman.washing.clothes.jpg",
      audio:    "u3.l6.p3.woman.washing.clothes.mp3",
      template: ["She is washing ", "{0}", " clothes."],
      blanks:   ["her"]
    },
    {
      image:    "u3.l6.p1.painting.jpg",
      audio:    "u3.l6.p3.painting.mp3",
      template: ["We are painting ", "{0}", " bedroom."],
      blanks:   ["our"]
    },
    {
      image:    "u3.l6.p1.girl.brushing.teeth.jpg",
      audio:    "u3.l6.p3.girl.brushing.teeth.mp3",
      template: ["I am brushing ", "{0}", " teeth."],
      blanks:   ["my"]
    },
    {
      image:    "u3.l6.p1.man.read.email.jpg",
      audio:    "u3.l6.p3.man.read.email.mp3",
      template: ["He is reading ", "{0}", " emails."],
      blanks:   ["his"]
    }
  ];

  // ── Shuffle ───────────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const SHUFFLED_ROUNDS = shuffle(ROUNDS);
  const TOTAL           = SHUFFLED_ROUNDS.length;

  let idx       = 0;
  let audio     = null;
  let isLocked  = false;
  let hintTimer = null;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function stopAudio() {
    if (!audio) return;
    try { audio.pause(); audio.currentTime = 0; } catch (e) {}
  }

  function setStatus(type, text) {
    statusLine.textContent = text;
    statusLine.classList.remove("ok", "bad");
    if (type === "ok")  statusLine.classList.add("ok");
    if (type === "bad") statusLine.classList.add("bad");
  }

  function clearHintTimer() {
    if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
  }

  function showHint(round) {
    clearHintTimer();
    hintBox.textContent = CONFIG.hintLabel + " " + round.blanks[0];
    hintBox.classList.add("visible");
    hintTimer = setTimeout(() => {
      hintBox.classList.remove("visible");
    }, 1200);
  }

  // ── Build sentence with input field ──────────────────────────────────────
  function buildSentence(round) {
    while (sentenceDisplay.firstChild) sentenceDisplay.removeChild(sentenceDisplay.firstChild);

    round.template.forEach(part => {
      if (part === "{0}") {
        const inp = document.createElement("input");
        inp.type           = "text";
        inp.className      = "blank-input";
        inp.autocomplete   = "off";
        inp.autocorrect    = "off";
        inp.autocapitalize = "off";
        inp.spellcheck     = false;

        // size to longest possible answer (their = 5 chars)
        const answer = round.blanks[0] || "";
        inp.style.width = Math.max(answer.length * 14 + 20, 72) + "px";

        inp.addEventListener("keydown", e => {
          if (e.key === "Enter") handleCheck();
        });

        sentenceDisplay.appendChild(inp);
      } else {
        const span = document.createElement("span");
        span.textContent = part;
        sentenceDisplay.appendChild(span);
      }
    });

    const inp = sentenceDisplay.querySelector(".blank-input");
    if (inp) setTimeout(() => inp.focus(), 80);
  }

  // ── Check answer ──────────────────────────────────────────────────────────
  function handleCheck() {
    if (isLocked) return;
    const round = SHUFFLED_ROUNDS[idx];
    const inp   = sentenceDisplay.querySelector(".blank-input");
    if (!inp) return;

    const isCorrect = inp.value.trim().toLowerCase() === round.blanks[0].toLowerCase();

    if (isCorrect) {
      isLocked = true;
      clearHintTimer();
      hintBox.classList.remove("visible");
      inp.classList.add("correct");
      inp.disabled      = true;
      checkBtn.disabled = true;
      setStatus("ok", CONFIG.correct);
      setTimeout(() => {
        setStatus("", "");
        isLocked = false;
        advanceOrFinish();
      }, 900);
    } else {
      inp.classList.add("wrong");
      setStatus("bad", CONFIG.wrong);
      setTimeout(() => {
        inp.classList.remove("wrong");
        setStatus("", "");
        showHint(round);
        inp.value = "";
        inp.focus();
      }, 600);
    }
  }

  // ── Load round ────────────────────────────────────────────────────────────
  function loadRound(i) {
    idx = i;
    stopAudio();
    setStatus("", "");
    clearHintTimer();
    hintBox.classList.remove("visible");
    isLocked = false;

    const round = SHUFFLED_ROUNDS[idx];
    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;
    itemImg.src            = IMAGE_BASE + round.image;
    itemImg.alt            = "";
    playLabel.textContent  = CONFIG.play;
    checkBtn.textContent   = CONFIG.checkBtn;
    checkBtn.disabled      = false;

    buildBlock.classList.add("hidden");
  }

  // ── Play button ───────────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    stopAudio();
    const round = SHUFFLED_ROUNDS[idx];
    audio = new Audio(AUDIO_BASE + round.audio);

    const showBuild = () => {
      if (buildBlock.classList.contains("hidden")) {
        buildSentence(round);
        buildBlock.classList.remove("hidden");
        buildBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    };

    audio.onended = showBuild;
    audio.play().catch(showBuild);
  });

  checkBtn.addEventListener("click", handleCheck);

  function advanceOrFinish() {
    if (idx < TOTAL - 1) {
      loadRound(idx + 1);
    } else {
      finish();
    }
  }

  // ── Finish ────────────────────────────────────────────────────────────────
  function finish() {
    stopAudio();
    exerciseBox.classList.add("hidden");
    roundLabel.classList.add("hidden");
    endTitle.textContent = CONFIG.end.title;
    endMsg1.textContent  = CONFIG.end.msg1;
    endMsg2.textContent  = CONFIG.end.msg2;
    endScreen.classList.remove("hidden");
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  loadRound(0);
})();
