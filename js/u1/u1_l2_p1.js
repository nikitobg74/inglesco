// Unit 1 - Lesson 2 - Part 1
// Language-neutral JS (no Spanish text here)

(() => {
  const container = document.getElementById("charactersContainer");
  const nextBtn = document.getElementById("nextBtn");
  const progressSteps = document.querySelectorAll(".step");

  if (!container || !nextBtn) return;

  const imgBase = container.dataset.imgBase || "";
  const audioBase = container.dataset.audioBase || "";

  const dataNodes = Array.from(container.querySelectorAll(".character-data"));
  const played = Object.create(null);

  // ✅ keep track of currently playing audio
  let currentAudio = null;

  function stopCurrentAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  // ✅ stop audio when leaving page (navigation, refresh, close tab)
  window.addEventListener("beforeunload", stopCurrentAudio);

  // Build cards
  dataNodes.forEach(node => {
    const key = node.dataset.key || node.dataset.name || Math.random().toString(16).slice(2);
    played[key] = false;

    const card = document.createElement("div");
    card.className = "character-card";

    const img = document.createElement("img");
    img.src = imgBase + (node.dataset.img || "");
    img.alt = node.dataset.name || "";

    const text = document.createElement("div");
    text.className = "character-text";

    const en = node.dataset.en || "";
    const es = node.dataset.es || "";
    text.innerHTML = `${en} <span class="es">${es}</span>`;

    const mark = document.createElement("span");
    mark.className = "played-mark";
    mark.textContent = "✔";

    card.appendChild(img);
    card.appendChild(text);
    card.appendChild(mark);

    node.replaceWith(card);

    img.addEventListener("click", () => {
      // ✅ stop whatever is playing now (even if same character)
      stopCurrentAudio();

      const audioFile = node.dataset.audio || "";
      const audio = new Audio(audioBase + audioFile);

      currentAudio = audio;

      audio.play();

      audio.onended = () => {
        // mark played only if the audio that ended is still the current one
        if (currentAudio === audio) {
          mark.classList.add("active");
          played[key] = true;
          checkAllPlayed();
          currentAudio = null;
        }
      };
    });
  });

  function checkAllPlayed() {
    const allPlayed = Object.values(played).every(v => v === true);
    if (allPlayed) nextBtn.style.display = "inline-block";
  }

  // Next button
  nextBtn.addEventListener("click", () => {
    stopCurrentAudio();              // ✅ stop audio before changing page
    window.location.href = "p2.html";
  });

  // Progress bar navigation
  progressSteps.forEach(step => {
    step.addEventListener("click", () => {
      const page = step.dataset.page;
      if (!page) return;
      stopCurrentAudio();            // ✅ stop audio before changing page
      window.location.href = page;
    });
  });
})();