from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import Tutorial
from .serializers import TutorialListSerializer, TutorialDetailSerializer


class TutorialListView(APIView):
    def get(self, request):
        tutorials = Tutorial.objects.all()
        return Response(TutorialListSerializer(tutorials, many=True).data)


class TutorialDetailView(APIView):
    def get(self, request, slug):
        try:
            tutorial = Tutorial.objects.prefetch_related('steps').get(slug=slug)
        except Tutorial.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TutorialDetailSerializer(tutorial).data)
