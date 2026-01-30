import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const API_BASE = "http://127.0.0.1:8000/api";

function App() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch the last 5 uploads on component load
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history/`);
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first!");
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE}/upload/`, formData);
      setSummary(res.data);
      fetchHistory(); // Refresh history list after successful upload
    } catch (err) {
      alert("Upload failed. Ensure Django server is running!");
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h1>Chemical Equipment Visualizer</h1>
      <hr />
      
      {/* 1. CSV Upload Section */}
      <section style={{ marginBottom: '30px' }}>
        <h3>Upload Equipment CSV</h3>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} style={{ marginLeft: '10px' }}>Analyze Data</button>
      </section>

      {summary && (
        <div style={{ display: 'flex', gap: '40px' }}>
          {/* 2. Data Summary Statistics */}
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3>Latest Analysis Summary</h3>
            <p><strong>Total Equipment:</strong> {summary.total_count}</p>
            <p><strong>Avg Pressure:</strong> {summary.avg_pressure.toFixed(2)}</p>
            <p><strong>Avg Temp:</strong> {summary.avg_temperature.toFixed(2)}</p>
            <p><strong>Avg Flowrate:</strong> {summary.avg_flowrate.toFixed(2)}</p>
          </div>

          {/* 3. Visualization (Chart.js) */}
          <div style={{ flex: 1, height: '300px' }}>
            <h3>Equipment Type Distribution</h3>
            <Bar 
              data={{
                labels: Object.keys(summary.type_distribution),
                datasets: [{ 
                  label: 'Unit Count', 
                  data: Object.values(summary.type_distribution),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)'
                }]
              }} 
            />
          </div>
        </div>
      )}

      {/* 4. History Management */}
      <section style={{ marginTop: '40px' }}>
        <h3>Upload History (Last 5)</h3>
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th>Filename</th>
              <th>Date</th>
              <th>Total Units</th>
              <th>Avg Pressure</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={idx}>
                <td>{item.filename}</td>
                <td>{new Date(item.upload_date).toLocaleString()}</td>
                <td>{item.total_count}</td>
                <td>{item.avg_pressure.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;