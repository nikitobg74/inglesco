// ../../../../js/u3/u3_l3_p4.js
(() => {
  "use strict";

  const IMG_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l3/";
  const REVEAL_MS = 2000;
  const NEXT_DELAY_MS = 2000;

  const SCENES = [
    { img:"u3.l3.p1.karen.jpg", audio:"u3.l3.p4.karen.mp3", subject:"She is", object:"lunch",      verb:"eating"   },
    { img:"u3.l3.p1.tom.jpg",   audio:"u3.l3.p4.tom.mp3",   subject:"He is",  object:"the guitar", verb:"playing"  },
    { img:"u3.l3.p1.we.cards.jpg", audio:"u3.l3.p4.we.cards.mp3", subject:"We are", object:"cards", verb:"playing" },
    { img:"u3.l3.p1.gary.phil.jpg", audio:"u3.l3.p4.gary.phil.mp3", subject:"They are", object:"baseball", verb:"playing" },
    { img:"u3.l3.p1.nancy.jpg", audio:"u3.l3.p4.nancy.mp3", subject:"She is", object:"coffee", verb:"drinking" },
    { img:"u3.l3.p1.clark.jpg", audio:"u3.l3.p4.clark.mp3", subject:"They are", object:"dinner", verb:"eating" }
  ];

  // ===== DOM =====
  const sceneImg = document.getElementById("sceneImg");
  const playBtn = document.getElementById("playBtn");
  const roundLabel = document.getElementById("roundLabel");

  const status = document.getElementById("status");
  const prompt = document.getElementById("prompt");
  const verbInput = document.getElementById("verbInput");

  const hintWord = document.getElementById("hintWord");
  const endScreen = document.getElementById("endScreen");

  const required = [sceneImg, playBtn, roundLabel, status, prompt, verbInput, hintWord, endScreen];
  if (required.some(x => !x)) {
    console.error("P4 DOM missing required elements. Check IDs in p4.html.");
    return;
  }

  // ===== Audio =====
  const player = new Audio();
  player.preload = "auto";

  // ===== State =====
  let idx = 0;
  let autoplayUnlocked = false;
  let attempts = 0;
  let locked = false; // lock after correct while transitioning

  // ===== Helpers =====
  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  function setHidden(el, hidden){
    el.classList.toggle("hidden", !!hidden);
  }

  function normalize(s){
    return (s || "")
      .toLowerCase()
      .trim()
      .replace(/[.?!]/g, "")
      .replace(/\s+/g, " ");
  }

  function clearStatus(){
    status.textContent = "";
    status.className = "status";
  }

  function setStatus(ok){
    status.textContent = ok ? "✓" : "✗";
    status.className = "status " + (ok ? "ok" : "bad");
  }

  async function playAudio(filename){
    player.pause();
    player.currentTime = 0;
    player.src = AUDIO_BASE + filename;
    try{
      await player.play();
      return true;
    }catch(e){
      return false;
    }
  }

  async function revealHintTemporarily(){
    hintWord.classList.add("reveal");
    await sleep(REVEAL_MS);
    hintWord.classList.remove("reveal");
  }

  function setInputState(state){
    verbInput.classList.remove("ok", "bad");
    if (state === "ok") verbInput.classList.add("ok");
    if (state === "bad") verbInput.classList.add("bad");
  }

  function renderScene(){
    const s = SCENES[idx];

    locked = false;
    attempts = 0;

    setHidden(endScreen, true);

    sceneImg.src = IMG_BASE + s.img;
    roundLabel.textContent = `${idx + 1} / ${SCENES.length}`;

    // Build prompt: [subject] ____ [object].
    prompt.innerHTML = `${s.subject} <span class="verb-wrap"></span> ${s.object}.`;

    // Ensure our input is inside the prompt
    const wrap = prompt.querySelector(".verb-wrap");
    wrap.innerHTML = "";
    wrap.appendChild(verbInput);

    verbInput.value = "";
    verbInput.disabled = true;
    setInputState("neutral");
    clearStatus();

    hintWord.textContent = s.verb;
    hintWord.classList.remove("reveal");

    playBtn.disabled = false;
    playBtn.textContent = autoplayUnlocked ? "▶ Repetir audio" : "▶ Play audio";

    // Autoplay after first permission unlocked
    if (autoplayUnlocked){
      playAudio(s.audio).finally(() => {
        verbInput.disabled = false;
        verbInput.focus();
      });
    }
  }

  async function goNext(){
    await sleep(NEXT_DELAY_MS);

    idx += 1;
    if (idx >= SCENES.length){
      playBtn.disabled = true;
      verbInput.disabled = true;
      setHidden(endScreen, false);
      clearStatus();
      return;
    }

    renderScene();
  }

  function isExactCorrect(){
    return normalize(verbInput.value) === normalize(SCENES[idx].verb);
  }

  async function markCorrectAndAdvance(){
    if (locked) return;
    locked = true;

    setInputState("ok");
    setStatus(true);
    verbInput.disabled = true;

    await goNext();
  }

  // ===== Events =====
  playBtn.addEventListener("click", async () => {
    if (!autoplayUnlocked) autoplayUnlocked = true;

    const s = SCENES[idx];
    await playAudio(s.audio);

    // Unlock typing after play attempt (even if audio fails)
    verbInput.disabled = false;
    verbInput.focus();
  });

  // Auto-advance immediately on exact correct typing
  verbInput.addEventListener("input", async () => {
    if (locked) return;

    const typed = normalize(verbInput.value);

    if (typed.length === 0){
      setInputState("neutral");
      clearStatus();
      return;
    }

    if (isExactCorrect()){
      await markCorrectAndAdvance();
      return;
    }

    // partial typing: keep neutral (don’t punish)
    setInputState("neutral");
    clearStatus();
  });

  // Wrong logic: only after blur + at least 3 characters
  verbInput.addEventListener("blur", async () => {
    if (locked) return;

    const typed = normalize(verbInput.value);
    if (typed.length < 3) return;

    if (!isExactCorrect()){
      attempts += 1;
      setInputState("bad");
      setStatus(false);

      if (attempts >= 2){
        await revealHintTemporarily();
      }
    }
  });

  // Init
  renderScene();
})();