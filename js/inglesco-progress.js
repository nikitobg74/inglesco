/**
 * inglesco-progress.js
 * Drop this file at: inglesco/en/js/inglesco-progress.js
 *
 * Usage — mark a lesson complete (call this at the end of p5):
 *   markLessonComplete("u5-l2");
 *
 * Usage — check if a lesson is complete (for index pages):
 *   if (isLessonComplete("u5-l2")) { ... }
 *
 * Usage — add ✅ badges automatically on an index page:
 *   markCompletedLessons();   // call after DOM is ready
 *   Any <a> or element with data-lesson="u5-l2" gets class "lesson-done"
 */

const PROGRESS_KEY = "inglesco_progress";

function _getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch(e) {
    return {};
  }
}

function markLessonComplete(lessonId) {
  const data = _getProgress();
  data[lessonId] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

function isLessonComplete(lessonId) {
  return !!_getProgress()[lessonId];
}

/**
 * Call on index pages.
 * Finds all elements with data-lesson="u5-l2" (or any lesson id)
 * and adds class "lesson-done" if that lesson is complete.
 */
function markCompletedLessons() {
  const data = _getProgress();
  document.querySelectorAll("[data-lesson]").forEach(el => {
    const id = el.dataset.lesson;
    if (data[id]) {
      el.classList.add("lesson-done");
    }
  });
}
