document.addEventListener("DOMContentLoaded", () => {
  const checkBtn = document.getElementById("checkBtn");
  const resetBtn = document.getElementById("resetBtn");
  const feedback = document.getElementById("feedback");

  // i18n strings live in HTML (so JS has no Spanish)
  const msgNodes = document.querySelectorAll("#i18n [data-msg]");
  const M = {};
  msgNodes.forEach((n) => (M[n.dataset.msg] = n.textContent));

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

  if (!checkBtn || !resetBtn || !feedback) return;

  checkBtn.addEventListener("click", () => {
    let allCorrect = true;

    document.querySelectorAll(".number-input, .word-input").forEach((input) => {
      const answer = (input.dataset.answer || "").trim().toLowerCase();
      const value = (input.value || "").trim().toLowerCase();

      if (value === answer) {
        input.style.borderColor = "#16a34a"; // green
      } else {
        input.style.borderColor = "#dc2626"; // red
        allCorrect = false;
      }
    });

    if (allCorrect) {
      setFeedback("all_correct", true);
    } else {
      setFeedback("check_red", false);
    }
  });

  resetBtn.addEventListener("click", () => {
    document.querySelectorAll(".number-input, .word-input").forEach((input) => {
      input.value = "";
      input.style.borderColor = "#cbd5e1";
    });
    clearFeedback();
  });
});