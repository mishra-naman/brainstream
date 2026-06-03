from django.urls import path
from .views import TutorialListView, TutorialDetailView

urlpatterns = [
    path('', TutorialListView.as_view(), name='tutorial-list'),
    path('<slug:slug>/', TutorialDetailView.as_view(), name='tutorial-detail'),
]
