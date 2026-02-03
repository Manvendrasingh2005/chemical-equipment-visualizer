import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,    
  PointElement,   
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// --- CONFIGURATION ---
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend
);

// --- ANIMATION CSS ---
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 
    70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
    100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
  }

  .animated-card {
    animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
    opacity: 0;
  }

  .hover-scale {
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease;
  }
  .hover-scale:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  }
`;

// --- MODERN 2026 THEME STYLES ---
const styles = {
  container: {
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f8fafc', // Slate-50 (Very light grey-blue)
    minHeight: '100vh',
    paddingBottom: '60px',
    color: '#1e293b', // Slate-800
  },
  navbar: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', // Deep Midnight Gradient
    color: 'white',
    padding: '25px 50px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center',
    borderBottom: '1px solid #334155',
  },
  navTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '800', // Extra bold
    letterSpacing: '-0.5px',
    background: 'linear-gradient(90deg, #818cf8, #c084fc)', // Gradient Text
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '30px',
    padding: '0 50px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px', // More rounded
    padding: '30px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Tailwind style shadow
    border: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    marginTop: 0,
    color: '#334155', // Slate-700
    fontWeight: '700',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '15px',
    marginBottom: '25px',
    fontSize: '18px',
    letterSpacing: '-0.3px',
  },
  uploadBox: {
    border: '2px dashed #cbd5e1', // Slate-300
    borderRadius: '12px',
    padding: '50px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    marginBottom: '25px',
    transition: 'all 0.3s ease',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', // Indigo Gradient
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '15px',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)', // Colored Glow
    transition: 'all 0.3s ease',
  },
  btnSuccess: {
    background: 'white',
    color: '#334155',
    border: '1px solid #cbd5e1',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate', // Allows spacing
    borderSpacing: '0 8px', // Space between rows
    marginTop: '10px',
    fontSize: '14px',
  },
  th: {
    color: '#64748b', // Muted text
    padding: '15px 20px',
    textAlign: 'left',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700',
    borderBottom: 'none',
  },
  td: {
    padding: '20px',
    backgroundColor: '#fff', // White rows
    borderTop: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '50px',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: '#dcfce7', // Light green bg
    color: '#15803d', // Dark green text
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  fullWidthCard: {
    gridColumn: '1 / -1',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '30px',
    margin: '40px 50px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
  }
};

function App() {
  const [history, setHistory] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/history/');
      setHistory(response.data);
    } catch (error) {
      console.error("Connection Error", error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a CSV file first!");
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.preview) setPreviewData(response.data.preview);
      alert("Analysis Complete!");
      fetchHistory(); 
    } catch (error) {
      alert("Upload failed. Ensure Backend is running.");
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/report/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Equipment_Report.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("PDF Failed.");
    }
  };

  // --- 1. MODERN BAR CHART ---
  const barChartData = {
    labels: history.map(item => 'ID #' + item.id),
    datasets: [
      {
        label: 'Pressure (bar)',
        data: history.map(item => item.avg_pressure),
        backgroundColor: '#6366f1', // Indigo
        borderRadius: 8,
        borderSkipped: false, // Rounded on all sides
      },
      {
        label: 'Flow (m³/h)',
        data: history.map(item => item.avg_flowrate),
        backgroundColor: '#0ea5e9', // Sky Blue
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1500, easing: 'easeOutQuart' },
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { usePointStyle: true, padding: 20, font: { weight: 'bold' } } 
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 15,
        cornerRadius: 10,
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        displayColors: false, // Clean look
      }
    },
    scales: {
      x: { grid: { display: false } }, // Remove X grid
      y: { grid: { color: '#f1f5f9' }, border: { display: false } } // Subtle Y grid
    }
  };

  // --- 2. MODERN LINE CHART ---
  const lineChartData = {
    labels: history.map(item => new Date(item.upload_date).toLocaleDateString()),
    datasets: [
      {
        label: 'Temperature Trend (°C)',
        data: history.map(item => item.avg_temperature),
        borderColor: '#ec4899', // Pink-500
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0.0)');
          return gradient;
        },
        tension: 0.4, 
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 3,
        pointBorderColor: '#ec4899',
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { usePointStyle: true, padding: 20, font: { weight: 'bold' } } 
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 15,
        cornerRadius: 10,
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, border: { display: false }, beginAtZero: false } 
    }
  };

  return (
    <div style={styles.container}>
      <style>{animationStyles}</style>

      {/* HEADER */}
      <nav style={styles.navbar}>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <span style={{fontSize: '32px', filter: 'drop-shadow(0 0 10px rgba(129, 140, 248, 0.5))'}}>⚗️</span>
            <h1 style={styles.navTitle}>Chemical Equipment Visualizer</h1>
        </div>
      </nav>

      <div style={styles.grid}>
        
        {/* CARD 1: CONTROL PANEL */}
        <div className="animated-card hover-scale" style={{...styles.card, animationDelay: '0.1s'}}>
          <h3 style={styles.cardTitle}>Data Ingestion</h3>
          <div 
            style={{
              ...styles.uploadBox, 
              borderColor: isHovered ? '#6366f1' : '#cbd5e1',
              backgroundColor: isHovered ? '#eff6ff' : '#f8fafc',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <p style={{margin: '0 0 15px 0', fontSize: '32px', color: '#6366f1'}}>☁️</p>
            <input 
                type="file" 
                onChange={(e) => setSelectedFile(e.target.files[0])} 
                style={{display: 'none'}} 
                id="file-upload"
            />
            <label htmlFor="file-upload" style={{cursor: 'pointer', color: '#334155', fontWeight: '600', fontSize: '1.1rem'}}>
               {selectedFile ? selectedFile.name : "Click to Upload CSV"}
            </label>
            <p style={{fontSize: '12px', color: '#94a3b8', marginTop: '5px'}}>Supported files: .csv</p>
          </div>
          <div style={{display: 'flex', justifyContent: 'center', gap: '15px'}}>
             <button className="hover-scale" onClick={handleUpload} style={styles.btnPrimary}>Analyze Data</button>
             <button className="hover-scale" onClick={downloadPDF} style={styles.btnSuccess}>Download Report</button>
          </div>
        </div>

        {/* CARD 2: BAR CHART */}
        <div className="animated-card hover-scale" style={{...styles.card, animationDelay: '0.2s'}}>
          <h3 style={styles.cardTitle}>Pressure vs Flow</h3>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>

        {/* CARD 3: LINE CHART */}
        <div className="animated-card hover-scale" style={{...styles.card, animationDelay: '0.3s'}}>
          <h3 style={styles.cardTitle}>Temperature Trends</h3>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>

      </div>

      {/* RAW DATA PREVIEW */}
      {previewData.length > 0 && (
        <div className="animated-card" style={{...styles.fullWidthCard, animationDelay: '0.4s'}}>
          <h3 style={styles.cardTitle}>Data Inspection</h3>
          <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
                <thead>
                <tr>
                    {Object.keys(previewData[0]).map((key) => (
                        <th key={key} style={styles.th}>{key}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {previewData.map((row, index) => (
                    <tr key={index} className="hover-scale" style={{transition: 'transform 0.1s'}}>
                        {Object.values(row).map((val, i) => (
                            <td key={i} style={styles.td}>{val}</td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HISTORY TABLE */}
      <div className="animated-card" style={{...styles.fullWidthCard, animationDelay: '0.5s'}}>
        <h3 style={styles.cardTitle}>Processing History</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Filename</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Metrics Summary</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index} style={{boxShadow: '0 2px 4px rgba(0,0,0,0.02)'}}>
                <td style={{...styles.td, borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px'}}>
                  <span style={{color: '#94a3b8', fontWeight: 'bold'}}>#{item.id}</span>
                </td>
                <td style={styles.td}><strong>{item.filename}</strong></td>
                <td style={{...styles.td, color: '#64748b'}}>{new Date(item.upload_date).toLocaleDateString()}</td>
                <td style={styles.td}>
                    <span style={{marginRight: '15px', color: '#ec4899', fontWeight: '500'}}>🌡️ {item.avg_temperature.toFixed(1)}°C</span>
                    <span style={{marginRight: '15px', color: '#6366f1', fontWeight: '500'}}>⏲️ {item.avg_pressure.toFixed(1)} bar</span>
                </td>
                <td style={{...styles.td, borderTopRightRadius: '10px', borderBottomRightRadius: '10px'}}>
                  <span style={styles.badge}>Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;