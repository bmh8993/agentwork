# Phase 3 - Implementation Breakdown

- Date: 2026-03-13
- Status: Ready

## Tasks

### Task 1. Installer Source Gate

1. 설치 입력 source 판별(local folder, npm, 그 외)
2. zip/기타 소스 차단(`unsupported_source`)
3. source별 분기 진입 로그 추가

완료 기준:

1. local/npm만 설치 진입 가능
2. unsupported source가 일관된 에러 코드로 차단

### Task 2. Package Layout Validation

1. `SKILL.json` 존재 여부 검사
2. 필수 파일/디렉터리 레이아웃 검사
3. 실패 시 `missing_required_file`/`invalid_package_layout` 매핑

완료 기준:

1. 레이아웃 불일치가 설치 초기에 차단된다.
2. 사용자에게 수정 경로(`next_action`)가 제공된다.

### Task 3. npm Install Error Mapping

1. npm 설치 프로세스 실패 유형 분류
2. 네트워크/버전 충돌 등 오류를 표준 코드로 매핑
3. retryable 여부 설정

완료 기준:

1. 주요 npm 실패가 `dependency_resolution_failed`로 수렴된다.
2. 재시도 가능 여부가 일관되게 표시된다.

### Task 4. Run Strict Gate Integration

1. Run 시작 전 `validateRun` 강제 호출
2. 실패 시 실행 파이프라인 중단 + 에러 반환
3. 성공 시에만 런타임 세션 시작

완료 기준:

1. strict 실패 fixture는 실행 시작 전 차단된다.
2. 통과 fixture만 실행된다.

### Task 5. Logging Masking and Retention

1. 구조화 로그 포맷 통일
2. 민감 키/값 마스킹 파이프라인 적용
3. 로그 보존 기간/정리 훅 적용

완료 기준:

1. 로그 샘플에서 민감 정보가 마스킹된다.
2. 보존 정책에 맞는 정리 동작이 확인된다.

### Task 6. SKILL.md Generation Pipeline

1. `SKILL.json` 파싱 후 `SKILL.md` 생성기 연결
2. 생성물/원본의 역할 분리(원본은 json)
3. 생성 실패 시 `skill_compile_failed` 반환

완료 기준:

1. 입력 변경 시 생성물이 일관되게 갱신된다.
2. 생성 실패가 명확한 코드/메시지로 보고된다.

### Task 7. Integration Gates and CI

1. `install-folder-only`, `installer-npm-errors`, `run-gate-strict` 자동화
2. 통합 시나리오 스모크 테스트 작성
3. 머지 차단 게이트 반영

완료 기준:

1. 필수/권장 게이트 상태가 명확히 구분된다.
2. 실패 시 단계별 원인이 식별 가능하다.

## Open Questions

1. npm 설치 캐시/오프라인 모드 전략을 MVP 범위에 포함할지 여부
2. 로그 보존 기간 기본값(일수) 확정 필요
3. `SKILL.md` 생성 트리거를 저장 시점/Publish 시점 중 어디에 둘지 확정 필요

## Artifacts (expected)

1. installer source/layout validator 모듈
2. npm install adapter + error mapping
3. run preflight gate 모듈
4. logging masking/retention 모듈
5. SKILL.md generator 모듈 및 테스트
