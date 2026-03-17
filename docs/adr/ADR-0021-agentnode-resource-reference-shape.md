# ADR-0021: AgentNode 리소스 참조 필드 shape 고정

- Status: Accepted
- Date: 2026-03-17
- Deciders: Product Owner, Builder

## Context

ADR-0020은 `Action`과 `Done Criteria`의 소유자를 `AgentNode`로 명확히 했지만, AgentNode가 참조하는 Knowledge/Tool의 필드 shape는 의도적으로 미확정으로 남겼다.
ADR-0017은 `knowledge_refs`, `tool_refs` 배열을 계약으로 적고 있지만, 현재 renderer 구현과 일부 fixture는 `knowledge`, `tool` 단일 문자열 필드를 사용한다.
새로 정리한 도메인 모델에서는 Skill 조합이 `AgentNode` 단위로 이루어지고, Knowledge와 Tool은 재사용 가능한 named resource 참조로 읽히는 편이 더 자연스럽다.
이 상태를 그대로 두면 UI 구현, fixture, ADR 해석이 서로 다른 계약을 암묵적으로 가리키게 된다.
AgentNode resource config의 canonical shape를 별도 ADR로 고정할 필요가 있다.

## Decision

AgentNode가 참조하는 Knowledge와 Tool의 canonical shape는 `knowledge_refs`, `tool_refs` 배열로 고정한다.
현재 `knowledge`, `tool` 단일 문자열 필드는 임시 구현 표현으로 간주하며, canonical 계약으로 채택하지 않는다.

핵심 결정 사항:

1. `workflow.nodes[*].config.knowledge_refs`는 `string[]`로 정의한다.
2. `workflow.nodes[*].config.tool_refs`는 `string[]`로 정의한다.
3. 빈 값의 기본값은 각각 `[]`다.
4. `knowledge_refs`, `tool_refs`는 AgentNode가 사용하는 리소스 참조 집합이며, free-text 설명 필드로 사용하지 않는다.
5. 현재 구현의 `knowledge`, `tool` 단일 문자열 필드는 전환 대상이다.
6. MVP Publish 필수 조건은 계속 `action_text`, `done_criteria`만 유지한다. `knowledge_refs`, `tool_refs`는 optional이다.
7. UI는 단일 입력에서 시작할 수 있다. 다만 저장 canonical은 `*_refs` 배열로 맞춘다.
8. `knowledge_refs`의 각 값은 파일 경로가 아니라 knowledge unit의 stable name을 사용한다.
9. `tool_refs`의 각 값은 tool capability의 stable id 또는 name을 사용한다.
10. 파일 경로는 ref 값 자체가 아니라, 해당 knowledge unit 정의 내부 속성으로 둔다.

## Rationale

1. Knowledge와 Tool은 재사용 가능한 named resource 참조로 보는 편이 `Agent`, `AgentNode`, `Skill`의 책임 분리와 잘 맞는다.
2. Claude Code와 OpenCode 모두 지식/도구 연결을 파일 경로보다 named unit 또는 capability 이름으로 다루는 경향이 있어, stable name/id 참조가 더 자연스럽다.
3. 배열 shape는 향후 다중 Knowledge/Tool 연결을 허용하며, 현재 도메인 모델의 확장 방향과도 일치한다.
4. ADR-0017이 이미 `knowledge_refs`, `tool_refs`를 제시하고 있어, 이 결정을 채택하면 도메인/UX 문서가 더 일관된다.
5. `knowledge`, `tool` 단일 문자열은 표시와 입력은 간단하지만, 참조와 설명을 혼합해 해석 모호성을 만든다.

## Consequences

긍정 효과:

1. AgentNode config의 canonical 계약이 `Action`/`Done Criteria`와 동일하게 node-level에서 명확해진다.
2. 향후 Agent/Knowledge/Tool 재사용 모델과 다중 참조 확장이 쉬워진다.
3. ADR-0017과 새 도메인 모델이 같은 shape를 가리키게 된다.
4. 경로 rename이나 구현 위치 변경이 ref 값에 직접 영향을 주지 않게 된다.

제약:

1. renderer 타입, 폼, node preview, fixture, installer fixture를 후속 구현에서 바꿔야 한다.
2. 단일 문자열만 입력하던 현재 UI는 배열 기반 저장으로의 변환 계층이 필요하다.
3. knowledge unit stable name과 tool stable id/name의 naming rule은 후속 구현/계약 정리가 필요하다.

## Scope

포함:

1. AgentNode Knowledge/Tool canonical 필드명과 타입 결정
2. 현재 `knowledge`/`tool` 단일 문자열 필드의 전환 대상화
3. Publish 필수 여부와 별개로 optional ref 필드 계약 명확화

제외:

1. stable name/id의 상세 naming rule
2. Agent 재사용용 `agent_ref` 필드 도입
3. UI 입력 컴포넌트의 상세 UX
4. 실제 데이터 마이그레이션 절차

## Related Decisions

1. [ADR-0017-agent-card-ux-and-chat-refinement.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0017-agent-card-ux-and-chat-refinement.md)
2. [ADR-0020-agentnode-composition-and-action-ownership.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0020-agentnode-composition-and-action-ownership.md)
3. This ADR supersedes the `knowledge`/`tool` single-string interpretation used by current renderer implementation and fixtures.
4. Follow-up implementation should align renderer/store/fixtures with `knowledge_refs` and `tool_refs`.

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. (Satisfied) AgentNode resource config canonical을 `*_refs` 배열로 고정하는 데 제품/구현 합의
  2. (Satisfied) 현재 `knowledge`/`tool` 단일 문자열 구현을 전환 대상으로 보는 데 합의
- Accepted -> Superseded 조건:
  1. AgentNode resource config를 다른 canonical shape로 대체할 때
