# 빌드 스테이지
FROM node:18-alpine AS builder

WORKDIR /app

# GitHub Packages 인증 설정
ARG NODE_AUTH_TOKEN
RUN npm config set @juri-dev-lab:registry https://npm.pkg.github.com/
RUN npm config set //npm.pkg.github.com/:_authToken ${NODE_AUTH_TOKEN}

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 실행 스테이지
FROM node:18-alpine

WORKDIR /app

# 필요한 파일만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# 실행 권한 설정
RUN chmod +x ./dist/cli.js

ENTRYPOINT ["node", "./dist/cli.js"] 