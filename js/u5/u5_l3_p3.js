(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  const LETTERS = ["A", "B", "C", "D"];

  const EXERCISES = [
    {
      person: "Parents",
      image:  BASE + "images/u5/u5.l1.p2.mother.father.jpg",
      phrases: [
        "My parents are not at home today.",
        "They are at the beach.",
        "They are not swimming.",
        "They are drinking cocktails."
      ]
    },
    {
      person: "Sister",
      image:  BASE + "images/u5/u5.sister.english.jpg",
      phrases: [
        "My sister is not at home today.",
        "She is at the library.",
        "She is not studying math.",
        "She is studying English."
      ]
    },
    {
      person: "Brother",
      image:  BASE + "images/u5/u5.brother.riding.jpg",
      phrases: [
        "My brother is not at home today.",
        "He is at the park.",
        "He is not playing ball.",
        "He is riding his bicycle."
      ]
    },
    {
      person: "Dog",
      image:  BASE + "images/u5/u5.dog.play.jpg",
      phrases: [
        "Our dog is not at home today.",
        "He is at the park.",
        "He is not sleeping.",
        "He is playing ball."
      ]
    },
    {
      person: "Grandmother",
      image:  BASE + "images/u5/u5.grandmother.planting.jpg",
      phrases: [
        "My grandmother is not at home today.",
        "She is in the garden.",
        "She is not cooking.",
        "She is planting flowers."
      ]
    },
    {
      person: "Grandfather",
      image:  BASE + "images/u5/u5.grandfather.jpg",
      phrases: [
        "My grandfather is busy today.",
        "He is in the bathroom.",
        "He is not cleaning.",
        "He is fixing the shower."
      ]
    }
  ];

  let exIndex = 0;
  let placed  = [];   // { phrase, tileBtn } in placement order
  let solved  = false;

  const imgEl      = document.getElementById("lessonImg");
  const personLabel= document.getElementById("personLabel");
  const dropZone   = document.getElementById("dropZone");
  const tilesEl    = document.getElementById("tiles");
  const counter    = document.getElementById("counter");
  const bar        = document.getElementById("progressBar");
  const endScreen  = document.getElementById("endScreen");

  // ── Load exercise ─────────────────────────────────────────
  function loadExercise() {
    solved = false;
    placed = [];

    const ex = EXERCISES[exIndex];
    counter.textContent = `${exIndex + 1} / ${EXERCISES.length}`;
    bar.style.width = ((exIndex + 1) / EXERCISES.length * 100) + "%";

    imgEl.src = ex.image;
    imgEl.alt = ex.person;
    personLabel.textContent = ex.person;

    dropZone.className = "drop-zone";
    dropZone.innerHTML = "";
    tilesEl.innerHTML = "";

    // Shuffle phrase tiles for display
    const shuffled = [...ex.phrases];
    do { shuffle(shuffled); }
    while (shuffled.join("|") === ex.phrases.join("|"));

    shuffled.forEach(phrase => {
      const btn = document.createElement("button");
      btn.className = "phrase-tile";
      btn.textContent = phrase;
      btn.dataset.phrase = phrase;
      btn.onclick = () => placeTile(btn, phrase);
      tilesEl.appendChild(btn);
    });
  }

  // ── Place a tile into the drop zone ──────────────────────
  function placeTile(btn, phrase) {
    if (solved) return;

    btn.classList.add("used");
    placed.push({ phrase, btn });

    const ex = EXERCISES[exIndex];
    const posIndex = placed.length - 1;        // 0-based position just placed
    const letter = LETTERS[posIndex] || String(posIndex + 1);
    const correctPhrase = ex.phrases[posIndex];

    // Build chip
    const chip = document.createElement("div");
    chip.className = "placed-chip";
    chip.innerHTML = `<span class="chip-letter">${letter}</span><span>${phrase}</span>`;

    // Check correctness
    if (phrase === correctPhrase) {
      // Correct position
      chip.classList.add("correct-chip");
      dropZone.appendChild(chip);

      // All phrases placed correctly?
      if (placed.length === ex.phrases.length) {
        solved = true;
        dropZone.classList.add("correct-all");
        setTimeout(advance, 1200);
      }
    } else {
      // Wrong position — show red chip briefly, then clear
      chip.classList.add("error-chip");
      dropZone.appendChild(chip);

      setTimeout(() => {
        // Remove the wrong chip from drop zone
        chip.remove();
        // Return tile to bank
        btn.classList.remove("used");
        placed.pop();
      }, 500);
    }
  }

  // ── Advance ───────────────────────────────────────────────
  function advance() {
    exIndex++;
    if (exIndex >= EXERCISES.length) {
      document.querySelector(".card").style.display = "none";
      endScreen.style.display = "block";
      return;
    }
    loadExercise();
  }

  // ── Shuffle helper ────────────────────────────────────────
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  // ── Init — shuffle exercises then start ───────────────────
  shuffle(EXERCISES);
  loadExercise();
})();
