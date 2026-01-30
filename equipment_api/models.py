from django.db import models

class EquipmentAnalysis(models.Model):
    # Meta information
    filename = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    # Summary Statistics (As required by the Data Summary API)
    total_count = models.IntegerField()
    avg_pressure = models.FloatField()
    avg_temperature = models.FloatField()
    avg_flowrate = models.FloatField()
    
    # Store equipment type distribution as a JSON object
    # e.g., {"Pump": 12, "Valve": 8}
    type_distribution = models.JSONField()

    class Meta:
        # This ensures the 'History Management' fetches the latest first
        ordering = ['-upload_date']

    def __str__(self):
        return f"{self.filename} ({self.upload_date})"