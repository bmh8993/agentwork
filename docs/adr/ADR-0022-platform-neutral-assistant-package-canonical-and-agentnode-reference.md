# ADR-0022: Platform-neutral Assistant Package Canonical과 AgentNode Reference

- Status: Accepted
- Date: 2026-03-17
- Deciders: Product Owner, Builder

## Context

현재 문서와 구현은 OpenCode plugin 개념을 강하게 참고하고 있지만, 장기적으로는 OpenCode와 Claude Code 같은 여러 coding assistant로 변환 가능한 상위 canonical이 필요하다.
이 canonical은 특정 제품의 파일 배치나 호출 방식을 직접 고정하지 않고, 공통 개념인 package, agent, skill, tool, knowledge, script를 먼저 정의해야 한다.
또한 최근 합의 방향은 "Agent는 재사용 가능한 실행 주체로 저장하고, AgentNode는 workflow 문맥에서 선택된 Agent에 action/done만 덧붙인다" 쪽으로 이동했다.
OpenCode는 agent에 `model`, `tools`, `permissions`를 둘 수 있고, Claude Code도 subagent와 skill, slash command, MCP 같은 별도 실행/호출 계층을 가진다.
이 차이를 제품별 세부 포맷으로 직접 박아 넣기보다, 플랫폼-중립 canonical과 변환 규칙으로 정리할 필요가 있다.
이 결정을 통해 `Package`, `Agent`, `Skill`, `Tool`, `Knowledge`, `Script`, `AgentNode`의 책임과 변환 경계를 다시 정리할 필요가 있다.
또한 `AgentNode`가 `agent_ref`를 통해 독립 Agent를 참조하려면, package 안의 자산 목록과 런타임 실행 대상을 안정적으로 lookup할 수 있는 `Catalog` 개념이 필요하다.

## Decision

내부 canonical 저장 단위는 특정 제품의 plugin이 아니라 플랫폼-중립 `Assistant Package`로 고정한다.
`Assistant Package`는 재사용 가능한 `Agent`, `Skill`, `Tool`, `Knowledge`, `Script` 자산의 보관 단위로 사용한다.
`Skill` 내부의 `AgentNode`는 독립 Agent 본문을 직접 정의하지 않고, package catalog의 Agent를 `agent_ref`로 참조한다.
`AgentNode`의 node-level 필수 입력은 `agent_ref`, `action_text`, `done_criteria` 3종으로 고정한다.
OpenCode, Claude Code 등 개별 coding assistant 포맷은 canonical에서 직접 편집하지 않고 변환 규칙으로 생성한다.
`Catalog`는 package 안의 재사용 자산과 런타임 실행 대상을 참조 가능한 목록으로 유지하는 공통 개념으로 사용한다.

핵심 결정 사항:

1. 상위 canonical 엔티티는 `Assistant Package`, `Agent`, `Skill`, `Tool`, `Knowledge`, `Script` 6종으로 고정한다.
2. `Assistant Package`는 설치/배포/변환 단위이며, 재사용 가능한 자산의 보관 단위로 사용한다.
3. `Agent`는 package 내부에 저장되는 재사용 가능한 역할/능력 단위로 정의한다.
4. `Skill.workflow.nodes[*].type="Agent"` 노드는 내부적으로 `AgentNode`로 해석한다.
5. `AgentNode`는 독립 Agent 본문을 저장하지 않고 `agent_ref`로 package catalog의 Agent를 참조한다.
6. `agent_ref`는 문자열보다 package/name을 분리한 객체 shape를 우선한다.
7. `AgentNode`의 node-level 필수 필드는 `agent_ref`, `action_text`, `done_criteria`다.
8. `Action`과 `Done Criteria`의 소유권은 계속 `AgentNode`에 둔다.
9. `Agent`는 실행 주체의 재사용 가능한 설정 묶음으로서 `description`, `instructions/prompt`, `model`, model/provider options, `tools`, tool permissions, skill permissions, sampling/runtime options, `knowledge_refs`를 소유할 수 있다.
10. `Skill`은 조합과 실행 구조를 소유하며, `metadata`, 설명 본문, workflow graph, execution/failure policy를 가진다.
11. `AgentNode`는 `Agent`의 정체성과 실행 설정을 재정의하지 않고, workflow 문맥의 `action_text`와 `done_criteria`만 추가한다.
12. model 선택 기본 소유권은 `Agent`에 두고, `Skill` 또는 `AgentNode`의 per-node model override는 현재 범위에 포함하지 않는다.
13. `Script`는 package 자산으로 취급한다.
14. 재사용 가능한 실행 script의 권장 배치 위치는 package 루트 기준 `scripts/` 디렉토리다.
15. `Tool`은 capability definition과 실제 실행 target을 소유하며, 필요 시 `Script`를 참조한다.
16. `Skill`은 script 경로를 직접 소유하지 않고, Agent가 참조하는 Tool 정의를 통해 간접 참조한다.
17. `Skill`의 호출 방식은 플랫폼별 명령 형식으로 canonical에 직접 고정하지 않고, `when_to_use`와 `activation_hints` 같은 의도 중심 메타데이터로 표현한다.
18. OpenCode, Claude Code 등 개별 대상 포맷은 canonical export/import transform rule로 관리한다.
19. transform rule은 지원되지 않는 필드를 silent drop하지 않고 warning으로 기록한다.
20. OpenCode plugin/skill/agent 모델과 Claude Code skill/subagent/command 모델은 canonical의 주요 변환 대상으로 포함한다.
21. `agent_ref`의 canonical shape는 `{ package: string, name: string }` 객체로 고정한다.
22. canonical package layout의 기본 디렉토리는 `agents/`, `skills/`, `tools/`, `knowledge/`, `scripts/`로 고정한다.
23. canonical package manifest는 package 식별자, 버전, 대상 assistant export 설정, 자산 인덱스를 포함할 수 있다.
24. OpenCode export는 package 자산을 OpenCode plugin/agent/skill 구조로 변환한다.
25. Claude Code export는 package 자산을 Claude Code subagent/skill/command 구조로 변환한다.
26. transform 과정에서 직접 대응되지 않는 canonical 필드는 warning과 함께 보존 또는 생략 정책을 명시적으로 기록한다.
27. `Catalog`는 package 자산을 참조 가능한 목록으로 유지하는 도메인 개념으로 포함한다.
28. `AgentCatalog`는 package 안의 `Agent`, `Tool`, `Knowledge`, `Script` 자산을 식별자 기준으로 lookup 가능한 상태로 유지한다.
29. `AgentExecutorCatalog`는 런타임에서 `agent_ref`를 실제 executor adapter로 해석하기 위한 실행용 catalog로 둔다.
30. 도메인 catalog와 런타임 executor catalog는 역할은 다르지만, 둘 다 `agent_ref` resolution을 지원하는 같은 계열의 catalog 개념으로 본다.

## Rationale

1. 같은 Agent를 여러 Skill과 여러 AgentNode에서 재사용할 수 있다.
2. `Agent` 정체성과 `AgentNode` 실행 의도를 분리하면 사용자의 멘탈 모델이 더 선명해진다.
3. OpenCode와 Claude Code를 모두 수용할 수 있는 상위 canonical을 가지면 플랫폼 종속성을 줄일 수 있다.
4. UI를 `Agent 선택 + Action/Done 입력`으로 단순화할 수 있다.
5. 현재처럼 node마다 Knowledge/Tool을 반복 입력하는 부담을 줄일 수 있다.
6. script를 package 경계에 두면 경로, 권한, 배포, 재사용 정책을 Tool/Agent 모델과 함께 관리할 수 있다.
7. model과 tool access를 Agent 소유로 두면 같은 Agent를 여러 Skill에서 일관되게 재사용할 수 있다.
8. activation intent를 추상화하면 Claude Code의 slash command, OpenCode의 skill tool 같은 차이를 변환 계층에서 처리할 수 있다.
9. `agent_ref`와 canonical layout을 고정하면 schema, UI, export 구현이 같은 참조 규칙을 공유할 수 있다.
10. `Catalog`를 명시적 개념으로 두면 도메인 자산 목록과 런타임 lookup 구조가 같은 용어 체계 안에서 정리된다.

## Consequences

긍정 효과:

1. 독립 Agent 저장/선택/재사용 시나리오를 제품 모델에 직접 반영할 수 있다.
2. package catalog와 workflow editor 사이의 역할 분리가 명확해진다.
3. OpenCode, Claude Code 등 여러 coding assistant 포맷으로 export/import할 수 있는 구조를 마련할 수 있다.
4. script 자산의 배치 규칙이 고정되어 Tool 실행 경로를 예측하기 쉬워진다.
5. renderer의 `AgentCatalog`와 orchestrator의 `AgentExecutorCatalog`를 같은 참조 모델 아래에서 구현할 수 있다.

제약:

1. `SKILL.json` v1 schema, renderer/store, validator, fixture를 함께 수정해야 한다.
2. `agent_ref`의 shape와 resolution 규칙을 별도 계약으로 고정해야 한다.
3. 기존 `knowledge_refs`, `tool_refs` node-level 계약과 충돌 가능성이 있다.
4. canonical manifest와 대상 플랫폼별 export shape를 추가로 결정해야 한다.
5. Tool이 script를 참조하는 상세 필드 shape와 실행 규칙은 후속 계약이 필요하다.
6. 어떤 agent 설정을 manifest에 inline으로 둘지, 어떤 설정을 별도 파일로 분리할지 후속 결정이 필요하다.
7. 각 플랫폼 export가 완전 대응되지 않는 필드의 손실/경고 정책을 운영해야 한다.
8. Claude Code와 OpenCode의 세부 포맷이 진화할 경우 transform 규칙 유지보수 비용이 발생한다.
9. catalog의 저장 shape와 runtime projection shape를 혼동하지 않도록 문서와 코드에서 역할 구분을 유지해야 한다.

## Scope

포함:

1. 플랫폼-중립 assistant package canonical 도입
2. `AgentNode = agent_ref + action_text + done_criteria` 모델
3. Agent 카드 기본 UX를 Agent 선택 중심으로 재정의
4. `Agent`, `Package`, `Skill`, `Tool`, `Knowledge`, `Script`, `AgentNode` 책임 경계 재정리
5. 재사용 가능한 script를 package 자산으로 두는 배치 원칙
6. `Agent` 소유 설정과 `Skill` 소유 설정의 기본 경계
7. OpenCode / Claude Code 변환 규칙의 기본 원칙
8. `agent_ref` canonical shape와 package 기본 layout
9. package 자산 catalog와 runtime executor catalog의 개념적 위치

제외:

1. canonical manifest의 상세 Agent schema 확정
2. `agent_ref` naming rule과 resolution algorithm 상세 확정
3. Agent override/partial override 정책
4. 기존 데이터 마이그레이션 절차 확정
5. marketplace UI 도입
6. Tool의 상세 실행 스펙과 script sandbox 정책
7. Agent schema의 상세 직렬화 포맷
8. OpenCode / Claude Code export/import 세부 매핑 표
9. catalog persistence format과 cache invalidation 상세 정책

## Related Decisions

1. [ADR-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0002-domain-model.md)
2. [ADR-0010-plugin-package-layout-and-manifest.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0010-plugin-package-layout-and-manifest.md)
3. [ADR-0016-mvp-plugin-install-channels-local-and-npm.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0016-mvp-plugin-install-channels-local-and-npm.md)
4. [ADR-0017-agent-card-ux-and-chat-refinement.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0017-agent-card-ux-and-chat-refinement.md)
5. [ADR-0020-agentnode-composition-and-action-ownership.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0020-agentnode-composition-and-action-ownership.md)
6. [ADR-0021-agentnode-resource-reference-shape.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0021-agentnode-resource-reference-shape.md)
7. If accepted, this ADR partially supersedes the node-owned resource interpretation in [ADR-0021-agentnode-resource-reference-shape.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0021-agentnode-resource-reference-shape.md).
8. This ADR expands the OpenCode-inspired plugin interpretation into a platform-neutral canonical with transform rules for multiple coding assistants.

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. (Satisfied) 플랫폼-중립 canonical 엔티티 집합(`Package`, `Agent`, `Skill`, `Tool`, `Knowledge`, `Script`)에 합의
  2. (Satisfied) `AgentNode` 필수 필드를 `agent_ref`, `action_text`, `done_criteria`로 보는 데 합의
  3. (Satisfied) model/tools/permissions/knowledge의 기본 소유권을 `Agent`로 두는 데 합의
  4. (Satisfied) `Skill` 호출을 플랫폼 명령이 아니라 activation intent로 추상화하는 데 합의
  5. (Satisfied) 후속 schema/UI/validation/export 변경 범위를 수용하는 데 합의
- Accepted -> Superseded 조건:
  1. canonical package를 다른 상위 저장 단위로 대체할 때
  2. AgentNode가 `agent_ref` 대신 독립 Agent 본문을 다시 직접 저장할 때
