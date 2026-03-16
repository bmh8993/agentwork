# ADR-0007: SKILL.json 단일 SoT와 SKILL.md 생성 규칙

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

기존 결정(ADR-0003, ADR-0006)은 `SKILL.md`와 `SKILL-META.md` 2파일 분리 모델을 전제로 했다.
하지만 실제 운영 관점에서 2파일 동기화(누락, 충돌, 수동 수정, 레이아웃 유실) 복잡도가 높고, 사용자 혼란 가능성이 컸다.
제품 목표는 비개발자에게 "화면에서 편집한 내용과 실제 실행 결과가 항상 일치"하는 경험을 제공하는 것이다.
이를 위해 저장의 단일 진실 원천(Single Source of Truth, SoT)과 단방향 산출 규칙이 필요하다.

## Decision

MVP부터 Skill 저장/편집의 canonical은 `SKILL.json`으로 고정한다.
`SKILL.md`는 OpenCode 호환을 위한 generated artifact로만 취급한다.

핵심 결정 사항:

1. 단일 SoT는 `SKILL.json`이다.
2. 편집 대상은 `SKILL.json`만 허용한다.
3. `SKILL.md`는 항상 `SKILL.json -> SKILL.md` 단방향 생성 결과다.
4. `SKILL.md` 직접 편집은 지원하지 않는다(read-only artifact).
5. `SKILL-META.md`는 사용하지 않는다.
6. `SKILL.md` 수동 변경이 감지되면 경고 후 `SKILL.json` 기준으로 재생성한다.
7. import 호환을 위해 `SKILL.md` 파싱 경로는 제공하되, 이는 "초기 변환" 용도이며 운영 경로는 아니다.

## Canonical File Set

Skill 폴더의 기본 파일 세트는 아래로 고정한다.

1. `SKILL.json` (필수, canonical)
2. `SKILL.md` (필수, generated)

`SKILL-META.md`는 생성/저장/동기화 대상에서 제외한다.

## SKILL.json v1 Shape (MVP)

```json
{
  "version": "1",
  "skill": {
    "id": "skill-uuid",
    "name": "Skill Name",
    "description": "One-line summary",
    "license": "optional",
    "compatibility": "optional",
    "metadata": {},
    "content_md": "## What I do\n...\n## When to use me\n..."
  },
  "workflow": {
    "nodes": [
      {
        "id": "n1",
        "name": "Start",
        "type": "Start|Agent|End",
        "position": [176, 240],
        "config": {}
      }
    ],
    "edges": [
      {
        "id": "e1",
        "source_node_id": "n1",
        "target_node_id": "n2",
        "branch": "default",
        "source_node_name": "Start",
        "target_node_name": "Agent Task"
      }
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

## Field Policy

허용:

1. 실행 의미(스킬 설명, 규칙, 절차)
2. 그래프 의미(노드/엣지/브랜치)
3. 캔버스 의미(좌표/그리드/뷰포트)

금지:

1. 비밀정보/자격증명 원문(`credentials`, token, secret)
2. 런타임 스냅샷/실행 결과 원문(`pinData` 성격 데이터)
3. 환경 고유 식별자(`instanceId` 등 이식 불가 값)

## Compile Pipeline (One-way)

저장 파이프라인은 아래 순서를 강제한다.

1. `SKILL.json` JSON schema 검증
2. 금지 필드 검사(민감값 포함 여부)
3. `SKILL.md` 렌더링
4. 생성 서명 기록(`generated_by`, `source_hash`, `generated_at`)
5. 원자적 파일 쓰기(temp -> rename)

렌더링 규칙:

1. frontmatter는 `skill.name`, `skill.description`, 선택 필드(`license`, `compatibility`, `metadata`)로 생성
2. 본문은 `skill.content_md`를 그대로 반영
3. 본문이 비어 있으면 최소 섹션 템플릿을 생성

## Runtime Read Policy

앱 런타임은 아래 규칙으로 읽는다.

1. 편집/실행에 필요한 구조 데이터는 `SKILL.json`만 읽는다.
2. `SKILL.md`는 OpenCode 실행 호환용 파일로만 사용한다.
3. `SKILL.md`를 source of truth로 사용하지 않는다.

## Import / Migration Policy

1. `SKILL.md`만 있는 폴더 import 시:
   1. frontmatter 파싱
   2. 본문 원문을 `skill.content_md`로 저장
   3. workflow는 기본 `Start` 1개 + `End` 1개로 생성
   4. `imported_from_md=true` 메타 기록
2. 구버전(`SKILL-META.md`)이 있는 경우:
   1. 가능한 필드를 `SKILL.json.workflow`로 병합
   2. 병합 실패 필드는 경고 로그에 기록
   3. 최종적으로 `SKILL-META.md` 의존성 제거

## Conflict Handling

1. `SKILL.md` 해시가 `SKILL.json` 기반 생성 해시와 다르면 `manual_edit_detected` 경고 표시
2. 기본 정책은 `SKILL.json` 우선 재생성(overwrite)
3. 사용자는 "비교 보기(diff)" 후 재생성을 확정할 수 있다
4. MVP에서는 자동 병합을 지원하지 않는다

## Rationale

1. 단일 SoT 모델은 동기화 문제를 구조적으로 제거한다.
2. `content_md`를 JSON에 보관하면 markdown 의미 손실 없이 round-trip이 가능하다.
3. OpenCode 호환(`SKILL.md`)을 유지하면서 GUI 편집 안정성을 확보할 수 있다.
4. 비개발자 대상 UX에서 "보이는 것과 실행되는 것의 불일치"를 최소화한다.

## Consequences

긍정 효과:

1. 저장/복원/버전관리 정책이 단순해진다.
2. 캔버스 메타 유실 이슈를 줄인다.
3. 에디터 기능 확장(노드 타입 추가, 정책 필드 추가)이 쉬워진다.

제약:

1. `SKILL.md` 직접 편집 워크플로우는 기본적으로 비권장/비지원이다.
2. `SKILL.md` 단독 편집 사용자는 import/경고 흐름을 거쳐야 한다.
3. 컴파일러(렌더러) 유지보수 책임이 생긴다.

## Scope

포함:

1. `SKILL.json` 단일 SoT 정책
2. `SKILL.md` 생성 파이프라인
3. import/migration/conflict 처리 기본 규칙
4. 금지 필드 정책

제외:

1. `SKILL.md` <-> `SKILL.json` 자동 양방향 병합
2. 고급 semantic merge
3. 클라우드 동기화/협업 잠금

## Related Decisions

1. [ADR-0001-mvp-distribution-and-installation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0001-mvp-distribution-and-installation.md)
2. [ADR-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0002-domain-model.md)
3. [ADR-0004-skill-canvas-minimum-execution-rules.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0004-skill-canvas-minimum-execution-rules.md)
4. [ADR-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0005-failure-taxonomy-and-error-ux.md)
5. Supersedes: [ADR-0003-skill-canonical-and-gui-meta-separation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0003-skill-canonical-and-gui-meta-separation.md)
6. Supersedes: [ADR-0006-skill-meta-minimum-schema.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0006-skill-meta-minimum-schema.md)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. `SKILL.json` 단일 SoT 정책 합의
  2. `SKILL.md` read-only artifact 정책 합의
  3. `SKILL-META.md` 제거 정책 합의
- Accepted -> Superseded 조건:
  1. OpenCode가 JSON canonical을 공식 수용하거나, 제품이 다른 canonical 포맷으로 전환할 때
