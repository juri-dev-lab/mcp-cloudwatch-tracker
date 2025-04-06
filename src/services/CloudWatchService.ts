import {
  CloudWatchLogsClient,
  GetLogEventsCommand,
  FilterLogEventsCommand,
  OutputLogEvent,
  GetLogEventsRequest,
  FilterLogEventsRequest,
} from '@aws-sdk/client-cloudwatch-logs';
import { LogContext, SearchOptions, LogAnalysisResult } from '../types';
import env from '../config/env';

export class CloudWatchService {
  private client: CloudWatchLogsClient;
  private contextLines: number;

  constructor(client: CloudWatchLogsClient, contextLines?: number) {
    this.client = client;
    this.contextLines = contextLines || env.CONTEXT_LINES;
  }

  /**
   * 로그의 전후 컨텍스트를 가져옵니다.
   */
  async getLogContext(
    logGroupName: string,
    logStreamName: string,
    targetEvent: OutputLogEvent,
  ): Promise<LogContext> {
    const contextLines = this.contextLines;

    const beforeCommand = new GetLogEventsCommand({
      logGroupName,
      logStreamName,
      startTime: (targetEvent.timestamp || 0) - contextLines * 1000,
      endTime: targetEvent.timestamp,
      limit: contextLines,
    });

    const afterCommand = new GetLogEventsCommand({
      logGroupName,
      logStreamName,
      startTime: (targetEvent.timestamp || 0) + 1,
      endTime: (targetEvent.timestamp || 0) + contextLines * 1000,
      limit: contextLines,
    });

    const [beforeEvents, afterEvents] = await Promise.all([
      this.client.send(beforeCommand),
      this.client.send(afterCommand),
    ]);

    return {
      before: (beforeEvents.events || [])
        .map(event => event.message || '')
        .filter(msg => msg !== ''),
      target: targetEvent.message || '',
      after: (afterEvents.events || []).map(event => event.message || '').filter(msg => msg !== ''),
    };
  }

  /**
   * 로그 그룹의 최근 로그를 가져옵니다.
   */
  async getRecentLogs(
    logGroupName: string,
    logStreamName: string,
    limit?: number,
  ): Promise<string[]> {
    const command = new GetLogEventsCommand({
      logGroupName,
      logStreamName,
      limit: Math.min(limit || env.MAX_RESULTS, env.MAX_RESULTS),
      startFromHead: false,
    });

    const response = await this.client.send(command);
    return (response.events || []).map(event => event.message || '').filter(msg => msg !== '');
  }

  /**
   * 로그를 검색하고 컨텍스트와 함께 반환합니다.
   */
  async searchLogsWithContext(options: SearchOptions): Promise<LogContext[]> {
    const {
      logGroupName,
      logStreamName,
      searchTerm,
      startTime,
      endTime,
      contextLines = this.contextLines,
    } = options;

    const command = new GetLogEventsCommand({
      logGroupName,
      logStreamName,
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      limit: env.MAX_RESULTS,
    });

    const response = await this.client.send(command);
    const matches: LogContext[] = [];

    if (response.events) {
      const filteredEvents = {
        events: response.events.filter(
          event => event.message && event.message.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      };

      if (filteredEvents.events && filteredEvents.events.length > 0) {
        for (const event of filteredEvents.events) {
          const context = await this.getLogContext(logGroupName, logStreamName, event);
          matches.push(context);
        }
      }
    }

    return matches;
  }
}
