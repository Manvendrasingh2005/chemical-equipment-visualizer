import sys, requests
from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QWidget
import matplotlib.pyplot as plt

class App(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Equipment Visualizer Desktop")
        btn = QPushButton("Download PDF Report", self)
        btn.clicked.connect(self.get_pdf)
        layout = QVBoxLayout()
        layout.addWidget(btn)
        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

    def get_pdf(self):
        # Call API with Basic Auth
        res = requests.get("http://127.0.0.1:8000/api/report/", auth=('your_user', 'your_password'))
        with open("desktop_report.pdf", "wb") as f:
            f.write(res.content)
        print("PDF Saved")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = App()
    window.show()
    sys.exit(app.exec_())