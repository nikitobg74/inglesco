/* u3_l4_p3.js
   - Image + 2 blanks
   - Blank 1: is / are
   - Blank 2: main verb with distractors
   - Correct answer => green, play audio, next round
   - Wrong answer => red X and retry
   - JS language-neutral
*/
(() => {
  "use strict";

  const IMG_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l4/";

  const sceneImg = document.getElementById("sceneImg");
  const roundLabel = document.getElementById("roundLabel");
  const exerciseBox = document.getElementById("exerciseBox");
  const endScreen = document.getElementById("endScreen");

  const part1 = document.getElementById("part1");
  const part2 = document.getElementById("part2");
  const blank1 = document.getElementById("blank1");
  const blank2 = document.getElementById("blank2");

  const tiles1 = document.getElementById("tiles1");
  const tiles2 = document.getElementById("tiles2");
  const group2Wrap = document.getElementById("group2Wrap");
  const statusLine = document.getElementById("statusLine");

  const ROUNDS = [
    {
      img: "u3.l4.p3.breakfast.jpg",
      audio: "u3.l4.p3.breakfast.mp3",
      subject: "He",
      beAnswer: "is",
      verbAnswer: "eating",
      verbOptions: ["eating", "drinking", "reading"],
      tail: " breakfast."
    },
    {
      img: "u3.l4.p3.milk.jpg",
      audio: "u3.l4.p3.milk.mp3",
      subject: "She",
      beAnswer: "is",
      verbAnswer: "drinking",
      verbOptions: ["drinking", "eating", "sleeping"],
      tail: " milk."
    },
    {
      img: "u3.l4.p3.math.jpg",
      audio: "u3.l4.p3.math.mp3",
      subject: "They",
      beAnswer: "are",
      verbAnswer: "studying",
      verbOptions: ["studying", "watching", "playing"],
      tail: " mathematics."
    },
    {
      img: "u3.l4.p3.texto.jpg",
      audio: "u3.l4.p3.text.mp3",
      subject: "He",
      beAnswer: "is",
      verbAnswer: "reading",
      verbOptions: ["reading", "drinking", "singing"],
      tail: " a text."
    },
    {
      img: "u3.l4.p3.sleeping.jpg",
      audio: "u3.l4.p3.sleeping.mp3",
      subject: "They",
      beAnswer: "are",
      verbAnswer: "sleeping",
      verbOptions: ["sleeping", "cooking", "playing"],
      tail: "."
    },
    {
      img: "u3.l4.p3.teaching.jpg",
      audio: "u3.l4.p3.teaching.mp3",
      subject: "She",
      beAnswer: "is",
      verbAnswer: "teaching",
      verbOptions: ["teaching", "reading", "drinking"],
      tail: "."
    },
    {
      img: "u3.l4.p3.listening.jpg",
      audio: "u3.l4.p3.listening.mp3",
      subject: "He",
      beAnswer: "is",
      verbAnswer: "listening",
      verbOptions: ["listening", "watching", "singing"],
      tail: " to music."
    },
    {
      img: "u3.l4.p3.watching.jpg",
      audio: "u3.l4.p3.watching.mp3",
      subject: "They",
      beAnswer: "are",
      verbAnswer: "watching",
      verbOptions: ["watching", "studying", "sleeping"],
      tail: " TV."
    },
    {
      img: "u3.l4.p3.cooking.jpg",
      audio: "u3.l4.p3.cooking.mp3",
      subject: "She",
      beAnswer: "is",
      verbAnswer: "cooking",
      verbOptions: ["cooking", "drinking", "reading"],
      tail: " dinner."
    },
    {
      img: "u3.l4.p3.singing.jpg",
      audio: "u3.l4.p3.singing.mp3",
      subject: "He",
      beAnswer: "is",
      verbAnswer: "singing",
      verbOptions: ["singing", "sleeping", "teaching"],
      tail: "."
    },
    {
      img: "u3.l4.p3.playing.jpg",
      audio: "u3.l4.p3.playing.mp3",
      subject: "They",
      beAnswer: "are",
      verbAnswer: "playing",
      verbOptions: ["playing", "watching", "studying"],
      tail: " baseball."
    }
  ];

  const TOTAL = ROUNDS.length;

  let idx = 0;
  let step = 1; // 1 = choose is/are, 2 = choose verb
  let selectedBe = "";
  let selectedVerb = "";
  let audio = null;
  let locked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function clearEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function setStatus(type, text = "") {
    statusLine.textContent = text;
    statusLine.classList.remove("ok", "bad");
    if (type === "ok") statusLine.classList.add("ok");
    if (type === "bad") statusLine.classList.add("bad");
  }

  function resetBlanks() {
    blank1.textContent = "___";
    blank2.textContent = "___";
    blank1.className = "blank";
    blank2.className = "blank";
  }

  function buildBeTiles(round) {
    clearEl(tiles1);
    const options = shuffle(["is", "are"]);

    options.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.type = "button";
      btn.textContent = word;
      btn.addEventListener("click", () => {
        if (locked || step !== 1) return;

        if (word === round.beAnswer) {
          selectedBe = word;
          blank1.textContent = word;
          blank1.classList.add("filled", "correct");
          btn.classList.add("correct");
          disableTiles(tiles1, true);
          step = 2;
          group2Wrap.classList.remove("hidden");
          setStatus("", "");
          buildVerbTiles(round);
        } else {
          btn.classList.add("wrong");
          setStatus("bad", "✗");
          disableTiles(tiles1, true);

          setTimeout(() => {
            btn.classList.remove("wrong");
            disableTiles(tiles1, false);
            setStatus("", "");
          }, 650);
        }
      });
      tiles1.appendChild(btn);
    });
  }

  function buildVerbTiles(round) {
    clearEl(tiles2);
    const options = shuffle(round.verbOptions);

    options.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.type = "button";
      btn.textContent = word;
      btn.addEventListener("click", () => {
        if (locked || step !== 2) return;

        if (word === round.verbAnswer) {
          selectedVerb = word;
          blank2.textContent = word;
          blank2.classList.add("filled", "correct");
          btn.classList.add("correct");
          disableTiles(tiles2, true);
          setStatus("ok", "✓");
          locked = true;
          playRoundAudioAndAdvance(round);
        } else {
          btn.classList.add("wrong");
          setStatus("bad", "✗");
          disableTiles(tiles2, true);

          setTimeout(() => {
            btn.classList.remove("wrong");
            disableTiles(tiles2, false);
            setStatus("", "");
          }, 650);
        }
      });
      tiles2.appendChild(btn);
    });
  }

  function disableTiles(container, disabled) {
    container.querySelectorAll(".tile").forEach(btn => {
      btn.disabled = disabled;
    });
  }

  function stopAudio() {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
  }

  function playRoundAudioAndAdvance(round) {
    stopAudio();
    audio = new Audio(AUDIO_BASE + round.audio);

    audio.onended = () => {
      setTimeout(() => {
        if (idx < TOTAL - 1) {
          loadRound(idx + 1);
        } else {
          finishLesson();
        }
      }, 450);
    };

    audio.play().catch(() => {
      // fallback if audio fails
      setTimeout(() => {
        if (idx < TOTAL - 1) {
          loadRound(idx + 1);
        } else {
          finishLesson();
        }
      }, 700);
    });
  }

  function loadRound(i) {
    idx = i;
    step = 1;
    selectedBe = "";
    selectedVerb = "";
    locked = false;

    const round = ROUNDS[idx];

    roundLabel.textContent = `${idx + 1} / ${TOTAL}`;
    sceneImg.src = IMG_BASE + round.img;

    part1.textContent = `${round.subject} `;
    part2.textContent = round.tail;

    resetBlanks();
    setStatus("", "");

    group2Wrap.classList.add("hidden");
    clearEl(tiles2);

    buildBeTiles(round);
  }

  function finishLesson() {
    exerciseBox.classList.add("hidden");
    endScreen.classList.remove("hidden");
  }

  loadRound(0);
})();