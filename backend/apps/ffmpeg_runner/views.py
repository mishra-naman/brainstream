import os
import shutil
import threading
from pathlib import Path

from django.conf import settings
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FFmpegJob
from .serializers import FFmpegJobSerializer, FFmpegJobCreateSerializer
from .executor import run_ffmpeg, sanitize_command


MAX_UPLOAD_BYTES = getattr(settings, 'FFMPEG_MAX_UPLOAD_MB', 50) * 1024 * 1024


class JobListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    throttle_scope = 'anon'

    def post(self, request):
        ser = FFmpegJobCreateSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        command = ser.validated_data['command']
        uploaded = ser.validated_data.get('input_file')
        sample_name = ser.validated_data.get('sample_name', '')

        # Validate command early before saving anything
        media_root = Path(settings.MEDIA_ROOT)
        dummy_input = media_root / 'input' / 'dummy.mp4'
        dummy_output = media_root / 'output' / 'dummy'
        try:
            sanitize_command(command, dummy_input, dummy_output)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        job = FFmpegJob.objects.create(command=command)
        job_input_dir = media_root / 'input' / str(job.id)
        job_output_dir = media_root / 'output' / str(job.id)
        job_input_dir.mkdir(parents=True, exist_ok=True)
        job_output_dir.mkdir(parents=True, exist_ok=True)

        if uploaded:
            if uploaded.size > MAX_UPLOAD_BYTES:
                job.delete()
                return Response(
                    {'error': f'File too large. Max {settings.FFMPEG_MAX_UPLOAD_MB}MB.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            input_path = job_input_dir / uploaded.name
            with open(input_path, 'wb') as f:
                for chunk in uploaded.chunks():
                    f.write(chunk)
        elif sample_name:
            sample_path = media_root / 'samples' / sample_name
            if not sample_path.exists():
                job.delete()
                return Response({'error': 'Sample not found.'}, status=status.HTTP_400_BAD_REQUEST)
            input_path = job_input_dir / sample_path.name
            shutil.copy(sample_path, input_path)
        else:
            job.delete()
            return Response({'error': 'Provide input_file or sample_name.'}, status=status.HTTP_400_BAD_REQUEST)

        job.input_filename = input_path.name
        job.output_dir = str(job_output_dir)
        job.save(update_fields=['input_filename', 'output_dir'])

        # Run in background thread
        t = threading.Thread(
            target=run_ffmpeg,
            args=(job, input_path, job_output_dir),
            daemon=True,
        )
        t.start()

        return Response(FFmpegJobSerializer(job).data, status=status.HTTP_201_CREATED)


class JobDetailView(APIView):
    def get(self, request, pk):
        try:
            job = FFmpegJob.objects.get(pk=pk)
        except FFmpegJob.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(FFmpegJobSerializer(job).data)


class SampleListView(APIView):
    def get(self, request):
        samples_dir = Path(settings.MEDIA_ROOT) / 'samples'
        if not samples_dir.exists():
            return Response([])
        files = [
            {'name': f.name, 'url': f'/media/samples/{f.name}', 'size': f.stat().st_size}
            for f in samples_dir.iterdir() if f.is_file()
        ]
        return Response(files)
