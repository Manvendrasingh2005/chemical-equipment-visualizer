import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line, Scatter, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import './App.css';

// Register Chart Components (Added ArcElement for Doughnut)
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

// --- GLOBAL CHART THEME ---
ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.borderColor = '#334155';
ChartJS.defaults.font.family = "'Inter', sans-serif";

function App() {
  // --- AUTH STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- APP STATE ---
  const [history, setHistory] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => { 
    if (isLoggedIn) fetchHistory(); 
  }, [isLoggedIn]);

  // --- AUTH HANDLER ---
  const handleLogin = (e) => {
    e.preventDefault();
    // Simple mock auth for demonstration. 
    // In production, connect this to your Django /api/login endpoint.
    if (username === 'manvendra' && password === '28jan2005') {
      setIsLoggedIn(true);
    } else {
      alert("Invalid Credentials (Try: admin / password)");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/history/');
      setHistory(res.data);
    } catch (err) { console.error("API Error", err); }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file.");
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      setPreviewData(res.data.preview);
      alert("Data Imported Successfully");
      fetchHistory();
    } catch (e) { alert("Upload Failed"); }
  };

  const downloadPDF = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/report/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a'); link.href = url; link.download = 'Analysis_Report.pdf'; link.click();
    } catch (e) { alert("Report Generation Failed. Run analysis first."); }
  };

  // --- METRICS ---
  const latest = history[0] || {};
  const avgTemp = latest.avg_temperature ? latest.avg_temperature.toFixed(1) : '0';
  const avgPress = latest.avg_pressure ? latest.avg_pressure.toFixed(1) : '0';
  const avgFlow = latest.avg_flowrate ? latest.avg_flowrate.toFixed(1) : '0';

  // --- CHART CONFIGURATION ---
  
  // 1. DOUGHNUT: Equipment Distribution (New Requirement)
  const doughnutData = {
    labels: ['Reactors', 'Pumps', 'Heat Exchangers', 'Storage Tanks'],
    datasets: [{
      data: [45, 25, 20, 10], // Mock distribution (Connect to API if available)
      backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  // 2. BAR CHART
  const barData = {
    labels: history.slice(0, 5).map((_, i) => `Unit ${['A','B','C','D','E'][i]}`),
    datasets: [
      { label: 'Pressure (bar)', data: history.slice(0, 5).map(h => h.avg_pressure), backgroundColor: '#6366f1', borderRadius: 4 },
      { label: 'Flow (m³/h)', data: history.slice(0, 5).map(h => h.avg_flowrate), backgroundColor: '#06b6d4', borderRadius: 4 }
    ]
  };

  // 3. LINE CHART
  const lineData = {
    labels: history.map(h => new Date(h.upload_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})),
    datasets: [
      { label: 'Temperature', data: history.map(h => h.avg_temperature), borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)', tension: 0.4, fill: true },
      { label: 'Pressure', data: history.map(h => h.avg_pressure), borderColor: '#3b82f6', borderDash: [5, 5], tension: 0.4, pointRadius: 0 }
    ]
  };

  // 4. SCATTER CHART
  const scatterData = {
    datasets: [{ label: 'Reaction Rate', data: history.map((h, i) => ({ x: i * 10, y: h.avg_flowrate })), backgroundColor: '#0ea5e9', pointRadius: 6 }]
  };

  // --- RENDER LOGIN SCREEN IF NOT AUTHENTICATED ---
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div style={{fontSize: '3rem', marginBottom: '10px'}}>⚗️</div>
          <h2 style={{color: 'white', marginBottom: '5px'}}>Chemical Visualizer</h2>
          <p style={{color: '#94a3b8', marginBottom: '30px'}}>Secure Access Portal</p>
          <form onSubmit={handleLogin}>
            <input className="login-input" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input className="login-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" className="login-btn">LOGIN</button>
          </form>
          <p style={{marginTop:'20px', color:'#475569', fontSize:'0.8rem'}}>Default: admin / password</p>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand" style={{fontSize: '1.1rem', lineHeight: '1.4'}}>
          <span className="brand-icon">⚗️</span> Chemical Equipment Visualizer
        </div>
        <ul className="nav-menu">
          <li className={`nav-item ${activeTab==='dashboard'?'active':''}`} onClick={()=>setActiveTab('dashboard')}>
            <span>📊</span> Dashboard
          </li>
          <li className="nav-item"><span>☁️</span> Data Upload</li>
          <li className="nav-item"><span>📈</span> Analytics</li>
          <li className="nav-item" onClick={() => setIsLoggedIn(false)} style={{marginTop: 'auto', color: '#ef4444'}}>
             <span>🚪</span> Logout
          </li>
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div style={{marginBottom: '30px'}}>
          <h2 style={{margin: 0, fontSize: '1.5rem'}}>Dashboard</h2>
          <p style={{color: '#64748b', margin: '5px 0'}}>Overview and Analysis</p>
        </div>

        {/* KPI CARDS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header"><span className="stat-title">Avg. Flow</span><span className="stat-icon">⚡</span></div>
            <h3 className="stat-value">{avgFlow} <span style={{fontSize:'1rem'}}>m³/h</span></h3>
          </div>
          <div className="stat-card">
            <div className="stat-header"><span className="stat-title">Temperature</span><span className="stat-icon">🌡️</span></div>
            <h3 className="stat-value">{avgTemp}°C</h3>
          </div>
          <div className="stat-card">
            <div className="stat-header"><span className="stat-title">Pressure</span><span className="stat-icon">⏱️</span></div>
            <h3 className="stat-value">{avgPress} bar</h3>
          </div>
          <div className="stat-card">
            <div className="stat-header"><span className="stat-title">Total Records</span><span className="stat-icon">🟢</span></div>
            <h3 className="stat-value">{latest.total_count || 0}</h3>
          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="dashboard-grid">
          
          {/* 1. UPLOAD PANEL */}
          <div className="card col-span-4 upload-card">
            <h3 className="card-title">Upload Data</h3>
            <p className="card-subtitle">Import CSV/XLSX</p>
            <div className="upload-zone" onClick={() => document.getElementById('fileInput').click()}>
              <div className="upload-icon-circle">↑</div>
              <div style={{fontWeight: 500, color: 'white'}}>Drag & drop files here</div>
            </div>
            <input id="fileInput" type="file" hidden onChange={(e) => setSelectedFile(e.target.files[0])} />
            
            {selectedFile && <div style={{background: '#334155', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', marginTop: '10px'}}>📄 {selectedFile.name}</div>}
            
            <div className="btn-group">
                <button className="btn-primary" style={{flex:1}} onClick={handleUpload}>Run Analysis</button>
                <button className="btn-primary" style={{flex:1}} onClick={downloadPDF}>Download PDF</button>
            </div>

            <div className="recent-section">
                <div className="recent-header">Recent Uploads (Last 5)</div>
                <div className="recent-list">
                    {history.slice(0, 5).map((item, index) => (
                        <div key={index} className="recent-item">
                            <span className="file-icon">📄</span>
                            <div className="file-info">
                                <div className="file-name">{item.filename}</div>
                                <div className="file-meta">{new Date(item.upload_date).toLocaleDateString()}</div>
                            </div>
                            <span className="status-icon">✓</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* 2. DISTRIBUTION CHART (New Requirement) */}
          <div className="card col-span-4">
            <h3 className="card-title">Equipment Type Distribution</h3>
            <p className="card-subtitle">Asset Classification</p>
            <div style={{height: '250px', display: 'flex', justifyContent: 'center'}}>
              <Doughnut data={doughnutData} options={{maintainAspectRatio: false, plugins: {legend: {position: 'right'}}}} />
            </div>
          </div>

          {/* 3. BAR CHART */}
          <div className="card col-span-4">
            <h3 className="card-title">Metric Comparison</h3>
            <p className="card-subtitle">Pressure vs Flow Rate</p>
            <div style={{height: '250px'}}>
              <Bar data={barData} options={{maintainAspectRatio: false}} />
            </div>
          </div>

          {/* 4. LINE CHART (Wide) */}
          <div className="card col-span-8">
            <h3 className="card-title">Process Trends</h3>
            <p className="card-subtitle">Temperature & Pressure over time</p>
            <div style={{height: '220px'}}>
               <Line data={lineData} options={{maintainAspectRatio: false}} />
            </div>
          </div>

          {/* 5. DATA TABLE (Wide) */}
          {previewData.length > 0 && (
            <div className="card col-span-4">
              <h3 className="card-title">Live Data Feed</h3>
              <div style={{overflowY: 'auto', maxHeight: '220px'}}>
                <table>
                  <thead><tr><th>Pressure</th><th>Temp</th><th>Flow</th></tr></thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        <td style={{color: '#6366f1'}}>{row.Pressure || row.avg_pressure}</td>
                        <td style={{color: '#a855f7'}}>{row.Temperature || row.avg_temperature}</td>
                        <td style={{color: '#06b6d4'}}>{row.Flowrate || row.avg_flowrate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;