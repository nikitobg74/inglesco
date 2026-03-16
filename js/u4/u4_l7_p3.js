(() => {
  const PARAGRAPHS = [
    {
      text: `Everyone is busy today.
Peggy is in her kitchen. She is ____ dinner.
Patty and Danny are at the restaurant.
This restaurant is new and ____.
Right now they are ____ dinner.`,
      answers: ["cooking", "expensive", "eating"]
    },
    {
      text: `Jenny is my sister. She is married.
Her house is ____ and old.
Right now she is in the basement.
She is ____ clothes.`,
      answers: ["small", "washing"]
    },
    {
      text: `Charles is my brother. He is not married.
He is ____.
His apartment is big.
Right now he is at the bar.
He is ____ beer.`,
      answers: ["single", "drinking"]
    },
    {
      text: `Tim is in the garage.
He is ____ his old car.
George is at the gym.
He is ____.
Where am I?
I am in my small bedroom.
I am ____ TV.`,
      answers: ["fixing", "exercising", "watching"]
    }
  ];

  let paragraphIndex = 0;
  let answerIndex = 0;

  const textBox = document.getElementById("textBox");
  const tiles = document.getElementById("tiles");
  const counter = document.getElementById("counter");
  const bar = document.getElementById("progressBar");
  const endScreen = document.getElementById("endScreen");

  function updateProgress() {
    counter.textContent = `${paragraphIndex + 1} / ${PARAGRAPHS.length}`;
    bar.style.width = ((paragraphIndex + 1) / PARAGRAPHS.length * 100) + "%";
  }

  function renderText() {
    const p = PARAGRAPHS[paragraphIndex];
    // Use a global regex so ALL blanks are replaced in one pass — no infinite loop
    const html = p.text.replace(/____/g, "<span class='blank'>____</span>");
    textBox.innerHTML = html;
    renderTiles();
    updateProgress();
  }

  function renderTiles() {
    tiles.innerHTML = "";
    const words = [...PARAGRAPHS[paragraphIndex].answers];
    shuffle(words);
    words.forEach(word => {
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.textContent = word;
      btn.onclick = () => selectWord(btn, word);
      tiles.appendChild(btn);
    });
  }

  function selectWord(btn, word) {
    const blanks = document.querySelectorAll(".blank");
    const correct = PARAGRAPHS[paragraphIndex].answers[answerIndex];
    if (word === correct) {
      blanks[answerIndex].textContent = word;
      blanks[answerIndex].classList.add("correct");
      btn.classList.add("correct");
      btn.classList.add("used");
      answerIndex++;
      if (answerIndex === PARAGRAPHS[paragraphIndex].answers.length) {
        setTimeout(nextParagraph, 1000);
      }
    } else {
      textBox.classList.add("shake");
      setTimeout(() => {
        textBox.classList.remove("shake");
      }, 400);
    }
  }

  function nextParagraph() {
    paragraphIndex++;
    answerIndex = 0;
    if (paragraphIndex >= PARAGRAPHS.length) {
      document.querySelector(".card").style.display = "none";
      endScreen.classList.add("show");
      return;
    }
    renderText();
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  renderText();
})();
