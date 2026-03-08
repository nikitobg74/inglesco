const words = [
  { en: "Garage",      es: "garaje",        file: "u2.l1.p1.garage1.mp3",     img: "u2.l1.p1.garage.jpg" },
  { en: "Bedroom",     es: "habitación",    file: "u2.l1.p1.bedroom1.mp3",    img: "u2.l1.p2.bedroom1.jpg" },
  { en: "Kitchen",     es: "cocina",        file: "u2.l1.p1.kitchen1.mp3",    img: "u2.l1.p2.kitchen1.jpg" },
  { en: "Bathroom",    es: "baño",          file: "u2.l1.p1.bathroom1.mp3",   img: "u2.l1.p2.bathroom1.jpg" },
  { en: "Living room", es: "sala de estar", file: "u2.l1.p1.livingroom1.mp3", img: "u2.l1.p2.livingroom1.jpg" },
  { en: "Basement",    es: "sótano",        file: "u2.l1.p1.basement1.mp3",   img: "u2.l1.p2.basement1.jpg" },
  { en: "Yard",        es: "jardín",        file: "u2.l1.p1.yard1.mp3",       img: "u2.l1.p2.yard1.jpg" },
  { en: "Attic",       es: "ático",         file: "u2.l1.p1.attic1.mp3",      img: "u2.l1.p2.attic1.jpg" }
];

const IMAGE_BASE = "../../../../assets/images/u2/";
const AUDIO_BASE = "../../../../assets/audio/u2/";

const container = document.getElementById("wordsContainer");

let currentAudio = null;
let currentBox   = null;

function stopCurrentAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
  currentBox   = null;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffle(words);

words.forEach(word => {
  const card = document.createElement("div");
  card.classList.add("word-card");

  card.innerHTML = `
    <div class="card-img-wrap">
      <img src="${IMAGE_BASE}${word.img}" alt="${word.en}" loading="lazy">
      <div class="speaker-overlay">🔊</div>
    </div>
    <div class="card-text">
      <div class="word-en">${word.en}</div>
      <div class="word-es">${word.es}</div>
    </div>
  `;

  card.addEventListener("click", () => {
    // Tap same card while playing → stop
    if (currentAudio && currentBox === card) {
      stopCurrentAudio();
      return;
    }

    // Stop any previous audio
    stopCurrentAudio();

    const audio = new Audio(AUDIO_BASE + word.file);
    currentAudio = audio;
    currentBox   = card;

    card.classList.add("played");

    // Swap icon to checkmark while playing
    const icon = card.querySelector(".speaker-overlay");
    if (icon) icon.textContent = "✔";

    audio.addEventListener("ended", () => {
      currentAudio = null;
      currentBox   = null;
    });

    audio.play().catch(() => {
      currentAudio = null;
      currentBox   = null;
    });
  });

  container.appendChild(card);
});

// Progress step navigation
document.querySelectorAll(".step").forEach(step => {
  step.addEventListener("click", () => {
    stopCurrentAudio();
    const page = step.getAttribute("data-page");
    window.location.href = page;
  });
});

// Stop audio on page leave
window.addEventListener("beforeunload", () => {
  stopCurrentAudio();
});
