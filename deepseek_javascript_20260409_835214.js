// ----------------------------------------------------------------------
// SUPERSONIC APTITUDE MATRIX - Complete Dataset & Engine
// ----------------------------------------------------------------------

// ---------- FULL QUESTION DATASET (885 items) ----------
const questionBank = [
  {
    "id": 1,
    "category": "Spatial Reasoning",
    "subCategory": "Mental Rotation",
    "competency": "Situational Awareness",
    "question": "A capital letter L is rotated 90° clockwise. What does it look like?",
    "options": ["┘", "└", "┐", "┌"],
    "correctAnswer": 0,
    "correctOption": "A",
    "explanation": "A 90° clockwise rotation turns L into a shape pointing downward-right (┘)."
  },
  // ... (paste the rest of the 885 items here exactly as provided in the user prompt)
];

// ---------- DOM ELEMENTS ----------
const categoryListEl = document.getElementById('category-list');
const quizAreaEl = document.getElementById('quiz-area');
const totalQuestionsStat = document.getElementById('total-questions-stat');
const scoreStat = document.getElementById('score-stat');

// ---------- STATE ----------
let currentCategory = null;          // currently selected subCategory
let filteredQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};               // questionId -> selectedOptionIndex
let score = 0;
let timerInterval = null;
let secondsElapsed = 0;
const TIME_PER_QUESTION = 60;        // seconds

// ---------- INITIALIZATION ----------
function init() {
    totalQuestionsStat.textContent = questionBank.length;
    renderCategoryList();
    attachCategoryListeners();
}

// Build category list with counts
function renderCategoryList() {
    const subCategories = [...new Set(questionBank.map(q => q.subCategory))].sort();
    const counts = {};
    questionBank.forEach(q => {
        counts[q.subCategory] = (counts[q.subCategory] || 0) + 1;
    });

    let html = '';
    subCategories.forEach(sub => {
        html += `
            <li class="category-item" data-category="${sub}">
                <i class="fas fa-arrow-right"></i>
                <span>${sub}</span>
                <span class="category-count">${counts[sub]}</span>
            </li>
        `;
    });
    categoryListEl.innerHTML = html;
}

function attachCategoryListeners() {
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const cat = item.dataset.category;
            setActiveCategory(cat);
            loadCategoryQuestions(cat);
        });
    });
}

function setActiveCategory(cat) {
    document.querySelectorAll('.category-item').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.category === cat) {
            el.classList.add('active');
        }
    });
    currentCategory = cat;
}

// Filter questions and reset state
function loadCategoryQuestions(cat) {
    filteredQuestions = questionBank.filter(q => q.subCategory === cat);
    currentQuestionIndex = 0;
    userAnswers = {};
    score = 0;
    updateScoreDisplay();
    stopTimer();
    
    if (filteredQuestions.length > 0) {
        renderQuestion(currentQuestionIndex);
    } else {
        quizAreaEl.innerHTML = `<div class="welcome-message"><i class="fas fa-exclamation-triangle"></i><h3>No questions in this category</h3></div>`;
    }
}

// ---------- RENDER QUESTION ----------
function renderQuestion(index) {
    stopTimer();
    if (!filteredQuestions.length || index >= filteredQuestions.length) {
        // Quiz finished
        showCompletionScreen();
        return;
    }

    const q = filteredQuestions[index];
    const progressPercent = ((index) / filteredQuestions.length) * 100;
    const existingAnswer = userAnswers[q.id] !== undefined ? userAnswers[q.id] : null;

    // Build options HTML
    let optionsHtml = '';
    q.options.forEach((opt, optIndex) => {
        const letter = String.fromCharCode(65 + optIndex);
        const selectedClass = (existingAnswer === optIndex) ? 'selected' : '';
        optionsHtml += `
            <div class="option-item glass-card ${selectedClass}" data-option-index="${optIndex}">
                <span class="option-prefix">${letter}</span>
                <span>${opt}</span>
            </div>
        `;
    });

    const explanationDisplay = existingAnswer !== null ? 'show' : '';

    const html = `
        <div class="quiz-header">
            <div class="progress-info">
                <span class="question-tag"><i class="far fa-dot-circle"></i> ${q.subCategory}</span>
                <span>${index + 1} / ${filteredQuestions.length}</span>
            </div>
            <div class="timer-box" id="timer-display">01:00</div>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div class="question-text">${q.question}</div>
        <div class="options-container" id="options-container">
            ${optionsHtml}
        </div>
        <div class="explanation-box ${explanationDisplay}" id="explanation-box">
            <div class="explanation-title"><i class="fas fa-lightbulb"></i> EXPLANATION</div>
            <div>${q.explanation}</div>
        </div>
        <div class="action-bar">
            <button class="btn btn-outline" id="prev-btn" ${index === 0 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Previous</button>
            <button class="btn btn-primary" id="next-btn">${index === filteredQuestions.length - 1 ? 'Finish' : 'Next'} <i class="fas fa-chevron-right"></i></button>
        </div>
    `;

    quizAreaEl.innerHTML = html;

    // Attach option listeners
    document.querySelectorAll('.option-item').forEach(optEl => {
        optEl.addEventListener('click', (e) => {
            const selectedIdx = parseInt(optEl.dataset.optionIndex);
            handleOptionSelect(q.id, selectedIdx);
        });
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion(currentQuestionIndex);
        }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentQuestionIndex < filteredQuestions.length - 1) {
            currentQuestionIndex++;
            renderQuestion(currentQuestionIndex);
        } else {
            // Finish quiz
            showCompletionScreen();
        }
    });

    // Start fresh timer for this question
    secondsElapsed = 0;
    startTimer(TIME_PER_QUESTION, q.id);
}

function handleOptionSelect(questionId, selectedIdx) {
    const q = filteredQuestions.find(q => q.id === questionId);
    if (!q) return;

    // If already answered, do nothing (prevent changing? We'll allow change for practice)
    const previousAnswer = userAnswers[questionId];
    if (previousAnswer !== undefined) {
        // Remove previous score if correct
        if (previousAnswer === q.correctAnswer) {
            score--;
        }
    }

    // Record new answer
    userAnswers[questionId] = selectedIdx;
    if (selectedIdx === q.correctAnswer) {
        score++;
    }
    updateScoreDisplay();

    // Re-render to update selected style and show explanation
    renderQuestion(currentQuestionIndex);
}

function updateScoreDisplay() {
    scoreStat.textContent = score;
}

// ---------- TIMER ----------
function startTimer(seconds, questionId) {
    stopTimer();
    const timerEl = document.getElementById('timer-display');
    let remaining = seconds;
    
    const updateTimerDisplay = () => {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        timerEl.classList.remove('warning', 'danger');
        if (remaining <= 15) timerEl.classList.add('danger');
        else if (remaining <= 30) timerEl.classList.add('warning');
    };

    updateTimerDisplay();

    timerInterval = setInterval(() => {
        remaining--;
        updateTimerDisplay();

        if (remaining <= 0) {
            // Time's up: auto move to next if no answer?
            clearInterval(timerInterval);
            timerInterval = null;
            // If no answer selected, just move to next (or mark as wrong)
            const q = filteredQuestions[currentQuestionIndex];
            if (userAnswers[q.id] === undefined) {
                // Auto-mark incorrect? Not required; simply move on.
            }
            if (currentQuestionIndex < filteredQuestions.length - 1) {
                currentQuestionIndex++;
                renderQuestion(currentQuestionIndex);
            } else {
                showCompletionScreen();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ---------- COMPLETION SCREEN ----------
function showCompletionScreen() {
    stopTimer();
    const totalInCategory = filteredQuestions.length;
    const attempted = Object.keys(userAnswers).length;
    const correct = score;
    const percentage = totalInCategory ? Math.round((correct / totalInCategory) * 100) : 0;

    const html = `
        <div class="welcome-message">
            <i class="fas fa-trophy" style="color: #FFD700;"></i>
            <h2 style="margin: 20px 0;">Sequence Complete</h2>
            <div style="display: flex; justify-content: center; gap: 30px; margin: 30px 0;">
                <div><span style="color: #8a9cb0;">SCORE</span><br><span style="font-size: 2.5rem; font-weight: 700; color: #00e5ff;">${correct}</span></div>
                <div><span style="color: #8a9cb0;">ATTEMPTED</span><br><span style="font-size: 2.5rem; font-weight: 700;">${attempted}/${totalInCategory}</span></div>
                <div><span style="color: #8a9cb0;">ACCURACY</span><br><span style="font-size: 2.5rem; font-weight: 700;">${percentage}%</span></div>
            </div>
            <button class="btn btn-primary" id="restart-btn" style="margin-top: 20px;"><i class="fas fa-redo-alt"></i> Restart Category</button>
            <button class="btn btn-outline" id="back-categories-btn" style="margin-top: 20px; margin-left: 15px;"><i class="fas fa-th-large"></i> All Categories</button>
        </div>
    `;
    quizAreaEl.innerHTML = html;
    document.getElementById('restart-btn').addEventListener('click', () => {
        if (currentCategory) loadCategoryQuestions(currentCategory);
    });
    document.getElementById('back-categories-btn').addEventListener('click', () => {
        // Reset to welcome
        quizAreaEl.innerHTML = `<div class="welcome-message"><i class="fas fa-brain"></i><h2>Ready for liftoff</h2><p>Select a category from the left to begin your aptitude sequence.</p></div>`;
        currentCategory = null;
        document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
        stopTimer();
    });
}

// ---------- HELPER: If you want to directly embed the rest of JSON, paste here ----------
// For brevity in this answer, I'm including only the first item.
// YOU MUST PASTE THE ENTIRE 885-ITEM ARRAY ABOVE (replace the placeholder comment).
// ----------------------------------------------------------------------

// Start the app
init();