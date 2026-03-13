# Phase Workflow Guide (AI Collaboration)

- Date: 2026-03-13
- Status: Active

## 1) 목적

이 문서는 구현 업무를 `phase` 단위로 나누고, AI와 함께 점진 검증 방식으로 진행하기 위한 운영 규칙을 정의한다.

## 2) 단일 기준(SoT)

1. Phase 실행 규칙의 단일 기준은 이 문서다.
2. 제품/설계 의사결정은 ADR(`docs/adr/ADR-XXXX-*.md`)로만 확정한다.
3. 미확정/아이디어/옵션 비교는 ADR이 아니라 phase 문서의 `Open Questions`에 기록한다.

## 3) 폴더 운영 규칙

1. 진행 중 문서:
   - `docs/implementation/phase1/...`
   - `docs/implementation/phase2/...`
   - `docs/implementation/phase3/...`
2. 완료 후 보관 문서:
   - `docs/archive/phase1/...`
   - `docs/archive/phase2/...`
   - `docs/archive/phase3/...`
3. 원칙:
   - 진행 중에는 `docs/implementation/phaseN`만 수정한다.
   - 완료(Exit Criteria 충족) 시 `docs/archive/phaseN`로 이동한다.
   - archive로 이동한 문서는 수정하지 않는다. 변경이 필요하면 새 phase 문서로 작성한다.

## 4) Phase 문서 구성(필수)

각 phase 문서는 아래 섹션을 반드시 포함한다.

1. `Goal` (한 문장)
2. `Scope In` (포함)
3. `Scope Out` (제외)
4. `Tasks` (구현 작업 목록)
5. `Validation` (수동 검증 시나리오 + 기대 결과)
6. `Open Questions` (미확정/의사결정 필요 항목)
7. `Exit Criteria` (완료 조건)
8. `Artifacts` (수정/생성 파일 목록)
9. `Handoff Prompt` (다음 AI 턴에서 바로 이어갈 지시문)

## 5) 파일 네이밍 규칙

1. phase 폴더 내 문서:
   - `01-goal-and-scope.md`
   - `02-implementation.md`
   - `03-validation.md`
   - `04-handoff.md`
2. 기능 단위 문서가 많을 경우:
   - `10-<feature-name>.md`
   - `20-<feature-name>.md`
3. 파일명은 kebab-case를 사용한다.

## 6) AGENTS 협업 요청/응답 포맷

### 6.1 요청 포맷 (요청자)

```md
[Phase] phaseN
[Task] 이번 턴 단일 작업
[Scope In] 포함
[Scope Out] 제외
[Validation] 내가 확인할 시나리오
[Done] 완료 기준
```

### 6.2 응답 포맷 (응답자)

아래 4개 섹션을 순서대로 고정한다.

1. `What I changed` (수정 파일/핵심 변경)
2. `How to verify` (요청자가 수행할 검증 절차)
3. `Pass/Fail 기준` (완료 판정 기준)
4. `Next 1 step` (다음 한 단계)

## 7) MVP Phase 세분화 (실행 계획)

### 7.1 Phase 1: 계약/검증/저장 경계 고정

1. 목표:
   - `SKILL.json` 스키마 계약과 Load/Draft/Publish/Run 검증 경계를 코드로 고정한다.
2. Scope In:
   - AJV 기반 v1 스키마 검증기
   - 단계별 validator(Load/Draft/Publish/Run)
   - atomic write + backup 정책
   - 표준 error_code 매핑
3. Scope Out:
   - 워크플로우 캔버스 UI 세부 편집 UX
   - 설치 채널 UI
4. 필수 완료 게이트:
   - `schema-contract`, `load-compat-readonly`, `draft-structural-save`, `publish-gate-required-fields`, `run-gate-strict`

### 7.2 Phase 2: 워크플로우 편집 UX 및 Publish 게이트

1. 목표:
   - `Start/Agent/End` 고정 모델의 편집 UX와 Publish 차단 규칙을 완성한다.
2. Scope In:
   - Agent 카드 필수 슬롯(`Knowledge`, `Tool`, `Action`, `Done Criteria`)
   - Draft Save 허용 + Publish strict 차단
   - 비지원 노드 read-only 호환 모드 렌더
3. Scope Out:
   - Marketplace/zip 채널
   - 고급 노드 타입 확장
4. 필수 완료 게이트:
   - `publish-gate-required-fields`, `ui-error-next-action`

### 7.3 Phase 3: 설치/실행/로그 및 통합 품질

1. 목표:
   - 설치 채널(local folder + npm), 런타임 실행 게이트, 로그 마스킹까지 통합 완성한다.
2. Scope In:
   - installer(local/npm) + layout 검증
   - run orchestrator 사전 검증 차단
   - 구조화 로그 + 마스킹 + 보존 규칙
   - SKILL.json -> SKILL.md 생성 파이프라인
3. Scope Out:
   - 원격 실행 환경
   - Condition 기반 분기 실행
4. 필수 완료 게이트:
   - `install-folder-only`, `installer-npm-errors`, `run-gate-strict`

## 8) 완료 및 archive 이동 규칙

1. 완료 조건:
   - `Validation` 항목 전부 통과
   - `Exit Criteria` 전부 충족
   - 관련 ADR/기준 문서와 충돌 없음
2. 이동 방식:
   - `docs/implementation/phaseN/*` -> `docs/archive/phaseN/`
3. 이동 후:
   - `docs/implementation/phaseN/`는 비우거나 다음 iteration 문서만 유지한다.

## 9) AI 협업 권장 루프

1. Plan
   - 이번 턴 목표 1개만 지정한다.
   - 성공 조건을 문장으로 명확히 준다.
2. Implement
   - AI가 실제 파일 수정/코드 반영
3. Validate
   - 즉시 수동 테스트(또는 자동 테스트) 실행
4. Decide
   - 통과: 다음 task로 진행
   - 실패: 같은 phase에서 수정 후 재검증
5. Archive
   - phase 완료 시 문서를 archive로 이동

## 10) ADR 승격 규칙

아래 항목이 생기면 phase 문서가 아니라 신규 ADR로 승격한다.

1. KPI/수용 기준의 변경
2. Scope 경계의 변경(포함/제외 기준 자체 변경)
3. 파일 포맷/버전/호환성 정책 변경
4. 설치 채널/실행 환경/보안 경계 변경

기존 결정을 뒤집을 때는 새 ADR을 추가하고, 이전 ADR 상태를 `Superseded`로 변경한다.

## 11) 외부 레퍼런스

1. GitHub Copilot Docs (Best practices)
   - https://docs.github.com/copilot
2. Cursor Docs (Rules/Project instructions)
   - https://docs.cursor.com
3. Anthropic Prompt Engineering Guide
   - https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
4. OpenAI Codex/Developer Docs
   - https://platform.openai.com/docs
