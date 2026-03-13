# ADR-0018: Action 텍스트 중심 워크플로우 모델 (Condition 제거)

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

MVP 빌더 UX는 Agent 카드 중심으로 단순화하는 방향을 채택했다.
사용자는 Agent를 연결하고 Action을 텍스트로 정의하는 흐름을 선호한다.
Condition 개념을 노출하거나 별도 모델로 유지하면 학습 비용과 문서 복잡도가 증가한다.

## Decision

MVP 워크플로우는 Action 텍스트 중심의 Agent 연결 모델로 고정한다.
Condition 개념은 MVP 범위에서 사용하지 않는다.

핵심 결정 사항:

1. 사용자 구성 단위는 Agent 카드로 고정한다.
2. Agent의 실행 의도는 `Action` 텍스트로 정의한다.
3. 기본 실행은 순차(`sequential`)이며 분기/조건 평가는 지원하지 않는다.
4. 워크플로우 최소 타입은 `Start`, `Agent`, `End`로 고정한다.
5. `Knowledge`, `Tool`, `Action`, `Done Criteria`는 Agent 카드의 필수 구성으로 유지한다.

## Rationale

1. Action 텍스트 중심 모델은 비개발자에게 가장 직관적이다.
2. 분기 제거는 MVP 구현/테스트/운영 복잡도를 크게 줄인다.
3. Agent 카드 UX와 데이터 모델 정합성을 높일 수 있다.

## Consequences

긍정 효과:

1. 워크플로우 작성 속도와 이해도가 높아진다.
2. 실행 경로가 단순해 디버깅이 쉬워진다.

제약:

1. 조건 분기 시나리오는 MVP에서 표현할 수 없다.
2. 고급 자동화 시나리오는 후속 ADR에서 재도입이 필요하다.

## Scope

포함:

1. Agent 연결 기반 순차 실행 모델
2. Action 텍스트 정의 및 저장 규칙
3. Condition 비사용 원칙

제외:

1. Condition 노드 또는 표현식 평가
2. true/false 분기 경로
3. 병렬 실행/합류 정책

## Related Decisions

1. [ADR-0017-agent-card-ux-and-chat-refinement.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0017-agent-card-ux-and-chat-refinement.md)
2. [ADR-0009-skill-json-v1-schema-and-acceptance-tests.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0009-skill-json-v1-schema-and-acceptance-tests.md)
3. Supersedes: [ADR-0004-skill-canvas-minimum-execution-rules.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0004-skill-canvas-minimum-execution-rules.md)
4. Supersedes: [ADR-0011-condition-node-expression-policy.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0011-condition-node-expression-policy.md)

## References

1. [OpenWork repository](/Users/zayden.ok/Desktop/dev-others/openwork)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. Action 텍스트 중심 모델 합의
  2. Condition 제거 원칙 합의
- Accepted -> Superseded 조건:
  1. MVP/차기 릴리즈에서 분기 모델을 재도입할 때
