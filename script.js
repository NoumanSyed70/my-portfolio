/* ============================================================
   SYED NOUMAN HAIDER — 3D PORTFOLIO
   script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. STARFIELD CANVAS ─────────────────────────────────── */
  const canvas  = document.getElementById('starfield');
  const ctx     = canvas.getContext('2d');
  let stars     = [];
  let W, H;

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
      buildStars();
      // Also update slider on resize
      if (typeof updateSlider === 'function') updateSlider();
    }, 250);
  });

  function buildStars() {
    stars = [];
    const count = Math.floor((W * H) / 5000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.2,
        o: Math.random() * 0.7 + 0.1,
        speed: Math.random() * 0.012 + 0.003,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }
  buildStars();

  let frame = 0;
  function drawStars() {
    ctx.clearRect(0, 0, W, H);
    frame += 0.012;
    stars.forEach(s => {
      const opacity = s.o * (0.6 + 0.4 * Math.sin(frame * s.speed * 60 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }
  drawStars();

  /* ── 2. CURSOR GLOW ──────────────────────────────────────── */
  const cursorGlow = document.getElementById('cursor-glow');
  let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorGlow.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });

  (function animateCursor() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top  = glowY + 'px';
    requestAnimationFrame(animateCursor);
  })();

  /* ── 3. THEME TOGGLE ─────────────────────────────────────── */
  const themeToggle  = document.getElementById('theme-toggle');
  const body         = document.body;
  const savedTheme   = localStorage.getItem('snh-theme') || 'dark-mode';
  body.className     = savedTheme;
  syncThemeIcon(savedTheme);

  function syncThemeIcon(theme) {
    themeToggle.innerHTML = theme === 'dark-mode'
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }
  themeToggle.addEventListener('click', () => {
    const next = body.classList.contains('dark-mode') ? 'light-mode' : 'dark-mode';
    body.className = next;
    localStorage.setItem('snh-theme', next);
    syncThemeIcon(next);
  });

  /* ── 4. MOBILE NAV ───────────────────────────────────────── */
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav    = document.getElementById('main-nav');
  const navLinks   = document.querySelectorAll('.nav-link');

  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.querySelector('i').className = open ? 'fas fa-times' : 'fas fa-bars';
  });
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.querySelector('i').className = 'fas fa-bars';
    });
  });

  /* ── 5. ACTIVE NAV HIGHLIGHT ─────────────────────────────── */
  const sections = document.querySelectorAll('main section');
  const navObs   = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(l => {
          l.classList.remove('active');
          if (l.getAttribute('href').includes(id)) l.classList.add('active');
        });
      }
    });
  }, { rootMargin: '-30% 0px -70% 0px' });
  sections.forEach(s => navObs.observe(s));

  /* ── 6. SCROLL REVEAL ────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revObs    = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        // stagger siblings
        const siblings = [...e.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
        const idx      = siblings.indexOf(e.target);
        setTimeout(() => e.target.classList.add('visible'), idx * 80);
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revObs.observe(el));

  /* ── 7. ORBIT SKILLS ANIMATION ───────────────────────────── */
  const orbitScene = document.getElementById('orbit-scene');
  const sats       = document.querySelectorAll('.skill-sat');

  // Orbit radii relative to scene size
  const ORBIT_R = { '1': 0.185, '2': 0.285, '3': 0.4 };
  // Speeds (degrees per second)
  const ORBIT_SPEED = { '1': 28, '2': 18, '3': 11 };

  // Initialize angles from data-angle
  const satState = Array.from(sats).map(sat => ({
    el:    sat,
    orbit: sat.dataset.orbit,
    angle: parseFloat(sat.dataset.angle),
    label: sat.dataset.label,
    icon:  sat.dataset.icon,
  }));

  // Build inner HTML for each satellite
  satState.forEach(s => {
    s.el.innerHTML = `<i class="${s.icon}"></i><span>${s.label}</span>`;
  });

  let lastTime  = null;
  let paused    = false;

  function positionSats(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000; // seconds
    lastTime  = timestamp;

    const sceneRect = orbitScene.getBoundingClientRect();
    const cx = sceneRect.width  / 2;
    const cy = sceneRect.height / 2;

    if (!paused) {
      satState.forEach(s => {
        s.angle += ORBIT_SPEED[s.orbit] * dt;
      });
    }

    satState.forEach(s => {
      const r   = ORBIT_R[s.orbit] * sceneRect.width;
      const rad = (s.angle * Math.PI) / 180;
      const x   = cx + r * Math.cos(rad);
      const y   = cy + r * Math.sin(rad);
      s.el.style.left = x + 'px';
      s.el.style.top  = y + 'px';
    });

    requestAnimationFrame(positionSats);
  }
  requestAnimationFrame(positionSats);

  // Pause on hover
  orbitScene.addEventListener('mouseenter', () => { paused = true; });
  orbitScene.addEventListener('mouseleave', () => { paused = false; });

  // Planet image fade to glow on scroll into view
  const planetImg  = document.getElementById('planet-img');
  const skillsSection = document.getElementById('skills');
  const planetObs  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // fade the image slightly while in view — keeps focus on satellites
        planetImg.style.opacity = '0.82';
      } else {
        planetImg.style.opacity = '1';
      }
    });
  }, { threshold: 0.3 });
  if (skillsSection) planetObs.observe(skillsSection);

  /* ── 8. PROJECT FILTERING ────────────────────────────────── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const flipCards   = document.querySelectorAll('.flip-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      
      // Clear any flipped cards when filtering
      flipCards.forEach(c => c.classList.remove('flipped'));

      flipCards.forEach(card => {
        if (filter === 'all' || card.classList.contains(filter)) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          void card.offsetWidth; // reflow
          card.style.animation = 'cardReveal 0.4s ease both';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // CSS for card reveal on filter
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes cardReveal {
      from { opacity:0; transform: translateY(20px) rotateX(8deg); }
      to   { opacity:1; transform: translateY(0) rotateX(0); }
    }
  `;
  document.head.appendChild(styleTag);

  /* ── 9. PROJECT MODAL ────────────────────────────────────── */
  const modal    = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn  = document.querySelector('.modal .close-btn');

  const projectData = {
    'game-trade-hub': {
      title: 'Game Trade Hub',
      tech:  ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
      desc:  '**Problem:** Pakistani gamers lack a centralized, trusted marketplace for gaming gear and community events. **Solution:** Developed the front-end for a dedicated online hub that allows users to buy, sell, or rent gaming items and register for local esports tournaments. Focus was on responsive, modern UI/UX.',
      repo:  'https://github.com/NoumanSyed70/Game-Trade-Hub',
      demo:  'assets/1750518984490.mp4',
    },
    'sudoku-game': {
      title: 'Sudoku Game',
      tech:  ['JavaScript', 'HTML', 'CSS', 'Logic'],
      desc:  '**Problem:** A need for a hands-on project to practice interactive logic and UI manipulation. **Solution:** Built a functional Sudoku puzzle game from scratch focusing on algorithms for puzzle generation, validation, and real-time user interaction using pure JavaScript.',
      repo:  'https://github.com/NoumanSyed70/Sudoko-Game-',
      demo:  null,
    },
    'tic-tac-toe': {
      title: 'Tic Tac Toe Game',
      tech:  ['JavaScript', 'HTML', 'CSS'],
      desc:  '**Problem:** Desire to strengthen understanding of game state management and event handling. **Solution:** Created the classic Tic Tac Toe game with an intuitive interface focusing on winner-checking mechanisms and clean separation of concerns.',
      repo:  'https://github.com/NoumanSyed70/Tic-Toe-Game',
      demo:  null,
    },
    'bank-management': {
      title: 'Basic Bank Management System',
      tech:  ['C++', 'OOP', 'Console Application'],
      desc:  '**Problem:** The primary goal was to master core Object-Oriented Programming (OOP) concepts. **Solution:** Developed a console-based system simulating essential bank operations using C++ with clear practical examples of inheritance, polymorphism, and encapsulation.',
      repo:  'https://github.com/NoumanSyed70/Basic-Bank-Management-System',
      demo:  null,
    },
    'photo-editor': {
      title: 'Luminous Photo Editor',
      tech:  ['JavaScript', 'Image Processing', 'UI/UX'],
      desc:  '**Problem:** Needed a lightweight way to make quick image adjustments without heavy software. **Solution:** Built a browser-based photo editor that supports common editing actions with a clean interface and responsive controls.',
      repo:  'https://github.com/NoumanSyed70/luminous-editor',
      demo:  'https://noumansyed70.github.io/luminous-editor/',
    },
    'ai-decision-simulator': {
      title: 'Aql-AI Decision Simulator',
      tech:  ['AI Concepts', 'Simulation Logic', 'JavaScript'],
      desc:  '**Problem:** Understanding how decision models behave in different scenarios can be difficult without visual experimentation. **Solution:** Developed an interactive simulator to model AI-style decision outcomes and compare behavior across changing inputs.',
      repo:  'https://github.com/NoumanSyed70/Aql-AI-Decision-Engine',
      demo:  'assets/WhatsApp Video 2026-03-27 at 21.12.20.mp4',
    },
  };

  function openModal(key) {
    const d = projectData[key];
    if (!d) return;

    const badges = d.tech.map(t => `<span class="skill-badge">${t}</span>`).join('');
    const demoBtn = d.demo
      ? `<a href="${d.demo}" target="_blank" class="btn primary-btn">🚀 Live Demo</a>`
      : `<button class="btn ghost-btn" disabled style="opacity:.5;cursor:default;">No Demo</button>`;

    modalBody.innerHTML = `
      <h3>${d.title}</h3>
      <div class="tech-stack">${badges}</div>
      <p style="color:var(--subtext);line-height:1.75;font-size:.93rem;">
        ${d.desc.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text)">$1</strong>')}
      </p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px;">
        ${demoBtn}
        <a href="${d.repo}" target="_blank" class="btn ghost-btn">
          <i class="fab fa-github"></i> GitHub
        </a>
      </div>
    `;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.project-modal-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openModal(btn.dataset.project);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── 10. CERTIFICATE SLIDER ──────────────────────────────── */
  const slider   = document.getElementById('certificate-slider');
  const prevBtn  = document.querySelector('.slider-btn.prev-btn');
  const nextBtn  = document.querySelector('.slider-btn.next-btn');
  const slides   = document.querySelectorAll('.slide');
  let curIdx     = 0;
  let perView    = window.innerWidth <= 768 ? 1 : 3;

  function slideStride() {
    if (!slides.length) return 0;
    const s = slides[0];
    return s.getBoundingClientRect().width + parseFloat(getComputedStyle(s).marginRight || 10);
  }

  function updateSlider() {
    const maxIdx = Math.max(0, slides.length - perView);
    curIdx = Math.min(Math.max(curIdx, 0), maxIdx);
    slider.style.transform = `translateX(${-(curIdx * slideStride())}px)`;
    prevBtn.style.display  = curIdx > 0 ? 'flex' : 'none';
    nextBtn.style.display  = curIdx < maxIdx ? 'flex' : 'none';
  }

  prevBtn.addEventListener('click', () => { curIdx--; updateSlider(); });
  nextBtn.addEventListener('click', () => { curIdx++; updateSlider(); });
  window.addEventListener('resize', () => {
    perView = window.innerWidth <= 768 ? 1 : 3;
    updateSlider();
  });
  updateSlider();

  /* ── 11. CONTACT FORM ────────────────────────────────────── */
  const contactForm   = document.getElementById('contact-form');
  const nameInput     = document.getElementById('name');
  const emailInput    = document.getElementById('email');
  const messageInput  = document.getElementById('message');
  const formInputs    = [nameInput, emailInput, messageInput];

  // Restore saved values
  formInputs.forEach(inp => {
    const saved = localStorage.getItem(`snh-contact-${inp.id}`);
    if (saved) inp.value = saved;
    inp.addEventListener('input', () => localStorage.setItem(`snh-contact-${inp.id}`, inp.value));
  });

  function validateField(inp, regex, errId, msg) {
    const el = document.getElementById(errId);
    if (!inp.value.trim()) { el.textContent = `${inp.name} is required.`; return false; }
    if (regex && !regex.test(inp.value)) { el.textContent = msg; return false; }
    el.textContent = '';
    return true;
  }

  contactForm.addEventListener('submit', e => {
    let ok = true;
    ok &= validateField(nameInput, null, 'name-error', '');
    ok &= validateField(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email-error', 'Please enter a valid email.');
    ok &= validateField(messageInput, null, 'message-error', '');
    if (!ok) {
      e.preventDefault();
    } else {
      formInputs.forEach(inp => localStorage.removeItem(`snh-contact-${inp.id}`));
    }
  });

  /* ── 12. SCROLL TO TOP ───────────────────────────────────── */
  const scrollTopBtn = document.getElementById('scroll-to-top');
  window.addEventListener('scroll', () => {
    scrollTopBtn.style.display = window.scrollY > 350 ? 'flex' : 'none';
  });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── 13. 3D TILT ON PROFILE & TROPHY CARDS ───────────────── */
  function addTilt(el, intensity = 12) {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.transform = `translateY(-6px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  }

  document.querySelectorAll('.profile-card, .edu-card, .contact-form-container, .contact-details-container').forEach(c => addTilt(c, 8));
  document.querySelectorAll('.trophy-inner').forEach(c => addTilt(c, 10));

  /* ── 14. SKILL LEGEND HIGHLIGHT ─────────────────────────── */
  document.querySelectorAll('.skill-list-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      const cat = item.dataset.cat;
      sats.forEach(sat => {
        sat.style.opacity   = sat.dataset.cat === cat ? '1' : '0.2';
        sat.style.transform = sat.dataset.cat === cat
          ? 'translate(-50%,-50%) scale(1.25)'
          : 'translate(-50%,-50%) scale(0.8)';
      });
    });
    item.addEventListener('mouseleave', () => {
      sats.forEach(sat => {
        sat.style.opacity   = '1';
        sat.style.transform = 'translate(-50%,-50%) scale(1)';
      });
    });
  });

  /* ── 15. TOUCH SUPPORT FOR FLIP CARDS ────────────────────── */
  flipCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // If clicking a button/link inside, don't flip
      if (e.target.closest('.btn') || e.target.closest('a')) return;
      
      // On mobile/touch, toggle flipped class
      if (window.innerWidth <= 1024) {
        card.classList.toggle('flipped');
        
        // Optional: close other cards
        flipCards.forEach(other => {
          if (other !== card) other.classList.remove('flipped');
        });
      }
    });
  });

});
