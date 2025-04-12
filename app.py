import os
import logging
from flask import Flask, render_template

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_dev_key")

@app.route('/')
def index():
    return render_template('calcolatore.html')

@app.route('/calcolatore')
def calculator():
    return render_template('calcolatore.html')
    
@app.route('/teoria')
def teoria():
    # Pagina della teoria - per ora reindirizza alla home
    return render_template('calcolatore.html', message="Pagina teoria in costruzione")

@app.route('/esercizi')
def esercizi():
    # Pagina degli esercizi - per ora reindirizza alla home
    return render_template('calcolatore.html', message="Pagina esercizi in costruzione")

@app.route('/limiti-sociali')
def limiti_sociali():
    # Pagina dei limiti sociali - per ora reindirizza alla home
    return render_template('calcolatore.html', message="Pagina limiti sociali in costruzione")

@app.route('/podcast')
def podcast():
    # Pagina del podcast - per ora reindirizza alla home
    return render_template('calcolatore.html', message="Pagina podcast in costruzione")

@app.route('/chi-siamo')
def chi_siamo():
    # Pagina chi siamo - per ora reindirizza alla home
    return render_template('calcolatore.html', message="Pagina chi siamo in costruzione")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
