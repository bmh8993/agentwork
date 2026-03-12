# ARD-0002: 도메인 모델 정의 (MVP)

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

MVP 범위가 "로컬 plugin 설치 + GUI 조합 + 로컬 실행 + 텍스트 공유"로 고정되면서,
데이터 모델과 UI 개념을 일관되게 연결할 공통 도메인 정의가 필요해졌다.

## Decision

MVP 도메인 모델은 아래 6개 엔티티로 고정한다.

1. `Plugin`
2. `Agent`
3. `AgentKnowledge`
4. `Tool`
5. `Skill`
6. `SkillRun`

엔티티 역할은 다음과 같이 정의한다.

1. `Plugin`: 설치/배포 단위. 하나 이상의 `Agent`, `Tool`, `AgentKnowledge`를 포함할 수 있다.
2. `Agent`: 실행 주체. `AgentKnowledge`와 `Tool`을 참조해 단계 작업을 수행한다.
3. `AgentKnowledge`: Agent가 실행 중 참조하는 Markdown 지식 문서(`.md`).
   MVP 기본 주입 방식은 Agent `prompt`의 파일 참조(`{file:...}`)를 사용한다.
   독립 실행 객체가 아니라 Agent의 문맥 입력 자산이다.
4. `Tool`: Agent가 호출 가능한 실행 기능(예: CLI, MCP 서버 연동).
5. `Skill`: 다중 Agent 협업 워크플로우 정의(노드/엣지 그래프).
6. `SkillRun`: `Skill`의 1회 실행 기록(입력, 단계 로그, 결과, 실패 지점).

관계 제약(핵심 규칙)은 아래로 고정한다.

1. 설치는 `Plugin` 단위로만 수행한다.
2. 조합은 `Agent` 단위로 수행한다(서로 다른 Plugin 소속 Agent 조합 허용).
3. 실행은 `Skill` 단위로 시작하며, 관측/디버깅은 `SkillRun` 단위로 수행한다.
4. 공유 canonical은 `SKILL.json`을 기준으로 하며, `SKILL.md`는 generated artifact로 관리한다.
5. `AgentKnowledge`는 파일 경로/참조로 연결하며, 내용 포맷은 Markdown을 기본으로 한다.
6. `SKILL.md` 기반 on-demand 지식 로드는 MVP 필수 구현이 아니라 확장 옵션으로 분류한다.

## Rationale

1. 설치와 조합 단위를 분리하면 사용자 mental model이 명확해진다.
2. 비개발자 UX에서 "무엇을 설치했고 무엇을 조합하는지"를 시각적으로 분리할 수 있다.
3. 실행 추적을 `SkillRun`으로 분리하면 디버깅, 재실행, 재현성 확보가 쉬워진다.
4. JSON canonical + Markdown generated 전략과 도메인 단위를 자연스럽게 맞출 수 있다.
5. `AgentKnowledge`를 Markdown 자산으로 고정하면 비개발자 편집/공유 장벽이 낮다.

## Consequences

긍정 효과:

1. 화면 구조를 `Install(Plugin) -> Build(Skill) -> Run(SkillRun)`으로 단순화할 수 있다.
2. 플러그인 간 Agent 혼합 시나리오를 MVP부터 지원할 수 있다.

제약:

1. Plugin 내부 세부 스키마 표준화는 후속 결정이 필요하다.
2. Skill 그래프 실행 semantics(병렬, 재시도 정책)는 별도 ARD에서 확정해야 한다.

## Scope

포함:

1. 엔티티 정의 및 핵심 관계 제약
2. 설치/조합/실행/공유 단위 구분
3. `AgentKnowledge`를 Markdown 지식 문서로 취급하는 규칙

제외:

1. 각 엔티티의 상세 파일 스키마
2. 그래프 실행 엔진의 상세 규칙
3. UI 컴포넌트 상세 설계
4. `SKILL.md` on-demand 지식 주입의 제품 내 필수 UI 제공

## Related Decisions

1. [ARD-0001-mvp-distribution-and-installation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0001-mvp-distribution-and-installation.md)
2. [ARD-0003-skill-canonical-and-gui-meta-separation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0003-skill-canonical-and-gui-meta-separation.md) (Superseded)
3. [ARD-0004-skill-canvas-minimum-execution-rules.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0004-skill-canvas-minimum-execution-rules.md)
4. [ARD-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0005-failure-taxonomy-and-error-ux.md)
5. [ARD-0007-skill-json-single-source-and-md-generation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0007-skill-json-single-source-and-md-generation.md)

## Options / Ideas (Non-MVP)

1. `SKILL.md` 기반 on-demand 지식 주입을 고급 모드로 제공한다.
2. 기본 모드에서는 숨기고, 고급 사용자에게만 노출한다.
