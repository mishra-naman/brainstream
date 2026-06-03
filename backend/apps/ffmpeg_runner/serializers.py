from rest_framework import serializers
from .models import FFmpegJob


class FFmpegJobSerializer(serializers.ModelSerializer):
    output_files = serializers.SerializerMethodField()

    class Meta:
        model = FFmpegJob
        fields = ['id', 'command', 'status', 'output_log', 'exit_code',
                  'created_at', 'completed_at', 'output_files']
        read_only_fields = ['id', 'status', 'output_log', 'exit_code',
                            'created_at', 'completed_at', 'output_files']

    def get_output_files(self, obj):
        from pathlib import Path
        from django.conf import settings
        if not obj.output_dir:
            return []
        out_dir = Path(obj.output_dir)
        if not out_dir.exists():
            return []
        files = []
        for f in out_dir.iterdir():
            if f.is_file():
                rel = f.relative_to(settings.MEDIA_ROOT)
                files.append({
                    'name': f.name,
                    'url': f'/media/{rel.as_posix()}',
                    'size': f.stat().st_size,
                })
        return files


class FFmpegJobCreateSerializer(serializers.Serializer):
    command = serializers.CharField(max_length=2000)
    input_file = serializers.FileField(required=False, allow_null=True)
    sample_name = serializers.CharField(required=False, allow_blank=True)
