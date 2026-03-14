// js/u4/u4_l3_p5.js
(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";
  const IMG  = BASE + "images/u4/";
  const AUD  = BASE + "audio/u4/";

  const PASSAGES = [
    {
      image: IMG + "u4.l3.p5.rich.woman.jpg",
      audio: AUD + "u4.l3.p5.rich.woman.mp3",
      lines: [
        "This is Maria.",
        "She is from Texas.",
        "Her house is new and modern.",
        "Her car is fast and expensive.",
        "Today Maria is not at home.",
        "She is eating dinner at the restaurant.",
      ],
      questions: [
        {
          id: "maria-q1",
          statement: "Where is Maria?",
          type: "choice",
          correct: "A",
          options: [
            { label: "A", text: "She is at the restaurant." },
            { label: "B", text: "She is at home." },
          ],
        },
        {
          id: "maria-q2",
          statement: "Her house is small and modern.",
          type: "yesno",
          correct: "No",
          options: ["Yes", "No"],
        },
        {
          id: "maria-q3",
          statement: "Her car is cheap and fast.",
          type: "yesno",
          correct: "No",
          options: ["No", "Yes"],
        },
        {
          id: "maria-q4",
          statement: "She is eating dinner in the kitchen.",
          type: "yesno",
          correct: "No",
          options: ["Yes", "No"],
        },
      ],
    },
    {
      image: IMG + "u4.l3.p5.woman.park.jpg",
      audio: AUD + "u4.l3.p5.woman.park.mp3",
      lines: [
        "This is Anna.",
        "She is from Florida.",
        "Her house is small and old.",
        "Her car is slow and cheap.",
        "Today Anna is not at home.",
        "She is playing with her big dog at the park.",
      ],
      questions: [
        {
          id: "anna-q1",
          statement: "Where is Anna?",
          type: "choice",
          correct: "B",
          options: [
            { label: "A", text: "She is at the restaurant." },
            { label: "B", text: "She is at the park." },
          ],
        },
        {
          id: "anna-q2",
          statement: "Her house is small and expensive.",
          type: "yesno",
          correct: "No",
          options: ["No", "Yes"],
        },
        {
          id: "anna-q3",
          statement: "Her car is fast and old.",
          type: "yesno",
          correct: "No",
          options: ["Yes", "No"],
        },
        {
          id: "anna-q4",
          statement: "She is playing with her cat.",
          type: "yesno",
          correct: "No",
          options: ["No", "Yes"],
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

  function renderReadingText(passage) {
    readingText.innerHTML = passage.lines.map(line => "<p>" + line + "</p>").join("");
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

      if (q.type === "yesno") {
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
