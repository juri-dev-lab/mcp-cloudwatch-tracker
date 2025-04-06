# CloudWatch Log Tracker

AWS CloudWatch 로그를 분석하고 디버깅하기 위한 MCP(Model Context Protocol) 서버입니다.

## 주요 기능

- CloudWatch 로그 그룹에서 특정 문자열 검색
- 로그의 전후 컨텍스트 조회
- 로그 분석 결과 요약
- 에러 로그 분석 및 원인 파악

## 설치 방법

### NPM을 통한 설치

```bash
npx cloudwatch-log-tracker@latest
```

### Docker를 통한 실행

```bash
docker pull your-registry/cloudwatch-log-tracker:latest
docker run -e AWS_ACCESS_KEY_ID=your_key -e AWS_SECRET_ACCESS_KEY=your_secret your-registry/cloudwatch-log-tracker:latest
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## 사용 방법

### 로그 검색

```bash
# 기본 검색
cloudwatch-log-tracker search -g your-log-group -s "search-term"

# 상세 옵션 사용
cloudwatch-log-tracker search \
  -g your-log-group \
  -s "search-term" \
  -d 7 \  # 검색할 일 수
  -c 5 \  # 전후 컨텍스트 라인 수
  --analyze-errors  # 에러 분석 수행
```

### 최근 로그 조회

```bash
# 기본 조회
cloudwatch-log-tracker recent -g your-log-group

# 조회 개수 지정
cloudwatch-log-tracker recent -g your-log-group -l 50
```

## 개발 환경 설정

1. 저장소 클론

```bash
git clone https://github.com/your-username/cloudwatch-log-tracker.git
cd cloudwatch-log-tracker
```

2. 의존성 설치

```bash
npm install
```

3. 개발 서버 실행

```bash
npm run dev
```

4. 빌드

```bash
npm run build
```

## 테스트

```bash
# 단위 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch
```

## CI/CD 파이프라인

- GitHub Actions를 통한 자동화된 빌드 및 테스트
- develop 브랜치: 개발 버전 배포
- main 브랜치: 프로덕션 버전 배포
- GitHub Packages와 Amazon ECR에 자동 배포

## 라이선스

MIT
