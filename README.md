# CloudWatch Log Tracker

AWS CloudWatch 로그를 분석하고 디버깅하기 위한 MCP(Model Context Protocol) 서버입니다.

## 주요 기능

- CloudWatch 로그 그룹에서 특정 문자열 검색
- 로그의 전후 컨텍스트 조회
- 로그 분석 결과 요약
- 에러 로그 분석 및 원인 파악

## 설치 및 실행 방법

### NPX를 통한 실행

1. 직접 실행

```bash
npx -y @juri-dev-lab/mcp-cloudwatch-tracker@latest \
  --aws-access-key-id YOUR_AWS_ACCESS_KEY \
  --aws-secret-access-key YOUR_AWS_SECRET_KEY \
  --aws-region YOUR_AWS_REGION
```

2. MCP 설정 파일 사용 (mcp.json)

```json
{
  "mcpServers": {
    "cloudwatch-log-tracker": {
      "command": "npx",
      "args": [
        "-y",
        "@juri-dev-lab/mcp-cloudwatch-tracker@latest",
        "run",
        "--aws-access-key-id",
        "YOUR_AWS_ACCESS_KEY",
        "--aws-secret-access-key",
        "YOUR_AWS_SECRET_KEY",
        "--aws-region",
        "YOUR_AWS_REGION"
      ]
    }
  }
}
```

### Docker를 통한 실행

1. Docker 직접 실행

```bash
docker run --rm -i \
  -e AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY \
  -e AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY \
  -e AWS_REGION=YOUR_AWS_REGION \
  juri-dev-lab/mcp-cloudwatch-tracker
```

2. MCP 설정 파일 사용 (mcp.json)

```json
{
  "mcpServers": {
    "cloudwatch-log-tracker": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY",
        "-e",
        "AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY",
        "-e",
        "AWS_REGION=YOUR_AWS_REGION",
        "juri-dev-lab/mcp-cloudwatch-tracker"
      ]
    }
  }
}
```

3. 환경 변수 파일 사용

```bash
# .env 파일 생성
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_REGION=YOUR_AWS_REGION

# Docker 실행 (환경 변수 파일 사용)
docker run --rm -i --env-file .env juri-dev-lab/mcp-cloudwatch-tracker
```

## AWS 자격 증명 설정

다음 방법 중 하나를 선택하여 AWS 자격 증명을 설정하세요:

1. .env 파일 사용 (개발 환경 권장)

```plaintext
# 프로젝트 루트에 .env 파일 생성
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-northeast-2
```

2. 시스템 환경 변수 사용

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=ap-northeast-2
```

3. AWS CLI 자격 증명 사용

```bash
aws configure
```

⚠️ 보안 주의사항:

- .env 파일을 사용할 경우 반드시 .gitignore에 추가하세요
- AWS 자격 증명을 절대 소스 코드나 버전 관리에 포함하지 마세요
- 각자 자신의 AWS 계정 자격 증명을 사용해야 합니다
- 프로덕션 환경에서는 AWS IAM 역할 사용을 권장합니다

## 권장 IAM 정책

CloudWatch 로그 접근을 위한 최소 권한 IAM 정책:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:GetLogEvents",
        "logs:FilterLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## 사용 예시

### 로그 검색

```bash
# 기본 검색
cloudwatch-log-tracker search -g your-log-group -s your-stream -t "search-term"

# 상세 옵션 사용
cloudwatch-log-tracker search \
  -g your-log-group \
  -s your-stream \
  -t "search-term" \
  -d 7 \  # 검색할 일 수
  -c 5 \  # 전후 컨텍스트 라인 수
  --analyze-errors  # 에러 분석 수행
```

### 최근 로그 조회

```bash
# 기본 조회
cloudwatch-log-tracker recent -g your-log-group -s your-stream

# 조회 개수 지정
cloudwatch-log-tracker recent -g your-log-group -s your-stream -l 50
```

## 개발 환경 설정

1. 저장소 클론

```bash
git clone https://github.com/juri-dev-lab/mcp-cloudwatch-tracker.git
cd mcp-cloudwatch-tracker
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

## 라이선스

MIT
