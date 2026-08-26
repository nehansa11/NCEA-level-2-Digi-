import { initializePage, icon, getLanguage, t } from "./common.js";
import { learnTopics } from "./translations.js";

const quizQuestions = [
   {
    question: { en: "Many community organisations offer their support for free.", mi: "" },
    answers: { en: ["Yes", "No"], mi: ["Āe", "Kāo"] },
    correctAnswer: 0,
  },
  {
    question: { en: "About 1 in 7 New Zealand children currently live in material hardship.", mi: "" },
    answers: { en: ["Yes", "No"], mi: ["Āe", "Kāo"] },
    correctAnswer: 0,
  },
  {
    question: { en: "Housing pressure only affects a family's money, not things like study or work.", mi: "" },
    answers: { en: ["Yes", "No"], mi: ["Āe", "Kāo"] },
    correctAnswer: 1,
  },
  {
    question: { en: "Talking to a budgeting advisor about your situation is kept confidential.", mi: "" },
    answers: { en: ["Yes", "No"], mi: ["Āe", "Kāo"] },
    correctAnswer: 0,
  },
  {
    question: { en: "Poverty can affect a child's health and learning, not just their family's finances.", mi: "" },
    answers: { en: ["Yes", "No"], mi: ["Āe", "Kāo"] },
    correctAnswer: 0,
  },
  {
    question: { en: "You always need a referral before contacting a food bank or community support service.", mi: "" },
    answers: { en: ["Yes", "No"], mi: ["Āe", "Kāo"] },
    correctAnswer: 1,
  }
];

let currentQuestion = 0;
let correctAnswers = 0;
let answeredQuestions = 0;

function renderAccordion() {
  const language = getLanguage();
  const container = document.getElementById("learn-accordion");

  container.innerHTML = learnTopics.map((topic, index) => `
    <article class="learn-item ${index === 0 ? "open" : ""}">
      <div class="learn-toggle">
        <span class="learn-stat">${topic.stat[language] || topic.stat.en}</span>
        <div>
          <h2>${topic.title[language] || topic.title.en}</h2>
          <p>${topic.summary[language] || topic.summary.en}</p>
        </div>
        ${icon(index === 0 ? "chevron-up" : "chevron-down")}
      </div>

      <div class="learn-detail">
        <p>${topic.detail[language] || topic.detail.en}</p>
      </div>
    </article>
  `).join("");

  container.querySelectorAll(".learn-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedItem = button.closest(".learn-item");
      const isAlreadyOpen = selectedItem.classList.contains("open");

      container.querySelectorAll(".learn-item").forEach((item) => {
        item.classList.remove("open");
        item.querySelector(".learn-toggle").setAttribute("aria-expanded", "false");
        item.querySelector(".icon").src = "assets/icons/chevron-down.svg";
      });

      if (!isAlreadyOpen) {
        selectedItem.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        selectedItem.querySelector(".icon").src = "assets/icons/chevron-up.svg";
      }
    });
  });
}
function startQuiz() {
  currentQuestion = 0;
  correctAnswers = 0;
  answeredQuestions = 0;

  document.getElementById("quiz-start-card").hidden = true;
  document.getElementById("quiz-panel").hidden = false;
  document.getElementById("quiz-result").hidden = true;
  document.getElementById("quiz-question-area").hidden = false;

  showQuestion();
}

function closeQuiz() {
  document.getElementById("quiz-panel").hidden = true;
  document.getElementById("quiz-start-card").hidden = false;
}

function showQuestion() {
  const language = getLanguage();
  const question = quizQuestions[currentQuestion];
  const questionArea = document.getElementById("quiz-question-area");

  document.getElementById("quiz-progress").textContent =
    `${currentQuestion + 1} / ${quizQuestions.length}`;

  questionArea.innerHTML = `
    <article class="quiz-question-card">
      <h2>${question.question[language] || question.question.en}</h2>

      <div class="quiz-answer-list">
        ${question.answers[language].map((answer, index) => `
          <button class="quiz-answer-button" type="button" data-answer="${index}">
            ${answer}
          </button>
        `).join("")}
      </div>

      <button id="next-question-button" class="quiz-next-button" type="button" hidden>
        ${currentQuestion === quizQuestions.length - 1
          ? t("learn.showResult")
          : t("learn.nextQuestion")}
      </button>
    </article>
  `;

  questionArea.querySelectorAll(".quiz-answer-button").forEach((button) => {
    button.addEventListener("click", chooseAnswer);
  });
}

function chooseAnswer(event) {
  const selectedButton = event.currentTarget;
  const selectedAnswer = Number(selectedButton.dataset.answer);
  const question = quizQuestions[currentQuestion];
  const answerButtons = document.querySelectorAll(".quiz-answer-button");

  answerButtons.forEach((button) => {
    button.disabled = true;
  });

  if (selectedAnswer === question.correctAnswer) {
    selectedButton.classList.add("correct-answer");
    correctAnswers += 1;
  } else {
    selectedButton.classList.add("wrong-answer");
    answerButtons[question.correctAnswer].classList.add("correct-answer");
  }

  answeredQuestions += 1;

  const nextButton = document.getElementById("next-question-button");
  nextButton.hidden = false;
  nextButton.addEventListener("click", goToNextQuestion);
}

function goToNextQuestion() {
  currentQuestion += 1;

  if (currentQuestion < quizQuestions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById("quiz-question-area").hidden = true;
  document.getElementById("quiz-result").hidden = false;

  document.getElementById("quiz-score").textContent =
    `${correctAnswers} ${t("learn.outOf")} ${quizQuestions.length}`;
}

async function start() {
  await initializePage();

  renderAccordion();

  document.getElementById("start-quiz-button").addEventListener("click", startQuiz);
  document.getElementById("close-quiz-button").addEventListener("click", closeQuiz);
  document.getElementById("restart-quiz-button").addEventListener("click", startQuiz);

  document.addEventListener("languagechange", () => {
    renderAccordion();

    if (!document.getElementById("quiz-panel").hidden) {
      if (currentQuestion < quizQuestions.length) {
        showQuestion();
      } else {
        showResult();
      }
    }
  });
}

start();
