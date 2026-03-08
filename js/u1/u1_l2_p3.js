// Unit 1 - Lesson 2 - Part 3
// Language-neutral script (no Spanish here)

(() => {
  const audioColumn = document.getElementById("audioColumn");
  const numberContainer = document.getElementById("numberContainer");
  const feedback = document.getElementById("feedback");
  const nextBtn = document.getElementById("nextBtn");
  const steps = document.querySelectorAll(".step");

  if (!audioColumn || !numberContainer || !feedback || !nextBtn) return;

  // Read config from HTML
  const audioBase = audioColumn.dataset.audioBase || "";
  const nextPage = audioColumn.dataset.next || "p4.html";

  // Read UI strings from HTML
  const txtListen = (document.getElementById("txt-listen")?.textContent || "🔊");
  const msgWrong = (document.getElementById("msg-wrong")?.textContent || "✖");
  const msgGood1 = (document.getElementById("msg-good-1")?.textContent || "✓");
  const msgGood2 = (document.getElementById("msg-good-2")?.textContent || "✓");

  // Data (neutral). Audio files resolved via base path.
  const lessonData = [
    { num: "1", word: "ONE",   audio: "one.mp3",   color: "#f87171" },
    { num: "2", word: "TWO",   audio: "two.mp3",   color: "#fbbf24" },
    { num: "3", word: "THREE", audio: "three.mp3", color: "#34d399" },
    { num: "4", word: "FOUR",  audio: "four.mp3",  color: "#60a5fa" },
    { num: "5", word: "FIVE",  audio: "five.mp3",  color: "#a78bfa" },
    { num: "6", word: "SIX",   audio: "six.mp3",   color: "#f472b6" },
    { num: "7", word: "SEVEN", audio: "seven.mp3", color: "#fb923c" },
    { num: "8", word: "EIGHT", audio: "eight.mp3", color: "#22d3ee" },
    { num: "9", word: "NINE",  audio: "nine.mp3",  color: "#facc15" },
    { num: "0", word: "ZERO",  audio: "zero.mp3",  color: "#94a3b8" }
  ];

  // State
  const shuffled = [...lessonData].sort(() => Math.random() - 0.5);
  let currentTarget = null;      // {num, ...} for currently selected audio box
  let answeredCount = 0;

  // ✅ audio overlap fix
  let currentAudioEl = null;
  function stopAudio() {
    if (currentAudioEl) {
      currentAudioEl.pause();
      currentAudioEl.currentTime = 0;
      currentAudioEl = null;
    }
  }
  window.addEventListener("beforeunload", stopAudio);

  // Progress navigation
  steps.forEach(step => {
    step.addEventListener("click", () => {
      const page = step.dataset.page;
      if (!page) return;
      stopAudio();
      window.location.href = page;
    });
  });

  // Generate audio boxes
  shuffled.forEach(item => {
    const box = document.createElement("div");
    box.className = "audio-box";
    box.textContent = txtListen;

    box.dataset.num = item.num;
    box.dataset.audio = item.audio;

    box.addEventListener("click", () => {
      if (box.classList.contains("answered")) return;

      // Active UI
      document.querySelectorAll(".audio-box").forEach(b => b.classList.remove("active"));
      box.classList.add("active");

      // Set current target
      currentTarget = item;

      // Play (restart clean)
      stopAudio();
      const a = new Audio(audioBase + item.audio);
      currentAudioEl = a;
      a.play();
      a.onended = () => {
        if (currentAudioEl === a) currentAudioEl = null;
      };
    });

    audioColumn.appendChild(box);
  });

  // Generate number cards
  lessonData.forEach(item => {
    const card = document.createElement("div");
    card.className = "number-card";
    card.style.backgroundColor = item.color;
    card.dataset.num = item.num;

    card.innerHTML = `
      <div class="number-digit">${item.num}</div>
      <div class="number-word">${item.word}</div>
    `;

    card.addEventListener("click", () => {
      if (!currentTarget) return;
      if (card.classList.contains("disabled")) return;

      if (card.dataset.num === currentTarget.num) {
        // Correct
        card.classList.add("correct", "disabled");

        const activeBox = document.querySelector(".audio-box.active");
        if (activeBox) {
          activeBox.classList.remove("active");
          activeBox.classList.add("answered");
        }

        feedback.style.color = "#16a34a";
        feedback.textContent = Math.random() > 0.5 ? msgGood1 : msgGood2;

        currentTarget = null;
        answeredCount++;

        if (answeredCount === lessonData.length) {
          nextBtn.style.display = "block";
        }
      } else {
        // Wrong
        card.classList.add("wrong");
        feedback.style.color = "#dc2626";
        feedback.textContent = msgWrong;

        setTimeout(() => {
          card.classList.remove("wrong");
          feedback.textContent = "";
        }, 800);
      }
    });

    numberContainer.appendChild(card);
  });

  // Next button
  nextBtn.addEventListener("click", () => {
    stopAudio();
    window.location.href = nextPage;
  });
})();