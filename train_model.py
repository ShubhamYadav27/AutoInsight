#!/usr/bin/env python3
"""
============================================================
ml/train_model.py
Trains a Random Forest Regressor to predict annual car
maintenance costs based on Indian used car market data.
Saves the trained model to model.pkl for use in the Flask API.
============================================================
"""

import json
import pickle
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score

# ── Generate synthetic training data ─────────────────────────
# In production, replace this with real historical data
def generate_dataset(n=500):
    """
    Generate realistic synthetic records based on Indian market patterns.
    Features: age, km_driven, fuel_type, owners, issue_count, reliability_score
    Target: annual_maintenance_cost (INR)
    """
    np.random.seed(42)  # Reproducibility

    records = []

    fuel_types = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']
    fuel_mults = {'Petrol': 1.0, 'Diesel': 1.2, 'CNG': 0.85, 'Electric': 0.6, 'Hybrid': 0.9}

    for _ in range(n):
        age        = np.random.randint(1, 15)
        km_driven  = int(np.random.normal(12000 * age, 15000))  # ~12000 km/year average
        km_driven  = max(1000, min(km_driven, 300000))
        fuel_type  = np.random.choice(fuel_types, p=[0.50, 0.30, 0.10, 0.05, 0.05])
        owners     = np.random.choice([1, 2, 3, 4], p=[0.45, 0.35, 0.15, 0.05])
        issue_count= np.random.randint(0, 6)
        reliability= np.random.uniform(4, 9)  # Brand reliability 4-9

        # Cost model (ground truth formula)
        base_cost = (
            8000 +
            age * 2500 +
            km_driven * 0.05 +
            issue_count * 6000 +
            (owners - 1) * 4000
        )
        fuel_mult  = fuel_mults[fuel_type]
        rel_mult   = 1 + ((9 - reliability) / 9) * 0.4
        noise      = np.random.normal(1.0, 0.08)  # 8% noise

        annual_cost = int(base_cost * fuel_mult * rel_mult * noise)
        annual_cost = max(5000, min(annual_cost, 200000))

        records.append({
            'age': age,
            'km_driven': km_driven,
            'fuel_type': fuel_type,
            'owners': owners,
            'issue_count': issue_count,
            'reliability_score': round(reliability, 1),
            'annual_maintenance_cost': annual_cost
        })

    return records

# ── Main training pipeline ────────────────────────────────────
def train():
    print("🔧 Generating training data...")
    data = generate_dataset(500)

    # Save sample dataset for reference
    with open('sample_data.json', 'w') as f:
        json.dump(data[:20], f, indent=2)
    print(f"   Saved 20 sample records to sample_data.json")

    # Extract features and labels
    le = LabelEncoder()
    fuel_types = [d['fuel_type'] for d in data]
    le.fit(fuel_types)

    X = np.array([
        [
            d['age'],
            d['km_driven'],
            le.transform([d['fuel_type']])[0],  # Encode categorical
            d['owners'],
            d['issue_count'],
            d['reliability_score']
        ]
        for d in data
    ])

    y = np.array([d['annual_maintenance_cost'] for d in data])

    # ── Train/test split ──────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(f"🌲 Training Random Forest on {len(X_train)} samples...")

    # ── Train model ───────────────────────────────────────────
    model = RandomForestRegressor(
        n_estimators=100,       # 100 decision trees
        max_depth=8,            # Prevent overfitting
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1               # Use all CPU cores
    )
    model.fit(X_train, y_train)

    # ── Evaluate ──────────────────────────────────────────────
    y_pred = model.predict(X_test)
    mae    = mean_absolute_error(y_test, y_pred)
    r2     = r2_score(y_test, y_pred)

    print(f"\n📊 Model Performance:")
    print(f"   Mean Absolute Error : ₹{mae:,.0f}")
    print(f"   R² Score            : {r2:.3f}")
    print(f"   Accuracy range      : ±₹{mae:,.0f} per year")

    # Feature importance
    feature_names = ['Age', 'KM Driven', 'Fuel Type', 'Owners', 'Issues', 'Reliability']
    importance = sorted(zip(feature_names, model.feature_importances_), key=lambda x: -x[1])
    print(f"\n🔍 Feature Importance:")
    for name, imp in importance:
        bar = '█' * int(imp * 40)
        print(f"   {name:<12} {bar} {imp:.1%}")

    # ── Save model + encoder ──────────────────────────────────
    artifact = {'model': model, 'label_encoder': le, 'feature_names': feature_names}
    with open('model.pkl', 'wb') as f:
        pickle.dump(artifact, f)

    print(f"\n✅ Model saved to model.pkl")
    print(f"   Run: python cost_predictor.py  →  starts Flask API on :5001")

if __name__ == '__main__':
    train()
