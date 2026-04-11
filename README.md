# AutoInsight — AI-Powered Used Car Analysis Platform

A full-stack web application that helps first-time used car buyers make informed decisions using AI image analysis, condition scoring, and maintenance cost prediction.

---

## 🗂 Project Structure

```
AutoInsight/
├── backend/                  # Node.js + Express REST API
│   ├── server.js             # Main Express server
│   ├── routes/
│   │   ├── analyze.js        # /api/analyze-car endpoint
│   │   ├── predict.js        # /api/predict-cost endpoint
│   │   └── imageAnalysis.js  # /api/image-analysis endpoint
│   ├── models/
│   │   ├── CarAnalysis.js    # MongoDB schema for analysis results
│   │   └── User.js           # MongoDB user schema
│   ├── ml/
│   │   └── costPredictor.js  # ML cost prediction logic (Random Forest mock)
│   ├── middleware/
│   │   └── upload.js         # Multer image upload middleware
│   └── .env.example
│
├── frontend/                 # React single-page application
│   ├── src/
│   │   ├── App.jsx           # Main app with routing
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AnalyzePage.jsx
│   │   │   └── ResultsPage.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ScoreRing.jsx
│   │   │   ├── CostBreakdown.jsx
│   │   │   ├── IssuesList.jsx
│   │   │   └── ImageUpload.jsx
│   │   ├── api/
│   │   │   └── carApi.js     # Axios API client
│   │   └── utils/
│   │       └── scoring.js    # Client-side score helpers
│   └── package.json
│
├── ml/
│   ├── train_model.py        # Python ML training script
│   ├── cost_predictor.py     # Prediction API (Flask)
│   └── requirements.txt
│
├── sample-data/
│   └── cars_dataset.json     # Sample training/test data
│
└── docs/
    └── api-reference.md      # API endpoint documentation
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.9+ (for ML features)
- An Anthropic API key (for AI analysis)

### 1. Clone & install dependencies

```bash
git clone https://github.com/yourname/autoinsight.git
cd autoinsight
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY and MONGODB_URI
node server.js
# Server runs on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4. (Optional) Python ML service

```bash
cd ml
pip install -r requirements.txt
python train_model.py      # Trains model, saves to model.pkl
python cost_predictor.py   # Starts Flask server on port 5001
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze-car` | Full AI analysis (details + images) |
| POST | `/api/predict-cost` | Maintenance cost prediction |
| POST | `/api/image-analysis` | Image-only damage detection |
| GET  | `/api/history` | Retrieve past analyses |

### Example: POST /api/analyze-car

**Request body:**
```json
{
  "make": "Hyundai",
  "model": "Creta",
  "year": 2019,
  "kmDriven": 62000,
  "fuelType": "Diesel",
  "askingPrice": 980000,
  "owners": 2,
  "knownIssues": ["AC not cooling"],
  "hasServiceBook": true
}
```

**Response:**
```json
{
  "conditionScore": 68,
  "grade": "Fair",
  "recommendation": "NEGOTIATE",
  "estimatedMaintenanceCost": 32000,
  "detectedIssues": [...],
  "costBreakdown": [...],
  "narrative": "This 2019 Hyundai Creta diesel...",
  "fairMarketPrice": 920000,
  "negotiationRoom": 60000
}
```

---

## 🧠 AI/ML Architecture

### Image Analysis (Claude Vision API)
- Uploads images to Claude claude-sonnet-4-20250514
- Detects: scratches, dents, rust, paint fading, interior wear
- Returns severity (Low/Medium/High) per issue

### Condition Score Formula
```
score = (ageScore × 0.25) + (kmScore × 0.30) + (imageScore × 0.30) + (ownerScore × 0.15)
```
- **ageScore**: Decays from 100 at age 0 to ~30 at age 10+
- **kmScore**: Decays from 100 at 0km to ~20 at 150,000km+
- **imageScore**: Based on detected damage severity
- **ownerScore**: 100 for 1st owner, -20 per additional owner

### Maintenance Cost (ML Model)
- Algorithm: Random Forest Regressor
- Features: age, km, fuel_type, num_owners, detected_issues_count, make_reliability_score
- Trained on 500+ synthetic records based on Indian market data

---

## 🎁 Sample Test Data

Run this curl command to test the API:

```bash
curl -X POST http://localhost:5000/api/analyze-car \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Maruti Suzuki",
    "model": "Swift",
    "year": 2018,
    "kmDriven": 78000,
    "fuelType": "Petrol",
    "askingPrice": 520000,
    "owners": 1,
    "knownIssues": ["Tyre worn"],
    "hasServiceBook": true
  }'
```

---

## 🔮 Future Improvements

1. **RC Certificate Verification** — Auto-fetch registration data via Vahan API
2. **Video Analysis** — Accept short video walkarounds for better damage detection
3. **Price Trend Charts** — Show depreciation curve for the specific model
4. **Dealer Database** — Flag suspicious listings and known problematic sellers
5. **Mobile App** — React Native version for on-the-spot inspection
6. **Comparison Mode** — Compare two cars side-by-side
7. **Integration with CarDekho/OLX** — Auto-populate details from listing URLs
8. **Community Reports** — Crowdsourced reliability data per model

---

## 📄 License

MIT License — free for personal and commercial use.
