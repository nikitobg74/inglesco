// ../../../../js/u2/u2_l2_p4.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/",
    totalRounds: 10,
    gapMs: 650
  };

  // ✅ EXACT mapping: audio -> correct image (your list)
  const ROUNDS = [
    { audio: "u2.l2.p4.restaurant.mp3",    correctImg: "u2.l2.p3.restaurant.jpg" },
    { audio: "u2.l2.p4.park1.mp3",         correctImg: "u2.l2.p4.park1.jpg" },
    { audio: "u2.l2.p4.library.mp3",       correctImg: "u2.l2.p3.library.jpg" },
    { audio: "u2.l2.p4.hospital1.mp3",     correctImg: "u2.l2.p4.hospital1.jpg" },
    { audio: "u2.l2.p4.office1.mp3",       correctImg: "u2.l2.p4.office1.jpg" },
    { audio: "u2.l2.p4.supermarket1.mp3",  correctImg: "u2.l2.p4.supermarket1.jpg" },
    { audio: "u2.l2.p4.hospital2.mp3",     correctImg: "u2.l2.p3.hospital.jpg" },
    { audio: "u2.l2.p4.bank1.mp3",         correctImg: "u2.l2.p3.bank.jpg" },
    { audio: "u2.l2.p4.movietheatre1.mp3", correctImg: "u2.l2.p4.movietheater1.jpg" },
    { audio: "u2.l2.p4.library1.mp3",      correctImg: "u2.l2.p4.library1.jpg" }
  ];

  // Pool for distractor images (we will exclude the correct one each round)
  const DISTRACTORS = [
    "u2.l2.p3.restaurant.jpg",
    "u2.l2.p3.bank.jpg",
    "u2.l2.p3.hospital.jpg",
    "u2.l2.p3.supermarket.jpg",
    "u2.l2.p3.library.jpg",
    "u2.l2.p3.park.jpg",
    "u2.l2.p3.zoo.jpg",
    "u2.l2.p3.postoffice.jpg",
    "u2.l2.p3.movietheater.jpg",
    "u2.l2.p3.office.jpg",
    "u2.l2.p4.park1.jpg",
    "u2.l2.p4.hospital1.jpg",
    "u2.l2.p4.office1.jpg",
    "u2.l2.p4.supermarket1.jpg",
    "u2.l2.p4.movietheater1.jpg",
    "u2.l2.p4.library1.jpg"
  ];

  // Elements (must match your p4.html)
  const steps = Array.from(document.querySelectorAll(".step"));
  const playBox = document.getElementById("playBox");
  const counterBadge = document.getElementById("counterBadge");
  const feedbackEl = document.getElementById("feedback");
  const choicesWrap = document.getElementById("choicesWrap");
  const nextBtn = document.getElementById("nextBtn");

  if (!playBox || !counterBadge || !feedbackEl || !choicesWrap || !nextBtn) {
    console.error("[u2_l2_p4] Missing HTML elements. Check IDs: playBox, counterBadge, feedback, choicesWrap, nextBtn.");
    return;
  }

  const audio = new Audio();
  audio.preload = "auto";

  let roundIndex = 0; // 0..9
  let locked = false;

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const setFeedback = (key) => {
    const msg = feedbackEl.dataset[key] || "";
    feedbackEl.textContent = msg;

    if (key === "correct") feedbackEl.style.color = "#16a34a";
    else if (key === "tryAgain") feedbackEl.style.color = "#dc2626";
    else feedbackEl.style.color = "#2563eb";
  };

  const updateBadge = () => {
    counterBadge.textContent = `${roundIndex + 1}/${CONFIG.totalRounds}`;
  };

  const pickTwoDistractors = (correctImg) => {
    // exclude correct, also exclude duplicates
    const pool = Array.from(new Set(DISTRACTORS)).filter(x => x.trim() !== correctImg.trim());
    return shuffle(pool).slice(0, 2);
  };

  const renderChoices = (correctImg) => {
    choicesWrap.innerHTML = "";

    const d = pickTwoDistractors(correctImg);

    // 3 filenames total
    const filenames = shuffle([correctImg, d[0], d[1]]);

    filenames.forEach((filename) => {
      const card = document.createElement("div");
      card.className = "choice-card";
      card.setAttribute("role", "button");
      card.tabIndex = 0;

      // store the *filename* so we can compare to correctImg reliably
      card.dataset.img = filename;

      const im = document.createElement("img");
      im.src = CONFIG.IMG_BASE + filename;
      im.alt = "Choice";

      card.appendChild(im);

      const pick = () => {
        if (locked) return;

        const clicked = (card.dataset.img || "").trim();
        const expected = (ROUNDS[roundIndex].correctImg || "").trim();

        console.log("[u2_l2_p4] round:", roundIndex + 1, "expected:", expected, "clicked:", clicked);

        if (clicked === expected) {
          locked = true;
          setFeedback("correct");

          setTimeout(() => {
            roundIndex++;

            if (roundIndex >= CONFIG.totalRounds) {
              setFeedback("complete");
              nextBtn.classList.remove("hidden");
              nextBtn.scrollIntoView({ behavior: "smooth", block: "end" });
              return;
            }

            startRound();
          }, CONFIG.gapMs);
        } else {
          setFeedback("tryAgain");
        }
      };

      card.addEventListener("click", pick);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") pick();
      });

      choicesWrap.appendChild(card);
    });
  };

  const startRound = () => {
    locked = false;
    feedbackEl.textContent = "";
    updateBadge();

    const { audio: audioFile, correctImg } = ROUNDS[roundIndex];

    // load audio for this round
    audio.pause();
    audio.currentTime = 0;
    audio.src = CONFIG.AUDIO_BASE + audioFile;

    // render correct + 2 distractors
    renderChoices(correctImg);
  };

  // Progress navigation (optional)
  steps.forEach((s) => {
    s.addEventListener("click", () => {
      const page = s.getAttribute("data-page");
      if (page) window.location.href = page;
    });
  });

  // Single play button => plays ONLY the mp3 for the round
  playBox.addEventListener("click", () => {
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  });

  startRound();
})();