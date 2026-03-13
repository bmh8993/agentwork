# CLAUDE.md

## Claude Code Memory Rules

이 문서는 Claude Code가 로드하는 프로젝트 메모리 파일이다.

1. 프로젝트 루트의 `CLAUDE.md`는 이 저장소 전체 기본 규칙으로 사용한다.
2. 하위 디렉터리에 추가 `CLAUDE.md`가 있으면 더 구체적인 경로 규칙이 우선한다.
3. 공통/개인 메모리(`~/.claude/CLAUDE.md`)보다 프로젝트 문서가 우선 적용된다.
4. 작업 지시는 짧고 명시적으로 유지한다. 장문 설명/배경 지식은 참조 링크로 분리한다.
5. 반복되는 빌드/테스트/검증 명령은 이 문서에 고정해 일관되게 재사용한다.

## Document Index (3 Categories)

이 저장소 문서는 아래 3개 카테고리로만 분류한다.

1. 프로젝트 정책
2. 구현
3. 외부 기술 참고 문서

### 1) 프로젝트 정책

1. `docs/adr/*` (제품/설계 확정 의사결정)
2. `docs/policy/POL-01-phase-workflow.md` (Phase 실행 규칙 SoT)
3. `docs/policy/POL-02-error-codes-and-test-gates.md` (에러 코드/테스트 게이트 기준)
4. `docs/policy/POL-03-document-writing-rules.md` (문서 작성/분류/변경 기준)

### 2) 구현

1. `docs/implementation/IMP-00-reference.md` (구현 단일 진입점)
2. `docs/implementation/IMP-01-blueprint.md` (구현 기준선/모듈 경계)
3. `docs/implementation/phase1/*`, `docs/implementation/phase2/*`, `docs/implementation/phase3/*` (phase 실행 문서)

### 3) 외부 기술 참고 문서

1. `docs/reference/REF-01-cli-chat-ui-flow.md` (외부 레퍼런스 분석 문서)

## Implementation Pre-read (Required, ADR 제외)

코딩 어시스턴트는 구현 시작 전에 아래 문서를 순서대로 반드시 읽는다.

1. `docs/policy/POL-01-phase-workflow.md`
2. `docs/policy/POL-02-error-codes-and-test-gates.md`
3. `docs/policy/POL-03-document-writing-rules.md`
4. `docs/implementation/IMP-00-reference.md`
5. `docs/implementation/IMP-01-blueprint.md`
6. **이전 Phase 완료 확인 (Phase 2/3 시작 시 필독)**
   - Phase 2 시작 전: `docs/implementation/phase1/04-handoff.md`
   - Phase 3 시작 전: `docs/implementation/phase2/04-handoff.md`
7. 해당 작업 대상 phase 문서 전체
   - `docs/implementation/phaseN/01-goal-and-scope.md`
   - `docs/implementation/phaseN/02-implementation.md`
   - `docs/implementation/phaseN/03-validation.md`
   - `docs/implementation/phaseN/04-handoff.md`

구현/수정 중 판단 충돌 시 우선순위는 아래와 같다.

1. 사용자의 현재 요청
2. `docs/policy/POL-01-phase-workflow.md`
3. `docs/policy/POL-02-error-codes-and-test-gates.md`
4. `docs/policy/POL-03-document-writing-rules.md`
5. `docs/implementation/IMP-00-reference.md`
6. `docs/implementation/IMP-01-blueprint.md`
7. phase 문서 (`docs/implementation/phaseN/*`)

## Documentation Rules

이 저장소의 제품/설계 의사결정은 ADR(Architecture/Decision Record)로 관리한다.

### 1) 원칙

1. "확정된 내용만" 문서화한다.
2. 미확정/아이디어/옵션 비교는 ADR에 기록하지 않는다.
3. 한 ADR에는 하나의 핵심 결정만 담는다.
4. ADR은 결론(Decision)과 이유(Rationale)를 반드시 함께 기록한다.

### 2) 위치와 파일명

1. 경로: `docs/adr/`
2. 파일명: `ADR-XXXX-<kebab-case-title>.md`
3. 번호는 4자리 순번(`0001`, `0002`, ...)
4. 신규 ADR은 `docs/adr/ADR-template.md` 복사로 시작한다.
5. 용어는 ADR을 사용하되, 기존 저장소 호환을 위해 경로/파일 접두(`docs/adr`, `ADR-`)는 유지한다.

### 3) 필수 섹션

아래 섹션은 항상 포함한다.

1. `Status` (`Proposed`, `Accepted`, `Superseded`)
2. `Date` (YYYY-MM-DD)
3. `Context`
4. `Decision`
5. `Rationale`
6. `Consequences` (긍정/제약)
7. `Scope` (포함/제외)
8. `Related Decisions` (후속 ADR 링크/번호)

### 4) 작성 규칙

1. 문장은 짧고 단정적으로 쓴다.
2. 실행 가능한 수준의 경계(포함/제외)를 명확히 쓴다.
3. 도구명/경로/포맷은 가능한 한 구체적으로 쓴다.
4. KPI, 수용 기준, 범위 변경은 ADR로 남긴다.

### 5) 변경 규칙

1. 기존 결정을 뒤집을 때는 기존 ADR을 직접 덮어쓰지 않는다.
2. 새 ADR을 추가하고 기존 ADR 상태를 `Superseded`로 변경한다.
3. 어떤 ADR을 대체했는지 `Related Decisions`에 명시한다.

### 6) 현재 확정된 기준 (MVP)

1. Marketplace 연동은 제외한다.
2. OpenCode plugin 설치 채널은 `local(folder only) + npm`을 지원한다(`zip` 미지원).
3. Skill canonical은 `SKILL.json`으로 관리하고, `SKILL.md`는 generated artifact로 관리한다.
4. 실행 환경은 로컬 실행만 지원한다.
5. 워크플로우 모델은 Action 텍스트 중심이며, Condition은 MVP에서 사용하지 않는다.
6. 워크플로우 최소 노드 타입은 `Start`, `Agent`, `End` 3종으로 고정한다.
7. Agent 카드 필수 슬롯은 `Knowledge`, `Tool`, `Action`, `Done Criteria`이며, `Action`/`Done Criteria`는 Publish 전 필수다.
8. `Draft Save`는 허용한다. `Publish`/`Run`은 strict 검증 통과 시에만 허용한다.
9. 비지원 노드 타입은 `Load(Open)`에서 read-only 호환 모드로 열고 원본을 보존한다. `Publish`/`Run`은 차단한다.
10. `Publish`는 파일 포맷 버전을 변경하지 않는다(`SKILL.json.version` 유지).

근거 ADR:

1. ADR-0016 (설치 채널)
2. ADR-0007, ADR-0008, ADR-0009 (canonical/검증)
3. ADR-0017, ADR-0018 (UX/워크플로우 모델)
4. ADR-0015 (비지원 노드/확장 정책)

## 7) 협업 요청/응답 템플릿 (Phase 실행 규칙)

Phase 실행의 상세 규칙과 운영 원칙은 `docs/policy/POL-01-phase-workflow.md`를 단일 기준(SoT)으로 사용한다.

요청자는 아래 포맷으로 턴 요청을 작성한다.

```md
[Phase] phaseN
[Task] 이번 턴 단일 작업
[Scope In] 포함
[Scope Out] 제외
[Validation] 내가 확인할 시나리오
[Done] 완료 기준
```

응답자는 아래 구조로 결과를 보고한다.

1. `What I changed` (수정 파일/핵심 변경)
2. `How to verify` (요청자가 수행할 검증 절차)
3. `Pass/Fail 기준` (완료 판정 기준)
4. `Next 1 step` (다음 한 단계)

## 8) 턴 크기(작업 분할) 규칙

AI와 협업할 때는 "큰 계획 1개"가 아니라 "검증 가능한 작은 턴"으로 분할한다.

1. 한 턴에는 검증 게이트 1개만 포함한다.
2. 한 턴의 완료 기준은 테스트 명령 1~2개로 판정 가능해야 한다.
3. 한 턴의 변경 범위는 가능하면 모듈 1개(최대 2개)로 제한한다.
4. Open Question이 남아 있으면 구현 전에 질문/결정으로 턴을 분리한다.
5. `phaseN/04-handoff.md`의 `Handoff Prompt`는 항상 다음 "단일 턴 작업"만 지시한다.

권장 순서(Phase 1):

1. `schema-contract`
2. `load-compat-readonly`
3. `draft-structural-save`
4. `publish-gate-required-fields`
5. `run-gate-strict`
