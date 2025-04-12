// Calculator Functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const functionInput = document.getElementById('function-input');
    const functionPreview = document.getElementById('function-preview');
    const limitPoint = document.getElementById('limit-point');
    const limitDirection = document.getElementById('limit-direction');
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const limitNotation = document.getElementById('limit-notation');
    const limitResult = document.getElementById('limit-result');
    const limitExplanation = document.getElementById('limit-explanation');
    const exampleCards = document.querySelectorAll('.example-card');

    // Variables for current calculation state
    let currentFunction = '';
    let currentLimitPoint = '0';
    let currentDirection = 'both';
    let calculationResult = null;

    // Initialize
    setupEventListeners();
    updateFunctionPreview();

    /**
     * Set up all event listeners for the calculator
     */
    function setupEventListeners() {
        // Update the preview as user types
        functionInput.addEventListener('input', function() {
            updateFunctionPreview();
        });

        // Update the limit notation as user changes point
        limitPoint.addEventListener('input', function() {
            updateLimitNotation();
        });

        // Update the limit notation as user changes direction
        limitDirection.addEventListener('change', function() {
            updateLimitNotation();
        });

        // Calculate button
        calculateBtn.addEventListener('click', function() {
            calculateLimit();
        });

        // Reset button
        resetBtn.addEventListener('click', function() {
            resetCalculator();
        });

        // Function examples
        exampleCards.forEach(card => {
            card.addEventListener('click', function() {
                const exampleFunction = this.getAttribute('data-function');
                functionInput.value = exampleFunction;
                updateFunctionPreview();
                // Scroll to calculator input
                document.querySelector('.calculator-input-area').scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Allow Enter key to calculate
        functionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateLimit();
            }
        });

        limitPoint.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateLimit();
            }
        });
    }

    /**
     * Update the MathJax preview of the function
     */
    function updateFunctionPreview() {
        const inputValue = functionInput.value.trim();
        
        if (inputValue === '') {
            functionPreview.innerHTML = '\\[ f(x) = ? \\]';
        } else {
            try {
                // Try to parse the function with math.js to check validity
                math.parse(inputValue);
                
                // Convert common JavaScript functions to LaTeX
                let latexInput = inputValue
                    .replace(/sin/g, '\\sin')
                    .replace(/cos/g, '\\cos')
                    .replace(/tan/g, '\\tan')
                    .replace(/log/g, '\\log')
                    .replace(/ln/g, '\\ln')
                    .replace(/exp/g, '\\exp')
                    .replace(/sqrt/g, '\\sqrt')
                    .replace(/\^/g, '^{')
                    .replace(/\*\*/g, '^{')
                    .replace(/\//g, '\\frac{');
                
                // Add missing close braces for LaTeX
                const openBraces = (latexInput.match(/\\frac{/g) || []).length;
                const closeBraces = (latexInput.match(/}/g) || []).length;
                if (openBraces > closeBraces) {
                    latexInput += '}'.repeat(openBraces - closeBraces);
                }
                
                functionPreview.innerHTML = `\\[ f(x) = ${latexInput} \\]`;
                
                // Update MathJax rendering
                if (typeof MathJax !== 'undefined') {
                    MathJax.typesetPromise([functionPreview]).catch(function(err) {
                        console.error('MathJax typesetting failed: ', err);
                    });
                }
                
                // Update current function
                currentFunction = inputValue;
                
                // Remove any error messages
                functionPreview.classList.remove('error-message');
            } catch (e) {
                // Show syntax error but still try to display the LaTeX
                functionPreview.innerHTML = `\\[ f(x) = ${inputValue} \\]`;
                
                // Update MathJax rendering
                if (typeof MathJax !== 'undefined') {
                    MathJax.typesetPromise([functionPreview]).catch(function() {
                        functionPreview.innerHTML = 'Errore di sintassi nella funzione';
                    });
                }
                
                functionPreview.classList.add('error-message');
            }
        }

        // Update the limit notation to match the current function
        updateLimitNotation();
    }

    /**
     * Update the limit notation display
     */
    function updateLimitNotation() {
        const point = limitPoint.value.trim() || '0';
        const direction = limitDirection.value;
        
        let directionSymbol = '';
        if (direction === 'left') {
            directionSymbol = '^{-}';
        } else if (direction === 'right') {
            directionSymbol = '^{+}';
        }
        
        // Handle special cases for infinity
        let pointDisplay = point;
        if (point.toLowerCase().includes('inf') || point.includes('∞')) {
            if (point.startsWith('+') || !point.startsWith('-')) {
                pointDisplay = '\\infty';
            } else {
                pointDisplay = '-\\infty';
            }
        }
        
        let functionDisplay = currentFunction || 'f(x)';
        
        limitNotation.innerHTML = `\\[ \\lim_{x \\to ${pointDisplay}${directionSymbol}} ${functionDisplay} \\]`;
        
        // Update MathJax rendering
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([limitNotation]).catch(function(err) {
                console.error('MathJax typesetting failed: ', err);
            });
        }
        
        // Update current values
        currentLimitPoint = point;
        currentDirection = direction;
    }

    /**
     * Calculate the limit based on current inputs
     */
    function calculateLimit() {
        const func = functionInput.value.trim();
        const point = limitPoint.value.trim();
        const direction = limitDirection.value;
        
        if (!func) {
            showError('Inserisci una funzione valida.');
            return;
        }
        
        try {
            // Parse the function with math.js
            const expression = math.parse(func);
            const compiled = expression.compile();
            
            // Handle different point values
            let limitValue;
            let pointValue;
            
            if (point.toLowerCase().includes('inf') || point.includes('∞')) {
                // Handle infinity
                if (point.startsWith('-')) {
                    pointValue = -1e200; // Approximation for -∞
                } else {
                    pointValue = 1e200; // Approximation for +∞
                }
            } else {
                // Regular number
                try {
                    pointValue = math.evaluate(point);
                } catch (e) {
                    showError('Punto non valido. Usa un numero o infinity.');
                    return;
                }
            }
            
            // Evaluate the limit
            limitValue = evaluateLimit(compiled, pointValue, direction);
            
            // Display the result
            displayResult(limitValue, func, pointValue, direction);
            
            // Store the calculation result for graphing
            calculationResult = {
                function: func,
                point: pointValue,
                direction: direction,
                result: limitValue
            };
            
            // Trigger visualization update
            const event = new CustomEvent('limitCalculated', { detail: calculationResult });
            document.dispatchEvent(event);
            
        } catch (e) {
            showError('Errore nel calcolo del limite: ' + e.message);
        }
    }

    /**
     * Evaluate the limit using numerical approximation
     */
    function evaluateLimit(compiledFunction, point, direction) {
        const epsilon = 1e-10;
        let result;
        
        // Helper to safely evaluate function
        function safeEvaluate(x) {
            try {
                return compiledFunction.evaluate({ x: x });
            } catch (e) {
                return NaN;
            }
        }
        
        // Handle different cases
        if (isFinite(point)) {
            // Finite point
            if (direction === 'both' || direction === 'left') {
                // Left limit
                let leftX = point - epsilon;
                let leftY = safeEvaluate(leftX);
                
                // Try different epsilons if needed
                if (isNaN(leftY)) {
                    for (let i = 1; i <= 10; i++) {
                        leftX = point - epsilon * Math.pow(10, i);
                        leftY = safeEvaluate(leftX);
                        if (!isNaN(leftY)) break;
                    }
                }
                
                // Store left limit
                const leftLimit = leftY;
                
                // If we only need left limit, return it
                if (direction === 'left') {
                    return leftLimit;
                }
                
                // Calculate right limit
                let rightX = point + epsilon;
                let rightY = safeEvaluate(rightX);
                
                // Try different epsilons if needed
                if (isNaN(rightY)) {
                    for (let i = 1; i <= 10; i++) {
                        rightX = point + epsilon * Math.pow(10, i);
                        rightY = safeEvaluate(rightX);
                        if (!isNaN(rightY)) break;
                    }
                }
                
                const rightLimit = rightY;
                
                // Check if left and right limits agree
                if (Math.abs(leftLimit - rightLimit) < epsilon) {
                    return (leftLimit + rightLimit) / 2;
                } else {
                    // Limits don't agree - limit doesn't exist
                    return {
                        exists: false,
                        leftLimit: leftLimit,
                        rightLimit: rightLimit
                    };
                }
            } else {
                // Right limit only
                let rightX = point + epsilon;
                let rightY = safeEvaluate(rightX);
                
                // Try different epsilons if needed
                if (isNaN(rightY)) {
                    for (let i = 1; i <= 10; i++) {
                        rightX = point + epsilon * Math.pow(10, i);
                        rightY = safeEvaluate(rightX);
                        if (!isNaN(rightY)) break;
                    }
                }
                
                return rightY;
            }
        } else {
            // Point is ±∞
            if (point < 0) {
                // -∞ case
                const x = -1e10;
                return safeEvaluate(x);
            } else {
                // +∞ case
                const x = 1e10;
                return safeEvaluate(x);
            }
        }
    }

    /**
     * Display the limit calculation result
     */
    function displayResult(result, func, point, direction) {
        // Format the point value for display
        let pointDisplay;
        if (Math.abs(point) > 1e100) {
            pointDisplay = point > 0 ? '+∞' : '-∞';
        } else {
            pointDisplay = point;
        }
        
        // Handle the result display
        if (result && typeof result === 'object' && result.exists === false) {
            // Limit doesn't exist
            limitResult.innerHTML = 'Il limite non esiste';
            limitResult.classList.add('error-message');
            
            let explanation = `<p>Il limite non esiste perché i limiti destro e sinistro sono diversi:</p>`;
            explanation += `<p>Limite sinistro: ${formatNumber(result.leftLimit)}</p>`;
            explanation += `<p>Limite destro: ${formatNumber(result.rightLimit)}</p>`;
            
            limitExplanation.innerHTML = explanation;
        } else if (isNaN(result) || result === undefined || result === null) {
            // Error or indeterminate forms
            limitResult.innerHTML = 'Indeterminato o non definito';
            limitResult.classList.add('error-message');
            
            limitExplanation.innerHTML = `
                <p>Il limite non può essere calcolato. Possibili cause:</p>
                <ul>
                    <li>Forma indeterminata (come 0/0, ∞/∞, ecc.)</li>
                    <li>La funzione non è definita vicino al punto ${pointDisplay}</li>
                    <li>Divisione per zero</li>
                </ul>
            `;
        } else if (!isFinite(result)) {
            // Infinite result
            if (result > 0) {
                limitResult.innerHTML = '+∞';
            } else {
                limitResult.innerHTML = '-∞';
            }
            limitResult.classList.remove('error-message');
            
            limitExplanation.innerHTML = `
                <p>Il limite tende a ${result > 0 ? '+∞' : '-∞'} quando x si avvicina a ${pointDisplay}.</p>
                <p>La funzione cresce ${result > 0 ? 'positivamente' : 'negativamente'} senza limite.</p>
            `;
        } else {
            // Finite result
            limitResult.innerHTML = formatNumber(result);
            limitResult.classList.remove('error-message');
            
            limitExplanation.innerHTML = `
                <p>Il limite esiste ed è uguale a ${formatNumber(result)}.</p>
                <p>La funzione f(x) = ${func} si avvicina a questo valore quando x tende a ${pointDisplay}.</p>
            `;
        }
        
        // Update MathJax rendering for any mathematical expressions in the explanation
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([limitExplanation]).catch(function(err) {
                console.error('MathJax typesetting failed: ', err);
            });
        }
    }

    /**
     * Format a number for display with proper precision
     */
    function formatNumber(num) {
        if (typeof num !== 'number') return 'N/A';
        
        // For numbers close to integers, return the integer
        if (Math.abs(num - Math.round(num)) < 1e-10) {
            return Math.round(num);
        }
        
        // For small numbers, use fixed notation
        if (Math.abs(num) < 0.0001 || Math.abs(num) > 10000) {
            return num.toExponential(4);
        }
        
        // For numbers with common constants, try to identify them
        const pi = Math.PI;
        const e = Math.E;
        
        // Check if it's close to π or its multiples
        if (Math.abs(num % pi) < 1e-10) {
            const factor = Math.round(num / pi);
            if (factor === 1) return 'π';
            if (factor === -1) return '-π';
            return `${factor}π`;
        }
        
        // Check if it's close to e or its multiples
        if (Math.abs(num % e) < 1e-10) {
            const factor = Math.round(num / e);
            if (factor === 1) return 'e';
            if (factor === -1) return '-e';
            return `${factor}e`;
        }
        
        // Regular decimal format for other numbers
        return parseFloat(num.toFixed(6)).toString();
    }

    /**
     * Show error message in the result area
     */
    function showError(message) {
        limitResult.innerHTML = 'Errore';
        limitResult.classList.add('error-message');
        
        limitExplanation.innerHTML = `<p>${message}</p>`;
    }

    /**
     * Reset calculator to initial state
     */
    function resetCalculator() {
        functionInput.value = '';
        limitPoint.value = '0';
        limitDirection.value = 'both';
        
        currentFunction = '';
        currentLimitPoint = '0';
        currentDirection = 'both';
        calculationResult = null;
        
        updateFunctionPreview();
        updateLimitNotation();
        
        limitResult.innerHTML = 'Inserisci una funzione e premi "Calcola limite"';
        limitResult.classList.remove('error-message');
        
        limitExplanation.innerHTML = '<p>Il risultato del limite sarà mostrato qui con una spiegazione.</p>';
        
        // Reset visualizations
        document.dispatchEvent(new CustomEvent('resetVisualization'));
    }
});
