import { setup_page, getIcon, getLanguage, _translate } from "./common.js";
import { learnTopics } from "./translations.js";

//My app quiz questions.
//easy to  add more if need
const quiz_questions = [
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

let current_question = 0;
let correct_answers = 0;
let answered_questions = 0;

//display acordian
function displayAccordion() {
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
        ${getIcon(index === 0 ? "chevron-up" : "chevron-down")}
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

//Function to start the quiz
function startQuiz() {
  current_question = 0;
  correct_answers = 0;
  answered_questions = 0;

  document.getElementById("quiz-start-card").hidden = true;
  document.getElementById("quiz-panel").hidden = false;
  document.getElementById("quiz-result").hidden = true;
  document.getElementById("quiz-question-area").hidden = false;

  showQuestion();
}

//Close button function of the quiz
function closeQuiz() {
  document.getElementById("quiz-panel").hidden = true;
  document.getElementById("quiz-start-card").hidden = false;
}

//Show the question here
function showQuestion() {
  const language = getLanguage();
  const question = quiz_questions[current_question];
  const questionArea = document.getElementById("quiz-question-area");

  document.getElementById("quiz-progress").textContent =
    `${current_question + 1} / ${quiz_questions.length}`;

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
        ${current_question === quiz_questions.length - 1
          ? _translate("learn.displayResults")
          : _translate("learn.nextQuestion")}
      </button>
    </article>
  `;

  questionArea.querySelectorAll(".quiz-answer-button").forEach((button) => {
    button.addEventListener("click", chooseAnswer);
  });
}

//setup answers here
function chooseAnswer(event) {
  const selectedButton = event.currentTarget;
  const selectedAnswer = Number(selectedButton.dataset.answer);
  const question = quiz_questions[current_question];
  const answerButtons = document.querySelectorAll(".quiz-answer-button");

  answerButtons.forEach((button) => {
    button.disabled = true;
  });

  if (selectedAnswer === question.correctAnswer) {
    selectedButton.classList.add("correct-answer");
    correct_answers += 1;
  } else {
    selectedButton.classList.add("wrong-answer");
    answerButtons[question.correctAnswer].classList.add("correct-answer");
  }

  answered_questions += 1;

  const nextButton = document.getElementById("next-question-button");
  nextButton.hidden = false;
  nextButton.addEventListener("click", goToNextQuestion);
}

//nav to next question
function goToNextQuestion() {
  current_question += 1;

  if (current_question < quiz_questions.length) {
    showQuestion();
  } else {
    displayResults();
  }
}

function displayResults() {
  document.getElementById("quiz-question-area").hidden = true;
  document.getElementById("quiz-result").hidden = false;

  document.getElementById("quiz-score").textContent =
    `${correct_answers} ${_translate("learn.outOf")} ${quiz_questions.length}`;
}

async function start() {
  await setup_page();

  displayAccordion();

  document.getElementById("start-quiz-button").addEventListener("click", startQuiz);
  document.getElementById("close-quiz-button").addEventListener("click", closeQuiz);
  document.getElementById("restart-quiz-button").addEventListener("click", startQuiz);

  document.addEventListener("languagechange", () => {
    displayAccordion();

    if (!document.getElementById("quiz-panel").hidden) {
      if (current_question < quiz_questions.length) {
        showQuestion();
      } else {
        displayResults();
      }
    }
  });
}

start();
