# ADR-0017: Agent 카드 중심 UX와 채팅 구체화 플로우

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

비개발자 관점에서 워크플로우를 노드 타입 중심으로 설계하면 학습 비용이 높다.
사용자 멘탈 모델은 "캐릭터(Agent)에게 지식/도구/행동을 부여하고 연결한다"에 가깝다.
따라서 캔버스는 Agent 중심으로 단순화하고, 상세 설정은 대화형으로 보완할 필요가 있다.

## Decision

MVP 빌더 UX는 Agent 카드 중심으로 구성하고, LLM 가이드 기반 사이드바 채팅으로 필수 구성을 구체화한다.

핵심 결정 사항:

1. 캔버스의 기본 작업 단위는 `Agent 카드`로 고정한다.
2. Agent 카드 필수 슬롯은 `Knowledge`, `Tool`, `Action`, `Done Criteria`로 고정한다.
3. `Action`과 `Done Criteria`는 필수 입력으로 강제한다.
4. 상세 설정은 LLM 가이드가 있는 사이드바 채팅 UI에서 질문/응답으로 채운다.
5. LLM 구체화 실패 시 수동 fallback 입력 경로는 MVP에 도입하지 않는다. 사용자는 재시도만 할 수 있다.
6. 임시 저장(Draft Save)은 허용한다.
7. Publish(실행 가능 상태 저장)는 필수 슬롯이 모두 채워지지 않으면 차단하고 누락 항목을 안내한다.
8. 슬롯 데이터는 `SKILL.json` v1의 `workflow.nodes[*].config`에 아래 키로 저장한다.
   1. `action_text` (`string`, required for Agent node publish)
   2. `done_criteria` (`string`, required for Agent node publish)
   3. `knowledge_refs` (`string[]`, default `[]`)
   4. `tool_refs` (`string[]`, default `[]`)
9. 내부 canonical은 구조화 JSON으로 유지하고, `SKILL.md`는 설명형으로 생성한다.
10. `Draft Save`와 `Publish`의 시스템 경계를 아래로 고정한다.
   1. `Draft Save`는 작성 중 상태 저장이며 실행 가능 상태를 보장하지 않는다.
   2. `Publish`는 실행 가능 상태 판정을 위한 검증 게이트다.
   3. `Publish`는 파일 포맷 버전을 변경하지 않는다(`SKILL.json.version` 유지).
   4. `Publish` 통과 조건은 v1 구조 검증 + Agent 노드의 `action_text`/`done_criteria` 충족이다.

## Rationale

1. Agent 중심 모델은 비개발자에게 직관적이다.
2. LLM 가이드 채팅은 복잡한 폼 입력보다 진입 장벽이 낮다.
3. Draft Save와 Publish 게이트 분리는 작성 연속성과 실행 안정성을 동시에 보장한다.
4. 슬롯 매핑 키를 고정하면 UI/검증/런타임 간 계약이 명확해진다.
5. Draft/Publish 경계 명시는 저장 모델과 실행 모델의 책임을 분리한다.

## Consequences

긍정 효과:

1. 캔버스 학습 비용이 낮아진다.
2. 필수 정보 누락으로 인한 실행 실패가 감소한다.
3. Draft 단계에서 중간 작업을 보존할 수 있다.

제약:

1. 채팅 구체화 품질에 따라 작성 시간이 달라질 수 있다.
2. MVP에서는 수동 fallback이 없어 LLM 구체화 실패 시 재시도가 필요하다.
3. 슬롯 모델 변경 시 UI/데이터 모델 동시 수정이 필요하다.

## Scope

포함:

1. Agent 카드 중심 캔버스 인터랙션
2. 필수 슬롯 4종(`Knowledge`, `Tool`, `Action`, `Done Criteria`)
3. LLM 가이드 채팅 기반 구체화
4. Draft Save 허용 및 Publish 검증 게이트
5. `workflow.nodes[*].config` 슬롯 매핑 키 계약

제외:

1. 고급 워크플로우 타입의 직접 노출 UI
2. 자동 플로우 생성 고도화(자율 리팩터링)
3. LLM 실패 시 수동 fallback 입력 경로

## Related Decisions

1. [ADR-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0002-domain-model.md)
2. [ADR-0007-skill-json-single-source-and-md-generation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0007-skill-json-single-source-and-md-generation.md)
3. [ADR-0009-skill-json-v1-schema-and-acceptance-tests.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0009-skill-json-v1-schema-and-acceptance-tests.md)
4. [ADR-0015-node-type-catalog-and-extension-policy.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0015-node-type-catalog-and-extension-policy.md)
5. [ADR-0018-action-only-workflow-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0018-action-only-workflow-model.md)

## References

1. [OpenWork repository](/Users/zayden.ok/Desktop/dev-others/openwork)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. (Satisfied) Agent 카드 필수 슬롯 4종 합의
  2. (Satisfied) Draft Save / Publish 게이트 및 LLM 가이드 플로우 합의
- Accepted -> Superseded 조건:
  1. 빌더 UX가 노드 타입 직접 편집 중심으로 전환될 때
