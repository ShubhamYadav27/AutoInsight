# AutoInsight API Reference

Base URL: `http://localhost:5000/api`

---

## POST /analyze-car

Full AI-powered analysis combining car details and optional photos.

### Request Body

```json
{
  "make":         "Hyundai",
  "model":        "Creta",
  "year":         2019,
  "kmDriven":     62000,
  "fuelType":     "Diesel",
  "askingPrice":  980000,
  "owners":       2,
  "knownIssues":  ["AC not cooling"],
  "hasServiceBook": true,
  "images": [
    {
      "data":      "<base64 string>",
      "mediaType": "image/jpeg"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| make | string | ✅ | Car manufacturer |
| model | string | ✅ | Car model name |
| year | number | ✅ | Year of manufacture |
| kmDriven | number | ✅ | Total kilometers driven |
| fuelType | string | — | Petrol / Diesel / CNG / Electric / Hybrid |
| askingPrice | number | — | Seller's asking price in INR |
| owners | number | — | Number of previous owners |
| knownIssues | string[] | — | Issues disclosed by seller |
| hasServiceBook | boolean | — | Whether service history is available |
| images | object[] | — | Up to 4 base64-encoded car photos |

### Response

```json
{
  "success": true,
  "data": {
    "conditionScore": 68,
    "grade": "Fair",
    "recommendation": "NEGOTIATE",
    "recommendationReason": "The car has good mileage for its age but the disclosed AC issue and second ownership reduce its score.",
    "estimatedMaintenanceCost": 32000,
    "fairMarketPrice": 920000,
    "negotiationRoom": 60000,
    "narrative": "This 2019 Hyundai Creta diesel has covered 62,000 km over 6 years...",
    "redFlags": ["AC system requires attention"],
    "positives": ["Service book available", "Single-digit age", "Popular and well-supported model"],
    "detectedIssues": [
      {
        "title": "AC System Fault",
        "description": "Seller disclosed AC not cooling. Likely refrigerant recharge or compressor service needed.",
        "severity": "Medium",
        "estimatedCost": 8000
      }
    ],
    "costBreakdown": [
      { "item": "Engine & Transmission", "amount": 8000, "urgency": "Low" },
      { "item": "Brakes & Suspension",   "amount": 5000, "urgency": "Low" },
      { "item": "Tyres & Wheels",        "amount": 4000, "urgency": "Low" },
      { "item": "AC & Electrical",       "amount": 9000, "urgency": "Medium" },
      { "item": "Body & Interior",       "amount": 3000, "urgency": "Low" },
      { "item": "Routine Servicing",     "amount": 3000, "urgency": "Low" }
    ],
    "scoreBreakdown": {
      "ageScore": 58,
      "kmScore": 59,
      "imageScore": 75,
      "ownerScore": 78
    },
    "recordId": "665f2c3a8b1234abcd567890"
  }
}
```

---

## POST /predict-cost

ML-only cost prediction (fast, no Claude API call).

### Request Body

```json
{
  "year":       2018,
  "kmDriven":   78000,
  "fuelType":   "Petrol",
  "owners":     1,
  "make":       "Maruti Suzuki",
  "issueCount": 1
}
```

### Response

```json
{
  "success": true,
  "data": {
    "annualCost": 22000,
    "confidence": "High",
    "breakdown": {
      "Engine & Transmission": 6160,
      "Brakes & Suspension":   4400,
      "Tyres & Wheels":        3300,
      "AC & Electrical":       3300,
      "Body & Interior":       2200,
      "Routine Servicing":     2640
    },
    "note": "Estimate based on Indian market data for similar vehicles"
  }
}
```

---

## POST /image-analysis

Dedicated image damage detection endpoint.

### Request Body

```json
{
  "images": [
    { "data": "<base64>", "mediaType": "image/jpeg" },
    { "data": "<base64>", "mediaType": "image/png" }
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "overallImageScore": 74,
    "damageDetected": true,
    "issues": [
      {
        "type": "scratch",
        "location": "left_side",
        "severity": "Low",
        "description": "Minor scratch on left rear door, approximately 20cm",
        "estimatedRepairCost": 3000
      }
    ],
    "photoQuality": "Good",
    "areasNotVisible": ["Engine bay", "Undercarriage"],
    "recommendations": ["Request engine bay photos", "Check tyre tread in person"]
  }
}
```

---

## GET /analyze-car/history

Retrieve the 20 most recent analyses from the database.

### Response

```json
{
  "data": [
    {
      "_id": "665f2c3a8b1234abcd567890",
      "carInfo": { "make": "Hyundai", "model": "Creta", "year": 2019, "kmDriven": 62000 },
      "result": { "conditionScore": 68, "recommendation": "NEGOTIATE" },
      "createdAt": "2025-06-12T10:30:00.000Z"
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "make, model, year, and kmDriven are required"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request — missing or invalid input |
| 500 | Server error — check logs |
| 503 | ML model not loaded — run train_model.py first |
