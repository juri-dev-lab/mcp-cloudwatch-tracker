import { z } from 'zod';
import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

// 환경변수 스키마 정의
const envSchema = z.object({
  // AWS 설정
  AWS_REGION: z.string().default('ap-northeast-2'),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),

  // 애플리케이션 설정
  NODE_ENV: z.enum(['development', 'production']).default('production'),

  // 로그 설정
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CONTEXT_LINES: z.coerce.number().min(0).max(100).default(5),
  MAX_RESULTS: z.coerce.number().min(1).max(1000).default(100),
});

// 환경변수 검증 및 변환
const env = envSchema.parse(process.env);

export default env;
