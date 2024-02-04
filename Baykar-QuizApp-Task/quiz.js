const apiUrl = 'https://jsonplaceholder.typicode.com/posts';
const quizContainer = document.getElementById('quiz');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextButton = document.getElementById('next-button');
const timerElement = document.getElementById('timer');
const resultTable = document.getElementById('result-table');
const resultBody = document.getElementById('result-body');
const questionCounter = document.getElementById('question-counter');

let questions = [];
let currentQuestionIndex = 0;
let answers = [];
let optionTimer;
let questionTimer;
let countdownTimer;


// Fetch data from the API
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    // Prepare the questions and options
    questions = data.slice(0, 10).map(q => {
      const splitText = q.body.split(' ');
      let options = [];

      // Generate four options for each question
      for (let i = 0; i < 4; i++) {
        let newOption = shuffleArray(splitText)[0];
        
          // Remove options that are the same as the question or other options
        while (options.includes(newOption) || newOption === q.body) {
          newOption = shuffleArray(splitText)[0];
        }
        
        options.push(newOption);
      }
      
      return { title: q.body, options, correct: options[0] };
    });
    displayQuestion();
    loadingScreen.style.display = 'none';
  });

function displayQuestion() {
  // Check if the quiz has ended
  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }
  if (currentQuestionIndex === 0) {
    progressBar.style.width = '0%';
  }

 // Display the current question and options
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = `Q${currentQuestionIndex + 1}: ${currentQuestion.title}`;
  optionsElement.innerHTML = '';
  const optionLetters = ['A', 'B', 'C', 'D'];
  currentQuestion.options.forEach((option, index) => {
    const optionElement = document.createElement('div');
    optionElement.classList.add('option');
    optionElement.textContent = `${optionLetters[index]}) ${option}`;
    optionElement.addEventListener('click', () => selectOption(option));
    optionsElement.appendChild(optionElement);
  });
  
  const options = document.querySelectorAll('.option');
  options.forEach(option => {
    option.addEventListener('click', function() {
      // Remove the selection from all other options
      options.forEach(opt => opt.classList.remove('selected'));
      
      // Mark the clicked option as selected
      this.classList.add('selected');
    });
  });

  resetSelectedOption();
// Update the question counter and question text
  questionElement.textContent = `Q${currentQuestionIndex + 1} of ${questions.length}: ${currentQuestion.title}`;
  questionCounter.textContent = `Q${currentQuestionIndex + 1} of ${questions.length}`;
  questionElement.textContent = `${currentQuestion.title} ?`; /* Added a question mark */

  const card = document.querySelector('.card');
  card.style.animation = 'none';
  setTimeout(() => {
    card.style.animation = '';
  }, 10);

  // Disable options for the first 10 seconds
  optionsElement.style.pointerEvents = 'none';
  clearTimeout(optionTimer);
  optionTimer = setTimeout(() => {
    optionsElement.style.pointerEvents = 'auto';
  }, 10000);   //10000  olacak

  // Show next button after 10 seconds
  nextButton.style.display = 'none';
  clearTimeout(questionTimer);
  questionTimer = setTimeout(() => {
    nextButton.style.display = 'block';
  }, 10000);  //10000  olacak

  // Start countdown for the question
  startCountdown(30);  //30  olacak
}

// Select an option
function selectOption(selected) {
  const currentQuestion = questions[currentQuestionIndex];
  
  // Mark the selected option
  if (answers[currentQuestionIndex] && answers[currentQuestionIndex].answer === selected) {
    answers[currentQuestionIndex].answer = null;  // Unselect the option
    resetSelectedOption();
  } else {
    if (answers[currentQuestionIndex]) {
      answers[currentQuestionIndex].answer = selected;
    } else {
      answers.push({ question: currentQuestion.title, answer: selected });
    }
    highlightOptions(selected);
  }
}
// Highlight the selected option
function highlightOptions(selected) {
    const options = optionsElement.children;
    for (let option of options) {
      option.classList.remove('selected');
      if (option.textContent.includes(selected)) {
        option.classList.add('selected');
      }
    }
}
// Reset the selected option  
function resetSelectedOption() {
  const options = optionsElement.children;
  for (let option of options) {
    option.classList.remove('selected');
  }
}
// Go to the next question  
function nextQuestion() {
  currentQuestionIndex++;
  displayQuestion();
  
   // Update the progress bar
  let progress = (currentQuestionIndex / questions.length) * 100;
  progressBar.style.width = progress + '%';
}

function endQuiz() {
  quizContainer.classList.add('hidden');
  resultTable.classList.remove('hidden');
  answers.forEach(answer => {
    const row = resultBody.insertRow();
    row.insertCell().textContent = answer.question;
    row.insertCell().textContent = answer.answer || 'No answer';
  });
} 
// Start the countdown for a question
function startCountdown(seconds) {
    timerElement.classList.remove('last-seconds');
    clearInterval(countdownTimer);
    timerElement.textContent = seconds;
    countdownTimer = setInterval(() => {
      seconds--;
      timerElement.textContent = seconds;
      if (seconds <= 5) {
        timerElement.classList.add('last-seconds');
      } else {
        timerElement.classList.remove('last-seconds');
      }
      if (seconds <= 0) {
        clearInterval(countdownTimer);
        if (!answers[currentQuestionIndex]) {
          answers.push({ question: questions[currentQuestionIndex].title, answer: null });
        }
        nextQuestion();
      }
    }, 1000);
}
  
// Shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Go to the next question when the next button is clicked
nextButton.addEventListener('click', nextQuestion);

// Show the container when the loading animation ends

document.querySelector('.loading-container').addEventListener('animationend', () => {
  document.querySelector('.container').style.display = 'block';
});

// Create a progress bar and append it to the header
let progressBar = document.createElement('div');
progressBar.classList.add('progress-bar');
let header = document.querySelector('.header'); 
header.appendChild(progressBar);