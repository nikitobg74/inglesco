// ../../../../js/u3/u3_l3_p3.js
(() => {
  "use strict";

  const IMG_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l3/";
  const GAP_AFTER_CORRECT_MS = 2000;

  // Scenes (your list)
  // verb: tile word (what student selects)
  // subject: controls question + prompt ("They are" / "He is" / "She is")
  const SCENES = [
    {
      img: "u3.l3.p3.library.jpg",
      audio: "u3.l3.p3.studying.mp3",
      line1: "Sam and Jess are at the library.",
      line2: "They are studying English.",
      subject: "they",
      verb: "studying",
      distractors: ["sleeping", "drinking"]
    },
    {
      img: "u3.l3.p3.math.jpg",
      audio: "u3.l3.p3.math.mp3",
      line1: "Mrs. Johnson is in the classroom.",
      line2: "She is teaching math.",
      subject: "she",
      verb: "teaching",
      distractors: ["sleeping", "drinking"]
    },
    {
      img: "u3.l3.p3.swimming.jpg",
      audio: "u3.l3.p3.pool.mp3",
      line1: "Gary and Phil are at the pool.",
      line2: "They are swimming in the pool.",
      subject: "they",
      verb: "swimming",
      distractors: ["sleeping", "studying"]
    },
    {
      img: "u3.l3.p3.bank.jpg",
      audio: "u3.l3.p3.working.mp3",
      line1: "Mr. Lopez is at the bank.",
      line2: "He is working at the bank.",
      subject: "he",
      verb: "working",
      distractors: ["sleeping", "swimming"]
    },
    {
      img: "u3.l3.p3.flowers.jpg",
      audio: "u3.l3.p3.planting.mp3",
      line1: "Carol and Jenny are in the garden.",
      line2: "They are planting flowers.",
      subject: "they",
      verb: "planting",
      distractors: ["drinking", "working"]
    },
    {
      img: "u3.l3.p3.sleeping.jpg",
      audio: "u3.l3.p3.sleeping.mp3",
      line1: "Tom is in the bedroom.",
      line2: "He is sleeping.",
      subject: "he",
      verb: "sleeping",
      distractors: ["studying", "planting"]
    }
  ];

  // ===== DOM =====
  const sceneImg = document.getElementById("sceneImg");
  const playBtn = document.getElementById("playBtn");
  const roundLabel = document.getElementById("roundLabel");

  const scriptBox = document.getElementById("scriptBox");
  const line1 = document.getElementById("line1");
  const line2 = document.getElementById("line2");

  const qText = document.getElementById("qText");
  const prompt = document.getElementById("prompt");
  const tiles = document.getElementById("tiles");
  const qStatus = document.getElementById("qStatus");
  const feedbackOk = document.getElementById("feedbackOk");
  const endScreen = document.getElementById("endScreen");

  const required = [sceneImg, playBtn, roundLabel, scriptBox, line1, line2, qText, prompt, tiles, qStatus, feedbackOk, endScreen];
  if (required.some(x => !x)) {
    console.error("P3 DOM is missing required elements. Check IDs in p3.html.");
    return;
  }

  // ===== Audio =====
  const player = new Audio();
  player.preload = "auto";

  // ===== State =====
  let idx = 0;
  let phase = "need_play"; // need_play | ready | locked | ended
  let unlockedAutoplay = false; // becomes true after first user Play tap that succeeds (usually)

  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  function setHidden(el, hidden){
    el.classList.toggle("hidden", !!hidden);
  }

  function clearStatus(){
    qStatus.textContent = "";
    qStatus.className = "status";
  }

  function setStatus(ok){
    qStatus.textContent = ok ? "✓" : "✗";
    qStatus.className = "status " + (ok ? "ok" : "bad");
  }

  function fisherYates(arr){
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function subjectParts(subject){
    if (subject === "he") return { q: "What is he doing?", lead: "He is" };
    if (subject === "she") return { q: "What is she doing?", lead: "She is" };
    return { q: "What are they doing?", lead: "They are" };
  }

  function setTilesDisabled(disabled){
    [...tiles.querySelectorAll("button.tile")].forEach(b => (b.disabled = disabled));
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

  function renderScene(){
    const s = SCENES[idx];

    // UI reset
    setHidden(endScreen, true);
    setHidden(feedbackOk, true);
    setHidden(scriptBox, true);

    clearStatus();
    tiles.innerHTML = "";

    // Image + counter
    sceneImg.src = IMG_BASE + s.img;
    roundLabel.textContent = `${idx + 1} / ${SCENES.length}`;

    // Text (will show after audio)
    line1.textContent = s.line1;
    line2.textContent = s.line2;

    // Question + prompt
    const sp = subjectParts(s.subject);
    qText.textContent = sp.q;
    prompt.innerHTML = `${sp.lead} <span class="blank">_____</span>.`;

    // Build tiles: 1 correct + 2 distractors
    const choices = fisherYates([s.verb, ...s.distractors].slice(0, 3));
    choices.forEach(word => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tile";
      btn.textContent = word;
      btn.addEventListener("click", () => onPick(btn, word));
      tiles.appendChild(btn);
    });

    // Lock until audio played (or user taps Play)
    setTilesDisabled(true);
    playBtn.disabled = false;
    playBtn.textContent = "▶ Reproducir audio";
    phase = "need_play";
  }

  async function unlockAfterPlayAttempt(){
    // Show text after play tap, even if audio fails (avoid trapping student)
    setHidden(scriptBox, false);
    setTilesDisabled(false);
    phase = "ready";
  }

  async function tryPlayCurrent(){
    const s = SCENES[idx];
    const ok = await playAudio(s.audio);
    if (ok) unlockedAutoplay = true;
    await unlockAfterPlayAttempt();
  }

  async function onPick(btn, word){
    if (phase !== "ready") return;
    phase = "locked";

    const s = SCENES[idx];
    const ok = word === s.verb;

    if (ok){
      btn.classList.add("correct");
      setStatus(true);
      setTilesDisabled(true);
      setHidden(feedbackOk, false);

      await sleep(GAP_AFTER_CORRECT_MS);

      // next
      idx += 1;
      if (idx >= SCENES.length){
        phase = "ended";
        playBtn.disabled = true;
        setHidden(endScreen, false);
        return;
      }

      renderScene();

      // Autoplay after first permission unlocked
      if (unlockedAutoplay){
        const okAuto = await playAudio(SCENES[idx].audio);
        // show text after autoplay attempt
        await unlockAfterPlayAttempt();

        // if autoplay failed (rare), user can tap Play
        if (!okAuto){
          unlockedAutoplay = true; // still keep flow; user has already interacted earlier
          playBtn.disabled = false;
        } else {
          // optional: disable play button while in ready state? keep it enabled so they can replay.
          playBtn.disabled = false;
          playBtn.textContent = "▶ Repetir audio";
        }
      }
    }else{
      btn.classList.add("wrong");
      setStatus(false);
      phase = "ready"; // allow retry
    }
  }

  // Play button
  playBtn.addEventListener("click", async () => {
    if (phase === "ended") return;
    await tryPlayCurrent();
    // allow replay anytime after unlocked
    playBtn.textContent = "▶ Repetir audio";
  });

  // Init
  renderScene();
})();