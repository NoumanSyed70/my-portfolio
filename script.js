document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Dark/Light Mode Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme') || 'dark-mode';

    body.className = currentTheme;
    updateThemeToggleIcon(currentTheme);

    function updateThemeToggleIcon(theme) {
        themeToggle.innerHTML = theme === 'dark-mode' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }

    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-mode') ? 'light-mode' : 'dark-mode';
        body.className = newTheme;
        localStorage.setItem('theme', newTheme);
        updateThemeToggleIcon(newTheme);
    });

    // --- 2. Navigation & Active Link Highlight ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('open');
        menuToggle.querySelector('i').className = mainNav.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
                menuToggle.querySelector('i').className = 'fas fa-bars';
            }
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').includes(id)) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-30% 0px -70% 0px' 
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- 3. Project Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const isPlaceholder = card.classList.contains('placeholder');
                const isAiFilter = filter === 'ai';

                if (filter === 'all') {
                    if (!isPlaceholder) { card.style.display = 'flex'; setTimeout(() => card.classList.remove('hidden'), 50); } else { card.style.display = 'none'; card.classList.add('hidden'); }
                } else if (filter === 'ai' && isPlaceholder) {
                    card.style.display = 'flex'; setTimeout(() => card.classList.remove('hidden'), 50);
                } else if (isPlaceholder && !isAiFilter) {
                    card.style.display = 'none'; card.classList.add('hidden');
                } else if (card.classList.contains(filter) || filter === 'all') {
                    card.style.display = 'flex'; setTimeout(() => card.classList.remove('hidden'), 50);
                } else {
                    card.classList.add('hidden');
                    const onTransitionEnd = () => {
                        if (card.classList.contains('hidden')) { card.style.display = 'none'; }
                        card.removeEventListener('transitionend', onTransitionEnd);
                    };
                    card.addEventListener('transitionend', onTransitionEnd);
                }
            });
        });
    });

    // --- 4. Project Modal Popup Logic (IMPROVED) ---
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.modal .close-btn');
    const projectModalBtns = document.querySelectorAll('.project-modal-btn');

    const projectData = {
        'game-trade-hub': {
            title: 'Game Trade Hub',
            tech: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
            desc: '**Problem:** Pakistani gamers lack a centralized, trusted marketplace for gaming gear and community events. **Solution:** Developed the front-end for a dedicated online hub that allows users to buy, sell, or rent gaming items and register for local esports tournaments. Focus was on responsive, modern UI/UX.',
            repo: 'https://github.com/NoumanSyed70/Game-Trade-Hub',
            demo: '#' // LIVE DEMO ENABLED
        },
        'sudoku-game': {
            title: 'Sudoku Game',
            tech: ['JavaScript', 'HTML', 'CSS', 'Logic'],
            desc: '**Problem:** A need for a hands-on project to practice interactive logic and UI manipulation. **Solution:** Built a functional Sudoku puzzle game from scratch. This project focused heavily on implementing algorithms for puzzle generation, validation, and real-time user interaction using pure JavaScript.',
            repo: 'https://github.com/NoumanSyed70/Sudoko-Game-',
            demo: null // LIVE DEMO DISABLED
        },
        'tic-tac-toe': {
            title: 'Tic Tac Toe Game',
            tech: ['JavaScript', 'HTML', 'CSS'],
            desc: '**Problem:** Desire to strengthen understanding of game state management and event handling. **Solution:** Created the classic Tic Tac Toe game with an intuitive interface. It serves as a strong foundation for practicing basic game loop logic, winner-checking mechanisms, and clean separation of concerns.',
            repo: 'https://github.com/NoumanSyed70/Tic-Toe-Game',
            demo: null // LIVE DEMO DISABLED
        },
        'bank-management': {
            title: 'Basic Bank Management System',
            tech: ['C++', 'OOP', 'Console Application'],
            desc: '**Problem:** The primary goal was to master core Object-Oriented Programming (OOP) concepts. **Solution:** Developed a console-based system that simulates essential bank operations (account creation, deposit, withdrawal, balance inquiry) using C++. It provides clear practical examples of inheritance, polymorphism, and encapsulation.',
            repo: 'https://github.com/NoumanSyed70/Basic-Bank-Management-System',
            demo: null // LIVE DEMO DISABLED
        }
    };

    projectModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectKey = e.target.getAttribute('data-project');
            const data = projectData[projectKey];

            if (!data) return;

            let techBadges = data.tech.map(t => `<span class="skill-badge">${t}</span>`).join('');
            
            // LOGIC TO DETERMINE LIVE DEMO BUTTON STATE
            let demoBtn;
            if (data.demo) {
                 demoBtn = `<a href="${data.demo}" target="_blank" class="btn primary-btn" style="margin-right: 10px;">Live Demo</a>`;
            } else {
                 demoBtn = `<button class="btn primary-btn" disabled style="margin-right: 10px; opacity: 0.6; cursor: default;">Details Only</button>`;
            }

            modalBody.innerHTML = `
                <h3>${data.title}</h3>
                <div class="tech-stack" style="margin-bottom: 15px;">${techBadges}</div>
                <p>${data.desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p> 
                <div style="margin-top: 20px;">
                    ${demoBtn}
                    <a href="${data.repo}" target="_blank" class="btn secondary-btn"><i class="fab fa-github"></i> GitHub Repo</a>
                </div>
            `;
            
            modal.style.display = 'block';
        });
    });

    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target == modal) { modal.style.display = 'none'; } });


    // --- 5. Certificate Slider Logic (IMPROVED) ---
    const slider = document.getElementById('certificate-slider');
    const prevBtn = document.querySelector('.slider-btn.prev-btn');
    const nextBtn = document.querySelector('.slider-btn.next-btn');
    const slides = document.querySelectorAll('.slide');
    let currentIndex = 0;
    const slidesPerView = 3; 

    function updateSlider() {
        const totalSlides = slides.length;
        const totalItems = totalSlides;
        
        // Ensure slides don't move past the end point
        if (currentIndex > (totalItems - slidesPerView)) {
            currentIndex = (totalItems - slidesPerView);
        }
        if (currentIndex < 0) {
            currentIndex = 0;
        }

        const offset = -(currentIndex * (100 / slidesPerView));
        slider.style.transform = `translateX(${offset}%)`;

        // Update button visibility
        prevBtn.style.display = currentIndex > 0 ? 'flex' : 'none';
        nextBtn.style.display = currentIndex < (totalItems - slidesPerView) ? 'flex' : 'none';
    }

    prevBtn.addEventListener('click', () => {
        currentIndex--;
        updateSlider();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex++;
        updateSlider();
    });

    // Initialize slider state
    updateSlider(); 
    
    // --- 6. Form & Scroll To Top (Unchanged) ---
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const inputs = [nameInput, emailInput, messageInput];

    inputs.forEach(input => {
        const value = localStorage.getItem(`contact-${input.id}`);
        if (value) { input.value = value; }
    });
    inputs.forEach(input => {
        input.addEventListener('input', () => { localStorage.setItem(`contact-${input.id}`, input.value); });
    });

    const validateField = (input, regex, errorId, errorMsg) => {
        const errorElement = document.getElementById(errorId);
        if (input.value.trim() === '') { errorElement.textContent = `${input.name} is required.`; return false; } 
        else if (regex && !regex.test(input.value)) { errorElement.textContent = errorMsg; return false; } 
        else { errorElement.textContent = ''; return true; }
    };

    contactForm.addEventListener('submit', (e) => {
        let isValid = true;
        isValid &= validateField(nameInput, null, 'name-error', 'Name is required.');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid &= validateField(emailInput, emailRegex, 'email-error', 'Please enter a valid email address.');
        isValid &= validateField(messageInput, null, 'message-error', 'Message cannot be empty.');

        if (!isValid) { e.preventDefault(); alert("Please fix the errors in the form before submitting."); } 
        else {
            localStorage.removeItem('contact-name');
            localStorage.removeItem('contact-email');
            localStorage.removeItem('contact-message');
        }
    });
    
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { scrollToTopBtn.style.display = 'block'; } else { scrollToTopBtn.style.display = 'none'; }
    });
    scrollToTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
});