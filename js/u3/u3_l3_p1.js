// ../../../../js/u3/u3_l3_p1.js
(() => {
  "use strict";

  const IMG_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l3/";
  const GAP_MS = 600;

  const SCENES = [
    {
      img: "u3.l3.p1.karen.jpg",
      q1: {
        text: "Where is Karen?",
        audio: "u3.l3.p1.karen.mp3",
        options: ["She is in the park.", "She is in the kitchen.", "She is in the bedroom."],
        correctIndex: 0
      },
      q2: {
        text: "What is she doing?",
        audio: "u3.l3.p1.shedoing.mp3",
        options: ["She is eating lunch.", "She is playing baseball.", "She is drinking milk."],
        correctIndex: 0
      }
    },
    {
      img: "u3.l3.p1.clark.jpg",
      q1: {
        text: "Where are Mr. and Mrs. Clark?",
        audio: "u3.l3.p1.clark.mp3",
        options: ["They are in the dining room.", "They are in the park.", "They are in the yard."],
        correctIndex: 0
      },
      q2: {
        text: "What are they doing?",
        audio: "u3.l3.p1.theydoing.mp3",
        options: ["They are eating dinner.", "They are playing cards.", "They are playing baseball."],
        correctIndex: 0
      }
    },
    {
      img: "u3.l3.p1.tom.jpg",
      q1: {
        text: "Where is Tom?",
        audio: "u3.l3.p1.tom.mp3",
        options: ["He is in the bedroom.", "He is in the cafeteria.", "He is in the park."],
        correctIndex: 0
      },
      q2: {
        text: "What is he doing?",
        audio: "u3.l3.p1.hedoing.mp3",
        options: ["He is playing the guitar.", "He is drinking milk.", "He is eating dinner."],
        correctIndex: 0
      }
    },
    {
      img: "u3.l3.p1.we.cards.jpg",
      q1: {
        text: "Where are you?",
        audio: "u3.l3.p1.where.you.mp3",
        options: ["We are in the living room.", "We are in the bedroom.", "We are in the yard."],
        correctIndex: 0
      },
      q2: {
        text: "What are you doing?",
        audio: "u3.l3.p1.you.doing.mp3",
        options: ["We are playing cards.", "We are eating lunch.", "We are drinking milk."],
        correctIndex: 0
      }
    },
    {
      img: "u3.l3.p1.gary.phil.jpg",
      q1: {
        text: "Where are Gary and Phil?",
        audio: "u3.l3.p1.gary.phil.mp3",
        options: ["They are in the yard.", "They are in the dining room.", "They are in the cafeteria."],
        correctIndex: 0
      },
      q2: {
        text: "What are they doing?",
        audio: "u3.l3.p1.theydoing.mp3",
        options: ["They are playing baseball.", "They are eating dinner.", "They are playing cards."],
        correctIndex: 0
      }
    },
    {
      img: "u3.l3.p1.nancy.jpg",
      q1: {
        text: "Where is Nancy?",
        audio: "u3.l3.p1.nancy.mp3",
        options: ["She is in the cafe.", "She is in the park.", "She is in the living room."],
        correctIndex: 0
      },
      q2: {
        text: "What is she doing?",
        audio: "u3.l3.p1.shedoing.mp3",
        options: ["She is drinking coffee.", "She is playing the guitar.", "She is eating lunch."],
        correctIndex: 0
      }
    }
  ];

  // ===== DOM =====
  const sceneImg = document.getElementById("sceneImg");
  const replayBtn = document.getElementById("replayBtn");
  const roundLabel = document.getElementById("roundLabel");

  const line1 = document.getElementById("line1");
  const line2 = document.getElementById("line2");
  const line3 = document.getElementById("line3");

  const qABox = document.getElementById("qABox");
  const qBBox = document.getElementById("qBBox");
  const qAText = document.getElementById("qAText");
  const qBText = document.getElementById("qBText");
  const qAStatus = document.getElementById("qAStatus");
  const qBStatus = document.getElementById("qBStatus");
  const qAOptions = document.getElementById("qAOptions");
  const qBOptions = document.getElementById("qBOptions");

  const feedbackOk = document.getElementById("feedbackOk");
  const endScreen = document.getElementById("endScreen");

  // ===== Audio =====
  const player = new Audio();
  player.preload = "auto";

  let idx = 0;
  let phase = "idle"; // idle | q1_ready | q1_done | q2_wait_audio | q2_ready | q2_done | ended

  let q1Map = null;
  let q2Map = null;

  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  function setHidden(el, hidden){
    if (!el) return;
    el.classList.toggle("hidden", !!hidden);
  }

  function clearStatus(){
    qAStatus.textContent = "";
    qBStatus.textContent = "";
    qAStatus.className = "status";
    qBStatus.className = "status";
  }

  function resetOptionStyles(container){
    [...container.querySelectorAll("button.opt")].forEach(b => {
      b.disabled = false;
      b.classList.remove("correct", "wrong");
    });
  }

  function disableOptions(container){
    [...container.querySelectorAll("button.opt")].forEach(b => b.disabled = true);
  }

  function fisherYates(arr){
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildMap(options, correctIndex){
    const items = options.map((t, i) => ({ text: t, isCorrect: i === correctIndex }));
    fisherYates(items);
    return { items, locked: false };
  }

  function renderOptions(container, map, onPick){
    container.innerHTML = "";
    map.items.forEach((it) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.textContent = it.text;
      btn.addEventListener("click", () => onPick(btn, it));
      container.appendChild(btn);
    });
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

  function showScript(a, b){
    line1.textContent = a || "";
    line2.textContent = b || "";
    line3.textContent = "";
  }

  function startScene(){
    const scene = SCENES[idx];

    // reset UI
    setHidden(endScreen, true);
    setHidden(feedbackOk, true);

    setHidden(qBBox, true);
    qABox.classList.remove("hidden");
    clearStatus();

    qAOptions.innerHTML = "";
    qBOptions.innerHTML = "";

    // image + round
    sceneImg.src = IMG_BASE + scene.img;
    roundLabel.textContent = `${idx + 1} / ${SCENES.length}`;

    // show questions
    showScript(scene.q1.text, scene.q2.text);

    // build shuffled options
    q1Map = buildMap(scene.q1.options, scene.q1.correctIndex);
    q2Map = buildMap(scene.q2.options, scene.q2.correctIndex);

    // render q1 disabled until first audio attempt
    renderOptions(qAOptions, q1Map, onPickQ1);
    disableOptions(qAOptions);

    qAText.textContent = `A. ${scene.q1.text}`;
    qBText.textContent = `B. ${scene.q2.text}`;

    phase = "idle";
    replayBtn.disabled = false;
    replayBtn.textContent = "▶ Play";
  }

  async function playQ1ThenUnlock(){
    const scene = SCENES[idx];
    const ok = await playAudio(scene.q1.audio);

    // IMPORTANT: don’t trap the student.
    // After they tapped, unlock even if audio fails (file missing / browser weirdness).
    resetOptionStyles(qAOptions);
    phase = "q1_ready";

    return ok;
  }

  async function onPickQ1(btn, item){
    if (phase !== "q1_ready") return;
    if (q1Map.locked) return;
    q1Map.locked = true;

    if (item.isCorrect){
      btn.classList.add("correct");
      qAStatus.textContent = "✓";
      qAStatus.classList.add("ok");
      disableOptions(qAOptions);

      setHidden(feedbackOk, false);
      phase = "q1_done";
      await sleep(GAP_MS);

      setHidden(feedbackOk, true);

      // show Q2
      setHidden(qBBox, false);
      renderOptions(qBOptions, q2Map, onPickQ2);
      disableOptions(qBOptions);

      // try autoplay Q2 (should work after user gesture)
      const ok2 = await playAudio(SCENES[idx].q2.audio);
      if (ok2){
        resetOptionStyles(qBOptions);
        phase = "q2_ready";
      }else{
        // wait for user to press Play again
        phase = "q2_wait_audio";
      }
    }else{
      btn.classList.add("wrong");
      qAStatus.textContent = "✗";
      qAStatus.classList.add("bad");
      q1Map.locked = false; // allow retry
    }
  }

  async function onPickQ2(btn, item){
    if (phase !== "q2_ready") return;
    if (q2Map.locked) return;
    q2Map.locked = true;

    if (item.isCorrect){
      btn.classList.add("correct");
      qBStatus.textContent = "✓";
      qBStatus.classList.add("ok");
      disableOptions(qBOptions);

      setHidden(feedbackOk, false);
      phase = "q2_done";
      await sleep(GAP_MS);

      setHidden(feedbackOk, true);

      idx += 1;
      if (idx >= SCENES.length){
        phase = "ended";
        replayBtn.disabled = true;

        // SHOW end screen (this was broken before)
        setHidden(endScreen, false);
      }else{
        startScene();
      }
    }else{
      btn.classList.add("wrong");
      qBStatus.textContent = "✗";
      qBStatus.classList.add("bad");
      q2Map.locked = false; // allow retry
    }
  }

  replayBtn.addEventListener("click", async () => {
    if (phase === "idle"){
      await playQ1ThenUnlock();
      return;
    }

    if (phase === "q1_ready" || phase === "q1_done"){
      await playAudio(SCENES[idx].q1.audio);
      return;
    }

    if (phase === "q2_wait_audio"){
      const ok = await playAudio(SCENES[idx].q2.audio);
      if (ok){
        resetOptionStyles(qBOptions);
        phase = "q2_ready";
      }else{
        // still blocked/missing file; unlock anyway after tap
        resetOptionStyles(qBOptions);
        phase = "q2_ready";
      }
      return;
    }

    if (phase === "q2_ready" || phase === "q2_done"){
      await playAudio(SCENES[idx].q2.audio);
    }
  });

  startScene();
})();