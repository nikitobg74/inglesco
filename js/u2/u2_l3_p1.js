// ../../../../js/u2/u2_l3_p1.js
(() => {
  const IMG_BASE = "../../../../assets/images/u2/";
  const AUDIO_BASE = "../../../../assets/audio/u2/";

  const DIALOGUES = [
    {
      leftImg: "u2.l3.p1.man1.jpg",
      rightTopImg: "u2.l3.p1.woman.restaurant1.jpg",
      rightBottomImg: "u2.l2.p4.supermarket1.jpg",
      audio: "u2.l2.p1.dialogue1.mp3"
    },
    {
      leftImg: "u2.l3.p1.man2.jpg",
      rightTopImg: "u2.l3.p1.man.bank1.jpg",
      rightBottomImg: "u2.l3.p1.post.jpg",
      audio: "u2.l2.p1.dialogue2.mp3"
    },
    {
      leftImg: "u2.l3.p1.woman1.jpg",
      rightTopImg: "u2.l3.p1.woman.library1.jpg",
      rightBottomImg: "u2.l3.p1.man.office1.jpg",
      audio: "u2.l2.p1.dialogue3.mp3"
    },
    {
      leftImg: "u2.l3.p1.man3.jpg",
      rightTopImg: "u2.l3.p1.woman.park1.jpg",
      rightBottomImg: "u2.l2.p4.movietheater1.jpg",
      audio: "u2.l2.p1.dialogue4.mp3"
    }
  ];

  const total = DIALOGUES.length;

  // Elements
  const leftImgEl = document.getElementById("leftImg");
  const rightTopImgEl = document.getElementById("rightTopImg");
  const rightBottomImgEl = document.getElementById("rightBottomImg");

  const playBtn = document.getElementById("playBtn");
  const replayBtn = document.getElementById("replayBtn");
  const nextDialogueBtn = document.getElementById("nextDialogueBtn");
  const nextBtn = document.getElementById("nextBtn");

  const statusText = document.getElementById("statusText");
  const dialoguePill = document.getElementById("dialoguePill");

  // Safety: if missing elements, don't crash
  if (!leftImgEl || !rightTopImgEl || !rightBottomImgEl || !playBtn || !replayBtn || !nextDialogueBtn || !nextBtn || !statusText || !dialoguePill) {
    return;
  }

  let idx = 0;
  let isPlaying = false;

  // One audio instance => no overlap
  const audio = new Audio();
  audio.preload = "auto";

  function setPill(i) {
    dialoguePill.textContent = `Dialogue ${i + 1}/${total}`;
  }

  function setStatus(txt) {
    statusText.textContent = txt;
  }

  function stopAudio() {
    try { audio.pause(); } catch (_) {}
    try { audio.currentTime = 0; } catch (_) {}
    isPlaying = false;
    playBtn.disabled = false;
  }

  function loadDialogue(i) {
    const d = DIALOGUES[i];
    if (!d) return;

    stopAudio();

    leftImgEl.src = IMG_BASE + d.leftImg;
    rightTopImgEl.src = IMG_BASE + d.rightTopImg;
    rightBottomImgEl.src = IMG_BASE + d.rightBottomImg;
    audio.src = AUDIO_BASE + d.audio;

    setPill(i);
    setStatus("Play");

    // Must finish listening before going next
    nextDialogueBtn.disabled = true;

    // Next lesson only after finishing 4/4
    nextBtn.classList.add("hidden");
  }

  function playFromStart() {
    if (isPlaying) return;

    // No overlap
    try { audio.pause(); } catch (_) {}
    try { audio.currentTime = 0; } catch (_) {}

    isPlaying = true;
    playBtn.disabled = true;
    setStatus("Playing…");

    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        isPlaying = false;
        playBtn.disabled = false;
        setStatus("Play");
      });
    }
  }

  audio.addEventListener("ended", () => {
    isPlaying = false;
    playBtn.disabled = false;
    setStatus("Finished");

    if (idx < total - 1) {
      nextDialogueBtn.disabled = false;
    } else {
      nextBtn.classList.remove("hidden");
      nextDialogueBtn.disabled = true;
    }
  });

  playBtn.addEventListener("click", playFromStart);
  replayBtn.addEventListener("click", playFromStart);

  nextDialogueBtn.addEventListener("click", () => {
    if (isPlaying) return;
    if (idx >= total - 1) return;

    idx += 1;
    loadDialogue(idx);
  });

  // Progress circles navigate (same behavior as your other pages)
  document.querySelectorAll(".step").forEach(step => {
    step.addEventListener("click", () => {
      const page = step.getAttribute("data-page");
      if (page) window.location.href = page;
    });
  });

  // Init
  loadDialogue(0);
})();