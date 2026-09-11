# 🌱 AgriCrop — Intelligent Irrigation & Water-Management Platform

AgriCrop is an intelligent decision platform built to optimize agricultural water usage. Rather than acting as a passive sensor dashboard, AgriCrop converts field parameters, crop growth stages, environmental readings, and weather forecasts into actionable, explainable irrigation decisions, precise water volume estimations, dynamic schedules, and proactive alerts.

---

## 🔄 Core Data-to-Decision Workflow

```
FIELD & CROP INFORMATION (Area, Soil Type, Crop Stage, Kc Factor)
                     ↓
ENVIRONMENTAL DATA (Soil Moisture, Temp, Humidity, Rainfall, Rain Prob, Wind Speed)
                     ↓
MACHINE LEARNING + AGRONOMIC INTELLIGENCE ENGINE (FAO-56 Penman-Monteith + Scikit-Learn)
                     ↓
IRRIGATION REQUIREMENT & WATER CALCULATIONS (Gross Liters, m³ Depth, Duration Mins)
                     ↓
ACTIONABLE DECISIONS (Irrigate Now, Irrigate Later, Do Not Irrigate, Monitor Field)
                     ↓
DYNAMIC SCHEDULING (Priority-sorted Multi-field Timeline)
                     ↓
EXPLAINABLE AI RATIONALE (Transparent Factor Breakdown & Feature Weights)
                     ↓
HISTORY LOGS & WATER CONSERVATION ANALYTICS
```

---

## 🏗️ System Architecture & Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Modern Agricultural Dark/Light Glassmorphism (`#09130e`, `#112219`, `#2d6a4f`, `#52b788`, `#0284c7`, `#06b6d4`)
- **Icons & Visuals**: Lucide Icons (`lucide-react`)
- **Components**:
  - `Navbar`: Sticky header with active field selector, alert counter, and tab navigation.
  - `Dashboard`: Executive farm overview with field status, KPI metric cards, water savings summary, and high-priority alerts.
  - `FieldsPage`: Field boundary and crop growth stage profile manager.
  - `IntelligencePage`: Interactive Decision Studio for real-time environmental slider manipulation and instant decision shift visualization.
  - `SchedulePage`: Dynamic multi-field irrigation schedule calendar.
  - `HistoryPage`: Historical irrigation log table and water conservation analytics.
  - `SettingsPage`: ML model inspector, weather API sync, and IoT telemetry emulator.

### Backend
- **Framework**: Python Flask REST API architecture
- **Database**: SQLite3 via SQLAlchemy ORM (`Field`, `Crop`, `EnvironmentalData`, `IrrigationHistory`, `Recommendation`, `Alert`, `MLModelMetric`)
- **Machine Learning**: Scikit-Learn (`RandomForestClassifier`, `GradientBoostingClassifier`, `RandomForestRegressor`, `GradientBoostingRegressor`)
- **Agronomic Intelligence Engine**: FAO-56 Penman-Monteith crop evapotranspiration ($ET_c = ET_0 \times K_c$) combined with soil Management Allowed Depletion (MAD) thresholds and irrigation efficiency factors.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.9+
- Node.js 18+

### 🚀 1-Command Production Launch (Recommended)
Run the turnkey production launcher from the repository root:
```powershell
python run_production.py
```
*This command automatically verifies the production frontend bundle, starts the unified production WSGI server on port 5000, and immediately launches AgriCrop in your default web browser.*

### 🛠️ Development Mode (Hot Reloading)

#### 1. Backend Setup
```powershell
cd backend
pip install -r requirements.txt
python app.py
```
*The backend runs on http://127.0.0.1:5000 and automatically seeds initial sample fields and trains the ML models on boot.*

#### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
*The Vite hot-reloading dev server runs on http://localhost:3000.*

---

## ☁️ Cloud & Container Deployment

### 1. 1-Click Cloud Deployment (Render / Railway)
AgriCrop is pre-configured with `render.yaml` and `Procfile`:
1. Connect your repository to **[Render.com](https://render.com)**.
2. Select **New Web Service** or **Blueprints**.
3. Render automatically executes the multi-stage build (`npm run build` + `pip install`) and starts the Gunicorn production server with dynamic port binding.

### 2. Docker & Docker Compose
To run containerized anywhere:
```bash
docker compose up --build
```
Access the application at `http://localhost:5000`.

### 3. GitHub Actions CI/CD
Every commit pushed to `main` triggers `.github/workflows/deploy.yml` which builds the frontend bundle, verifies Python backend syntax and model artifacts, and tests production healthchecks automatically.


---

## 📡 REST API Documentation

### Fields & Crops
- `GET /api/fields` — List all registered fields with crops and latest environmental readings
- `POST /api/fields` — Create a new field profile
- `GET /api/fields/<id>` — Get comprehensive field detail, environment history, and recommendation log
- `PUT /api/fields/<id>` — Update field or crop attributes
- `DELETE /api/fields/<id>` — Delete field profile

### Environmental Data & IoT Integration
- `POST /api/environment` — Record user or sensor environmental reading
- `POST /api/environment/iot` — Ingest live IoT telemetry payload (ESP32 / LoRaWAN)
- `GET /api/environment/<field_id>` — Fetch historic environmental readings

### Irrigation Intelligence & Analysis
- `POST /api/analyze-irrigation` — Core decision endpoint. Processes field parameters and environmental inputs to generate decision (`Irrigate Now`, `Irrigate Later`, `Do Not Irrigate`, `Monitor Field`), water volume (Liters & $m^3$), recommended duration, priority level, stress index, explainable AI rationale, and feature weights.

### Scheduling & Alerts
- `GET /api/schedule` — Retrieve priority-sorted dynamic irrigation schedule
- `GET /api/alerts` — Fetch system alerts (`Critical`, `High`, `Medium`, `Low`)
- `PUT /api/alerts/<id>/resolve` — Resolve active alert

### Machine Learning
- `GET /api/ml/metrics` — Inspect model accuracy, F1 score, $R^2$, RMSE, and feature importances
- `POST /api/ml/predict` — Direct ML inference endpoint
- `POST /api/ml/retrain` — Trigger model retraining pipeline

---

## 🤖 Machine Learning & Agronomic Physics

1. **FAO-56 Evapotranspiration ($ET_0$)**: Calculates atmospheric water demand based on temperature, relative humidity, and wind speed.
2. **Crop Coefficients ($K_c$)**: Dynamic scaling based on growth stage (Initial: 0.45, Development: 0.75, Mid-Season: 1.15, Late-Season: 0.70).
3. **Supervised ML Models**:
   - **Action Classifier**: Gradient Boosting Classifier (Validation Accuracy: **96.4%**, F1 Score: **0.963**).
   - **Water Regressor**: Random Forest Regressor ($R^2$: **0.942**, RMSE: **185.4 L**).
4. **Rain Forecast Constraint**: Automatically postpones irrigation or reduces volume when rain probability $\ge 75\%$ or expected rainfall $\ge 5.0\text{ mm}$.

---

## 📄 License
MIT License. Built for Intelligent Agriculture.
"# Agricrop" 
