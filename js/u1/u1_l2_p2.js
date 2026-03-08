// Unit 1 - Lesson 2 - Part 2
// Language-neutral script 

(() => {
  const container = document.getElementById("numberContainer");
  const nextBtn = document.getElementById("nextBtn");
  const steps = document.querySelectorAll(".step");

  if (!container || !nextBtn) return;

  const audioBase = container.dataset.audioBase || "";
  const nextPage = container.dataset.next || "p3.html";

  // Data (language neutral). Audio paths use base from HTML.
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

  const played = Object.create(null);

  // ✅ prevent overlapping audio
  let currentAudio = null;

  function stopCurrentAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  window.addEventListener("beforeunload", stopCurrentAudio);

  // Progress bar navigation
  steps.forEach(step => {
    step.addEventListener("click", () => {
      const page = step.dataset.page;
      if (!page) return;
      stopCurrentAudio();
      window.location.href = page;
    });
  });

  // Generate number boxes
  lessonData.forEach(item => {
    const card = document.createElement("div");
    card.className = "number-card";
    card.style.backgroundColor = item.color;

    card.innerHTML = `
      <div class="number-digit">${item.num}</div>
      <div class="number-word">${item.word}</div>
    `;

    card.addEventListener("click", () => {
      // stop existing audio (repeat click restarts cleanly)
      stopCurrentAudio();

      const audio = new Audio(audioBase + item.audio);
      currentAudio = audio;

      audio.play();

      // mark as played visually
      card.classList.add("played");
      played[item.num] = true;

      checkAllPlayed();

      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
      };
    });

    container.appendChild(card);
  });

  function checkAllPlayed() {
    const allPlayed = lessonData.every(item => played[item.num]);
    if (allPlayed) nextBtn.style.display = "inline-block";
  }

  // Next button
  nextBtn.addEventListener("click", () => {
    stopCurrentAudio();
    window.location.href = nextPage;
  });
})();