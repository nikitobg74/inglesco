// ===============================
// Unit 1 - Lesson 2 - P4
// Fill in the Blank (click portrait to play, no auto-play)
// ===============================
(() => {
  function textFrom(id, fb) { const e = document.getElementById(id); return e ? e.textContent.trim() : fb; }

  const MSG_CORRECT  = textFrom("msg-correct",  "✅ ¡Correcto!");
  const MSG_WRONG    = textFrom("msg-wrong",    "❌ Intenta de nuevo");
  const MSG_HINT_PRE = textFrom("msg-hint-pre", "💡 Pista:");
  const MSG_ALL_DONE = textFrom("msg-all-done", "🎉 ¡Lección completada!");
  const MAX_WRONG    = 2;

  const data      = JSON.parse(document.getElementById("exercise-data").textContent);
  const imgBase   = data.imgBase   || "";
  const audioBase = data.audioBase || "";
  const nextPage  = data.nextPage  || "../index.html";
  const cards     = data.cards     || [];

  const cardArea    = document.getElementById("cardArea");
  const prevBtn     = document.getElementById("prevBtn");
  const nextBtn     = document.getElementById("nextBtn");
  const cardCounter = document.getElementById("cardCounter");

  let currentIndex = 0;
  let currentAudio = null;

  const cardStates = cards.map(() => ({ wrongCount: 0, solved: false }));

  // ── Audio ────────────────────────────────────────────────────
  function stopAudio() {
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; }
  }
  function playAudio(src) {
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    a.play();
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
  }
  window.addEventListener("beforeunload", stopAudio);

  // ── iOS-safe tap ─────────────────────────────────────────────
  function onTap(el, handler) {
    let moved = false;
    el.addEventListener("touchstart", () => { moved = false; }, { passive: true });
    el.addEventListener("touchmove",  () => { moved = true;  }, { passive: true });
    el.addEventListener("touchend",   e  => { if (!moved) { e.preventDefault(); handler(e); } });
    el.addEventListener("click", handler);
  }

  // ── Build all card DOMs once ─────────────────────────────────
  const cardEls = cards.map((card, cardIdx) => buildCardEl(card, cardIdx));

  function buildCardEl(card, cardIdx) {
    const wrap = document.createElement("div");
    wrap.id = "card-" + cardIdx;
    wrap.style.display = cardIdx === 0 ? "block" : "none";

    // Portrait — click to play audio, no auto-play
    const portraitWrap = document.createElement("div");
    portraitWrap.className = "portrait-wrap";
    const img = document.createElement("img");
    img.src = imgBase + card.img;
    img.alt = card.key;
    const badge = document.createElement("div");
    badge.className = "audio-badge";
    badge.textContent = "🔊";
    portraitWrap.appendChild(img);
    portraitWrap.appendChild(badge);
    onTap(portraitWrap, () => playAudio(audioBase + card.audio));
    wrap.appendChild(portraitWrap);

    // Sentence with inline inputs
    const sentence = document.createElement("div");
    sentence.className = "sentence";
    const blanks = [];

    card.parts.forEach(part => {
      if (part.type === "text") {
        sentence.appendChild(document.createTextNode(" " + part.text + " "));
      } else {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.className = "blank-input";
        inp.placeholder = "...";
        inp.setAttribute("autocomplete","off");
        inp.setAttribute("autocorrect","off");
        inp.setAttribute("autocapitalize","off");
        inp.setAttribute("spellcheck","false");
        sentence.appendChild(inp);
        blanks.push({ inp, answer: part.answer });
      }
    });
    wrap.appendChild(sentence);

    // Dots
    const dotsEl = document.createElement("div");
    dotsEl.className = "attempts-dots";
    for (let i = 0; i < MAX_WRONG; i++) {
      const d = document.createElement("div");
      d.className = "dot";
      dotsEl.appendChild(d);
    }
    wrap.appendChild(dotsEl);

    // Hint
    const hintEl = document.createElement("div");
    hintEl.className = "hint";
    wrap.appendChild(hintEl);

    // Feedback
    const feedbackEl = document.createElement("div");
    feedbackEl.className = "feedback";
    wrap.appendChild(feedbackEl);

    // Buttons
    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";
    const checkBtn = document.createElement("button");
    checkBtn.className = "check-btn";
    checkBtn.textContent = "Verificar ✓";
    const clearEl = document.createElement("button");
    clearEl.className = "clear-btn";
    clearEl.textContent = "Limpiar ✕";
    btnRow.appendChild(checkBtn);
    btnRow.appendChild(clearEl);
    wrap.appendChild(btnRow);

    // ── Check logic ──────────────────────────────────────────
    function doCheck() {
      if (cardStates[cardIdx].solved) return;

      const allCorrect = blanks.every(b =>
        b.inp.value.trim().toLowerCase() === b.answer.toLowerCase()
      );

      if (allCorrect) {
        blanks.forEach(b => {
          b.inp.classList.add("correct");
          b.inp.value    = b.answer;
          b.inp.disabled = true;
        });
        checkBtn.disabled      = true;
        clearEl.style.display  = "none";
        feedbackEl.textContent = MSG_CORRECT;
        feedbackEl.style.color = "#22c55e";
        hintEl.textContent     = "";
        cardStates[cardIdx].solved = true;
        updateNav();

      } else {
        blanks.forEach(b => {
          if (b.inp.value.trim().toLowerCase() !== b.answer.toLowerCase()) {
            b.inp.classList.add("wrong");
            setTimeout(() => b.inp.classList.remove("wrong"), 600);
          }
        });

        cardStates[cardIdx].wrongCount++;
        const wc = cardStates[cardIdx].wrongCount;

        feedbackEl.textContent = MSG_WRONG;
        feedbackEl.style.color = "#ef4444";
        clearEl.style.display  = "inline-block";

        // Dots
        const dotEls = dotsEl.querySelectorAll(".dot");
        dotEls.forEach((d, i) => d.classList.toggle("used", i < Math.min(wc, MAX_WRONG)));

        // Hint after MAX_WRONG
        if (wc >= MAX_WRONG) {
          const answers = blanks.map(b => `"${b.answer}"`).join(", ");
          hintEl.textContent = `${MSG_HINT_PRE} ${answers}`;
          clearTimeout(hintEl._timer);
          hintEl._timer = setTimeout(() => { hintEl.textContent = ""; }, 4000);
        }
      }
    }

    checkBtn.addEventListener("click", doCheck);
    blanks.forEach(b => {
      b.inp.addEventListener("keydown", e => { if (e.key === "Enter") doCheck(); });
      b.inp.addEventListener("input",   () => {
        feedbackEl.textContent = "";
        clearEl.style.display  = "none";
      });
    });

    clearEl.addEventListener("click", () => {
      blanks.forEach(b => { b.inp.value = ""; b.inp.classList.remove("wrong","correct"); });
      feedbackEl.textContent = "";
      clearEl.style.display  = "none";
    });

    cardArea.appendChild(wrap);
    return wrap;
  }

  // ── Navigation ───────────────────────────────────────────────
  function showCard(idx) {
    cardEls.forEach((el, i) => el.style.display = i === idx ? "block" : "none");
    currentIndex = idx;
    stopAudio(); // stop previous card audio when navigating
    updateNav();
  }

  function updateNav() {
    cardCounter.textContent = `${currentIndex + 1} / ${cards.length}`;
    prevBtn.disabled = currentIndex === 0;

    const isLast    = currentIndex === cards.length - 1;
    const allSolved = cardStates.every(s => s.solved);

    if (isLast) {
      nextBtn.textContent = "¡Finalizar! →";
      nextBtn.style.background = allSolved ? "#22c55e" : "";
      nextBtn.disabled = !allSolved;
    } else {
      nextBtn.textContent = "Siguiente →";
      nextBtn.disabled    = false;
    }
  }

  prevBtn.addEventListener("click", () => { if (currentIndex > 0) showCard(currentIndex - 1); });
  nextBtn.addEventListener("click", () => {
    if (currentIndex < cards.length - 1) {
      showCard(currentIndex + 1);
    } else {
      stopAudio();
      window.location.href = nextPage;
    }
  });

  // ── Progress bar ─────────────────────────────────────────────
  document.querySelectorAll(".progress-container .step").forEach(step => {
    const target = step.dataset.page;
    if (!target) return;
    step.addEventListener("click", () => { stopAudio(); window.location.href = target; });
  });

  // ── Init ─────────────────────────────────────────────────────
  updateNav();
  // No auto-play — student taps the portrait when ready
})();
