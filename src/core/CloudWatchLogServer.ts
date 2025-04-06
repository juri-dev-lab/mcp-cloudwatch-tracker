import { CloudWatchService } from '../services/CloudWatchService';
import { MCPServerConfig, SearchOptions, LogContext } from '../types';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

interface SearchLogsParams {
  logGroupName: string;
  logStreamName: string;
  searchTerm: string;
  startTime: string;
  endTime: string;
  contextLines?: number;
}

interface GetRecentLogsParams {
  logGroupName: string;
  logStreamName: string;
  limit?: number;
}

export class CloudWatchLogServer {
  private cloudWatchService: CloudWatchService;
  private mcpServer: McpServer;

  constructor(config: MCPServerConfig) {
    this.cloudWatchService = new CloudWatchService(config.cloudWatchClient, config.contextLines);

    this.mcpServer = new McpServer({
      name: 'cloudwatch-log-tracker',
      version: '1.0.0',
      transport: new StdioServerTransport(),
    });

    this.registerTools();
  }

  /**
   * MCP 도구들을 등록합니다.
   */
  private registerTools(): void {
    // 로그 검색 도구
    this.mcpServer.tool(
      'searchLogs',
      '특정 시간 범위 내에서 CloudWatch 로그를 검색합니다.',
      {
        logGroupName: z.string().describe('로그 그룹 이름'),
        logStreamName: z.string().describe('로그 스트림 이름'),
        searchTerm: z.string().describe('검색할 문자열'),
        startTime: z.string().describe('검색 시작 시간 (ISO 문자열)'),
        endTime: z.string().describe('검색 종료 시간 (ISO 문자열)'),
        contextLines: z.number().optional().describe('전후 컨텍스트 라인 수'),
      },
      async (params: SearchLogsParams) => {
        const options: SearchOptions = {
          logGroupName: params.logGroupName,
          logStreamName: params.logStreamName,
          searchTerm: params.searchTerm,
          startTime: new Date(params.startTime),
          endTime: new Date(params.endTime),
          contextLines: params.contextLines,
        };

        const results = await this.cloudWatchService.searchLogsWithContext(options);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      },
    );

    // 최근 로그 조회 도구
    this.mcpServer.tool(
      'getRecentLogs',
      'CloudWatch 로그 그룹의 최근 로그를 조회합니다.',
      {
        logGroupName: z.string().describe('로그 그룹 이름'),
        logStreamName: z.string().describe('로그 스트림 이름'),
        limit: z.number().optional().describe('조회할 로그 수'),
      },
      async (params: GetRecentLogsParams) => {
        const results = await this.cloudWatchService.getRecentLogs(
          params.logGroupName,
          params.logStreamName,
          params.limit,
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      },
    );
  }

  /**
   * 로그를 검색하고 컨텍스트와 함께 반환합니다.
   */
  public async searchLogsWithContext(options: SearchOptions): Promise<LogContext[]> {
    return await this.cloudWatchService.searchLogsWithContext(options);
  }

  /**
   * 로그 그룹의 최근 로그를 가져옵니다.
   */
  public async getRecentLogs(
    logGroupName: string,
    logStreamName: string,
    limit?: number,
  ): Promise<string[]> {
    return await this.cloudWatchService.getRecentLogs(logGroupName, logStreamName, limit);
  }

  /**
   * 서버를 시작합니다.
   */
  public async start(): Promise<void> {
    await this.mcpServer.connect(new StdioServerTransport());
    console.log('CloudWatch Log Server started');
  }
}
