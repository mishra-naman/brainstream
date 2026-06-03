"""
FFmpeg sandbox executor.
Sanitizes commands and runs them in a jailed subprocess.
"""
import re
import shlex
import subprocess
import threading
from pathlib import Path
from django.conf import settings


# Flags that could escape the sandbox or cause damage
_BLOCKED_PATTERNS = [
    r'-f\s+lavfi',           # filter source inputs (can read files arbitrarily)
    r'https?://',            # block network URLs in args
    r'rtmp://',
    r'srt://',
    r'/etc/',
    r'/proc/',
    r'/sys/',
    r'\.\./',                # path traversal
    r'-protocol_whitelist',  # protocol override
    r'-allowed_extensions\s+ALL',
]

_BLOCKED_RE = re.compile('|'.join(_BLOCKED_PATTERNS), re.IGNORECASE)


def sanitize_command(raw_command: str, input_path: Path, output_dir: Path) -> list[str]:
    """
    Validate and rewrite an FFmpeg command so all paths are jailed to
    the job's input/output dirs.

    Raises ValueError if the command is rejected.
    Returns argv list ready for subprocess.
    """
    if _BLOCKED_RE.search(raw_command):
        raise ValueError('Command contains blocked pattern. Network URLs, path traversal, and certain sources are not allowed.')

    try:
        tokens = shlex.split(raw_command)
    except ValueError as e:
        raise ValueError(f'Could not parse command: {e}')

    if not tokens or tokens[0] not in ('ffmpeg', 'ffprobe'):
        raise ValueError('Command must start with ffmpeg or ffprobe.')

    # Replace -i <anything> with the actual input path
    # Replace any bare output filename (last positional arg) with output dir path
    rewritten = [tokens[0], '-y']  # -y to overwrite output within the jailed dir
    i = 1
    output_filename = None

    while i < len(tokens):
        tok = tokens[i]
        if tok == '-i':
            # Replace input with jailed path
            rewritten.extend(['-i', str(input_path)])
            i += 2
        elif tok.startswith('-'):
            rewritten.append(tok)
            i += 1
        else:
            # Positional (output filename) — rewrite to output_dir
            safe_name = Path(tok).name or 'output'
            # Strip any remaining path components
            safe_name = re.sub(r'[^a-zA-Z0-9._\-]', '_', safe_name)
            output_filename = safe_name
            rewritten.append(str(output_dir / safe_name))
            i += 1

    if output_filename is None:
        raise ValueError('No output filename detected in command.')

    return rewritten, output_filename


def run_ffmpeg(job, input_path: Path, output_dir: Path):
    """
    Execute a sanitized FFmpeg command for the given job.
    Updates job.output_log line-by-line and sends to channel layer.
    """
    from django.utils import timezone
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync

    channel_layer = get_channel_layer()
    group_name = f'job_{str(job.id).replace("-", "_")}'

    def send_line(line: str):
        job.output_log += line + '\n'
        job.save(update_fields=['output_log'])
        try:
            async_to_sync(channel_layer.group_send)(
                group_name,
                {'type': 'log.line', 'line': line},
            )
        except Exception:
            pass

    try:
        argv, _ = sanitize_command(job.command, input_path, output_dir)
    except ValueError as e:
        job.status = 'error'
        job.output_log = f'Sanitization error: {e}'
        job.completed_at = timezone.now()
        job.exit_code = -1
        job.save()
        try:
            async_to_sync(channel_layer.group_send)(
                group_name,
                {'type': 'job.done', 'status': 'error', 'exit_code': -1},
            )
        except Exception:
            pass
        return

    job.status = 'running'
    job.save(update_fields=['status'])

    timeout = getattr(settings, 'FFMPEG_JOB_TIMEOUT_SECONDS', 60)

    try:
        proc = subprocess.Popen(
            argv,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )

        timer = threading.Timer(timeout, proc.kill)
        timer.start()

        try:
            for line in proc.stdout:
                send_line(line.rstrip())
        finally:
            timer.cancel()

        proc.wait()
        exit_code = proc.returncode

    except FileNotFoundError:
        job.status = 'error'
        job.output_log += '\nffmpeg not found. Install ffmpeg and ensure it is on PATH.'
        job.exit_code = -1
        job.completed_at = timezone.now()
        job.save()
        async_to_sync(channel_layer.group_send)(
            group_name,
            {'type': 'job.done', 'status': 'error', 'exit_code': -1},
        )
        return

    job.status = 'done' if exit_code == 0 else 'error'
    job.exit_code = exit_code
    job.completed_at = timezone.now()
    job.save()

    try:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {'type': 'job.done', 'status': job.status, 'exit_code': exit_code},
        )
    except Exception:
        pass
