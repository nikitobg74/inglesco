(() => {
  "use strict";

  const IMAGE_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l6/";

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const noteCard       = document.getElementById("noteCard");
  const noteTitle      = document.getElementById("noteTitle");
  const noteSubtitle   = document.getElementById("noteSubtitle");
  const thEn           = document.getElementById("thEn");
  const thEs           = document.getElementById("thEs");
  const noteTableBody  = document.getElementById("noteTableBody");
  const dismissBtn     = document.getElementById("dismissBtn");

  const refPanel       = document.getElementById("refPanel");
  const refToggle      = document.getElementById("refToggle");
  const refToggleLabel = document.getElementById("refToggleLabel");
  const refBody        = document.getElementById("refBody");
  const refThEn        = document.getElementById("refThEn");
  const refThEs        = document.getElementById("refThEs");
  const refTableBody   = document.getElementById("refTableBody");

  const roundLabel     = document.getElementById("roundLabel");
  const exerciseBox    = document.getElementById("exerciseBox");
  const endScreen      = document.getElementById("endScreen");
  const instrLine      = document.getElementById("instrLine");

  const itemImg        = document.getElementById("itemImg");
  const playBtn        = document.getElementById("playBtn");
  const playLabel      = document.getElementById("playLabel");

  const dialogueBlock  = document.getElementById("dialogueBlock");
  const lineA          = document.getElementById("lineA");
  const lineB          = document.getElementById("lineB");

  const fillBlock      = document.getElementById("fillBlock");
  const fillTitle      = document.getElementById("fillTitle");
  const fillSentence   = document.getElementById("fillSentence");
  const tilesContainer = document.getElementById("tilesContainer");

  const statusLine     = document.getElementById("statusLine");
  const endTitle       = document.getElementById("endTitle");
  const endMsg1        = document.getElementById("endMsg1");
  const endMsg2        = document.getElementById("endMsg2");

  // ── Config ────────────────────────────────────────────────────────────────
  const CONFIG = {
    instr: "Escucha, lee y elige el pronombre posesivo correcto.",
    note: {
      title:       "Pronombres posesivos",
      subtitle:    "Usamos estos pronombres para indicar a quién pertenece algo.",
      colEn:       "English",
      colEs:       "Español",
      refLabel:    "📋 Pronombres posesivos",
      rows: [
        { en: "my",    es: "mi / mis" },
        { en: "his",   es: "su (de él)" },
        { en: "her",   es: "su (de ella)" },
        { en: "our",   es: "nuestro / nuestra" },
        { en: "your",  es: "tu / tus" },
        { en: "their", es: "su (de ellos)" }
      ],
      dismiss: "¡Entendido, vamos!"
    },
    play:      "Escuchar",
    fillTitle: "Elige el pronombre correcto:",
    correct:   "✓",
    wrong:     "✗",
    end: {
      title: "¡Muy buen trabajo!",
      msg1:  "Felicitaciones.",
      msg2:  "Terminaste la parte 1."
    }
  };

  // ── Rounds ────────────────────────────────────────────────────────────────
  const ROUNDS = [
    {
      image:      "u3.l6.p1.fix.car.jpg",
      audio:      "u3.l6.p1.fix.car.mp3",
      dialogueA:  [{ text: "What are you doing?" }],
      dialogueB:  [{ text: "I am fixing " }, { text: "my", pronoun: true }, { text: " car." }],
      fill:       [{ text: "I am fixing " }, { text: "my", pronoun: true }, { text: " car." }],
      correct:    "my",
      wrong:      ["his", "her"]
    },
    {
      image:      "u3.l6.p1.woman.fix.car.jpg",
      audio:      "u3.l6.p1.woman.fix.car.mp3",
      dialogueA:  [{ text: "What is she doing?" }],
      dialogueB:  [{ text: "She is fixing " }, { text: "her", pronoun: true }, { text: " car." }],
      fill:       [{ text: "She is fixing " }, { text: "her", pronoun: true }, { text: " car." }],
      correct:    "her",
      wrong:      ["my", "his"]
    },
    {
      image:      "u3.l6.p1.fix.sink.jpg",
      audio:      "u3.l6.p1.fix.sink.mp3",
      dialogueA:  [{ text: "What is he doing?" }],
      dialogueB:  [{ text: "He is fixing " }, { text: "his", pronoun: true }, { text: " sink." }],
      fill:       [{ text: "He is fixing " }, { text: "his", pronoun: true }, { text: " sink." }],
      correct:    "his",
      wrong:      ["my", "her"]
    },
    {
      image:      "u3.l6.p1.woman.clean.apartment.jpg",
      audio:      "u3.l6.p1.woman.clean.apartment.mp3",
      dialogueA:  [{ text: "What is she doing?" }],
      dialogueB:  [{ text: "She is cleaning " }, { text: "her", pronoun: true }, { text: " apartment." }],
      fill:       [{ text: "She is cleaning " }, { text: "her", pronoun: true }, { text: " apartment." }],
      correct:    "her",
      wrong:      ["his", "our"]
    },
    {
      image:      "u3.l6.p1.man.clean.window.jpg",
      audio:      "u3.l6.p1.man.clean.window.mp3",
      dialogueA:  [{ text: "What is he doing?" }],
      dialogueB:  [{ text: "He is cleaning " }, { text: "his", pronoun: true }, { text: " window." }],
      fill:       [{ text: "He is cleaning " }, { text: "his", pronoun: true }, { text: " window." }],
      correct:    "his",
      wrong:      ["her", "my"]
    },
    {
      image:      "u3.l6.p1.feed.cat.jpg",
      audio:      "u3.l6.p1.feed.cat.mp3",
      dialogueA:  [{ text: "What are you doing?" }],
      dialogueB:  [{ text: "I am feeding " }, { text: "my", pronoun: true }, { text: " cat." }],
      fill:       [{ text: "I am feeding " }, { text: "my", pronoun: true }, { text: " cat." }],
      correct:    "my",
      wrong:      ["his", "their"]
    },
    {
      image:      "u3.l6.p1.doing.homework.jpg",
      audio:      "u3.l6.p1.doing.homework.mp3",
      dialogueA:  [{ text: "What are they doing?" }],
      dialogueB:  [{ text: "They are doing " }, { text: "their", pronoun: true }, { text: " homework." }],
      fill:       [{ text: "They are doing " }, { text: "their", pronoun: true }, { text: " homework." }],
      correct:    "their",
      wrong:      ["our", "my"]
    },
    {
      image:      "u3.l6.p1.woman.washing.clothes.jpg",
      audio:      "u3.l6.p1.woman.washing.clothes.mp3",
      dialogueA:  [{ text: "What is she doing?" }],
      dialogueB:  [{ text: "She is washing " }, { text: "her", pronoun: true }, { text: " clothes." }],
      fill:       [{ text: "She is washing " }, { text: "her", pronoun: true }, { text: " clothes." }],
      correct:    "her",
      wrong:      ["his", "their"]
    },
    {
      image:      "u3.l6.p1.painting.jpg",
      audio:      "u3.l6.p1.painting.mp3",
      dialogueA:  [{ text: "What are you doing?" }],
      dialogueB:  [{ text: "We are painting " }, { text: "our", pronoun: true }, { text: " bedroom." }],
      fill:       [{ text: "We are painting " }, { text: "our", pronoun: true }, { text: " bedroom." }],
      correct:    "our",
      wrong:      ["my", "their"]
    },
    {
      image:      "u3.l6.p1.girl.brushing.teeth.jpg",
      audio:      "u3.l6.p1.girl.brushing.teeth.mp3",
      dialogueA:  [{ text: "What are you doing?" }],
      dialogueB:  [{ text: "I am brushing " }, { text: "my", pronoun: true }, { text: " teeth." }],
      fill:       [{ text: "I am brushing " }, { text: "my", pronoun: true }, { text: " teeth." }],
      correct:    "my",
      wrong:      ["her", "his"]
    },
    {
      image:      "u3.l6.p1.man.read.email.jpg",
      audio:      "u3.l6.p1.man.read.email.mp3",
      dialogueA:  [{ text: "What is he doing?" }],
      dialogueB:  [{ text: "He is reading " }, { text: "his", pronoun: true }, { text: " emails." }],
      fill:       [{ text: "He is reading " }, { text: "his", pronoun: true }, { text: " emails." }],
      correct:    "his",
      wrong:      ["my", "her"]
    }
  ];

  const TOTAL = ROUNDS.length;
  let idx     = 0;
  let audio   = null;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

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

  // ── Build pronoun table rows (shared for note + ref panel) ────────────────
  function buildTableRows(tbody, thEnEl, thEsEl) {
    thEnEl.textContent = CONFIG.note.colEn;
    thEsEl.textContent = CONFIG.note.colEs;
    tbody.innerHTML    = "";
    CONFIG.note.rows.forEach(row => {
      const tr   = document.createElement("tr");
      const tdEn = document.createElement("td");
      const tdEs = document.createElement("td");
      tdEn.className   = "col-en";
      tdEs.className   = "col-es";
      tdEn.textContent = row.en;
      tdEs.textContent = row.es;
      tr.appendChild(tdEn);
      tr.appendChild(tdEs);
      tbody.appendChild(tr);
    });
  }

  // ── Render dialogue line ──────────────────────────────────────────────────
  function renderLine(el, speaker, parts) {
    el.innerHTML = "";
    const sp = document.createElement("span");
    sp.className   = "speaker";
    sp.textContent = speaker;
    el.appendChild(sp);
    parts.forEach(part => {
      if (part.pronoun) {
        const mark = document.createElement("span");
        mark.className   = "pronoun";
        mark.textContent = part.text;
        el.appendChild(mark);
      } else {
        el.appendChild(document.createTextNode(part.text));
      }
    });
  }

  // ── Render fill sentence ──────────────────────────────────────────────────
  function renderFillSentence(parts) {
    fillSentence.innerHTML = "";
    parts.forEach(part => {
      if (part.pronoun) {
        const blank = document.createElement("span");
        blank.className   = "fill-blank";
        blank.id          = "fillBlank";
        blank.textContent = "___";
        fillSentence.appendChild(blank);
      } else {
        fillSentence.appendChild(document.createTextNode(part.text));
      }
    });
  }

  // ── Build pronoun tiles ───────────────────────────────────────────────────
  function buildTiles(round) {
    tilesContainer.innerHTML = "";
    const options = shuffle([round.correct, ...round.wrong]);

    options.forEach(word => {
      const btn = document.createElement("button");
      btn.className   = "tile";
      btn.type        = "button";
      btn.textContent = word;

      btn.addEventListener("click", () => {
        if (btn.disabled) return;

        Array.from(tilesContainer.querySelectorAll(".tile"))
          .forEach(b => { b.disabled = true; });

        if (word === round.correct) {
          btn.classList.add("correct");
          const blank = document.getElementById("fillBlank");
          if (blank) {
            blank.textContent            = word;
            blank.style.borderBottom     = "3px solid #16a34a";
            blank.style.color            = "#16a34a";
          }
          setStatus("ok", CONFIG.correct);
          setTimeout(() => {
            setStatus("", "");
            advanceOrFinish();
          }, 1000);
        } else {
          btn.classList.add("wrong");
          setStatus("bad", CONFIG.wrong);
          setTimeout(() => {
            btn.classList.remove("wrong");
            Array.from(tilesContainer.querySelectorAll(".tile"))
              .forEach(b => { b.disabled = false; });
            setStatus("", "");
          }, 700);
        }
      });

      tilesContainer.appendChild(btn);
    });
  }

  // ── Load round ────────────────────────────────────────────────────────────
  function loadRound(i) {
    idx = i;
    stopAudio();
    setStatus("", "");

    const round = ROUNDS[idx];
    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;

    itemImg.src = IMAGE_BASE + round.image;
    itemImg.alt = "";

    dialogueBlock.classList.add("hidden");
    fillBlock.classList.add("hidden");
    playLabel.textContent = CONFIG.play;
    playBtn.disabled      = false;
  }

  // ── Play button ───────────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    stopAudio();
    playBtn.disabled = true;

    const round = ROUNDS[idx];

    renderLine(lineA, "A: ", round.dialogueA);
    renderLine(lineB, "B: ", round.dialogueB);
    dialogueBlock.classList.remove("hidden");

    audio = new Audio(AUDIO_BASE + round.audio);

    const showFill = () => {
      fillTitle.textContent = CONFIG.fillTitle;
      renderFillSentence(round.fill);
      buildTiles(round);
      fillBlock.classList.remove("hidden");
      fillBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    audio.onended = showFill;
    audio.play().catch(showFill);
  });

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
    refPanel.classList.add("hidden");
    endTitle.textContent = CONFIG.end.title;
    endMsg1.textContent  = CONFIG.end.msg1;
    endMsg2.textContent  = CONFIG.end.msg2;
    endScreen.classList.remove("hidden");
  }

  // ── Collapsible ref panel toggle ──────────────────────────────────────────
  refToggle.addEventListener("click", () => {
    const isOpen = refBody.classList.contains("open");
    refBody.classList.toggle("open", !isOpen);
    refToggle.classList.toggle("open", !isOpen);
  });

  // ── Note card init ────────────────────────────────────────────────────────
  function initNoteCard() {
    noteTitle.textContent    = CONFIG.note.title;
    noteSubtitle.textContent = CONFIG.note.subtitle;
    buildTableRows(noteTableBody, thEn, thEs);
    dismissBtn.textContent   = CONFIG.note.dismiss;

    dismissBtn.addEventListener("click", () => {
      noteCard.classList.add("hidden");

      // Build ref panel table and show it
      buildTableRows(refTableBody, refThEn, refThEs);
      refToggleLabel.textContent = CONFIG.note.refLabel;
      refPanel.classList.remove("hidden");

      roundLabel.classList.remove("hidden");
      exerciseBox.classList.remove("hidden");
      loadRound(0);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  instrLine.textContent = CONFIG.instr;
  initNoteCard();
})();
