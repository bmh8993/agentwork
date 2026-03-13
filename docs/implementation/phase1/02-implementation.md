# Phase 1 - Implementation Breakdown

- Date: 2026-03-13
- Status: Ready

## Tasks

### Task 1. Validator Contract Skeleton

1. `skill-schema` 모듈에 AJV validator 엔트리 생성
2. v1 스키마 로더/컴파일 경로 고정
3. 실패 결과를 내부 표준 에러 객체로 변환

완료 기준:

1. 스키마 로드 실패/검증 실패가 구분된다.
2. `schema_validation_failed` 매핑이 동작한다.

### Task 2. Stage Validator 분리

1. `validateLoad`, `validateDraft`, `validatePublish`, `validateRun` 인터페이스 정의
2. Stage별 허용/차단 규칙 분기 반영
3. 공통 에러 포맷(`error_code`, `category`, `next_action`) 통일

완료 기준:

1. 동일 입력이라도 Stage에 따라 결과가 달라진다.
2. `publish_validation_failed`, `run_validation_failed`가 분리 반환된다.

### Task 3. Publish Required Fields Gate

1. Agent 노드의 `action_text`, `done_criteria` 유무 검사
2. 누락 시 `publish_required_field_missing` 반환
3. Draft 단계에서는 동일 누락을 경고 수준으로만 처리(저장 허용)

완료 기준:

1. Draft Save는 통과한다.
2. Publish는 차단된다.

### Task 4. Load Compatibility(read-only)

1. unsupported node type 탐지 로직 추가
2. Load 단계에서 read-only compatibility 모드 플래그 설정
3. 원본 문서 mutation 금지 경로 추가

완료 기준:

1. unsupported node 문서를 열 수 있다.
2. 저장/실행 경로로 진입 시 차단된다.

### Task 5. Draft Save Integrity + Atomic Write

1. 저장 전 최소 구조 무결성 검사 수행
2. atomic write(임시 파일 -> rename) 적용
3. 실패 시 롤백/에러 반환 처리

완료 기준:

1. 부분 저장(깨진 파일) 상태가 발생하지 않는다.
2. 실패 시 사용자에게 복구 가능 메시지가 제공된다.

### Task 6. Contract Fixtures and Gate Tests

1. 정상/실패 fixture 세트 작성
2. 필수 게이트 테스트 5개 작성
3. CI에서 merge-blocking 설정(문서 또는 스크립트)

완료 기준:

1. 필수 게이트 실패 시 merge 차단 조건이 명확하다.
2. 실패 메시지가 에러 코드 기준으로 확인 가능하다.

## Open Questions

1. migration 실패(`migration_failed`) 처리 책임을 Phase 1에 포함할지, Phase 3로 이관할지 확정 필요
2. read-only compatibility 상태에서 허용할 UI 액션 범위(복사/내보내기 등) 확정 필요
3. backup 파일 보존 개수/정리 정책은 ADR-0012와 함께 후속 phase에서 확정 필요

## Artifacts (expected)

1. schema validator 모듈
2. stage validator 모듈
3. save/io 모듈의 atomic write 경로
4. contract fixture 및 테스트 파일
