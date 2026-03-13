# Phase 3 - Validation Plan

- Date: 2026-03-13
- Status: Ready

## Validation

### V1. install-folder-only

시나리오:

1. local folder 입력 설치
2. npm 입력 설치
3. zip 입력 설치

기대 결과:

1. local/npm은 허용
2. zip은 `unsupported_source`로 차단

### V2. package-layout-validation

시나리오:

1. `SKILL.json` 누락 패키지 설치
2. 레이아웃 위반 패키지 설치
3. 정상 레이아웃 설치

기대 결과:

1. 누락/위반은 각각 표준 코드로 실패
2. 정상 케이스만 설치 진행

### V3. installer-npm-errors

시나리오:

1. 네트워크 실패 상황에서 npm 설치
2. 의존성 버전 충돌 상황에서 npm 설치

기대 결과:

1. 오류가 `dependency_resolution_failed`로 매핑
2. retryable 플래그가 정책에 맞게 설정

### V4. run-gate-strict

시나리오:

1. strict 검증 실패 문서 Run 시도
2. strict 검증 통과 문서 Run 시도

기대 결과:

1. 실패 문서는 실행 시작 전 차단
2. 통과 문서만 실행 시작

### V5. logging-masking-retention

시나리오:

1. 민감 정보 포함 이벤트를 로그에 기록
2. 보존 기간 경과 로그 정리 작업 실행

기대 결과:

1. 민감 정보가 마스킹되어 기록
2. 보존 정책에 따라 오래된 로그가 정리

### V6. skill-md-generation

시나리오:

1. 유효한 `SKILL.json`으로 생성 실행
2. 의도적 생성 실패 케이스 실행

기대 결과:

1. `SKILL.md`가 생성 규칙대로 출력
2. 실패 시 `skill_compile_failed` 반환

## Pass/Fail 기준

1. V1~V6 전부 기대 결과를 만족하면 Pass
2. 하나라도 실패하면 Fail
3. Fail 시 원인/재현/수정 계획을 `04-handoff.md`에 기록

## Manual Check Notes

1. 설치/실행/로그는 동일 에러 계약(`error_code`, `next_action`)으로 검증한다.
2. 최종 리포트는 요청/응답 4개 섹션 포맷을 사용한다.
