# ARD-0003: Skill Canonical 문서와 GUI 메타 분리

- Status: Superseded
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

제품의 핵심은 GUI(노드/엣지)로 Skill을 작성하는 경험이다.
동시에 OpenCode 호환성을 유지하려면 Skill 저장 포맷은 OpenCode가 이해하는 `SKILL.md`를 우선해야 한다.
문제는 GUI 편집 상태(좌표, 노드 ID, 엣지 정보 등)는 OpenCode 표준 Skill 본문과 성격이 다르다는 점이다.

본 결정은 ARD-0007에서 `SKILL.json` 단일 SoT 정책으로 대체되었다.

## Decision

Skill 저장 구조를 아래처럼 2파일로 분리한다.

1. `SKILL.md`를 canonical 실행 문서로 사용한다.
2. `SKILL-META.md`를 GUI 전용 메타 문서로 사용한다.

핵심 결정 사항:

1. `SKILL.md`는 OpenCode Skills 문서 구조를 따른다.
2. GUI 편집 정보(예: 노드 좌표, 캔버스 상태, 내부 식별자)는 `SKILL-META.md`에만 저장한다.
3. `SKILL-META.md`가 없어도 `SKILL.md`만으로 Skill 실행은 가능해야 한다.
4. 두 문서는 같은 Skill 폴더에 저장하고 공통 `skill_id`로 연결한다.

## Rationale

1. OpenCode 호환 포맷을 오염시키지 않고 유지할 수 있다.
2. 사용자 공유 시 `SKILL.md`만 전달해도 기본 실행 호환성을 확보할 수 있다.
3. GUI 메타 스키마를 독립적으로 발전시킬 수 있다.

## Consequences

긍정 효과:

1. 실행 의미와 편집기 상태가 분리되어 유지보수가 쉬워진다.
2. 비GUI 환경과의 상호운용성이 좋아진다.

제약:

1. 저장/불러오기 시 2파일 동기화 로직이 필요하다.
2. `SKILL-META.md` 유실 시 캔버스 레이아웃은 복구되지 않을 수 있다.

## Scope

포함:

1. Skill 저장 단위를 `SKILL.md` + `SKILL-META.md`로 정의
2. 실행 호환성 기준(`SKILL.md` 단독 실행 가능) 고정
3. 파일 간 연결 키(`skill_id`) 규칙 정의

제외:

1. `SKILL-META.md` 상세 필드 스키마
2. 그래프 실행 엔진 내부 알고리즘
3. UI 상세 컴포넌트 명세

## Related Decisions

1. [ARD-0001-mvp-distribution-and-installation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0001-mvp-distribution-and-installation.md)
2. [ARD-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0002-domain-model.md)
3. [ARD-0004-skill-canvas-minimum-execution-rules.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0004-skill-canvas-minimum-execution-rules.md)
4. Superseded by: [ARD-0007-skill-json-single-source-and-md-generation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0007-skill-json-single-source-and-md-generation.md)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. `SKILL.md` 단독 실행 호환성에 대해 팀 합의 완료
  2. `SKILL-META.md` 분리 저장 원칙에 대해 팀 합의 완료
- Accepted -> Superseded 조건:
  1. OpenCode 표준이 GUI 메타를 공식 수용해 단일 문서화가 가능해질 때
