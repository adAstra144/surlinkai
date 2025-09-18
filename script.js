// DOM Elements
const scanBtn = document.getElementById("scanBtn");
const messageInput = document.getElementById("messageInput");
const chatWindow = document.getElementById("chatWindow");
const progressBar = document.getElementById("progressBar");
const historyList = document.getElementById("historyList");
const totalScansEl = document.getElementById("totalScans");
const phishingScansEl = document.getElementById("phishingScans");
const safeScansEl = document.getElementById("safeScans");
const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");

// State variables
let totalScans = 0;
let phishingScans = 0;
let safeScans = 0;
let apiUrl = "https://adastra144-anti-phishing-scanner-0.hf.space";
let explainerUrl = "";
let isScanning = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkApiStatus();
    setupEventListeners();
    loadStats();
    setupAccessibility();
    addParticleEffect();
    loadTheme();
    setupMobileMenu();
    updateUserUI(); // Add this line to update UI on DOM ready
    setupImagePicker();
    // Initial padding adjustment
    adjustChatBottomPadding();

    // iOS/Android virtual keyboard handling: move input above keyboard
    try {
        if ('visualViewport' in window) {
            const onResize = () => {
                const vv = window.visualViewport;
                const offset = Math.max(0, (vv && vv.height ? (window.innerHeight - vv.height) : 0));
                document.documentElement.style.setProperty('--keyboard-offset', offset + 'px');
                adjustChatBottomPadding();
                try { chatWindow.scrollTop = chatWindow.scrollHeight; } catch (_) {}
            };
            window.visualViewport.addEventListener('resize', onResize);
            window.visualViewport.addEventListener('scroll', onResize);
        }
    } catch (e) { /* noop */ }
});

// === burger yes ===
const toggleBtn = document.getElementById("menuToggle");

toggleBtn.addEventListener("click", () => {
  toggleBtn.classList.toggle("active");
  // optional: update aria-expanded
  const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
  toggleBtn.setAttribute("aria-expanded", !expanded);
});


// === Scroll Performance Optimization ===
let scrollTimeout;

if (chatWindow) {
  chatWindow.addEventListener('scroll', () => {
    // Add performance class during scrolling
    chatWindow.classList.add('scrolling');
    
    // Pause particle animations during scroll for better performance
    const particles = document.querySelector('.particles');
    if (particles) {
      particles.style.animationPlayState = 'paused';
    }
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Remove performance class after scrolling stops
    scrollTimeout = setTimeout(() => {
      chatWindow.classList.remove('scrolling');
      // Resume particle animations
      if (particles) {
        particles.style.animationPlayState = 'running';
      }
    }, 150);
  });
}

// Add subtle particle effect to background
function addParticleEffect() {
    const particles = document.createElement('div');
    particles.className = 'particles';
    // Reduced from 20 to 10 particles for better performance
    particles.innerHTML = Array.from({length: 10}, () => '<div class="particle"></div>').join('');
    document.body.appendChild(particles);
}

// Setup accessibility features
function setupAccessibility() {
    // Add keyboard navigation for example messages
    const exampleItems = document.querySelectorAll('.example-messages li');
    exampleItems.forEach((item, index) => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `Example ${index + 1}: ${item.textContent}`);
        
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                messageInput.value = item.textContent;
                messageInput.focus();
                addRippleEffect(e.target);
            }
        });
        
        item.addEventListener('click', (e) => {
            messageInput.value = item.textContent;
            messageInput.focus();
            addRippleEffect(e.target);
        });
    });
}

// Add ripple effect to buttons
function addRippleEffect(element) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Setup event listeners
function setupEventListeners() {
    // Scan button click
    scanBtn.addEventListener("click", (e) => {
        addRippleEffect(e.target);
        scanMessage();
    });
    
    // Enter key to scan (Ctrl+Enter or Cmd+Enter)
    messageInput.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            scanMessage();
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener("input", () => {
        messageInput.style.height = "auto";
        messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + "px";
        adjustChatBottomPadding();
        try { chatWindow.scrollTop = chatWindow.scrollHeight; } catch (_) {}
    });
    
    // Clear welcome message on first interaction
    messageInput.addEventListener("focus", () => {
        const welcomeMessage = chatWindow.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.opacity = '0.7';
        }
        adjustChatBottomPadding();
    });
}

// Ensure chat content isn't hidden under fixed input area
function adjustChatBottomPadding() {
    const inputArea = document.querySelector('.input-area');
    if (!inputArea) return;
    const style = window.getComputedStyle(inputArea);
    const height = inputArea.offsetHeight
      + parseFloat(style.marginTop || 0)
      + parseFloat(style.marginBottom || 0);
    const keyboardOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--keyboard-offset')) || 0;
    const pad = Math.max(160, height + 48 + keyboardOffset);
    chatWindow.style.paddingBottom = `${pad}px`;
}

// Recalculate on resize and orientation changes
window.addEventListener('resize', adjustChatBottomPadding);
window.addEventListener('orientationchange', adjustChatBottomPadding);

// Mobile drawer menu setup
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');

    if (!menuToggle || !sidebar || !backdrop) return;

    // Set initial state based on screen size
    const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
    if (isDesktop) {
        // Desktop starts expanded
        sidebar.classList.remove('collapsed');
        menuToggle.setAttribute('aria-expanded', 'true');
    } else {
        // Mobile starts closed
        sidebar.classList.remove('open');
        backdrop.hidden = true;
        backdrop.style.pointerEvents = 'none';
        document.body.classList.remove('no-scroll');
        menuToggle.setAttribute('aria-expanded', 'false');
    }

    const openMenu = () => {
        sidebar.classList.add('open');
        backdrop.hidden = false;
        backdrop.style.pointerEvents = 'auto';
        document.body.classList.add('no-scroll');
        menuToggle.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
        sidebar.classList.remove('open');
        backdrop.hidden = true;
        backdrop.style.pointerEvents = 'none';
        document.body.classList.remove('no-scroll');
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.addEventListener('click', () => {
        if (window.matchMedia('(min-width: 1025px)').matches) {
            // Desktop: toggle collapsed state instead of drawer
            sidebar.classList.toggle('collapsed');
            menuToggle.setAttribute('aria-expanded', !sidebar.classList.contains('collapsed'));
            return;
        }
        const willOpen = !sidebar.classList.contains('open');
        if (willOpen) openMenu(); else closeMenu();
    });

    backdrop.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target)) closeMenu();
    });

    sidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Handle screen size changes
    window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => {
        if (e.matches) {
            // Switching to desktop
            sidebar.classList.remove('open');
            backdrop.hidden = true;
            backdrop.style.pointerEvents = 'none';
            document.body.classList.remove('no-scroll');
            // Start expanded on desktop
            sidebar.classList.remove('collapsed');
            menuToggle.setAttribute('aria-expanded', 'true');
        } else {
            // Switching to mobile
            sidebar.classList.remove('collapsed');
            // Start closed on mobile
            closeMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Robust: directly wire navigation to data-section, prevent duplicate handlers
    const buttons = Array.from(document.querySelectorAll('.nav-btn'));
    buttons.forEach((btn) => {
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
    });
    document.querySelectorAll('.nav-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const section = btn.getAttribute('data-section') || btn.dataset.section;
            if (section) {
                showSection(section);
            }
            if (window.matchMedia('(max-width: 1024px)').matches) {
                setTimeout(closeMenu, 150);
            }
        }, { passive: true });
    });
}

// Show section function
function showSection(sectionName) {
    // Hide all content sections
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));

    // Determine section ID
    let sectionId = '';
    switch(sectionName) {
        case 'chat': sectionId = 'chatSection'; break;
        case 'history': sectionId = 'historyMainSection'; break;
        case 'stats': sectionId = 'statsMainSection'; break;
        case 'status': sectionId = 'statusMainSection'; break;
        case 'quiz': sectionId = 'quizMainSection'; break;
        case 'feedback': sectionId = 'feedbackMainSection'; break;
    }

    const sectionEl = document.getElementById(sectionId);
    sectionEl.classList.add('active');

    // Set active class on nav button
    const btn = document.querySelector(`[onclick="showSection('${sectionName}')"]`) ||
                document.querySelector(`[onclick="showSection(\"${sectionName}\")"]`);
    if (btn) btn.classList.add('active');

    // Lazy load content if section has data-lazy and not yet loaded
    if (sectionEl.dataset.lazy && !sectionEl.dataset.loaded) {
        fetch(`sections/${sectionName}.html`) // your separate HTML files
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to load ${sectionName}: ${res.status} ${res.statusText}`);
                }
                return res.text();
            })
            .then(html => {
                sectionEl.innerHTML = html;
                sectionEl.dataset.loaded = "true";

                // Wait for next tick to ensure DOM is updated
                setTimeout(() => {
                    // Special initialization after content is loaded
                    if (sectionName === 'stats') loadStats();
                    if (sectionName === 'status') checkApiStatus();
                    if (sectionName === 'quiz' && !window.__quizInit) {
                        initQuiz();
                        window.__quizInit = true;
                    }
                    if (sectionName === 'feedback') initFeedback(); // if needed
                }, 0);
            })
            .catch(err => console.error(`Failed to load ${sectionName}:`, err));
    } else {
        // Section already loaded — run init if necessary
        if (sectionName === 'stats') loadStats();
        if (sectionName === 'status') checkApiStatus();
        if (sectionName === 'quiz' && !window.__quizInit) {
            initQuiz();
            window.__quizInit = true;
        }
        if (sectionName === "feedback" && !window._feedback) {
          initFeedback();
          window._feedback = true;
        }
    }

    // Auto-close drawer on mobile after navigation
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');
    if (window.matchMedia('(max-width: 1024px)').matches && sidebar && sidebar.classList.contains('open')) {
        setTimeout(() => {
            sidebar.classList.remove('open');
            if (backdrop) backdrop.hidden = true;
            document.body.classList.remove('no-scroll');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }, 0);
    }
}


// ---------- REPLACE initQuiz() WITH THIS ----------
function initQuiz() {
    console.log('Initializing quiz...');
    const quizSection = document.getElementById('quizMainSection');
    
    if (!quizSection) {
        console.warn('Quiz section not found');
        // Retry initialization once after a short delay
        setTimeout(() => {
            const retrySection = document.getElementById('quizMainSection');
            if (retrySection) {
                console.log('Quiz section found on retry, initializing...');
                initQuizContent(retrySection);
            } else {
                console.error('Quiz section still not found after retry');
            }
        }, 100);
        return;
    }
    
    initQuizContent(quizSection);
}

function initQuizContent(quizSection) {

    const questions = [
        { q: 'Which of the following is a sign of a phishing email?', a: [
            { text: 'An email from a known contact asking for a file', correct: false },
            { text: 'Grammatical errors and suspicious links', correct: true },
            { text: 'A secure website address (https://)', correct: false },
            { text: 'A welcome email from a trusted service', correct: false }
        ] },
        { q: 'What should you do if a message asks for your password?', a: [
            { text: 'Reply immediately with your password', correct: false },
            { text: 'Verify the source before responding', correct: true },
            { text: 'Ignore all emails from your company', correct: false },
            { text: 'Click the link and change your password', correct: false }
        ] },
        { q: 'What is a phishing attack?', a: [
            { text: 'A fishing technique used in rivers', correct: false },
            { text: 'A way to steal personal information via fake messages', correct: true },
            { text: 'A password recovery method', correct: false },
            { text: 'An antivirus scanning process', correct: false }
        ] }
    ];

    // Query all elements inside the lazy-loaded section
    const quizProgress = quizSection.querySelector('#quizProgress');
    const quizScoreEl = quizSection.querySelector('#quizScore');
    const quizQuestion = quizSection.querySelector('#quizQuestion');
    const quizAnswers = quizSection.querySelector('#quizAnswers');
    const quizFeedback = quizSection.querySelector('#quizFeedback');
    const quizNextBtn = quizSection.querySelector('#quizNextBtn');
    const quizRestartBtn = quizSection.querySelector('#quizRestartBtn');

    if (!quizProgress || !quizScoreEl || !quizQuestion || !quizAnswers) {
        console.warn('Missing required quiz elements:', {
            progress: !!quizProgress,
            score: !!quizScoreEl,
            question: !!quizQuestion,
            answers: !!quizAnswers
        });
        return;
    }

    console.log('Quiz elements found, initializing game state...');
    let idx = 0;
    let score = 0;
    let autoTimer = 0;
    const AUTO_NEXT_DELAY = 1200;

    // Load best score from localStorage
    let bestPercent = parseInt(localStorage.getItem('surLinkBestQuiz') || '0', 10);

    function render() {
        if (autoTimer) { clearTimeout(autoTimer); autoTimer = 0; }
        quizProgress.textContent = `Question ${idx + 1} of ${questions.length}`;
        quizScoreEl.textContent = `Score: ${score}`;
        quizQuestion.textContent = questions[idx].q;
        quizAnswers.innerHTML = '';
        quizFeedback.textContent = '';
        quizNextBtn.disabled = true;
        quizNextBtn.style.display = 'none';
        quizRestartBtn.style.display = 'none';

        questions[idx].a.forEach(ans => {
            const btn = document.createElement('button');
            btn.className = 'quiz-answer';
            btn.textContent = ans.text;
            btn.addEventListener('click', () => selectAnswer(btn, ans.correct));
            quizAnswers.appendChild(btn);
        });
    }

    function selectAnswer(btn, correct) {
        Array.from(quizAnswers.children).forEach(b => b.disabled = true);
        if (correct) {
            score++;
            btn.classList.add('correct');
            quizFeedback.textContent = '✅ Correct!';
        } else {
            btn.classList.add('incorrect');
            const correctText = questions[idx].a.find(a => a.correct).text;
            quizFeedback.textContent = `❌ Not quite. Correct: ${correctText}`;
        }
        quizScoreEl.textContent = `Score: ${score}`;
        autoTimer = setTimeout(proceed, AUTO_NEXT_DELAY);
    }

    function proceed() {
        if (idx < questions.length - 1) {
            idx++;
            render();
        } else {
            finishQuiz();
        }
    }

    function finishQuiz() {
        const percent = Math.round((score / questions.length) * 100);
        quizQuestion.textContent = `You scored ${score} / ${questions.length} (${percent}%)!`;
        quizAnswers.innerHTML = '';
        quizFeedback.textContent = percent >= 70 ? '🎉 Nice — you passed!' : '🔎 Review the tips to improve.';
        quizNextBtn.style.display = 'none';
        quizRestartBtn.style.display = 'inline-flex';

        if (percent > bestPercent) {
            bestPercent = percent;
            localStorage.setItem('surLinkBestQuiz', String(bestPercent));
            showBestQuizStat(bestPercent);
        }
    }

    function showBestQuizStat(best) {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;
        let bestEl = document.getElementById('bestQuizStat');
        if (!bestEl) {
            const div = document.createElement('div');
            div.className = 'stat-item';
            div.innerHTML = `<span class="stat-number" id="bestQuizStat">${best}%</span><span class="stat-label">Best Quiz</span>`;
            statsGrid.appendChild(div);
        } else {
            bestEl.textContent = `${best}%`;
        }
    }

    quizNextBtn.addEventListener('click', () => { clearTimeout(autoTimer); proceed(); });
    quizRestartBtn.addEventListener('click', () => { idx = 0; score = 0; quizNextBtn.style.display = 'inline-flex'; quizRestartBtn.style.display = 'none'; render(); });

    render();
    if (bestPercent > 0) showBestQuizStat(bestPercent);
}


// Check API status
async function checkApiStatus() {
    // Find elements dynamically
    const statusSection = document.getElementById('statusMainSection');
    if (!statusSection) return; // section not loaded yet

    const statusIndicator = statusSection.querySelector('.status-indicator');
    const statusText = statusSection.querySelector('.status-text');
    if (!statusIndicator || !statusText) return;

    try {
        statusIndicator.className = "status-indicator checking";
        statusText.textContent = "Checking...";

        // Check main classification API
        const response = await fetch(`${apiUrl}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        // Check explainer API
        let explainerStatus = "Unknown";
        try {
            const expResponse = await fetch(`${explainerUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            explainerStatus = expResponse.ok ? "Available" : "Unavailable";
        } catch (error) {
            explainerStatus = "Unavailable";
        }

        if (response.ok) {
            statusIndicator.className = "status-indicator online";
            statusText.textContent = `Online (Explainer: ${explainerStatus})`;
        } else {
            throw new Error('API not responding');
        }
    } catch (error) {
        console.error('API Status Check Error:', error);
        statusIndicator.className = "status-indicator offline";
        statusText.textContent = "Offline";
    }
}

// Append message to chat
function appendMessage(content, sender = "user", isTyping = false) {
    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${sender}`;
    
    const bubbleContent = document.createElement("div");
    bubbleContent.className = "bubble-content";
    
    if (isTyping) {
        bubbleContent.innerHTML = `
            <div class="typing-indicator">
                AI is analyzing...
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
    } else {
        bubbleContent.innerHTML = `
            <div class="bubble-text">${content}</div>
            <div class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
    }
    
    bubble.appendChild(bubbleContent);
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    adjustChatBottomPadding();
    
      // Remove welcome message after first user message
    const welcomeMessage = chatWindow.querySelector('.welcome-message');
    if (welcomeMessage && sender === "user") {
        welcomeMessage.style.display = 'none';
    }
}

// Show typing indicator
function showTypingIndicator() {
    appendMessage("", "ai", true);
    adjustChatBottomPadding();
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = chatWindow.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.closest('.message-bubble').remove();
    }
}

// Animate progress bar
function animateProgressBar() {
    progressBar.classList.remove("hidden");
    const progressFill = progressBar.querySelector('.progress-fill');
    progressFill.style.width = "0%";
    
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width += 10;
            progressFill.style.width = width + "%";
        }
    }, 100);
}

// Hide progress bar
function hideProgressBar() {
    progressBar.classList.add("hidden");
    adjustChatBottomPadding();
}

// New helper function to display results
function displayScanResult(classification, confidence, explanation = null) {
    removeTypingIndicator();
    hideProgressBar();
    
    const isPhishing = classification.toLowerCase().includes("phishing");
    const icon = isPhishing ? "🚨" : "✅";
    const color = isPhishing ? "#ef4444" : "#10b981";
    const lang = localStorage.getItem('surLinkLang') || 'en';
    const advice = isPhishing ? translations[lang].phishing_advice : translations[lang].safe_advice;
    
    let content = `
        <div style="color: ${color}; font-weight: 600;">
            ${icon} <strong>${classification}</strong>
        </div>
        <div style="margin-top: 8px; font-size: 0.9rem; opacity: 0.8;">
            Confidence: <strong>${confidence}</strong>
        </div>
        <div id="ai-message">
            ${advice}
        </div>`;
    
    if (explanation !== null) {
        content += `
        <div id="ai-explanation">
            <div id="ai-explanation-title">${translations[lang].why_decision}</div>
            <div id="ai-explanation-content">${explanation}</div>
        </div>`;
    } else {
        content += `
        <div id="ai-explanation" class="explanation-placeholder">
            <div class="explanation-loading">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
                Generating explanation...
            </div>
        </div>`;
    }
    
    // Find or create message bubble
    let bubble = chatWindow.querySelector('.message-bubble.ai:last-child');
    if (!bubble || !bubble.classList.contains('pending-explanation')) {
        bubble = document.createElement("div");
        bubble.className = "message-bubble ai pending-explanation";
        const bubbleContent = document.createElement("div");
        bubbleContent.className = "bubble-content";
        bubble.appendChild(bubbleContent);
        chatWindow.appendChild(bubble);
    }
    
    bubble.querySelector('.bubble-content').innerHTML = content;
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Modified scanMessage function
async function scanMessage() {
    const message = messageInput.value.trim();
    if (!message || isScanning) return;

    isScanning = true;
    scanBtn.disabled = true;
    scanBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Scanning...</span>';

    messageInput.value = "";
    messageInput.style.height = "auto";
    appendMessage(message, "user");
    showTypingIndicator();

    try {
        // Get classification first
        const response = await fetch(`${apiUrl}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        // Show initial result without explanation
        displayScanResult(data.result, data.confidence);
        
        // Update stats and history immediately
        saveToHistory(message, data.result);
        updateStats(data.result);
        
        // Get explanation asynchronously
        try {
            const explanation = await callExplainerModel(message, data.result);
            if (explanation) {
                // Update the result with explanation
                displayScanResult(data.result, data.confidence, explanation);
            }
        } catch (error) {
            console.log("Explanation service unavailable:", error);
        }
        
    } catch (error) {
        console.error("Scan Error:", error);
        removeTypingIndicator();
        hideProgressBar();
        appendMessage(`
            ❌ Connection Error<br>
            <small>Unable to connect to the AI service. Please check your internet connection and try again.</small>
        `, "ai");
    } finally {
        isScanning = false;
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<span class="btn-icon">🔍</span><span class="btn-text">Scan</span>';
    }
}

// Format the result for display
function formatResult(data) {
    const lang = localStorage.getItem('surLinkLang') || 'en';
    const { result, confidence } = data;
    const isPhishing = result.toLowerCase().includes("phishing");
    const explanation = (data && typeof data.explanation === 'string' && data.explanation.trim()) ? data.explanation.trim() : '';
    const icon = isPhishing ? "🚨" : "✅";
    const color = isPhishing ? "#ef4444" : "#10b981";
    const advice = isPhishing ? translations[lang].phishing_advice : translations[lang].safe_advice;
    return `
        <div style="color: ${color}; font-weight: 600;">
            ${icon} <strong>${result}</strong>
        </div>
        <div style="margin-top: 8px; font-size: 0.9rem; opacity: 0.8;">
            Confidence: <strong>${confidence}</strong>
        </div>
        <div id="ai-message">
            ${advice}
        </div>
        ${explanation ? `
        <div id="ai-explanation">
            <div id="ai-explanation-title">${translations[lang].why_decision}</div>
            <div id="ai-explanation-content">${explanation.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>` : ''}
    `;
}


// Save to history
function saveToHistory(message, result) {
    // Find the history list in case it's lazy-loaded
    const historySection = document.getElementById('historyMainSection');
    if (!historySection) return; // safety check

    const historyList = historySection.querySelector('#historyList');
    if (!historyList) return; // section not loaded yet

    const isPhishing = result.toLowerCase().includes("phishing");
    const historyItem = document.createElement("div");
    historyItem.className = `history-item ${isPhishing ? 'phishing' : 'safe'}`;
    historyItem.setAttribute('role', 'listitem');
    const truncatedMessage = message.length > 50 ? message.substring(0, 50) + "..." : message;

    historyItem.innerHTML = `
        <div style="font-weight: 500; margin-bottom: 4px;">
            ${isPhishing ? "🚨 Phishing" : "✅ Safe"}
        </div>
        <div style="font-size: 0.85rem; color: #cbd5e1;">
            ${truncatedMessage}
        </div>
        <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">
            ${new Date().toLocaleTimeString()}
        </div>
    `;

    // Remove empty history message if it exists
    const emptyHistory = historyList.querySelector('.empty-history');
    if (emptyHistory) {
        emptyHistory.remove();
    }

    // Add to top of history
    historyList.insertBefore(historyItem, historyList.firstChild);

    // Keep only last 10 items
    const items = historyList.querySelectorAll('.history-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
}


// Update statistics
function updateStats(result) {
    totalScans++;

    if (result.toLowerCase().includes("phishing")) {
        phishingScans++;
    } else {
        safeScans++;
    }

    // Find the stats elements dynamically
    const statsSection = document.getElementById('statsMainSection');
    if (!statsSection) return; // section not loaded yet

    const totalScansEl = statsSection.querySelector('#totalScans');
    const phishingScansEl = statsSection.querySelector('#phishingScans');
    const safeScansEl = statsSection.querySelector('#safeScans');

    if (totalScansEl) totalScansEl.textContent = totalScans;
    if (phishingScansEl) phishingScansEl.textContent = phishingScans;
    if (safeScansEl) safeScansEl.textContent = safeScans;

    // Save to localStorage
    saveStats();
}

// Save stats to localStorage
function saveStats() {
    const stats = { totalScans, phishingScans, safeScans };
    localStorage.setItem('surLinkStats', JSON.stringify(stats));
}

// Load stats from localStorage
function loadStats() {
    const savedStats = localStorage.getItem('surLinkStats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        totalScans = stats.totalScans || 0;
        phishingScans = stats.phishingScans || 0;
        safeScans = stats.safeScans || 0;

        // Update elements if they exist (may not be loaded yet)
        const statsSection = document.getElementById('statsMainSection');
        if (statsSection) {
            const totalScansEl = statsSection.querySelector('#totalScans');
            const phishingScansEl = statsSection.querySelector('#phishingScans');
            const safeScansEl = statsSection.querySelector('#safeScans');

            if (totalScansEl) totalScansEl.textContent = totalScans;
            if (phishingScansEl) phishingScansEl.textContent = phishingScans;
            if (safeScansEl) safeScansEl.textContent = safeScans;
        }
    }
}


// Update API URL (this will be set when you deploy to Hugging Face Spaces)
function updateApiUrl(url) {
    apiUrl = url;
    checkApiStatus();
}

// Update explainer URL
function updateExplainerUrl(url) {
    explainerUrl = url;
    checkApiStatus();
}

// APIFreeLLM explainer integration: prefer client-side apifree.chat if available, otherwise fallback to explainerUrl
async function callExplainerModel(message, label) {
    const lang = localStorage.getItem('surLinkLang') || 'en';
    
    // Language-specific prompts
    const prompts = {
        en: `Your a robot that's good at identifying phishing and safe messages. Explain and point out why the message is classified as "${label}". Answer in one short explanation only. No greetings, no introductions, no closing remarks. Output only the explanation. Message:\n\n${message}`,
        tl: `Ikaw ay isang robot na magaling magtukoy ng phishing at safe messages. Ipaliwanag at ipakita kung bakit ang mensahe ay kinategorya bilang "${label}". Isang maikling paliwanag lamang. Walang pagbati, walang introduksyon, walang pagtatapos. Ilagay lamang ang paliwanag kung bakit. Mensahe:\n\n${message}`
    };
    
    const prompt = prompts[lang] || prompts.en;  // Fallback to English if language not supported

    // Try APIFreeLLM client if loaded on the page
    try {
        if (window.apifree && typeof apifree.chat === 'function') {
            const resp = await apifree.chat(prompt);
            if (typeof resp === 'string') return resp.trim();
            if (resp && typeof resp === 'object') {
                if (resp.response) return String(resp.response).trim();
                if (resp.text) return String(resp.text).trim();
            }
            return '';
        }
    } catch (err) {
        console.warn('APIFree explain error', err);
    }

    // Fallback: call configured explainerUrl (server-side) if provided
    if (explainerUrl) {
        try {
            const expResp = await fetch(`${explainerUrl}/explain`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, label, lang }) // Include language in request
            });
            if (expResp.ok) {
                const expData = await expResp.json();
                return expData.explanation || '';
            }
        } catch (e) {
            console.warn('Explainer fetch error', e);
        }
    }

    return '';
}

// Auto-check API status every 30 seconds
setInterval(checkApiStatus, 30000); 

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.querySelector('.theme-label');
    const isDark = body.classList.contains('light-theme'); // currently light?

    if (isDark) {
        // Switch to dark theme
        body.classList.remove('light-theme');
        localStorage.setItem('surLinkTheme', 'dark');
        themeToggle.checked = false;
        if (themeLabel) themeLabel.textContent = '🌙 Dark Theme';
    } else {
        // Switch to light theme
        body.classList.add('light-theme');
        localStorage.setItem('surLinkTheme', 'light');
        themeToggle.checked = true;
        if (themeLabel) themeLabel.textContent = '☀️ Light Theme';
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('surLinkTheme');
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.querySelector('.theme-label');

    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        if (themeToggle) themeToggle.checked = true;
        if (themeLabel) themeLabel.textContent = '☀️ Light Theme';
    } else {
        body.classList.remove('light-theme');
        if (themeToggle) themeToggle.checked = false;
        if (themeLabel) themeLabel.textContent = '🌙 Dark Theme';
    }
}

// === Feedback Function ===
function initFeedback() {
  // Get all required elements
  const submitBtn = document.getElementById("submitFeedback");
  const clearBtn = document.getElementById("clearFeedback");
  const messageEl = document.getElementById("feedbackMessage");
  const status = document.getElementById("feedbackStatus");
  const typeEl = document.getElementById("feedbackType");

  if (!submitBtn || !clearBtn || !messageEl || !status || !typeEl) {
    console.error("Required feedback elements not found");
    return;
  }

  // Clean up any existing event listeners by replacing elements
  const newSubmitBtn = submitBtn.cloneNode(true);
  submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
  const newClearBtn = clearBtn.cloneNode(true);
  clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);

  let isSubmitting = false; // Flag to prevent double submission

  // Handle submission
  newSubmitBtn.addEventListener("click", (event) => {
    event.preventDefault();

    if (isSubmitting) {
      console.log("Submission already in progress");
      return;
    }

    const type = typeEl.value;
    const message = messageEl.value.trim();

    // Validate message
    if (!message || message.length < 2) {
      console.log("Validation failed: message is empty or too short");
      status.textContent =
        "⚠️ Please enter meaningful feedback before submitting.";
      status.style.color = "orange";
      status.classList.add("show");
      messageEl.focus();
      return;
    }

    // Set submission flag and disable controls
    isSubmitting = true;
    newSubmitBtn.disabled = true;
    messageEl.disabled = true;

    // Show success
    status.textContent = "✅ Thank you! Your feedback has been sent.";
    status.style.color = "green";
    status.classList.add("show");

    // Clear the message
    messageEl.value = "";

    // Reset form after delay
    setTimeout(() => {
      isSubmitting = false;
      messageEl.disabled = false;
      newSubmitBtn.disabled = false;
      status.textContent = "";
      status.classList.remove("show");
    }, 3000);
  });

  // Handle clear button
  newClearBtn.addEventListener("click", () => {
    if (!isSubmitting) {
      messageEl.value = "";
      status.textContent = "";
      status.classList.remove("show");
      messageEl.focus();
    }
  });
}



// === Image picker OCR ===
function setupImagePicker() {
  const fileInput = document.getElementById('imagePicker');
  if (!fileInput) return;
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    
    // Show loading state
    const originalBtnText = scanBtn.innerHTML;
    scanBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Extracting...</span>';
    scanBtn.disabled = true;
    
    try {
      const img = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
      const extracted = (text || '').trim();
      if (extracted) {
        messageInput.value = extracted;
        messageInput.dispatchEvent(new Event('input'));
      }
    } catch (e) {
      console.error('Image OCR failed', e);
      alert('Failed to extract text from image. Please try again.');
    } finally {
      // Restore button state
      scanBtn.innerHTML = originalBtnText;
      scanBtn.disabled = false;
      fileInput.value = '';
    }
  });
}
let authMode = "login"; // "login" or "register"

function openLoginModal() {
  document.getElementById("authModal").classList.remove("hidden");
  document.getElementById("sidebar").classList.remove("open"); // If mobile menu is open, close it
}

function closeLoginModal() {
  document.getElementById("authModal").classList.add("hidden");
}

function switchAuthMode(e) {
  e.preventDefault();
  authMode = (authMode === "login") ? "register" : "login";
  document.getElementById("authTitle").innerText = authMode === "login" ? "Login" : "Register";
  document.querySelector("#authModal button.scan-btn").innerText = authMode === "login" ? "Login" : "Register";
  document.getElementById("authSwitch").innerHTML = authMode === "login" 
    ? `Don't have an account? <a href="#" onclick="switchAuthMode(event)">Register here</a>` 
    : `Already have an account? <a href="#" onclick="switchAuthMode(event)">Login here</a>`;
}

function handleAuthAction() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }
  if (authMode === "register") {
    localStorage.setItem("surlinkUser", JSON.stringify({ email, password }));
    alert("✅ Registration successful! You can now log in.");
    switchAuthMode(new Event("click"));
  } else {
    const storedUser = JSON.parse(localStorage.getItem("surlinkUser"));
    if (storedUser && storedUser.email === email && storedUser.password === password) {
      localStorage.setItem("surlinkLoggedIn", "true");
      localStorage.setItem("surlinkLoggedUser", email);
      localStorage.removeItem("surlinkGoogleName");
      localStorage.removeItem("surlinkGooglePic");
      updateUserUI();
      closeLoginModal();
    } else {
      alert("❌ Invalid email or password");
    }
  }
}


// Unified Google & Local login/profile logic
window.setGoogleUser = function(data) {
  localStorage.setItem("surlinkLoggedIn", "true");
  localStorage.setItem("surlinkLoggedUser", data.email);
  localStorage.setItem("surlinkGoogleName", data.name);
  localStorage.setItem("surlinkGooglePic", data.picture);
  updateUserUI();
  closeLoginModal();
};

function updateUserUI() {
  const loggedIn = localStorage.getItem("surlinkLoggedIn") === "true";
  const email = localStorage.getItem("surlinkLoggedUser") || "";
  const name = localStorage.getItem("surlinkGoogleName") || "";
  const pic = localStorage.getItem("surlinkGooglePic") || "";

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmail = document.getElementById("userEmail");
  const userName = document.getElementById("userName");
  const userPic = document.getElementById("userPic");

  if (loggedIn) {
    logoutBtn.classList.remove("hidden");
    loginBtn.classList.add("hidden");
    userEmail.innerText = email || "";
    userName.innerText = name || "";
    if (pic) {
      userPic.src = pic;
      userPic.style.display = "block";
    } else {
      userPic.style.display = "none";
    }
  } else {
    logoutBtn.classList.add("hidden");
    loginBtn.classList.remove("hidden");
    userEmail.innerText = "Not logged in";
    if (userName) userName.innerText = "";
    if (userPic) userPic.style.display = "none";
  }
}

function logout() {
  localStorage.removeItem("surlinkLoggedIn");
  localStorage.removeItem("surlinkLoggedUser");
  localStorage.removeItem("surlinkGoogleName");
  localStorage.removeItem("surlinkGooglePic");
  updateUserUI();
  showMiniPopup("Logged out");
}

// Mini popup function
function showMiniPopup(message) {
  let popup = document.getElementById('miniPopup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'miniPopup';
    popup.style.position = 'fixed';
    popup.style.bottom = '32px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = 'linear-gradient(135deg,#6366f1,#8b5cf6)';
    popup.style.color = '#fff';
    popup.style.padding = '12px 28px';
    popup.style.borderRadius = '14px';
    popup.style.fontWeight = '600';
    popup.style.fontSize = '1rem';
    popup.style.boxShadow = '0 8px 24px rgba(99,102,241,0.25)';
    popup.style.zIndex = '99999';
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.3s';
    document.body.appendChild(popup);
  }
  popup.textContent = message;
  popup.style.opacity = '1';
  setTimeout(() => {
    popup.style.opacity = '0';
  }, 2000);
}

// Call on page load
window.addEventListener("load", () => {
  updateUserUI();
});

// === Image Options Dropdown Functions ===
function isSmallScreen() {
  return window.innerWidth <= 1024; // Mobile and tablet breakpoint
}

function updateCameraOptionVisibility() {
  const dropdown = document.getElementById('imageOptionsDropdown');
  const cameraOption = dropdown?.querySelector('.dropdown-option:first-child');
  
  if (cameraOption) {
    if (isSmallScreen()) {
      cameraOption.style.display = 'flex';
    } else {
      cameraOption.style.display = 'none';
    }
  }
}

function toggleImageOptions() {
  const dropdown = document.getElementById('imageOptionsDropdown');
  
  if (dropdown) {
    // Update camera option visibility before showing dropdown
    updateCameraOptionVisibility();
    dropdown.classList.toggle('hidden');
  }
}

function selectImage() {
  const fileInput = document.getElementById('imagePicker');
  if (fileInput) {
    fileInput.click();
  }
  // Hide dropdown after selection
  const dropdown = document.getElementById('imageOptionsDropdown');
  if (dropdown) {
    dropdown.classList.add('hidden');
  }
}

function openCamera() {
  // For now, we'll use the file input with camera capture
  const fileInput = document.getElementById('imagePicker');
  if (fileInput) {
    fileInput.setAttribute('capture', 'environment');
    fileInput.click();
    // Reset capture attribute after use
    setTimeout(() => {
      fileInput.removeAttribute('capture');
    }, 100);
  }
  // Hide dropdown after selection
  const dropdown = document.getElementById('imageOptionsDropdown');
  if (dropdown) {
    dropdown.classList.add('hidden');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('imageOptionsDropdown');
  const imageBtn = document.getElementById('imageOptionsBtn');
  
  if (dropdown && !dropdown.classList.contains('hidden') && 
      !imageBtn.contains(event.target) && 
      !dropdown.contains(event.target)) {
    dropdown.classList.add('hidden');
  }
});
/* splash screen */
window.addEventListener("load", () => {
  const splash = document.getElementById("splashScreen");

  // Keep splash visible for a bit, then fade out
  setTimeout(() => {
    splash.classList.add("hide");

    // Wait until splash animation finishes
    setTimeout(() => {
      if (typeof window.startOnboarding === "function") {
        window.startOnboarding(); // ✅ start onboarding
      }
    }, 300); // match your splash fade-out transition
  }, 1900); // how long splash stays visible
});

// === Sidebar swipe (mobile) ===
(function () {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const menuToggle = document.getElementById("menuToggle");

  let startX = 0, startY = 0;
  let isSwiping = false;

  function isMobile() {
    return window.matchMedia("(max-width:1024px)").matches;
  }

  // Start swipe detection
  document.addEventListener("touchstart", (e) => {
    if (!isMobile()) return;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    // Open if starting from left edge (within 150px)
    if (startX <= 150 && !sidebar.classList.contains("open")) {
      isSwiping = "open";
    }

    // Close if starting inside the sidebar (within 50px from its right edge)
    if (
      sidebar.classList.contains("open") &&
      startX >= sidebar.offsetWidth - 50
    ) {
      isSwiping = "close";
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;

    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    // cancel if vertical movement > horizontal
    if (Math.abs(dy) > Math.abs(dx)) {
      isSwiping = false;
      return;
    }

    if (isSwiping === "open" && dx > 80) {
      // Open sidebar
      sidebar.classList.add("open");
      if (backdrop) {
        backdrop.hidden = false;
        backdrop.style.pointerEvents = "auto";
        backdrop.style.opacity = "0.4";
      }
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("no-scroll");
      isSwiping = false;
    }

    if (isSwiping === "close" && dx < -80) {
      // Close sidebar
      sidebar.classList.remove("open");
      if (backdrop) {
        backdrop.hidden = true;
        backdrop.style.pointerEvents = "none";
      }
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
      isSwiping = false;
    }
  });

  document.addEventListener("touchend", () => {
    isSwiping = false;
  });
})();


// Translate website 
const translations = {
  en: {
    title: "SûrLink",
    tagline: "Built to Detect, Designed to Protect",
    chat_scanner: "Chat Scanner",
    scan_history: "Scan History",
    statistics: "Statistics",
    quiz: "Quiz",
    api_status: "API Status",
    feedback: "Feedback",
    account: "Account",
    not_logged_in: "Not logged in",
    login_register: "Login / Register",
    logout: "Logout",
    appearance: "Appearance",
    dark_theme: "🌙 Dark Theme",
    welcome: "Welcome to SûrLink",
    welcome_desc: "I'm here to help you detect phishing attempts in messages, emails, and text content using advanced AI technology.",
    try_examples: "Try these examples:",
    example1: "Your account has been suspended. Click here to verify immediately.",
    example2: "Congratulations! You've won $1000. Claim your prize now.",
    example3: "Your package is ready for pickup. Click to confirm delivery.",
    message_placeholder: "Enter your message here...",
    scan: "Scan",
    recent_scans: "Recent Scans",
    no_scans: "No scans yet",
    scan_statistics: "Scan Statistics",
    total_scans: "Total Scans",
    phishing_detected: "Phishing Detected",
    safe_messages: "Safe Messages",
    checking: "Checking...",
    feedback_title: "We value your feedback",
    feedback_type: "Feedback Type",
    suggestion: "💡 Suggestion",
    bug: "🐞 Bug Report",
    question: "❓ Question",
    your_feedback: "Your Feedback",
    feedback_placeholder: "Type your feedback here...",
    submit: "Submit",
    clear: "Clear",
    login: "Login",
    register: "Register",
    or: "OR",
    dont_have_account: "Don't have an account? Register here",
    already_have_account: "Already have an account? Login here",
    safe_advice: `✅ This message appears safe.<br><br>👉 <b>What to do:</b> You can continue normally, but stay alert for anything unusual.<br><br>💡 <b>Safety tips:</b><br>• Double-check the sender/source if unsure.<br>• Be careful with unexpected links or files.<br>• Keep your device and security tools updated.<br>• When in doubt, verify through official channels.`,
    phishing_advice: `⚠️ This message looks suspicious and may be a phishing attempt.<br><br>👉 <b>What to do:</b> Do not reply, share personal details, or click any links/attachments.<br><br>🛡️ Best action: ignore, delete, or report it.<br><br>🔒 <b>How to avoid phishing:</b><br>• Check the sender’s email/number carefully.<br>• Watch for spelling mistakes or odd grammar.<br>• Don’t trust urgent scare tactics like “act now”.<br>• Use official apps or websites instead of in-message links.`,
    why_decision: "Why this decision",
  },
  tl: {
    title: "SûrLink",
    tagline: "Gawa para Mag-detect, Disenyo para Magprotekta",
    chat_scanner: "Chat Scanner",
    scan_history: "Kasaysayan ng Scan",
    statistics: "Istatistika",
    quiz: "Pagsusulit",
    api_status: "Kalagayan ng API",
    feedback: "Puna",
    account: "Account",
    not_logged_in: "Hindi naka-login",
    login_register: "Login / Rehistro",
    logout: "Logout",
    appearance: "Hitsura",
    dark_theme: "🌙 Madilim",
    welcome: "Maligayang Pagdating sa SûrLink",
    welcome_desc: "Narito ako para tulungan kang matukoy ang mga pagtatangkang phishing sa mga mensahe, email, at teksto gamit ang makabagong AI technology.",
    try_examples: "Subukan ang mga halimbawang ito:",
    example1: "Ang iyong account ay nasuspinde. I-click dito para agad na ma-verify.",
    example2: "Binabati kita! Nanalo ka ng $1000. I-claim ang iyong premyo ngayon.",
    example3: "Handa na ang iyong package para kunin. I-click para kumpirmahin ang delivery.",
    message_placeholder: "Ilagay ang iyong mensahe dito...",
    scan: "I-scan",
    recent_scans: "Mga Kamakailang Scan",
    no_scans: "Wala pang scan",
    scan_statistics: "Istatistika ng Scan",
    total_scans: "Kabuuang Scan",
    phishing_detected: "Natukoy na Phishing",
    safe_messages: "Ligtas na Mensahe",
    checking: "Sinusuri...",
    feedback_title: "Pinahahalagahan namin ang iyong puna",
    feedback_type: "Uri ng Puna",
    suggestion: "💡 Suhestiyon",
    bug: "🐞 Ulat ng Bug",
    question: "❓ Tanong",
    your_feedback: "Iyong Puna",
    feedback_placeholder: "I-type ang iyong puna dito...",
    submit: "Ipasa",
    clear: "I-clear",
    login: "Login",
    register: "Rehistro",
    or: "O",
    dont_have_account: "Wala ka pang account? Mag-rehistro dito",
    already_have_account: "May account ka na? Mag-login dito",
    safe_advice: `✅ Ang mensaheng ito ay mukhang ligtas.<br><br>👉 <b>Anong gagawin:</b> Maaari kang magpatuloy, ngunit manatiling alerto sa anumang kakaiba.<br><br>💡 <b>Mga tip sa kaligtasan:</b><br>• Suriing mabuti ang pinagmulan kung nagdududa.<br>• Mag-ingat sa di-inaasahang link o file.<br>• Panatilihing updated ang iyong device at security tools.<br>• Kapag nagdududa, mag-verify sa opisyal na paraan.`,
    phishing_advice: `⚠️ Ang mensaheng ito ay kahina-hinala at maaaring phishing attempt.<br><br>👉 <b>Anong gagawin:</b> Huwag sumagot, magbahagi ng personal na detalye, o mag-click ng anumang link/attachment.<br><br>🛡️ Pinakamainam: balewalain, burahin, o i-report ito.<br><br>🔒 <b>Paano iwasan ang phishing:</b><br>• Suriing mabuti ang email/number ng nagpadala.<br>• Mag-ingat sa maling spelling o kakaibang grammar.<br>• Huwag magtiwala sa mga nagmamadaling pananakot tulad ng “kumilos agad”.<br>• Gamitin ang opisyal na app o website sa halip na link sa mensahe.`,
    why_decision: "Bakit ito ang desisyon",
  }
};

// --- Language Switcher Logic ---

function applyTranslations(lang) {
  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Update placeholders
  if (messageInput && translations[lang].message_placeholder) {
    messageInput.placeholder = translations[lang].message_placeholder;
  }
  const feedbackMsg = document.getElementById('feedbackMessage');
  if (feedbackMsg && translations[lang].feedback_placeholder) {
    feedbackMsg.placeholder = translations[lang].feedback_placeholder;
  }

  // Auth modal
  const authTitle = document.getElementById('authTitle');
  if (authTitle && translations[lang][authMode]) {
    authTitle.innerText = translations[lang][authMode];
  }
  const authBtn = document.querySelector('#authModal button.scan-btn');
  if (authBtn && translations[lang][authMode]) {
    authBtn.innerText = translations[lang][authMode];
  }
  const authSwitch = document.getElementById('authSwitch');
  if (authSwitch) {
    authSwitch.innerHTML = authMode === "login"
      ? translations[lang].dont_have_account
      : translations[lang].already_have_account;
  }

  // Feedback type options
  const feedbackType = document.getElementById('feedbackType');
  if (feedbackType) {
    feedbackType.options[0].text = translations[lang].suggestion;
    feedbackType.options[1].text = translations[lang].bug;
    feedbackType.options[2].text = translations[lang].question;
  }

  // Feedback buttons
  const submitBtn = document.getElementById('submitFeedback');
  if (submitBtn && translations[lang].submit) submitBtn.innerText = translations[lang].submit;
  const clearBtn = document.getElementById('clearFeedback');
  if (clearBtn && translations[lang].clear) clearBtn.innerText = translations[lang].clear;

  // Scan button
  if (scanBtn && translations[lang].scan) {
    const btnText = scanBtn.querySelector('.btn-text');
    if (btnText) btnText.innerText = translations[lang].scan;
  }
}

function applyTranslations(lang) {
  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Update placeholders
  if (messageInput && translations[lang].message_placeholder) {
    messageInput.placeholder = translations[lang].message_placeholder;
  }

  // Update all AI responses in chat window to the selected language
  const aiBubbles = document.querySelectorAll('.message-bubble.ai');
  aiBubbles.forEach(bubble => {
    const bubbleContent = bubble.querySelector('.bubble-content');
    if (bubbleContent) {
      const resultMatch = bubbleContent.innerHTML.match(/<strong>(.*?)<\/strong>/);
      const confidenceMatch = bubbleContent.innerHTML.match(/Confidence: <strong>(.*?)<\/strong>/);
      const explanationMatch = bubbleContent.innerHTML.match(/<div style="white-space: pre-wrap; line-height:1.5;">([\s\S]*?)<\/div>/);
      let result = resultMatch ? resultMatch[1] : '';
      let confidence = confidenceMatch ? confidenceMatch[1] : '';
      let explanation = explanationMatch ? explanationMatch[1] : '';
      const isPhishing = result.toLowerCase().includes("phishing");
      const icon = isPhishing ? "🚨" : "✅";
      const color = isPhishing ? "#ef4444" : "#10b981";
      const advice = isPhishing ? translations[lang].phishing_advice : translations[lang].safe_advice;
      bubbleContent.innerHTML = `
        <div style="color: ${color}; font-weight: 600;">
            ${icon} <strong>${result}</strong>
        </div>
        <div style="margin-top: 8px; font-size: 0.9rem; opacity: 0.8;">
            Confidence: <strong>${confidence}</strong>
        </div>
        <div id="ai-message">
            ${advice}
        </div>
        ${explanation ? `
        <div id="ai-explanation">
            <div id="ai-explanation-title">${translations[lang].why_decision}</div>
            <div id="ai-explanation-content">${explanation}</div>
        </div>` : ''}
      `;
    }
  });
}

// Listen for language change
const langSelect = document.getElementById('languageSelect');
if (langSelect) {
  langSelect.addEventListener('change', function() {
    const lang = this.value;
    localStorage.setItem('surLinkLang', lang);
    applyTranslations(lang);
  });
}

// On load, set language from localStorage or default
window.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('surLinkLang') || 'en';
  const langSelect = document.getElementById('languageSelect');
  if (langSelect) langSelect.value = lang;
  applyTranslations(lang);
});
