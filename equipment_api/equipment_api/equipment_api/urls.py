from django.urls import path
from .views import CSVUploadView, HistoryView

urlpatterns = [
    path('upload/', CSVUploadView.as_view(), name='csv-upload'), # [cite: 13]
    path('history/', HistoryView.as_view(), name='history'), # 
]