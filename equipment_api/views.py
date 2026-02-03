import os
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.http import HttpResponse
from django.conf import settings

# --- REPORTLAB IMPORTS (For Professional PDFs) ---
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# --- YOUR APP IMPORTS ---
from .models import EquipmentAnalysis
from .serializers import EquipmentAnalysisSerializer

class CSVUploadView(APIView):
    parser_classes = (MultiPartParser,)

    def post(self, request, format=None):
        file_obj = request.data.get('file')
        
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=400)

        try:
            # 1. Read CSV into Pandas to calculate stats
            df = pd.read_csv(file_obj)
            
            # 2. Calculate Averages
            results = {
                "filename": file_obj.name,
                "total_count": len(df),
                "avg_pressure": df['Pressure'].mean(),
                "avg_temperature": df['Temperature'].mean(),
                "avg_flowrate": df['Flowrate'].mean(),
                "type_distribution": "Standard Analysis"
            }

            # 3. CRITICAL STEP: Reset file pointer before saving to DB
            # (Pandas moved the pointer to the end; we need to reset it to 0 to save the file)
            file_obj.seek(0)

            # 4. Save to Database (Including the actual file!)
            instance = EquipmentAnalysis.objects.create(file=file_obj, **results)

            # 5. Prepare Response for React
            response_data = EquipmentAnalysisSerializer(instance).data
            # Convert top 10 rows to JSON for the "Detailed Inspection" table in React
            response_data['preview'] = df.head(10).to_dict(orient='records')

            return Response(response_data)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class HistoryView(APIView):
    def get(self, request):
        # Fetch last 5 records, newest first
        history = EquipmentAnalysis.objects.all().order_by('-upload_date')[:5]
        return Response(EquipmentAnalysisSerializer(history, many=True).data)


class GeneratePDFReport(APIView):
    def get(self, request):
        # 1. Get the latest analysis
        latest = EquipmentAnalysis.objects.order_by('-upload_date').first()
        
        if not latest:
            return Response({"error": "No data available"}, status=404)

        # 2. Setup PDF Response
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Report_{latest.id}.pdf"'

        # 3. Create Document
        doc = SimpleDocTemplate(response, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # --- TITLE SECTION ---
        elements.append(Paragraph("Chemical Equipment Analysis Report", styles['Title']))
        elements.append(Spacer(1, 12))
        
        fname = getattr(latest, 'filename', 'Unknown File')
        date_str = latest.upload_date.strftime('%Y-%m-%d %H:%M') if latest.upload_date else "N/A"
        elements.append(Paragraph(f"<b>Filename:</b> {fname} <br/><b>Processed Date:</b> {date_str}", styles['Normal']))
        elements.append(Spacer(1, 24))

        # --- SECTION 1: METRICS SUMMARY TABLE ---
        elements.append(Paragraph("1. Executive Summary", styles['Heading2']))

        summary_data = [
            ["Metric", "Value", "Status"],
            ["Avg Pressure", f"{latest.avg_pressure:.2f} bar", "Normal"],
            ["Avg Temperature", f"{latest.avg_temperature:.2f} °C", "HIGH" if latest.avg_temperature > 100 else "Normal"],
            ["Avg Flow Rate", f"{latest.avg_flowrate:.2f} m³/h", "Normal"],
        ]

        t = Table(summary_data, colWidths=[150, 150, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 24))

        # --- SECTION 2: DETAILED DATA TABLE ---
        elements.append(Paragraph("2. Detailed Sensor Logs (Top 20 Rows)", styles['Heading2']))
        
        if latest.file:
            try:
                file_path = latest.file.path
                if os.path.exists(file_path):
                    # Read the saved CSV to get the rows
                    df = pd.read_csv(file_path)
                    
                    # Convert headers and top 20 rows to a list of lists
                    data_list = [df.columns.tolist()] + df.head(20).astype(str).values.tolist()
                    
                    data_table = Table(data_list)
                    data_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTSIZE', (0, 0), (-1, -1), 8),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ]))
                    elements.append(data_table)
                else:
                    elements.append(Paragraph("<i>Source file not found on server.</i>", styles['Normal']))
            except Exception as e:
                elements.append(Paragraph(f"<i>Error reading CSV: {str(e)}</i>", styles['Normal']))
        else:
            elements.append(Paragraph("<i>Original CSV file was not saved. Only summary metrics are available.</i>", styles['Normal']))

        # 4. Build PDF
        doc.build(elements)
        return response