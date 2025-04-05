// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animation library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set theme toggle checkbox state based on saved theme
    const themeToggle = document.getElementById('check');
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'dark';
        updateThemeIcon(savedTheme);
    }

    // Initialize interactive elements based on current page
    initCurrentPageFeatures();

    // Add event listeners for interactive elements
    setupEventListeners();
});

// Initialize page-specific features
function initCurrentPageFeatures() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop();

    // Remove ".html" from the page name if it exists
    const pageBaseName = pageName.replace('.html', '');

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
            // No special initialization needed for chi-siamo page
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
        });
    });

    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabIndex = Array.from(tabButtons).indexOf(this);
            showContent(tabIndex);

            // Update active tab styling
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
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
            
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Podcast player controls
    setupPodcastControls();
}

// Toggle theme between light and dark
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Animate theme transition with GSAP if available
    if (typeof gsap !== 'undefined') {
        gsap.to('body', {
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue(`--bg-color`),
            color: getComputedStyle(document.documentElement).getPropertyValue(`--text-color`),
            duration: 0.5,
            ease: 'power2.out'
        });
    }
    
    // Set theme attribute and save preference
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme icon
    updateThemeIcon(newTheme);
}

// Update theme icon based on current theme
function updateThemeIcon(theme) {
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    if (moonIcon && sunIcon) {
        if (theme === 'dark') {
            moonIcon.style.opacity = '0';
            sunIcon.style.opacity = '1';
        } else {
            moonIcon.style.opacity = '1';
            sunIcon.style.opacity = '0';
        }
    }
}

// Open the sidebar navigation
function openNav() {
    const sidebar = document.getElementById("mySidebar");
    if (sidebar) {
        sidebar.classList.add("active");
        
        // Animate sidebar links if AOS is available
        if (typeof AOS !== "undefined") {
            const links = sidebar.querySelectorAll(".sidebar-link");
            links.forEach((link, index) => {
                setTimeout(() => {
                    link.setAttribute("data-aos", "fade-right");
                    AOS.refresh();
                }, index * 100);
            });
        }
    }
}

// Close the sidebar navigation
function closeNav() {
    const sidebar = document.getElementById("mySidebar");
    if (sidebar) {
        sidebar.classList.remove("active");
    }
}

// Show content based on tab/button index
function showContent(index) {
    // Hide all content elements
    const contentElements = document.querySelectorAll('.contenuto');
    contentElements.forEach(element => {
        element.classList.remove('active-content');
        element.style.display = 'none';
    });
    
    // Show the selected content
    const selectedContent = document.getElementById(`contenuto${index + 1}`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
        selectedContent.classList.add('active-content');
    }
    
    // Update carousel for podcast page
    const radioButtons = document.querySelectorAll('input[name="slider"]');
    if (radioButtons.length > index) {
        radioButtons[index].checked = true;
    }
    
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
    
    // Update graphs if on teoria page
    updateTheoryGraphs(index);
}

// Initialize Home Page elements
function initHomePage() {
    // Create interactive hero graph animation
    animateHeroGraph();
    
    // Initialize interactive graph in highlighted section
    initInteractiveGraph();
}

// Initialize Teoria Page elements
function initTeoriaPage() {
    // Initialize epsilon-delta visualization
    initLimitVisualization();
    
    // Initialize example graphs
    initExampleGraphs();
    
    // Show first content by default
    showContent(0);
}

// Initialize Esercizi Page elements
function initEserciziPage() {
    // Initialize limit calculator
    initLimitCalculator();
}

// Initialize Limiti Sociali Page elements
function initLimitiSocialiPage() {
    // Initialize charts for examples
    initSocialLimitsCharts();
    
    // Initialize population growth interactive graph
    initPopulationGrowthGraph();
}

// Initialize Podcast Page elements
function initPodcastPage() {
    // Show first podcast by default
    showContent(0);
    
    // Initialize audio context if Tone.js is available
    initAudioContext();
}

// Initialize Resolution Page elements
function initResolutionPage(pageName) {
    // Add any specific initialization for resolution pages
    // This could include setting up animations or interactive elements
}

// Animate the hero section graph
function animateHeroGraph() {
    const limitCurve = document.getElementById('limitCurve');
    const limitPoint = document.getElementById('limitPoint');
    const asymptote = document.getElementById('asymptote');
    
    if (limitCurve && limitPoint && asymptote && typeof gsap !== 'undefined') {
        // Animate the curve
        gsap.from(limitCurve, {
            attr: { d: 'M100,250 Q150,250 250,250 Q350,250 400,250' },
            duration: 2,
            ease: 'power2.out'
        });
        
        // Animate the limit point
        gsap.from(limitPoint, {
            attr: { cy: 250 },
            duration: 2,
            ease: 'power2.out',
            delay: 0.5
        });
        
        // Animate the asymptote
        gsap.from(asymptote, {
            attr: { 'stroke-dasharray': '0,10' },
            duration: 1.5,
            ease: 'power1.inOut',
            delay: 1
        });
    }
}

// Initialize the interactive graph in the home page
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
            
            // Create chart
            const limitChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.x,
                    datasets: [{
                        label: 'f(x)',
                        data: data.y,
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
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
                                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                            },
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                            }
                        },
                        y: {
                            grid: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                            },
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                            }
                        }
                    },
                    animation: {
                        duration: 1000
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim(),
                            titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
                            bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
                            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim(),
                            borderWidth: 1
                        }
                    }
                }
            });
            
            // Update chart on slider change
            limitSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                const newData = generateLimitData(value);
                
                limitChart.data.labels = newData.x;
                limitChart.data.datasets[0].data = newData.y;
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

// Initialize the limit visualization on teoria page
function initLimitVisualization() {
    const limitVisualization = document.getElementById('limitVisualization');
    const epsilonSlider = document.getElementById('epsilonSlider');
    const deltaSlider = document.getElementById('deltaSlider');
    const epsilonValue = document.getElementById('epsilonValue');
    const deltaValue = document.getElementById('deltaValue');
    
    if (limitVisualization && epsilonSlider && deltaSlider) {
        // Create canvas for the visualization
        const canvas = document.createElement('canvas');
        canvas.width = limitVisualization.clientWidth;
        canvas.height = limitVisualization.clientHeight;
        limitVisualization.appendChild(canvas);
        
        // Initialize chart if Chart.js is available
        if (typeof Chart !== 'undefined') {
            const ctx = canvas.getContext('2d');
            
            // Initial values
            let epsilon = 0.1;
            let delta = 0.2;
            
            // Update displayed values
            if (epsilonValue) epsilonValue.textContent = epsilon.toFixed(2);
            if (deltaValue) deltaValue.textContent = delta.toFixed(2);
            
            // Create chart data
            const data = {
                labels: Array.from({ length: 200 }, (_, i) => i / 20 - 5),
                datasets: [
                    {
                        // Main function
                        label: 'f(x)',
                        data: Array.from({ length: 200 }, (_, i) => {
                            const x = i / 20 - 5;
                            // Example function: f(x) = x^2
                            return x * x;
                        }),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                        backgroundColor: 'transparent',
                        tension: 0,
                        pointRadius: 0,
                        borderWidth: 2
                    },
                    {
                        // Horizontal line at y = L + epsilon
                        label: 'L + ε',
                        data: Array.from({ length: 200 }, () => 4 + epsilon),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim(),
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0,
                        pointRadius: 0,
                        borderWidth: 1
                    },
                    {
                        // Horizontal line at y = L - epsilon
                        label: 'L - ε',
                        data: Array.from({ length: 200 }, () => 4 - epsilon),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim(),
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0,
                        pointRadius: 0,
                        borderWidth: 1
                    },
                    {
                        // Vertical line at x = a + delta
                        label: 'a + δ',
                        data: Array.from({ length: 200 }, (_, i) => {
                            const y = i / 20 - 5;
                            return (Math.abs(2 + delta - (i / 20 - 5)) < 0.05) ? y : null;
                        }),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--error-color').trim(),
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0,
                        pointRadius: 0,
                        borderWidth: 1
                    },
                    {
                        // Vertical line at x = a - delta
                        label: 'a - δ',
                        data: Array.from({ length: 200 }, (_, i) => {
                            const y = i / 20 - 5;
                            return (Math.abs(2 - delta - (i / 20 - 5)) < 0.05) ? y : null;
                        }),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--error-color').trim(),
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0,
                        pointRadius: 0,
                        borderWidth: 1
                    },
                    {
                        // Point at (a, L)
                        label: 'Limit Point (a, L)',
                        data: [{ x: 2, y: 4 }],
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                        tension: 0,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        showLine: false
                    }
                ]
            };
            
            // Create chart
            const limitChart = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                            },
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                            }
                        },
                        y: {
                            grid: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                            },
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                            }
                        }
                    },
                    animation: {
                        duration: 1000
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim(),
                            titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
                            bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
                            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim(),
                            borderWidth: 1
                        }
                    }
                }
            });
            
            // Update chart on epsilon slider change
            epsilonSlider.addEventListener('input', function() {
                epsilon = parseInt(this.value) / 100;
                epsilonValue.textContent = epsilon.toFixed(2);
                
                // Update epsilon lines
                limitChart.data.datasets[1].data = Array.from({ length: 200 }, () => 4 + epsilon);
                limitChart.data.datasets[2].data = Array.from({ length: 200 }, () => 4 - epsilon);
                limitChart.update();
            });
            
            // Update chart on delta slider change
            deltaSlider.addEventListener('input', function() {
                delta = parseInt(this.value) / 100;
                deltaValue.textContent = delta.toFixed(2);
                
                // Update delta lines
                limitChart.data.datasets[3].data = Array.from({ length: 200 }, (_, i) => {
                    const y = i / 20 - 5;
                    return (Math.abs(2 + delta - (i / 20 - 5)) < 0.05) ? y : null;
                });
                limitChart.data.datasets[4].data = Array.from({ length: 200 }, (_, i) => {
                    const y = i / 20 - 5;
                    return (Math.abs(2 - delta - (i / 20 - 5)) < 0.05) ? y : null;
                });
                limitChart.update();
            });
        }
    }
}

// Initialize example graphs on the teoria page
function initExampleGraphs() {
    // Initialize separate graph for each example
    initConstantLimitGraph();
    initIdentityLimitGraph();
    initPolynomialLimitGraph();
    initSqrtLimitGraph();
    initLogLimitGraph();
}

// Update theory graphs when changing tabs
function updateTheoryGraphs(index) {
    // Implement graph updates when switching tabs if needed
}

// Initialize constant limit graph
function initConstantLimitGraph() {
    const graphContainer = document.getElementById('constantLimitGraph');
    if (!graphContainer || typeof Chart === 'undefined') return;
    
    const canvas = document.createElement('canvas');
    graphContainer.appendChild(canvas);
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: Array.from({ length: 100 }, (_, i) => i / 10 - 5),
            datasets: [{
                label: 'f(x) = c',
                data: Array.from({ length: 100 }, () => 3), // Constant function f(x) = 3
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                backgroundColor: 'transparent',
                tension: 0,
                pointRadius: 0,
                borderWidth: 3
            }]
        },
        options: createStandardChartOptions()
    });
}

// Initialize identity limit graph
function initIdentityLimitGraph() {
    const graphContainer = document.getElementById('identityLimitGraph');
    if (!graphContainer || typeof Chart === 'undefined') return;
    
    const canvas = document.createElement('canvas');
    graphContainer.appendChild(canvas);
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: Array.from({ length: 100 }, (_, i) => i / 10 - 5),
            datasets: [{
                label: 'f(x) = x',
                data: Array.from({ length: 100 }, (_, i) => i / 10 - 5), // Identity function f(x) = x
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                backgroundColor: 'transparent',
                tension: 0,
                pointRadius: 0,
                borderWidth: 3
            }]
        },
        options: createStandardChartOptions()
    });
}

// Initialize polynomial limit graph
function initPolynomialLimitGraph() {
    const graphContainer = document.getElementById('polynomialLimitGraph');
    if (!graphContainer || typeof Chart === 'undefined') return;
    
    const canvas = document.createElement('canvas');
    graphContainer.appendChild(canvas);
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: Array.from({ length: 100 }, (_, i) => i / 10 - 5),
            datasets: [{
                label: 'f(x) = x²',
                data: Array.from({ length: 100 }, (_, i) => Math.pow(i / 10 - 5, 2)), // Polynomial function f(x) = x²
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                backgroundColor: 'transparent',
                tension: 0,
                pointRadius: 0,
                borderWidth: 3
            }]
        },
        options: createStandardChartOptions()
    });
}

// Initialize sqrt limit graph
function initSqrtLimitGraph() {
    const graphContainer = document.getElementById('sqrtLimitGraph');
    if (!graphContainer || typeof Chart === 'undefined') return;
    
    const canvas = document.createElement('canvas');
    graphContainer.appendChild(canvas);
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: Array.from({ length: 100 }, (_, i) => i / 10),
            datasets: [{
                label: 'f(x) = √x',
                data: Array.from({ length: 100 }, (_, i) => {
                    const x = i / 10;
                    return x >= 0 ? Math.sqrt(x) : null;
                }), // Square root function f(x) = √x
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                backgroundColor: 'transparent',
                tension: 0,
                pointRadius: 0,
                borderWidth: 3
            }]
        },
        options: createStandardChartOptions()
    });
}

// Initialize logarithm limit graph
function initLogLimitGraph() {
    const graphContainer = document.getElementById('logLimitGraph');
    if (!graphContainer || typeof Chart === 'undefined') return;
    
    const canvas = document.createElement('canvas');
    graphContainer.appendChild(canvas);
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: Array.from({ length: 100 }, (_, i) => i / 10 - 1),
            datasets: [{
                label: 'f(x) = ln(1+x)/x',
                data: Array.from({ length: 100 }, (_, i) => {
                    const x = i / 10 - 1;
                    // Avoid division by zero and negative logarithm
                    if (x === 0 || 1 + x <= 0) return null;
                    return Math.log(1 + x) / x;
                }),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                backgroundColor: 'transparent',
                tension: 0,
                pointRadius: 0,
                borderWidth: 3
            }]
        },
        options: createStandardChartOptions()
    });
}

// Standard chart options for consistent appearance
function createStandardChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                },
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                }
            },
            y: {
                grid: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                },
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                }
            }
        },
        animation: {
            duration: 1000
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim(),
                titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
                bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim(),
                borderWidth: 1
            }
        }
    };
}

// Initialize the limit calculator
function initLimitCalculator() {
    const calculateBtn = document.getElementById('calculate-btn');
    const graphBtn = document.getElementById('graph-btn');
    const functionInput = document.getElementById('function-input');
    const approachPoint = document.getElementById('approach-point');
    const limitResult = document.getElementById('limit-result');
    const limitGraph = document.getElementById('limit-graph');
    
    if (calculateBtn && functionInput && approachPoint && limitResult) {
        calculateBtn.addEventListener('click', function() {
            const func = functionInput.value.trim();
            const point = approachPoint.value.trim();
            
            if (!func || !point) {
                limitResult.innerHTML = '<span class="error-text">Inserisci sia la funzione che il punto!</span>';
                return;
            }
            
            try {
                // This is a simplified calculator for demonstration
                // In a real application, you'd use a proper math library to evaluate limits
                
                // Display a simulated result based on input
                limitResult.innerHTML = `<span class="result-success">Il limite di ${func} per x → ${point} è ${calculateSimplifiedLimit(func, point)}</span>`;
            } catch (error) {
                limitResult.innerHTML = `<span class="error-text">Errore: ${error.message}</span>`;
            }
        });
        
        if (graphBtn && limitGraph) {
            graphBtn.addEventListener('click', function() {
                const func = functionInput.value.trim();
                const point = approachPoint.value.trim();
                
                if (!func || !point) {
                    limitResult.innerHTML = '<span class="error-text">Inserisci sia la funzione che il punto!</span>';
                    return;
                }
                
                // Create a graph for the function
                createFunctionGraph(func, point, limitGraph);
            });
        }
    }
}

// Simplified limit calculator for demonstration
function calculateSimplifiedLimit(func, point) {
    // Convert point to number if possible
    const numPoint = parseFloat(point);
    
    // Simple cases for demonstration
    if (func === 'x^2' && !isNaN(numPoint)) {
        return numPoint * numPoint;
    } else if (func === 'sin(x)' && !isNaN(numPoint)) {
        return Math.sin(numPoint);
    } else if (func === '1/x' && numPoint === 0) {
        return '∞ (Infinity)';
    } else if (func === 'ln(1+x)/x' && numPoint === 0) {
        return '1';
    } else if (func === 'sqrt(x)' && numPoint === 0) {
        return '0';
    } else {
        // For other functions, return a placeholder
        return 'non calcolabile con questo strumento semplificato';
    }
}

// Create a graph for the given function
function createFunctionGraph(func, point, container) {
    // Clear previous graph
    container.innerHTML = '';
    
    // Create canvas for the graph
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    if (typeof Chart !== 'undefined') {
        const ctx = canvas.getContext('2d');
        
        // Generate data based on the function
        const data = generateFunctionData(func, parseFloat(point));
        
        // Create chart
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.x,
                datasets: [{
                    label: `f(x) = ${func}`,
                    data: data.y,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                    backgroundColor: 'transparent',
                    tension: 0,
                    pointRadius: 0,
                    borderWidth: 3
                }]
            },
            options: createStandardChartOptions()
        });
    }
}

// Generate data for a given function
function generateFunctionData(func, point) {
    // Default range
    let xMin = point - 5;
    let xMax = point + 5;
    
    // Adjust for specific functions
    if (func === '1/x' && point === 0) {
        xMin = -5;
        xMax = 5;
    }
    
    // Generate x values
    const xValues = Array.from({ length: 200 }, (_, i) => xMin + (i / 199) * (xMax - xMin));
    
    // Generate y values based on the function
    const yValues = xValues.map(x => {
        try {
            // Simple function evaluation for demonstration
            if (func === 'x^2') {
                return x * x;
            } else if (func === 'sin(x)') {
                return Math.sin(x);
            } else if (func === '1/x') {
                return x !== 0 ? 1 / x : null;
            } else if (func === 'ln(1+x)/x') {
                return x !== 0 && 1 + x > 0 ? Math.log(1 + x) / x : null;
            } else if (func === 'sqrt(x)') {
                return x >= 0 ? Math.sqrt(x) : null;
            } else {
                // Default to x for unknown functions
                return x;
            }
        } catch (e) {
            return null;
        }
    });
    
    return {
        x: xValues,
        y: yValues
    };
}

// Initialize charts for the social limits page
function initSocialLimitsCharts() {
    // Environmental limits chart
    const envChart = document.getElementById('environmentalLimitsChart');
    if (envChart && typeof Chart !== 'undefined') {
        const canvas = document.createElement('canvas');
        envChart.appendChild(canvas);
        
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: Array.from({ length: 50 }, (_, i) => 1970 + i),
                datasets: [{
                    label: 'Utilizzo delle Risorse',
                    data: Array.from({ length: 50 }, (_, i) => {
                        const x = i / 49;
                        return 20 + 60 * (1 - 1 / (1 + Math.exp(10 * (x - 0.7))));
                    }),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 3
                }, {
                    label: 'Limite Sostenibile',
                    data: Array.from({ length: 50 }, () => 70),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--error-color').trim(),
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0,
                    pointRadius: 0,
                    borderWidth: 2
                }]
            },
            options: createStandardChartOptions()
        });
    }
    
    // Economic limits chart
    const econChart = document.getElementById('economicLimitsChart');
    if (econChart && typeof Chart !== 'undefined') {
        const canvas = document.createElement('canvas');
        econChart.appendChild(canvas);
        
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: Array.from({ length: 20 }, (_, i) => i + 1),
                datasets: [{
                    label: 'Produttività Marginale',
                    data: Array.from({ length: 20 }, (_, i) => {
                        const x = i + 1;
                        return 100 / (1 + 0.1 * x);
                    }),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 3
                }]
            },
            options: createStandardChartOptions()
        });
    }
    
    // Cognitive limits chart
    const cogChart = document.getElementById('cognitiveLimitsChart');
    if (cogChart && typeof Chart !== 'undefined') {
        const canvas = document.createElement('canvas');
        cogChart.appendChild(canvas);
        
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: Array.from({ length: 15 }, (_, i) => i + 1),
                datasets: [{
                    label: 'Memoria a Breve Termine',
                    data: Array.from({ length: 15 }, (_, i) => {
                        const x = i + 1;
                        return 9 * (1 - Math.exp(-0.5 * x));
                    }),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim(),
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 3
                }]
            },
            options: createStandardChartOptions()
        });
    }
    
    // Technological limits chart
    const techChart = document.getElementById('technologicalLimitsChart');
    if (techChart && typeof Chart !== 'undefined') {
        const canvas = document.createElement('canvas');
        techChart.appendChild(canvas);
        
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: Array.from({ length: 20 }, (_, i) => 2000 + i),
                datasets: [{
                    label: 'Transistor per Chip (miliardi)',
                    data: Array.from({ length: 20 }, (_, i) => {
                        const year = 2000 + i;
                        if (year <= 2023) {
                            return 0.01 * Math.pow(2, (year - 2000) / 1.8);
                        } else {
                            // Physical limit projection
                            return 50 * (1 - Math.exp(-(year - 2023) / 5));
                        }
                    }),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 3
                }]
            },
            options: createStandardChartOptions()
        });
    }
}

// Initialize population growth graph
function initPopulationGrowthGraph() {
    const graphContainer = document.getElementById('populationGrowthGraph');
    const growthRateSlider = document.getElementById('growthRateSlider');
    
    if (graphContainer && growthRateSlider && typeof Chart !== 'undefined') {
        const canvas = document.createElement('canvas');
        graphContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // Initial growth rate
        let growthRate = 0.1;
        
        // Create chart data
        const years = Array.from({ length: 200 }, (_, i) => 1900 + i);
        const populationData = generatePopulationData(growthRate);
        
        // Create chart
        const populationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Popolazione (miliardi)',
                    data: populationData,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 3
                }, {
                    label: 'Capacità Portante',
                    data: Array.from({ length: 200 }, () => 11),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--error-color').trim(),
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0,
                    pointRadius: 0,
                    borderWidth: 2
                }]
            },
            options: createStandardChartOptions()
        });
        
        // Update chart on slider change
        growthRateSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            growthRate = value / 500; // Range from 0.002 to 0.2
            
            const newData = generatePopulationData(growthRate);
            populationChart.data.datasets[0].data = newData;
            populationChart.update();
        });
    }
}

// Generate population data based on logistic growth
function generatePopulationData(growthRate) {
    const carryingCapacity = 11; // in billions
    const initialPopulation = 1.6; // in billions (approximate world population in 1900)
    const a = (carryingCapacity - initialPopulation) / initialPopulation;
    
    return Array.from({ length: 200 }, (_, i) => {
        const t = i; // years since 1900
        return carryingCapacity / (1 + a * Math.exp(-growthRate * t));
    });
}

// Filter exercises by difficulty
function filterExercises(difficulty) {
    const exercises = document.querySelectorAll('.esercizio-card');
    
    exercises.forEach(exercise => {
        if (difficulty === 'all' || exercise.getAttribute('data-difficulty') === difficulty) {
            exercise.style.display = 'block';
            
            // Animate the display if AOS is available
            if (typeof AOS !== 'undefined') {
                exercise.setAttribute('data-aos', 'zoom-in');
                AOS.refresh();
            }
        } else {
            exercise.style.display = 'none';
        }
    });
}

// Show solution modal
function showSolutionModal(solution) {
    const modal = document.getElementById('solutionModal');
    const content = document.getElementById('solution-content');
    
    if (modal && content) {
        content.textContent = solution;
        modal.style.display = 'block';
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target === modal) {
                closeSolutionModal();
            }
        };
    }
}

// Close solution modal
function closeSolutionModal() {
    const modal = document.getElementById('solutionModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Setup podcast player controls
function setupPodcastControls() {
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const playbackSpeed = document.getElementById('playbackSpeed');
    
    // Play/pause button
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('fa-play')) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
                simulatePlayPodcast();
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                simulatePausePodcast();
            }
        });
    }
    
    // Previous track button
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            const currentPodcastIndex = getCurrentPodcastIndex();
            if (currentPodcastIndex > 0) {
                showContent(currentPodcastIndex - 1);
            }
        });
    }
    
    // Next track button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const currentPodcastIndex = getCurrentPodcastIndex();
            if (currentPodcastIndex < 6) { // 7 podcasts total (0-6)
                showContent(currentPodcastIndex + 1);
            }
        });
    }
    
    // Rewind button
    if (rewindBtn) {
        rewindBtn.addEventListener('click', function() {
            // Simulate rewinding by adjusting progress
            const progressBar = getActiveProgressBar();
            if (progressBar) {
                let currentProgress = parseInt(progressBar.value);
                currentProgress = Math.max(0, currentProgress - 10);
                updateProgress(progressBar, currentProgress);
            }
        });
    }
    
    // Forward button
    if (forwardBtn) {
        forwardBtn.addEventListener('click', function() {
            // Simulate forwarding by adjusting progress
            const progressBar = getActiveProgressBar();
            if (progressBar) {
                let currentProgress = parseInt(progressBar.value);
                currentProgress = Math.min(100, currentProgress + 10);
                updateProgress(progressBar, currentProgress);
            }
        });
    }
    
    // Volume slider
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            const volume = parseInt(this.value) / 100;
            updateVolumeIcon(volume);
            // In a real app, this would adjust the audio volume
        });
    }
    
    // Playback speed
    if (playbackSpeed) {
        playbackSpeed.addEventListener('change', function() {
            // In a real app, this would adjust the playback speed
        });
    }
}

// Get the currently active podcast index
function getCurrentPodcastIndex() {
    const radioButtons = document.querySelectorAll('input[name="slider"]');
    for (let i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            return i;
        }
    }
    return 0; // Default to first podcast
}

// Get the active progress bar
function getActiveProgressBar() {
    const index = getCurrentPodcastIndex();
    const progressWrapper = document.querySelector(`#contenuto${index + 1}:not(.nascondi) .card__wrapper`);
    if (progressWrapper) {
        return progressWrapper.querySelector('progress');
    }
    return null;
}

// Update progress bar
function updateProgress(progressBar, value) {
    if (progressBar) {
        progressBar.value = value;
        
        // Update time displays
        const wrapper = progressBar.closest('.card__wrapper');
        if (wrapper) {
            const timePassed = wrapper.querySelector('.card__time-passed');
            const timeLeft = wrapper.querySelector('.card__time-left');
            
            if (timePassed && timeLeft) {
                // Example duration: 30 minutes (1800 seconds)
                const totalDuration = 1800;
                const passedSeconds = Math.floor(totalDuration * value / 100);
                const leftSeconds = totalDuration - passedSeconds;
                
                timePassed.textContent = formatTime(passedSeconds);
                timeLeft.textContent = formatTime(leftSeconds);
            }
        }
    }
}

// Format time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update volume icon based on volume level
function updateVolumeIcon(volume) {
    const volumeIcon = document.getElementById('volumeIcon');
    if (volumeIcon) {
        volumeIcon.className = ''; // Clear existing classes
        
        if (volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }
}

// Simulate playing a podcast
function simulatePlayPodcast() {
    // Simulate progress updating
    const progressBar = getActiveProgressBar();
    if (progressBar) {
        // Start updating progress
        window.podcastInterval = setInterval(() => {
            let currentProgress = parseInt(progressBar.value);
            currentProgress = Math.min(100, currentProgress + 1);
            updateProgress(progressBar, currentProgress);
            
            if (currentProgress >= 100) {
                clearInterval(window.podcastInterval);
                const playBtn = document.getElementById('playBtn');
                if (playBtn) {
                    const icon = playBtn.querySelector('i');
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                }
            }
        }, 1000); // Update every second
    }
}

// Simulate pausing a podcast
function simulatePausePodcast() {
    // Stop progress updating
    clearInterval(window.podcastInterval);
}

// Initialize audio context for podcast
function initAudioContext() {
    if (typeof Tone !== 'undefined') {
        Tone.start();
        
        // For demonstration purposes
        // In a real app, this would load and play actual audio files
    }
}
