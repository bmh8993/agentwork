# ARD-0011: 내부 Condition 표현식 평가 정책 (UI 비노출)

- Status: Superseded
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

MVP 빌더 UX는 Agent 카드 중심으로 단순화하는 방향을 채택했다.
사용자에게 Condition 노드를 직접 노출하지 않더라도, 실행 엔진에는 분기 평가 규칙이 필요하다고 보았다.
하지만 이후 합의에서 MVP는 Agent 카드 기반 구체화 플로우를 우선하고, 독립적인 Condition 표현식 정책을 별도 범위로 다루지 않기로 했다.
본 문서는 ARD-0018의 Action 텍스트 중심 모델로 대체된다.

## Decision

MVP 엔진은 내부 분기 평가에 제한된 Condition 표현식 정책을 사용한다.
빌더 UI는 이 정책을 직접 노출하지 않고, 연결선 조건 또는 저장 시 구체화 과정을 통해 내부 규칙으로 컴파일한다.

핵심 결정 사항:

1. 허용 연산자는 비교(`eq`, `ne`, `gt`, `gte`, `lt`, `lte`)와 논리(`and`, `or`, `not`)로 제한한다.
2. 평가 스코프는 현재 노드 입력 데이터와 직전 단계 출력으로 제한한다.
3. 타입 검증은 엄격 모드로 수행하고 암묵적 캐스팅을 허용하지 않는다.
4. 평가 실패 시 표준 오류 코드와 `next_action`을 반환한다.
5. 함수 호출, 사용자 스크립트 실행, 외부 I/O 의존 평가를 금지한다.

## Engine Contract (MVP)

1. 내부 저장은 구조화 규칙(JSON)으로 유지한다.
2. 분기 결과는 반드시 boolean(`true/false`)이어야 한다.
3. 파싱 실패/타입 오류/평가 실패는 `ConfigError` 또는 `ValidationError`로 분류한다.
4. 실패 코드는 최소 `condition_parse_failed`, `condition_type_mismatch`, `condition_eval_failed`를 사용한다.

## Boundary with UX

1. 본 문서는 엔진 평가 규칙을 다룬다.
2. 빌더 상호작용(Agent 카드, 채팅 구체화)은 ARD-0017에서 다룬다.
3. UI가 입력한 텍스트/폼 조건은 본 정책의 구조화 규칙으로 컴파일되어야 한다.

## Rationale

1. 제한된 문법은 평가 결과의 예측 가능성을 높인다.
2. 엄격 타입과 스코프 제한은 숨은 버그를 줄인다.
3. UI/엔진 경계를 분리하면 UX 변경이 실행 안정성에 미치는 영향을 줄일 수 있다.

## Consequences

긍정 효과:

1. 실행 경로 예측성이 높아진다.
2. 조건 평가 오류 원인과 복구 안내가 명확해진다.

제약:

1. 고급 스크립팅 표현력은 제한된다.
2. 문법 확장 시 컴파일러와 테스트 갱신이 필요하다.

## Scope

포함:

1. 내부 Condition 문법/스코프/타입 정책
2. 평가 오류 코드 및 복구 액션 규칙

제외:

1. 사용자 정의 함수/스크립트 실행
2. 외부 API 기반 동적 조건
3. 빌더 UI 노출 방식 정의(ARD-0017에서 관리)

## Related Decisions

1. [ARD-0004-skill-canvas-minimum-execution-rules.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0004-skill-canvas-minimum-execution-rules.md)
2. [ARD-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0005-failure-taxonomy-and-error-ux.md)
3. [ARD-0017-agent-card-ux-and-chat-refinement.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0017-agent-card-ux-and-chat-refinement.md)
4. Superseded by: [ARD-0018-action-only-workflow-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0018-action-only-workflow-model.md)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. 허용 문법/스코프/엄격 타입 정책 합의
  2. 최소 오류 코드와 복구 가이드 합의
- Accepted -> Superseded 조건:
  1. 고급 표현식 엔진 또는 정책 엔진으로 대체될 때
