// onboarding.js — stable onboarding flow
window.startOnboarding = function () {
  const q = (sel, r = document) => r.querySelector(sel);
  const WAIT = ms => new Promise(res => setTimeout(res, ms));
  const MAX_Z = 2147483647;

  // Remove old root if any
  const prev = document.getElementById('onb-root');
  if (prev) prev.remove();

  // Root container
  const root = document.createElement('div');
  root.id = 'onb-root';
  root.className = 'onb-root';
  root.style.position = 'fixed';
  root.style.inset = '0';
  root.style.zIndex = String(MAX_Z);
  root.style.pointerEvents = 'auto';
  document.body.appendChild(root);

  // UI
  root.innerHTML = `
    <div class="onb-dim"></div>

    <div class="onb-welcome">
      <div class="head">Welcome to SûrLink 👋</div>
      <div class="body">
        <p>Would you like a quick guided tour of the phishing scanner?</p>
      </div>
      <div class="cta">
        <button class="onb-btn js-no">No, I'm familiar</button>
        <button class="onb-btn primary js-yes">Yes, I'm new here</button>
      </div>
    </div>

    <div class="onb-bar" style="display:none;">
      <div class="progress"><span id="onb-progress"></span></div>
      <div class="content">
        <div class="left">
          <div class="title" id="onb-title"></div>
          <div class="desc" id="onb-desc"></div>
        </div>
        <div class="controls">
          <button class="onb-btn js-skip">Skip</button>
          <button class="onb-btn js-back">Back</button>
          <button class="onb-btn primary js-next">Next</button>
        </div>
      </div>
    </div>
  `;

  // Elements
  const welcome = q('.onb-welcome', root);
  const bar = q('.onb-bar', root);
  const titleEl = q('#onb-title', root);
  const descEl = q('#onb-desc', root);
  const btnYes = q('.js-yes', root);
  const btnNo = q('.js-no', root);
  const btnSkip = q('.js-skip', root);
  const btnBack = q('.js-back', root);
  const btnNext = q('.js-next', root);
  const progressEl = q('#onb-progress', root);

  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('backdrop');
  const menuToggle = document.getElementById('menuToggle');

  const initial = {
    wasOpenMobile: !!(sidebar && sidebar.classList.contains('open')),
    wasCollapsedDesktop: !!(sidebar && sidebar.classList.contains('collapsed')),
  };
  const isMobile = () => window.matchMedia('(max-width:1024px)').matches;

  function openSidebar() {
    if (!sidebar) return;
    if (isMobile()) {
      sidebar.classList.add('open');
      if (backdrop) { backdrop.hidden = false; backdrop.style.pointerEvents = 'auto'; }
      document.body.classList.add('no-scroll');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    } else {
      sidebar.classList.remove('collapsed');
    }
  }
  function restoreSidebarOriginal() {
    if (!sidebar) return;
    if (isMobile()) {
      initial.wasOpenMobile ? sidebar.classList.add('open') : sidebar.classList.remove('open');
      if (!initial.wasOpenMobile && backdrop) backdrop.hidden = true;
      document.body.classList.remove('no-scroll');
    } else {
      initial.wasCollapsedDesktop ? sidebar.classList.add('collapsed') : sidebar.classList.remove('collapsed');
    }
    if (menuToggle) menuToggle.setAttribute('aria-expanded', initial.wasOpenMobile ? 'true' : 'false');
  }

  function clearHighlights() {
    document.querySelectorAll('.onb-highlight').forEach(el => el.classList.remove('onb-highlight'));
  }
  function highlightNav(section) {
    clearHighlights();
    const btn = document.querySelector(`.nav-btn[data-section="${section}"]`);
    if (btn) {
      btn.classList.add('onb-highlight');
      updateDim();
      return true;
    }
    updateDim();
    return false;
  }
  function highlightSection(section) {
    clearHighlights();
    const sec = document.querySelector(`#${section}Section, #${section}MainSection`);
    if (sec) sec.classList.add('onb-highlight');
    updateDim();
  }

  function updateDim() {
    const dim = document.querySelector('.onb-dim');
    const highlighted = document.querySelector('.onb-highlight');

    if (!dim) return;

    if (highlighted) {
      const rect = highlighted.getBoundingClientRect();
      const padding = 8;

      const top = rect.top - padding;
      const left = rect.left - padding;
      const right = rect.right + padding;
      const bottom = rect.bottom + padding;

      // Polygon that dims everything except the highlighted element
      dim.style.clipPath = `polygon(
        0 0, 100% 0, 100% 100%, 0 100%, 0 0,
        0 ${top}px, ${left}px ${top}px, ${left}px ${bottom}px, ${right}px ${bottom}px, ${right}px ${top}px, 0 ${top}px
      )`;
    } else {
      dim.style.clipPath = 'none';
    }
  }

  // Update on resize
  window.addEventListener('resize', updateDim);

    // Track movement continuously
  function animateDim() {
    updateDim();
    requestAnimationFrame(animateDim);
  }
  animateDim();

  const steps = [
    { title: 'Chat Scanner', desc: 'Open the Chat Scanner from the sidebar.', section: 'chat', mode: 'btn' },
    { title: 'Chat Area', desc: 'Scan suspicious messages here.', section: 'chat', mode: 'sec' },
    { title: 'History', desc: 'Access your previous scans.', section: 'history', mode: 'btn' },
    { title: 'History Area', desc: 'View logs of past scans.', section: 'history', mode: 'sec' },
    { title: 'Statistics', desc: 'Check phishing statistics.', section: 'stats', mode: 'btn' },
    { title: 'Statistics Area', desc: 'Charts and trends appear here.', section: 'stats', mode: 'sec' },
    { title: 'Quiz', desc: 'Take a phishing awareness quiz.', section: 'quiz', mode: 'btn' },
    { title: 'Quiz Area', desc: 'Practice spotting phishing attempts.', section: 'quiz', mode: 'sec' },
    { title: 'API Status', desc: 'Check the current status of SûrLink services.', section: 'status', mode: 'btn' },
    { title: 'API Status Area', desc: 'See live API status updates here.', section: 'status', mode: 'sec' },
    { title: 'Feedback', desc: 'Send us your thoughts.', section: 'feedback', mode: 'btn' },
    { title: 'Feedback Area', desc: 'Share suggestions here.', section: 'feedback', mode: 'sec' },
    { title: 'All Set!', desc: '🎉 Thank you for joining us — enjoy using SûrLink!', section: null, mode: 'end' }
  ];

  let index = -1;

  async function showStep(i) {
    if (i < 0 || i >= steps.length) return finish();
    index = i;
    const step = steps[i];

    clearHighlights();

    if (step.mode === 'btn') {
      openSidebar();
      await WAIT(150);
      highlightNav(step.section);
    } else if (step.mode === 'sec') {
      if (typeof window.showSection === 'function') window.showSection(step.section);
      await WAIT(250);
      highlightSection(step.section);
    }

    // Title + Desc
    titleEl.textContent = step.title;
    descEl.textContent = step.desc;

    // Progress bar
    if (progressEl) {
      progressEl.style.width = ((i + 1) / steps.length * 100) + "%";
    }

    // Buttons
    btnBack.disabled = index === 0;
    btnNext.textContent = index === steps.length - 1 ? 'Finish' : 'Next';
  }

  function start() {
    welcome.style.display = 'none';
    bar.style.display = 'flex';
    showStep(0);
  }

function finish() {
  clearHighlights();
  restoreSidebarOriginal();

  // Go back to Chat section before closing
  if (typeof window.showSection === 'function') {
    window.showSection('chat');
  } else {
    // fallback: simulate clicking Chat nav button
    const chatBtn = document.querySelector('.nav-btn[data-section="chat"]');
    if (chatBtn) chatBtn.click();
  }

  root.remove();
}

  // Bind events
  btnYes.onclick = start;
  btnNo.onclick = finish;
  btnSkip.onclick = finish;
  btnNext.onclick = () => index >= steps.length - 1 ? finish() : showStep(index + 1);
  btnBack.onclick = () => showStep(index - 1);
};