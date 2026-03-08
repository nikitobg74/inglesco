const words = [
  { en: "Garage", file: "u2.l1.p1.garage1.mp3" },
  { en: "Bedroom", file: "u2.l1.p1.bedroom1.mp3" },
  { en: "Kitchen", file: "u2.l1.p1.kitchen1.mp3" },
  { en: "Bathroom", file: "u2.l1.p1.bathroom1.mp3" },
  { en: "Living room", file: "u2.l1.p1.livingroom1.mp3" },
  { en: "Basement", file: "u2.l1.p1.basement1.mp3" },
  { en: "Yard", file: "u2.l1.p1.yard1.mp3" },
  { en: "Attic", file: "u2.l1.p1.attic1.mp3" }
];

const container = document.getElementById("wordsContainer");

let currentAudio = null;
let currentBox = null;

function stopCurrentAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
  currentBox = null;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffle(words);

words.forEach(word => {
  const box = document.createElement("div");
  box.classList.add("word-box");

  box.innerHTML = `
    <div class="word-en">${word.en}</div>
    <div class="word-es">&nbsp;</div>
  `;

  box.addEventListener("click", () => {
    const audioPath = "../../../../assets/audio/u2/" + word.file;

    // If the same box is clicked while playing, stop it.
    if (currentAudio && currentBox === box) {
      stopCurrentAudio();
      return;
    }

    // Always stop previous audio to prevent overlap.
    stopCurrentAudio();

    const audio = new Audio(audioPath);
    currentAudio = audio;
    currentBox = box;

    box.classList.add("played");

    audio.addEventListener("ended", () => {
      currentAudio = null;
      currentBox = null;
    });

    audio.play().catch(() => {
      // If autoplay is blocked or file missing, just reset state safely
      currentAudio = null;
      currentBox = null;
    });
  });

  container.appendChild(box);
});

document.querySelectorAll(".step").forEach(step => {
  step.addEventListener("click", () => {
    stopCurrentAudio();
    const page = step.getAttribute("data-page");
    window.location.href = page;
  });
});

// Safety: stop audio if user leaves/refreshes the page
window.addEventListener("beforeunload", () => {
  stopCurrentAudio();
});