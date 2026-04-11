#!/usr/bin/env python3
"""
============================================================
ml/cost_predictor.py
Flask microservice that serves predictions from the trained
Random Forest model. Run AFTER train_model.py.

Usage:
  python train_model.py    # Train model first
  python cost_predictor.py # Then start this server
  
Endpoint: POST http://localhost:5001/predict
============================================================
"""

import pickle
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained model on startup
MODEL_PATH = 'model.pkl'
model_artifact = None

def load_model():
    global model_artifact
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            model_artifact = pickle.load(f)
        print(f"✅ Model loaded from {MODEL_PATH}")
    else:
        print(f"⚠️  No model found at {MODEL_PATH}. Run train_model.py first.")

# Brand reliability scores (same as JS version)
MAKE_RELIABILITY = {
    'Maruti Suzuki': 8.5, 'Toyota': 8.8, 'Honda': 8.2,
    'Hyundai': 7.8, 'Kia': 7.5, 'Tata': 6.8, 'Mahindra': 6.5,
    'Renault': 6.2, 'Volkswagen': 6.0, 'Skoda': 5.8,
    'Ford': 6.5, 'BMW': 4.5, 'Mercedes-Benz': 4.0, 'Audi': 4.2
}

@app.route('/predict', methods=['POST'])
def predict():
    """
    POST /predict
    Body: { age, kmDriven, fuelType, owners, issueCount, make }
    Returns: { annualCost, confidence, breakdown }
    """
    if not model_artifact:
        return jsonify({'error': 'Model not loaded. Run train_model.py first.'}), 503

    try:
        data = request.get_json()

        age          = int(data.get('age', 5))
        km_driven    = int(data.get('kmDriven', 50000))
        fuel_type    = data.get('fuelType', 'Petrol')
        owners       = int(data.get('owners', 1))
        issue_count  = int(data.get('issueCount', 0))
        make         = data.get('make', 'Unknown')

        reliability = MAKE_RELIABILITY.get(make, 6.5)
        le          = model_artifact['label_encoder']
        model       = model_artifact['model']

        # Handle unseen fuel types gracefully
        try:
            fuel_encoded = le.transform([fuel_type])[0]
        except ValueError:
            fuel_encoded = le.transform(['Petrol'])[0]

        # Build feature vector
        features = [[age, km_driven, fuel_encoded, owners, issue_count, reliability]]

        # Predict
        predicted_cost = model.predict(features)[0]
        predicted_cost = max(5000, int(round(predicted_cost / 500) * 500))

        # Generate breakdown
        breakdown = {
            'Engine & Transmission': int(predicted_cost * 0.28),
            'Brakes & Suspension':   int(predicted_cost * 0.20),
            'Tyres & Wheels':        int(predicted_cost * 0.15),
            'AC & Electrical':       int(predicted_cost * 0.15),
            'Body & Interior':       int(predicted_cost * 0.10),
            'Routine Servicing':     int(predicted_cost * 0.12)
        }

        # Confidence is higher when inputs are typical/common
        confidence = 'High' if age < 10 and km_driven < 150000 else 'Medium'

        return jsonify({
            'success': True,
            'annualCost': predicted_cost,
            'breakdown': breakdown,
            'confidence': confidence
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model_artifact is not None
    })

if __name__ == '__main__':
    load_model()
    print("🚀 ML API running on http://localhost:5001")
    app.run(port=5001, debug=True)
