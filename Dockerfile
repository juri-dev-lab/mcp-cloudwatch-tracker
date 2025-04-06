# 빌드 스테이지
FROM node:18-alpine AS builder

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# GitHub Packages 인증 설정 및 의존성 설치
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    export NODE_AUTH_TOKEN=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    echo "@Juri-Dev-Lab:registry=https://npm.pkg.github.com/" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}" >> .npmrc && \
    npm ci && \
    rm -f .npmrc

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
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    export NODE_AUTH_TOKEN=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    echo "@Juri-Dev-Lab:registry=https://npm.pkg.github.com/" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}" >> .npmrc && \
    npm ci --only=production && \
    rm -f .npmrc && \
    npm cache clean --force

# 실행 권한 설정
RUN chmod +x ./dist/cli.js

ENTRYPOINT ["node", "./dist/cli.js"]