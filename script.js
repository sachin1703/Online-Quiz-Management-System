const API = "http://localhost:3000";

let questions = [];
let currentIndex = 0;
let answers = [];
let timerId = null;
let timeLeft = 300;
let quizEndTime = null;
let allAttemptResults = [];
const QUIZ_STATE_KEY = "activeQuizState";

function requireLogin() {
  const publicPages = ["index.html", "signup.html", ""];
  const page = location.pathname.split("/").pop();
  const user = localStorage.getItem("user");

  if (!user && !publicPages.includes(page)) {
    location.href = "index.html";
  }
}

function setUserLabels() {
  const user = localStorage.getItem("user") || "";
  const userName = document.getElementById("userName");
  const dropdownUserName = document.getElementById("dropdownUserName");
  const welcome = document.getElementById("welcome");

  if (userName) userName.textContent = user;
  if (dropdownUserName) dropdownUserName.textContent = user;
  if (welcome) welcome.textContent = `Welcome ${user}`;
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function decodeOptionText(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = String(value || "");
  return textarea.value;
}
function saveQuizState() {
  if (!questions.length) return;

  localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify({
    user: localStorage.getItem("user") || "",
    subject: localStorage.getItem("subject") || "",
    level: localStorage.getItem("level") || "",
    questions,
    answers,
    currentIndex,
    timeLeft,
    quizEndTime
  }));
}

function getSavedQuizState(subject, level) {
  const saved = JSON.parse(localStorage.getItem(QUIZ_STATE_KEY) || "null");
  const user = localStorage.getItem("user") || "";

  if (!saved) return null;
  if (saved.user !== user) return null;
  if (saved.subject !== subject || saved.level !== level) return null;
  if (!Array.isArray(saved.questions) || !Array.isArray(saved.answers)) return null;

  return saved;
}

function clearQuizState() {
  localStorage.removeItem(QUIZ_STATE_KEY);
}

async function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please fill all fields");
    return;
  }

  const res = await fetch(`${API}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) location.href = "index.html";
}

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    alert("Invalid login");
    return;
  }

  localStorage.clear();
  localStorage.setItem("user", username);
  location.href = "dashboard.html";
}

function startQuiz() {
  location.href = "select.html";
}

function viewResult() {
  location.href = "result.html";
}

function viewAllResults() {
  location.href = "allresults.html";
}

function goBack() {
  location.href = "dashboard.html";
}


function toggleUserMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById("userMenu");
  const button = document.querySelector(".user-menu-btn");
  if (!menu) return;

  const isOpen = menu.classList.toggle("open");
  if (button) button.setAttribute("aria-expanded", String(isOpen));
}

document.addEventListener("click", () => {
  const menu = document.getElementById("userMenu");
  const button = document.querySelector(".user-menu-btn");
  if (!menu) return;

  menu.classList.remove("open");
  if (button) button.setAttribute("aria-expanded", "false");
});
function logout() {
  localStorage.clear();
  location.href = "index.html";
}


function closeCustomSelects() {
  document.querySelectorAll(".custom-select.open").forEach((select) => {
    select.classList.remove("open");
  });
}

function toggleCustomSelect(event, button) {
  event.stopPropagation();
  const wrapper = button.closest(".custom-select");
  const wasOpen = wrapper.classList.contains("open");

  closeCustomSelects();
  if (!wasOpen) wrapper.classList.add("open");
}

function chooseCustomOption(button, targetId, value, label) {
  const select = document.getElementById(targetId);
  const wrapper = button.closest(".custom-select");
  const text = wrapper.querySelector(".custom-select-btn strong");

  select.value = value;
  text.textContent = label;
  wrapper.classList.toggle("has-value", Boolean(value));

  wrapper.querySelectorAll(".custom-select-menu button").forEach((item) => {
    item.classList.remove("selected");
  });
  button.classList.add("selected");

  closeCustomSelects();
}

document.addEventListener("click", closeCustomSelects);
function startSelectedQuiz() {
  const subject = document.getElementById("subject").value;
  const level = document.getElementById("level").value;

  if (!subject || !level) {
    alert("Please select subject and level");
    return;
  }

  localStorage.setItem("subject", subject);
  localStorage.setItem("level", level);
  clearQuizState();
  location.href = "quiz.html";
}

async function fetchQuestions() {
  const subject = localStorage.getItem("subject");
  const level = localStorage.getItem("level");
  const saved = getSavedQuizState(subject, level);

  if (saved) {
    questions = saved.questions;
    answers = saved.answers;
    currentIndex = saved.currentIndex || 0;
    timeLeft = Number.isFinite(saved.timeLeft) ? saved.timeLeft : 300;
    quizEndTime = Number.isFinite(saved.quizEndTime)
      ? saved.quizEndTime
      : Date.now() + timeLeft * 1000;

    createNavigator();
    loadQuestion();
    startTimer();
    return;
  }

  const res = await fetch(`${API}/questions?subject=${subject}&level=${level}`);
  const data = await res.json();

  questions = data.sort(() => Math.random() - 0.5).slice(0, 10);
  answers = new Array(questions.length).fill("");
  currentIndex = 0;
  timeLeft = 300;
  quizEndTime = Date.now() + timeLeft * 1000;

  createNavigator();
  loadQuestion();
  saveQuizState();
  startTimer();
}

function createNavigator() {
  const navigator = document.getElementById("navigator");
  if (!navigator) return;

  navigator.innerHTML = questions
    .map((_, index) => `<button type="button" id="nav${index}" onclick="goToQuestion(${index})">${index + 1}</button>`)
    .join("");
}

function loadQuestion() {
  if (!questions.length) return;

  const question = questions[currentIndex];
  document.getElementById("qno").textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  document.getElementById("question").textContent = question.question;

  document.getElementById("options").innerHTML = question.options
    .map((option, index) => {
      const letter = String.fromCharCode(65 + index);
      const checked = answers[currentIndex] === letter ? "checked" : "";
      return `
        <label class="option">
          <input type="radio" name="option" ${checked} onclick="saveAnswer('${letter}')">
          <span class="letter">${letter}.</span>
          <span>${option}</span>
        </label>
      `;
    })
    .join("");

  document.getElementById("nextBtn").textContent =
    currentIndex === questions.length - 1 ? "Final Submit" : "Next";

  updateNavigator();
}

function updateNavigator() {
  questions.forEach((_, index) => {
    const button = document.getElementById(`nav${index}`);
    if (!button) return;

    button.className = "";
    if (index === currentIndex) button.classList.add("active");
    if (answers[index]) button.classList.add("answered");
  });
}

function saveAnswer(answer) {
  answers[currentIndex] = answer;
  updateNavigator();
  saveQuizState();
}

function nextQ() {
  if (currentIndex === questions.length - 1) {
    submitQuiz();
    return;
  }

  currentIndex++;
  loadQuestion();
  saveQuizState();
}

function prevQ() {
  if (currentIndex > 0) {
    currentIndex--;
    loadQuestion();
    saveQuizState();
  }
}

function goToQuestion(index) {
  currentIndex = index;
  loadQuestion();
  saveQuizState();
}

function renderTimer() {
  const timer = document.getElementById("timer");
  if (!timer) return;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");
  timer.textContent = `Time Left: ${minutes}:${seconds}`;

  if (timeLeft <= 30) timer.classList.add("warning");
  else timer.classList.remove("warning");
}

function startTimer() {
  if (!quizEndTime) quizEndTime = Date.now() + timeLeft * 1000;
  clearInterval(timerId);

  const tick = () => {
    timeLeft = Math.max(0, Math.ceil((quizEndTime - Date.now()) / 1000));
    renderTimer();
    saveQuizState();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      alert("Time out");
      submitQuiz();
    }
  };

  tick();
  timerId = setInterval(tick, 1000);
}

async function submitQuiz() {
  clearInterval(timerId);

  const payload = {
    username: localStorage.getItem("user") || "guest",
    subject: localStorage.getItem("subject"),
    level: localStorage.getItem("level"),
    answers,
    questionIds: questions.map((question) => question.id)
  };

  const res = await fetch(`${API}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  clearQuizState();
  localStorage.setItem("lastResult", JSON.stringify(result));
  location.href = "result.html";
}

function showResult() {
  const result = JSON.parse(localStorage.getItem("lastResult") || "null");

  if (!result) {
    document.getElementById("meta").textContent = "No result found";
    return;
  }

  document.getElementById("meta").textContent =
    `${result.subject.toUpperCase()} (${result.level.toUpperCase()})`;
  document.getElementById("score").textContent =
    `Score: ${result.score} / ${result.total}`;

  const percent = document.getElementById("percent");
  percent.textContent = `Percentage: ${result.percent}% (${result.status})`;
  percent.className = result.status === "Pass" ? "pass big-text" : "fail big-text";
}

async function loadAllResults() {
  const user = localStorage.getItem("user");
  const box = document.getElementById("allResults");
  if (!box) return;

  const res = await fetch(`${API}/results/${user}`);
  const results = await res.json();
  allAttemptResults = results;

  if (!results.length) {
    box.innerHTML = "<p>No attempts yet.</p>";
    return;
  }

  box.innerHTML = results
    .map((result, index) => `
      <article class="result-item">
        <div class="result-main">
          <strong>${escapeHTML(result.subject).toUpperCase()} (${escapeHTML(result.level)})</strong>
          <span>Score: ${result.score}/${result.total}</span>
          <span>${result.percent}% - ${escapeHTML(result.status)}</span>
          <small>${escapeHTML(result.time)}</small>
        </div>
        <button type="button" class="review-btn" onclick="showReview(${index})">Review Answers</button>
      </article>
    `)
    .join("");
}

function showReview(index) {
  const result = allAttemptResults[index];
  const modal = document.getElementById("reviewModal");
  const title = document.getElementById("reviewTitle");
  const content = document.getElementById("reviewContent");

  if (!result || !modal || !title || !content) return;

  title.textContent = `${result.subject.toUpperCase()} (${result.level}) - ${result.score}/${result.total}`;

  if (!Array.isArray(result.review) || result.review.length === 0) {
    content.innerHTML = `
      <div class="review-empty">
        Review answers are not available for this old attempt. Please submit a new quiz attempt.
      </div>
    `;
    modal.classList.add("show");
    return;
  }

  content.innerHTML = result.review
    .map((item, questionIndex) => {
            const chosen = item.chosenAnswer || "";
      const correct = item.correctAnswer || "";
      const skipped = !chosen;

      const optionsHTML = item.options
        .map((option, optionIndex) => {
          const letter = String.fromCharCode(65 + optionIndex);
          const classes = ["review-option"];
          let badge = "";

          if (letter === correct) {
            classes.push("correct");
            badge = "Correct Answer";
          }

          if (letter === chosen && letter !== correct) {
            classes.push("wrong");
            badge = "Your Answer";
          }

          if (letter === chosen && letter === correct) {
            badge = "Your Answer";
          }

          return `
            <div class="${classes.join(" ")}">
              <span class="review-letter">${letter}</span>
              <span class="review-option-text">${escapeHTML(decodeOptionText(option))}</span>
              ${badge ? `<small>${badge}</small>` : ""}
            </div>
          `;
        })
        .join("");

      return `
                <article class="review-question ${skipped ? "skipped" : ""}">
          <div class="review-question-title">
            <h3>Q${questionIndex + 1}. ${escapeHTML(item.question)}</h3>
            ${skipped ? `<span class="skipped-badge">Not Attempted</span>` : ""}
          </div>
          <div class="review-options">${optionsHTML}</div>
        </article>
      `;
    })
    .join("");

  modal.classList.add("show");
}

function closeReview() {
  const modal = document.getElementById("reviewModal");
  if (modal) modal.classList.remove("show");
}


function isTypingTarget(element) {
  if (!element) return false;
  const tag = element.tagName ? element.tagName.toLowerCase() : "";
  return tag === "input" || tag === "textarea" || tag === "select" || element.isContentEditable;
}

function getCurrentPage() {
  return location.pathname.split("/").pop() || "index.html";
}

function closeUserMenu() {
  const menu = document.getElementById("userMenu");
  const button = document.querySelector(".user-menu-btn");
  if (!menu) return;

  menu.classList.remove("open");
  if (button) button.setAttribute("aria-expanded", "false");
}

function focusCustomOption(wrapper, direction) {
  const options = Array.from(wrapper.querySelectorAll(".custom-select-menu button"));
  if (!options.length) return;

  const activeIndex = options.indexOf(document.activeElement);
  const selectedIndex = options.findIndex((option) => option.classList.contains("selected"));
  const baseIndex = activeIndex >= 0 ? activeIndex : Math.max(selectedIndex, 0);
  const nextIndex = (baseIndex + direction + options.length) % options.length;
  options[nextIndex].focus();
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    const page = getCurrentPage();
    const active = document.activeElement;
    const customSelect = active ? active.closest(".custom-select") : null;
    const openCustomSelect = document.querySelector(".custom-select.open");

    if (event.key === "Escape") {
      closeCustomSelects();
      closeUserMenu();
      closeReview();
      return;
    }

    if (customSelect && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      customSelect.classList.add("open");
      focusCustomOption(customSelect, event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (openCustomSelect && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      focusCustomOption(openCustomSelect, event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if ((page === "index.html" || page === "") && event.key === "Enter" && isTypingTarget(active)) {
      event.preventDefault();
      login();
      return;
    }

    if (page === "signup.html" && event.key === "Enter" && isTypingTarget(active)) {
      event.preventDefault();
      signup();
      return;
    }

    if (page === "select.html" && event.key === "Enter" && !openCustomSelect && !active.closest(".custom-select")) {
      event.preventDefault();
      startSelectedQuiz();
      return;
    }

    if (page === "quiz.html" && !isTypingTarget(active) && !active.closest(".user-menu")) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextQ();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevQ();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        nextQ();
        return;
      }

      const keyAnswerMap = {
        "1": "A",
        "2": "B",
        "3": "C",
        "4": "D",
        a: "A",
        b: "B",
        c: "C",
        d: "D"
      };

      const answer = keyAnswerMap[event.key.toLowerCase()];
      if (answer) {
        event.preventDefault();
        saveAnswer(answer);
        loadQuestion();
      }
    }
  });
}
requireLogin();
setUserLabels();
setupKeyboardShortcuts();

if (location.pathname.includes("quiz.html")) fetchQuestions();
if (location.pathname.includes("result.html")) showResult();
if (location.pathname.includes("allresults.html")) loadAllResults();








