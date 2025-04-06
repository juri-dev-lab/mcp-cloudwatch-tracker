# CloudWatch Log Tracker MCP 서버 가이드

CloudWatch Log Tracker는 AWS CloudWatch 로그를 분석하고 디버깅하기 위한 MCP(Model Context Protocol) 서버입니다. AI 모델과 함께 사용하여 로그 분석 및 문제 해결을 효율적으로 수행할 수 있습니다.

## 🔗 링크

- GitHub 저장소: [github.com/juri-dev-lab/mcp-cloudwatch-tracker](https://github.com/juri-dev-lab/mcp-cloudwatch-tracker)
- GitHub 패키지: [github.com/juri-dev-lab/mcp-cloudwatch-tracker/packages](https://github.com/juri-dev-lab/mcp-cloudwatch-tracker/packages)

> ⚠️ **패키지 접근 권한 안내**
> - 이 패키지는 현재 private으로 설정되어 있습니다
> - 사용을 위해서는 GitHub Organization의 멤버로 초대되어야 합니다
> - 접근 권한이 필요한 경우 저장소 관리자에게 문의해주세요

## 🌟 주요 기능

- CloudWatch 로그 그룹에서 특정 문자열 검색
- 로그의 전후 컨텍스트 조회
- 로그 분석 결과 요약
- 에러 로그 분석 및 원인 파악

## 🚀 시작하기

### 1️⃣ 사전 준비사항

> 💡 시작하기 전에 다음 항목들이 준비되어 있어야 합니다:
>
> - AWS 계정 및 자격 증명
> - Node.js 18.0.0 이상
> - Docker (Docker 실행 방식 선택 시)

### 2️⃣ AWS 자격 증명 설정

AWS 자격 증명은 다음 세 가지 방법 중 하나를 선택하여 설정할 수 있습니다:

#### A. .env 파일 사용 (개발 환경 권장)

```plaintext
# 프로젝트 루트에 .env 파일 생성
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-northeast-2
```

#### B. 시스템 환경 변수 사용

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=ap-northeast-2
```

#### C. AWS CLI 자격 증명 사용

```bash
aws configure
```

> ⚠️ **보안 주의사항**
>
> - .env 파일은 반드시 .gitignore에 추가
> - AWS 자격 증명을 소스 코드에 포함하지 않기
> - 각자 자신의 AWS 계정 자격 증명 사용
> - 프로덕션 환경에서는 AWS IAM 역할 사용 권장

### 3️⃣ 실행 방법

#### A. NPX로 실행하기

**직접 실행:**

```bash
npx -y @juri-dev-lab/mcp-cloudwatch-tracker@latest \
  --aws-access-key-id YOUR_AWS_ACCESS_KEY \
  --aws-secret-access-key YOUR_AWS_SECRET_KEY \
  --aws-region YOUR_AWS_REGION
```

**MCP 설정 파일 사용 (mcp.json):**

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

#### B. Docker로 실행하기

**직접 실행:**

```bash
docker run --rm -i \
  -e AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY \
  -e AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY \
  -e AWS_REGION=YOUR_AWS_REGION \
  juri-dev-lab/mcp-cloudwatch-tracker
```

**환경 변수 파일 사용:**

```bash
# .env 파일이 있는 경우
docker run --rm -i --env-file .env juri-dev-lab/mcp-cloudwatch-tracker
```

**MCP 설정 파일 사용 (mcp.json):**

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

## 📝 사용 예시

### 로그 검색하기

**기본 검색:**

```bash
cloudwatch-log-tracker search -g your-log-group -s your-stream -t "search-term"
```

**상세 옵션 사용:**

```bash
cloudwatch-log-tracker search \
  -g your-log-group \
  -s your-stream \
  -t "search-term" \
  -d 7 \  # 검색할 일 수
  -c 5 \  # 전후 컨텍스트 라인 수
  --analyze-errors  # 에러 분석 수행
```

### 최근 로그 조회하기

**기본 조회:**

```bash
cloudwatch-log-tracker recent -g your-log-group -s your-stream
```

**조회 개수 지정:**

```bash
cloudwatch-log-tracker recent -g your-log-group -s your-stream -l 50
```

## 🔒 권장 IAM 정책

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

## 🛠️ 문제 해결

> 💡 **자주 발생하는 문제**
>
> 1. AWS 자격 증명 오류
>    - 자격 증명이 올바르게 설정되었는지 확인
>    - IAM 정책 권한 확인
> 2. 로그 그룹/스트림 접근 오류
>    - 로그 그룹/스트림 이름이 정확한지 확인
>    - 해당 리전에 로그 그룹이 존재하는지 확인
> 3. Docker 실행 오류
>    - Docker 데몬이 실행 중인지 확인
>    - 환경 변수가 올바르게 전달되었는지 확인

## 📚 참고 자료

- [GitHub 저장소](https://github.com/juri-dev-lab/mcp-cloudwatch-tracker)
- [GitHub 패키지](https://github.com/juri-dev-lab/mcp-cloudwatch-tracker/packages)
- [AWS CloudWatch 로그 문서](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html)
- [AWS IAM 정책 가이드](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- [Docker 문서](https://docs.docker.com/)
