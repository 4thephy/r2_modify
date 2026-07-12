document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. Theme Controller & Mode Synchronizer
  // ==========================================
  const themeMenuBtn = document.getElementById('themeMenuBtn');
  const themeMenu = document.getElementById('themeMenu');
  const themeModeRadios = document.querySelectorAll('input[name="theme-mode"]');
  const themeStatus = document.getElementById('themeStatus');
  const themeToggleBtnInner = document.getElementById('themeToggleBtnInner');
  const themeManualToggleContainer = document.getElementById('themeManualToggleContainer');

  // Helper to remove all theme classes
  const themeClasses = ['dark-theme', 'light-theme', 'spring-theme', 'summer-theme', 'autumn-theme', 'winter-theme'];
  function clearAllThemes() {
    document.body.classList.remove(...themeClasses);
  }

  // Set initial mode and values from localStorage
  let savedMode = localStorage.getItem('theme-mode') || 'manual';
  let savedTheme = localStorage.getItem('theme') || 'dark'; // for manual mode

  // Update radio buttons check state
  themeModeRadios.forEach(radio => {
    if (radio.value === savedMode) {
      radio.checked = true;
    }
  });

  // Handle setting menu toggle
  themeMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!themeMenu.contains(e.target) && e.target !== themeMenuBtn) {
      themeMenu.classList.add('hidden');
    }
  });

  // Apply theme based on mode
  async function applyModeTheme() {
    clearAllThemes();
    
    if (savedMode === 'manual') {
      themeManualToggleContainer.classList.remove('hidden');
      if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeStatus.textContent = '현재 테마: 라이트 모드 (수동)';
      } else {
        document.body.classList.add('dark-theme');
        themeStatus.textContent = '현재 테마: 다크 모드 (수동)';
      }
    } 
    else if (savedMode === 'weather') {
      themeManualToggleContainer.classList.add('hidden');
      themeStatus.textContent = '날씨 정보 조회 중...';
      
      // Get location & weather
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
          },
          () => {
            // Default to Seoul (37.5665, 126.9780) if geo blocked
            fetchWeather(37.5665, 126.9780);
          }
        );
      } else {
        fetchWeather(37.5665, 126.9780);
      }
    } 
    else if (savedMode === 'season') {
      themeManualToggleContainer.classList.add('hidden');
      applySeasonTheme();
    }
  }

  // Fetch weather data from open-meteo
  async function fetchWeather(lat, lon) {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await response.json();
      const code = data.current_weather.weathercode;
      const temp = data.current_weather.temperature;
      
      // WMO Weather interpretation
      let isCloudyOrRainy = code >= 1;
      let weatherDesc = "맑음";
      
      if (code === 0) weatherDesc = "맑음 ☀️";
      else if (code === 1 || code === 2 || code === 3) weatherDesc = "흐림 ☁️";
      else if (code >= 51 && code <= 67) weatherDesc = "비 🌧️";
      else if (code >= 71 && code <= 77) weatherDesc = "눈 ❄️";
      else if (code >= 80 && code <= 82) weatherDesc = "소나기 🌦️";
      else if (code >= 95) weatherDesc = "뇌우 ⛈️";
      else weatherDesc = "흐림 ☁️";

      clearAllThemes();
      if (isCloudyOrRainy) {
        document.body.classList.add('light-theme');
        themeStatus.textContent = `날씨: ${weatherDesc} (${temp}°C) → 라이트 테마 자동 적용`;
      } else {
        document.body.classList.add('dark-theme');
        themeStatus.textContent = `날씨: ${weatherDesc} (${temp}°C) → 로열 다크 테마 자동 적용`;
      }
    } catch (err) {
      console.error("Failed to fetch weather", err);
      // Fallback: assume sunny (dark theme)
      document.body.classList.add('dark-theme');
      themeStatus.textContent = '날씨 정보 로드 실패 → 다크 테마 적용';
    }
  }

  // Apply season theme based on month
  function applySeasonTheme() {
    const month = new Date().getMonth() + 1; // 1-12
    let season = "";
    let themeClass = "";

    if (month >= 3 && month <= 5) {
      season = "봄 🌸";
      themeClass = "spring-theme";
    } else if (month >= 6 && month <= 8) {
      season = "여름 🌿";
      themeClass = "summer-theme";
    } else if (month >= 9 && month <= 11) {
      season = "가을 🍁";
      themeClass = "autumn-theme";
    } else {
      season = "겨울 ❄️";
      themeClass = "winter-theme";
    }

    clearAllThemes();
    document.body.classList.add(themeClass);
    themeStatus.textContent = `현재 월: ${month}월 (${season}) → 계절 테마 적용`;
  }

  // Event listener for mode change
  themeModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      savedMode = e.target.value;
      localStorage.setItem('theme-mode', savedMode);
      applyModeTheme();
    });
  });

  // Manual Toggle Button
  themeToggleBtnInner.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
      clearAllThemes();
      document.body.classList.add('light-theme');
      savedTheme = 'light';
      localStorage.setItem('theme', 'light');
      themeStatus.textContent = '현재 테마: 라이트 모드 (수동)';
    } else {
      clearAllThemes();
      document.body.classList.add('dark-theme');
      savedTheme = 'dark';
      localStorage.setItem('theme', 'dark');
      themeStatus.textContent = '현재 테마: 다크 모드 (수동)';
    }
  });

  // Run on start
  applyModeTheme();


  // ==========================================
  // 2. Portal DOM Rendering & Navigation
  // ==========================================
  const sidebarNav = document.getElementById('sidebarNav');
  const dashboardHome = document.getElementById('dashboardHome');
  const figureDetailView = document.getElementById('figureDetailView');
  const backToHomeBtn = document.getElementById('backToHomeBtn');
  const logoHomeBtn = document.getElementById('logoHomeBtn');
  
  // Navigation elements
  const detailEraName = document.getElementById('detailEraName');
  const detailName = document.getElementById('detailName');
  const detailOneLiner = document.getElementById('detailOneLiner');
  const detailMeta = document.getElementById('detailMeta');
  const detailRoleIcon = document.getElementById('detailRoleIcon');
  const detailStoryContainer = document.getElementById('detailStoryContainer');
  const detailInfobox = document.getElementById('detailInfobox');
  const detailAchievementsContainer = document.getElementById('detailAchievementsContainer');
  const detailGalleryShowcase = document.getElementById('detailGalleryShowcase');
  const detailGalleryGrid = document.getElementById('detailGalleryGrid');
  const detailAnecdoteContainer = document.getElementById('detailAnecdoteContainer');
  const detailWorksGrid = document.getElementById('detailWorksGrid');
  const detailTabBtns = document.querySelectorAll('.detail-tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  // Pagination
  const prevFigureBtn = document.getElementById('prevFigureBtn');
  const nextFigureBtn = document.getElementById('nextFigureBtn');

  // Sub-Tab Switcher Logic
  function initDetailTabs() {
    detailTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        switchDetailTab(tabId);
      });
    });
  }

  function switchDetailTab(tabId) {
    // Update active class on tab buttons
    detailTabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update active class on panels
    tabPanels.forEach(panel => {
      if (panel.id === `panel-${tabId}`) {
        panel.classList.remove('hidden');
        panel.classList.add('active');
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('active');
      }
    });
  }

  initDetailTabs();

  // Group figures by Era
  const eras = [
    "고조선 / 삼국 시대",
    "고려 시대",
    "조선 시대",
    "근대 / 일제 강점기 / 현대"
  ];

  let currentFigureId = null;

  // Render Sidebar lists
  function renderSidebar() {
    sidebarNav.innerHTML = '';
    
    eras.forEach(era => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'sidebar-group';
      
      const titleDiv = document.createElement('div');
      titleDiv.className = 'sidebar-group-title';
      titleDiv.textContent = era;
      groupDiv.appendChild(titleDiv);
      
      const ul = document.createElement('ul');
      ul.className = 'toc-list';
      
      // Filter figures in this era
      const filtered = figuresData.filter(f => f.era === era);
      filtered.forEach(figure => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${figure.id}`;
        a.className = 'toc-link';
        a.setAttribute('data-id', figure.id);
        a.textContent = figure.name;
        
        a.addEventListener('click', (e) => {
          e.preventDefault();
          selectFigure(figure.id);
        });
        
        li.appendChild(a);
        ul.appendChild(li);
      });
      
      groupDiv.appendChild(ul);
      sidebarNav.appendChild(groupDiv);
    });
  }

  // Helper to select and display a figure
  function selectFigure(id) {
    currentFigureId = id;
    
    // Highlight sidebar links
    const links = document.querySelectorAll('.toc-link');
    links.forEach(link => {
      if (link.getAttribute('data-id') === id) {
        link.classList.add('active');
        // Scroll sidebar to this link if necessary
        try {
          link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (err) {
          link.scrollIntoView();
        }
      } else {
        link.classList.remove('active');
      }
    });

    renderFigureDetail(id);
    location.hash = `#${id}`;
  }

  // Get Badge Icon and background color based on role
  function getRoleDetails(role) {
    switch (role) {
      case 'king':
        return { icon: '👑', color: '#e2b857', bg: 'rgba(226, 184, 87, 0.15)' };
      case 'general':
        return { icon: '⚔️', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'scholar':
        return { icon: '📚', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'artist':
        return { icon: '🎨', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'monk':
        return { icon: '📿', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
      case 'patriot':
        return { icon: '🇰🇷', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { icon: '👤', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };
    }
  }

  // Render detail view DOM
  function renderFigureDetail(id) {
    const figure = figuresData.find(f => f.id === id);
    if (!figure) return;

    // Toggle views
    dashboardHome.classList.add('hidden');
    figureDetailView.classList.remove('hidden');
    
    // Smooth scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset active sub-tab back to 'story'
    switchDetailTab('story');

    // Set header meta
    detailEraName.textContent = figure.era;
    detailName.textContent = figure.name;
    detailOneLiner.textContent = figure.oneLiner;
    detailMeta.innerHTML = `<span>살았던 시기: <strong>${figure.birthDeath}</strong></span>`;
    
    // Set role badge
    const roleDetails = getRoleDetails(figure.role);
    detailRoleIcon.textContent = roleDetails.icon;
    detailRoleIcon.style.backgroundColor = roleDetails.color;

    // Story paragraphs
    detailStoryContainer.innerHTML = '';
    // Format bold text or simple markdown inside paragraph
    const formattedStory = figure.detailedStory.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const p = document.createElement('p');
    p.className = 'lead-text font-serif';
    p.innerHTML = formattedStory;
    detailStoryContainer.appendChild(p);

    // Infobox Rendering
    detailInfobox.innerHTML = '';
    
    const infoHeader = document.createElement('div');
    infoHeader.className = 'infobox-header';
    infoHeader.innerHTML = `
      <div class="infobox-title">${figure.name}</div>
      <div class="infobox-subtitle">${figure.oneLiner}</div>
    `;
    detailInfobox.appendChild(infoHeader);

    const infoImgContainer = document.createElement('div');
    infoImgContainer.className = 'infobox-image-container';
    if (figure.images && figure.images.portrait) {
      infoImgContainer.innerHTML = `
        <img src="${figure.images.portrait}" alt="${figure.name}" class="infobox-image">
      `;
    } else {
      // Big role badge fallback
      infoImgContainer.innerHTML = `
        <div style="font-size: 5rem; padding: 2rem; background: ${roleDetails.bg}; border-radius: 12px; display: inline-block; color: ${roleDetails.color}; border: 1px dashed ${roleDetails.color};">
          ${roleDetails.icon}
        </div>
        <div class="image-caption" style="margin-top: 10px;">${figure.name}을(를) 기리는 상징 배지</div>
      `;
    }
    detailInfobox.appendChild(infoImgContainer);

    const infoTable = document.createElement('table');
    infoTable.className = 'infobox-table';
    const tbody = document.createElement('tbody');
    
    const sectionRow = document.createElement('tr');
    sectionRow.className = 'infobox-section-title';
    sectionRow.innerHTML = `<td colspan="2">인물 정보</td>`;
    tbody.appendChild(sectionRow);

    // Add info records
    for (const [key, value] of Object.entries(figure.infobox)) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<th>${key}</th><td>${value}</td>`;
      tbody.appendChild(tr);
    }
    infoTable.appendChild(tbody);
    detailInfobox.appendChild(infoTable);

    // Achievements list
    detailAchievementsContainer.innerHTML = '<h3>주요 업적</h3>';
    const achUl = document.createElement('ul');
    achUl.className = 'bullet-list';
    figure.achievements.forEach(ach => {
      const li = document.createElement('li');
      li.textContent = ach;
      achUl.appendChild(li);
    });
    detailAchievementsContainer.appendChild(achUl);

    // Anecdote card box
    const anecdoteTabBtn = document.querySelector('.detail-tab-btn[data-tab="anecdote"]');
    if (figure.anecdote) {
      anecdoteTabBtn.style.display = 'inline-block';
      detailAnecdoteContainer.innerHTML = `
        <div class="anecdote-header font-serif">💡 ${figure.anecdote.title}</div>
        <div class="anecdote-body font-serif">${figure.anecdote.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
        <div class="anecdote-source">출처: ${figure.anecdote.source}</div>
      `;
    } else {
      anecdoteTabBtn.style.display = 'none';
    }

    // Works list
    const worksTabBtn = document.querySelector('.detail-tab-btn[data-tab="works"]');
    if (figure.works && figure.works.length > 0) {
      worksTabBtn.style.display = 'inline-block';
      detailWorksGrid.innerHTML = '';
      figure.works.forEach(work => {
        const card = document.createElement('div');
        card.className = 'work-card';
        card.innerHTML = `
          <h4 class="work-card-title">${work.title}</h4>
          <p class="work-card-desc">${work.desc}</p>
        `;
        detailWorksGrid.appendChild(card);
      });
    } else {
      worksTabBtn.style.display = 'none';
    }

    // Gallery (If available)
    const galleryTabBtn = document.querySelector('.detail-tab-btn[data-tab="gallery"]');
    if (figure.images && figure.images.gallery) {
      galleryTabBtn.style.display = 'inline-block';
      detailGalleryGrid.innerHTML = '';
      
      figure.images.gallery.forEach(img => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
          <img src="${img.src}" alt="${img.caption}">
          <span class="gallery-caption">${img.caption}</span>
        `;
        detailGalleryGrid.appendChild(item);
      });
    } else {
      galleryTabBtn.style.display = 'none';
    }
  }

  // Go back to home state
  function showHomeDashboard() {
    currentFigureId = null;
    dashboardHome.classList.remove('hidden');
    figureDetailView.classList.add('hidden');
    location.hash = '';
    
    // Clear active classes in sidebar
    const links = document.querySelectorAll('.toc-link');
    links.forEach(l => l.classList.remove('active'));
    
    // Roll a new random quiz question on home load
    loadRandomQuiz();
  }

  backToHomeBtn.addEventListener('click', showHomeDashboard);
  logoHomeBtn.addEventListener('click', showHomeDashboard);

  // Era Card Clicks
  const eraCards = document.querySelectorAll('.era-card');
  eraCards.forEach(card => {
    card.addEventListener('click', () => {
      const index = parseInt(card.getAttribute('data-id') || card.getAttribute('data-era-index'));
      
      // Auto select the first figure of each era
      let targetId = "dangun"; // Default
      if (index === 1) targetId = "dangun";
      else if (index === 2) targetId = "wanggeon";
      else if (index === 3) targetId = "sejong";
      else if (index === 4) targetId = "anjunggeun";
      
      selectFigure(targetId);
    });
  });

  // Pagination (Next / Prev)
  prevFigureBtn.addEventListener('click', () => {
    const currentIndex = figuresData.findIndex(f => f.id === currentFigureId);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = figuresData.length - 1; // Wrap to end
    selectFigure(figuresData[prevIndex].id);
  });

  nextFigureBtn.addEventListener('click', () => {
    const currentIndex = figuresData.findIndex(f => f.id === currentFigureId);
    let nextIndex = (currentIndex + 1) % figuresData.length; // Wrap to start
    selectFigure(figuresData[nextIndex].id);
  });


  // ==========================================
  // 3. Search Autocomplete & Filtering
  // ==========================================
  const searchInput = document.getElementById('searchInput');
  const searchSuggestions = document.getElementById('searchSuggestions');
  const searchBtn = document.getElementById('searchBtn');
  const searchClearBtn = document.getElementById('searchClearBtn');

  // Input changes
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    
    if (!val) {
      searchSuggestions.classList.add('hidden');
      searchClearBtn.classList.add('hidden');
      return;
    }

    searchClearBtn.classList.remove('hidden');

    // Filter matching figures by name or era
    const matches = figuresData.filter(f => f.name.toLowerCase().includes(val) || f.oneLiner.toLowerCase().includes(val));
    
    if (matches.length > 0) {
      searchSuggestions.innerHTML = '';
      matches.forEach(m => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.setAttribute('data-id', m.id);
        div.innerHTML = `
          <span><strong>${m.name}</strong></span>
          <span class="sug-era">${m.oneLiner}</span>
        `;
        
        div.addEventListener('click', () => {
          searchInput.value = m.name;
          searchSuggestions.classList.add('hidden');
          selectFigure(m.id);
        });
        
        searchSuggestions.appendChild(div);
      });
      searchSuggestions.classList.remove('hidden');
    } else {
      searchSuggestions.classList.add('hidden');
    }
  });

  // Hide suggestions when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      searchSuggestions.classList.add('hidden');
    }
  });

  // Clear button click
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchSuggestions.classList.add('hidden');
    searchClearBtn.classList.add('hidden');
    searchInput.focus();
  });

  // Handle Search Trigger (Button or Enter key)
  function triggerSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    // Find direct or partial name match
    const found = figuresData.find(f => f.name.toLowerCase() === query) || 
                  figuresData.find(f => f.name.toLowerCase().includes(query)) ||
                  figuresData.find(f => f.oneLiner.toLowerCase().includes(query));

    if (found) {
      selectFigure(found.id);
      searchInput.value = found.name;
      searchSuggestions.classList.add('hidden');
    } else {
      alert(`'${query}'에 해당하는 위인을 찾을 수 없습니다. 철자를 확인해 보세요!`);
    }
  }

  searchBtn.addEventListener('click', triggerSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch();
    }
  });


  // ==========================================
  // 4. Interactive Quiz Widget
  // ==========================================
  const quizHint = document.getElementById('quizHint');
  const quizAnswerBtn = document.getElementById('quizAnswerBtn');
  const quizAnswer = document.getElementById('quizAnswer');

  let currentQuizFigure = null;

  function loadRandomQuiz() {
    // Hide answer on load
    quizAnswer.classList.add('hidden');
    quizAnswerBtn.textContent = '정답 확인하기';
    
    // Pick a random figure
    const randomIndex = Math.floor(Math.random() * figuresData.length);
    currentQuizFigure = figuresData[randomIndex];
    
    // Set hint as their oneLiner
    quizHint.textContent = `"${currentQuizFigure.oneLiner}에 해당하는 자랑스러운 우리나라의 위인은 누구일까요?"`;
  }

  quizAnswerBtn.addEventListener('click', () => {
    if (quizAnswer.classList.contains('hidden')) {
      quizAnswer.classList.remove('hidden');
      quizAnswer.innerHTML = `정답은 바로 <strong>'${currentQuizFigure.name}'</strong>입니다!<br><small style="color: var(--text-secondary); display: block; margin-top: 5px;">현재 페이지 상단의 검색창이나 목장에서 클릭해서 이야기를 확인해 보세요!</small>`;
      quizAnswerBtn.textContent = '퀴즈 닫기';
    } else {
      quizAnswer.classList.add('hidden');
      quizAnswerBtn.textContent = '정답 확인하기';
    }
  });


  // ==========================================
  // 4. 도전! 역사 골든벨 게임 엔진 (Golden Bell Game Engine)
  // ==========================================
  // ==========================================
  // 4. 도전! 역사 골든벨 게임 엔진 (Golden Bell Game Engine)
  // ==========================================
  const playGoldenBellBtn = document.getElementById('playGoldenBellBtn');
  const goldenBellGameView = document.getElementById('goldenBellGameView');
  const gbBackToHomeBtn = document.getElementById('gbBackToHomeBtn');
  const gbStartScreen = document.getElementById('gbStartScreen');
  const gbStartGameInnerBtn = document.getElementById('gbStartGameInnerBtn');
  const gbPlayScreen = document.getElementById('gbPlayScreen');
  const gbRoundIndicator = document.getElementById('gbRoundIndicator');
  const gbHeartsContainer = document.getElementById('gbHeartsContainer');
  const gbTimerBar = document.getElementById('gbTimerBar');
  const gbTimerText = document.getElementById('gbTimerText');
  const gbQuestionHint = document.getElementById('gbQuestionHint');
  const gbOptionsGrid = document.getElementById('gbOptionsGrid');
  const gbFeedbackOverlay = document.getElementById('gbFeedbackOverlay');
  const gbFeedbackText = document.getElementById('gbFeedbackText');
  const gbResultScreen = document.getElementById('gbResultScreen');
  const gbResultIcon = document.getElementById('gbResultIcon');
  const gbResultTitle = document.getElementById('gbResultTitle');
  const gbResultDesc = document.getElementById('gbResultDesc');
  const gbRewardBox = document.getElementById('gbRewardBox');
  const gbRetryBtn = document.getElementById('gbRetryBtn');
  const gbResultHomeBtn = document.getElementById('gbResultHomeBtn');

  // New Upgrade Inputs
  const gbRegRegion = document.getElementById('gbRegRegion');
  const gbRegSchool = document.getElementById('gbRegSchool');
  const gbRegGrade = document.getElementById('gbRegGrade');
  const gbRegName = document.getElementById('gbRegName');
  const gbLeaderboardStartBody = document.getElementById('gbLeaderboardStartBody');
  const gbLeaderboardResultBody = document.getElementById('gbLeaderboardResultBody');
  const gbRevivalOverlay = document.getElementById('gbRevivalOverlay');
  const gbRevivalQuestionHint = document.getElementById('gbRevivalQuestionHint');
  const gbRevivalOptionsGrid = document.getElementById('gbRevivalOptionsGrid');

  // Game state
  let gbRound = 1;
  let gbLives = 3;
  let gbTimeLeft = 15;
  let gbTimerInterval = null;
  let gbCurrentTarget = null;
  let gbQuizPool = [];
  let gbRevivalUsed = false;
  let gbStudentInfo = { region: '', school: '', grade: '', name: '' };

  function showGoldenBellPortal() {
    // Hide other views
    dashboardHome.classList.add('hidden');
    figureDetailView.classList.add('hidden');
    goldenBellGameView.classList.remove('hidden');

    // Deselect sidebar links
    const links = document.querySelectorAll('.toc-link');
    links.forEach(l => l.classList.remove('active'));
    currentFigureId = null;

    // Reset to start screen
    gbStartScreen.classList.remove('hidden');
    gbPlayScreen.classList.add('hidden');
    gbResultScreen.classList.add('hidden');
    gbFeedbackOverlay.classList.add('hidden');
    gbRevivalOverlay.classList.add('hidden');

    if (gbTimerInterval) clearInterval(gbTimerInterval);
    loadLeaderboards();
  }

  function startGoldenBellGame() {
    const region = gbRegRegion.value;
    const school = gbRegSchool.value.trim();
    const grade = gbRegGrade.value;
    const name = gbRegName.value.trim();

    if (!region || !school || !grade || !name) {
      alert("모든 도전자 정보(지역, 학교명, 학년, 이름)를 바르게 입력해 주세요!");
      return;
    }

    gbStudentInfo = { region, school, grade, name };
    gbRound = 1;
    gbLives = 3;
    gbQuizPool = [...figuresData];
    gbRevivalUsed = false;

    gbStartScreen.classList.add('hidden');
    gbResultScreen.classList.add('hidden');
    gbPlayScreen.classList.remove('hidden');

    loadGbQuestion();
  }

  function loadGbQuestion() {
    if (gbLives <= 0) {
      // Check if revival is possible at round 6 or 10
      if ((gbRound === 6 || gbRound === 10) && !gbRevivalUsed) {
        triggerGbRevival();
        return;
      }
      endGbGame(false);
      return;
    }
    if (gbRound > 10) {
      endGbGame(true);
      return;
    }

    // Update Round & Lives UI
    gbRoundIndicator.textContent = `ROUND ${gbRound} / 10`;
    gbHeartsContainer.innerHTML = '💖'.repeat(gbLives) + '🖤'.repeat(3 - gbLives);

    // Pick target figure randomly
    const randomIndex = Math.floor(Math.random() * gbQuizPool.length);
    gbCurrentTarget = gbQuizPool.splice(randomIndex, 1)[0];

    // Progressive Hint Difficulty Scaling
    let chosenHint = "";
    if (gbRound <= 3) {
      // Easy: one-liner clue
      chosenHint = gbCurrentTarget.oneLiner;
    } else if (gbRound <= 7) {
      // Medium: pick a random achievement
      const achs = gbCurrentTarget.achievements;
      chosenHint = achs[Math.floor(Math.random() * achs.length)];
    } else {
      // Hard: pick a random full sentence from their detailedStory or anecdote
      const cleanStory = gbCurrentTarget.detailedStory.replace(/\*\*/g, '');
      const sentences = cleanStory.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 12);
      chosenHint = sentences.length > 0 ? sentences[Math.floor(Math.random() * sentences.length)] + "." : gbCurrentTarget.oneLiner;
    }
    
    gbQuestionHint.textContent = `"${chosenHint}"`;

    // Generate 4 options (1 correct, 3 distractors)
    const options = [gbCurrentTarget.name];
    while (options.length < 4) {
      const distractor = figuresData[Math.floor(Math.random() * figuresData.length)].name;
      if (!options.includes(distractor)) {
        options.push(distractor);
      }
    }
    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    // Render buttons
    gbOptionsGrid.innerHTML = '';
    options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.className = 'gb-option-btn';
      btn.innerHTML = `<span class="gb-option-num">${index + 1}</span> ${opt}`;
      btn.addEventListener('click', () => handleGbAnswer(opt));
      gbOptionsGrid.appendChild(btn);
    });

    startGbTimer();
  }

  function startGbTimer() {
    if (gbTimerInterval) clearInterval(gbTimerInterval);
    gbTimeLeft = 15;
    gbTimerText.textContent = `남은 시간: ${gbTimeLeft}초`;
    
    // Reset bar styles
    gbTimerBar.style.width = '100%';
    gbTimerBar.style.backgroundColor = '#10b981';

    gbTimerInterval = setInterval(() => {
      gbTimeLeft--;
      gbTimerText.textContent = `남은 시간: ${gbTimeLeft}초`;
      
      const percent = (gbTimeLeft / 15) * 100;
      gbTimerBar.style.width = `${percent}%`;

      if (gbTimeLeft <= 5) {
        gbTimerBar.style.backgroundColor = '#ef4444'; // Red alert
      }

      if (gbTimeLeft <= 0) {
        clearInterval(gbTimerInterval);
        gbLives--;
        showGbFeedback(false, true); // Timeout
      }
    }, 1000);
  }

  function handleGbAnswer(selectedOpt) {
    if (gbTimerInterval) clearInterval(gbTimerInterval);

    // Disable all options immediately to prevent double clicking
    const btns = gbOptionsGrid.querySelectorAll('.gb-option-btn');
    btns.forEach(btn => btn.disabled = true);

    const isCorrect = (selectedOpt === gbCurrentTarget.name);
    if (!isCorrect) {
      gbLives--;
    }
    showGbFeedback(isCorrect, false);
  }

  function showGbFeedback(isCorrect, isTimeout) {
    gbFeedbackOverlay.classList.remove('hidden');
    
    if (isCorrect) {
      gbFeedbackText.innerHTML = `정답입니다! 🎉<br><small style="font-size: 1.1rem; font-weight: normal; color: #c2f0c2;">훌륭해요! 다음 문제로 넘어갑니다.</small>`;
    } else {
      const subMsg = isTimeout ? '시간 초과!' : '오답입니다!';
      gbFeedbackText.innerHTML = `${subMsg} 😢<br><small style="font-size: 1.1rem; font-weight: normal; color: #ffcccc;">정답은 '${gbCurrentTarget.name}'입니다.</small>`;
    }

    setTimeout(() => {
      gbFeedbackOverlay.classList.add('hidden');
      
      // If we ran out of lives, check for revival triggers
      if (gbLives <= 0) {
        if ((gbRound === 6 || gbRound === 10) && !gbRevivalUsed) {
          triggerGbRevival();
        } else {
          endGbGame(false);
        }
      } else {
        if (isCorrect) {
          gbRound++;
        }
        loadGbQuestion();
      }
    }, 2000);
  }

  function triggerGbRevival() {
    gbRevivalOverlay.classList.remove('hidden');

    // Pick a revival target that has works
    const eligibleFigures = figuresData.filter(f => f.works && f.works.length > 0);
    const revivalTarget = eligibleFigures[Math.floor(Math.random() * eligibleFigures.length)];
    const bonusWork = revivalTarget.works[0];

    gbRevivalQuestionHint.textContent = `이 인물이 역사에 남긴 소중한 발자취(유산/작품) 중 하나는 바로 '${bonusWork.title}' (${bonusWork.desc.substring(0, 45)}...) 입니다. 이 위인은 누구일까요?`;

    // Options
    const options = [revivalTarget.name];
    while (options.length < 4) {
      const distractor = figuresData[Math.floor(Math.random() * figuresData.length)].name;
      if (!options.includes(distractor)) {
        options.push(distractor);
      }
    }
    options.sort(() => Math.random() - 0.5);

    gbRevivalOptionsGrid.innerHTML = '';
    options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.className = 'gb-option-btn';
      btn.innerHTML = `<span class="gb-option-num">${index + 1}</span> ${opt}`;
      btn.addEventListener('click', () => handleGbRevivalAnswer(opt, revivalTarget.name));
      gbRevivalOptionsGrid.appendChild(btn);
    });
  }

  function handleGbRevivalAnswer(selectedOpt, correctName) {
    // Disable all revival buttons
    const btns = gbRevivalOptionsGrid.querySelectorAll('.gb-option-btn');
    btns.forEach(btn => btn.disabled = true);

    const isCorrect = (selectedOpt === correctName);
    gbFeedbackOverlay.classList.remove('hidden');

    if (isCorrect) {
      gbLives = 1;
      gbRevivalUsed = true;
      gbFeedbackText.innerHTML = `부활 성공! 🎉<br><small style="font-size: 1.1rem; font-weight: normal; color: #c2f0c2;">하트 1개(💖)를 충전하여 도전을 계속합니다!</small>`;
    } else {
      gbFeedbackText.innerHTML = `부활 실패! 😢<br><small style="font-size: 1.1rem; font-weight: normal; color: #ffcccc;">정답은 '${correctName}'입니다. 아쉽게도 탈락했습니다.</small>`;
    }

    setTimeout(() => {
      gbFeedbackOverlay.classList.add('hidden');
      gbRevivalOverlay.classList.add('hidden');

      if (isCorrect) {
        gbRound++;
        loadGbQuestion();
      } else {
        endGbGame(false);
      }
    }, 2000);
  }

  function endGbGame(isVictory) {
    if (gbTimerInterval) clearInterval(gbTimerInterval);

    gbPlayScreen.classList.add('hidden');
    gbResultScreen.classList.remove('hidden');

    const roundsCleared = isVictory ? 10 : Math.max(0, gbRound - 1);

    if (isVictory) {
      gbResultIcon.textContent = '🏆';
      gbResultTitle.textContent = '골든벨을 울렸습니다! 🔔';
      gbResultDesc.textContent = `축하합니다! ${gbStudentInfo.name} 어린이는 10문제를 모두 맞히며 찬란한 역사 골든벨의 마스터가 되었습니다!`;
      gbRewardBox.classList.remove('hidden');
    } else {
      gbResultIcon.textContent = '😢';
      gbResultTitle.textContent = '아쉽게 탈락했습니다!';
      gbResultDesc.textContent = `아쉽게도 하트를 모두 잃었습니다. ${gbStudentInfo.name} 어린이, 위인 이야기들을 조금 더 탐색해보고 다시 도전해 봐요!`;
      gbRewardBox.classList.add('hidden');
    }

    saveScoreToLeaderboard(roundsCleared);
  }

  function saveScoreToLeaderboard(roundsCleared) {
    const score = (roundsCleared * 100) + (gbLives * 50);

    const newEntry = {
      region: gbStudentInfo.region,
      school: gbStudentInfo.school,
      grade: gbStudentInfo.grade,
      name: gbStudentInfo.name,
      round: roundsCleared === 10 ? "골든벨 울림! 🔔" : `${roundsCleared}단계`,
      score: score,
      timestamp: new Date().toLocaleDateString('ko-KR')
    };

    const rankings = JSON.parse(localStorage.getItem('gbRankings') || '[]');
    rankings.push(newEntry);
    rankings.sort((a, b) => b.score - a.score);
    const top10 = rankings.slice(0, 10);
    localStorage.setItem('gbRankings', JSON.stringify(top10));

    renderLeaderboardUI(top10);
  }

  function loadLeaderboards() {
    const rankings = JSON.parse(localStorage.getItem('gbRankings') || '[]');
    renderLeaderboardUI(rankings);
  }

  function renderLeaderboardUI(rankings) {
    let html = '';
    rankings.forEach((item, index) => {
      let badgeClass = 'rank-other';
      if (index === 0) badgeClass = 'rank-1';
      else if (index === 1) badgeClass = 'rank-2';
      else if (index === 2) badgeClass = 'rank-3';
      
      const badgeIcon = index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1;

      html += `
        <tr>
          <td><span class="rank-badge ${badgeClass}">${badgeIcon}</span></td>
          <td>
            <div style="font-weight: 700; color: var(--text-primary);">${item.name} (${item.grade})</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${item.region} ${item.school}</div>
          </td>
          <td><strong>${item.round}</strong></td>
          <td style="color: #e2b857; font-weight: 700;">${item.score}점</td>
        </tr>
      `;
    });

    if (rankings.length === 0) {
      html = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 2rem;">아직 등록된 랭킹이 없습니다. 첫 번째 골든벨의 주인이 되어 보세요!</td></tr>`;
    }

    gbLeaderboardStartBody.innerHTML = html;
    gbLeaderboardResultBody.innerHTML = html;
  }

  // Bind clicks
  playGoldenBellBtn.addEventListener('click', showGoldenBellPortal);
  gbBackToHomeBtn.addEventListener('click', showHomeDashboard);
  gbStartGameInnerBtn.addEventListener('click', startGoldenBellGame);
  gbRetryBtn.addEventListener('click', startGoldenBellGame);
  gbResultHomeBtn.addEventListener('click', showHomeDashboard);


  // ==========================================
  // 5. Initial Startup Routing
  // ==========================================
  renderSidebar();

  // Route based on URL hash if present
  const hash = location.hash.substring(1);
  const exists = figuresData.some(f => f.id === hash);
  if (exists) {
    selectFigure(hash);
  } else {
    showHomeDashboard();
  }
});
