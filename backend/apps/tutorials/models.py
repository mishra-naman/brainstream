from django.db import models


class Tutorial(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50)  # hls, dash, codec, ffmpeg, live
    order = models.PositiveIntegerField(default=0)
    icon = models.CharField(max_length=50, default='play')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class Step(models.Model):
    tutorial = models.ForeignKey(Tutorial, on_delete=models.CASCADE, related_name='steps')
    order = models.PositiveIntegerField(default=0)
    title = models.CharField(max_length=200)
    explanation = models.TextField()
    command = models.TextField(blank=True, default='')
    command_description = models.TextField(blank=True, default='')
    expected_output_hint = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.tutorial.slug} / step {self.order}'
