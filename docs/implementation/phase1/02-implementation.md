# Phase 1 - Implementation Breakdown

- Date: 2026-03-13
- Status: Ready

## Tasks

이 문서는 "한 턴 = 리뷰 가능한 작은 작업 1개" 원칙으로 구성한다.

### Turn 1. Repo Skeleton + Test Entrypoints

1. `packages/skill-schema`, `packages/skill-io`, `test-gates/contract`, `fixtures` 기본 디렉터리 생성
2. `pnpm test:contract:*` 명령 엔트리 등록(실패해도 실행 경로 확인 가능 상태)
3. 기본 빌드/테스트 스캐폴드만 추가(실제 검증 로직 제외)

완료 기준:

1. 계약 테스트 명령이 경로 오류 없이 실행된다.
2. 이후 턴에서 테스트 파일만 채우면 바로 검증 가능하다.

### Turn 2. Error Contract + Code Map

1. `ValidationError` 타입과 `error_code` 카탈로그(Phase 1 대상 코드) 정의
2. stage별 기본 매핑 유틸 추가
3. 에러 객체 생성기(factory) 추가

완료 기준:

1. `error_code`, `category`, `next_action`, `retryable`가 일관 포맷으로 반환된다.
2. 테스트에서 코드 매핑 단위 검증이 가능하다.

### Turn 3. V1 JSON Schema + AJV Wrapper (`schema-contract`)

1. `v1.schema.json` 작성
2. AJV 컴파일/검증 래퍼(`validateSchema`) 구현
3. 실패를 `schema_validation_failed`로 매핑

완료 기준:

1. `pnpm test:contract:schema` 통과
2. valid/invalid fixture가 기대대로 분기한다.

### Turn 4. Stage API Skeleton (Load/Draft/Publish/Run)

1. `validateLoad`, `validateDraft`, `validatePublish`, `validateRun` 인터페이스만 먼저 고정
2. 공통 반환 타입(`ok`, `errors`, `warnings`, `flags`) 고정
3. 현재는 schema validation 결과만 반영

완료 기준:

1. stage 함수 시그니처가 고정되어 이후 규칙 추가 시 인터페이스 변경이 없다.
2. 스키마 실패 시 stage별 기본 에러 코드가 맞게 나온다.

### Turn 5. Load Compatibility (`load-compat-readonly`)

1. 지원 노드 타입(`Start`, `Agent`, `End`) 상수 정의
2. 비지원 노드 탐지 시 Load는 성공 + `readOnlyCompatibility` 플래그 설정
3. 원본 mutation 금지 경로 확인

완료 기준:

1. `pnpm test:contract:load` 통과
2. unsupported node fixture에서 Load 성공/읽기 전용 진입이 확인된다.

### Turn 6. Draft Structural Validation + Save API (`draft-structural-save`)

1. Draft에서 구조 무결성 검사 수행
2. `saveSkill` 엔트리에서 `validateDraft` 선행 호출
3. 실패 시 저장 차단 및 표준 에러 반환

완료 기준:

1. `pnpm test:contract:draft` 통과
2. Draft 저장 허용/차단 경계가 명확히 검증된다.

### Turn 7. Publish Required Fields Gate (`publish-gate-required-fields`)

1. Agent 노드의 `config.action_text`, `config.done_criteria` 검사
2. 누락 시 `publish_required_field_missing` 반환
3. Draft에서는 동일 누락을 경고(warning)로만 유지

완료 기준:

1. `pnpm test:contract:publish` 통과
2. Draft 허용 + Publish 차단 차이가 재현된다.

### Turn 8. Run Strict Gate (`run-gate-strict`)

1. Run 진입 전 strict validation 강제
2. 실패 시 `run_validation_failed` 반환
3. unsupported node 포함 시 Run 차단

완료 기준:

1. `pnpm test:contract:run` 통과
2. strict 실패 fixture는 실행 시작 전 차단된다.

### Turn 9. Atomic Write (`draft-structural-save` 보강)

1. `atomicWrite(path, content)` 구현(임시 파일 -> rename)
2. 쓰기 실패 시 원본 보존 보장
3. `saveSkill`에서 atomic write 사용

완료 기준:

1. 저장 중단/실패 시 깨진 파일이 남지 않는다.
2. draft 저장 테스트에 원본 보존 검증이 포함된다.

### Turn 10. Fixture Finalize + Gate Stabilization

1. 필수 fixture(`valid/invalid`) 정리
2. 게이트 테스트 5개 최종 안정화
3. CI merge-blocking 기준 문서/스크립트 반영

완료 기준:

1. 필수 게이트 5개가 연속 실행에서 안정 통과한다.
2. 실패 메시지가 `error_code` 중심으로 확인된다.

## Open Questions

1. migration 실패(`migration_failed`) 처리 책임을 Phase 1에 포함할지, Phase 3로 이관할지 확정 필요
2. read-only compatibility 상태에서 허용할 UI 액션 범위(복사/내보내기 등) 확정 필요
3. backup 파일 보존 개수/정리 정책은 ADR-0012와 함께 후속 phase에서 확정 필요

## Artifacts (expected)

1. schema validator 모듈
2. stage validator 모듈
3. save/io 모듈의 atomic write 경로
4. contract fixture 및 테스트 파일
