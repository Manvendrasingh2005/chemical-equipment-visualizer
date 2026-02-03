# Chemical Equipment Visualizer (Hybrid Web + Desktop App)

A robust full-stack monitoring solution featuring a **Django REST API**, **React Dashboard**, and an **Electron Desktop Wrapper**. This system provides real-time analytics, trend visualization, and reporting for industrial chemical equipment data.

### 🌟 Key Features

* **Hybrid Architecture**: Runs as both a standard **Web Application** and a native **Desktop Application** (via Electron) using the same codebase.
* **Modern "Sci-Fi" Interface**: Features a **"Slate & Indigo"** premium theme with glassmorphism effects, smooth CSS animations, and hover physics.
* **Dynamic Visualization Suite**:
    * **Bar Charts**: Compare Pressure vs. Flow Rate with animated growth effects.
    * **Line Charts**: Track Temperature trends over time with smooth interpolation.
* **Persistent History**: Automatically logs and retrieves past analysis sessions using **Django & SQLite**.
* **Automated Reporting**: Integrated **PDF Generation** (ReportLab) to download professional summaries of equipment data.

---

### 🛠️ Tech Stack

* **Desktop Wrapper**: Electron.js
* **Frontend**: React.js, Chart.js, Axios, CSS3 (Animations)
* **Backend**: Django, Django REST Framework, SQLite3
* **Data Processing**: Pandas, ReportLab

---

## ⚙️ Setup & Installation

### 1. Backend (Django)

```bash
cd chemicalvisualizer
python -m venv env
.\env\Scripts\activate   # On Mac/Linux: source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
### 2. Frontend & Desktop (React + Electron)

```Bash
cd chemical-web-frontend
npm install

# Option A: Run as Website
npm start

# Option B: Run as Desktop App
npm run electron
```
### 3. Usage Instructions

Modern Dashboard: Launch the app to see the animated "Chemical Equipment Visualizer" interface with pulse effects.
Data Ingestion: Click the "Select CSV File" box (which glows on hover) to upload your sensor logs.
Real-Time Visuals:
Trend Analysis: Instantly view the Temperature Trend line chart drawing itself from left to right.
Metric Comparison: Watch the Pressure & Flow bar charts grow to represent the data.
Global History: Scroll down to the Processing History table to see status logs of all previous uploads, fetched directly from the backend database.
Export Reports: Click the "Download Report" button to generate and save a PDF summary of the current analysis.
* **Developer**: Kunwar Manvendra Pratap Singh

* **Institution**: VIT Bhopal University

* **Project Purpose**: Technical Portfolio for FOSSEE Internship Application.
