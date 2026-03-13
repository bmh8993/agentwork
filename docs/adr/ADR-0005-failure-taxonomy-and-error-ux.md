# ADR-0005: 실패 분류 체계와 에러 UX 표준 (MVP)

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

비개발자 대상 GUI에서 실패는 반드시 "원인 파악 가능 + 즉시 다음 행동 가능" 상태로 노출되어야 한다.
오류를 문자열로만 처리하면 재현/디버깅/가이드 자동화가 어렵다.
따라서 MVP부터 구조화된 실패 분류와 공통 에러 UX 계약이 필요하다.

## Decision

MVP 에러 처리는 `error_code + category + next_action` 3축으로 고정한다.

핵심 결정 사항:

1. 모든 실패 이벤트는 `category`를 가진다.
2. 모든 실패 이벤트는 기계 판별 가능한 `error_code`를 가진다.
3. 모든 실패 이벤트는 사용자가 즉시 수행 가능한 `next_action`을 가진다.
4. 화면에는 기술 상세와 사용자 가이드를 함께 노출한다.
5. 타임아웃 기본 메시지는 `"Request timed out."`로 통일한다.

## Failure Category (MVP)

1. `InstallError`: plugin/agent 로드 또는 설치 실패
2. `ConfigError`: 경로/권한/참조 누락/설정 불일치
3. `ValidationError`: Skill 그래프 규칙 위반(DAG 위반, 필수 노드 누락)
4. `ExecutionError`: Agent 실행 실패
5. `ToolError`: CLI/MCP 등 도구 호출 실패
6. `RuntimeError`: 세션/엔진 상태 이상(중단, 연결 불가, 타임아웃)

## Error Event Contract (MVP)

에러 이벤트는 아래 최소 필드를 가진다.

1. `id`
2. `timestamp`
3. `category`
4. `error_code`
5. `message_user` (사용자 요약)
6. `message_tech` (기술 상세)
7. `node_id` (해당 시)
8. `agent_id` (해당 시)
9. `tool_id` (해당 시)
10. `next_action`
11. `retryable` (boolean)

## UX Rules (MVP)

1. 에러 카드에는 항상 아래 5가지를 노출한다.
   1. 무엇이 실패했는지
   2. 어디서 실패했는지
   3. 왜 실패했는지(요약)
   4. 지금 할 일(`next_action`)
   5. 상세 로그 보기
2. 기본 CTA는 `Restart Run`으로 고정한다.
3. `Retry from Failed Node`는 Non-MVP 옵션으로 분류한다.
4. active run이 있으면 위험 액션(리로드/중단)은 경고 후 수행한다.

## Rationale

1. 분류/코드/액션의 3축이 있어야 UI 자동 가이드가 가능하다.
2. 비개발자는 에러 원인보다 "지금 할 일"이 먼저 필요하다.
3. MVP에서는 재시작 기반 복구가 가장 단순하고 신뢰성이 높다.

## Consequences

긍정 효과:

1. 실패 메시지 품질이 일관되고 학습 비용이 줄어든다.
2. 에러 집계/KPI(카테고리별 실패율, 액션 성공률) 측정이 가능하다.

제약:

1. `error_code` 사전 관리 비용이 생긴다.
2. 노드 단위 부분 재시도는 후속 구현이 필요하다.

## Scope

포함:

1. 실패 카테고리 6종
2. 에러 이벤트 최소 필드 계약
3. 공통 에러 UI 노출 규칙
4. 기본 복구 액션(`Restart Run`)

제외:

1. 자동 재시도/백오프
2. 노드 단위 부분 재실행
3. 고급 장애 진단(원격 수집/분산 트레이싱)

## Related Decisions

1. [ADR-0001-mvp-distribution-and-installation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0001-mvp-distribution-and-installation.md)
2. [ADR-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0002-domain-model.md)
3. [ADR-0003-skill-canonical-and-gui-meta-separation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0003-skill-canonical-and-gui-meta-separation.md) (Superseded)
4. [ADR-0004-skill-canvas-minimum-execution-rules.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0004-skill-canvas-minimum-execution-rules.md)
5. [ADR-0006-skill-meta-minimum-schema.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0006-skill-meta-minimum-schema.md) (Superseded)
6. [ADR-0007-skill-json-single-source-and-md-generation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0007-skill-json-single-source-and-md-generation.md)

## Options / Ideas (Non-MVP)

1. `Retry from Failed Node` 제공
2. `next_action` 자동 실행(one-click fix) 지원
3. 카테고리별 복구 플레이북 자동 추천

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. 카테고리/코드/액션 3축 계약에 대한 팀 합의
  2. Restart Run 우선 복구 전략에 대한 팀 합의
- Accepted -> Superseded 조건:
  1. 부분 재시도 또는 자동 복구가 MVP 필수로 승격될 때
