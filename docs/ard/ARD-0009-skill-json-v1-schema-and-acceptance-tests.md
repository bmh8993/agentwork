# ARD-0009: SKILL.json v1 스키마와 수용 테스트 기준

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

ARD-0008은 버전/마이그레이션 정책을 고정했다.
이 정책을 구현하려면 `SKILL.json` v1의 필드 제약과 테스트 기준이 필요하다.
기준이 없으면 구현 채널마다 검증 결과가 달라질 수 있다.

## Decision

MVP에서 `SKILL.json` v1의 JSON Schema와 수용 테스트 세트를 고정한다.

핵심 결정 사항:

1. `SKILL.json` v1 JSON Schema를 단일 기준으로 관리한다.
2. 필수 테스트 세트(정상/비정상/마이그레이션)를 CI 필수 게이트로 적용한다.
3. 테스트 실패 시 저장/배포를 차단한다.
4. 문서 내 최소 유효 예시(JSON)를 기준 샘플로 함께 관리한다.
5. `skill.content_md`는 OpenCode `SKILL.md` 본문과 의미적으로 대응한다.
6. v1 스키마 검증과 도메인 검증을 분리한다.
   1. 스키마 검증은 구조/타입 무결성을 검증한다.
   2. 노드 타입 지원 여부는 도메인 검증에서 판단한다.
7. 비지원 노드 타입이 포함된 문서는 `Load(Open)`에서 read-only 호환 모드로 열 수 있어야 하며, `Publish`/`Run`은 차단한다.

최소 유효 예시:

```json
{
  "version": "1",
  "skill": {
    "id": "skill-refund-v1",
    "name": "Refund Verification",
    "description": "Validate refund request and route action.",
    "content_md": "## What I do\nValidate refund input and route to success/failure path."
  },
  "workflow": {
    "nodes": [
      { "id": "n_start", "name": "Start", "type": "Start", "position": [120, 180], "config": {} },
      { "id": "n_task_1", "name": "Validate Input", "type": "Agent", "position": [360, 180], "config": {} },
      { "id": "n_task_2", "name": "Create Request", "type": "Agent", "position": [600, 180], "config": {} },
      { "id": "n_end", "name": "End", "type": "End", "position": [840, 180], "config": {} }
    ],
    "edges": [
      { "id": "e1", "source_node_id": "n_start", "target_node_id": "n_task_1", "branch": "default", "source_node_name": "Start", "target_node_name": "Validate Input" },
      { "id": "e2", "source_node_id": "n_task_1", "target_node_id": "n_task_2", "branch": "default", "source_node_name": "Validate Input", "target_node_name": "Create Request" },
      { "id": "e3", "source_node_id": "n_task_2", "target_node_id": "n_end", "branch": "default", "source_node_name": "Create Request", "target_node_name": "End" }
    ],
    "layout": {
      "grid_size": 16,
      "snap_to_grid": true,
      "viewport": { "x": 0, "y": 0, "zoom": 1 }
    }
  },
  "policy": {
    "execution_mode": "sequential",
    "failure_mode": "fail_fast"
  }
}
```

## Rationale

1. 스키마 기준을 고정하면 채널별 동작 편차를 줄일 수 있다.
2. 수용 테스트가 있어야 회귀를 조기에 발견할 수 있다.
3. CI 차단으로 품질 기준을 강제할 수 있다.

## Consequences

긍정 효과:

1. 스키마 호환성 문제를 사전에 차단한다.
2. 릴리즈 품질을 일관되게 유지할 수 있다.

제약:

1. 스키마 변경 시 테스트 갱신 비용이 발생한다.
2. 초기 CI 구성 작업이 필요하다.

## Scope

포함:

1. JSON Schema v1 필드/타입/enum/required 정의
2. 수용 테스트 케이스 목록과 통과 기준
3. 단계별 수용 테스트 경계
   1. `Load(Open)` read-only 호환 모드 테스트(비지원 노드 보존)
   2. `Draft Save` 구조 무결성 테스트
   3. `Publish`/`Run` strict 도메인 검증 차단 테스트

제외:

1. v2 이상의 신규 버전 상세 스키마
2. 고급 자동 마이그레이션

## Related Decisions

1. [ARD-0008-skill-json-schema-versioning-and-migration-policy.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0008-skill-json-schema-versioning-and-migration-policy.md)
2. [ARD-0007-skill-json-single-source-and-md-generation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0007-skill-json-single-source-and-md-generation.md)

## References

1. [OpenCode Docs - Skills](https://open-code.ai/en/docs/skills)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. v1 필수/선택 필드와 제약 합의
  2. CI 필수 게이트 항목 합의
- Accepted -> Superseded 조건:
  1. 스키마 버전 전략이 재정의될 때
