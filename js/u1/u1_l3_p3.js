document.addEventListener("DOMContentLoaded", function () {
  // ==========================
  // ELEMENTS
  // ==========================
  const audio = document.getElementById("mainAudio");
  const playSceneBtn = document.getElementById("playScene");
  const continueBtn = document.getElementById("continueBtn");

  const sceneSection = document.getElementById("sceneSection");
  const clientSection = document.getElementById("clientSection");
  const clientTitle = document.getElementById("clientTitle");
  const instructionBox = document.getElementById("instructionBox");
  const optionsContainer = document.getElementById("optionsContainer");
  const numbersSection = document.getElementById("numbersSection");
  const finishSection = document.getElementById("finishSection");
  const formFeedback = document.getElementById("formFeedback");

  const playNameBtn = document.getElementById("playName");
  const playNationalityBtn = document.getElementById("playNationality");
  const playAddressBtn = document.getElementById("playAddress");
  const playCityStateBtn = document.getElementById("playCityState");
  const playZipBtn = document.getElementById("playZip");
  const playIdBtn = document.getElementById("playId");

  const checkFormBtn = document.getElementById("checkFormBtn");
  const checkNumbersBtn = document.getElementById("checkNumbers");

  // ==========================
  // TAP STATE
  // ==========================
  let selectedOption = null; // the currently highlighted option div

  // ==========================
  // iOS-SAFE TAP HELPER
  // ==========================
  function onTap(el, handler) {
    let touchMoved = false;
    let handledByTouch = false;

    el.addEventListener("touchstart", () => {
      touchMoved = false;
      handledByTouch = false;
    }, { passive: true });

    el.addEventListener("touchmove", () => {
      touchMoved = true;
    }, { passive: true });

    el.addEventListener("touchend", (e) => {
      if (touchMoved) return;
      e.preventDefault();
      handledByTouch = true;
      handler(e);
    });

    el.addEventListener("click", (e) => {
      if (handledByTouch) { handledByTouch = false; return; }
      handler(e);
    });
  }

  // ==========================
  // I18N (STRINGS LIVE IN HTML)
  // ==========================
  const msgNodes = document.querySelectorAll("#i18n [data-msg]");
  const M = {};
  msgNodes.forEach((n) => (M[n.dataset.msg] = n.textContent));

  function setFeedback(code, isCorrect) {
    if (!formFeedback) return;
    formFeedback.textContent = M[code] || "";
    formFeedback.className = "feedback " + (isCorrect ? "correct" : "wrong");
  }

  function clearFeedback() {
    if (!formFeedback) return;
    formFeedback.textContent = "";
    formFeedback.className = "feedback";
  }

  // ==========================
  // AUDIO (NO OVERLAP)
  // ==========================
  function stopAudio() {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute("src");
      audio.load();
    } catch (_) {}
  }

  function playAudio(src) {
    if (!audio) return;
    stopAudio();
    audio.src = src;
    audio.currentTime = 0;
    audio.play();
  }

  window.addEventListener("beforeunload", () => stopAudio());

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => stopAudio());
  });

  document.querySelectorAll(".step").forEach((step) => {
    step.addEventListener("click", () => {
      const page = step.dataset.page;
      if (page) { stopAudio(); window.location.href = page; }
    });
  });

  // ==========================
  // CLIENTS DATA
  // ==========================
  const clients = {
    gabriela: {
      title: "Cliente: Gabriela Sanchez",
      instruction: "Toca una opción a la derecha para seleccionarla, luego toca el campo del formulario donde corresponde.",
      answers: {
        name: "Gabriela Sanchez",
        nationality: "Cuban",
        address: "254 Main Street",
        city: "Miami",
        state: "Florida",
        zip: "32104",
        id: "402971",
      },
      audio: {
        name: "../../../../assets/audio/u1/u1_l3_p3_gabriela1.mp3",
        nationality: "../../../../assets/audio/u1/u1_l3_p3_gabriela2.mp3",
        address: "../../../../assets/audio/u1/u1_l3_p3_gabriela3.mp3",
        citystate: "../../../../assets/audio/u1/u1_l3_p3_gabriela4.mp3",
        zip: "../../../../assets/audio/u1/u1_l3_p3_gabriela5.mp3",
        id: "../../../../assets/audio/u1/u1_l3_p3_gabriela6.mp3",
      },
    },
    pedro: {
      title: "Cliente: Pedro Martinez",
      instruction: "Toca una opción a la derecha para seleccionarla, luego toca el campo del formulario donde corresponde.",
      answers: {
        name: "Pedro Martinez",
        nationality: "Chilean",
        address: "719 Grand Avenue",
        city: "Los Angeles",
        state: "California",
        zip: "90215",
        id: "518043",
      },
      audio: {
        name: "../../../../assets/audio/u1/u1_l3_p3_pedro1.mp3",
        nationality: "../../../../assets/audio/u1/u1_l3_p3_pedro2.mp3",
        address: "../../../../assets/audio/u1/u1_l3_p3_pedro3.mp3",
        citystate: "../../../../assets/audio/u1/u1_l3_p3_pedro4.mp3",
        zip: "../../../../assets/audio/u1/u1_l3_p3_pedro5.mp3",
        id: "../../../../assets/audio/u1/u1_l3_p3_pedro6.mp3",
      },
    },
  };

  let currentClientKey = "gabriela";
  let currentClient = null;

  // ==========================
  // SCENE AUDIO
  // ==========================
  if (playSceneBtn) {
    playSceneBtn.addEventListener("click", () => {
      playAudio("../../../../assets/audio/u1/u1_l3_p3_reception.mp3");
    });
  }

  if (audio && continueBtn) {
    audio.addEventListener("ended", () => {
      continueBtn.classList.remove("hidden");
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener("click", () => startClient(currentClientKey));
  }

  // ==========================
  // START CLIENT
  // ==========================
  function startClient(key) {
    currentClientKey = key;
    currentClient = clients[key];

    if (sceneSection) sceneSection.classList.add("hidden");
    if (clientSection) clientSection.classList.remove("hidden");
    if (clientTitle) clientTitle.textContent = currentClient.title;
    if (instructionBox) instructionBox.textContent = currentClient.instruction;

    selectedOption = null;
    clearFeedback();

    if (finishSection) finishSection.classList.add("hidden");
    if (numbersSection) numbersSection.classList.add("hidden");

    resetForm();
    loadOptions();
  }

  // ==========================
  // AUDIO CONTROLS
  // ==========================
  function playClientAudio(field) {
    if (!currentClient) return;
    playAudio(currentClient.audio[field]);
  }

  if (playNameBtn) playNameBtn.addEventListener("click", () => playClientAudio("name"));
  if (playNationalityBtn) playNationalityBtn.addEventListener("click", () => playClientAudio("nationality"));
  if (playAddressBtn) playAddressBtn.addEventListener("click", () => playClientAudio("address"));
  if (playCityStateBtn) playCityStateBtn.addEventListener("click", () => playClientAudio("citystate"));
  if (playZipBtn) playZipBtn.addEventListener("click", () => playClientAudio("zip"));
  if (playIdBtn) playIdBtn.addEventListener("click", () => playClientAudio("id"));

  // ==========================
  // TAP-TO-SELECT / TAP-TO-PLACE
  // ==========================
  function deselectOption() {
    if (selectedOption) {
      selectedOption.classList.remove("selected");
      selectedOption = null;
    }
  }

  function makeOptionElement(text) {
    const div = document.createElement("div");
    div.className = "draggable";
    div.textContent = text;

    onTap(div, () => {
      if (selectedOption === div) {
        deselectOption(); // tap again to deselect
        return;
      }
      deselectOption();
      selectedOption = div;
      div.classList.add("selected");
    });

    return div;
  }

  function loadOptions() {
    if (!optionsContainer || !currentClient) return;
    optionsContainer.innerHTML = "";

    [
      currentClient.answers.name,
      currentClient.answers.nationality,
      currentClient.answers.address,
      currentClient.answers.city,
      currentClient.answers.state,
    ].forEach((text) => {
      optionsContainer.appendChild(makeOptionElement(text));
    });
  }

  // Attach tap listeners to all dropzones
  document.querySelectorAll(".dropzone").forEach((zone) => {
    onTap(zone, () => {
      if (selectedOption) {
        // Return existing content to options bank first
        if (zone.dataset.placedText) {
          optionsContainer.appendChild(makeOptionElement(zone.dataset.placedText));
        }
        // Place selected option here
        zone.textContent = selectedOption.textContent;
        zone.dataset.placedText = selectedOption.textContent;
        zone.classList.add("filled");
        selectedOption.remove();
        deselectOption();
        clearFeedback();
      } else if (zone.dataset.placedText) {
        // Tap filled zone with nothing selected → return to bank
        optionsContainer.appendChild(makeOptionElement(zone.dataset.placedText));
        zone.textContent = "";
        zone.dataset.placedText = "";
        zone.classList.remove("filled");
        clearFeedback();
      }
    });
  });

  // ==========================
  // CHECK FORM
  // ==========================
  if (checkFormBtn) {
    checkFormBtn.addEventListener("click", () => {
      if (!currentClient) return;

      let allFilled = true;
      let correct = true;

      document.querySelectorAll(".dropzone").forEach((zone) => {
        const value = zone.dataset.placedText || "";
        if (!value) {
          allFilled = false;
        } else if (value !== currentClient.answers[zone.dataset.field]) {
          correct = false;
        }
      });

      if (!allFilled) { setFeedback("fill_all", false); return; }

      if (correct) {
        setFeedback("all_correct", true);
        if (numbersSection) numbersSection.classList.remove("hidden");
      } else {
        setFeedback("try_again", false);
      }
    });
  }

  // ==========================
  // NUMBERS CHECK
  // ==========================
  if (checkNumbersBtn) {
    checkNumbersBtn.addEventListener("click", () => {
      if (!currentClient) return;

      const zipInput = document.getElementById("zipInput");
      const idInput = document.getElementById("idInput");
      const zip = zipInput ? zipInput.value.trim() : "";
      const id = idInput ? idInput.value.trim() : "";

      if (zip === currentClient.answers.zip && id === currentClient.answers.id) {
        setFeedback("all_correct", true);
        if (currentClientKey === "gabriela") {
          setTimeout(() => startClient("pedro"), 700);
        } else {
          if (finishSection) finishSection.classList.remove("hidden");
        }
      } else {
        setFeedback("try_again", false);
      }
    });
  }

  // ==========================
  // RESET
  // ==========================
  function resetForm() {
    document.querySelectorAll(".dropzone").forEach((z) => {
      z.textContent = "";
      z.dataset.placedText = "";
      z.classList.remove("filled");
    });

    const zipInput = document.getElementById("zipInput");
    const idInput = document.getElementById("idInput");
    if (zipInput) zipInput.value = "";
    if (idInput) idInput.value = "";

    if (numbersSection) numbersSection.classList.add("hidden");
    if (finishSection) finishSection.classList.add("hidden");
  }
});
