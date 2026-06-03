export interface CheatEntry {
  id: string;
  title: string;
  command: string;
  description: string;
  category: 'transcoding' | 'hls' | 'dash' | 'filters' | 'codec' | 'audio' | 'inspect';
  tags: string[];
}

export const CHEAT_ENTRIES: CheatEntry[] = [
  // Inspect
  {
    id: 'probe-info',
    category: 'inspect',
    title: 'Probe file info',
    command: 'ffprobe -v quiet -print_format json -show_format -show_streams input.mp4',
    description: 'Print full format + stream metadata as JSON.',
    tags: ['ffprobe', 'metadata', 'info'],
  },
  {
    id: 'probe-duration',
    category: 'inspect',
    title: 'Get duration',
    command: 'ffprobe -v error -show_entries format=duration -of csv=p=0 input.mp4',
    description: 'Print duration in seconds only.',
    tags: ['ffprobe', 'duration'],
  },
  // Transcoding
  {
    id: 'copy-streams',
    category: 'transcoding',
    title: 'Remux without re-encoding',
    command: 'ffmpeg -i input.mkv -c copy output.mp4',
    description: 'Copy all streams into a new container. No quality loss, very fast.',
    tags: ['remux', 'copy', 'fast'],
  },
  {
    id: 'extract-clip',
    category: 'transcoding',
    title: 'Extract clip by time',
    command: 'ffmpeg -ss 00:01:00 -to 00:02:30 -i input.mp4 -c copy clip.mp4',
    description: 'Cut a 90-second clip starting at 1 minute. Place -ss before -i for fast seek.',
    tags: ['trim', 'cut', 'clip'],
  },
  {
    id: 'h264-crf',
    category: 'transcoding',
    title: 'H.264 CRF encode',
    command: 'ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4',
    description: 'Quality-based H.264. Lower CRF = better quality. Range: 0–51, default 23.',
    tags: ['h264', 'libx264', 'crf', 'quality'],
  },
  {
    id: 'h265-crf',
    category: 'codec',
    title: 'H.265/HEVC encode',
    command: 'ffmpeg -i input.mp4 -c:v libx265 -crf 28 -preset medium -c:a aac -b:a 128k output.mp4',
    description: 'H.265 at CRF 28 ≈ H.264 at CRF 23 visually, ~40% smaller file.',
    tags: ['h265', 'hevc', 'libx265'],
  },
  {
    id: 'av1-encode',
    category: 'codec',
    title: 'AV1 encode (libaom)',
    command: 'ffmpeg -i input.mp4 -c:v libaom-av1 -crf 30 -b:v 0 -c:a libopus output.mp4',
    description: 'Royalty-free AV1. Smallest files. Very slow — use SVT-AV1 for production.',
    tags: ['av1', 'libaom', 'royalty-free'],
  },
  {
    id: 'vp9-encode',
    category: 'codec',
    title: 'VP9 encode',
    command: 'ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus output.webm',
    description: 'Google\'s royalty-free codec. Good browser support. WebM container.',
    tags: ['vp9', 'webm', 'google'],
  },
  // HLS
  {
    id: 'hls-basic',
    category: 'hls',
    title: 'Basic HLS segmentation',
    command: 'ffmpeg -i input.mp4 -c:v libx264 -c:a aac -hls_time 6 -hls_list_size 0 -hls_segment_filename seg_%03d.ts playlist.m3u8',
    description: 'Segment into 6-second .ts chunks with a VOD playlist.',
    tags: ['hls', 'segment', 'm3u8', 'vod'],
  },
  {
    id: 'hls-fmp4',
    category: 'hls',
    title: 'HLS with fMP4 segments',
    command: 'ffmpeg -i input.mp4 -c:v libx264 -c:a aac -hls_time 6 -hls_segment_type fmp4 -hls_fmp4_init_filename init.mp4 -hls_segment_filename seg_%03d.m4s playlist.m3u8',
    description: 'Modern HLS uses fragmented MP4 (CMAF). Smaller init segment, better DASH compatibility.',
    tags: ['hls', 'fmp4', 'cmaf', 'low-latency'],
  },
  {
    id: 'hls-abr-720p',
    category: 'hls',
    title: 'ABR 720p rendition',
    command: 'ffmpeg -i input.mp4 -c:v libx264 -b:v 2500k -maxrate 2500k -bufsize 5000k -vf scale=-2:720 -c:a aac -b:a 128k -hls_time 6 -hls_list_size 0 -hls_segment_filename 720p_%03d.ts 720p.m3u8',
    description: '720p tier for an ABR ladder at 2.5 Mbps.',
    tags: ['hls', 'abr', '720p', 'ladder'],
  },
  // DASH
  {
    id: 'dash-basic',
    category: 'dash',
    title: 'Basic MPEG-DASH output',
    command: 'ffmpeg -i input.mp4 -c:v libx264 -c:a aac -f dash -seg_duration 6 -init_seg_name init_$RepresentationID$.mp4 -media_seg_name seg_$RepresentationID$_$Number%05d$.m4s manifest.mpd',
    description: 'Create a DASH manifest + fragmented MP4 segments.',
    tags: ['dash', 'mpd', 'fmp4', 'mpeg-dash'],
  },
  // Filters
  {
    id: 'scale',
    category: 'filters',
    title: 'Scale (keep aspect ratio)',
    command: 'ffmpeg -i input.mp4 -vf scale=-2:720 output.mp4',
    description: 'Scale to 720px height; width auto-calculated and rounded to even number.',
    tags: ['scale', 'resize', 'filter'],
  },
  {
    id: 'crop',
    category: 'filters',
    title: 'Crop to 16:9',
    command: 'ffmpeg -i input.mp4 -vf "crop=iw:iw*9/16" output.mp4',
    description: 'Center-crop to 16:9 from source width.',
    tags: ['crop', 'filter', '16:9'],
  },
  {
    id: 'drawtext',
    category: 'filters',
    title: 'Burn timecode',
    command: 'ffmpeg -i input.mp4 -vf "drawtext=fontsize=36:fontcolor=white:box=1:boxcolor=black@0.5:x=10:y=10:text=\'%{pts\\:hms}\'" output.mp4',
    description: 'Overlay PTS timecode (HH:MM:SS) for QC review.',
    tags: ['drawtext', 'timecode', 'watermark', 'qc'],
  },
  {
    id: 'thumbnail',
    category: 'filters',
    title: 'Extract thumbnail',
    command: 'ffmpeg -i input.mp4 -ss 00:00:05 -vframes 1 thumb.jpg',
    description: 'Grab a single frame at 5 seconds as JPEG.',
    tags: ['thumbnail', 'frame', 'jpeg'],
  },
  // Audio
  {
    id: 'audio-loudnorm',
    category: 'audio',
    title: 'EBU R128 loudness normalization',
    command: 'ffmpeg -i input.mp4 -af loudnorm=I=-23:TP=-1.5:LRA=11 -c:v copy output.mp4',
    description: 'Normalize audio to -23 LUFS integrated (broadcast standard).',
    tags: ['loudnorm', 'audio', 'ebu-r128', 'lufs'],
  },
  {
    id: 'extract-audio',
    category: 'audio',
    title: 'Extract audio only',
    command: 'ffmpeg -i input.mp4 -vn -c:a aac -b:a 192k audio.aac',
    description: 'Strip video, export AAC audio at 192 kbps.',
    tags: ['audio', 'extract', 'aac'],
  },
  {
    id: 'stereo-to-51',
    category: 'audio',
    title: 'Upmix stereo to 5.1',
    command: 'ffmpeg -i input.mp4 -af "pan=5.1|FL=FL|FR=FR|FC=0.5*FL+0.5*FR|LFE=0.5*FL+0.5*FR|BL=0.5*FL|BR=0.5*FR" output.mp4',
    description: 'Upmix 2ch to 5.1 using pan filter. Useful for OTT deliverables requiring 5.1.',
    tags: ['audio', '5.1', 'upmix', 'pan'],
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'inspect', label: 'Inspect' },
  { id: 'transcoding', label: 'Transcoding' },
  { id: 'codec', label: 'Codecs' },
  { id: 'hls', label: 'HLS' },
  { id: 'dash', label: 'DASH' },
  { id: 'filters', label: 'Filters' },
  { id: 'audio', label: 'Audio' },
] as const;
