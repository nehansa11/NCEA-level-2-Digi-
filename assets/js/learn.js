import { initializePage, icon, getLanguage, t } from "./common.js";
import { learnTopics } from "./translations.js";

/*
  Manage Quizq Questions

  Here I can add more question and answers
  Each question has two answers.
  We can set the correctAnswer for each question separately. 0 is the first element and 1 is the 1st element.
  It also support english and maory languages
*/
const quizQuestions = [
  {
    question: {
      en: "Are the services in this app free or low cost?",
      mi: "He kore utu, he utu iti rānei ngā ratonga o tēnei taupānga?"
    },
    answers: {
      en: ["Yes", "No"],
      mi: ["Āe", "Kāo"]
    },
    correctAnswer: 0
  },
  {
    question: {
      en: "Can you search for a service by its category?",
      mi: "Ka taea te rapu ratonga mā tōna kāwai?"
    },
    answers: {
      en: ["Yes", "No"],
      mi: ["Āe", "Kāo"]
    },
    correctAnswer: 0
  },
  {
    question: {
      en: "Does the app require you to create an account?",
      mi: "Me hanga pūkete koe hei whakamahi i te taupānga?"
    },
    answers: {
      en: ["Yes", "No"],
      mi: ["Āe", "Kāo"]
    },
    correctAnswer: 1
  },
  {
    question: {
      en: "Can the Find page show services nearest to you?",
      mi: "Ka taea e te whārangi Kimihia te whakaatu i ngā ratonga tata rawa?"
    },
    answers: {
      en: ["Yes, when location is shared", "No"],
      mi: ["Āe, ina tiria te tauwāhi", "Kāo"]
    },
    correctAnswer: 0
  },
  {
    question: {
      en: "Can you call a service by selecting its phone button?",
      mi: "Ka taea te waea ratonga mā te pātene waea?"
    },
    answers: {
      en: ["Yes", "No"],
      mi: ["Āe", "Kāo"]
    },
    correctAnswer: 0
  },
  {
    question: {
      en: "Should you call 111 when there is immediate danger?",
      mi: "Me waea ki 111 mēnā he mōrearea tonu?"
    },
    answers: {
      en: ["Yes", "No"],
      mi: ["Āe", "Kāo"]
    },
    correctAnswer: 0
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
