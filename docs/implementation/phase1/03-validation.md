# Phase 1 - Validation Plan

- Date: 2026-03-13
- Status: Ready

## Validation

### V1. schema-contract

시나리오:

1. valid v1 fixture 입력
2. invalid type fixture 입력

기대 결과:

1. valid는 통과
2. invalid는 `schema_validation_failed`

### V2. load-compat-readonly

시나리오:

1. unsupported node 포함 fixture Load(Open)
2. read-only 상태에서 저장/실행 시도

기대 결과:

1. Load는 성공(읽기 전용)
2. 저장/실행은 차단
3. 원본 파일 hash가 변경되지 않음

### V3. draft-structural-save

시나리오:

1. Draft에서 구조 최소조건 만족 데이터 저장
2. 의도적으로 저장 실패(파일 권한/쓰기 실패) 유도

기대 결과:

1. 정상 케이스는 저장 성공
2. 실패 케이스는 원본 보존 + 표준 에러 반환

### V4. publish-gate-required-fields

시나리오:

1. `action_text` 누락 상태 Publish
2. `done_criteria` 누락 상태 Publish
3. 두 필드 포함 상태 Publish

기대 결과:

1. 누락 케이스는 `publish_required_field_missing`
2. 두 필드 포함 시 Publish 통과

### V5. run-gate-strict

시나리오:

1. strict 검증 실패 fixture로 Run 실행
2. strict 검증 통과 fixture로 Run 실행

기대 결과:

1. 실패 fixture는 실행 시작 전 차단 (`run_validation_failed`)
2. 통과 fixture만 실행 시작

## Pass/Fail 기준

1. 위 5개 검증 항목 모두 기대 결과 충족 시 Pass
2. 항목 1개라도 실패하면 Phase 1 미완료(Fail)
3. Fail 시 원인/재현 절차/수정 계획을 `04-handoff.md`에 기록

## Manual Check Notes

1. 검증 로그는 `error_code` 중심으로 확인한다.
2. 결과 리포트는 요청/응답 템플릿의 4개 섹션으로 공유한다.
