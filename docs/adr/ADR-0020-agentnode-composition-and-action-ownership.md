# ADR-0020: AgentNode 조합 단위와 Action 소유권 명확화

- Status: Accepted
- Date: 2026-03-17
- Deciders: Product Owner, Builder

## Context

ADR-0002는 `Agent`와 `Skill`을 분리했지만, Skill 내부에서 Agent가 어떤 단위로 배치되고 구체화되는지는 별도 엔티티로 명시하지 않았다.
반면 현재 구현과 ADR-0017은 `action_text`, `done_criteria`를 `SKILL.json.workflow.nodes[*].config`에 저장한다.
이 때문에 `Action`이 Agent 자체 속성인지, Skill 내부 단계 속성인지 해석 혼선이 생긴다.
이 혼선은 Agent 재사용, 그래프 표현, 향후 병렬 실행 확장 논의에서 경계 모호성을 만든다.
도메인 모델과 현재 구현을 같은 언어로 정렬할 보강 결정이 필요하다.

## Decision

Skill 조합의 내부 실행 단위는 `Agent`가 아니라 `AgentNode`로 고정한다.
`Action`과 `Done Criteria`는 `Agent`가 아니라 `Skill` 내부의 `AgentNode` 설정에 귀속한다.
현재 MVP canonical에서 `AgentNode`는 별도 스키마 타입 추가가 아니라 `workflow.nodes[*]` 중 `type="Agent"`인 노드의 도메인 해석으로 취급한다.

핵심 결정 사항:

1. `Agent`는 재사용 가능한 역할/능력 단위로 유지한다.
2. `Skill`은 `Node`와 `Edge`로 구성된 워크플로우이며, Agent는 `AgentNode`를 통해 Skill에 참여한다.
3. 현재 MVP에서 `AgentNode`는 `workflow.nodes[*]`의 `Agent` 타입 노드이며, node-level 설정으로 `action_text`, `done_criteria`와 knowledge/tool 관련 값을 가진다.
4. `Action`의 소유자는 `Agent`가 아니라 `AgentNode`다.
5. 순차/병렬 등 실행 구조는 `Agent`가 아니라 `Skill` 그래프와 실행 정책의 책임으로 둔다.
6. 사용자 UX 용어 `Agent 카드`는 유지할 수 있다. 다만 내부 문서/타입/검증에서는 이를 `AgentNode` 의미로 해석한다.
7. `agent_ref` 같은 명시적 Agent 참조 필드는 현재 MVP canonical에 포함하지 않는다. 이는 Agent 재사용 모델을 실제 스키마로 도입할 때의 후속 확장 항목이다.
8. `knowledge`/`tool` node config shape는 이번 ADR에서 의도적으로 제외한다. 현재 구현 필드와 ADR-0017 계약 간 정렬은 별도 후속 ADR인 [ADR-0021-agentnode-resource-reference-shape.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0021-agentnode-resource-reference-shape.md) 에서 다룬다.

## Rationale

1. 같은 Agent를 여러 Skill에서 재사용할 때 Action이 Agent 자체에 붙어 있으면 재사용성이 급격히 떨어진다.
2. 현재 구현은 이미 `action_text`와 `done_criteria`를 node config에 저장하고 있어, 이 결정이 코드와 더 잘 맞는다.
3. 그래프 기반 모델에서 병렬/합류/의존성은 Agent 속성보다 Node와 Edge 관계로 표현하는 편이 자연스럽다.
4. `Agent 카드` UX를 유지하면서도 내부 모델 경계를 분리하면 사용자 멘탈 모델과 구현 모델을 동시에 보존할 수 있다.
5. 현재 canonical에 없는 `agent_ref`까지 즉시 결정 범위에 넣으면 문서가 구현을 앞지르게 되므로, 현재 해석과 미래 확장을 분리할 필요가 있다.

## Consequences

긍정 효과:

1. `Agent`, `Skill`, `Action`의 책임 경계가 명확해진다.
2. 동일 Agent의 다중 Skill 재사용과 향후 병렬 실행 확장 논의가 쉬워진다.
3. 현재 코드의 node-config 저장 방식과 ADR 해석이 정렬된다.

제약:

1. 기존 Accepted ADR과 병행 읽을 때 해석 충돌이 생길 수 있으므로, supersede되는 해석 범위를 이 ADR의 Related Decisions로 함께 읽어야 한다.
2. 내부 타입/주석/테스트 이름 일부는 후속 정비가 필요할 수 있다.
3. `knowledge`/`tool` 단일 필드와 `knowledge_refs`/`tool_refs` 계약 차이는 이 ADR 범위 밖이며, [ADR-0021-agentnode-resource-reference-shape.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0021-agentnode-resource-reference-shape.md) 없이는 해소되지 않는다.

## Scope

포함:

1. `Agent`와 `AgentNode`의 역할 분리
2. `Action`과 `Done Criteria`의 node-level 소유권 명확화
3. Skill 그래프와 실행 구조 책임 위치 명확화
4. `Agent 카드` UX 용어와 내부 도메인 모델의 대응 규칙
5. 현재 MVP canonical에서 `AgentNode`를 해석하는 규칙

제외:

1. MVP에 병렬 실행을 즉시 도입하는 결정
2. `SKILL.json` 스키마 버전 변경
3. `agent_ref` 같은 명시적 Agent 참조 필드 도입
4. `knowledge_refs`/`tool_refs` 구체 필드 형태 확정
5. UI 라벨을 즉시 `AgentNode`로 변경하는 작업

## Related Decisions

1. [ADR-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0002-domain-model.md)
2. [ADR-0017-agent-card-ux-and-chat-refinement.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0017-agent-card-ux-and-chat-refinement.md)
3. [ADR-0018-action-only-workflow-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0018-action-only-workflow-model.md)
4. This ADR partially supersedes the `조합은 Agent 단위로 수행한다` interpretation in [ADR-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0002-domain-model.md). 설치/실행/공유 단위 구분 자체는 유지하고, Skill 내부 조합 단위 해석만 `AgentNode` 기준으로 보강한다.
5. This ADR partially supersedes the `Agent의 실행 의도는 Action 텍스트로 정의한다` interpretation in [ADR-0018-action-only-workflow-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0018-action-only-workflow-model.md). Action-only 모델 자체는 유지하고, Action 소유권만 `AgentNode` 기준으로 보강한다.
6. Follow-up ADR: [ADR-0021-agentnode-resource-reference-shape.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0021-agentnode-resource-reference-shape.md).

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. (Satisfied) `Agent 카드`를 내부적으로 `AgentNode`로 해석하는 데 제품/구현 합의
  2. (Satisfied) `Action` 소유권을 node-level로 본다는 데 도메인 합의
  3. (Satisfied) `ADR-0002`, `ADR-0018`과의 supersede 처리 방식 합의
  4. (Satisfied) [ADR-0021-agentnode-resource-reference-shape.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0021-agentnode-resource-reference-shape.md)를 함께 검토하고, knowledge/tool shape를 `0020` acceptance 범위 밖으로 둔다는 데 합의
- Accepted -> Superseded 조건:
  1. Agent 자체가 실행 단계 정의를 직접 소유하는 별도 모델로 전환할 때
