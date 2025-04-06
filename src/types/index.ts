import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';

export interface LogContext {
  before: string[];
  target: string;
  after: string[];
}

export interface LogAnalysisResult {
  logGroupName: string;
  searchTerm: string;
  timeRange: {
    startTime: Date;
    endTime: Date;
  };
  matches: LogContext[];
  summary?: string;
  errorAnalysis?: string;
}

export interface CloudWatchConfig {
  region: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface MCPServerConfig {
  cloudWatchClient: CloudWatchLogsClient;
  contextLines: number;
}

export interface SearchOptions {
  logGroupName: string;
  logStreamName: string;
  searchTerm: string;
  startTime: Date;
  endTime: Date;
  contextLines?: number;
}
