// u2_l2_p3.js
(() => {
  const CONFIG = {
    IMG_BASE: "../../../../assets/images/u2/",
    AUDIO_BASE: "../../../../assets/audio/u2/"
  };

  // Data only (no UI strings in JS)
  const LOCATIONS = [
    { key: "restaurant",   en: "restaurant",    es: "restaurante",        img: "u2.l2.p3.restaurant.jpg",   audio: "u2.l2.p3.restaurant.mp3" },
    { key: "bank",         en: "bank",          es: "banco",              img: "u2.l2.p3.bank.jpg",         audio: "u2.l2.p3.bank.mp3" },
    { key: "hospital",     en: "hospital",      es: "hospital",           img: "u2.l2.p3.hospital.jpg",     audio: "u2.l2.p3.hospital.mp3" },
    { key: "supermarket",  en: "supermarket",   es: "supermercado",       img: "u2.l2.p3.supermarket.jpg", audio: "u2.l2.p3.supermarket.mp3" },
    { key: "library",      en: "library",       es: "biblioteca",         img: "u2.l2.p3.library.jpg",      audio: "u2.l2.p3.library.mp3" },
    { key: "park",         en: "park",          es: "parque",             img: "u2.l2.p3.park.jpg",         audio: "u2.l2.p3.park.mp3" },
    { key: "zoo",          en: "zoo",           es: "zoológico",          img: "u2.l2.p3.zoo.jpg",          audio: "u2.l2.p3.zoo.mp3" },
    { key: "postoffice",   en: "post office",   es: "oficina de correos", img: "u2.l2.p3.postoffice.jpg",  audio: "u2.l2.p3.postoffice.mp3" },
    { key: "movietheatre", en: "movie theatre", es: "cine",               img: "u2.l2.p3.movietheater.jpg", audio: "u2.l2.p3.movietheatre.mp3" },
    { key: "office",       en: "office",        es: "oficina",            img: "u2.l2.p3.office.jpg",       audio: "u2.l2.p3.office.mp3" }
  ];

  const elCards = document.getElementById("cards");
  const elPlayedCount = document.getElementById("playedCount");
  const elTotalCount = document.getElementById("totalCount");
  const elNextBtn = document.getElementById("nextBtn");

  // Progress navigation circles (same behavior as p2)
  const steps = document.querySelectorAll(".step");
  steps.forEach(step => {
    step.addEventListener("click", () => {
      const page = step.getAttribute("data-page");
      if (page) window.location.href = page;
    });
  });

  // Single audio player prevents overlap
  const player = new Audio();
  player.preload = "none";

  // Track first-time listens
  const listened = new Set();

  function stopAudio() {
    try {
      player.pause();
      player.currentTime = 0;
    } catch (_) {}
  }

  function playAudio(src) {
    stopAudio();
    return new Promise((resolve, reject) => {
      player.onended = () => resolve();
      player.onerror = () => reject(new Error("audio_error"));
      player.src = src;
      player.play().then(resolve).catch(reject);
    });
  }

  function updateCounter() {
    if (elPlayedCount) elPlayedCount.textContent = String(listened.size);
    if (elTotalCount) elTotalCount.textContent = String(LOCATIONS.length);
  }

  function showNextIfDone() {
    if (!elNextBtn) return;

    const done = listened.size === LOCATIONS.length;

    if (done) {
      elNextBtn.classList.remove("disabled");
      // Make it appear only when done
      elNextBtn.style.display = "inline-block";

      // Scroll to the bottom so user sees it
      setTimeout(() => {
        elNextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
    } else {
      elNextBtn.classList.add("disabled");
      // Hide until done (your request)
      elNextBtn.style.display = "none";
    }
  }

  function makeCard(item) {
    const card = document.createElement("div");
    card.className = "loc-card";
    card.dataset.key = item.key;

    const imgSrc = CONFIG.IMG_BASE + item.img;
    const audioSrc = CONFIG.AUDIO_BASE + item.audio;

    card.innerHTML = `
      <img class="loc-img" src="${imgSrc}" alt="${item.en}">
      <div class="loc-words">
        <div class="loc-en">${item.en}</div>
        <div class="loc-es">${item.es}</div>
      </div>
      <div class="play-row">
        <button type="button" class="play-btn" aria-label="Play ${item.en}" data-audio="${audioSrc}">▶</button>
      </div>
    `;

    const btn = card.querySelector(".play-btn");
    btn.addEventListener("click", async () => {
      const src = btn.getAttribute("data-audio");

      // prevent rapid double clicks
      btn.disabled = true;
      const oldText = btn.textContent;
      btn.textContent = "…";

      try {
        await playAudio(src);

        // Mark as listened first time only
        if (!listened.has(item.key)) {
          listened.add(item.key);
          card.classList.add("played");
          updateCounter();
          showNextIfDone();
        }
      } catch (_) {
        // Do nothing; user can try again
      } finally {
        btn.disabled = false;
        btn.textContent = oldText;
      }
    });

    return card;
  }

  function init() {
    if (!elCards) return;

    elCards.innerHTML = "";
    LOCATIONS.forEach(loc => elCards.appendChild(makeCard(loc)));

    updateCounter();
    showNextIfDone();

    // Stop audio on navigation
    window.addEventListener("pagehide", stopAudio);
    window.addEventListener("beforeunload", stopAudio);
  }

  init();
})();