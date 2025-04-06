# 빌드 스테이지
FROM node:18-alpine AS builder

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 인증 설정 및 의존성 설치 (디버깅 출력 추가)
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc \
    echo "Installing dependencies..." && \
    echo "Contents of .npmrc:" && \
    cat /app/.npmrc && \
    echo "Running npm ci..." && \
    npm ci --verbose

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 실행 스테이지
FROM node:18-alpine

WORKDIR /app

# 필요한 파일만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 프로덕션 의존성만 설치
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc \
    echo "Installing production dependencies..." && \
    npm ci --only=production --verbose && \
    npm cache clean --force

# 실행 권한 설정
RUN chmod +x ./dist/cli.js

ENTRYPOINT ["node", "./dist/cli.js"]