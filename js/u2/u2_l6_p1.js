// ../../../../js/u2/u2_l6_p1.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/l6/",
  };

  // ===== Story assets =====
  const STORY = {
    img: "u2.l6.p1.Iam.classroom.jpg",
    audio: "u2.l6.p1.atschool.mp3",
    text:
`I am not at home. I am at school.

Mateo is not at home. He is at school.

Emma is not at home. She is at school.

Jane and Linda are not at home. They are at school too.

Where is Mateo? He is in the classroom.

Where is Emma? She is in the classroom.

Where are Jane and Linda? They are in the classroom.

We are at school today.

All the students are in the classroom today.`
  };

  // ===== Mini Quiz (A/B) =====
  // Each question: prompt + two choices + correct index (0 or 1)
  const QUIZ = [
    {
      prompt: "Mateo is not at home. He is _____.",
      choices: ["at school", "at home"],
      correct: 0
    },
    {
      prompt: "Emma is not at home. She is _____.",
      choices: ["at school", "at the bank"],
      correct: 0
    },
    {
      prompt: "Where is Mateo? He is in the _____.",
      choices: ["classroom", "garage"],
      correct: 0
    },
    {
      prompt: "Jane and Linda are not at home. They are at _____ too.",
      choices: ["school", "the park"],
      correct: 0
    }
  ];

  // ===== Object list (image + audio) =====
  const OBJECTS = [
    { word: "pen",        img: "u2.l6.p1.pen.jpg",        audio: "u2.l6.p1.pen.mp3" },
    { word: "book",       img: "u2.l6.p1.book.jpg",       audio: "u2.l6.p1.book.mp3" },
    { word: "desk",       img: "u2.l6.p1.desk.jpg",       audio: "u2.l6.p1.desk.mp3" },
    { word: "laptop",     img: "u2.l6.p1.laptop.jpg",     audio: "u2.l6.p1.laptop.mp3" },
    { word: "chair",      img: "u2.l6.p1.chair.jpg",      audio: "u2.l6.p1.chair.mp3" },
    { word: "bag",   		img: "u2.l6.p1.bag.jpg",    audio: "u2.l6.p1.bag.mp3" }, // your filename
    { word: "dictionary", img: "u2.l6.p1.dictionary.jpg", audio: "u2.l6.p1.dictionary.mp3" },
    { word: "globe",      img: "u2.l6.p1.globe.jpg",      audio: "u2.l6.p1.globe.mp3" },
  ];

  // ===== DOM =====
  const storyImg = document.getElementById("storyImg");
  const storyText = document.getElementById("storyText");
  const playStoryBtn = document.getElementById("playStoryBtn");
  const storyAudio = document.getElementById("storyAudio");
  const nextBtn = document.getElementById("nextBtn");
  const doneBadge = document.getElementById("doneBadge");
  const quizWrap = document.getElementById("quizWrap");
  const itemsGrid = document.getElementById("itemsGrid");

  // ===== Helpers =====
  const safePlay = async (audioEl) => {
    try {
      await audioEl.play();
      return true;
    } catch (err) {
      console.warn("Audio play blocked or failed:", err);
      return false;
    }
  };

  const lockBtn = (btn, locked) => {
    btn.disabled = locked;
    btn.style.filter = locked ? "grayscale(0.15)" : "";
  };

  const setNextVisible = () => {
    nextBtn.classList.remove("hidden");
    doneBadge.classList.remove("hidden");
  };

  // ===== Progress step navigation =====
  document.querySelectorAll(".step").forEach(step => {
    step.addEventListener("click", () => {
      const go = step.getAttribute("data-go");
      if (go) window.location.href = go;
    });
  });

  // ===== Init Story =====
  storyImg.src = CONFIG.IMG_BASE + STORY.img;
  storyText.textContent = STORY.text;
  storyAudio.src = CONFIG.AUDIO_BASE + STORY.audio;

  // Play/Pause/Resume toggle
  playStoryBtn.addEventListener("click", async () => {
    // playing -> pause
    if (!storyAudio.paused && !storyAudio.ended) {
      storyAudio.pause();
      playStoryBtn.textContent = "▶ Resume";
      return;
    }

    // ended -> restart
    if (storyAudio.ended) storyAudio.currentTime = 0;

    const ok = await safePlay(storyAudio);

    // If blocked, don't trap user
    if (!ok) {
      playStoryBtn.textContent = "▶ Play Text";
      return;
    }

    playStoryBtn.textContent = "⏸ Pause";
  });

  storyAudio.addEventListener("pause", () => {
    if (!storyAudio.ended) playStoryBtn.textContent = "▶ Resume";
  });
  storyAudio.addEventListener("play", () => {
    playStoryBtn.textContent = "⏸ Pause";
  });
  storyAudio.addEventListener("ended", () => {
    playStoryBtn.textContent = "▶ Play Text";
  });

  // ===== Mini Quiz rendering =====
  let correctCount = 0;
  const answered = new Array(QUIZ.length).fill(false);

  const renderQuiz = () => {
    quizWrap.innerHTML = "";

    QUIZ.forEach((q, qIndex) => {
      const card = document.createElement("div");
      card.className = "q-card";

      const prompt = document.createElement("div");
      prompt.className = "q-text";
      prompt.textContent = `${qIndex + 1}. ${q.prompt}`;

      const choices = document.createElement("div");
      choices.className = "choices";

      q.choices.forEach((choiceText, cIndex) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-btn";
        btn.textContent = (cIndex === 0 ? "A) " : "B) ") + choiceText;

        btn.addEventListener("click", () => {
          // prevent re-answering
          if (answered[qIndex]) return;
          answered[qIndex] = true;

          const isCorrect = (cIndex === q.correct);

          // lock both buttons
          const allBtns = choices.querySelectorAll("button");
          allBtns.forEach(b => b.disabled = true);

          if (isCorrect) {
            btn.classList.add("correct");
            correctCount += 1;
          } else {
            btn.classList.add("wrong");
            // mark the correct one too
            allBtns[q.correct].classList.add("correct");
          }

          // if all correct
          if (correctCount === QUIZ.length) {
            setNextVisible();
          }
        });

        choices.appendChild(btn);
      });

      card.appendChild(prompt);
      card.appendChild(choices);
      quizWrap.appendChild(card);
    });
  };

  renderQuiz();

  // ===== Render Objects =====
  const renderObjects = () => {
    itemsGrid.innerHTML = "";

    OBJECTS.forEach((obj) => {
      const row = document.createElement("div");
      row.className = "item";

      const img = document.createElement("img");
      img.src = CONFIG.IMG_BASE + obj.img;
      img.alt = obj.word;

      const main = document.createElement("div");
      main.className = "item-main";

      const word = document.createElement("div");
      word.className = "word";
      word.textContent = obj.word.charAt(0).toUpperCase() + obj.word.slice(1);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "small-play";
      btn.textContent = "▶ Play";

      const audio = document.createElement("audio");
      audio.preload = "auto";
      audio.src = CONFIG.AUDIO_BASE + obj.audio;

      btn.addEventListener("click", async () => {
        lockBtn(btn, true);
        audio.currentTime = 0;

        const ok = await safePlay(audio);
        if (!ok) {
          lockBtn(btn, false);
          return;
        }

        audio.addEventListener("ended", () => lockBtn(btn, false), { once: true });
      });

      main.appendChild(word);
      main.appendChild(btn);

      row.appendChild(img);
      row.appendChild(main);
      row.appendChild(audio);

      itemsGrid.appendChild(row);
    });
  };

  renderObjects();
})();