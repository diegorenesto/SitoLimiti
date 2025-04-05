from flask import Flask, render_template, send_from_directory, request, jsonify
import os
import math
import sympy as sp
import numpy as np
import logging

# Configurazione del logger
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder=".")

# Configurazione app
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limite di 16 MB per le richieste

@app.route('/')
def index():
    return send_from_directory(".", "index.html")

@app.route('/<path:path>')
def serve_files(path):
    return send_from_directory(".", path)

# API per il calcolo dei limiti
@app.route('/api/calculate-limit', methods=['POST'])
def calculate_limit():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dati JSON mancanti"}), 400
        
        # Estrai i parametri dalla richiesta
        func_str = data.get('function', '')
        point_str = data.get('point', '0')
        direction = data.get('direction', 'both')
        
        logger.debug(f"Calcolo limite per funzione: {func_str}, punto: {point_str}, direzione: {direction}")
        
        # Calcola il limite usando SymPy per l'analisi simbolica
        result = symbolic_limit_calculation(func_str, point_str, direction)
        
        # Prepara la risposta
        response = {
            "function": func_str,
            "point": point_str,
            "direction": direction,
            "result": result,
            "latex": sympy_to_latex(result)
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Errore nel calcolo del limite: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Funzione per il calcolo simbolico dei limiti
def symbolic_limit_calculation(func_str, point_str, direction):
    try:
        # Definisci il simbolo x per SymPy
        x = sp.Symbol('x')
        
        # Converti la stringa della funzione in un'espressione SymPy
        func_expr = sp.sympify(func_str)
        
        # Gestisci il punto di limite
        if point_str.lower() in ('infinity', 'inf', '∞'):
            point = sp.oo  # Infinito positivo
        elif point_str.lower() in ('-infinity', '-inf', '-∞'):
            point = -sp.oo  # Infinito negativo
        elif point_str.lower() in ('pi', 'π'):
            point = sp.pi  # Pi greco
        else:
            # Prova a convertire il punto in un numero
            try:
                point = sp.sympify(point_str)
            except:
                raise ValueError(f"Punto di limite non valido: {point_str}")
        
        # Determina la direzione del limite
        if direction == 'left':
            dir_sympy = '-'
        elif direction == 'right':
            dir_sympy = '+'
        else:  # both
            dir_sympy = None
        
        # Calcola il limite
        limit_result = sp.limit(func_expr, x, point, dir=dir_sympy)
        
        # Converti il risultato in una forma più semplice
        if isinstance(limit_result, sp.Expr):
            try:
                limit_result = float(limit_result)
            except:
                # Se non è possibile convertire in float, lascia l'espressione simbolica
                pass
        
        return str(limit_result)
    
    except Exception as e:
        logger.error(f"Errore nel calcolo simbolico: {str(e)}")
        raise ValueError(f"Errore nel calcolo del limite: {str(e)}")

# Converte un'espressione SymPy in LaTeX
def sympy_to_latex(expr_str):
    try:
        # Prova a convertire la stringa in un'espressione SymPy
        expr = sp.sympify(expr_str)
        return sp.latex(expr)
    except:
        # Se non è possibile, restituisci la stringa originale
        return expr_str

# API per generare dati per grafici
@app.route('/api/generate-graph-data', methods=['POST'])
def generate_graph_data():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dati JSON mancanti"}), 400
        
        # Estrai i parametri dalla richiesta
        func_str = data.get('function', '')
        point_str = data.get('point', '0')
        x_min = float(data.get('x_min', -10))
        x_max = float(data.get('x_max', 10))
        num_points = int(data.get('num_points', 200))
        
        logger.debug(f"Generazione dati grafico per funzione: {func_str}, intervallo: [{x_min}, {x_max}]")
        
        # Converti il punto di limite in un numero
        if point_str.lower() in ('infinity', 'inf', '∞'):
            point = float('inf')
        elif point_str.lower() in ('-infinity', '-inf', '-∞'):
            point = float('-inf')
        elif point_str.lower() in ('pi', 'π'):
            point = math.pi
        else:
            try:
                point = float(point_str)
            except:
                point = 0
        
        # Genera i punti x
        x_values = np.linspace(x_min, x_max, num_points)
        
        # Calcola i valori y
        y_values = calculate_function_values(func_str, x_values, point)
        
        # Prepara la risposta
        response = {
            "x": x_values.tolist(),
            "y": y_values
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Errore nella generazione dei dati del grafico: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Funzione per calcolare i valori della funzione
def calculate_function_values(func_str, x_values, point):
    try:
        # Definisci il simbolo x per SymPy
        x = sp.Symbol('x')
        
        # Converti la stringa della funzione in un'espressione SymPy
        func_expr = sp.sympify(func_str)
        
        # Converti l'espressione SymPy in una funzione lambda
        func_lambda = sp.lambdify(x, func_expr, modules=['numpy', {'sin': math.sin, 'cos': math.cos, 'tan': math.tan, 
                                                                   'exp': math.exp, 'log': math.log, 'sqrt': math.sqrt}])
        
        # Calcola i valori y
        y_values = []
        epsilon = 1e-10  # Zona da evitare intorno al punto di limite
        
        for x_val in x_values:
            # Verifica se siamo troppo vicini al punto di limite
            if abs(x_val - point) < epsilon and not math.isinf(point):
                y_values.append(None)  # Crea un gap nel grafico
            else:
                try:
                    result = func_lambda(x_val)
                    
                    # Gestisci risultati infiniti o NaN
                    if math.isinf(result) or math.isnan(result):
                        y_values.append(None)
                    # Limita i valori estremi per una migliore visualizzazione
                    elif result > 1000:
                        y_values.append(1000)
                    elif result < -1000:
                        y_values.append(-1000)
                    else:
                        y_values.append(float(result))
                except:
                    y_values.append(None)
        
        return y_values
    
    except Exception as e:
        logger.error(f"Errore nel calcolo dei valori della funzione: {str(e)}")
        # Restituisci un array di None se il calcolo fallisce
        return [None] * len(x_values)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)