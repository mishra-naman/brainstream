from rest_framework import serializers
from .models import Tutorial, Step


class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = ['order', 'title', 'explanation', 'command',
                  'command_description', 'expected_output_hint']


class TutorialListSerializer(serializers.ModelSerializer):
    step_count = serializers.IntegerField(source='steps.count', read_only=True)

    class Meta:
        model = Tutorial
        fields = ['slug', 'title', 'description', 'category', 'order', 'icon', 'step_count']


class TutorialDetailSerializer(serializers.ModelSerializer):
    steps = StepSerializer(many=True, read_only=True)

    class Meta:
        model = Tutorial
        fields = ['slug', 'title', 'description', 'category', 'order', 'icon', 'steps']
