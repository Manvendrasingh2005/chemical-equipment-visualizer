import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// --- CONFIGURATION ---
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- ANIMATION STYLES (Injected directly) ---
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(21, 101, 192, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(21, 101, 192, 0); }
    100% { box-shadow: 0 0 0 0 rgba(21, 101, 192, 0); }
  }

  .animated-card {
    animation: fadeIn 0.8s ease-out forwards;
    opacity: 0; /* Hidden initially */
  }

  .hover-scale {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .hover-scale:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  .table-row-anim {
    transition: background-color 0.2s;
  }
  .table-row-anim:hover {
    background-color: #f1f8ff;
  }
`;

// --- MODERN STYLES (CSS-IN-JS) ---
const styles = {
  container: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
    paddingBottom: '40px',
    color: '#333',
  },
  navbar: {
    backgroundColor: '#1a237e', // Deep Scientific Blue
    color: 'white',
    padding: '20px 40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    animation: 'slideIn 0.8s ease-out',
  },
  navTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    padding: '0 40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    marginTop: 0,
    color: '#1a237e',
    borderBottom: '2px solid #e3f2fd',
    paddingBottom: '10px',
    marginBottom: '20px',
    fontSize: '18px',
  },
  uploadBox: {
    border: '2px dashed #90caf9',
    borderRadius: '8px',
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#e3f2fd',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
  },
  btnPrimary: {
    backgroundColor: '#1565c0',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginRight: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
  },
  btnSuccess: {
    backgroundColor: '#2e7d32', // Scientific Green
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px',
    fontSize: '14px',
  },
  th: {
    backgroundColor: '#f5f5f5',
    color: '#555',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #eee',
  },
  badge: {
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
  },
  fullWidthCard: {
    gridColumn: '1 / -1',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    margin: '25px 40px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
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

  const chartData = {
    labels: history.map(item => item.filename.substring(0, 15) + '...'), // Shorten names
    datasets: [
      {
        label: 'Avg Pressure (bar)',
        data: history.map(item => item.avg_pressure),
        backgroundColor: '#1976d2',
        borderRadius: 4,
      },
      {
        label: 'Avg Temp (°C)',
        data: history.map(item => item.avg_temperature),
        backgroundColor: '#ef5350',
        borderRadius: 4,
      },
      {
        label: 'Avg Flowrate (m³/h)',
        data: history.map(item => item.avg_flowrate),
        backgroundColor: '#26a69a',
        borderRadius: 4,
      }
    ]
  };

  return (
    <div style={styles.container}>
      {/* Inject Keyframe Animations */}
      <style>{animationStyles}</style>

      {/* HEADER */}
      <nav style={styles.navbar}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span style={{fontSize: '30px', animation: 'pulse 2s infinite'}}>⚗️</span>
            <h1 style={styles.navTitle}>ChemEquip Analytics <span style={{fontSize:'14px', opacity: 0.8}}>v1.0</span></h1>
        </div>
        <div style={{fontSize: '14px'}}>FOSSEE Internship Project</div>
      </nav>

      <div style={styles.grid}>
        
        {/* CARD 1: CONTROL PANEL */}
        <div className="animated-card hover-scale" style={{...styles.card, animationDelay: '0.1s'}}>
          <h3 style={styles.cardTitle}>1. Data Ingestion</h3>
          <div 
            style={{
              ...styles.uploadBox, 
              borderColor: isHovered ? '#1565c0' : '#90caf9',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              backgroundColor: isHovered ? '#e8f4fd' : '#e3f2fd'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <p style={{margin: '0 0 10px 0', fontSize: '24px'}}>📂</p>
            <input 
                type="file" 
                onChange={(e) => setSelectedFile(e.target.files[0])} 
                style={{display: 'none'}} 
                id="file-upload"
            />
            <label htmlFor="file-upload" style={{cursor: 'pointer', color: '#1565c0', fontWeight: 'bold'}}>
               {selectedFile ? selectedFile.name : "Click to select CSV File"}
            </label>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
             <button className="hover-scale" onClick={handleUpload} style={styles.btnPrimary}>⚡ Analyze Data</button>
             <button className="hover-scale" onClick={downloadPDF} style={styles.btnSuccess}>📄 Get Report</button>
          </div>
        </div>

        {/* CARD 2: VISUALIZATION */}
        <div className="animated-card hover-scale" style={{...styles.card, animationDelay: '0.3s'}}>
          <h3 style={styles.cardTitle}>2. Real-time Metrics</h3>
          <div style={{ height: '250px' }}>
            <Bar 
                data={chartData} 
                options={{ 
                    animation: { duration: 2000, easing: 'easeOutQuart' }, // Chart JS Internal Animation
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }} 
            />
          </div>
        </div>
      </div>

      {/* FULL WIDTH CARD: RAW DATA PREVIEW */}
      {previewData.length > 0 && (
        <div className="animated-card" style={{...styles.fullWidthCard, animationDelay: '0.5s'}}>
          <h3 style={styles.cardTitle}>🔍 Detailed Inspection (Top 10 Rows)</h3>
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
                    <tr key={index} className="table-row-anim">
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

      {/* FULL WIDTH CARD: HISTORY */}
      <div className="animated-card" style={{...styles.fullWidthCard, animationDelay: '0.5s'}}>
        <h3 style={styles.cardTitle}>📜 Analysis History</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Filename</th>
              <th style={styles.th}>Date Processed</th>
              <th style={styles.th}>Metrics (Avg)</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index} className="table-row-anim">
                <td style={styles.td}>#{item.id}</td>
                <td style={styles.td}><strong>{item.filename}</strong></td>
                <td style={styles.td}>{new Date(item.upload_date).toLocaleDateString()}</td>
                <td style={styles.td}>
                    <span style={{marginRight: '10px'}}>🌡️ {item.avg_temperature.toFixed(1)}°C</span>
                    <span style={{marginRight: '10px'}}>⏲️ {item.avg_pressure.toFixed(1)} bar</span>
                    <span>🌊 {item.avg_flowrate.toFixed(1)} m³/h</span>
                </td>
                <td style={styles.td}><span style={styles.badge}>Completed</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;