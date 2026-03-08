// ../../../../js/u3/u3_l3_p2.js
(() => {
  "use strict";

  const IMG_BASE = "../../../../assets/images/u3/";
  const AUDIO_BASE = "../../../../assets/audio/u3/l3/"; // not used in P2 (kept for consistency)
  const GAP_MS = 650;

  // P2: Pronoun choice (harder than 50/50)
  // Student chooses ONE pronoun that must fit BOTH blanks.
  // Options: We / They / He / She
  const SCENES = [
    {
      img: "u3.l3.p1.clark.jpg",
      who: "Mr. and Mrs. Clark",
      line1: "Mr. and Mrs. Clark are in the dining room.",
      line2: "They are eating dinner.",
      correctPronoun: "They",
      p1: "_____ are in the dining room.",
      p2: "_____ are eating dinner."
    },
    {
      img: "u3.l3.p2.library.jpg",
      who: "Julie and Martha",
      line1: "Julie and Martha are at the library.",
      line2: "They are reading books.",
      correctPronoun: "They",
      p1: "_____ are at the library.",
      p2: "_____ are reading books."
    },
    {
      img: "u3.l3.p1.we.cards.jpg",
      who: "We",
      line1: "We are in the living room.",
      line2: "We are playing cards.",
      correctPronoun: "We",
      p1: "_____ are in the living room.",
      p2: "_____ are playing cards."
    },
    {
      img: "u3.l3.p1.gary.phil.jpg",
      who: "Gary and Phil",
      line1: "Gary and Phil are in the yard.",
      line2: "They are playing baseball.",
      correctPronoun: "They",
      p1: "_____ are in the yard.",
      p2: "_____ are playing baseball."
    },
    {
      img: "u3.l3.p2.kitchen.jpg",
      who: "Tom and I",
      line1: "Tom and I are in the kitchen.",
      line2: "We are cooking dinner.",
      correctPronoun: "We",
      p1: "_____ are in the kitchen.",
      p2: "_____ are cooking dinner."
    },
    {
      img: "u3.l3.p2.tv.jpg",
      who: "Carol and Ken",
      line1: "Carol and Ken are in the living room.",
      line2: "They are watching TV.",
      correctPronoun: "They",
      p1: "_____ are in the living room.",
      p2: "_____ are watching TV."
    }
  ];

  // ===== DOM =====
  const sceneImg = document.getElementById("sceneImg");
  const whoLabel = document.getElementById("whoLabel");
  const roundLabel = document.getElementById("roundLabel");

  const fullLine1 = document.getElementById("fullLine1");
  const fullLine2 = document.getElementById("fullLine2");

  const qStatus = document.getElementById("qStatus");
  const prompt1 = document.getElementById("prompt1");
  const prompt2 = document.getElementById("prompt2");

  const options = document.getElementById("options");
  const feedbackOk = document.getElementById("feedbackOk");
  const endScreen = document.getElementById("endScreen");

  // Guard
  const required = [sceneImg, whoLabel, roundLabel, fullLine1, fullLine2, qStatus, prompt1, prompt2, options, feedbackOk, endScreen];
  if (required.some(x => !x)) {
    console.error("P2 DOM is missing required elements. Check IDs in p2.html.");
    return;
  }

  // ===== Helpers =====
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

  function makePromptHTML(text){
    // Replace first occurrence of "_____" with the styled blank span
    return text.replace("_____", '<span class="blank">_____</span>');
  }

  function setOptionsDisabled(disabled){
    [...options.querySelectorAll("button.opt")].forEach(b => (b.disabled = disabled));
  }

  // ===== State =====
  const order = fisherYates([...SCENES]);
  let idx = 0;
  let locked = false;

  const CHOICES = ["We", "They", "He", "She"];

  function renderScene(){
    const s = order[idx];

    setHidden(endScreen, true);
    setHidden(feedbackOk, true);
    locked = false;

    // Image + labels
    sceneImg.src = IMG_BASE + s.img;
    whoLabel.textContent = s.who;
    roundLabel.textContent = `${idx + 1} / ${order.length}`;

    // Input text
    fullLine1.textContent = s.line1;
    fullLine2.textContent = s.line2;

    // Prompts
    prompt1.innerHTML = makePromptHTML(s.p1);
    prompt2.innerHTML = makePromptHTML(s.p2);

    // Status + options
    clearStatus();
    options.innerHTML = "";

    // Shuffle answer buttons
    const shuffled = fisherYates([...CHOICES]);
    for (const c of shuffled){
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.textContent = c;
      btn.addEventListener("click", () => onPick(btn, c));
      options.appendChild(btn);
    }
  }

  async function onPick(btn, choice){
    if (locked) return;
    locked = true;

    const s = order[idx];
    const ok = choice === s.correctPronoun;

    if (ok){
      btn.classList.add("correct");
      setStatus(true);
      setHidden(feedbackOk, false);
      setOptionsDisabled(true);

      await sleep(GAP_MS);

      setHidden(feedbackOk, true);

      idx += 1;
      if (idx >= order.length){
        // End
        setHidden(endScreen, false);

        // Clean the practice area so it doesn't look "broken" behind the end screen
        options.innerHTML = "";
        prompt1.innerHTML = "";
        prompt2.innerHTML = "";

        whoLabel.textContent = "✅";
        fullLine1.textContent = "¡Excelente!";
        fullLine2.textContent = "Terminaste la Parte 2.";
        clearStatus();
      } else {
        renderScene();
      }
    } else {
      btn.classList.add("wrong");
      setStatus(false);
      locked = false; // allow retry
    }
  }

  // Init
  renderScene();
})();