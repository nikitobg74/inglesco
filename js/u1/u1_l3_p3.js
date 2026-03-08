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
  // STATE
  // ==========================
  let currentClientKey = "gabriela";
  let currentClient = null;

  let dragSourceContainer = null;
  let draggableCounter = 0;

  // ==========================
  // I18N (STRINGS LIVE IN HTML)
  // ==========================
  const msgNodes = document.querySelectorAll("#i18n [data-msg]");
  const M = {};
  msgNodes.forEach((n) => (M[n.dataset.msg] = n.textContent));

  function setFeedback(code, isCorrect) {
    if (!formFeedback) return;

    // language-neutral codes -> localized text from HTML
    const text = M[code] || "";

    formFeedback.textContent = text;
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
      if (page) {
        stopAudio();
        window.location.href = page;
      }
    });
  });

  // ==========================
  // CLIENTS DATA (PATHS FIXED)
  // ==========================
  const clients = {
    gabriela: {
      title: "Cliente: Gabriela Sanchez", // (content data, not UI feedback)
      instruction:
        "Haz clic en las cajas a la derecha para escuchar la información y completa el formulario abajo.", // (content data)
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
      instruction:
        "Haz clic en las cajas a la derecha para escuchar la información y completa el formulario abajo.",
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

  // ==========================
  // CONTINUE TO CLIENT
  // ==========================
  if (continueBtn) {
    continueBtn.addEventListener("click", () => startClient(currentClientKey));
  }

  function startClient(key) {
    currentClientKey = key;
    currentClient = clients[key];

    if (sceneSection) sceneSection.classList.add("hidden");
    if (clientSection) clientSection.classList.remove("hidden");

    if (clientTitle) clientTitle.textContent = currentClient.title;
    if (instructionBox) instructionBox.textContent = currentClient.instruction;

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
  // DRAG & DROP
  // ==========================
  function makeDraggableElement(text) {
    const div = document.createElement("div");
    div.className = "draggable";
    div.textContent = text;
    div.draggable = true;
    div.id = "drag-item-" + draggableCounter++;

    div.addEventListener("dragstart", (e) => {
      dragSourceContainer = div.parentElement;
      e.dataTransfer.setData("text/plain", div.id);
    });

    return div;
  }

  function loadOptions() {
    if (!optionsContainer || !currentClient) return;

    optionsContainer.innerHTML = "";

    const options = [
      currentClient.answers.name,
      currentClient.answers.nationality,
      currentClient.answers.address,
      currentClient.answers.city,
      currentClient.answers.state,
    ];

    options.forEach((text) => {
      optionsContainer.appendChild(makeDraggableElement(text));
    });
  }

  document.querySelectorAll(".dropzone").forEach((zone) => {
    zone.addEventListener("dragover", (e) => e.preventDefault());

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const dragged = document.getElementById(id);
      if (!dragged) return;

      if (zone.firstChild) {
        optionsContainer.appendChild(zone.firstChild);
      }

      zone.textContent = "";
      zone.appendChild(dragged);
      zone.classList.add("filled");
    });
  });

  if (optionsContainer) {
    optionsContainer.addEventListener("dragover", (e) => e.preventDefault());

    optionsContainer.addEventListener("drop", (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const dragged = document.getElementById(id);
      if (!dragged) return;

      if (dragSourceContainer && dragSourceContainer.classList.contains("dropzone")) {
        dragSourceContainer.classList.remove("filled");
        dragSourceContainer.textContent = "";
      }

      optionsContainer.appendChild(dragged);
    });
  }

  // ==========================
  // CHECK FORM (LANGUAGE-NEUTRAL CODES)
  // ==========================
  if (checkFormBtn) {
    checkFormBtn.addEventListener("click", () => {
      if (!currentClient) return;

      let allFilled = true;
      let correct = true;

      document.querySelectorAll(".dropzone").forEach((zone) => {
        const field = zone.dataset.field;
        const value = zone.firstChild ? zone.firstChild.textContent : "";

        if (!value) {
          allFilled = false;
        } else if (value !== currentClient.answers[field]) {
          correct = false;
        }
      });

      if (!allFilled) {
        setFeedback("fill_all", false);
        return;
      }

      if (correct) {
        setFeedback("all_correct", true);
        if (numbersSection) numbersSection.classList.remove("hidden");
      } else {
        setFeedback("try_again", false);
      }
    });
  }

  // ==========================
  // NUMBERS CHECK (LANGUAGE-NEUTRAL CODES)
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