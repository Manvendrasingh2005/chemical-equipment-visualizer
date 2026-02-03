from django.urls import path
from .views import CSVUploadView, HistoryView, GeneratePDFReport

urlpatterns = [
    path('upload/', CSVUploadView.as_view(), name='upload'),
    path('history/', HistoryView.as_view(), name='history'),
    path('report/', GeneratePDFReport.as_view(), name='report'),
]