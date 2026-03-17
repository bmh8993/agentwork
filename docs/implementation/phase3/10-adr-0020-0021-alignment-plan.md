# ADR-0020/0021 Alignment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align renderer, fixtures, schema-adjacent contracts, and validation flow with ADR-0020 (`AgentNode` interpretation) and ADR-0021 (`knowledge_refs` / `tool_refs` canonical shape).

**Architecture:** Keep the current `Start` / `Agent` / `End` graph model and reinterpret `type="Agent"` nodes as `AgentNode` at the domain level. Move UI/store/fixture storage from `knowledge` / `tool` strings to `knowledge_refs` / `tool_refs` arrays while preserving `action_text` and `done_criteria` publish behavior. Update documentation-adjacent type contracts first, then UI/store, then fixtures/tests, then schema/domain checks only where required by the new canonical.

**Tech Stack:** TypeScript, React, Zustand, Zod, Vitest, JSON fixtures, pnpm

---

## Goal

ADR-0020/0021에서 확정한 도메인 모델과 resource ref shape를 현재 코드와 테스트 자산에 반영한다.

## Scope In

1. `Agent` 노드의 내부 해석을 `AgentNode` 기준으로 정리
2. renderer/store/type에서 `knowledge_refs` / `tool_refs` 배열 canonical 반영
3. Agent 카드 입력 UX를 canonical 저장 구조에 맞게 조정
4. fixture/test-gate 자산을 새 config shape로 정렬
5. 필요 시 schema/domain validation 보강
6. 관련 구현 문서/주석/handoff 문구 정리

## Scope Out

1. `agent_ref` 필드 도입
2. 병렬 실행 모델 도입
3. `knowledge_refs` / `tool_refs` naming rule 상세 규격 확정
4. 외부 plugin resource registry 설계
5. 실제 migration CLI 또는 data migration automation

## File Map

### Domain and Type Contract

- Modify: `packages/renderer/src/types/workflow.ts`
  - `config.knowledge` / `config.tool`을 `knowledge_refs?: string[]` / `tool_refs?: string[]`로 변경
  - 주석을 `AgentNode` 해석에 맞게 정리
- Modify: `packages/renderer/src/lib/validation.ts`
  - UI workflow -> `SKILL.json` 변환 시 array shape를 canonical로 전달

### Renderer UI

- Modify: `packages/renderer/src/components/AgentCardEditor.tsx`
  - 단일 문자열 입력 UX를 유지할지, 간단한 multi-value UX로 바꿀지 결정 후 canonical 저장은 배열로 맞춤
- Modify: `packages/renderer/src/components/nodes/AgentNode.tsx`
  - node preview가 `knowledge_refs` / `tool_refs` 배열을 표시하도록 변경
- Modify: `packages/renderer/src/store/workflowStore.ts`
  - 기본 node update 흐름이 배열 config를 손상하지 않도록 확인

### Fixtures and Tests

- Modify: `test-gates/run/fixtures/valid-workflow.json`
- Modify: `test-gates/run/fixtures/invalid-missing-action.json`
- Modify: `test-gates/installer/fixtures/valid-skill/SKILL.json`
- Modify: `fixtures/skill-json/v1/valid-minimal.json` (필요 시 canonical 예제 보강)
- Modify: `packages/renderer/src/store/__tests__/workflowStore.test.ts`
- Modify: `test-gates/contract/publish.test.ts` (resource ref optional 유지 확인)
- Modify: 관련 UI test-gates (`test-gates/ui-errors/*`) if any assertions rely on old fields

### Schema / Validation / Docs

- Inspect and modify if needed: `packages/skill-schema/src/v1.schema.json`
  - 현재 `config`가 자유 객체라면 스키마 수정 없이 유지 가능
  - strict object properties를 추가하기로 결정하면 여기서 반영
- Inspect and modify if needed: `packages/skill-domain/src/index.ts`
  - publish gate가 `action_text` / `done_criteria`만 강제함을 유지
- Modify: `docs/implementation/IMP-00-reference.md` / `docs/implementation/IMP-01-blueprint.md` if ADR baseline or implementation rules need 0020/0021 반영

## Validation Strategy

1. Publish gate는 기존과 동일하게 `action_text`, `done_criteria`만 필수여야 한다.
2. `knowledge_refs`, `tool_refs`는 optional이어야 한다.
3. 새 canonical shape가 renderer state, preview, fixture, installer fixture, run fixture 전반에서 일관되어야 한다.
4. 기존 `knowledge` / `tool` 단일 문자열에 의존한 테스트/fixture는 남지 않아야 한다.

## Open Questions

1. Agent 카드 UI는 배열 입력을 칩/토큰 방식으로 받을지, 임시로 comma-separated 단일 입력을 받아 split 저장할지
2. `v1.schema.json`에 `config` 내부 필드 shape를 명시적으로 추가할지, 현재처럼 domain-level contract로 둘지
3. `IMP-00` / `IMP-01`에 ADR-0020/0021을 이번 턴에서 바로 추가할지, 구현 후 별도 문서 턴으로 할지

## Exit Criteria

1. renderer canonical type이 `knowledge_refs` / `tool_refs` 배열 기준으로 바뀐다.
2. Agent 카드 저장 결과가 새 shape로 유지된다.
3. preview/fixture/test-gate 자산이 새 shape와 일치한다.
4. publish/run 관련 검증이 기존 동작을 유지한다.
5. old `knowledge` / `tool` canonical 사용이 테스트 대상 경로에서 제거된다.

## Artifacts

1. `packages/renderer/src/types/workflow.ts`
2. `packages/renderer/src/lib/validation.ts`
3. `packages/renderer/src/components/AgentCardEditor.tsx`
4. `packages/renderer/src/components/nodes/AgentNode.tsx`
5. `packages/renderer/src/store/workflowStore.ts`
6. `packages/renderer/src/store/__tests__/workflowStore.test.ts`
7. `test-gates/contract/publish.test.ts`
8. `test-gates/run/fixtures/valid-workflow.json`
9. `test-gates/run/fixtures/invalid-missing-action.json`
10. `test-gates/installer/fixtures/valid-skill/SKILL.json`
11. `docs/implementation/IMP-00-reference.md` (if updated)
12. `docs/implementation/IMP-01-blueprint.md` (if updated)

## Chunk 1: Type Contract and Fixtures

### Task 1: Replace renderer canonical config fields

**Files:**
- Modify: `packages/renderer/src/types/workflow.ts`
- Test: `packages/renderer/src/store/__tests__/workflowStore.test.ts`

- [ ] **Step 1: Write the failing test**

Add or extend a renderer/store test so an `Agent` node can hold:

```ts
config: {
  knowledge_refs: ['kb-refund-policy'],
  tool_refs: ['tool-file-search'],
  action_text: 'Do something',
  done_criteria: 'Done',
}
```

and the stored node preserves both arrays.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- --run packages/renderer/src/store/__tests__/workflowStore.test.ts`
Expected: FAIL because `NodeData.config` does not yet type or preserve `knowledge_refs` / `tool_refs`.

- [ ] **Step 3: Write minimal implementation**

Update `packages/renderer/src/types/workflow.ts`:

```ts
config?: {
  knowledge_refs?: string[];
  tool_refs?: string[];
  action_text?: string;
  done_criteria?: string;
};
```

Adjust comments to describe `AgentNode` config rather than old `knowledge` / `tool` strings.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- --run packages/renderer/src/store/__tests__/workflowStore.test.ts`
Expected: PASS

### Task 2: Update canonical fixtures to array refs

**Files:**
- Modify: `test-gates/run/fixtures/valid-workflow.json`
- Modify: `test-gates/run/fixtures/invalid-missing-action.json`
- Modify: `test-gates/installer/fixtures/valid-skill/SKILL.json`
- Modify: `fixtures/skill-json/v1/valid-minimal.json` (only if desired as canonical example)

- [ ] **Step 1: Write the failing test**

Add or update one contract/integration assertion that loads a fixture and expects:

```json
"config": {
  "knowledge_refs": ["kb-test-knowledge"],
  "tool_refs": ["tool-test-tool"],
  "action_text": "...",
  "done_criteria": "..."
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- --run test-gates/contract/publish.test.ts test-gates/run/strict-gate.test.ts`
Expected: FAIL or fixture/assertion mismatch because fixtures still use `knowledge` / `tool`.

- [ ] **Step 3: Write minimal implementation**

Replace old fixture fields:

```json
"knowledge": "Test knowledge",
"tool": "Test tool"
```

with:

```json
"knowledge_refs": ["kb-test-knowledge"],
"tool_refs": ["tool-test-tool"]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- --run test-gates/contract/publish.test.ts test-gates/run/strict-gate.test.ts`
Expected: PASS

## Chunk 2: Renderer UI and Preview

### Task 3: Align Agent card editor form with array canonical

**Files:**
- Modify: `packages/renderer/src/components/AgentCardEditor.tsx`
- Modify: `packages/renderer/src/lib/validation.ts`

- [ ] **Step 1: Write the failing test**

Create or extend a UI/store test that submits Agent card data and expects `updateNode` to receive:

```ts
config: {
  knowledge_refs: ['kb-refund-policy'],
  tool_refs: ['tool-file-search'],
  action_text: '...',
  done_criteria: '...',
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- --run packages/renderer/src/store/__tests__/workflowStore.test.ts`
Expected: FAIL because form default values and submit payload still use `knowledge` / `tool`.

- [ ] **Step 3: Write minimal implementation**

Pick one temporary UX strategy and document it in code comments if needed:

Option A:
- keep one text input per field
- split comma-separated input into arrays on submit
- join arrays back into comma-separated strings for default values

Option B:
- use textarea with one ref per line
- split by newline and trim empties

Store only canonical arrays in node config.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- --run packages/renderer/src/store/__tests__/workflowStore.test.ts`
Expected: PASS

### Task 4: Update Agent node preview to render ref arrays

**Files:**
- Modify: `packages/renderer/src/components/nodes/AgentNode.tsx`

- [ ] **Step 1: Write the failing test**

If node preview tests do not exist, add a focused renderer test that renders:

```ts
config: {
  knowledge_refs: ['kb-refund-policy', 'kb-api-guide'],
  tool_refs: ['tool-file-search'],
}
```

and expects both refs to display.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- --run <new-or-existing-agent-node-test>`
Expected: FAIL because component still reads `knowledge` / `tool`.

- [ ] **Step 3: Write minimal implementation**

Render `knowledge_refs?.join(', ')` and `tool_refs?.join(', ')` in place of old string fields.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- --run <new-or-existing-agent-node-test>`
Expected: PASS

## Chunk 3: Contract Validation and Docs

### Task 5: Confirm publish/run validation stays action-only for required fields

**Files:**
- Inspect and modify if needed: `packages/skill-domain/src/index.ts`
- Modify: `test-gates/contract/publish.test.ts`

- [ ] **Step 1: Write the failing test**

Add a publish contract case where `knowledge_refs` / `tool_refs` are absent but:

```ts
config: {
  action_text: 'Do the task',
  done_criteria: 'Task complete',
}
```

still passes publish.

- [ ] **Step 2: Run test to verify it fails or confirms coverage gap**

Run: `pnpm test -- --run test-gates/contract/publish.test.ts`
Expected: Either FAIL or no explicit coverage for resource refs optionality.

- [ ] **Step 3: Write minimal implementation**

Only change code if validation accidentally treats missing ref arrays as errors.
Otherwise keep domain validation unchanged and land test coverage only.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- --run test-gates/contract/publish.test.ts`
Expected: PASS

### Task 6: Update implementation references to include ADR-0020/0021

**Files:**
- Modify: `docs/implementation/IMP-00-reference.md`
- Modify: `docs/implementation/IMP-01-blueprint.md`

- [ ] **Step 1: Write the failing review checklist**

Add a short doc checklist in the PR/task description:
- ADR baseline should include 0020/0021
- implementation rules should mention `AgentNode` interpretation and `knowledge_refs` / `tool_refs`

- [ ] **Step 2: Write minimal implementation**

Update ADR baseline lists and implementation rules so future coding turns do not regress to old `knowledge` / `tool` canonical assumptions.

- [ ] **Step 3: Verify docs are coherent**

Review:
- `docs/adr/ADR-0020-agentnode-composition-and-action-ownership.md`
- `docs/adr/ADR-0021-agentnode-resource-reference-shape.md`
- `docs/implementation/IMP-00-reference.md`
- `docs/implementation/IMP-01-blueprint.md`

Expected: No contradiction between ADR baseline and implementation docs.

## Validation

- [ ] Run: `pnpm test -- --run packages/renderer/src/store/__tests__/workflowStore.test.ts`
- [ ] Run: `pnpm test -- --run test-gates/contract/publish.test.ts`
- [ ] Run: `pnpm test -- --run test-gates/run/strict-gate.test.ts`
- [ ] Run: `pnpm test -- --run test-gates/installer/index.test.ts`
- [ ] Review modified fixtures for old `knowledge` / `tool` canonical remnants using:

```bash
rg -n '"knowledge"|"tool"' fixtures test-gates packages/renderer
```

Expected:
- renderer canonical paths use `knowledge_refs` / `tool_refs`
- old single-string canonical storage is removed from active implementation paths
- publish/run behavior for required fields is unchanged

## Handoff Prompt

```md
[Phase] phase3
[Task] Implement ADR-0020/0021 alignment for AgentNode config and resource refs
[Scope In] renderer type/store/UI, fixtures, contract validation coverage, implementation docs
[Scope Out] agent_ref, parallel execution, naming-rule finalization, migration tooling
[Validation] knowledge_refs/tool_refs arrays are stored canonically, publish still only requires action_text/done_criteria, fixtures and previews match
[Done] ADR-0020/0021 canonical shape is reflected in code and tests without regressing existing publish/run gates
```
