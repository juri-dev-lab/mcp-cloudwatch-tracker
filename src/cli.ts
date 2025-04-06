#!/usr/bin/env node

import { Command } from 'commander';
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { config } from 'dotenv';
import { CloudWatchLogServer } from './core/CloudWatchLogServer';
import { CloudWatchConfig, LogContext } from './types';
import env from './config/env';

// 환경 변수 로드
config();

const program = new Command();

// AWS 설정 가져오기
const getCloudWatchConfig = (): CloudWatchConfig => {
  const region = process.env.AWS_REGION || 'ap-northeast-2';
  const credentials =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined;

  return { region, credentials };
};

// CloudWatch 클라이언트 생성
const createCloudWatchClient = (config: CloudWatchConfig): CloudWatchLogsClient => {
  return new CloudWatchLogsClient({
    region: config.region,
    credentials: config.credentials,
  });
};

program
  .name('cloudwatch-log-tracker')
  .description('AWS CloudWatch 로그 분석 및 디버깅 도구')
  .version('1.0.0');

program
  .command('search')
  .description('로그 검색 및 분석')
  .requiredOption('-g, --log-group <name>', '로그 그룹 이름')
  .requiredOption('-s, --stream <name>', '로그 스트림 이름')
  .requiredOption('-t, --search-term <term>', '검색할 문자열')
  .option('-d, --days <number>', '검색할 일 수 (기본값: 7)', '7')
  .option('-c, --context-lines <number>', '전후 컨텍스트 라인 수 (기본값: 5)', '5')
  .option('--analyze-errors', '에러 분석 수행')
  .action(async options => {
    try {
      const config = getCloudWatchConfig();
      const client = createCloudWatchClient(config);
      const server = new CloudWatchLogServer({
        cloudWatchClient: client,
        contextLines: parseInt(options.contextLines),
      });

      const endTime = new Date();
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - parseInt(options.days));

      const result = await server.searchLogsWithContext({
        logGroupName: options.logGroup,
        logStreamName: options.stream,
        searchTerm: options.searchTerm,
        startTime,
        endTime,
        contextLines: parseInt(options.contextLines),
      });

      console.log('\n매칭된 로그:');
      result.forEach((match: LogContext, index: number) => {
        console.log(`\n[매치 ${index + 1}]`);
        console.log('이전 컨텍스트:');
        match.before.forEach((line: string) => console.log(`  ${line}`));
        console.log('매칭된 로그:');
        console.log(`  ${match.target}`);
        console.log('이후 컨텍스트:');
        match.after.forEach((line: string) => console.log(`  ${line}`));
      });
    } catch (error) {
      console.error('오류 발생:', error);
      process.exit(1);
    }
  });

program
  .command('recent')
  .description('최근 로그 조회')
  .requiredOption('-g, --log-group <name>', '로그 그룹 이름')
  .requiredOption('-s, --stream <name>', '로그 스트림 이름')
  .option('-l, --limit <number>', '조회할 로그 수 (기본값: 100)', '100')
  .action(async options => {
    try {
      const config = getCloudWatchConfig();
      const client = createCloudWatchClient(config);
      const server = new CloudWatchLogServer({
        cloudWatchClient: client,
        contextLines: env.CONTEXT_LINES,
      });

      const logs = await server.getRecentLogs(
        options.logGroup,
        options.stream,
        parseInt(options.limit),
      );

      console.log('최근 로그:');
      logs.forEach((log: string, index: number) => {
        console.log(`[${index + 1}] ${log}`);
      });
    } catch (error) {
      console.error('오류 발생:', error);
      process.exit(1);
    }
  });

program.parse();
