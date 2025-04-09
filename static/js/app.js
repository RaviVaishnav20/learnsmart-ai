// Main application JavaScript

// DOM Elements
const topicInput = document.getElementById('topic-input');
const learnBtn = document.getElementById('learn-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const contentContainer = document.getElementById('content-container');
const explanationContent = document.getElementById('explanation-content');
const analogyContent = document.getElementById('analogy-content');
const difficultySelect = document.getElementById('difficulty-select');
const generateQuizBtn = document.getElementById('generate-quiz-btn');
const quizContainer = document.getElementById('quiz-container');
const quizQuestions = document.getElementById('quiz-questions');
const submitQuizBtn = document.getElementById('submit-quiz-btn');
const quizResults = document.getElementById('quiz-results');
const themeToggle = document.getElementById('theme-toggle');
const copyButtons = document.querySelectorAll('.copy-btn');

// Current topic and quiz data
let currentTopic = '';
let quizData = null;

// Initialize marked for markdown rendering
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false,
    sanitize: false,
    smartLists: true,
    smartypants: true,
    xhtml: false
});

// Function to safely render markdown
function renderMarkdown(content) {
    if (!content) return '';
    
    try {
        // Check if content is already HTML
        if (content.trim().startsWith('<') && content.trim().endsWith('>')) {
            return content;
        }
        
        // Pre-process content to fix common issues
        content = content.replace(/^#+\s*README\.md\s*$/gm, ''); // Remove README.md headers
        content = content.replace(/```\s*```/g, ''); // Remove empty code blocks
        
        // Render markdown
        const renderedContent = marked.parse(content);
        
        // Post-process the rendered HTML if needed
        return renderedContent;
    } catch (error) {
        console.error('Error rendering markdown:', error);
        return `<div class="alert alert-danger">Error rendering content: ${error.message}</div>`;
    }
}

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'light') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

// Copy to clipboard functionality
function initCopyButtons() {
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId).textContent;
            
            navigator.clipboard.writeText(content).then(() => {
                // Show success feedback
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    });
}

// Event Listeners
learnBtn.addEventListener('click', handleLearnClick);
topicInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleLearnClick();
    }
});
generateQuizBtn.addEventListener('click', handleGenerateQuizClick);
submitQuizBtn.addEventListener('click', handleSubmitQuizClick);
themeToggle.addEventListener('click', toggleTheme);

// Function to handle learn button click
async function handleLearnClick() {
    const topic = topicInput.value.trim();
    
    if (!topic) {
        showToast('Please enter a topic to learn about.', 'warning');
        return;
    }
    
    currentTopic = topic;
    
    // Show loading indicator
    loadingIndicator.style.display = 'flex';
    contentContainer.style.display = 'none';
    
    try {
        const response = await fetch('/generate-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topic })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate content');
        }
        
        const data = await response.json();
        
        // Render content with improved markdown handling
        explanationContent.innerHTML = renderMarkdown(data.explanation);
        analogyContent.innerHTML = renderMarkdown(data.analogy);
        
        // Show content
        contentContainer.style.display = 'block';
        
        // Scroll to content
        contentContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred while generating content. Please try again.', 'error');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Function to handle generate quiz button click
async function handleGenerateQuizClick() {
    if (!currentTopic) {
        showToast('Please learn about a topic first.', 'warning');
        return;
    }
    
    const difficulty = difficultySelect.value;
    
    // Show loading
    generateQuizBtn.disabled = true;
    generateQuizBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
    quizContainer.style.display = 'none';
    
    try {
        const formData = new FormData();
        formData.append('topic', currentTopic);
        formData.append('difficulty', difficulty);
        
        const response = await fetch('/generate-quiz', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate quiz');
        }
        
        const data = await response.json();
        
        // Store quiz data for later reference
        quizData = data.questions;
        
        // Render quiz questions
        renderQuiz(quizData);
        
        // Show quiz
        quizContainer.style.display = 'block';
        
        // Scroll to quiz
        quizContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred while generating the quiz. Please try again.', 'error');
    } finally {
        generateQuizBtn.disabled = false;
        generateQuizBtn.innerHTML = '<i class="fas fa-question-circle me-2"></i>Generate Quiz';
    }
}

// Function to render quiz questions
function renderQuiz(questions) {
    quizQuestions.innerHTML = '';
    quizResults.innerHTML = '';
    
    questions.forEach((question, questionIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        questionDiv.dataset.questionIndex = questionIndex;
        
        const questionText = document.createElement('p');
        questionText.className = 'fw-bold';
        questionText.textContent = `${questionIndex + 1}. ${question.question}`;
        questionDiv.appendChild(questionText);
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'quiz-options';
        
        question.options.forEach((option, optionIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'quiz-option';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${questionIndex}`;
            input.id = `question-${questionIndex}-option-${optionIndex}`;
            input.value = optionIndex;
            
            const label = document.createElement('label');
            label.htmlFor = `question-${questionIndex}-option-${optionIndex}`;
            label.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option}`;
            
            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            optionsDiv.appendChild(optionDiv);
        });
        
        questionDiv.appendChild(optionsDiv);
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'question-result';
        resultDiv.style.display = 'none';
        questionDiv.appendChild(resultDiv);
        
        quizQuestions.appendChild(questionDiv);
    });
}

// Function to handle quiz submission
function handleSubmitQuizClick() {
    // Make sure we have quiz data
    if (!quizData) {
        showToast('Quiz data not loaded. Please regenerate the quiz.', 'warning');
        return;
    }
    
    const questionDivs = document.querySelectorAll('.quiz-question');
    let score = 0;
    let answered = 0;
    
    questionDivs.forEach(questionDiv => {
        const questionIndex = parseInt(questionDiv.dataset.questionIndex);
        const selectedOption = document.querySelector(`input[name="question-${questionIndex}"]:checked`);
        const resultDiv = questionDiv.querySelector('.question-result');
        
        resultDiv.innerHTML = '';
        
        if (selectedOption) {
            answered++;
            const selectedIndex = parseInt(selectedOption.value);
            const correctIndex = quizData[questionIndex].correct_index;
            const explanation = quizData[questionIndex].explanation;
            
            if (selectedIndex === correctIndex) {
                score++;
                resultDiv.className = 'question-result correct-answer';
                resultDiv.innerHTML = `<p><strong>Correct!</strong></p>`;
            } else {
                resultDiv.className = 'question-result incorrect-answer';
                resultDiv.innerHTML = `<p><strong>Incorrect.</strong> The correct answer is ${String.fromCharCode(65 + correctIndex)}: ${quizData[questionIndex].options[correctIndex]}</p>`;
            }
            
            const explanationP = document.createElement('p');
            explanationP.className = 'explanation';
            explanationP.textContent = explanation;
            resultDiv.appendChild(explanationP);
            
            resultDiv.style.display = 'block';
        }
    });
    
    if (answered < questionDivs.length) {
        showToast(`Please answer all questions (${answered}/${questionDivs.length} answered).`, 'warning');
        return;
    }
    
    // Display final results
    const percentage = (score / questionDivs.length) * 100;
    let feedback;
    
    if (percentage >= 90) {
        feedback = 'Excellent! You have mastered this topic!';
    } else if (percentage >= 70) {
        feedback = 'Great job! You have a good understanding of the topic.';
    } else if (percentage >= 50) {
        feedback = 'Good effort! You\'re on the right track.';
    } else {
        feedback = 'Keep learning! This topic needs more study.';
    }
    
    quizResults.innerHTML = `
        <div class="alert alert-info">
            <h4>Quiz Results</h4>
            <p>You scored ${score} out of ${questionDivs.length} (${percentage.toFixed(1)}%)</p>
            <p>${feedback}</p>
        </div>
    `;
    
    // Scroll to results
    quizResults.scrollIntoView({ behavior: 'smooth' });
}

// Toast notification function
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Initialize the application
function initApp() {
    initTheme();
    initCopyButtons();
    
    // Check if there's a saved topic in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const savedTopic = urlParams.get('topic');
    
    if (savedTopic) {
        topicInput.value = savedTopic;
        handleLearnClick();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);