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
      // 0 = Sunny (Clear)
      // 1, 2, 3 = Partly cloudy
      // >= 51 = Rain, Snow, Drizzle, etc.
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
  // Helper to Highlight TOC Links
  // ==========================================
  const tocLinks = document.querySelectorAll('.toc-link');

  function highlightTOCLink(targetHref) {
    tocLinks.forEach(link => {
      if (link.getAttribute('href') === targetHref) {
        tocLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Expand/activate parent sublist item if it exists
        const parentSublist = link.closest('.toc-sublist');
        if (parentSublist) {
          const parentLink = parentSublist.previousElementSibling;
          if (parentLink) parentLink.classList.add('active');
        }
      }
    });
  }

  // ==========================================
  // 2. Interactive Achievements Tabs & TOC Link Sync
  // ==========================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Function to switch tab by tabId
  function switchTab(tabId) {
    // Deactivate all buttons & contents
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Activate selected
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(`tab-${tabId}`);
    
    if (targetBtn && targetContent) {
      targetBtn.classList.add('active');
      targetBtn.setAttribute('aria-selected', 'true');
      targetContent.classList.add('active');
      
      // Sync with TOC
      highlightTOCLink(`#ach-${tabId}`);
    }
  }

  // Bind click listener for manual tab button clicks
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Handle TOC clicks to trigger tab switches
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      if (href.startsWith('#ach-')) {
        e.preventDefault();
        const tabId = href.substring(5); // Extract "hangul", "science", etc.
        switchTab(tabId);
        
        // Scroll to achievements section
        const achievementsSec = document.getElementById('achievements');
        if (achievementsSec) {
          achievementsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Add hash to history without page jump
        history.pushState(null, null, href);
      }
    });
  });

  // ==========================================
  // 3. Table of Contents ScrollSpy
  // ==========================================
  const sections = document.querySelectorAll('.article-section, .subsection');

  // Callback for IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Trigger when section is in the middle of viewport
    threshold: 0
  };

  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        if (id === 'achievements') {
          // Highlight TOC link for the currently active tab
          const activeTabBtn = document.querySelector('.tab-btn.active');
          if (activeTabBtn) {
            const activeTabId = activeTabBtn.getAttribute('data-tab');
            highlightTOCLink(`#ach-${activeTabId}`);
          }
        } else {
          highlightTOCLink(`#${id}`);
        }
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  sections.forEach(sec => observer.observe(sec));

  // ==========================================
  // 4. Dynamic In-Page Search & Highlighting
  // ==========================================
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  
  // Store original HTML of paragraphs and headings to restore on reset
  const searchableElements = document.querySelectorAll('.article-body p, .subsection p, .tab-desc, .eval-card p');
  const originalHTMLs = new Map();
  
  searchableElements.forEach((el, index) => {
    originalHTMLs.set(el, el.innerHTML);
  });

  function performSearch(query) {
    // 1. Clear previous highlights
    searchableElements.forEach(el => {
      el.innerHTML = originalHTMLs.get(el);
    });

    if (!query) {
      searchClearBtn.classList.add('hidden');
      return;
    }
    
    searchClearBtn.classList.remove('hidden');
    
    // Escape special characters in query for regex
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    let matchCount = 0;
    let firstMatchElement = null;

    searchableElements.forEach(el => {
      const text = originalHTMLs.get(el);
      if (regex.test(text)) {
        // Wrap matches in span
        el.innerHTML = text.replace(regex, '<span class="search-highlight">$1</span>');
        matchCount++;
        if (!firstMatchElement) {
          firstMatchElement = el;
        }
      }
    });

    // Scroll to the first match if found
    if (firstMatchElement) {
      firstMatchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Event Listeners for Search
  searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value.trim());
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    performSearch('');
    searchInput.focus();
  });

  // ==========================================
  // 5. Interactive Quote Engine
  // ==========================================
  const quotes = [
    {
      text: "백성은 나라의 근본이니, 근본이 튼튼해야 나라가 평안하다.",
      source: "세종실록"
    },
    {
      text: "설령 백성의 어리석은 마음이 나와 다를지라도, 결코 그들을 함부로 대하지 말라.",
      source: "세종실록"
    },
    {
      text: "나의 나이가 오십이 넘었으니 이제는 스스로 편하고자 함이 아니라, 오직 백성을 다스리는 도리를 극진히 하고자 할 뿐이다.",
      source: "세종실록"
    },
    {
      text: "벼슬아치들은 제 한 몸의 이익만 꾀하지 말고, 나라와 백성을 위해 충심을 다하라.",
      source: "세종실록"
    },
    {
      text: "남을 너그럽게 포용하는 자는 천하를 얻고, 스스로 뽐내는 자는 이웃도 잃는다.",
      source: "세종실록"
    },
    {
      text: "꽃이 지고 잎이 돋아나듯이 역사는 쉼 없이 흐르니, 우리는 오늘을 충실히 살아 미래를 준비해야 한다.",
      source: "세종실록"
    }
  ];

  let currentQuoteIndex = 0;
  const quoteTextEl = document.getElementById('quoteText');
  const quoteSourceEl = document.getElementById('quoteSource');
  const nextQuoteBtn = document.getElementById('nextQuoteBtn');

  nextQuoteBtn.addEventListener('click', () => {
    // Fade out
    quoteTextEl.style.opacity = '0';
    quoteSourceEl.style.opacity = '0';
    quoteTextEl.style.transform = 'translateY(-5px)';
    
    setTimeout(() => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      quoteTextEl.textContent = `"${quotes[currentQuoteIndex].text}"`;
      quoteSourceEl.textContent = `— ${quotes[currentQuoteIndex].source}`;
      
      // Fade in
      quoteTextEl.style.opacity = '1';
      quoteSourceEl.style.opacity = '1';
      quoteTextEl.style.transform = 'translateY(0)';
    }, 250);
  });

  // Init animations on load
  quoteTextEl.style.transition = 'all 0.25s ease';
  quoteSourceEl.style.transition = 'all 0.25s ease';
});
