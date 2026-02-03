# ⚗️ Chemical Equipment Visualizer

A modern Full-Stack Desktop Application designed to analyze, visualize, and report on industrial sensor data. Built with **Django**, **React**, and **Electron**.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Features

* **Real-time Data Parsing:** Upload CSV files containing sensor logs (Pressure, Temperature, Flow Rates).
* **Interactive Visualizations:**
    * **Bar Charts:** Compare average Pressure vs. Flow Rate.
    * **Line Charts:** Track Temperature trends over time with smooth interpolation.
* **Modern UI/UX:** "Slate & Indigo" aesthetic with glassmorphism effects, animated transitions, and hover physics.
* **PDF Reporting:** Auto-generate downloadable PDF reports for management using Python's ReportLab.
* **History Tracking:** SQLite database integration to store and review past analysis logs.
* **Cross-Platform:** Wraps the React interface in **Electron** for a native desktop experience.

## 🛠️ Tech Stack

**Frontend:**
* React.js
* Chart.js (Data Visualization)
* CSS3 (Animations, Flexbox, Grid)
* Axios

**Backend:**
* Python & Django
* Django REST Framework (API)
* Pandas (Data Processing)
* ReportLab (PDF Generation)

**Desktop Wrapper:**
* Electron.js

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
* Node.js & npm installed
* Python 3.8+ installed

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/chemical-analytics-dashboard.git](https://github.com/YOUR_USERNAME/chemical-analytics-dashboard.git)
cd chemical-analytics-dashboard