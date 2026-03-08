// ../../../../js/u3/u3_l1_p1.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u3/",
    AUDIO_BASE: "../../../../assets/audio/u3/l1/",
  };

  // ---------- Data (language-neutral JS: no Spanish strings) ----------
  const VOCAB = [
    {
      img: "u3.l1.p1.woman.eating.jpg",
      audio: "u3.l1.p1.eating.mp3",
      baseEn: "eat",
      baseEs: "comer",
      ingEn: "eating",
      ingEs: "comiendo",
    },
    {
      img: "u3.l1.p1.woman.drinking.jpg",
      audio: "u3.l1.p1.drinking.mp3",
      baseEn: "drink",
      baseEs: "beber",
      ingEn: "drinking",
      ingEs: "bebiendo",
    },
    {
      img: "u3.l1.p1.woman.cooking.jpg",
      audio: "u3.l1.p1.cooking.mp3",
      baseEn: "cook",
      baseEs: "cocinar",
      ingEn: "cooking",
      ingEs: "cocinando",
    },
    {
      img: "u3.l1.p1.woman.reading.jpg",
      audio: "u3.l1.p1.reading.mp3",
      baseEn: "read",
      baseEs: "leer",
      ingEn: "reading",
      ingEs: "leyendo",
    },
    {
      img: "u3.l1.p1.man.watching.jpg",
      audio: "u3.l1.p1.watching.mp3",
      baseEn: "watch TV",
      baseEs: "ver TV",
      ingEn: "watching TV",
      ingEs: "viendo TV",
    },
    {
      img: "u3.l1.p1.man.playing.jpg",
      audio: "u3.l1.p1.playing.mp3",
      baseEn: "play football",
      baseEs: "jugar al fútbol",
      ingEn: "playing football",
      ingEs: "jugando al fútbol",
    },
    {
      img: "u3.l1.p1.woman.singing.jpg",
      audio: "u3.l1.p1.singing.mp3",
      baseEn: "sing",
      baseEs: "cantar",
      ingEn: "singing",
      ingEs: "cantando",
    },
    {
      img: "u3.l1.p1.woman.listening.jpg",
      audio: "u3.l1.p1.listening.mp3",
      baseEn: "listen to music",
      baseEs: "escuchar música",
      ingEn: "listening to music",
      ingEs: "escuchando música",
    },
  ];

  const DRILLS = [
    {
      img: "u3.l1.p1.woman.eating.jpg",
      audio: "u3.l1.p1.emma.mp3",
      phrase: "Emma is at home. She is eating.",
      answer: "eating",
    },
    {
      img: "u3.l1.p1.man.drinking.jpg",
      audio: "u3.l1.p1.john.mp3",
      phrase: "John is in the bedroom. He is drinking.",
      answer: "drinking",
    },
    {
      img: "u3.l1.p1.woman.cooking2.jpg",
      audio: "u3.l1.p1.martha.mp3",
      phrase: "Martha is in the kitchen. She is cooking.",
      answer: "cooking",
    },
    {
      img: "u3.l1.p1.woman.reading2.jpg",
      audio: "u3.l1.p1.jane.mp3",
      phrase: "Jane is in the bedroom. She is reading a book.",
      answer: "reading",
    },
    {
      img: "u3.l1.p1.man.watching.jpg",
      audio: "u3.l1.p1.mateo.mp3",
      phrase: "Mateo is in the living room. He is watching TV.",
      answer: "watching",
    },
    {
      img: "u3.l1.p1.man.playing.jpg",
      audio: "u3.l1.p1.henry.mp3",
      phrase: "Henry is at the park. He is playing football.",
      answer: "playing",
    },
    {
      img: "u3.l1.p1.woman.singing2.jpg",
      audio: "u3.l1.p1.sherri.mp3",
      phrase: "Sherri is at the theater. She is singing.",
      answer: "singing",
    },
    {
      img: "u3.l1.p1.man.listening.jpg",
      audio: "u3.l1.p1.iam.mp3",
      phrase: "I am at home. I am listening to music.",
      answer: "listening",
    },
  ];

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);

  function safeText(str) {
    return String(str ?? "");
  }

  function highlightIng(word) {
    // highlight trailing "ing" if present
    const w = safeText(word);
    if (w.toLowerCase().endsWith("ing") && w.length > 3) {
      const base = w.slice(0, -3);
      const ing = w.slice(-3);
      return `${escapeHtml(base)}<span class="ing">${escapeHtml(ing)}</span>`;
    }
    return escapeHtml(w);
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function createAudioPlayer() {
    const a = new Audio();
    a.preload = "auto";
    return a;
  }

  function setButtonBusy(btn, busy) {
    btn.disabled = busy;
    btn.dataset.busy = busy ? "1" : "0";
  }

  // ---------- Progress lock ----------
  function lockProgress(isLocked) {
    document.querySelectorAll(".step").forEach((step) => {
      const go = step.dataset.go;
      if (!go || go === "p1.html") return;

      if (isLocked) {
        step.classList.add("locked");
        step.setAttribute("aria-disabled", "true");
      } else {
        step.classList.remove("locked");
        step.removeAttribute("aria-disabled");
      }
    });
  }

  function wireProgressNav() {
    document.querySelectorAll(".step").forEach((step) => {
      step.addEventListener("click", () => {
        const go = step.dataset.go;
        if (!go) return;
        if (step.classList.contains("locked")) return;
        window.location.href = go;
      });
    });
  }

  // ---------- Render Part 1 ----------
  function renderVocab() {
    const grid = $("#vocabGrid");
    if (!grid) return;

    const audio = createAudioPlayer();

    grid.innerHTML = VOCAB.map((v, idx) => {
      const n = idx + 1;
      return `
        <div class="card" data-idx="${n}">
          <div class="imgbox">
            <img src="${CONFIG.IMG_BASE + v.img}" alt="">
          </div>

          <div class="play-row">
            <button class="btn vocab-play" type="button"
              data-audio="${v.audio}">
              🔊 Escuchar
            </button>
          </div>

          <div class="lines">
            <div class="en">${escapeHtml(v.baseEn)} → ${highlightIng(v.ingEn)}</div>
            <div class="es">${escapeHtml(v.baseEs)} → ${escapeHtml(v.ingEs)}</div>
          </div>
        </div>
      `;
    }).join("");

    grid.addEventListener("click", async (e) => {
      const btn = e.target.closest(".vocab-play");
      if (!btn) return;

      if (btn.dataset.busy === "1") return;
      setButtonBusy(btn, true);

      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = CONFIG.AUDIO_BASE + btn.dataset.audio;
        await audio.play();
        audio.onended = () => setButtonBusy(btn, false);
      } catch {
        setButtonBusy(btn, false);
      }
    });
  }

  // ---------- Render Part 2 ----------
  function renderDrills() {
    const list = $("#drillList");
    if (!list) return;

    const audio = createAudioPlayer();

    list.innerHTML = DRILLS.map((d, idx) => {
      const visible = idx === 0 ? "" : "collapsed";
      const n = idx + 1;

      // phrase highlight: highlight the target word in the phrase (first occurrence)
      const phraseHtml = escapeHtml(d.phrase).replace(
        new RegExp(`\\b${d.answer}\\b`, "i"),
        highlightIng(d.answer)
      );

      return `
        <div class="card drill-card ${visible}" data-drill="${idx}" aria-label="Ejercicio ${n}">
          <div class="imgbox">
            <img src="${CONFIG.IMG_BASE + d.img}" alt="">
          </div>

          <div class="play-row">
            <button class="btn drill-play" type="button" data-audio="${d.audio}">
              🔊 Escuchar diálogo
            </button>
            <div class="status" data-status="idle">—</div>
          </div>

          <div class="phrase">${phraseHtml}</div>

          <div class="hint">
            <span data-need="listen"></span>
          </div>

          <div class="input-row">
            <input class="word-input" type="text" inputmode="latin" autocomplete="off" spellcheck="false"
              data-answer="${escapeHtml(d.answer)}" disabled>
          </div>
        </div>
      `;
    }).join("");

    const state = {
      listened: new Array(DRILLS.length).fill(false),
      correct: new Array(DRILLS.length).fill(false),
    };

    function revealNext(idx) {
      const next = list.querySelector(`.drill-card[data-drill="${idx + 1}"]`);
      if (!next) return;
      next.classList.remove("collapsed");
      next.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function allDone() {
      return state.listened.every(Boolean) && state.correct.every(Boolean);
    }

    function updateCompletionUI() {
      if (allDone()) {
        // unlock progress + show next button
        lockProgress(false);
        $("#nextBtn")?.classList.remove("hidden");
      }
    }

    list.addEventListener("click", async (e) => {
      const btn = e.target.closest(".drill-play");
      if (!btn) return;

      const card = btn.closest(".drill-card");
      const idx = Number(card?.dataset.drill);
      if (!Number.isFinite(idx)) return;

      if (btn.dataset.busy === "1") return;
      setButtonBusy(btn, true);

      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = CONFIG.AUDIO_BASE + btn.dataset.audio;

        await audio.play();

        audio.onended = () => {
          setButtonBusy(btn, false);
          state.listened[idx] = true;

          const input = card.querySelector(".word-input");
          if (input && !state.correct[idx]) {
            input.disabled = false;
            input.focus();
          }
          updateCompletionUI();
        };
      } catch {
        setButtonBusy(btn, false);
      }
    });

    list.addEventListener("input", (e) => {
      const input = e.target.closest(".word-input");
      if (!input) return;

      const card = input.closest(".drill-card");
      const idx = Number(card?.dataset.drill);
      if (!Number.isFinite(idx)) return;

      const answer = (input.dataset.answer || "").trim().toLowerCase();
      const typed = (input.value || "").trim().toLowerCase();

      const status = card.querySelector(".status");

    if (typed === answer && state.listened[idx]) {
  state.correct[idx] = true;
  input.disabled = true;
  input.style.borderColor = "rgba(34,197,94,.65)";
  status?.classList.add("ok");
  if (status) status.textContent = "OK";

  // Delay before showing next
  setTimeout(() => {
    revealNext(idx);
    updateCompletionUI();
  }, 2000);
} else {
        if (status) status.textContent = "—";
        status?.classList.remove("ok");
      }
    });
  }

  // ---------- Init ----------
  function init() {
    lockProgress(false);
    wireProgressNav();
    renderVocab();
    renderDrills();
  }

  document.addEventListener("DOMContentLoaded", init);
})();