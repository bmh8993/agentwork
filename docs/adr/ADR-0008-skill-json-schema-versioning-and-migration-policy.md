# ADR-0008: SKILL.json 스키마 버전/호환/마이그레이션 정책

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

ADR-0007에서 `SKILL.json`을 단일 SoT로 고정했다.
단일 SoT 운영에는 버전 식별, 호환성 경계, 마이그레이션 규칙이 필요하다.
버전 규칙이 없으면 import 실패, 런타임 불일치, 복구 불가능한 저장 오류가 발생한다.
MVP는 복잡한 자동 병합보다 예측 가능한 변환 경로와 명확한 실패 처리를 우선한다.

## Decision

MVP에서 `SKILL.json`은 명시적 버전 필드 기반으로 검증하고, 앱은 정의된 버전 범위만 읽고 저장한다.
지원 범위를 벗어난 문서는 실행 전에 차단하고, 허용된 경로로만 마이그레이션한다.

핵심 결정 사항:

1. `SKILL.json.version`은 필수 문자열 필드다.
2. MVP 작성(write) 버전은 `"1"`로 고정한다.
3. MVP 읽기(read) 허용 버전도 `"1"`로 고정한다.
4. 버전 불일치(`unsupported_version`)는 실행 전에 차단한다.
5. 마이그레이션은 명시적 `from -> to` 변환 함수로만 수행한다.
6. 마이그레이션 성공 후에는 항상 target 버전으로 재검증하고 원자적 저장한다.
7. 마이그레이션 실패 시 원본 파일은 변경하지 않고 `.bak` 백업 파일을 남긴 뒤 오류 이벤트를 기록한다.
8. 검증 로직은 공통 모듈 한 곳에서 정의하고 앱/CLI/런타임이 공유한다.

## Validation and Compatibility Rules

1. 검증 순서는 `version 확인 -> 스키마 검증 -> 도메인 규칙 검증`으로 고정한다.
2. `version` 누락은 `missing_version` 오류로 처리한다.
3. 숫자/객체 타입의 version 값은 허용하지 않는다(`invalid_version_type`).
4. 현재 앱이 지원하지 않는 버전은 `unsupported_version`으로 처리한다.
5. 스키마 검증 실패는 `schema_validation_failed`로 처리한다.
6. 마이그레이션 실패는 `migration_failed`로 처리한다.
7. `SKILL.md` 생성은 버전 검증을 통과한 문서에만 허용한다.
8. 검증 적용 단계는 아래처럼 고정한다.
   1. `Load(Open)`: 버전/기본 구조가 유효하면 문서를 연다. 도메인 규칙 실패(예: 비지원 노드 타입)는 read-only 호환 모드로 표시한다.
   2. `Draft Save`: `version`과 JSON 구조 무결성은 필수로 검증한다.
   3. `Publish`/`Run`: 스키마 + 도메인 규칙을 모두 strict로 검증한다. 실패 시 차단한다.
9. read-only 호환 모드에서는 원본 데이터 보존을 우선하며 자동 정규화/자동 삭제를 금지한다.

## Migration Rules (MVP)

1. 앱은 자동 백그라운드 마이그레이션을 수행하지 않는다.
2. import/open 시 버전이 다르면 사용자 승인 후 명시적 마이그레이션을 수행한다.
3. 마이그레이션 결과는 항상 최신 지원 버전 문서로 저장한다.
4. 실패 이벤트에는 `error_code`, `category`, `next_action`을 포함한다.
5. 마이그레이션 시도 전 원본 파일의 `.bak`를 생성하고, 실패 시 `.bak`로 즉시 복구 가능해야 한다.

## Rationale

1. 명시적 버전 정책은 저장 포맷 변경 시 회귀 위험을 줄인다.
2. 읽기/쓰기 버전을 고정하면 MVP 디버깅과 지원 범위가 단순해진다.
3. 원본 보존 + `.bak` 정책은 마이그레이션 실패 시 데이터 손실을 방지한다.
4. 공통 검증 모듈은 채널별 동작 편차를 줄인다.

## Consequences

긍정 효과:

1. 호환성 오류를 실행 전에 탐지할 수 있다.
2. 버전 변경 시 테스트 포인트가 명확해진다.
3. 장애 대응 시 원본 보존으로 복구 가능성이 높아진다.

제약:

1. 신규 버전 도입 때마다 명시적 변환 함수와 테스트를 추가해야 한다.
2. 구버전 자동 무중단 업그레이드는 MVP에서 제공하지 않는다.
3. 공통 검증 모듈 변경 시 영향 범위가 넓어 회귀 테스트가 필수다.

## Scope

포함:

1. `version` 필드 필수화 및 타입/값 검증
2. read/write 지원 버전 경계 정의
3. 명시적 마이그레이션 실행 규칙과 실패 처리
4. 저장 전후 재검증 및 원자적 저장 규칙
5. 표준 오류 코드 5종(`missing_version`, `invalid_version_type`, `unsupported_version`, `schema_validation_failed`, `migration_failed`)
6. 공통 검증 모듈 공유 원칙
7. 단계별 검증 적용 경계(`Load`, `Draft Save`, `Publish`, `Run`)

제외:

1. 다중 버전 동시 실행(runtime polyfill)
2. 양방향/자동 병합형 마이그레이션
3. 클라우드 협업 환경의 동시 편집 충돌 해결
4. JSON Schema 상세 필드 정의와 테스트 케이스 카탈로그(후속 ADR에서 확정)

## Related Decisions

1. [ADR-0007-skill-json-single-source-and-md-generation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0007-skill-json-single-source-and-md-generation.md)
2. [ADR-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0005-failure-taxonomy-and-error-ux.md)
3. [ADR-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0002-domain-model.md)
4. Follow-up: ADR-0009 (JSON Schema 상세/수용 테스트 기준)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. `version` 필수화 및 지원 범위(`"1"` only)에 대한 팀 합의
  2. 명시적 마이그레이션 및 원본 보존 정책 합의
- Accepted -> Superseded 조건:
  1. read/write 멀티버전 동시 지원 정책으로 전환할 때
  2. 자동 온라인 마이그레이션이 제품 기본 정책으로 채택될 때
