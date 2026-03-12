# ARD-0004: Skill 캔버스 최소 실행 규칙 (MVP)

- Status: Superseded
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

Skill은 여러 Agent의 동작 방식을 결정하는 워크플로우다.
병렬 실행까지 포함하면 표현력은 높아지지만, 비개발자 대상 MVP에서는 설계/디버깅 복잡도가 급격히 증가한다.
MVP 목표는 "GUI로 Skill을 만들고 실행 성공을 경험"하는 검증이다.
본 결정의 노드 타입/분기 정책은 ARD-0018에서 대체되었다.

## Decision

MVP Skill 실행 규칙을 아래로 고정한다.

핵심 결정 사항:

1. 그래프 제약은 `DAG only`로 한다(순환 금지).
2. 실행 방식은 `단일 워크플로 순차 실행`으로 한다(병렬 미지원).
3. 노드 최소 타입은 `Start`, `AgentTask`, `Condition`, `End`로 한다.
4. 실패 정책은 `fail-fast`로 한다(실패 즉시 중단, 자동 재시도 없음).
5. 재실행은 사용자 수동 트리거로만 허용한다.

## Rationale

1. 비개발자 관점에서 플로우 이해/수정/디버깅 난이도를 낮춘다.
2. 병렬/합류/경합 규칙 부재로 인한 불확실성을 제거한다.
3. MVP에서 빠른 구현과 높은 첫 성공률 달성에 유리하다.

## Consequences

긍정 효과:

1. 실행 추적과 에러 포인트 식별이 단순해진다.
2. 사용자 교육과 온보딩 문서 작성이 쉬워진다.

제약:

1. 고급 사용자 시나리오(병렬 fan-out/fan-in)는 표현할 수 없다.
2. 긴 실행 시간 최적화(동시 처리)는 후속 단계로 이관된다.

## Scope

포함:

1. DAG 유효성 검사(사이클 금지)
2. 순차 실행 스케줄링
3. 최소 노드 4종의 실행 의미 정의
4. fail-fast 및 수동 재실행 UX

제외:

1. 병렬 실행 및 합류(join) 정책
2. 자동 재시도/백오프 전략
3. 분산/원격 실행

## Related Decisions

1. [ARD-0001-mvp-distribution-and-installation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0001-mvp-distribution-and-installation.md)
2. [ARD-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0002-domain-model.md)
3. [ARD-0003-skill-canonical-and-gui-meta-separation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0003-skill-canonical-and-gui-meta-separation.md) (Superseded)
4. [ARD-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0005-failure-taxonomy-and-error-ux.md)
5. [ARD-0007-skill-json-single-source-and-md-generation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0007-skill-json-single-source-and-md-generation.md)
6. Superseded by: [ARD-0018-action-only-workflow-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0018-action-only-workflow-model.md)

## Options / Ideas (Non-MVP)

1. 병렬 실행 모드(`execution_mode: parallel`)를 확장한다.
2. 합류 정책(`join_policy`)을 도입한다(예: all_success, any_success).
3. 재시도 정책(`retry_policy`)을 노드 단위로 확장한다.
4. 확장 필드는 `SKILL.json.workflow`/`SKILL.json.policy`에서 관리한다.

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. MVP 범위에서 순차 실행 우선 원칙에 대한 팀 합의
  2. 병렬/재시도 기능의 Non-MVP 분류에 대한 팀 합의
- Accepted -> Superseded 조건:
  1. 병렬 실행을 MVP 또는 차기 릴리즈 필수로 승격할 때
