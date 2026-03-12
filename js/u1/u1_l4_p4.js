document.addEventListener("DOMContentLoaded", () => {
  const checkBtn  = document.getElementById("checkBtn");
  const resetBtn  = document.getElementById("resetBtn");
  const feedback  = document.getElementById("feedback");

  // i18n strings live in HTML
  const M = {};
  document.querySelectorAll("#i18n [data-msg]").forEach((n) => (M[n.dataset.msg] = n.textContent));

  function setFeedback(code, ok) {
    if (!feedback) return;
    feedback.textContent = M[code] || "";
    feedback.className = "feedback " + (ok ? "correct" : "wrong");
  }

  function clearFeedback() {
    if (!feedback) return;
    feedback.textContent = "";
    feedback.className = "feedback";
  }

  if (!checkBtn || !resetBtn) return;

  checkBtn.addEventListener("click", () => {
    let allCorrect = true;

    document.querySelectorAll(".number-input, .word-input").forEach((input) => {
      const answer = (input.dataset.answer || "").trim().toLowerCase();
      const value  = (input.value  || "").trim().toLowerCase();

      input.classList.remove("correct", "wrong");
      if (value === answer) {
        input.classList.add("correct");
      } else {
        input.classList.add("wrong");
        allCorrect = false;
      }
    });

    setFeedback(allCorrect ? "all_correct" : "check_red", allCorrect);
  });

  resetBtn.addEventListener("click", () => {
    document.querySelectorAll(".number-input, .word-input").forEach((input) => {
      input.value = "";
      input.classList.remove("correct", "wrong");
    });
    clearFeedback();
  });
});
