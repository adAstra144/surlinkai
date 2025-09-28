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
    fetch(`sections/${sectionName}.html`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load ${sectionName}: ${res.status} ${res.statusText}`);
        }
        return res.text();
      })
      .then(html => {
        sectionEl.innerHTML = html;
        sectionEl.dataset.loaded = "true";
        setTimeout(() => {
          if (sectionName === 'stats') {
            loadStats();
            initStatsSection();
            updateStatsDisplay();
            updateProfileUI();
          }
          if (sectionName === 'status') checkApiStatus();
      if (sectionName === 'status') {
        const lang = localStorage.getItem('surLinkLang') || 'en';
        setTimeout(() => applyTranslations(lang), 0);
      }
    if (sectionName === 'status') {
      const lang = localStorage.getItem('surLinkLang') || 'en';
      setTimeout(() => applyTranslations(lang), 0);
    }
          if (sectionName === 'quiz' && !window.__quizInit) {
            initQuiz();
            window.__quizInit = true;
          }
          if (sectionName === 'feedback') initFeedback();
      // Apply translations after feedback section loads
      if (sectionName === 'feedback') {
        const lang = localStorage.getItem('surLinkLang') || 'en';
        setTimeout(() => applyTranslations(lang), 0);
      }
        }, 0);
      })
      .catch(err => console.error(`Failed to load ${sectionName}:`, err));
  } else {
    // Section already loaded — run init if necessary
    if (sectionName === 'stats') {
      loadStats();
      initStatsSection();
      updateStatsDisplay();
      updateProfileUI();
    }
    if (sectionName === 'status') checkApiStatus();
    if (sectionName === 'quiz' && !window.__quizInit) {
      initQuiz();
      window.__quizInit = true;
    }
    if (sectionName === "feedback" && !window._feedback) {
  initFeedback();
  window._feedback = true;
  // Apply translations after feedback section loads
  const lang = localStorage.getItem('surLinkLang') || 'en';
  setTimeout(() => applyTranslations(lang), 0);
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
// Robust quiz initializer — safe to paste into script.js
let activeIntervals = [];

function initQuiz() {
  // idempotent init
  if (window.__surlinkQuizInit) return;
  window.__surlinkQuizInit = true;

  // Support both English (default) and Tagalog
  const lang = localStorage.getItem('surLinkLang') || 'en';
  let activeQuestionBank = window.questionBank;
  if (lang === 'tl' && window.questionBankTL) {
    activeQuestionBank = window.questionBankTL;
  }

  function getNextQuestion() {
    if (endlessMode) {
      const pools = [
        ...activeQuestionBank.easy,
        ...activeQuestionBank.medium,
        ...activeQuestionBank.hard
      ];
      return pools[Math.floor(Math.random() * pools.length)];
    }
    const pool = activeQuestionBank[difficulty] || activeQuestionBank.medium;
    return pool[Math.floor(Math.random() * pool.length)];
  }

 

  // --- Elements (grab once; later code checks exist) ---
  const quizWelcome = document.getElementById('quizWelcome');
  const quizDifficulty = document.getElementById('quizDifficulty');
  const quizContainer = document.getElementById('quizContainer');

  const quizProgress = document.getElementById('quizProgress');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizScoreEl = document.getElementById('quizScore');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizAnswers = document.getElementById('quizAnswers');
  const quizFeedback = document.getElementById('quizFeedback');
  const quizNextBtn = document.getElementById('quizNextBtn');
  const quizRestartBtn = document.getElementById('quizRestartBtn');
  const quizLivesEl = document.getElementById('quizLives');
  const quizLevelEl = document.getElementById('quizLevel');
const quizXPEl = document.getElementById('quizXP');

// If you have a separate stats panel somewhere:
const statsLevelEl = document.getElementById('statsLevel');
const statsBadgeEl = document.getElementById('statsBadge');
  const quizBadge = document.getElementById('quizBadge');
  const quizTimerEl = document.getElementById('quizTimer');
  const quizStreakEl = document.getElementById('quizStreak');

  // Defensive: warn if important pieces are missing
  if (!quizQuestion || !quizAnswers) {
    console.warn("Quiz init: essential elements missing. Check IDs: quizQuestion, quizAnswers.");
  }
  if (!quizWelcome) console.warn("Quiz init: 'quizWelcome' missing.");
  if (!quizStartBtnExists() && !document.querySelector('#quizStartBtn')) {
    // if there is not an actual start button element yet - delegation still handles clicks.
    // no hard failure — just warning
    console.warn("Quiz init: '#quizStartBtn' not found. Make sure there is a button with id='quizStartBtn'.");
  }

  // --- Config & state ---
  const AUTO_NEXT_DELAY = 1200;
  const LOW_TIME_THRESHOLD = 6;

// --- State ---
let idx = 0, score = 0, lives = 3;
// keep track of previous lives so we can animate differences
let prevLives = lives;

// keep ref to a pulse animation so we can cancel it when needed
let livesPulseAnim = null;
let xp = 0, level = 1, xpToNext = 50; // base threshold
let answered = false;
let autoNextTimeout = null;
let streak = 0, bestStreak = 0;
let difficulty = null;
let endlessMode = false;
let currentQuestion = null;




// --- XP & Level handling ---
function addXP(amount) {
  xp += amount;

  if (quizXPEl) {
    quizXPEl.classList.add("xp-glow");
    setTimeout(() => quizXPEl.classList.remove("xp-glow"), 800);
  }

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level++;
    xpToNext = Math.floor(xpToNext * 1.3);

    if (quizLevelEl) {
      quizLevelEl.classList.add("level-up");
      setTimeout(() => quizLevelEl.classList.remove("level-up"), 800);
    }

    triggerConfetti();
    playSound("levelUp");
  }

  updateScoreUI(true); 
  
}

  // --- Helpers ---
  function quizStartBtnExists(){ return !!document.getElementById('quizStartBtn'); }

  function clearTimers() {
    activeIntervals.forEach(id => clearInterval(id));
    activeIntervals = [];
    if (autoNextTimeout !== null) {
      clearTimeout(autoNextTimeout);
      autoNextTimeout = null;
    }
  }

  function getTimerForDifficulty() {
    if (difficulty === "easy") return 25;
    if (difficulty === "medium") return 20;
    if (difficulty === "hard") return 15;
    if (endlessMode) return 18;
    return 20;
  }

  function getNextQuestion() {
    if (endlessMode) {
      const pools = [
        ...activeQuestionBank.easy,
        ...activeQuestionBank.medium,
        ...activeQuestionBank.hard
      ];
      return pools[Math.floor(Math.random() * pools.length)];
    }
    const pool = activeQuestionBank[difficulty] || activeQuestionBank.medium;
    return pool[Math.floor(Math.random() * pool.length)];
  }

 // --- UI updates (guarded) ---
function updateProgressUI() {
  if (!quizProgress || !quizProgressFill) return;

  if (endlessMode) {
    quizProgress.textContent = `Question ${idx + 1} (Endless)`;
    quizProgressFill.style.width = "100%"; // fixed bar for endless
  } else {
    const total = activeQuestionBank[difficulty] ? activeQuestionBank[difficulty].length : 1;
    quizProgress.textContent = `Question ${idx + 1} / ${total}`;
    const percent = Math.round(((idx + 1) / total) * 100);
    quizProgressFill.style.width = `${percent}%`;
  }
}

// --- Update UI ---
function updateScoreUI(bump = false) {
  if (quizScoreEl) quizScoreEl.textContent = `Score: ${score}`;
  if (quizLevelEl) quizLevelEl.textContent = `Lvl ${level}`;
  if (quizXPEl) quizXPEl.textContent = `XP: ${xp} / ${xpToNext}`;

  if (bump) {
    [quizScoreEl, quizLevelEl, quizXPEl].forEach(el => {
      if (!el) return;
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    });
  }
}

  function updateLivesUI() {
  if (!quizLivesEl) return;

  const maxLives = 3; // or make configurable
  quizLivesEl.innerHTML = '';

  for (let i = 0; i < maxLives; i++) {
    const span = document.createElement('span');
    span.className = 'heart ' + (i < lives ? 'full' : 'empty');
    quizLivesEl.appendChild(span);
  }

  // Animate life lost
  if (prevLives > lives) {
    const lostHeart = quizLivesEl.querySelectorAll('.heart')[lives];
    if (lostHeart) {
      lostHeart.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0.2)', opacity: 0 }
      ], { duration: 500, easing: 'ease-out' });
      // playSound('lifeLost'); // Removed as requested
    }
  }

  // Animate life gained
  if (prevLives < lives) {
    const newHeart = quizLivesEl.querySelectorAll('.heart')[lives - 1];
    if (newHeart) {
      newHeart.animate([
        { transform: 'scale(0.2)', opacity: 0 },
        { transform: 'scale(1.3)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }
      ], { duration: 500, easing: 'cubic-bezier(.2,.9,.3,1)' });
      playSound('correct'); // or a dedicated heal sound
    }
  }

  // Pulse when in danger (only 1 life left)
  quizLivesEl.querySelectorAll('.heart').forEach((h, i) => {
    h.classList.remove('danger');
    if (lives === 1 && i === 0) h.classList.add('danger');
  });

  prevLives = lives;
}

  function updateStreakUI(bump = false) {
    if (!quizStreakEl) return;
    quizStreakEl.textContent = `🔥 ${streak} | 🏆 Best: ${bestStreak} ${endlessMode ? "| ♾️ Endless" : ""}`;
    if (bump) {
      quizStreakEl.classList.remove('bump');
      void quizStreakEl.offsetWidth;
      quizStreakEl.classList.add('bump');
    }
  }

  function setTimerDisplay(s) {
    if (!quizTimerEl) return;
    quizTimerEl.textContent = `${s}s`;
    quizTimerEl.classList.remove('warn','zero');
    if (s <= 0) quizTimerEl.classList.add('zero');
    else if (s <= LOW_TIME_THRESHOLD) quizTimerEl.classList.add('warn');
  }

  // --- Timer (uses activeIntervals[]) ---
  function startTimer(currentIdx) {
    clearTimers();
    let timeLeft = getTimerForDifficulty();
    setTimerDisplay(timeLeft);

    const myIdx = currentIdx;
    const intervalId = setInterval(() => {
      // if we've moved to another question, stop this interval
      if (idx !== myIdx) {
        clearTimers();
        return;
      }
      timeLeft -= 1;
      setTimerDisplay(timeLeft);
      if (timeLeft <= 0) {
        clearTimers();
        onTimeUp();
      }
    }, 1000);

    activeIntervals.push(intervalId);
  }

  // --- Quiz flow ---
  function revealCorrectAnswer() {
    if (!currentQuestion || !quizAnswers) return;
    Array.from(quizAnswers.children).forEach(btn => {
      const txt = (btn.textContent || '').trim();
      const matching = currentQuestion.a.find(a => a.text === txt);
      if (matching && matching.correct) btn.classList.add('correct');
    });
  }

  function onTimeUp() {
    if (answered) return;
    answered = true;
    clearTimers();
    if (quizAnswers) Array.from(quizAnswers.children).forEach(b => b.disabled = true);
    revealCorrectAnswer();
    lives = Math.max(0, lives - 1);
    streak = 0;
    if (quizFeedback) quizFeedback.textContent = `⏱️ Time's up! You lost a life.`;
    updateLivesUI();
    updateStreakUI();

    autoNextTimeout = setTimeout(() => {
      if (lives <= 0) finishQuiz(false);
      else { idx++; render(); }
    }, AUTO_NEXT_DELAY);
  }

  function selectAnswer(btn, correct) {
    if (answered) return;
    answered = true;
    clearTimers();
    if (quizAnswers) Array.from(quizAnswers.children).forEach(b => b.disabled = true);

    if (correct) {
      score++;
      addXP(10);
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      btn.classList.add('correct');
      if (quizFeedback) quizFeedback.textContent = '✅ Correct!';
      updateStreakUI(true);
      playSound('correct');
    } else {
      streak = 0;
      btn.classList.add('incorrect');
      revealCorrectAnswer();
      lives = Math.max(0, lives - 1);
      if (quizFeedback) quizFeedback.textContent = '❌ Wrong!';
      updateStreakUI();
      playSound('wrong');
    }

    updateLivesUI();
    updateScoreUI(true);

    autoNextTimeout = setTimeout(() => {
      if (lives <= 0) finishQuiz(false);
      else { idx++; render(); }
    }, AUTO_NEXT_DELAY);
  }

const badgeLevels = [
  { minLevel: 1, name: "Novice Learner 🐣" },
  { minLevel: 3, name: "Phishing Hunter 🕵️" },
  { minLevel: 5, name: "Cyber Guardian 🛡️" },
  { minLevel: 8, name: "Security Master 🔒" },
  { minLevel: 10, name: "Cyber Sentinel 👑" }
];

function triggerConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  });
}

const sounds = {
  correct: new Audio("sounds/correct.mp3"),
  wrong: new Audio("sounds/wrong.mp3"),
  levelUp: new Audio("sounds/level-up.mp3"),
};

function playSound(name) {
  if (sounds[name]) {
    sounds[name].currentTime = 0;
    sounds[name].play().catch(() => {}); // prevent autoplay issues
  }
}

function getBadgeForLevel(level) {
  let earned = badgeLevels[0].name;
  for (const b of badgeLevels) {
    if (level >= b.minLevel) earned = b.name;
  }
  return earned;
}

// Quit button
document.addEventListener('click', function (ev) {
  const btn = ev.target.closest('button');
  if (!btn) return;

  if (btn.matches('#quizQuitBtn')) {
    ev.preventDefault();
    clearTimers();
    finishQuiz(false, true); // treat as quit
  }
});

function finishQuiz(won = true, quit = false) {
  // Defensive: update stats display in case stats section is open
  updateStatsDisplay();
  // Save best streak, games played, level, XP, badge to profile
  const profile = getPlayerProfile();
  if (bestStreak > (profile.bestStreak || 0)) profile.bestStreak = bestStreak;
  profile.games = (profile.games || 0) + 1;
  profile.level = level;
  profile.xp = xp;
  profile.xpToNext = xpToNext;
  profile.badge = getBadgeForLevel(level);
  savePlayerProfile(profile);
  updateProfileUI();
  clearTimers();
  if (quizAnswers) quizAnswers.innerHTML = '';
  if (quizNextBtn) quizNextBtn.style.display = 'none';
  if (quizRestartBtn) quizRestartBtn.style.display = 'none'; // handled below
  if (quizQuitBtn) quizQuitBtn.style.display = 'none';

  const badge = getBadgeForLevel(level);

  // Title logic
  let title = won ? "🏆 Mission Complete!" : "💀 Game Over";
  if (quit) title = "🚪 You quit the game";

  // Build results card with data-i18n attributes
  let resultHTML = `
    <div class="quiz-result-card">
      <h2 class="result-title">${title}</h2>
      <div class="result-stats">
        <div><strong data-i18n="quiz_result_score">📊 Score:</strong> ${score}</div>
        <div><strong data-i18n="quiz_result_xp">⭐ XP:</strong> ${xp}</div>
        <div><strong data-i18n="quiz_result_badge">🏅 Badge:</strong> ${badge}</div>
        <div><strong data-i18n="quiz_result_best">🔥 Best Streak:</strong> ${bestStreak}</div>
      </div>
      <div class="quiz-actions" style="margin-top:16px;display:flex;gap:10px;justify-content:center;">
        <button id="resultsRestartBtn" class="scan-btn" data-i18n="quiz_result_play_again">🔄 Play Again</button>
        <button id="resultsMenuBtn" class="scan-btn outline" data-i18n="quiz_result_main_menu">🏠 Main Menu</button>
      </div>
    </div>
  `;

  if (quizQuestion) quizQuestion.innerHTML = resultHTML;
  // Re-apply translations to dynamically inserted result card
  const lang = localStorage.getItem('surLinkLang') || 'en';
  if (typeof applyTranslations === 'function') applyTranslations(lang);
  if (quizFeedback) quizFeedback.textContent = '';
  if (quizBadge) quizBadge.style.display = 'none';

  // Button handlers
  const restartBtn = document.getElementById('resultsRestartBtn');
  const menuBtn = document.getElementById('resultsMenuBtn');


  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
  idx = 0; score = 0; xp = 0; lives = 3; prevLives = lives; streak = 0; bestStreak = 0;
      render();
    });
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      if (quizContainer) quizContainer.style.display = 'none';
      if (quizWelcome) quizWelcome.style.display = 'block';      
    });
  }
}

function render() {
  clearTimers();
  answered = false;

  if (quizQuitBtn) quizQuitBtn.style.display = 'inline-flex'; // <— restore Quit here

  if (quizAnswers) quizAnswers.innerHTML = '';
  if (quizFeedback) quizFeedback.textContent = '';
  if (quizNextBtn) { quizNextBtn.disabled = true; quizNextBtn.style.display = 'inline-flex'; }
  if (quizRestartBtn) quizRestartBtn.style.display = 'none';
  if (quizBadge) quizBadge.style.display = 'none';

  updateProgressUI();
  updateLivesUI();
  updateScoreUI(false);
  updateStreakUI(false);

  currentQuestion = getNextQuestion();
  if (quizQuestion) quizQuestion.textContent = currentQuestion.q;

  currentQuestion.a.forEach((ans) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-answer';
    btn.type = 'button';
    btn.textContent = ans.text;
    btn.addEventListener('click', () => selectAnswer(btn, ans.correct));
    if (quizAnswers) quizAnswers.appendChild(btn);
  });

  startTimer(idx);
}

  // --- Global event delegation so element timing doesn't break click handlers ---
  document.addEventListener('click', function (ev) {
    const btn = ev.target.closest('button, .quiz-difficulty');
    if (!btn) return;

    // Start -> show difficulty selection
    if (btn.matches('#quizStartBtn')) {
      ev.preventDefault();
      if (quizWelcome) quizWelcome.style.display = 'none';
      if (quizDifficulty) quizDifficulty.style.display = 'block';
      if (quizContainer) quizContainer.style.display = 'none';
      return;
    }

    // Difficulty selection buttons (class .quiz-difficulty, data-mode attribute)
    if (btn.classList && btn.classList.contains('quiz-difficulty')) {
      ev.preventDefault();
      const mode = btn.dataset.mode || btn.getAttribute('data-mode');
      endlessMode = (mode === 'endless');
      difficulty = endlessMode ? null : mode;
      if (quizDifficulty) quizDifficulty.style.display = 'none';
      if (quizContainer) quizContainer.style.display = 'block';
  idx = 0; score = 0; xp = 0; lives = 3; prevLives = lives; streak = 0; bestStreak = 0;
      render();
      return;
    }

    // Next button manual (if you allow manual next)
    if (btn.matches('#quizNextBtn')) {
      ev.preventDefault();
      clearTimers();
      idx++;
      if (!currentQuestion || idx >= 10000) { /* safety */ }
      if (!activeQuestionBank) return;
      if (!endlessMode && idx >= (activeQuestionBank[difficulty] ? activeQuestionBank[difficulty].length : 0)) {
        finishQuiz(true);
      } else {
        render();
      }
      return;
    }

// --- Restart handling ---
if (btn.matches('#quizRestartBtn')) {
  ev.preventDefault();
  clearTimers();
  idx = 0; score = 0; lives = 3; prevLives = lives;
  xp = 0; level = 1; xpToNext = 50; // reset XP & Level
  streak = 0; bestStreak = 0;
  if (quizContainer) quizContainer.style.display = 'none';
  if (quizWelcome) quizWelcome.style.display = 'block';
  return;
}
  });

  // Ensure initial UI state if elements exist
  if (quizWelcome) quizWelcome.style.display = (quizWelcome.style.display === 'none') ? 'none' : 'block';
  if (quizDifficulty) quizDifficulty.style.display = 'none';
  if (quizContainer) quizContainer.style.display = 'none';
}

// Auto-initialize when DOM ready if showSection('quiz') won't call it
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQuiz);
} else {
  initQuiz();
}


// ---------- end of initQuiz replacement ----------//


// Check API status
async function checkApiStatus() {
  // Find elements dynamically
  const statusSection = document.getElementById('statusMainSection');
  if (!statusSection) return; // section not loaded yet

  // Detection system elements
  const detectionStatusIndicator = document.getElementById('detectionStatusIndicator');
  const detectionStatusText = document.getElementById('detectionStatusText');
  // Explainer elements
  const explainerStatusIndicator = document.getElementById('explainerStatusIndicator');
  const explainerStatusText = document.getElementById('explainerStatusText');
  if (!detectionStatusIndicator || !detectionStatusText || !explainerStatusIndicator || !explainerStatusText) return;

  // Set all to checking first
  detectionStatusIndicator.className = "status-indicator checking";
  detectionStatusText.textContent = "Checking...";
  explainerStatusIndicator.className = "status-indicator checking";
  explainerStatusText.textContent = "Checking...";

  // Check Detection System
  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      detectionStatusIndicator.className = "status-indicator online";
      detectionStatusText.textContent = "Online";
    } else {
      throw new Error('API not responding');
    }
  } catch (error) {
    detectionStatusIndicator.className = "status-indicator offline";
    detectionStatusText.textContent = "Offline";
  }

  // Check Explainer (APIFreeLLM client-side or explainerUrl)
  let explainerOnline = false;
  if (window.apifree && window.apifree.chat) {
    explainerOnline = true;
  } else if (explainerUrl) {
    try {
      const explainerResp = await fetch(`${explainerUrl}/health`, { method: 'GET' });
      explainerOnline = explainerResp.ok;
    } catch (e) { explainerOnline = false; }
  }
  if (explainerOnline) {
    explainerStatusIndicator.className = "status-indicator online";
    explainerStatusText.textContent = "Online";
  } else {
    explainerStatusIndicator.className = "status-indicator offline";
    explainerStatusText.textContent = "Offline";
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
    let advice;
    if (lang === 'tl') {
      advice = isPhishing ? translations.tl.phishing_advice : translations.tl.safe_advice;
    } else {
      advice = isPhishing
        ? `⚠️ This message looks suspicious and may be a phishing attempt.<br><br>👉 <b>What to do:</b> Do not reply, share personal details, or click any links/attachments.<br><br>🛡️ Best action: ignore, delete, or report it.<br><br>🔒 <b>How to avoid phishing:</b><br>• Check the sender’s email/number carefully.<br>• Watch for spelling mistakes or odd grammar.<br>• Don’t trust urgent scare tactics like “act now”.<br>• Use official apps or websites instead of in-message links.`
        : `✅ This message appears safe.<br><br>👉 <b>What to do:</b> You can continue normally, but stay alert for anything unusual.<br><br>💡 <b>Safety tips:</b><br>• Double-check the sender/source if unsure.<br>• Be careful with unexpected links or files.<br>• Keep your device and security tools updated.<br>• When in doubt, verify through official channels.`;
    }
    
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
    if (explanation === '__EXPLAINER_UNAVAILABLE__') {
      content += `
      <div id="ai-explanation" style="margin-top: 12px; color: #f59e42; font-size: 0.95em;">
        <strong>⚠️ Explanation currently not available.</strong><br>
        <span style="opacity:0.8;">Too many users are requesting explanations right now. Please try again later.</span>
      </div>
      `;
    } else {
      content += `
      <div id="ai-explanation">
        <div id="ai-explanation-title">${translations[lang].why_decision}</div>
        <div id="ai-explanation-content">${explanation}</div>
      </div>`;
    }
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
    let advice;
    if (lang === 'tl') {
      advice = isPhishing ? translations.tl.phishing_advice : translations.tl.safe_advice;
    } else {
      advice = isPhishing
        ? `⚠️ This message looks suspicious and may be a phishing attempt.<br><br>👉 <b>What to do:</b> Do not reply, share personal details, or click any links/attachments.<br><br>🛡️ Best action: ignore, delete, or report it.<br><br>🔒 <b>How to avoid phishing:</b><br>• Check the sender’s email/number carefully.<br>• Watch for spelling mistakes or odd grammar.<br>• Don’t trust urgent scare tactics like “act now”.<br>• Use official apps or websites instead of in-message links.`
        : `✅ This message appears safe.<br><br>👉 <b>What to do:</b> You can continue normally, but stay alert for anything unusual.<br><br>💡 <b>Safety tips:</b><br>• Double-check the sender/source if unsure.<br>• Be careful with unexpected links or files.<br>• Keep your device and security tools updated.<br>• When in doubt, verify through official channels.`;
    }
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

  // Save numeric counters
  saveStats();

  // Add a small event to scan history (useful for trend charts later)
  try {
    const events = JSON.parse(localStorage.getItem('surlinkScanEvents') || '[]');
    events.push({ ts: Date.now(), result: result.toLowerCase() });
    // keep only last 200 events to avoid bloat
    localStorage.setItem('surlinkScanEvents', JSON.stringify(events.slice(-200)));
  } catch (e) {}

  // Update UI + chart
  updateStatsDisplay();
}
/* ---------------------------
   STATS UI / Chart Integration
   --------------------------- */

let statsChart = null;

function initStatsSection() {
  // Update player profile UI when stats section is shown
  updateProfileUI();
  // update DOM references quickly (in case elements were added after initial load)
  const doughnutCanvas = document.getElementById('statsDoughnut');
  const resetBtn = document.getElementById('resetStatsBtn');
  const editProfileBtn = document.getElementById('editProfileBtn');

  // Create Chart if Chart.js is present
  if (doughnutCanvas && typeof Chart !== 'undefined') {
    // Destroy previous chart instance if it exists
    if (window.statsChart && typeof window.statsChart.destroy === 'function') {
      window.statsChart.destroy();
    }
    const ctx = doughnutCanvas.getContext('2d');
    window.statsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Phishing', 'Safe'],
        datasets: [{
          data: [phishingScans || 0, safeScans || 0],
          backgroundColor: ['#ef4444', '#10b981'],
          hoverOffset: 8,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                const v = ctx.raw || 0;
                const total = (ctx.dataset.data || []).reduce((a,b)=>a+(b||0),0) || 1;
                const pct = Math.round((v / total) * 100);
                return `${ctx.label}: ${v} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // hook reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('Reset scan statistics? This cannot be undone.')) return;
      totalScans = phishingScans = safeScans = 0;
      saveStats();
      updateStatsDisplay();
    });
  }

  // edit profile button (simple inline edit for name)
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      const current = getPlayerProfile();
      const name = prompt('Display name:', current.name || '');
      if (name !== null) {
        const profile = Object.assign({}, current, { name: name || 'Guest' });
        savePlayerProfile(profile);
      }
    });
  }

  // initial render
  updateStatsDisplay();
  updateProfileUI();
}

/* update DOM numbers + chart */
function updateStatsDisplay() {
  if (totalScansEl) totalScansEl.textContent = totalScans;
  if (phishingScansEl) phishingScansEl.textContent = phishingScans;
  if (safeScansEl) safeScansEl.textContent = safeScans;

  // Chart update
  if (statsChart) {
    statsChart.data.datasets[0].data = [phishingScans, safeScans];
    statsChart.update('active');
  }

  // update legend text (small textual summary)
  const legend = document.getElementById('chartLegend');
  if (legend) {
    const total = Math.max(1, (phishingScans + safeScans));
    const pctPhishing = Math.round((phishingScans / total) * 100);
    const pctSafe = Math.round((safeScans / total) * 100);
    legend.innerHTML = `<strong>${total}</strong> total • <span style="color:#ef4444">Phishing ${pctPhishing}%</span> • <span style="color:#10b981">Safe ${pctSafe}%</span>`;
  }

  // update player summary counts if present
  const games = document.getElementById('playerGames');
  if (games) {
    const s = getPlayerProfile() || {};
    games.textContent = s.games || 0;
  }
}

/* -----------------------
   Player Profile helpers
   ----------------------- */
function getPlayerProfile() {
  try {
    return JSON.parse(localStorage.getItem('surlinkPlayer') || '{}');
  } catch (e) { return {}; }
}
function savePlayerProfile(profile) {
  localStorage.setItem('surlinkPlayer', JSON.stringify(profile || {}));
  updateProfileUI();
}
function updateProfileUI() {
  const p = getPlayerProfile();
  const nameEl = document.getElementById('playerName');
  const avatarEl = document.getElementById('playerAvatar');
  const badgeEl = document.getElementById('playerBadge');
  const levelEl = document.getElementById('profileLevel');
  const xpEl = document.getElementById('profileXP');
  const xpFill = document.getElementById('profileXPbarFill');
  const best = document.getElementById('playerBestStreak');

  if (nameEl) nameEl.textContent = p.name || 'Guest';
  if (avatarEl) avatarEl.textContent = (p.name && p.name.length ? p.name[0].toUpperCase() : 'G');

  // Show level/xp if present in profile, else fallback to defaults
  const level = p.level || 1;
  const xp = p.xp || 0;
  const xpTo = p.xpToNext || 50;

  if (badgeEl) badgeEl.textContent = p.badge || getBadgeForLevel(level);
  if (levelEl) levelEl.textContent = `Lvl ${level}`;
  if (xpEl) xpEl.textContent = `XP: ${xp} / ${xpTo}`;
  if (xpFill) xpFill.style.width = `${Math.min(100, Math.round((xp / xpTo) * 100))}%`;

  if (best) best.textContent = p.bestStreak || 0;
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
        en: `You are a robot that identifies phishing and safe messages. The message was classified as "${label}". Explain why this decision was made and point out any words or patterns that led to it. Limit your answer to 2–3 sentences. No greetings, introductions, or closing remarks Don't restate the message and whether the message was safe or phishing. Output only the explanation. Message:\n\n${message}`,
        tl: `Ikaw ay isang robot na nakakatukoy ng phishing at ligtas na mensahe. Ang mensahe ay na-classify bilang "${label}". Ipaliwanag kung bakit ganito ang naging desisyon at ituro ang mga salita o pattern na nagdulot nito. Limitahan ang sagot sa 2–3 pangungusap lang. Walang pagbati, pagpapakilala, o pangwakas na salita. Huwag ng ulitin ang mensahe at kung safe o phishing. Ilabas lang ang paliwanag. Mensahe:\n\n${message}`,
    };
    
    const prompt = prompts[lang] || prompts.en;  // Fallback to English if language not supported

  // Try APIFreeLLM client if loaded on the page
  try {
    if (window.apifree && typeof apifree.chat === 'function') {
      const resp = await apifree.chat(prompt);
      // Detect cooldown or unavailable
      if (typeof resp === 'string') {
        if (resp.toLowerCase().includes('cooldown') || resp.toLowerCase().includes('wait') || resp.toLowerCase().includes('limit')) {
          return '__EXPLAINER_UNAVAILABLE__';
        }
        return resp.trim();
      }
      if (resp && typeof resp === 'object') {
        if (resp.error && (resp.error.toLowerCase().includes('cooldown') || resp.error.toLowerCase().includes('wait') || resp.error.toLowerCase().includes('limit'))) {
          return '__EXPLAINER_UNAVAILABLE__';
        }
        if (resp.response) return String(resp.response).trim();
        if (resp.text) return String(resp.text).trim();
      }
      return '';
    }
  } catch (err) {
    console.warn('APIFree explain error', err);
    return '__EXPLAINER_UNAVAILABLE__';
  }


    // No fallback: APIFreeLLM only

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

    // Language-aware feedback messages
    const lang = localStorage.getItem('surLinkLang') || 'en';
    const feedbackMsgs = {
      en: {
        invalid: "⚠️ Please enter meaningful feedback before submitting.",
        success: "✅ Thank you! Your feedback has been sent."
      },
      tl: {
        invalid: "⚠️ Pakilagay ng makabuluhang puna bago magsumite.",
        success: "✅ Salamat! Naipadala na ang iyong puna."
      }
    };

    // Validate message
    if (!message || message.length < 2) {
      console.log("Validation failed: message is empty or too short");
      status.textContent = feedbackMsgs[lang]?.invalid || feedbackMsgs.en.invalid;
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
    status.textContent = feedbackMsgs[lang]?.success || feedbackMsgs.en.success;
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
  fileInput.addEventListener('change', () => {
    const imageBtn = document.getElementById('imageOptionsBtn');
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    // Show image in chat immediately
    if (imageBtn) {
      imageBtn.disabled = true;
      imageBtn.classList.add('disabled');
    }
    const reader = new FileReader();
    reader.onload = async function(e) {
      const imgUrl = e.target.result;
      const chatMsg = document.createElement('div');
      chatMsg.className = 'chat-message user-message image-message';
      chatMsg.innerHTML = `<img src="${imgUrl}" alt="User uploaded image">`;
      chatWindow.appendChild(chatMsg);
      chatWindow.scrollTop = chatWindow.scrollHeight;

      // Hide welcome message if present
      const welcomeMessage = chatWindow.querySelector('.welcome-message');
      if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
      }

      // Disable scan button and show scanning state
      if (scanBtn) {
        scanBtn.disabled = true;
        scanBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Scanning...</span>';
      }

      // Show typing indicator for OCR
      showTypingIndicator();
      let ocrText = '';
      try {
        const result = await Tesseract.recognize(imgUrl, 'eng', {
          logger: m => { /* Optionally show progress */ }
        });
        ocrText = result.data.text.trim();
      } catch (err) {
        removeTypingIndicator();
        appendMessage('❌ OCR failed. Could not extract text from image.', 'ai');
        fileInput.value = '';
        if (scanBtn) {
          scanBtn.disabled = false;
          scanBtn.innerHTML = '<span class="btn-icon">🔍</span><span class="btn-text">Scan</span>';
        }
        if (imageBtn) {
          imageBtn.disabled = false;
          imageBtn.classList.remove('disabled');
        }
        return;
      }

      if (!ocrText) {
        removeTypingIndicator();
        appendMessage('❌ No readable text found in the image.', 'ai');
        fileInput.value = '';
        if (scanBtn) {
          scanBtn.disabled = false;
          scanBtn.innerHTML = '<span class="btn-icon">🔍</span><span class="btn-text">Scan</span>';
        }
        return;
      }

      // Scan the recognized text for phishing/safe
      try {
        // Show progress bar
        animateProgressBar();
        const response = await fetch(`${apiUrl}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: ocrText })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        displayScanResult(data.result, data.confidence);
        saveToHistory(ocrText, data.result);
        updateStats(data.result);
        // Get explanation asynchronously
        try {
          const explanation = await callExplainerModel(ocrText, data.result);
          if (explanation) {
            displayScanResult(data.result, data.confidence, explanation);
          }
        } catch (error) {
          // Explanation service unavailable
        }
      } catch (error) {
        removeTypingIndicator();
        hideProgressBar();
        appendMessage('❌ Error scanning recognized text.', 'ai');
      } finally {
        removeTypingIndicator();
        hideProgressBar();
        fileInput.value = '';
        if (scanBtn) {
          scanBtn.disabled = false;
          scanBtn.innerHTML = '<span class="btn-icon">🔍</span><span class="btn-text">Scan</span>';
        }
        if (imageBtn) {
          imageBtn.disabled = false;
          imageBtn.classList.remove('disabled');
        }
      }
    };
    reader.readAsDataURL(file);
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
    if (startX <= 1000 && !sidebar.classList.contains("open")) {
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
  tl: {
    title: "SûrLink",
    tagline: "Gawa para Mag-detect, Disenyo para Magprotekta",
    chat_scanner: "Chat Scanner",
    scan_history: "Nakaraang Scans",
    statistics: "Istatistika",
    quiz: "Laroang Pagsusulit",
    api_status: "Kalagayan ng API",
    feedback: "Puna",
    account: "Account",
    not_logged_in: "Hindi naka-login",
    login_register: "Login / Rehistro",
    logout: "Logout",
    appearance: "Hitsura",
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
    feedback_title: "Mahalaga ang puna mo",
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

    // === QUIZ TRANSLATIONS ===
    quiz_title: "Cyber Defender",
    quiz_tagline: "Talunin ang phishing attacks. Kumita ng XP. Mag-unlock ng mga badge.",
    quiz_welcome_title: "Maligayang Pagdating, Ahente!",
    quiz_welcome_desc: "Iyong misyon: Tukuyin ang phishing threats at protektahan ang cyberspace. Kumita ng XP, bumuo ng streaks, at mag-unlock ng mga badge.",
    quiz_start_btn: "▶️ Simulan ang Laro",
    quiz_choose_title: "Piliin ang Iyong Hamon",
    quiz_choose_desc: "Pumili ng mode para subukan ang iyong kakayahan:",
    quiz_easy: "Madali",
    quiz_easy_desc: "Matutunan ang mga batayan",
    quiz_medium: "Katamtaman",
    quiz_medium_desc: "Handa ka pa ba?",
    quiz_hard: "Mahirap",
    quiz_hard_desc: "Para lamang sa eksperto",
    quiz_endless: "Walang Hanggan",
    quiz_endless_desc: "Buhay nang matagal hangga't kaya",
    quiz_progress: "Tanong 1",
    quiz_score: "Iskor: 0",
    quiz_level: "Lvl 0",
    quiz_xp: "XP: 0 / 50",
    quiz_streak: "🔥 0 | 🏆 Pinakamataas: 0",
    quiz_timer: "20s",
    quiz_quit: "Tumigil",
    quiz_restart: "Magsimula Muli",
    quiz_result_score: "📊 Iskor:",
    quiz_result_xp: "⭐ XP:",
    quiz_result_badge: "🏅 Badge:",
    quiz_result_best: "🔥 Pinakamataas:",
    quiz_result_play_again: "🔄 Simulan Muli",
    quiz_result_main_menu: "🏠 Main Menu",
  }
};


// --- Language Switcher Logic ---

// Store default text for all translatable elements on first load
const defaultI18n = {};
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    defaultI18n[key] = el.innerHTML;
  });
  // Store default placeholders
  if (window.messageInput) window.messageInput._defaultPlaceholder = window.messageInput.placeholder;
  const feedbackMsg = document.getElementById('feedbackMessage');
  if (feedbackMsg) feedbackMsg._defaultPlaceholder = feedbackMsg.placeholder;
  // Auth modal
  const authTitle = document.getElementById('authTitle');
  if (authTitle) authTitle._defaultText = authTitle.innerText;
  const authBtn = document.querySelector('#authModal button.scan-btn');
  if (authBtn) authBtn._defaultText = authBtn.innerText;
  const authSwitch = document.getElementById('authSwitch');
  if (authSwitch) authSwitch._defaultHTML = authSwitch.innerHTML;
  // Feedback type options
  const feedbackType = document.getElementById('feedbackType');
  if (feedbackType) {
    for (let i = 0; i < feedbackType.options.length; i++) {
      feedbackType.options[i]._defaultText = feedbackType.options[i].text;
    }
  }
  // Feedback buttons
  const submitBtn = document.getElementById('submitFeedback');
  if (submitBtn) submitBtn._defaultText = submitBtn.innerText;
  const clearBtn = document.getElementById('clearFeedback');
  if (clearBtn) clearBtn._defaultText = clearBtn.innerText;
  // Scan button
  if (window.scanBtn) {
    const btnText = scanBtn.querySelector('.btn-text');
    if (btnText) btnText._defaultText = btnText.innerText;
  }
});

function applyTranslations(lang) {
  // Update all elements with data-i18n
  if (lang === 'tl') {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations.tl[key]) {
        el.innerHTML = translations.tl[key];
      }
    });
    if (messageInput && translations.tl.message_placeholder) {
      messageInput.placeholder = translations.tl.message_placeholder;
    }
    const feedbackMsg = document.getElementById('feedbackMessage');
    if (feedbackMsg && translations.tl.feedback_placeholder) {
      feedbackMsg.placeholder = translations.tl.feedback_placeholder;
    }
    const authTitle = document.getElementById('authTitle');
    if (authTitle && translations.tl[authMode]) {
      authTitle.innerText = translations.tl[authMode];
    }
    const authBtn = document.querySelector('#authModal button.scan-btn');
    if (authBtn && translations.tl[authMode]) {
      authBtn.innerText = translations.tl[authMode];
    }
    const authSwitch = document.getElementById('authSwitch');
    if (authSwitch) {
      authSwitch.innerHTML = authMode === "login"
        ? translations.tl.dont_have_account
        : translations.tl.already_have_account;
    }
    const feedbackType = document.getElementById('feedbackType');
    if (feedbackType) {
      feedbackType.options[0].text = translations.tl.suggestion;
      feedbackType.options[1].text = translations.tl.bug;
      feedbackType.options[2].text = translations.tl.question;
    }
    const submitBtn = document.getElementById('submitFeedback');
    if (submitBtn && translations.tl.submit) submitBtn.innerText = translations.tl.submit;
    const clearBtn = document.getElementById('clearFeedback');
    if (clearBtn && translations.tl.clear) clearBtn.innerText = translations.tl.clear;
    if (scanBtn && translations.tl.scan) {
      const btnText = scanBtn.querySelector('.btn-text');
      if (btnText) btnText.innerText = translations.tl.scan;
    }
  } else {
    // Restore all default text and placeholders
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (defaultI18n[key]) {
        el.innerHTML = defaultI18n[key];
      }
    });
    if (messageInput && messageInput._defaultPlaceholder) {
      messageInput.placeholder = messageInput._defaultPlaceholder;
    }
    const feedbackMsg = document.getElementById('feedbackMessage');
    if (feedbackMsg && feedbackMsg._defaultPlaceholder) {
      feedbackMsg.placeholder = feedbackMsg._defaultPlaceholder;
    }
    const authTitle = document.getElementById('authTitle');
    if (authTitle && authTitle._defaultText) {
      authTitle.innerText = authTitle._defaultText;
    }
    const authBtn = document.querySelector('#authModal button.scan-btn');
    if (authBtn && authBtn._defaultText) {
      authBtn.innerText = authBtn._defaultText;
    }
    const authSwitch = document.getElementById('authSwitch');
    if (authSwitch && authSwitch._defaultHTML) {
      authSwitch.innerHTML = authSwitch._defaultHTML;
    }
    const feedbackType = document.getElementById('feedbackType');
    if (feedbackType) {
      for (let i = 0; i < feedbackType.options.length; i++) {
        if (feedbackType.options[i]._defaultText) {
          feedbackType.options[i].text = feedbackType.options[i]._defaultText;
        }
      }
    }
    const submitBtn = document.getElementById('submitFeedback');
    if (submitBtn && submitBtn._defaultText) submitBtn.innerText = submitBtn._defaultText;
    const clearBtn = document.getElementById('clearFeedback');
    if (clearBtn && clearBtn._defaultText) clearBtn.innerText = clearBtn._defaultText;
    if (scanBtn) {
      const btnText = scanBtn.querySelector('.btn-text');
      if (btnText && btnText._defaultText) btnText.innerText = btnText._defaultText;
    }
  }
}


// Listen for language change
const langSelect = document.getElementById('languageSelect');
if (langSelect) {
  langSelect.addEventListener('change', function() {
    const lang = this.value;
    localStorage.setItem('surLinkLang', lang);
    window.__quizInit = false; // Reset quiz init so it re-initializes after reload
    window.location.reload();
  });
}

// On load, set language from localStorage or default
window.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('surLinkLang') || 'en';
  const langSelect = document.getElementById('languageSelect');
  if (langSelect) langSelect.value = lang;
  applyTranslations(lang);
});
