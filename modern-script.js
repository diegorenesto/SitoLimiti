// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animation library with enhanced settings
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: false,
            mirror: true,
            anchorPlacement: 'top-bottom'
        });
    }

    // Check for saved theme preference or use system preference
    initThemePreference();
    
    // Initialize interactive elements based on current page
    initCurrentPageFeatures();

    // Add event listeners for interactive elements
    setupEventListeners();
    
    // Initialize GSAP animations for page elements
    initGSAPAnimations();
});

// Initialize theme based on saved preference or system preference
function initThemePreference() {
    // Check if the user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    
    // If no saved preference, check system preference
    if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        const themeToggle = document.getElementById('check');
        if (themeToggle) {
            themeToggle.checked = prefersDark;
        }
        updateThemeIcon(prefersDark ? 'dark' : 'light');
    } else {
        // Apply saved preference
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeToggle = document.getElementById('check');
        if (themeToggle) {
            themeToggle.checked = savedTheme === 'dark';
        }
        updateThemeIcon(savedTheme);
    }
}

// Initialize page-specific features
function initCurrentPageFeatures() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop();

    // Remove ".html" from the page name if it exists
    const pageBaseName = pageName.replace('.html', '');

    // Page-specific initializations
    switch(pageBaseName) {
        case '':
        case 'index':
            initHomePage();
            break;
        case 'teoria':
            initTeoriaPage();
            break;
        case 'esercizi':
            initEserciziPage();
            break;
        case 'limiti-sociali':
            initLimitiSocialiPage();
            break;
        case 'podcast':
            initPodcastPage();
            break;
        case 'chi-siamo':
            initAboutPage();
            break;
        default:
            // Check if it's a resolution page
            if (pageBaseName.startsWith('risoluzione-limite')) {
                initResolutionPage(pageBaseName);
            }
            break;
    }
}

// Setup common event listeners
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('check');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }

    // Show/hide hint boxes in exercises
    const hintButtons = document.querySelectorAll('.show-hint');
    hintButtons.forEach(button => {
        button.addEventListener('click', function() {
            const hintBox = this.parentElement.nextElementSibling;
            hintBox.classList.toggle('show');
            this.textContent = hintBox.classList.contains('show') ? 'Nascondi suggerimento' : 'Suggerimento';
            
            // Animate hint reveal with GSAP
            if (typeof gsap !== 'undefined') {
                if (hintBox.classList.contains('show')) {
                    gsap.fromTo(hintBox, 
                        { opacity: 0, y: -20 }, 
                        { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }
                    );
                }
            }
        });
    });

    // Tab navigation with enhanced animations
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabIndex = Array.from(tabButtons).indexOf(this);
            showContent(tabIndex);

            // Update active tab styling with animation
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.transform = 'scale(1)';
            });
            
            this.classList.add('active');
            
            // Scale animation for active tab
            if (typeof gsap !== 'undefined') {
                gsap.to(this, { 
                    scale: 1.05, 
                    duration: 0.3, 
                    ease: "back.out(1.2)",
                    yoyo: true,
                    repeat: 1
                });
            }
        });
    });

    // Solution modal for exercise page
    const solutionButtons = document.querySelectorAll('.solution-btn');
    solutionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const solution = this.getAttribute('data-solution');
            showSolutionModal(solution);
        });
    });

    // Close solution modal
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', closeSolutionModal);
    }

    // Exercise filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterExercises(filter);
            
            // Update active filter button with animation
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(this, 
                    { backgroundColor: 'rgba(var(--accent-color-rgb), 0.8)' },
                    { backgroundColor: 'rgba(var(--accent-color-rgb), 1)', duration: 0.5, ease: "power2.out" }
                );
            }
        });
    });

    // Podcast player controls with enhanced interaction
    setupPodcastControls();
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Initialize GSAP animations for common page elements
function initGSAPAnimations() {
    if (typeof gsap !== 'undefined') {
        // Animate company logo
        const logo = document.querySelector('.company-name-main');
        if (logo) {
            gsap.from(logo, { 
                duration: 1.2, 
                opacity: 0, 
                y: -20, 
                ease: "power3.out"
            });
        }
        
        // Animate navigation items
        const navItems = document.querySelectorAll('.nav-container a:not(.company-name-main)');
        if (navItems.length) {
            gsap.from(navItems, { 
                duration: 1, 
                opacity: 0, 
                y: -20, 
                stagger: 0.1, 
                ease: "power2.out",
                delay: 0.3
            });
        }
        
        // Animate theme toggle
        const themeToggle = document.querySelector('.switch-container');
        if (themeToggle) {
            gsap.from(themeToggle, { 
                duration: 1, 
                opacity: 0, 
                x: 20, 
                ease: "power2.out",
                delay: 0.5
            });
        }
        
        // Setup scroll trigger animations if ScrollTrigger is available
        if (typeof ScrollTrigger !== 'undefined') {
            // Header parallax effect
            gsap.to('.teoria-header, .resolution-header', {
                y: 100,
                scrollTrigger: {
                    trigger: 'main',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }
    }
}

// Toggle theme between light and dark with enhanced animations
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Animate theme transition with GSAP if available
    if (typeof gsap !== 'undefined') {
        // Create a full-screen overlay for smooth transition
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = newTheme === 'dark' ? '#1a1a2e' : '#ffffff';
        overlay.style.zIndex = '9999';
        overlay.style.pointerEvents = 'none';
        overlay.style.opacity = '0';
        document.body.appendChild(overlay);
        
        // Fade in overlay
        gsap.to(overlay, {
            opacity: 0.5,
            duration: 0.3,
            onComplete: function() {
                // Change theme
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme);
                
                // Fade out overlay and remove it
                gsap.to(overlay, {
                    opacity: 0,
                    duration: 0.5,
                    delay: 0.1,
                    onComplete: function() {
                        document.body.removeChild(overlay);
                    }
                });
            }
        });
    } else {
        // Fallback for when GSAP is not available
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }
}

// Update theme icon based on current theme with enhanced animation
function updateThemeIcon(theme) {
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    if (moonIcon && sunIcon) {
        if (theme === 'dark') {
            if (typeof gsap !== 'undefined') {
                gsap.to(moonIcon, { opacity: 0, scale: 0.5, duration: 0.3 });
                gsap.to(sunIcon, { opacity: 1, scale: 1, duration: 0.3, delay: 0.1 });
            } else {
                moonIcon.style.opacity = '0';
                sunIcon.style.opacity = '1';
            }
        } else {
            if (typeof gsap !== 'undefined') {
                gsap.to(sunIcon, { opacity: 0, scale: 0.5, duration: 0.3 });
                gsap.to(moonIcon, { opacity: 1, scale: 1, duration: 0.3, delay: 0.1 });
            } else {
                moonIcon.style.opacity = '1';
                sunIcon.style.opacity = '0';
            }
        }
    }
}

// Open the sidebar navigation with enhanced animation
function openNav() {
    const sidebar = document.getElementById('mySidebar');
    if (sidebar) {
        if (typeof gsap !== 'undefined') {
            gsap.to(sidebar, { width: '280px', duration: 0.5, ease: "power2.out" });
            
            // Staggered animation for sidebar links
            const links = sidebar.querySelectorAll('.sidebar-link');
            gsap.fromTo(links, 
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.05, delay: 0.2, duration: 0.4, ease: "power1.out" }
            );
        } else {
            sidebar.style.width = '280px';
        }
    }
}

// Close the sidebar navigation with enhanced animation
function closeNav() {
    const sidebar = document.getElementById('mySidebar');
    if (sidebar) {
        if (typeof gsap !== 'undefined') {
            // Fade out links first
            const links = sidebar.querySelectorAll('.sidebar-link');
            gsap.to(links, { opacity: 0, x: -20, stagger: 0.03, duration: 0.2 });
            
            // Then close sidebar
            gsap.to(sidebar, { 
                width: '0', 
                duration: 0.5, 
                ease: "power2.inOut",
                delay: 0.1
            });
        } else {
            sidebar.style.width = '0';
        }
    }
}

// Show content based on tab/button index with enhanced animations
function showContent(index) {
    // Hide all content elements with fade-out animation
    const contentElements = document.querySelectorAll('.contenuto');
    
    if (typeof gsap !== 'undefined') {
        gsap.to(contentElements, { 
            opacity: 0, 
            y: 20, 
            duration: 0.3,
            onComplete: function() {
                // After fade out, hide elements and show the selected one
                contentElements.forEach((element, i) => {
                    element.classList.remove('active-content');
                    element.style.display = 'none';
                    
                    // If this is the selected element, prepare to show it
                    if (i === index) {
                        element.style.display = 'block';
                        
                        // Animate the selected content in
                        gsap.fromTo(element, 
                            { opacity: 0, y: 20 },
                            { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: "power2.out" }
                        );
                        element.classList.add('active-content');
                    }
                });
                
                // Update all elements with the same ID (for podcast content sections)
                const allContentElements = document.querySelectorAll(`[id^="contenuto"]`);
                allContentElements.forEach(element => {
                    if (element.id === `contenuto${index + 1}`) {
                        element.classList.remove('nascondi');
                        element.style.display = '';
                    } else if (element.id.startsWith('contenuto')) {
                        element.classList.add('nascondi');
                    }
                });
                
                // Update carousel for podcast page
                const radioButtons = document.querySelectorAll('input[name="slider"]');
                if (radioButtons.length > index) {
                    radioButtons[index].checked = true;
                }
                
                // Update graphs if on teoria page
                updateTheoryGraphs(index);
            }
        });
    } else {
        // Fallback for when GSAP is not available
        contentElements.forEach((element, i) => {
            element.classList.remove('active-content');
            element.style.display = 'none';
            
            if (i === index) {
                element.style.display = 'block';
                element.classList.add('active-content');
            }
        });
        
        // Update all elements with the same ID (for podcast content sections)
        const allContentElements = document.querySelectorAll(`[id^="contenuto"]`);
        allContentElements.forEach(element => {
            if (element.id === `contenuto${index + 1}`) {
                element.classList.remove('nascondi');
                element.style.display = '';
            } else if (element.id.startsWith('contenuto')) {
                element.classList.add('nascondi');
            }
        });
        
        // Update carousel for podcast page
        const radioButtons = document.querySelectorAll('input[name="slider"]');
        if (radioButtons.length > index) {
            radioButtons[index].checked = true;
        }
        
        // Update graphs if on teoria page
        updateTheoryGraphs(index);
    }
}

// Initialize Home Page elements
function initHomePage() {
    // Create enhanced interactive hero graph animation
    animateHeroGraph();
    
    // Initialize interactive graph in highlighted section
    initInteractiveGraph();
    
    // Add parallax effects to the hero section
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.to('.hero-content', {
            y: 100,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
        
        gsap.to('.hero-visual', {
            y: 50,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }
    
    // Add scroll reveal animations for features
    const featureCards = document.querySelectorAll('.feature-card');
    if (featureCards.length && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        featureCards.forEach(card => {
            ScrollTrigger.create({
                trigger: card,
                start: 'top 80%',
                onEnter: () => {
                    gsap.fromTo(card, 
                        { y: 50, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
                    );
                },
                once: true
            });
        });
    }
}

// Initialize About Page elements with enhanced animations
function initAboutPage() {
    if (typeof gsap !== 'undefined') {
        // Animate team member cards
        const teamCards = document.querySelectorAll('.team-card');
        gsap.from(teamCards, {
            opacity: 0,
            y: 50,
            stagger: 0.2,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.team-grid',
                start: 'top 80%'
            }
        });
        
        // Animate timeline items
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            const direction = index % 2 === 0 ? -30 : 30;
            gsap.from(item, {
                opacity: 0,
                x: direction,
                duration: 0.8,
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%'
                }
            });
        });
    }
}

// Animate the hero section graph with enhanced effects
function animateHeroGraph() {
    const limitCurve = document.getElementById('limitCurve');
    const limitPoint = document.getElementById('limitPoint');
    const asymptote = document.getElementById('asymptote');
    
    if (limitCurve && limitPoint && asymptote && typeof gsap !== 'undefined') {
        // Create timeline for sequence animations
        const tl = gsap.timeline();
        
        // Animate the curve with a drawing effect
        tl.from(limitCurve, {
            attr: { d: 'M100,250 Q150,250 250,250 Q350,250 400,250' },
            duration: 2,
            ease: 'power2.out'
        });
        
        // Animate the limit point
        tl.from(limitPoint, {
            attr: { cy: 250, r: 0 },
            duration: 1,
            ease: 'elastic.out(1, 0.3)'
        }, "-=0.5");
        
        // Animate the asymptote
        tl.from(asymptote, {
            attr: { 'stroke-dasharray': '0,10' },
            duration: 1,
            ease: 'power1.inOut'
        }, "-=0.7");
        
        // Add a pulsing animation to the limit point
        gsap.to(limitPoint, {
            attr: { r: 8 },
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}

// Initialize the interactive graph in the home page with enhanced interactivity
function initInteractiveGraph() {
    const graphContainer = document.getElementById('interactiveGraph');
    const limitSlider = document.getElementById('limitSlider');
    
    if (graphContainer && limitSlider) {
        // Create canvas for the graph
        const canvas = document.createElement('canvas');
        canvas.width = graphContainer.clientWidth;
        canvas.height = graphContainer.clientHeight;
        graphContainer.appendChild(canvas);
        
        // Initialize chart if Chart.js is available
        if (typeof Chart !== 'undefined') {
            const ctx = canvas.getContext('2d');
            
            // Initial data
            const data = generateLimitData(50);
            
            // Get theme colors based on current theme
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
            const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
            const cardBg = getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim();
            
            // Create chart with modern styling
            const limitChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.x,
                    datasets: [{
                        label: 'f(x)',
                        data: data.y,
                        borderColor: accentColor,
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: {
                                color: borderColor
                            },
                            ticks: {
                                color: textColor
                            }
                        },
                        y: {
                            grid: {
                                color: borderColor
                            },
                            ticks: {
                                color: textColor
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: cardBg,
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: borderColor,
                            borderWidth: 1,
                            padding: 10,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                title: function(tooltipItems) {
                                    return 'x = ' + tooltipItems[0].label;
                                },
                                label: function(context) {
                                    return 'f(x) = ' + context.raw;
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
            
            // Update chart on slider change with smooth animation
            limitSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                const newData = generateLimitData(value);
                
                limitChart.data.labels = newData.x;
                limitChart.data.datasets[0].data = newData.y;
                limitChart.update('active');
                
                // Add visual feedback for slider movement if GSAP is available
                if (typeof gsap !== 'undefined') {
                    gsap.to(this, {
                        '--slider-progress': value + '%',
                        duration: 0.2,
                        ease: 'power1.out'
                    });
                }
            });
            
            // Make the chart responsive to window resize
            window.addEventListener('resize', function() {
                canvas.width = graphContainer.clientWidth;
                canvas.height = graphContainer.clientHeight;
                limitChart.resize();
            });
            
            // Handle theme changes to update chart colors
            document.addEventListener('themeChanged', function() {
                const newTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
                const newAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
                const newBorderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
                const newCardBg = getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim();
                
                limitChart.data.datasets[0].borderColor = newAccentColor;
                limitChart.options.scales.x.grid.color = newBorderColor;
                limitChart.options.scales.y.grid.color = newBorderColor;
                limitChart.options.scales.x.ticks.color = newTextColor;
                limitChart.options.scales.y.ticks.color = newTextColor;
                limitChart.options.plugins.tooltip.backgroundColor = newCardBg;
                limitChart.options.plugins.tooltip.titleColor = newTextColor;
                limitChart.options.plugins.tooltip.bodyColor = newTextColor;
                limitChart.options.plugins.tooltip.borderColor = newBorderColor;
                
                limitChart.update();
            });
        }
    }
}

// Generate data for the limit visualization
function generateLimitData(limitValue) {
    // Maps 0-100 slider to 0-2 x-value for the limit point
    const limitPoint = limitValue / 50;
    
    // Create x-values array
    const xValues = Array.from({ length: 100 }, (_, i) => (i - 50) / 25);
    
    // Create y-values based on the function: f(x) = 1/(x - limitPoint) + 1
    const yValues = xValues.map(x => {
        // Avoid division by zero or very small numbers
        if (Math.abs(x - limitPoint) < 0.05) {
            return null; // Create a gap in the graph
        }
        return 1 / (x - limitPoint) + 1;
    });
    
    // Filter out extreme values for better visualization
    return {
        x: xValues,
        y: yValues.map(y => {
            if (y === null) return null;
            if (y > 10) return 10;
            if (y < -10) return -10;
            return y;
        })
    };
}