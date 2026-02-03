import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from .models import EquipmentAnalysis
from .serializers import EquipmentAnalysisSerializer

class CSVUploadView(APIView):
    parser_classes = (MultiPartParser,)
    def post(self, request, format=None):
        file_obj = request.data.get('file')
        df = pd.read_csv(file_obj) 
        
        # 1. Calculate the Summary (Averages)
        results = {
            "filename": file_obj.name,
            "total_count": len(df),
            "avg_pressure": df['Pressure'].mean(),
            "avg_temperature": df['Temperature'].mean(),
            "avg_flowrate": df['Flowrate'].mean(),
            "type_distribution": "Standard Analysis" 
        }
        
        # 2. Save Summary to Database
        instance = EquipmentAnalysis.objects.create(**results)
        
        # 3. Prepare Response (Summary + Raw Data Preview)
        response_data = EquipmentAnalysisSerializer(instance).data
        # This line converts the top 10 rows to JSON so React can show them
        response_data['preview'] = df.head(10).to_dict(orient='records') 
        
        return Response(response_data)
class HistoryView(APIView):
    def get(self, request):
        history = EquipmentAnalysis.objects.all().order_by('-upload_date')[:5]
        return Response(EquipmentAnalysisSerializer(history, many=True).data)

class GeneratePDFReport(APIView):
    def get(self, request):
        latest = EquipmentAnalysis.objects.first()
        if not latest: return Response({"error": "No data"}, status=404)
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Report_{latest.id}.pdf"'
        p = canvas.Canvas(response, pagesize=letter) # ReportLab
        p.drawString(100, 750, f"Chemical Equipment Report: {latest.filename}")
        p.drawString(100, 730, f"Average Pressure: {latest.avg_pressure:.2f} bar")
        p.showPage()
        p.save()
        return response