# Implementation Blueprint (MVP)

- Date: 2026-03-12
- Status: Draft for implementation

## 1. Goal

이 문서는 `Accepted` ADR를 구현 단계에서 바로 사용할 수 있도록 기준선과 기술 스택을 고정한다.

## 2. ADR Baseline (Accepted)

아래 ADR를 MVP 구현의 단일 기준으로 사용한다.

1. ADR-0002 (도메인 모델)
2. ADR-0005 (에러 분류/UX)
3. ADR-0007 (SKILL.json SoT)
4. ADR-0008 (버전/검증/마이그레이션 정책)
5. ADR-0009 (v1 스키마/수용 테스트)
6. ADR-0010 (패키지 레이아웃/매니페스트)
7. ADR-0012 (로그 보존/마스킹)
8. ADR-0014 (로컬 경계/권한)
9. ADR-0015 (노드 타입 확장/비지원 타입 처리)
10. ADR-0016 (설치 채널: local folder + npm)
11. ADR-0017 (Agent 카드 UX, Draft/Publish 경계)
12. ADR-0018 (Action-only 워크플로우)
13. ADR-0020 (AgentNode 조합 단위와 Action 소유권)
14. ADR-0021 (AgentNode 리소스 참조 필드 shape)

## 3. Tech Stack Selection

### 3.1 Core

1. Language: TypeScript (strict mode)
2. Runtime: Electron (Node.js LTS, local desktop only)
3. Package manager: pnpm

### 3.2 App / UI

1. Desktop shell: Electron (`main` / `preload` / `renderer`)
2. Renderer framework: React + Vite
3. State: Zustand (UI/workflow state)
4. Forms/validation on UI: Zod

### 3.3 Domain / Engine

1. Schema validation: JSON Schema (Ajv)
2. Domain validation layer: custom validator module (Load/Draft/Publish/Run 분리)
3. File I/O: Electron main process (Node `fs`) + atomic write 유틸
4. IPC boundary: preload bridge를 통한 최소 API 노출

### 3.4 Testing

1. Unit/Integration: Vitest
2. E2E: Playwright
3. Contract fixtures: `SKILL.json` v1 샘플 세트

### 3.5 Logging / Security

1. Structured logging: pino
2. Masking pipeline: key/value pattern mask (ADR-0012 준수)
3. Path boundary: OpenCode 경계/권한 정책 준수 (ADR-0014)
4. Electron security baseline: `contextIsolation=true`, `nodeIntegration=false`, `sandbox=true`

## 4. Implementation Rules from ADR

1. Install channel: `local folder only` + `npm`; `zip` 미지원.
2. Canonical: `SKILL.json`; `SKILL.md`는 generated artifact.
3. Workflow model: `Start -> Agent -> End`, `Condition` 미사용.
4. Agent node publish requirements: `action_text`, `done_criteria` 필수.
5. Validation stage:
   1. `Load(Open)`: read-only compatibility 허용(원본 보존)
   2. `Draft Save`: 구조 무결성 검증
   3. `Publish/Run`: strict schema + domain 검증
6. AgentNode interpretation (ADR-0020):
   1. `Agent` 타입 노드는 도메인 모델에서 `AgentNode`로 해석한다.
   2. `Action`과 `Done Criteria`는 `Agent`가 아니라 `AgentNode` 설정에 귀속한다.
   3. UX 용어 `Agent 카드`는 유지하되, 내부 구현에서는 `AgentNode` 의미로 사용한다.
7. Resource reference shape (ADR-0021):
   1. AgentNode Knowledge/Tool 참조는 `knowledge_refs`, `tool_refs` 배열로 저장한다.
   2. 단일 문자열 필드 `knowledge`, `tool`은 임시 구현 표현으로 간주한다.
   3. `knowledge_refs`와 `tool_refs`의 각 값은 stable name/id 참조를 사용한다.
   4. 빈 값의 기본값은 `[]`이다.

## 4.1. Type Contract: NodeData.config Shape

`Agent` 타입 노드의 `config` 객체는 다음 shape를 따른다 (ADR-0020, ADR-0021 기준):

```typescript
interface AgentNodeConfig {
  // Action과 Done Criteria는 node-level 소유권 (ADR-0020)
  action_text: string;           // 필수 (Publish gate)
  done_criteria: string;         // 필수 (Publish gate)

  // Knowledge/Tool 참조는 배열 shape (ADR-0021)
  knowledge_refs: string[];      // optional, 기본값 []
  tool_refs: string[];           // optional, 기본값 []

  // UI 표시용 필수 슬롯 (ADR-0017)
  // 현재 MVP에서는 위 필드들이 Agent 카드의 필수 슬롯에 해당
}
```

중요 사항:
1. `action_text`, `done_criteria`는 Publish 시 필수 값이다.
2. `knowledge_refs`, `tool_refs`는 optional이며, 빈 배열 `[]`이 기본값이다.
3. 단일 문자열 필드 `knowledge`, `tool`은 전환 대상이며 canonical이 아니다.

## 5. Module Boundaries

1. `installer/`: local/npm install, manifest/layout validation
2. `skill-schema/`: JSON schema + AJV validators
3. `skill-domain/`: domain rule validation (node types, publish gates)
4. `skill-io/`: load/save/atomic write, backup policy
5. `workflow-ui/`: Agent card editor, Draft/Publish UX
6. `run-orchestrator/`: run gating, fail-fast, error code mapping
7. `logging/`: structured logs + masking + retention

## 6. Done Criteria (Implementation)

1. `zip` input 차단 테스트 통과
2. unsupported node를 `Load(Open)`에서 read-only로 열고 원본 보존
3. `Draft Save` 허용 / `Publish` 차단 조건 테스트 통과
4. `Publish/Run` strict 검증 실패 시 표준 `error_code/category/next_action` 반환
5. `SKILL.json -> SKILL.md` 생성 경로 정상 동작
