from rest_framework import serializers
from .models import EquipmentAnalysis

class EquipmentAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentAnalysis
        fields = '__all__'