import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from .models import EquipmentAnalysis
from .serializers import EquipmentAnalysisSerializer

class CSVUploadView(APIView):
    # This allows the API to receive files via POST requests
    parser_classes = (MultiPartParser,)

    def post(self, request, format=None):
        file_obj = request.data.get('file')
        
        # 1. Use Pandas to read the uploaded CSV 
        df = pd.read_csv(file_obj)
        
        # 2. Perform Analysis (Calculate summary statistics) 
        analysis_results = {
            "filename": file_obj.name,
            "total_count": len(df),
            "avg_pressure": df['Pressure'].mean(),
            "avg_temperature": df['Temperature'].mean(),
            "avg_flowrate": df['Flowrate'].mean(),
            "type_distribution": df['Type'].value_counts().to_dict()
        }
        
        # 3. Save to SQLite for History Management (stores last 5) [cite: 11, 16]
        analysis_instance = EquipmentAnalysis.objects.create(**analysis_results)
        
        # 4. Return the summary to the frontend [cite: 8]
        return Response(EquipmentAnalysisSerializer(analysis_instance).data)

class HistoryView(APIView):
    def get(self, request):
        # Fetch the last 5 records as required by the task 
        last_five = EquipmentAnalysis.objects.all()[:5]
        serializer = EquipmentAnalysisSerializer(last_five, many=True)
        return Response(serializer.data)