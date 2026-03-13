# Phase 1 - Goal and Scope

- Date: 2026-03-13
- Status: In Progress

## Goal

`SKILL.json` 계약, 단계별 검증 경계(Load/Draft/Publish/Run), 저장 무결성(atomic write)을 구현 가능한 수준으로 고정한다.

## Scope In

1. `SKILL.json` v1 스키마 validator(AJV) 초기 구현
2. Stage validator 분리 (`Load`, `Draft`, `Publish`, `Run`)
3. Publish 필수 필드(`action_text`, `done_criteria`) 게이트 반영
4. unsupported node 발견 시 `Load(Open)` read-only 호환 모드 처리 기준
5. `Draft Save` 구조 무결성 검증 + atomic write
6. 표준 오류 계약(`error_code`, `category`, `next_action`, `retryable`) 매핑
7. contract fixture 및 테스트 게이트 초안 작성

## Scope Out

1. Workflow canvas 고급 편집 UX
2. 설치 채널 UI(local/npm flow 자체)
3. 실행 스트리밍 UI(SSE projection)
4. 로그 마스킹/보존 구현
5. Marketplace/zip 지원

## Constraints (from ADR)

1. Workflow 모델은 Action-only 기준(`Start`, `Agent`, `End`)으로 제한한다.
2. Condition 노드는 MVP에서 사용하지 않는다.
3. `Publish`/`Run`은 strict 검증 통과 시에만 허용한다.
4. 비지원 노드는 Load 시 원본 보존(read-only)만 허용한다.
5. `SKILL.json.version`은 Publish 시 변경하지 않는다.

## Exit Criteria

1. 필수 테스트 게이트 5개가 통과한다.
2. Stage별 실패가 표준 에러 코드로 반환된다.
3. Draft Save는 허용되지만 Publish/Run은 strict 실패 시 차단된다.
4. Phase 1 산출 문서(`02`, `03`, `04`)가 최신 상태다.

## Artifacts

1. `docs/implementation/phase1/02-implementation.md`
2. `docs/implementation/phase1/03-validation.md`
3. `docs/implementation/phase1/04-handoff.md`
4. (코드 시작 시) schema/domain/io/test 관련 모듈 파일
