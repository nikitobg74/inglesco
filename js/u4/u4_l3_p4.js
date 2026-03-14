// js/u4/u4_l3_p4.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  // Lines use {blank:id:word} — the word is shown normally in the text.
  // When the student answers a fill question correctly, that word turns green.

  const PASSAGES = [
    {
      image: IMG + "u4.l3.p4.rich.man.jpg",
      audio: AUD + "u4.l3.p4.rich.man.mp3",
      lines: [
        "This is John.",
        "He is from California.",
        "His house is {blank:house-adj:new} and big.",
        "His car is fast and {blank:car-adj:expensive}.",
        "Today John is at the restaurant.",
        "He is eating dinner.",
      ],
      questions: [
        {
          id: "john-q1",
          statement: "John is at home today.",
          type: "yesno",
          correct: "No",
          options: ["Yes", "No"],
        },
        {
          id: "john-q2",
          statement: "Where is he?",
          type: "choice",
          correct: "A",
          options: [
            { label: "A", text: "He is at the restaurant." },
            { label: "B", text: "He is at the park." },
          ],
        },
        {
          id: "john-q3",
          statement: "His house is ___ and big.",
          type: "fill",
          blankId: "house-adj",
          correct: "new",
          options: ["new", "old"],
        },
        {
          id: "john-q4",
          statement: "His car is fast and ___.",
          type: "fill",
          blankId: "car-adj",
          correct: "expensive",
          options: ["expensive", "slow"],
        },
      ],
    },
    {
      image: IMG + "u4.l3.p4.old.man.jpg",
      audio: AUD + "u4.l3.p4.old.man.mp3",
      lines: [
        "This is Jack.",
        "He is from Ohio.",
        "His house is {blank:house-adj:small} and old.",
        "His car is {blank:car-adj:slow} and cheap.",
        "Today Jack is at home.",
        "He is in the kitchen.",
        "He is cooking dinner.",
      ],
      questions: [
        {
          id: "jack-q1",
          statement: "Jack is at home today.",
          type: "yesno",
          correct: "Yes",
          options: ["Yes", "No"],
        },
        {
          id: "jack-q2",
          statement: "Where is he from?",
          type: "choice",
          correct: "B",
          options: [
            { label: "A", text: "He is from California." },
            { label: "B", text: "He is from Ohio." },
          ],
        },
        {
          id: "jack-q3",
          statement: "His house is ___ and old.",
          type: "fill",
          blankId: "house-adj",
          correct: "small",
          options: ["small", "big"],
        },
        {
          id: "jack-q4",
          statement: "His car is ___ and cheap.",
          type: "fill",
          blankId: "car-adj",
          correct: "slow",
          options: ["fast", "slow"],
        },
      ],
    },
  ];

  const TOTAL_Q = PASSAGES.reduce((sum, p) => sum + p.questions.length, 0);

  let passageIdx  = 0;
  let questionIdx = 0;
  let answeredQ   = 0;
  let isPlaying   = false;
  let audioPlayed = false;
  let playPromise = null;

  const qBar          = document.getElementById("qBar");
  const passageImg    = document.getElementById("passageImg");
  const readingText   = document.getElementById("readingText");
  const playBtn       = document.getElementById("playBtn");
  const playLabel     = document.getElementById("playLabel");
  const questionsArea = document.getElementById("questionsArea");
  const mainArea      = document.getElementById("mainArea");
  const endScreen     = document.getElementById("endScreen");
  const passageBlock  = document.getElementById("passageBlock");

  let audio = new Audio();

  function updateBar() {
    qBar.style.width = (answeredQ / TOTAL_Q * 100) + "%";
  }

  // Renders reading text with words visible from the start.
  // {blank:id:word} -> <span id="txtblank-id">word</span>
  // When student answers the fill question correctly, the span turns green.
  function renderReadingText(passage) {
    readingText.innerHTML = passage.lines.map(line =>
      "<p>" + line.replace(/{blank:([^:}]+):([^}]+)}/g, (_, id, word) => word) + "</p>"
    ).join("");
  }



  function playAudio() {
    if (isPlaying) return;
    isPlaying = true;
    playBtn.innerHTML = "&#9646;&#9646;";
    playBtn.classList.add("playing");
    playBtn.classList.remove("done");
    playLabel.textContent = "Escuchando...";

    playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => { playPromise = null; }).catch(err => {
        if (err.name !== "AbortError") {
          isPlaying = false;
          playBtn.classList.remove("playing");
          playBtn.innerHTML = "&#9654;";
          playLabel.textContent = "No se pudo reproducir.";
        }
        playPromise = null;
      });
    }
  }

  function setPlayIdle() {
    playBtn.innerHTML = "&#9654;";
    playBtn.classList.remove("playing", "done");
    playLabel.textContent = "Toca para escuchar";
  }

  function setPlayDone() {
    playBtn.innerHTML = "&#9654;";
    playBtn.classList.remove("playing");
    playBtn.classList.add("done");
    playLabel.textContent = "\u00a1Escuchado! Toca para repetir";
  }

  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      if (playPromise) {
        playPromise.then(() => audio.pause()).catch(() => {});
        playPromise = null;
      } else {
        audio.pause();
      }
      isPlaying = false;
      playBtn.innerHTML = "&#9654;";
      playBtn.classList.remove("playing");
      playLabel.textContent = "Toca \u25b6 para continuar";
      return;
    }
    if (audioPlayed) { audio.currentTime = 0; }
    playAudio();
  });

  function handleTap(tileEl, q) {
    const allTiles = tileEl.closest(".tiles-row").querySelectorAll(".tile");
    const isCorrect = tileEl.dataset.value === q.correct;

    if (isCorrect) {
      allTiles.forEach(t => t.classList.add("locked"));
      tileEl.classList.add("correct");



      answeredQ++;
      updateBar();

      setTimeout(() => {
        questionIdx++;
        const passage = PASSAGES[passageIdx];
        if (questionIdx < passage.questions.length) {
          showQuestion(passage, questionIdx);
        } else {
          passageIdx++;
          if (passageIdx < PASSAGES.length) {
            loadPassage(passageIdx);
          } else {
            showEnd();
          }
        }
      }, 900);

    } else {
      allTiles.forEach(t => t.classList.add("locked"));
      tileEl.classList.add("wrong", "shake");
      tileEl.addEventListener("animationend", () => {
        tileEl.classList.remove("shake", "wrong");
        allTiles.forEach(t => t.classList.remove("locked"));
      }, { once: true });
    }
  }

  function buildAllQCards(passage) {
    questionsArea.innerHTML = "";
    passage.questions.forEach(q => {
      const card = document.createElement("div");
      card.className = "q-card";
      card.id = "qcard-" + q.id;

      const stmt = document.createElement("div");
      stmt.className = "q-statement";
      stmt.textContent = q.statement;
      card.appendChild(stmt);

      const row = document.createElement("div");
      row.className = "tiles-row";

      if (q.type === "yesno" || q.type === "fill") {
        q.options.forEach(opt => {
          const t = document.createElement("div");
          t.className = "tile";
          t.dataset.value = opt;
          t.textContent = opt;
          t.addEventListener("click", () => handleTap(t, q));
          row.appendChild(t);
        });
      } else if (q.type === "choice") {
        q.options.forEach(opt => {
          const t = document.createElement("div");
          t.className = "tile";
          t.dataset.value = opt.label;
          t.textContent = opt.text;
          t.addEventListener("click", () => handleTap(t, q));
          row.appendChild(t);
        });
      }

      card.appendChild(row);
      questionsArea.appendChild(card);
    });
  }

  function showQuestion(passage, qIdx) {
    questionsArea.querySelectorAll(".q-card").forEach(c => c.classList.remove("active"));
    const card = document.getElementById("qcard-" + passage.questions[qIdx].id);
    if (card) {
      card.classList.add("active");
      card.querySelectorAll(".tile").forEach(t => {
        t.classList.remove("correct", "wrong", "shake", "locked");
      });
      setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    }
  }

  function loadPassage(idx) {
    const passage = PASSAGES[idx];
    questionIdx = 0;
    isPlaying   = false;
    audioPlayed = false;

    const doLoad = () => {
      passageImg.style.opacity = "0";
      passageImg.src = passage.image;
      passageImg.onload = () => { passageImg.style.opacity = "1"; };

      renderReadingText(passage);
      buildAllQCards(passage);

      audio.pause();
      audio = new Audio(passage.audio);
      audio.preload = "auto";

      audio.addEventListener("ended", () => {
        isPlaying   = false;
        audioPlayed = true;
        setPlayDone();
        showQuestion(passage, 0);
      });

      audio.addEventListener("error", () => {
        isPlaying = false;
        playLabel.textContent = "Audio no disponible";
        playBtn.classList.remove("playing");
        playBtn.innerHTML = "&#9654;";
        audioPlayed = true;
        showQuestion(passage, 0);
      });

      setPlayIdle();
      passageBlock.classList.remove("fading");
    };

    if (idx === 0) {
      doLoad();
    } else {
      passageBlock.classList.add("fading");
      setTimeout(doLoad, 380);
    }
  }

  function showEnd() {
    mainArea.style.display = "none";
    endScreen.classList.add("show");
  }

  updateBar();
  loadPassage(0);

})();
