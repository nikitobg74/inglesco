// u2_l7_p2.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    REVEAL_MS: 2000
  };

  // Using your exact img links + patterns.
  // Student types the FULL answer (no max length).
  const ITEMS = [
    { answer: "pen",            img: "u2.l6.p1.pen.jpg",            pattern: "p _ n" },
    { answer: "book",           img: "u2.l6.p1.book.jpg",           pattern: "b _ _ k" },
    { answer: "desk",           img: "u2.l6.p1.desk.jpg",           pattern: "d _ s k" },
    { answer: "chair",          img: "u2.l6.p1.chair.jpg",          pattern: "ch _ _ r" },
    { answer: "map",            img: "u2.l6.p4.map.jpg",            pattern: "m _ p" },
    { answer: "clock",          img: "u2.l6.p4.clock.jpg",          pattern: "cl _ _ k" },
    { answer: "table",          img: "u2.l6.p4.table.jpg",          pattern: "t _ b l e" },
    { answer: "board",          img: "u2.l6.p4.board.jpg",          pattern: "b _ a r d" },
    { answer: "laptop",         img: "u2.l6.p1.laptop.jpg",         pattern: "l _ p t _ p" },
    { answer: "globe",          img: "u2.l6.p1.globe.jpg",          pattern: "gl _ b e" },
    { answer: "pencil",         img: "u2.l6.p4.pencil.jpg",         pattern: "p e n c _ l" },
    { answer: "backpack",       img: "u2.l6.p1.bagpack.jpg",        pattern: "b _ c k p _ c k" }, // your filename
    { answer: "dictionary",     img: "u2.l6.p1.dictionary.jpg",     pattern: "d i c t i _ n a r y" },
    { answer: "bookshelf",      img: "u2.l6.p4.bookshelf.jpg",      pattern: "b _ _ k s h e l f" },
    { answer: "bulletin board", img: "u2.l6.p4.bulletin.board.jpg", pattern: "b u l l e t i n  b _ a r d" }
  ];

  const $ = (id) => document.getElementById(id);
  const joinPath = (base, file) => (file ? base + file : "");

  const state = {
    filled: new Array(ITEMS.length).fill(false),
    solved: new Array(ITEMS.length).fill(false),
    hintLock: new Array(ITEMS.length).fill(false)
  };

  function normalize(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " "); // supports "bulletin board"
  }

  function render() {
    const grid = $("itemsGrid");
    grid.innerHTML = "";

    ITEMS.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "item";

      const img = document.createElement("img");
      img.alt = item.answer;
      img.src = joinPath(CONFIG.IMG_BASE, item.img);
      row.appendChild(img);

      const main = document.createElement("div");
      main.className = "item-main";

      const top = document.createElement("div");
      top.className = "row-top";

      const label = document.createElement("div");
      label.className = "label";
      label.textContent = `#${idx + 1}`;
      top.appendChild(label);

      main.appendChild(top);

      // Pattern + hint
      const maskLine = document.createElement("div");
      maskLine.className = "mask-line";

      const mask = document.createElement("span");
      mask.className = "mask";
      mask.textContent = item.pattern;

      const hintBtn = document.createElement("button");
      hintBtn.type = "button";
      hintBtn.className = "hint-btn";
      hintBtn.textContent = "👁 Hint";
      hintBtn.addEventListener("click", () => revealAnswer(idx, mask, hintBtn, item.answer, item.pattern));

      maskLine.appendChild(mask);
      maskLine.appendChild(hintBtn);
      main.appendChild(maskLine);

      // Input full word
      const input = document.createElement("input");
      input.className = "input";
      input.type = "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.inputMode = "text";
      input.placeholder = "Type the full word…";
      input.dataset.index = String(idx);

      input.addEventListener("input", () => {
        const val = normalize(input.value);
        state.filled[idx] = val.length > 0;

        // remove marks while typing
        input.classList.remove("wrong", "correct");
        state.solved[idx] = false;

        updateCheckEnabled();
        updateFinish();
      });

      main.appendChild(input);

      row.appendChild(main);
      grid.appendChild(row);
    });
  }

  function revealAnswer(idx, maskEl, btnEl, answer, pattern) {
    if (state.hintLock[idx]) return;
    state.hintLock[idx] = true;
    btnEl.disabled = true;

    maskEl.textContent = answer;

    setTimeout(() => {
      maskEl.textContent = pattern;
      state.hintLock[idx] = false;
      btnEl.disabled = false;
    }, CONFIG.REVEAL_MS);
  }

  function updateCheckEnabled() {
    $("checkBtn").disabled = !state.filled.every(Boolean);
  }

  function doCheck() {
    const inputs = Array.from(document.querySelectorAll(".input"));
    inputs.forEach((input) => {
      const idx = Number(input.dataset.index);
      const typed = normalize(input.value);
      const expected = normalize(ITEMS[idx].answer);

      input.classList.remove("wrong", "correct");

      if (typed === expected) {
        input.classList.add("correct");
        state.solved[idx] = true;
      } else {
        input.classList.add("wrong");
        state.solved[idx] = false;
      }
    });

    updateFinish();
  }

  function updateFinish() {
    const allCorrect = state.solved.every(Boolean);
    $("finishBtn").classList.toggle("hidden", !allCorrect);
    $("doneBadge").classList.toggle("hidden", !allCorrect);
  }

  function wireProgressNav() {
    document.querySelectorAll(".step").forEach(step => {
      step.addEventListener("click", () => {
        const go = step.getAttribute("data-go");
        if (go) window.location.href = go;
      });
    });
  }

  // Init
  render();
  wireProgressNav();
  updateCheckEnabled();
  $("checkBtn").addEventListener("click", doCheck);
})();