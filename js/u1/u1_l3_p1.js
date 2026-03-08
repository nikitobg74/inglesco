// Unit 1 - Lesson 3 - Part 1
// Language-neutral script (no Spanish strings here)

(() => {
  const dialogueBoxes = document.querySelectorAll(".dialogue-box");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const replayBtn = document.getElementById("replayBtn");
  const nextBtn = document.getElementById("nextBtn");
  const steps = document.querySelectorAll(".step");
  const dialogueContainer = document.getElementById("dialogueContainer");

  if (!playPauseBtn || !replayBtn || !nextBtn || !dialogueContainer) return;

  const audioBase = dialogueContainer.dataset.audioBase || "";
  const nextPage = dialogueContainer.dataset.next || "p2.html";

  // UI text from HTML
  const txtPlay = document.getElementById("txt-play")?.textContent || "▶️";
  const txtPause = document.getElementById("txt-pause")?.textContent || "⏸";
  
  let currentIndex = 0;
  let isPlaying = false;
  let currentAudioEl = null;

  function stopAudio() {
    if (currentAudioEl) {
      currentAudioEl.pause();
      currentAudioEl.currentTime = 0;
      currentAudioEl = null;
    }
  }

  // stop audio if user leaves page
  window.addEventListener("beforeunload", stopAudio);

  function resetDialogueUI() {
    dialogueBoxes.forEach(box => box.classList.remove("active"));
    nextBtn.style.display = "none";
    currentIndex = 0;
    isPlaying = false;
    playPauseBtn.textContent = txtPlay;
  }

  function playCurrent() {
    if (!isPlaying) return;

    if (currentIndex >= dialogueBoxes.length) {
      isPlaying = false;
      playPauseBtn.textContent = txtPlay;
      nextBtn.style.display = "inline-block";
      stopAudio();
      return;
    }

    const box = dialogueBoxes[currentIndex];
    const file = box.dataset.audio || "";

    // restart clean (prevents overlap)
    stopAudio();
    const audio = new Audio(audioBase + file);
    currentAudioEl = audio;

    audio.play();

    audio.onended = () => {
      // highlight the box that just finished
      box.classList.add("active");
      currentIndex++;

      // small pause then continue
      setTimeout(() => {
        playCurrent();
      }, 700);
    };
  }

  playPauseBtn.addEventListener("click", () => {
    if (!isPlaying) {
      isPlaying = true;
      playPauseBtn.textContent = txtPause;
      playCurrent();
    } else {
      isPlaying = false;
      playPauseBtn.textContent = txtPlay;
      // pause current audio (no overlap)
      if (currentAudioEl) currentAudioEl.pause();
    }
  });

  replayBtn.addEventListener("click", () => {
    stopAudio();
    resetDialogueUI();
  });

  // Progress navigation (stop audio first)
  steps.forEach(step => {
    step.addEventListener("click", function () {
      const page = this.getAttribute("data-page");
      if (!page) return;
      stopAudio();
      window.location.href = page;
    });
  });

  // Next button
  nextBtn.addEventListener("click", () => {
    stopAudio();
    window.location.href = nextPage;
  });
})();