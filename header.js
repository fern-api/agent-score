(function() {
  'use strict';

  // Detect if we're on the home page
  var path = window.location.pathname;
  var isHome = path === '/' || path.endsWith('/index.html') || path.endsWith('/index.htm') || path === '';
  var prefix = isHome ? '' : 'index.html';

  // Build nav HTML
  var navHTML = '<div class="container">' +
    '<a href="' + (isHome ? '#' : 'index.html') + '" class="nav-logo">' +
      '<span class="nav-cursor">&#9610;</span>AGENT SCORE' +
    '</a>' +
    '<div class="nav-tabs">' +
      '<a href="' + prefix + '#leaderboard" class="nav-tab">Leaderboard</a>' +
      '<a href="' + prefix + '#methodology" class="nav-tab">Methodology</a>' +
    '</div>' +
    '<div class="nav-actions">' +
      '<a href="master-plan.html" class="btn-outline"><span class="btn-full">Read brief</span><span class="btn-short">Brief</span></a>' +
      '<a href="' + prefix + '#hero-checker" class="btn-primary nav-cta"><span class="btn-full">Check your score</span><span class="btn-short">Score</span></a>' +
      '<div class="theme-dropdown" id="themeDropdown">' +
        '<button class="theme-dropdown-btn" id="themeBtn" aria-label="Toggle theme">' +
          '<svg class="theme-icon" id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>' +
            '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>' +
            '<line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>' +
            '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>' +
          '</svg>' +
        '</button>' +
        '<div class="theme-dropdown-menu" id="themeMenu">' +
          '<button class="theme-option" data-theme="system">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="0"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' +
            'System' +
          '</button>' +
          '<button class="theme-option" data-theme="light">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' +
            'Light' +
          '</button>' +
          '<button class="theme-option" data-theme="dark">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
            'Dark' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  // Inject into the navbar element
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.innerHTML = navHTML;
  }

  // ===== THEME TOGGLE =====
  var STORAGE_KEY = 'agent-score-theme';
  var root = document.documentElement;
  var themeBtn = document.getElementById('themeBtn');
  var themeMenu = document.getElementById('themeMenu');
  var themeIcon = document.getElementById('themeIcon');
  var themeOptions = document.querySelectorAll('.theme-option');

  var themeIcons = {
    system: '<rect x="2" y="3" width="20" height="14" rx="0"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    light: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    dark: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
  };

  function getStoredTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch(e) { return null; }
  }

  function setStoredTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch(e) {}
  }

  function applyTheme(theme) {
    root.removeAttribute('data-theme');
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    themeOptions.forEach(function(opt) {
      opt.classList.toggle('active', opt.getAttribute('data-theme') === theme);
    });
  }

  function updateThemeIcon(theme) {
    if (themeIcon) themeIcon.innerHTML = themeIcons[theme] || themeIcons.system;
  }

  // Initialize
  var storedTheme = getStoredTheme();
  var initialTheme = storedTheme || 'system';
  applyTheme(initialTheme);
  updateThemeIcon(initialTheme);

  // Dropdown toggle
  if (themeBtn) {
    themeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      themeMenu.classList.toggle('open');
    });
  }

  document.addEventListener('click', function() {
    if (themeMenu) themeMenu.classList.remove('open');
  });

  if (themeMenu) {
    themeMenu.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  themeOptions.forEach(function(opt) {
    opt.addEventListener('click', function() {
      var theme = opt.getAttribute('data-theme');
      applyTheme(theme);
      setStoredTheme(theme);
      updateThemeIcon(theme);
      if (themeMenu) themeMenu.classList.remove('open');
    });
  });

  // Navbar scroll glow
  if (navbar) {
    window.addEventListener('scroll', function() {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }
})();
