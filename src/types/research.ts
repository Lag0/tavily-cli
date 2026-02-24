export type ResearchModel = 'mini' | 'pro' | 'auto';

export interface ResearchOptions {
  input: string;
  apiKey?: string;
  apiUrl?: string;
  model?: ResearchModel;
  citationFormat?: string;
  timeout?: number;
  stream?: boolean;
  outputSchema?: Record<string, unknown>;
  json?: boolean;
  pretty?: boolean;
  output?: string;
}

export interface ResearchStatusOptions {
  requestId: string;
  apiKey?: string;
  apiUrl?: string;
  json?: boolean;
  pretty?: boolean;
  output?: string;
}
