# Implementation Reference (Single Entry)

- Date: 2026-03-13
- Status: Active
- Purpose: 구현에 필요한 결정/규칙/게이트/흐름 문서를 한 곳에서 참조하기 위한 단일 진입점

## 1) Final Stack (Confirmed)

1. Workflow canvas: `@xyflow/react` (React Flow)
2. Desktop packaging: `electron-builder`
3. State management: `zustand`
4. Form handling: `react-hook-form`
5. Schema/form validation: `zod`

## 2) ADR Baseline (Accepted)

1. [ADR-0002: Domain Model](../adr/ADR-0002-domain-model.md)
2. [ADR-0005: Failure Taxonomy and Error UX](../adr/ADR-0005-failure-taxonomy-and-error-ux.md)
3. [ADR-0007: SKILL.json SoT and SKILL.md Generation](../adr/ADR-0007-skill-json-single-source-and-md-generation.md)
4. [ADR-0008: Versioning/Compatibility/Migration Policy](../adr/ADR-0008-skill-json-schema-versioning-and-migration-policy.md)
5. [ADR-0009: SKILL.json v1 Schema and Acceptance Tests](../adr/ADR-0009-skill-json-v1-schema-and-acceptance-tests.md)
6. [ADR-0010: Plugin Layout and Manifest](../adr/ADR-0010-plugin-package-layout-and-manifest.md)
7. [ADR-0012: SkillRun Log Retention and Masking](../adr/ADR-0012-skillrun-log-retention-and-masking-policy.md)
8. [ADR-0014: Local Path and Permission Boundary](../adr/ADR-0014-local-file-path-and-permission-boundary.md)
9. [ADR-0015: Node Type Extension Policy](../adr/ADR-0015-node-type-catalog-and-extension-policy.md)
10. [ADR-0016: Install Channels (local folder + npm)](../adr/ADR-0016-mvp-plugin-install-channels-local-and-npm.md)
11. [ADR-0017: Agent Card UX and Draft/Publish Gate](../adr/ADR-0017-agent-card-ux-and-chat-refinement.md)
12. [ADR-0018: Action-only Workflow Model](../adr/ADR-0018-action-only-workflow-model.md)

## 3) Implementation Specs

1. [Implementation Blueprint](./IMP-01-blueprint.md)
2. [CLI to Chat UI Flow (OpenWork Reference)](../reference/REF-01-cli-chat-ui-flow.md)
3. [Error Codes and Test Gates](../policy/POL-02-error-codes-and-test-gates.md)

## 4) Operational Source of Truth

1. 구현 규칙/모듈 경계/완료 기준은 [Implementation Blueprint](./IMP-01-blueprint.md)를 기준으로 한다.
2. 에러 코드/테스트 게이트/머지 차단 조건은 [Error Codes and Test Gates](../policy/POL-02-error-codes-and-test-gates.md)를 기준으로 한다.
3. 채팅 스트리밍 경로와 UI 반영 흐름은 [CLI to Chat UI Flow](../reference/REF-01-cli-chat-ui-flow.md)를 기준으로 한다.
