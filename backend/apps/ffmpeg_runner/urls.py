from django.urls import path
from .views import JobListCreateView, JobDetailView, SampleListView

urlpatterns = [
    path('jobs/', JobListCreateView.as_view(), name='ffmpeg-job-list'),
    path('jobs/<uuid:pk>/', JobDetailView.as_view(), name='ffmpeg-job-detail'),
    path('samples/', SampleListView.as_view(), name='ffmpeg-samples'),
]
