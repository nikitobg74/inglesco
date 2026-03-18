(() => {
  const BASE = "https://cnbuzahtzqknhhdxncur.supabase.co/storage/v1/object/public/assets/";

  // ── Intro ─────────────────────────────────────────────────
  const INTRO = {
    image: BASE + "images/u5/u5.lisa.jpg",
    audio: BASE + "audio/u5/u5.lisa.mp3",
    transcript: "Hello, my name is Lisa. Today I am at home alone. Where is everybody?"
  };

  // ── Examples ──────────────────────────────────────────────
  const EXAMPLES = [
    {
      person: "Parents",
      image: BASE + "images/u5/u5.l1.p2.mother.father.jpg",
      audio: BASE + "audio/u5/u5.lisa.parents.mp3",
      transcript: "My parents are not at home. They are at the beach. Are they swimming? No. They are not swimming. They are drinking cocktails.",
      questions: [
        {
          q: "Where are my parents?",
          correct: "They are at the beach.",
          wrong: "They are at home."
        },
        {
          q: "What are they doing?",
          correct: "They are drinking cocktails.",
          wrong: "They are drinking coffee."
        }
      ]
    },
    {
      person: "Sister",
      image: BASE + "images/u5/u5.sister.english.jpg",
      audio: BASE + "audio/u5/u5.lisa.sister.mp3",
      transcript: "Today my sister is not at home. She is at the library. Is she studying math? No. She is not studying math. She is studying English.",
      questions: [
        {
          q: "Where is my sister?",
          correct: "She is at the library.",
          wrong: "She is at school."
        },
        {
          q: "What is she doing?",
          correct: "She is studying English.",
          wrong: "She is studying math."
        }
      ]
    },
    {
      person: "Brother",
      image: BASE + "images/u5/u5.brother.riding.jpg",
      audio: BASE + "audio/u5/u5.lisa.brother.mp3",
      transcript: "Today my brother is not at home. He is at the park. Is he playing ball? No. He is not playing ball. He is riding his bicycle.",
      questions: [
        {
          q: "Where is my brother?",
          correct: "He is at the park.",
          wrong: "He is at the beach."
        },
        {
          q: "What is he doing?",
          correct: "He is riding his bicycle.",
          wrong: "He is playing ball."
        }
      ]
    },
    {
      person: "Dog",
      image: BASE + "images/u5/u5.dog.play.jpg",
      audio: BASE + "audio/u5/u5.lisa.dog.mp3",
      transcript: "Our dog is not at home today. He is at the park. He is playing ball.",
      questions: [
        {
          q: "Where is our dog?",
          correct: "He is at the park.",
          wrong: "He is at the beach."
        },
        {
          q: "What is he doing?",
          correct: "He is playing ball.",
          wrong: "He is riding a bicycle."
        }
      ]
    },
    {
      person: "Lisa",
      image: BASE + "images/u5/u5.lisa.tv.jpg",
      audio: BASE + "audio/u5/u5.lisa2.mp3",
      transcript: "Where am I? I am alone at home. What am I doing? I am not studying. I am watching TV.",
      questions: [
        {
          q: "Where am I?",
          correct: "At home.",
          wrong: "At the park."
        },
        {
          q: "What am I doing?",
          correct: "Watching TV.",
          wrong: "Studying."
        }
      ]
    }
  ];

  let exIndex = 0;
  let qIndex = 0;
  let audioPlayed = false;
  let locked = false;
  let currentAudio = null;
  let isIntroMode = true;

  const imgEl = document.getElementById("lessonImg");
  const personLabel = document.getElementById("personLabel");
  const audioBtnEl = document.getElementById("audioBtn");
  const transcriptEl = document.getElementById("transcriptBox");
  const questionsArea = document.getElementById("questionsArea");
  const subCounter = document.getElementById("subCounter");
  const questionLabel = document.getElementById("questionLabel");
  const answersEl = document.getElementById("answers");
  const counter = document.getElementById("counter");
  const bar = document.getElementById("progressBar");
  const endScreen = document.getElementById("endScreen");
  const card = document.querySelector(".card");

  // ── Helpers ───────────────────────────────────────────────
  function stopCurrentAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  function resetAudioButtonToPlay() {
    audioBtnEl.className = "audio-btn";
    audioBtnEl.textContent = "▶";
    audioBtnEl.disabled = false;
  }

  function setAudioButtonPlaying() {
    audioBtnEl.className = "audio-btn playing";
    audioBtnEl.textContent = "🔊";
    audioBtnEl.disabled = true;
  }

  function setAudioButtonDone() {
    audioBtnEl.className = "audio-btn done";
    audioBtnEl.textContent = "✓";
    audioBtnEl.disabled = false;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // ── Intro screen ──────────────────────────────────────────
  function loadIntro() {
    isIntroMode = true;
    audioPlayed = false;
    qIndex = 0;
    locked = false;

    counter.textContent = `0 / ${EXAMPLES.length}`;
    bar.style.width = "0%";

    imgEl.src = INTRO.image;
    imgEl.alt = "Lisa";
    personLabel.textContent = "";

    transcriptEl.textContent = INTRO.transcript;
    transcriptEl.classList.add("show");

    questionsArea.classList.remove("show");
    answersEl.innerHTML = "";

    stopCurrentAudio();
    resetAudioButtonToPlay();
  }

  // ── Load example ──────────────────────────────────────────
  function loadExample() {
    isIntroMode = false;
    audioPlayed = false;
    qIndex = 0;
    locked = false;

    const ex = EXAMPLES[exIndex];

    counter.textContent = `${exIndex + 1} / ${EXAMPLES.length}`;
    bar.style.width = ((exIndex + 1) / EXAMPLES.length) * 100 + "%";

    imgEl.src = ex.image;
    imgEl.alt = ex.person;
    personLabel.textContent = ex.person;

    transcriptEl.textContent = ex.transcript;
    transcriptEl.classList.remove("show");

    questionsArea.classList.remove("show");
    answersEl.innerHTML = "";

    stopCurrentAudio();
    resetAudioButtonToPlay();
  }

  // ── Play / replay audio ───────────────────────────────────
  window.playAudio = function () {
    stopCurrentAudio();
    setAudioButtonPlaying();

    if (isIntroMode) {
      currentAudio = new Audio(INTRO.audio);

      currentAudio.play().catch((err) => {
        console.error("Intro audio failed:", err);
        resetAudioButtonToPlay();
      });

      currentAudio.addEventListener("ended", () => {
        setAudioButtonDone();
        setTimeout(() => {
          exIndex = 0;
          loadExample();
        }, 600);
      });

      return;
    }

    const ex = EXAMPLES[exIndex];
    currentAudio = new Audio(ex.audio);

    currentAudio.play().catch((err) => {
      console.error("Example audio failed:", err);
      resetAudioButtonToPlay();
    });

    currentAudio.addEventListener("ended", () => {
      setAudioButtonDone();

      if (!audioPlayed) {
        audioPlayed = true;
        transcriptEl.classList.add("show");
        showQuestion();
      }
    });
  };

  // ── Show current question ─────────────────────────────────
  function showQuestion() {
    const ex = EXAMPLES[exIndex];
    const q = ex.questions[qIndex];

    subCounter.textContent = `Pregunta ${qIndex + 1} / ${ex.questions.length}`;
    questionLabel.textContent = q.q;

    const options = [
      { text: q.correct, isCorrect: true },
      { text: q.wrong, isCorrect: false }
    ];

    shuffle(options);

    answersEl.innerHTML = "";

    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.textContent = opt.text;
      btn.onclick = () => selectAnswer(btn, opt.isCorrect);
      answersEl.appendChild(btn);
    });

    questionsArea.classList.add("show");
    locked = false;
  }

  // ── Select answer ─────────────────────────────────────────
  function selectAnswer(btn, isCorrect) {
    if (locked) return;
    locked = true;

    answersEl.querySelectorAll(".answer-btn").forEach((b) => {
      b.disabled = true;
    });

    if (isCorrect) {
      btn.classList.add("correct");

      setTimeout(() => {
        qIndex++;
        const ex = EXAMPLES[exIndex];

        if (qIndex < ex.questions.length) {
          showQuestion();
        } else {
          exIndex++;

          if (exIndex >= EXAMPLES.length) {
            stopCurrentAudio();
            card.style.display = "none";
            endScreen.style.display = "block";
          } else {
            loadExample();
          }
        }
      }, 1000);
    } else {
      btn.classList.add("wrong");

      setTimeout(() => {
        btn.classList.remove("wrong");
        answersEl.querySelectorAll(".answer-btn").forEach((b) => {
          b.disabled = false;
        });
        locked = false;
      }, 600);
    }
  }

  // ── Start ─────────────────────────────────────────────────
  loadIntro();
})();