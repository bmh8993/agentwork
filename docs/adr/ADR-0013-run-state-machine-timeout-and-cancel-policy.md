# ADR-0013: Run 상태 머신과 Timeout/Cancel 정책

- Status: Superseded
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

MVP는 `fail-fast`와 수동 재실행 규칙을 갖는다.
여기에 상태 전이와 timeout/cancel 규칙이 없으면 UI와 엔진 상태가 어긋날 수 있다.
하지만 이후 합의에서 실행 엔진의 독자 상태머신을 정의하지 않고, OpenCode 실행 현황을 chat UI에서 표시/개입하는 모델로 정리했다.
본 문서는 Action 중심 모델(ADR-0018)과 Agent 카드 UX(ADR-0017)로 대체된다.

## Decision

MVP `SkillRun`/노드 실행 상태 머신과 timeout/cancel 동작을 고정한다.

핵심 결정 사항:

1. run과 node의 상태 집합 및 허용 전이를 명시한다.
2. timeout 기준값과 만료 시 처리 규칙을 고정한다.
3. cancel 요청의 처리 순서와 사용자 피드백 규칙을 고정한다.

## Rationale

1. 상태 전이 규칙은 재현 가능한 디버깅의 기반이다.
2. timeout/cancel 표준화는 예측 가능한 UX를 만든다.
3. 엔진-UI 간 불일치 오류를 줄일 수 있다.

## Consequences

긍정 효과:

1. 상태 표시와 실제 실행의 정합성이 높아진다.
2. 중단/타임아웃 문제 대응이 빨라진다.

제약:

1. 상태 전이 규칙 변경 시 영향 범위가 넓다.
2. 타임아웃 기본값 조정에 대한 운영 비용이 생긴다.

## Scope

포함:

1. run/node 상태 정의와 전이 테이블
2. timeout/cancel 처리 규칙

제외:

1. 자동 재시도/백오프
2. 분산 실행 환경의 장애 복구

## Related Decisions

1. [ADR-0004-skill-canvas-minimum-execution-rules.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0004-skill-canvas-minimum-execution-rules.md)
2. [ADR-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0005-failure-taxonomy-and-error-ux.md)
3. Superseded by: [ADR-0018-action-only-workflow-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0018-action-only-workflow-model.md)
4. Superseded by: [ADR-0017-agent-card-ux-and-chat-refinement.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0017-agent-card-ux-and-chat-refinement.md)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. 상태 전이 표와 timeout/cancel 처리 합의
  2. 에러 코드/UX 문구 매핑 합의
- Accepted -> Superseded 조건:
  1. 병렬/분산 실행 정책 도입으로 상태 모델이 변경될 때
