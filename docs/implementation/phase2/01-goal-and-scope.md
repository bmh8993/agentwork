# Phase 2 - Goal and Scope

- Date: 2026-03-13
- Status: Ready

## Goal

`Start/Agent/End` 고정 모델 기준으로 워크플로우 편집 UX와 Publish 게이트를 완성한다.

## Scope In

1. 워크플로우 최소 노드 타입(`Start`, `Agent`, `End`) 편집 흐름 고정
2. Agent 카드 슬롯(`Knowledge`, `Tool`, `Action`, `Done Criteria`) UI 반영
3. `Action`/`Done Criteria` 누락 시 Publish 차단 UX 구현
4. `Draft Save` 허용, `Publish/Run` strict 차단 플로우 연결
5. 비지원 노드 Load 시 read-only compatibility 화면/상태 처리
6. 에러 카드에 `error_code`, `message_user`, `next_action` 노출

## Scope Out

1. local/npm installer 구현
2. 로그 마스킹/보존 파이프라인
3. 실행 오케스트레이터 세부 복구 전략
4. Marketplace/zip/원격 실행

## Constraints (from ADR)

1. Workflow 모델은 Action-only로 유지한다.
2. Condition은 MVP에서 사용하지 않는다.
3. Publish 전 필수 슬롯 검증은 strict로 적용한다.
4. 비지원 노드는 원본 보존 + 읽기 전용 모드만 허용한다.
5. Publish는 `SKILL.json.version`을 변경하지 않는다.

## Exit Criteria

1. Agent 카드 필수 슬롯 UX가 동작한다.
2. Draft Save와 Publish 결과 차이가 명확히 검증된다.
3. unsupported node 문서는 read-only로 열리고 Publish/Run이 차단된다.
4. `publish-gate-required-fields`, `ui-error-next-action` 검증이 통과한다.

## Artifacts

1. `docs/implementation/phase2/02-implementation.md`
2. `docs/implementation/phase2/03-validation.md`
3. `docs/implementation/phase2/04-handoff.md`
4. (코드 시작 시) workflow-ui 관련 컴포넌트/상태/테스트 파일
