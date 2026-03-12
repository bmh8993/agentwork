# ARD-0006: SKILL-META.md 최소 스키마와 좌표 규칙 (MVP)

- Status: Superseded
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

ARD-0003에서 `SKILL.md`(canonical)와 `SKILL-META.md`(GUI 메타) 분리를 확정했다.
이제 캔버스 노드/엣지와 좌표를 어떤 스키마로 저장할지 고정해야 구현이 가능하다.
또한 좌표 규칙은 직관적이고 재현 가능해야 하므로 검증된 워크플로우 에디터 패턴을 참고할 필요가 있다.

본 결정은 ARD-0007에서 `SKILL-META.md` 비사용 및 `SKILL.json` 단일 SoT 정책으로 대체되었다.

## Decision

MVP에서 `SKILL-META.md`는 아래 최소 스키마를 사용한다.

핵심 결정 사항:

1. 최상위 필수 키는 `skill_id`, `meta_version`, `canvas`, `graph`로 고정한다.
2. `canvas`는 `grid_size`, `snap_to_grid`, `viewport`를 포함한다.
3. `graph.nodes[*]`는 최소 `id`, `type`, `position`, `data`를 가진다.
4. `graph.edges[*]`는 최소 `id`, `source`, `target`, `branch`를 가진다.
5. 좌표 `position`은 `[x, y]` 정수 배열로 저장한다.
6. 기본 좌표 단위는 `grid_size=16`, `snap_to_grid=true`로 고정한다.
7. 미인식 필드(unknown keys)는 읽을 때 무시한다(Forward compatibility).

## Minimal Shape

```yaml
skill_id: "skill-<uuid>"
meta_version: "1"
canvas:
  grid_size: 16
  snap_to_grid: true
  viewport:
    x: 0
    y: 0
    zoom: 1
graph:
  nodes:
    - id: "n1"
      type: "Start|AgentTask|Condition|End"
      position: [176, 240]
      data:
        label: "Start"
        agent_ref: null
        prompt_file: null
        tool_refs: []
        condition: null
  edges:
    - id: "e1"
      source: "n1"
      target: "n2"
      branch: "default" # default | true | false
```

## Rationale

1. 최소 키만 고정해도 캔버스 저장/복원과 실행 연결이 가능하다.
2. 좌표를 정수 + 그리드 스냅으로 고정하면 충돌 해결과 diff 가독성이 좋아진다.
3. unknown key 무시 정책으로 스키마 확장이 쉬워진다.

## Consequences

긍정 효과:

1. 구현팀이 동일한 저장 계약으로 UI/런타임을 병렬 개발할 수 있다.
2. `SKILL-META.md`가 버전업돼도 하위 호환 처리가 단순해진다.

제약:

1. `meta_version` 마이그레이션 로직이 후속으로 필요하다.
2. 병렬 실행용 필드(`join_policy`, `retry_policy`)는 Non-MVP로 남는다.

## Scope

포함:

1. `SKILL-META.md` 최소 필드 계약
2. 좌표 저장 형식과 그리드 스냅 규칙
3. forward compatibility 규칙

제외:

1. 자동 레이아웃 알고리즘
2. 병렬 실행 메타(`execution_mode=parallel`)
3. 고급 엣지 라우팅/핸들 포트 모델

## Related Decisions

1. [ARD-0003-skill-canonical-and-gui-meta-separation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0003-skill-canonical-and-gui-meta-separation.md)
2. [ARD-0004-skill-canvas-minimum-execution-rules.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0004-skill-canvas-minimum-execution-rules.md)
3. [ARD-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0005-failure-taxonomy-and-error-ux.md)
4. Superseded by: [ARD-0007-skill-json-single-source-and-md-generation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0007-skill-json-single-source-and-md-generation.md)

## References

1. n8n 좌표 타입: [Interface.ts (XYPosition, INodeUi.position)](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/Interface.ts#L150-L156)
2. n8n 그리드/스냅/신규 좌표 계산: [nodeViewUtils.ts](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/app/utils/nodeViewUtils.ts#L37-L230)
3. n8n 캔버스 스냅 옵션: [Canvas.vue](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/features/workflows/canvas/components/Canvas.vue#L977-L978)
4. n8n 삽입 시 충돌/밀어내기 처리: [useCanvasOperations.ts](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/app/composables/useCanvasOperations.ts#L1180-L1722)
5. n8n 워크플로우 좌표 저장 예시: [workflows/4.json](https://github.com/n8n-io/n8n/blob/master/packages/testing/playwright/tests/cli-workflows/workflows/4.json#L13-L24)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. 최소 스키마 키셋과 좌표 규칙에 대한 팀 합의
  2. unknown key 무시 전략에 대한 팀 합의
- Accepted -> Superseded 조건:
  1. 병렬 실행/포트 기반 라우팅을 기본 스키마로 승격할 때
