import sys
import requests
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from PyQt5.QtWidgets import (QApplication, QMainWindow, QPushButton, QVBoxLayout, 
                             QHBoxLayout, QWidget, QFileDialog, QLabel, QTableWidget, QTableWidgetItem)

class DesktopVisualizer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Equipment Visualizer - Desktop")
        self.setGeometry(100, 100, 1000, 600)
        
        # Main Layout
        self.main_widget = QWidget()
        self.setCentralWidget(self.main_widget)
        self.layout = QHBoxLayout(self.main_widget)
        
        # Left Side: Controls and Summary
        self.left_panel = QVBoxLayout()
        self.upload_btn = QPushButton("Upload CSV")
        self.upload_btn.clicked.connect(self.upload_csv)
        self.status_label = QLabel("Select a file to begin analysis")
        
        self.stats_label = QLabel("Summary Statistics will appear here")
        self.left_panel.addWidget(self.upload_btn)
        self.left_panel.addWidget(self.status_label)
        self.left_panel.addWidget(self.stats_label)
        self.left_panel.addStretch()
        
        # Right Side: Visualization
        self.figure, self.ax = plt.subplots()
        self.canvas = FigureCanvas(self.figure)
        
        self.layout.addLayout(self.left_panel, 1)
        self.layout.addWidget(self.canvas, 2)

    def upload_csv(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Open CSV", "", "CSV Files (*.csv)")
        if file_path:
            self.status_label.setText(f"Uploading: {file_path.split('/')[-1]}")
            
            # Consume the Django API [cite: 9]
            try:
                with open(file_path, 'rb') as f:
                    response = requests.post("http://127.0.0.1:8000/api/upload/", files={'file': f})
                
                if response.status_code == 200:
                    data = response.json()
                    self.update_ui(data)
                else:
                    self.status_label.setText("Upload Failed: Server Error")
            except Exception as e:
                self.status_label.setText(f"Error: {str(e)}")

    def update_ui(self, data):
        # Update Text Summary [cite: 14]
        summary_text = (f"Total Units: {data['total_count']}\n"
                        f"Avg Pressure: {data['avg_pressure']:.2f}\n"
                        f"Avg Temp: {data['avg_temperature']:.2f}")
        self.stats_label.setText(summary_text)
        
        # Update Matplotlib Chart 
        self.ax.clear()
        types = list(data['type_distribution'].keys())
        counts = list(data['type_distribution'].values())
        self.ax.bar(types, counts, color='skyblue')
        self.ax.set_title("Equipment Type Distribution")
        self.canvas.draw()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DesktopVisualizer()
    window.show()
    sys.exit(app.exec_())