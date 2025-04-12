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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
