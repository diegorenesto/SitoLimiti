// Calcolatore di limiti interattivo
document.addEventListener('DOMContentLoaded', function() {
    // Inizializza le animazioni del calcolatore
    initCalculatorAnimations();
    
    // Inizializza il calcolatore di limiti
    initLimitCalculator();
    
    // Inizializza i pannelli di visualizzazione
    initVisualizationPanels();
    
    // Inizializza i controlli del grafico
    initGraphControls();
    
    // Inizializza i grafici
    initGraphs();
    
    // Inizia la rotazione automatica del grafico 3D
    startAutoRotate();
});

// Funzione per inizializzare le animazioni del calcolatore
function initCalculatorAnimations() {
    // Aggiungi animazioni GSAP
    if (typeof gsap !== 'undefined') {
        gsap.from('.calculator-input-area', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.calculator-input-area',
                start: 'top 80%'
            }
        });
        
        gsap.from('.calculator-result', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.calculator-result',
                start: 'top 80%'
            }
        });
        
        gsap.from('.visualization-container', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            delay: 0.4,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.visualization-container',
                start: 'top 80%'
            }
        });
    }
}

// Funzione per inizializzare il calcolatore di limiti
function initLimitCalculator() {
    const functionInput = document.getElementById('function-input');
    const limitPoint = document.getElementById('limit-point');
    const limitDirection = document.getElementById('limit-direction');
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const functionPreview = document.getElementById('function-preview');
    const limitNotation = document.getElementById('limit-notation');
    const limitResult = document.getElementById('limit-result');
    const limitExplanation = document.getElementById('limit-explanation');
    
    // Aggiungi event listeners
    functionInput.addEventListener('input', function() {
        updateFunctionPreview(this.value);
    });
    
    calculateBtn.addEventListener('click', calculateLimit);
    resetBtn.addEventListener('click', resetCalculator);
    
    // Inizializza esempio predefinito
    useExample('x^2', '0');
    
    // Funzione per aggiornare l'anteprima della funzione
    function updateFunctionPreview(functionStr) {
        if (functionStr.trim() === '') {
            functionPreview.innerHTML = '<p>Inserisci una funzione</p>';
            return;
        }
        
        try {
            // Converti in LaTeX per MathJax
            const latexStr = convertToLatex(functionStr);
            functionPreview.innerHTML = `\\[f(x) = ${latexStr}\\]`;
            
            // Renderizza la formula
            if (window.MathJax) {
                MathJax.typesetPromise([functionPreview]);
            }
        } catch (error) {
            functionPreview.innerHTML = `<p class="error">Errore: ${error.message}</p>`;
        }
    }
    
    // Funzione per calcolare il limite
    function calculateLimit() {
        const funcStr = functionInput.value.trim();
        const pointStr = limitPoint.value.trim();
        const direction = limitDirection.value;
        
        if (funcStr === '') {
            limitResult.innerHTML = '<span class="error">Inserisci una funzione valida</span>';
            return;
        }
        
        try {
            // Calcola il limite localmente
            const result = evaluateLimit(funcStr, pointStr, direction);
            
            // Aggiorna la notazione del limite
            updateLimitNotation(funcStr, pointStr, direction);
            
            // Aggiorna il risultato del limite
            updateLimitResult(result);
            
            // Aggiorna la spiegazione del limite
            updateLimitExplanation(funcStr, pointStr, result);
            
            // Aggiorna i grafici
            updateGraphs(funcStr, pointStr, direction, result);
        } catch (error) {
            limitResult.innerHTML = `<span class="error">Errore: ${error.message}</span>`;
        }
    }
    
    // Funzione per reimpostare il calcolatore
    function resetCalculator() {
        functionInput.value = '';
        limitPoint.value = '0';
        limitDirection.value = 'both';
        
        // Resetta le visualizzazioni
        updateFunctionPreview('');
        limitNotation.innerHTML = '\\[ \\lim_{x \\to x_0} f(x) \\]';
        limitResult.innerHTML = 'Inserisci una funzione e premi "Calcola limite"';
        limitExplanation.innerHTML = '<p>Il risultato del limite sarà mostrato qui con una spiegazione.</p>';
        
        // Resetta i grafici
        resetGraphs();
        
        // Aggiorna MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([limitNotation, limitResult, limitExplanation]);
        }
    }
    
    // Funzione per aggiornare la notazione del limite
    function updateLimitNotation(func, point, direction) {
        const latexFunc = convertToLatex(func);
        let dirSymbol = '';
        
        if (direction === 'left') {
            dirSymbol = '^{-}';
        } else if (direction === 'right') {
            dirSymbol = '^{+}';
        }
        
        // Gestisci i casi speciali come infinito
        let pointLatex = point;
        if (point === 'Infinity' || point === '+Infinity') {
            pointLatex = '\\infty';
        } else if (point === '-Infinity') {
            pointLatex = '-\\infty';
        }
        
        limitNotation.innerHTML = `\\[ \\lim_{x \\to ${pointLatex}${dirSymbol}} ${latexFunc} \\]`;
        
        // Aggiorna MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([limitNotation]);
        }
    }
    
    // Funzione per aggiornare il risultato del limite
    function updateLimitResult(result) {
        let resultStr = result;
        
        // Gestisci i casi speciali
        if (result === 'Infinity' || result === '+Infinity') {
            resultStr = '\\infty';
        } else if (result === '-Infinity') {
            resultStr = '-\\infty';
        } else if (result === 'undefined' || result === 'NaN') {
            resultStr = '\\text{Non esiste}';
        }
        
        limitResult.innerHTML = `\\[ ${resultStr} \\]`;
        
        // Aggiorna MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([limitResult]);
        }
    }
    
    // Funzione per aggiornare la spiegazione del limite
    function updateLimitExplanation(func, point, result) {
        let explanation = '';
        
        if (result === 'Infinity' || result === '+Infinity') {
            explanation = `<p>La funzione \(f(x) = ${convertToLatex(func)}\) tende a \(+\\infty\) quando \(x\) si avvicina a \(${point}\).</p>
                          <p>Questo significa che i valori della funzione crescono indefinitamente man mano che \(x\) si avvicina al punto.</p>`;
        } else if (result === '-Infinity') {
            explanation = `<p>La funzione \(f(x) = ${convertToLatex(func)}\) tende a \(-\\infty\) quando \(x\) si avvicina a \(${point}\).</p>
                          <p>Questo significa che i valori della funzione decrescono indefinitamente man mano che \(x\) si avvicina al punto.</p>`;
        } else if (result === 'undefined' || result === 'NaN') {
            explanation = `<p>Il limite della funzione \(f(x) = ${convertToLatex(func)}\) non esiste quando \(x\) si avvicina a \(${point}\).</p>
                          <p>Questo può accadere quando i limiti destro e sinistro non coincidono o quando la funzione oscilla senza convergere a un valore.</p>`;
        } else {
            explanation = `<p>La funzione \(f(x) = ${convertToLatex(func)}\) tende a \(${result}\) quando \(x\) si avvicina a \(${point}\).</p>
                          <p>Questo significa che i valori della funzione si avvicinano sempre più a \(${result}\) man mano che \(x\) si avvicina al punto.</p>`;
        }
        
        limitExplanation.innerHTML = explanation;
        
        // Aggiorna MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([limitExplanation]);
        }
    }
}

// Funzione per inizializzare i pannelli di visualizzazione
function initVisualizationPanels() {
    const tabButtons = document.querySelectorAll('.viz-tab-btn');
    const panels = document.querySelectorAll('.viz-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Rimuovi la classe active da tutti i pulsanti e pannelli
            tabButtons.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Aggiungi la classe active al pulsante e pannello corrente
            this.classList.add('active');
            document.getElementById(`${tabId}-panel`).classList.add('active');
        });
    });
}

// Funzione per inizializzare i controlli del grafico
function initGraphControls() {
    // Controlli grafico 2D
    const zoomSlider = document.getElementById('zoom-slider');
    const showGrid = document.getElementById('show-grid');
    const showPoint = document.getElementById('show-point');
    
    if (zoomSlider) {
        zoomSlider.addEventListener('input', updateGraph2D);
    }
    if (showGrid) {
        showGrid.addEventListener('change', updateGraph2D);
    }
    if (showPoint) {
        showPoint.addEventListener('change', updateGraph2D);
    }
    
    // Controlli grafico 3D
    const rotationSpeed = document.getElementById('rotation-speed');
    const autoRotate = document.getElementById('auto-rotate');
    
    if (rotationSpeed) {
        rotationSpeed.addEventListener('input', function() {
            // Aggiornare la velocità di rotazione
            updateRotationSpeed();
        });
    }
    if (autoRotate) {
        autoRotate.addEventListener('change', function() {
            if (this.checked) {
                startAutoRotate();
            } else {
                stopAutoRotate();
            }
        });
    }
    
    // Controlli animazione
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetAnimationBtn = document.getElementById('reset-animation-btn');
    const animationSpeed = document.getElementById('animation-speed');
    
    if (playBtn) {
        playBtn.addEventListener('click', startAnimation);
    }
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseAnimation);
    }
    if (resetAnimationBtn) {
        resetAnimationBtn.addEventListener('click', resetAnimation);
    }
    if (animationSpeed) {
        animationSpeed.addEventListener('input', updateAnimationSpeed);
    }
}

// Variabili per i grafici
let chart2D = null;
let scene3D = null, camera3D = null, renderer3D = null, controls3D = null, mesh3D = null;
let isAnimationRunning = false;
let animationSpeed = 50;
let animationFrame = null;
let currentX = 0;
let targetPoint = 0;
let limitDirection = 'both';
let functionExpression = null;

// Funzione per inizializzare i grafici
function initGraphs() {
    // Inizializza il grafico 2D vuoto
    initGraph2D();
    
    // Inizializza il grafico 3D vuoto
    initGraph3D();
    
    // Inizializza l'animazione vuota
    initAnimation();
}

// Funzione per creare il grafico 2D in base alla funzione e al punto
function createGraph2D(funcStr, point) {
    const canvas = document.getElementById('graph2d-canvas');
    if (!canvas) return;
    
    try {
        // Converti stringhe speciali in numeri
        let pointValue = point;
        if (point === 'Infinity' || point === '+Infinity') {
            pointValue = 10; // Valore grande positivo per rappresentare +infinito
        } else if (point === '-Infinity') {
            pointValue = -10; // Valore grande negativo per rappresentare -infinito
        } else {
            pointValue = parseFloat(point);
        }
        
        // Crea o aggiorna il grafico
        const ctx = canvas.getContext('2d');
        
        if (chart2D !== null) {
            chart2D.destroy();
        }
        
        // Determina il range del grafico
        const zoom = document.getElementById('zoom-slider').value / 50; // Da 0.5 a 2
        const range = 10 / zoom;
        const min = pointValue - range / 2;
        const max = pointValue + range / 2;
        
        // Genera i dati della funzione
        const step = (max - min) / 100;
        const data = [];
        const parser = math.parser();
        
        for (let x = min; x <= max; x += step) {
            try {
                parser.set('x', x);
                const y = parser.evaluate(funcStr);
                
                // Filtra i valori non validi o troppo grandi
                if (!isNaN(y) && isFinite(y) && y > -100 && y < 100) {
                    data.push({ x, y });
                }
            } catch (error) {
                // Ignora gli errori di calcolo per un singolo punto
                console.log(`Errore nel calcolo per x = ${x}:`, error);
            }
        }
        
        // Configura Chart.js
        chart2D = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: `f(x) = ${funcStr}`,
                    data: data,
                    showLine: true,
                    borderColor: '#3f5efb',
                    backgroundColor: 'rgba(63, 94, 251, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                }, {
                    label: 'Punto limite',
                    data: [{ x: pointValue, y: null }], // Il valore y sarà aggiornato
                    pointBackgroundColor: 'red',
                    pointBorderColor: 'red',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    showLine: false
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
                            display: document.getElementById('show-grid').checked
                        },
                        ticks: {
                            color: '#666'
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            display: document.getElementById('show-grid').checked
                        },
                        ticks: {
                            color: '#666'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#555'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                            }
                        }
                    }
                }
            }
        });
        
        // Aggiorna il punto limite
        updateLimitPoint(chart2D, funcStr, pointValue);
        
        return chart2D;
    } catch (error) {
        console.error('Errore nella creazione del grafico 2D:', error);
        return null;
    }
}

// Funzione per aggiornare il punto limite nel grafico
function updateLimitPoint(chart, funcStr, point) {
    if (!chart || !chart.data || !chart.data.datasets || chart.data.datasets.length < 2) return;
    
    try {
        const parser = math.parser();
        const dataset = chart.data.datasets[1];
        const limitPoint = dataset.data[0];
        
        // Se il punto è infinito, posiziona il punto al bordo del grafico
        if (point === 'Infinity' || point === '+Infinity' || point === '-Infinity') {
            // Determina il valore della funzione a un punto molto vicino all'infinito
            const x = point === '-Infinity' ? -100 : 100;
            parser.set('x', x);
            const y = parser.evaluate(funcStr);
            
            limitPoint.x = x;
            limitPoint.y = isNaN(y) || !isFinite(y) ? null : y;
        } else {
            // Per punti finiti, calcola il valore limite approssimato
            const x = parseFloat(point);
            
            // Cerca di valutare la funzione in punti molto vicini al punto limite
            const epsilon = 1e-10;
            const xLeft = x - epsilon;
            const xRight = x + epsilon;
            
            let yLeft, yRight;
            try {
                parser.set('x', xLeft);
                yLeft = parser.evaluate(funcStr);
            } catch (e) {
                yLeft = NaN;
            }
            
            try {
                parser.set('x', xRight);
                yRight = parser.evaluate(funcStr);
            } catch (e) {
                yRight = NaN;
            }
            
            // Scegli il valore più appropriato
            let y;
            if (!isNaN(yLeft) && isFinite(yLeft)) {
                y = yLeft;
            } else if (!isNaN(yRight) && isFinite(yRight)) {
                y = yRight;
            } else {
                // Se entrambi non sono validi, prova a valutare direttamente
                try {
                    parser.set('x', x);
                    y = parser.evaluate(funcStr);
                } catch (e) {
                    y = null;
                }
            }
            
            limitPoint.x = x;
            limitPoint.y = isNaN(y) || !isFinite(y) ? null : y;
        }
        
        // Aggiorna il grafico
        chart.update();
    } catch (error) {
        console.error('Errore nell\'aggiornamento del punto limite:', error);
    }
}

// Funzione per creare il grafico 3D
// Funzione migliorata per creare il grafico 3D
function createGraph3D(funcStr, point) {
    const container = document.getElementById('graph3d-container');
    if (!container) return;

    try {
        // Pulisci il container
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // Inizializza scena, camera e renderer
        scene3D = new THREE.Scene();
        scene3D.background = new THREE.Color(0xf5f5f5);
        
        // Imposta la camera
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera3D = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera3D.position.set(5, 5, 5);
        camera3D.lookAt(0, 0, 0);

        // Crea il renderer
        renderer3D = new THREE.WebGLRenderer({ antialias: true });
        renderer3D.setSize(width, height);
        container.appendChild(renderer3D.domElement);

        // Aggiungi controlli per la telecamera
        controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
        controls3D.enableDamping = true;
        controls3D.dampingFactor = 0.25;

        // Aggiungi luci
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene3D.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene3D.add(directionalLight);

        // Aggiungi griglia di riferimento
        const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x888888);
        scene3D.add(gridHelper);

        // Aggiungi assi di riferimento
        const axesHelper = new THREE.AxesHelper(5);
        scene3D.add(axesHelper);

        // Converti il punto in un valore numerico
        let pointValue = parseFloat(point);
        if (point === 'Infinity' || point === '+Infinity') {
            pointValue = 10;
        } else if (point === '-Infinity') {
            pointValue = -10;
        }

        // Crea la superficie della funzione
        const parser = math.parser();
        const geometry = new THREE.ParametricBufferGeometry((u, v, target) => {
            // Mappatura dei parametri u, v alle coordinate x, z
            const range = 10;
            const x = (u - 0.5) * range;
            const z = (v - 0.5) * range;
            
            // Calcola il valore y = f(x)
            let y = 0;
            try {
                parser.set('x', x);
                y = parser.evaluate(funcStr);
                
                // Limita l'altezza per evitare valori estremi
                y = Math.max(-10, Math.min(10, y));
            } catch (error) {
                y = 0;
            }
            
            target.set(x, y, z);
        }, 50, 50);

        const material = new THREE.MeshPhongMaterial({
            color: 0x3f5efb,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            wireframe: false
        });
        
        mesh3D = new THREE.Mesh(geometry, material);
        scene3D.add(mesh3D);

        // Aggiungi wireframe per migliorare la leggibilità
        const wireframe = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        line.material.color.set(0x000000);
        line.material.opacity = 0.2;
        line.material.transparent = true;
        scene3D.add(line);

        // Aggiungi un punto per indicare il punto limite
        const pointGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const pointSphere = new THREE.Mesh(pointGeometry, pointMaterial);
        
        try {
            parser.set('x', pointValue);
            const y = parser.evaluate(funcStr);
            pointSphere.position.set(pointValue, isFinite(y) ? y : 0, 0);
            scene3D.add(pointSphere);
        } catch (error) {
            pointSphere.position.set(pointValue, 0, 0);
            scene3D.add(pointSphere);
        }

        // Gestione del ridimensionamento della finestra
        function onWindowResize() {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            camera3D.aspect = width / height;
            camera3D.updateProjectionMatrix();
            
            renderer3D.setSize(width, height);
        }
        
        window.addEventListener('resize', onWindowResize, false);

        // Animazione
        function animate() {
            requestAnimationFrame(animate);
            
            // Aggiorna i controlli della telecamera
            controls3D.update();
            
            // Renderizza la scena
            renderer3D.render(scene3D, camera3D);
        }
        
        animate();

        return { scene: scene3D, camera: camera3D, renderer: renderer3D, controls: controls3D, mesh: mesh3D };
    } catch (error) {
        console.error('Errore nella creazione del grafico 3D:', error);
        return null;
    }
}

let autoRotateAnimationId = null;

// Funzione per avviare la rotazione automatica
function startAutoRotate() {
    const autoRotateCheckbox = document.getElementById('auto-rotate');
    if (!autoRotateCheckbox || !autoRotateCheckbox.checked || !controls3D) return;
    
    const speed = document.getElementById('rotation-speed') ? 
        document.getElementById('rotation-speed').value / 500 : 0.1;
    
    function rotate() {
        if (controls3D) {
            controls3D.autoRotate = true;
            controls3D.autoRotateSpeed = speed * 10;
            controls3D.update();
            
            if (renderer3D && scene3D && camera3D) {
                renderer3D.render(scene3D, camera3D);
            }
        }
        
        autoRotateAnimationId = requestAnimationFrame(rotate);
    }
    
    rotate();
}

// Funzione per fermare la rotazione automatica
function stopAutoRotate() {
    if (controls3D) {
        controls3D.autoRotate = false;
    }
    
    if (autoRotateAnimationId) {
        cancelAnimationFrame(autoRotateAnimationId);
        autoRotateAnimationId = null;
    }
}

// Funzione per aggiornare la velocità di rotazione
function updateRotationSpeed() {
    if (controls3D) {
        const speed = document.getElementById('rotation-speed') ? 
            document.getElementById('rotation-speed').value / 500 : 0.1;
        controls3D.autoRotateSpeed = speed * 10;
    }
}

// Funzione per impostare l'animazione della sequenza dei limiti
function setupLimitAnimation(funcStr, point, direction) {
    try {
        // Inizializza la funzione parser
        functionExpression = funcStr;
        targetPoint = parseFloat(point) || 0;
        limitDirection = direction || 'both';
        
        // Inizializza i valori di sequenza
        const initialDistance = 2; // Distanza iniziale dal punto
        
        if (limitDirection === 'left') {
            currentX = targetPoint - initialDistance;
        } else if (limitDirection === 'right') {
            currentX = targetPoint + initialDistance;
        } else {
            // Per entrambe le direzioni, inizia da sinistra
            currentX = targetPoint - initialDistance;
        }
        
        // Aggiorna la sequenza di valori
        updateAnimationSequence();
        
        return true;
    } catch (error) {
        console.error('Errore nell\'impostazione dell\'animazione:', error);
        return false;
    }
}

// Funzione per aggiornare la sequenza dell'animazione
function updateAnimationSequence() {
    if (!functionExpression) return;
    
    try {
        // Calcola il valore della funzione al punto corrente
        const parser = math.parser();
        parser.set('x', currentX);
        const fx = parser.evaluate(functionExpression);
        
        // Aggiorna i valori visualizzati
        document.getElementById('x-value').textContent = currentX.toFixed(6);
        document.getElementById('fx-value').textContent = isFinite(fx) ? fx.toFixed(6) : 'non definito';
        
        // Aggiorna il grafico di animazione
        updateAnimationGraph(currentX, fx);
    } catch (error) {
        console.error('Errore nell\'aggiornamento della sequenza:', error);
    }
}

// Varie variabili per l'animazione
let animationChart = null;
let animationSpeed = 50;
let animationInterval = null;

// Funzione per inizializzare l'animazione
function initAnimation() {
    const canvas = document.getElementById('animation-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Crea un grafico vuoto
    animationChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Funzione f(x)',
                data: [],
                showLine: true,
                borderColor: '#3f5efb',
                backgroundColor: 'rgba(63, 94, 251, 0.1)',
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }, {
                label: 'Punti di sequenza',
                data: [],
                pointBackgroundColor: 'red',
                pointBorderColor: 'red',
                pointRadius: 5,
                pointHoverRadius: 7,
                showLine: false
            }, {
                label: 'Punto limite',
                data: [],
                pointBackgroundColor: 'green',
                pointBorderColor: 'green',
                pointRadius: 6,
                pointHoverRadius: 8,
                showLine: false
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
                        display: true
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    grid: {
                        display: true
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#555'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `(${context.parsed.x.toFixed(4)}, ${context.parsed.y.toFixed(4)})`;
                        }
                    }
                }
            }
        }
    });
}

// Funzione per aggiornare il grafico di animazione
function updateAnimationGraph(currentX, currentY) {
    if (!animationChart) return;
    
    // Aggiorna il punto corrente
    if (animationChart.data.datasets[1].data.length > 20) {
        // Rimuovi i punti più vecchi se ce ne sono troppi
        animationChart.data.datasets[1].data.shift();
    }
    
    // Aggiungi il nuovo punto
    if (isFinite(currentY)) {
        animationChart.data.datasets[1].data.push({ x: currentX, y: currentY });
    }
    
    // Aggiorna il grafico della funzione
    if (functionExpression) {
        // Determina il range in base ai punti visualizzati
        const points = animationChart.data.datasets[1].data;
        let minX = targetPoint - 2;
        let maxX = targetPoint + 2;
        
        if (points.length > 0) {
            const xs = points.map(p => p.x);
            minX = Math.min(...xs, targetPoint) - 0.5;
            maxX = Math.max(...xs, targetPoint) + 0.5;
        }
        
        // Genera i punti della funzione
        const functionPoints = [];
        const parser = math.parser();
        const step = (maxX - minX) / 100;
        
        for (let x = minX; x <= maxX; x += step) {
            try {
                parser.set('x', x);
                const y = parser.evaluate(functionExpression);
                
                // Filtra i valori non validi o troppo grandi
                if (!isNaN(y) && isFinite(y) && y > -50 && y < 50) {
                    functionPoints.push({ x, y });
                }
            } catch (error) {
                // Ignora gli errori di calcolo per un singolo punto
            }
        }
        
        // Aggiorna il dataset della funzione
        animationChart.data.datasets[0].data = functionPoints;
        
        // Aggiorna il punto limite
        try {
            parser.set('x', targetPoint);
            const limitY = parser.evaluate(functionExpression);
            
            if (isFinite(limitY)) {
                animationChart.data.datasets[2].data = [{ x: targetPoint, y: limitY }];
            } else {
                // Se il limite è infinito, lo posiziona fuori dal grafico
                animationChart.data.datasets[2].data = [];
            }
        } catch (error) {
            // In caso di errore, svuota il dataset del punto limite
            animationChart.data.datasets[2].data = [];
        }
    }
    
    // Aggiorna il grafico
    animationChart.update();
}

// Funzione per avviare l'animazione
function startAnimation() {
    if (isAnimationRunning) return;
    
    isAnimationRunning = true;
    updateAnimationControls(true);
    
    // Calcola l'intervallo in base alla velocità
    const baseInterval = 2000; // 2 secondi per velocità media (50)
    const interval = baseInterval * (100 - animationSpeed) / 50;
    
    function animate() {
        // Calcola il prossimo valore di x
        const stepSizeFactor = Math.abs(currentX - targetPoint) / 2;
        const stepSize = Math.max(0.000001, stepSizeFactor * 0.5);
        
        if (limitDirection === 'left') {
            // Avvicinamento da sinistra
            if (currentX < targetPoint) {
                currentX += stepSize;
                if (currentX > targetPoint) currentX = targetPoint - 0.000001;
            }
        } else if (limitDirection === 'right') {
            // Avvicinamento da destra
            if (currentX > targetPoint) {
                currentX -= stepSize;
                if (currentX < targetPoint) currentX = targetPoint + 0.000001;
            }
        } else {
            // Entrambe le direzioni
            if (Math.abs(currentX - targetPoint) < 0.00001) {
                // Se siamo molto vicini al punto da sinistra, passa a destra
                currentX = targetPoint + 2;
            } else if (currentX < targetPoint) {
                // Avvicinamento da sinistra
                currentX += stepSize;
                if (currentX > targetPoint) currentX = targetPoint + 2;
            } else {
                // Avvicinamento da destra
                currentX -= stepSize;
                if (currentX < targetPoint) currentX = targetPoint - 2;
            }
        }
        
        // Aggiorna la sequenza
        updateAnimationSequence();
        
        // Continua l'animazione
        if (isAnimationRunning) {
            animationFrame = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Funzione per mettere in pausa l'animazione
function pauseAnimation() {
    isAnimationRunning = false;
    updateAnimationControls(false);
    
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
}

// Funzione per reimpostare l'animazione
function resetAnimation() {
    pauseAnimation();
    
    // Reimposta i valori iniziali
    const initialDistance = 2;
    
    if (limitDirection === 'left') {
        currentX = targetPoint - initialDistance;
    } else if (limitDirection === 'right') {
        currentX = targetPoint + initialDistance;
    } else {
        currentX = targetPoint - initialDistance;
    }
    
    // Svuota i punti dell'animazione
    if (animationChart && animationChart.data.datasets[1]) {
        animationChart.data.datasets[1].data = [];
        animationChart.update();
    }
    
    // Aggiorna la sequenza
    updateAnimationSequence();
}

// Funzione per aggiornare i controlli dell'animazione
function updateAnimationControls(isPlaying) {
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    if (playBtn) playBtn.disabled = isPlaying;
    if (pauseBtn) pauseBtn.disabled = !isPlaying;
}

// Funzione per aggiornare la velocità dell'animazione
function updateAnimationSpeed() {
    const speedSlider = document.getElementById('animation-speed');
    if (speedSlider) {
        animationSpeed = parseInt(speedSlider.value);
    }
}

// Funzione per inizializzare il grafico 2D
function initGraph2D() {
    const canvas = document.getElementById('graph2d-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Crea un grafico vuoto
    chart2D = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Funzione f(x)',
                data: [],
                showLine: true,
                borderColor: '#3f5efb',
                backgroundColor: 'rgba(63, 94, 251, 0.1)',
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }, {
                label: 'Punto limite',
                data: [{ x: 0, y: 0 }],
                pointBackgroundColor: 'red',
                pointBorderColor: 'red',
                pointRadius: 5,
                pointHoverRadius: 7,
                showLine: false
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
                        display: true
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    grid: {
                        display: true
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#555'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                        }
                    }
                }
            }
        }
    });
}

// Funzione per inizializzare il grafico 3D
function initGraph3D() {
    const container = document.getElementById('graph3d-container');
    if (!container) return;
    
    // Inizializza scena, camera e renderer
    scene3D = new THREE.Scene();
    scene3D.background = new THREE.Color(0xf5f5f5);
    
    // Imposta la camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;
    camera3D = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera3D.position.set(5, 5, 5);
    camera3D.lookAt(0, 0, 0);
    
    // Crea il renderer
    renderer3D = new THREE.WebGLRenderer({ antialias: true });
    renderer3D.setSize(width, height);
    container.appendChild(renderer3D.domElement);
    
    // Aggiungi controlli per la telecamera
    controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
    controls3D.enableDamping = true;
    controls3D.dampingFactor = 0.25;
    
    // Aggiungi luci
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene3D.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene3D.add(directionalLight);
    
    // Aggiungi assi di riferimento
    const axesHelper = new THREE.AxesHelper(5);
    scene3D.add(axesHelper);
    
    // Funzione di rendering
    function animate() {
        requestAnimationFrame(animate);
        controls3D.update();
        renderer3D.render(scene3D, camera3D);
    }
    
    animate();
}

// Funzione per aggiornare il grafico 2D
function updateGraph2D() {
    const funcStr = document.getElementById('function-input').value;
    const pointStr = document.getElementById('limit-point').value;
    
    if (funcStr && pointStr) {
        createGraph2D(funcStr, pointStr);
    }
}

// Funzione per aggiornare il grafico 3D
function updateGraph3D() {
    const funcStr = document.getElementById('function-input').value;
    const pointStr = document.getElementById('limit-point').value;
    
    if (funcStr && pointStr) {
        createGraph3D(funcStr, pointStr);
    }
}

// Funzione per reimpostare i grafici
function resetGraphs() {
    // Reimposta grafico 2D
    if (chart2D) {
        chart2D.data.datasets[0].data = [];
        chart2D.data.datasets[1].data = [{ x: 0, y: 0 }];
        chart2D.update();
    }
    
    // Reimposta grafico 3D
    const container3D = document.getElementById('graph3d-container');
    if (container3D && renderer3D) {
        // Rimuovi tutti gli elementi dal container
        while (container3D.firstChild) {
            container3D.removeChild(container3D.firstChild);
        }
        
        // Reinizializza il grafico 3D
        initGraph3D();
    }
    
    // Reimposta l'animazione
    resetAnimation();
}

// Funzione per aggiornare tutti i grafici
function updateGraphs(funcStr, point, direction, result) {
    // Aggiorna il grafico 2D
    createGraph2D(funcStr, point);
    
    // Aggiorna il grafico 3D
    createGraph3D(funcStr, point);
    
    // Configura l'animazione
    setupLimitAnimation(funcStr, point, direction);
}

// Funzione per convertire in LaTeX
function convertToLatex(funcStr) {
    let latex = funcStr
        .replace(/\^/g, '^{') // exponents
        .replace(/\^{(\d+)/g, '^{$1}') // close braces for exponents
        .replace(/sqrt\(/g, '\\sqrt{')
        .replace(/sin\(/g, '\\sin(')
        .replace(/cos\(/g, '\\cos(')
        .replace(/tan\(/g, '\\tan(')
        .replace(/ln\(/g, '\\ln(')
        .replace(/log\(/g, '\\log(')
        .replace(/exp\(/g, 'e^{')
        .replace(/\*\*/g, '^{')
        .replace(/\*/g, ' \\cdot ');
    
    // Chiudi le parentesi di sqrt
    let openBrackets = (latex.match(/\\sqrt\{/g) || []).length;
    let closeBrackets = (latex.match(/\}/g) || []).length;
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
        latex += '}';
    }
    
    // Chiudi le parentesi di exp
    openBrackets = (latex.match(/e\^{/g) || []).length;
    closeBrackets = (latex.match(/\}/g) || []).length - (openBrackets - closeBrackets);
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
        latex += '}';
    }
    
    return latex;
}

// Funzione per valutare il limite localmente
// Funzione migliorata per valutare il limite
function evaluateLimit(funcStr, point, direction) {
    try {
        const parser = math.parser();
        
        // Gestione dei casi speciali (infinito)
        if (point === 'Infinity' || point === '+Infinity' || point === '-Infinity') {
            return evaluateLimitAtInfinity(funcStr, point === '-Infinity');
        }
        
        const pointValue = parseFloat(point);
        
        // Prima prova a valutare direttamente
        try {
            parser.set('x', pointValue);
            const directResult = parser.evaluate(funcStr);
            
            if (!isNaN(directResult) {
                return directResult;
            }
        } catch (e) {
            // Continua con l'approssimazione se la valutazione diretta fallisce
        }
        
        // Approssimazione del limite
        const epsilon = 1e-10;
        const steps = 5;
        const values = [];
        
        // Calcola da entrambi i lati se necessario
        if (direction === 'both' || direction === 'left') {
            for (let i = 1; i <= steps; i++) {
                const x = pointValue - epsilon * Math.pow(10, steps - i);
                try {
                    parser.set('x', x);
                    const y = parser.evaluate(funcStr);
                    if (!isNaN(y)) {
                        values.push(y);
                    }
                } catch (e) {
                    // Ignora errori
                }
            }
        }
        
        if (direction === 'both' || direction === 'right') {
            for (let i = 1; i <= steps; i++) {
                const x = pointValue + epsilon * Math.pow(10, steps - i);
                try {
                    parser.set('x', x);
                    const y = parser.evaluate(funcStr);
                    if (!isNaN(y)) {
                        values.push(y);
                    }
                } catch (e) {
                    // Ignora errori
                }
            }
        }
        
        // Se non ci sono valori validi
        if (values.length === 0) {
            return 'undefined';
        }
        
        // Stima il limite
        return estimateConvergence(values);
    } catch (error) {
        console.error('Errore nella valutazione del limite:', error);
        return 'undefined';
    }
}


// Funzione migliorata per valutare limiti all'infinito
function evaluateLimitAtInfinity(funcStr, isNegative) {
    try {
        const parser = math.parser();
        const values = [];
        const steps = 5;
        const base = isNegative ? -1 : 1;
        
        for (let i = 1; i <= steps; i++) {
            const x = base * Math.pow(10, i);
            try {
                parser.set('x', x);
                const y = parser.evaluate(funcStr);
                if (!isNaN(y)) {
                    values.push(y);
                }
            } catch (e) {
                // Ignora errori
            }
        }
        
        return estimateConvergence(values);
    } catch (error) {
        console.error('Errore nella valutazione del limite all\'infinito:', error);
        return 'undefined';
    }
}

// Funzione migliorata per stimare la convergenza
function estimateConvergence(values) {
    if (values.length === 0) return 'undefined';
    
    // Calcola la media degli ultimi valori
    const lastValues = values.slice(-3);
    const sum = lastValues.reduce((a, b) => a + b, 0);
    const avg = sum / lastValues.length;
    
    // Controlla se tende a infinito
    const last = values[values.length - 1];
    const prev = values.length > 1 ? values[values.length - 2] : last;
    
    if (Math.abs(last) > 1e10 && Math.abs(last) > 2 * Math.abs(prev)) {
        return last > 0 ? 'Infinity' : '-Infinity';
    }
    
    // Controlla la convergenza
    const stdDev = Math.sqrt(lastValues.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lastValues.length;
    
    if (stdDev < 1e-6 * Math.abs(avg) || stdDev < 1e-10) {
        return avg;
    }
    
    // Se non converge, restituisci l'ultimo valore
    return last;
}

// Funzione per stimare la convergenza da una serie di valori
function estimateConvergence(values) {
    if (values.length === 0) {
        return 'NaN';
    }
    
    // Calcola la media degli ultimi valori
    const lastValues = values.slice(-3);
    const sum = lastValues.reduce((acc, val) => acc + val, 0);
    const avg = sum / lastValues.length;
    
    // Calcola la deviazione standard
    const variance = lastValues.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / lastValues.length;
    const stdDev = Math.sqrt(variance);
    
    // Se la deviazione standard è piccola, converge
    if (stdDev < 1e-5 * Math.abs(avg) || stdDev < 1e-10) {
        return Math.round(avg * 1e10) / 1e10; // Arrotonda per evitare errori di precisione
    }
    
    // Controlla se tende a infinito
    const lastDiff = values[values.length - 1] - values[values.length - 2];
    if (Math.abs(lastDiff) > 1e3 && Math.abs(values[values.length - 1]) > 1e5) {
        return lastDiff > 0 ? 'Infinity' : '-Infinity';
    }
    
    // Se non siamo sicuri della convergenza, restituisci la media
    return avg;
}

// Funzione per utilizzare un esempio predefinito
function useExample(funcStr, pointStr) {
    const functionInput = document.getElementById('function-input');
    const limitPoint = document.getElementById('limit-point');
    const limitDirection = document.getElementById('limit-direction');
    
    if (functionInput && limitPoint) {
        functionInput.value = funcStr;
        limitPoint.value = pointStr;
        limitDirection.value = 'both';
        
        // Aggiorna l'anteprima della funzione
        updateFunctionPreview(funcStr);
        
        // Calcola automaticamente il limite
        const calculateBtn = document.getElementById('calculate-btn');
        if (calculateBtn) {
            calculateBtn.click();
        }
    }
}