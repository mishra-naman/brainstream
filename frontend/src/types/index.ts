export interface OutputFile {
  name: string;
  url: string;
  size: number;
}

export interface FFmpegJob {
  id: string;
  command: string;
  status: 'pending' | 'running' | 'done' | 'error';
  output_log: string;
  exit_code: number | null;
  created_at: string;
  completed_at: string | null;
  output_files: OutputFile[];
}

export interface TutorialSummary {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  icon: string;
  step_count: number;
}

export interface TutorialStep {
  order: number;
  title: string;
  explanation: string;
  command: string;
  command_description: string;
  expected_output_hint: string;
}

export interface Tutorial extends TutorialSummary {
  steps: TutorialStep[];
}

export interface Sample {
  name: string;
  url: string;
  size: number;
}
