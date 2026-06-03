from channels.generic.websocket import AsyncWebsocketConsumer
import json


class FFmpegJobConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.job_id = self.scope['url_route']['kwargs']['job_id']
        self.group_name = f'job_{self.job_id.replace("-", "_")}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def log_line(self, event):
        await self.send(text_data=json.dumps({
            'type': 'log',
            'line': event['line'],
        }))

    async def job_done(self, event):
        await self.send(text_data=json.dumps({
            'type': 'done',
            'status': event['status'],
            'exit_code': event['exit_code'],
        }))
