// Visualization.js - Handles 2D, 3D graphs and animations
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const vizTabBtns = document.querySelectorAll('.viz-tab-btn');
    const vizPanels = document.querySelectorAll('.viz-panel');
    
    // Graph Controls
    const zoomSlider = document.getElementById('zoom-slider');
    const showGrid = document.getElementById('show-grid');
    const showPoint = document.getElementById('show-point');
    const rotationSpeed = document.getElementById('rotation-speed');
    const autoRotate = document.getElementById('auto-rotate');
    const showWireframe = document.getElementById('show-wireframe');
    const animationSpeed = document.getElementById('animation-speed');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetAnimationBtn = document.getElementById('reset-animation-btn');
    
    // Canvas elements
    const canvas2D = document.getElementById('graph2d-canvas');
    const container3D = document.getElementById('graph3d-container');
    const animationCanvas = document.getElementById('animation-canvas');
    
    // Chart.js instance
    let chart2D = null;
    
    // Three.js variables
    let scene, camera, renderer, controls, surface, axesHelper;
    let isAnimating = false;
    
    // Animation variables
    let animationChart = null;
    let animationFrame = 0;
    let isPlaying = false;
    let animationTimer = null;
    
    // Current function data
    let currentFunctionData = null;
    
    // Initialize visualization
    initTabs();
    init2DGraph();
    init3DGraph();
    initAnimation();
    initEventListeners();
    
    /**
     * Initialize tab switching functionality
     */
    function initTabs() {
        vizTabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and panels
                vizTabBtns.forEach(btn => btn.classList.remove('active'));
                vizPanels.forEach(panel => panel.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding panel
                this.classList.add('active');
                document.getElementById(`${tabId}-panel`).classList.add('active');
                
                // Resize charts and renderers when tab becomes visible
                if (tabId === 'graph2d' && chart2D) {
                    chart2D.resize();
                } else if (tabId === 'graph3d' && renderer) {
                    renderer.setSize(container3D.clientWidth, container3D.clientHeight);
                    camera.aspect = container3D.clientWidth / container3D.clientHeight;
                    camera.updateProjectionMatrix();
                } else if (tabId === 'animation' && animationChart) {
                    animationChart.resize();
                }
            });
        });
    }
    
    /**
     * Initialize 2D graph with Chart.js
     */
    function init2DGraph() {
        const ctx = canvas2D.getContext('2d');
        
        chart2D = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'f(x)',
                    data: [],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            display: true,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim(),
                        },
                        title: {
                            display: true,
                            text: 'x'
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            display: true,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim(),
                        },
                        title: {
                            display: true,
                            text: 'f(x)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `f(${context.parsed.x.toFixed(4)}) = ${context.parsed.y.toFixed(4)}`;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                animation: {
                    duration: 0 // General animation time
                },
                hover: {
                    animationDuration: 0 // duration of animations when hovering an item
                },
                responsiveAnimationDuration: 0 // animation duration after a resize
            }
        });
    }
    
    /**
     * Initialize 3D graph with Three.js
     */
    function init3DGraph() {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(
            getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim()
        );
        
        // Create camera
        camera = new THREE.PerspectiveCamera(75, container3D.clientWidth / container3D.clientHeight, 0.1, 1000);
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container3D.clientWidth, container3D.clientHeight);
        container3D.appendChild(renderer.domElement);
        
        // Add orbit controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        
        // Add axes helper
        axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Start animation loop
        animate3D();
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (renderer && container3D) {
                renderer.setSize(container3D.clientWidth, container3D.clientHeight);
                camera.aspect = container3D.clientWidth / container3D.clientHeight;
                camera.updateProjectionMatrix();
            }
        });
    }
    
    /**
     * Initialize limit animation
     */
    function initAnimation() {
        const ctx = animationCanvas.getContext('2d');
        
        animationChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'f(x)',
                        data: [],
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4
                    },
                    {
                        label: 'Punto limite',
                        data: [],
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                        borderWidth: 0,
                        pointRadius: 6,
                        pointStyle: 'circle',
                        showLine: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            display: true,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim(),
                        },
                        title: {
                            display: true,
                            text: 'x'
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            display: true,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim(),
                        },
                        title: {
                            display: true,
                            text: 'f(x)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
        
        // Initialize animation controls
        playBtn.addEventListener('click', function() {
            startAnimation();
        });
        
        pauseBtn.addEventListener('click', function() {
            pauseAnimation();
        });
        
        resetAnimationBtn.addEventListener('click', function() {
            resetAnimation();
        });
    }
    
    /**
     * Set up event listeners for visualization controls and limit calculation
     */
    function initEventListeners() {
        // 2D Graph Controls
        zoomSlider.addEventListener('input', function() {
            updateZoom(this.value);
        });
        
        showGrid.addEventListener('change', function() {
            updateGridDisplay(this.checked);
        });
        
        showPoint.addEventListener('change', function() {
            updateLimitPointDisplay(this.checked);
        });
        
        // 3D Graph Controls
        rotationSpeed.addEventListener('input', function() {
            updateRotationSpeed(this.value);
        });
        
        autoRotate.addEventListener('change', function() {
            controls.autoRotate = this.checked;
        });
        
        showWireframe.addEventListener('change', function() {
            updateWireframeDisplay(this.checked);
        });
        
        // Animation Controls
        animationSpeed.addEventListener('input', function() {
            updateAnimationSpeed(this.value);
        });
        
        // Listen for limit calculation event
        document.addEventListener('limitCalculated', function(e) {
            currentFunctionData = e.detail;
            updateVisualizations(currentFunctionData);
        });
        
        // Listen for reset event
        document.addEventListener('resetVisualization', function() {
            resetVisualizations();
        });
        
        // Theme change event
        document.addEventListener('themeChanged', function() {
            updateVisualizationColors();
        });
    }
    
    /**
     * Update all visualizations with new function data
     */
    function updateVisualizations(data) {
        if (!data || !data.function) return;
        
        try {
            // Update 2D graph
            update2DGraph(data);
            
            // Update 3D graph
            update3DGraph(data);
            
            // Update animation
            updateAnimation(data);
            
        } catch (e) {
            console.error('Error updating visualizations:', e);
        }
    }
    
    /**
     * Update the 2D graph with function data
     */
    function update2DGraph(data) {
        if (!chart2D) return;
        
        try {
            const func = data.function;
            const point = data.point;
            const direction = data.direction;
            let result = data.result;
            
            // Parse the function with math.js
            const parsedFunc = math.parse(func);
            const compiledFunc = parsedFunc.compile();
            
            // Determine x range based on the limit point
            let xMin, xMax;
            
            if (Math.abs(point) > 1e10) {
                // Handle infinity
                if (point > 0) {
                    xMin = 0;
                    xMax = 100;
                } else {
                    xMin = -100;
                    xMax = 0;
                }
            } else {
                // Regular point
                const zoomFactor = zoomSlider.value / 50; // 0.02 to 2
                const range = 10 / zoomFactor;
                xMin = point - range;
                xMax = point + range;
            }
            
            // Generate data points
            const points = [];
            const numPoints = 500;
            const step = (xMax - xMin) / (numPoints - 1);
            
            for (let i = 0; i < numPoints; i++) {
                const x = xMin + i * step;
                
                // Skip the exact limit point to handle discontinuities
                if (Math.abs(x - point) < 1e-10 && Math.abs(point) < 1e10) {
                    continue;
                }
                
                try {
                    const y = compiledFunc.evaluate({ x: x });
                    
                    // Filter out very large values and NaN
                    if (isFinite(y) && !isNaN(y) && Math.abs(y) < 1000) {
                        points.push({ x, y });
                    }
                } catch (e) {
                    // Skip points where the function is not defined
                }
            }
            
            // Update chart data
            chart2D.data.datasets[0].data = points;
            
            // Add limit point if it exists and is finite
            if (showPoint.checked && result !== null && (!result.exists === false)) {
                // Check if the result is an object with leftLimit and rightLimit
                if (typeof result === 'object' && result.leftLimit !== undefined && result.rightLimit !== undefined) {
                    // Add left and right limit points
                    chart2D.data.datasets[1] = {
                        label: 'Limite sinistro',
                        data: [{ x: point, y: result.leftLimit }],
                        backgroundColor: 'rgba(255, 99, 132, 1)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        pointRadius: 6,
                        pointStyle: 'circle',
                        showLine: false
                    };
                    
                    chart2D.data.datasets[2] = {
                        label: 'Limite destro',
                        data: [{ x: point, y: result.rightLimit }],
                        backgroundColor: 'rgba(54, 162, 235, 1)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        pointRadius: 6,
                        pointStyle: 'circle',
                        showLine: false
                    };
                } else if (isFinite(result)) {
                    // Just one limit point
                    chart2D.data.datasets[1] = {
                        label: 'Limite',
                        data: [{ x: point, y: result }],
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
                        pointRadius: 6,
                        pointStyle: 'circle',
                        showLine: false
                    };
                    
                    // Remove dataset 2 if it exists
                    if (chart2D.data.datasets.length > 2) {
                        chart2D.data.datasets.length = 2;
                    }
                } else {
                    // Remove limit point datasets
                    if (chart2D.data.datasets.length > 1) {
                        chart2D.data.datasets.length = 1;
                    }
                }
            } else {
                // Remove limit point datasets
                if (chart2D.data.datasets.length > 1) {
                    chart2D.data.datasets.length = 1;
                }
            }
            
            // Update chart options
            chart2D.options.scales.x.min = xMin;
            chart2D.options.scales.x.max = xMax;
            
            // Auto-adjust y scale to fit data
            const yValues = points.map(p => p.y).filter(y => isFinite(y));
            
            if (yValues.length > 0) {
                const yMin = Math.min(...yValues);
                const yMax = Math.max(...yValues);
                const yPadding = (yMax - yMin) * 0.1;
                
                chart2D.options.scales.y.min = yMin - yPadding;
                chart2D.options.scales.y.max = yMax + yPadding;
            }
            
            // Update chart
            chart2D.update();
            
        } catch (e) {
            console.error('Error updating 2D graph:', e);
        }
    }
    
    /**
     * Update the 3D graph with function data
     */
    function update3DGraph(data) {
        if (!scene) return;
        
        try {
            const func = data.function;
            const point = data.point;
            
            // Remove old surface if it exists
            if (surface) {
                scene.remove(surface);
                surface.geometry.dispose();
                surface.material.dispose();
            }
            
            // Parse the function with math.js
            const parsedFunc = math.parse(func);
            const compiledFunc = parsedFunc.compile();
            
            // Determine range
            let xMin, xMax, zMin, zMax;
            
            if (Math.abs(point) > 1e10) {
                // Handle infinity
                if (point > 0) {
                    xMin = 0;
                    xMax = 10;
                } else {
                    xMin = -10;
                    xMax = 0;
                }
            } else {
                // Regular point
                xMin = point - 5;
                xMax = point + 5;
            }
            
            zMin = xMin;
            zMax = xMax;
            
            // Create surface geometry
            const geometry = new THREE.PlaneGeometry(
                Math.abs(xMax - xMin),
                Math.abs(zMax - zMin),
                50, // width segments
                50  // height segments
            );
            
            // Apply function to vertices
            const positionAttribute = geometry.getAttribute('position');
            
            for (let i = 0; i < positionAttribute.count; i++) {
                const x = xMin + (positionAttribute.getX(i) + Math.abs(xMax - xMin) / 2) / Math.abs(xMax - xMin) * (xMax - xMin);
                const z = zMin + (positionAttribute.getZ(i) + Math.abs(zMax - zMin) / 2) / Math.abs(zMax - zMin) * (zMax - zMin);
                
                try {
                    // For 3D, we just use x for both variables (z is a spatial coordinate)
                    const y = compiledFunc.evaluate({ x: x });
                    
                    if (isFinite(y) && !isNaN(y)) {
                        // Clamp large values
                        const clampedY = Math.max(-10, Math.min(10, y));
                        positionAttribute.setY(i, clampedY);
                    } else {
                        positionAttribute.setY(i, 0);
                    }
                } catch (e) {
                    positionAttribute.setY(i, 0);
                }
            }
            
            // Update the bounding box
            geometry.computeBoundingBox();
            geometry.computeVertexNormals();
            
            // Create material
            const material = new THREE.MeshPhongMaterial({
                color: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                side: THREE.DoubleSide,
                flatShading: false,
                wireframe: showWireframe.checked
            });
            
            // Create mesh and add to scene
            surface = new THREE.Mesh(geometry, material);
            scene.add(surface);
            
            // Center camera on the surface
            const boundingBox = new THREE.Box3().setFromObject(surface);
            const center = boundingBox.getCenter(new THREE.Vector3());
            controls.target.copy(center);
            camera.position.set(center.x + 10, center.y + 10, center.z + 10);
            controls.update();
            
            // Update auto-rotation based on checkbox
            controls.autoRotate = autoRotate.checked;
            controls.autoRotateSpeed = rotationSpeed.value / 10;
            
        } catch (e) {
            console.error('Error updating 3D graph:', e);
        }
    }
    
    /**
     * Update the limit animation
     */
    function updateAnimation(data) {
        if (!animationChart) return;
        
        try {
            const func = data.function;
            const point = data.point;
            const direction = data.direction;
            let result = data.result;
            
            // Parse the function with math.js
            const parsedFunc = math.parse(func);
            const compiledFunc = parsedFunc.compile();
            
            // Determine x range
            let xMin, xMax;
            
            if (Math.abs(point) > 1e10) {
                // Handle infinity
                if (point > 0) {
                    xMin = 0;
                    xMax = 100;
                } else {
                    xMin = -100;
                    xMax = 0;
                }
            } else {
                // Regular point
                xMin = point - 5;
                xMax = point + 5;
            }
            
            // Generate data points for the function
            const points = [];
            const numPoints = 200;
            const step = (xMax - xMin) / (numPoints - 1);
            
            for (let i = 0; i < numPoints; i++) {
                const x = xMin + i * step;
                
                // Skip the exact limit point to handle discontinuities
                if (Math.abs(x - point) < 1e-10 && Math.abs(point) < 1e10) {
                    continue;
                }
                
                try {
                    const y = compiledFunc.evaluate({ x: x });
                    
                    // Filter out very large values and NaN
                    if (isFinite(y) && !isNaN(y) && Math.abs(y) < 1000) {
                        points.push({ x, y });
                    }
                } catch (e) {
                    // Skip points where the function is not defined
                }
            }
            
            // Update animation chart data
            animationChart.data.datasets[0].data = points;
            
            // Prepare animation frames based on direction
            const frames = [];
            let startX, endX, limitY;
            
            if (typeof result === 'object' && result.leftLimit !== undefined && result.rightLimit !== undefined) {
                // Different left and right limits
                if (direction === 'left' || direction === 'both') {
                    startX = point - 2;
                    endX = point;
                    limitY = result.leftLimit;
                    frames.push({ x: startX, y: compiledFunc.evaluate({ x: startX }) });
                } else {
                    startX = point + 2;
                    endX = point;
                    limitY = result.rightLimit;
                    frames.push({ x: startX, y: compiledFunc.evaluate({ x: startX }) });
                }
            } else {
                // Single limit
                if (direction === 'left') {
                    startX = point - 2;
                    endX = point;
                } else if (direction === 'right') {
                    startX = point + 2;
                    endX = point;
                } else {
                    // both
                    startX = point - 2;
                    endX = point;
                }
                
                limitY = result;
                frames.push({ x: startX, y: compiledFunc.evaluate({ x: startX }) });
            }
            
            // Store animation data
            animationFrame = 0;
            animationData = {
                func: compiledFunc,
                startX: startX,
                endX: endX,
                point: point,
                limitY: limitY,
                frames: frames,
                direction: direction
            };
            
            // Clear animation point
            animationChart.data.datasets[1].data = [];
            animationChart.update();
            
            // Set animation ranges
            animationChart.options.scales.x.min = xMin;
            animationChart.options.scales.x.max = xMax;
            
            // Auto-adjust y scale to fit data
            const yValues = points.map(p => p.y).filter(y => isFinite(y));
            
            if (yValues.length > 0) {
                const yMin = Math.min(...yValues);
                const yMax = Math.max(...yValues);
                const yPadding = (yMax - yMin) * 0.1;
                
                animationChart.options.scales.y.min = yMin - yPadding;
                animationChart.options.scales.y.max = yMax + yPadding;
            }
            
            animationChart.update();
            
            // Start animation
            resetAnimation();
            startAnimation();
            
        } catch (e) {
            console.error('Error updating animation:', e);
        }
    }
    
    /**
     * Start the limit animation
     */
    function startAnimation() {
        if (!animationData || isPlaying) return;
        
        isPlaying = true;
        
        const speed = animationSpeed.value;
        const interval = 1000 / (speed * 0.2 + 1); // Speed ranges from 1 to 21 FPS
        
        animationTimer = setInterval(function() {
            updateAnimationFrame();
        }, interval);
    }
    
    /**
     * Pause the limit animation
     */
    function pauseAnimation() {
        isPlaying = false;
        clearInterval(animationTimer);
    }
    
    /**
     * Reset the limit animation
     */
    function resetAnimation() {
        pauseAnimation();
        animationFrame = 0;
        
        if (animationChart && animationData) {
            animationChart.data.datasets[1].data = [{
                x: animationData.startX,
                y: animationData.func.evaluate({ x: animationData.startX })
            }];
            animationChart.update();
        }
    }
    
    /**
     * Update a single frame of the limit animation
     */
    function updateAnimationFrame() {
        if (!animationData) return;
        
        animationFrame++;
        
        // Calculate current position
        const progress = Math.min(1, animationFrame / 100); // 100 frames for full animation
        const eased = easeInOutQuad(progress);
        
        // Calculate current x position
        let currentX;
        if (animationData.direction === 'right') {
            currentX = animationData.startX - (animationData.startX - animationData.endX) * eased;
        } else {
            currentX = animationData.startX + (animationData.endX - animationData.startX) * eased;
        }
        
        // Calculate y value at current x
        let currentY;
        try {
            if (Math.abs(currentX - animationData.point) < 1e-6) {
                // We've reached the limit point
                currentY = animationData.limitY;
            } else {
                currentY = animationData.func.evaluate({ x: currentX });
            }
        } catch (e) {
            currentY = animationData.limitY;
        }
        
        // Update chart
        animationChart.data.datasets[1].data = [{ x: currentX, y: currentY }];
        animationChart.update();
        
        // End animation if we reach the limit point
        if (Math.abs(currentX - animationData.endX) < 1e-6) {
            pauseAnimation();
        }
    }
    
    /**
     * Easing function for smooth animation
     */
    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    
    /**
     * Three.js animation loop
     */
    function animate3D() {
        requestAnimationFrame(animate3D);
        
        if (controls) {
            controls.update();
        }
        
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }
    
    /**
     * Update zoom level for 2D graph
     */
    function updateZoom(value) {
        if (currentFunctionData) {
            update2DGraph(currentFunctionData);
        }
    }
    
    /**
     * Update grid display for 2D graph
     */
    function updateGridDisplay(visible) {
        if (chart2D) {
            chart2D.options.scales.x.grid.display = visible;
            chart2D.options.scales.y.grid.display = visible;
            chart2D.update();
        }
    }
    
    /**
     * Update limit point display
     */
    function updateLimitPointDisplay(visible) {
        if (currentFunctionData) {
            update2DGraph(currentFunctionData);
        }
    }
    
    /**
     * Update 3D rotation speed
     */
    function updateRotationSpeed(value) {
        if (controls) {
            controls.autoRotateSpeed = value / 10;
        }
    }
    
    /**
     * Update 3D wireframe display
     */
    function updateWireframeDisplay(visible) {
        if (surface) {
            surface.material.wireframe = visible;
        }
    }
    
    /**
     * Update animation speed
     */
    function updateAnimationSpeed(value) {
        if (isPlaying) {
            pauseAnimation();
            startAnimation();
        }
    }
    
    /**
     * Reset all visualizations
     */
    function resetVisualizations() {
        // Reset 2D chart
        if (chart2D) {
            chart2D.data.datasets[0].data = [];
            if (chart2D.data.datasets.length > 1) {
                chart2D.data.datasets.length = 1;
            }
            chart2D.update();
        }
        
        // Reset 3D surface
        if (surface && scene) {
            scene.remove(surface);
            if (surface.geometry) surface.geometry.dispose();
            if (surface.material) surface.material.dispose();
            surface = null;
        }
        
        // Reset animation
        pauseAnimation();
        if (animationChart) {
            animationChart.data.datasets[0].data = [];
            animationChart.data.datasets[1].data = [];
            animationChart.update();
        }
        
        currentFunctionData = null;
    }
    
    /**
     * Update colors when theme changes
     */
    function updateVisualizationColors() {
        // Update 2D chart colors
        if (chart2D) {
            chart2D.data.datasets[0].borderColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
            chart2D.options.scales.x.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
            chart2D.options.scales.y.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
            chart2D.update();
        }
        
        // Update 3D scene background
        if (scene) {
            scene.background = new THREE.Color(
                getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim()
            );
        }
        
        // Update 3D surface color
        if (surface) {
            surface.material.color.set(
                getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()
            );
        }
        
        // Update animation chart colors
        if (animationChart) {
            animationChart.data.datasets[0].borderColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
            animationChart.data.datasets[1].backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
            animationChart.data.datasets[1].borderColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
            animationChart.options.scales.x.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
            animationChart.options.scales.y.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
            animationChart.update();
        }
    }
});
