# ADR-0019: Start/End 각각 1개 고정과 구조 오류 호환 정책

- Status: Accepted
- Date: 2026-03-14
- Deciders: Product Owner, Builder

## Context

MVP 워크플로우 모델은 `Start`, `Agent`, `End` 3종과 순차 실행을 기준으로 단순화되었다.
하지만 현재 기준 문서는 최소 타입과 Publish 게이트를 정의할 뿐, `Start`와 `End`가 각각 1개여야 한다는 개수 규칙을 명시적으로 고정하지 않았다.
이 공백 때문에 UI에서는 `Start`/`End`를 여러 개 생성할 수 있고, 구조 위반을 언제 어떤 수준으로 차단할지도 일관되지 않다.
비개발자 대상 빌더에서는 실행 구조 제약을 뒤늦게 오류로 드러내기보다, 캔버스 편집 단계에서 먼저 고정하는 편이 더 예측 가능하다.
또한 외부 입력은 `SKILL.json`뿐 아니라 `SKILL.md` only import/compile 경로도 고려해야 하므로, 구조 오류 문서의 호환 정책도 함께 필요하다.

## Decision

MVP 워크플로우에서 `Start`와 `End`는 각각 정확히 1개로 고정한다.
새 문서 생성과 편집 UI는 이 개수 규칙을 기본 전제로 강제한다.
load/import/compile 결과 이 규칙을 위반한 문서는 원본을 보존한 채 편집 가능 상태로 열지 않고, `read-only compatibility`로 연다.

핵심 결정 사항:

1. `SKILL.json.workflow.nodes` 기준으로 `Start`는 정확히 1개여야 한다.
2. `SKILL.json.workflow.nodes` 기준으로 `End`는 정확히 1개여야 한다.
3. 새 문서 생성 시 UI는 `Start` 1개와 `End` 1개를 기본 제공한다.
4. UI는 추가 `Start`/`End` 생성과 마지막 `Start`/`End` 삭제를 허용하지 않는다.
5. `Agent`는 0개 이상 허용한다. 단, Publish/Run 가능 여부는 별도 검증 규칙을 따른다.
6. `SKILL.md` only 입력은 기존 정책대로 허용한다. 단, import 시 기본 `Start` 1개와 `End` 1개를 자동 생성한 `workflow`를 만든다.
7. load/import/compile 결과 `Start != 1` 또는 `End != 1`이면 문서는 `read-only compatibility`로 연다.
8. 구조 오류 문서는 `Draft Save`, `Publish`, `Run`을 허용하지 않는다.
9. 구조 오류 문서는 자동 수정하지 않는다. 원본 보존과 명시적 사용자 안내를 우선한다.
10. 구조 오류 상태의 `next_action`은 사용자가 `Start`/`End`를 각각 1개로 맞추도록 구체적으로 안내해야 한다.
11. `read-only compatibility`는 문서를 열어 내용은 볼 수 있지만 편집, 저장, Publish, Run은 차단하는 호환 모드로 정의한다.

## Rationale

1. 비개발자 대상에서는 진입점과 종료점이 하나인 모델이 가장 직관적이다.
2. `Start -> Agent -> End` 순차 모델과 `Start`/`End` 각각 1개 규칙을 함께 고정해야 UI와 검증 계약이 일치한다.
3. 생성 단계부터 제약을 강제하면 Publish 시점의 늦은 실패를 줄일 수 있다.
4. 구조 위반 문서를 자동 수정하지 않으면 외부 입력과 기존 문서의 원본 보존을 유지할 수 있다.
5. `SKILL.md` only import에 기본 `Start`/`End`를 자동 생성하면 외부 입력 호환성과 내부 구조 규칙을 함께 유지할 수 있다.

## Consequences

긍정 효과:

1. 캔버스 편집 UX가 더 단순해지고 사용자의 구조적 실수가 줄어든다.
2. validator, UI, 테스트 게이트가 같은 개수 규칙 계약을 공유할 수 있다.
3. 외부 입력 문서도 데이터 손상 없이 안전하게 차단할 수 있다.

제약:

1. 다중 시작점/종료점을 쓰는 자유 그래프는 MVP 편집 대상에서 제외된다.
2. 구조 위반 문서를 자동 복구하는 UX는 후속 작업이 필요하다.
3. importer/compiler가 만든 구조도 규칙을 어기면 즉시 편집 가능한 상태로 열 수 없다.

## Scope

포함:

1. `Start`/`End` 각각 1개 규칙
2. 새 문서 생성과 캔버스 편집 UI 제약
3. load/import/compile 시 구조 위반 감지와 호환 차단 정책
4. `Draft Save`/`Publish`/`Run` 차단과 `next_action` 안내 규칙

제외:

1. 다중 시작점/다중 종료점 지원
2. cardinality 위반 자동 복구
3. Condition/branch 재도입
4. `SKILL.md` <-> `SKILL.json` 양방향 동기화

## Related Decisions

1. [ADR-0007-skill-json-single-source-and-md-generation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0007-skill-json-single-source-and-md-generation.md)
2. [ADR-0009-skill-json-v1-schema-and-acceptance-tests.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0009-skill-json-v1-schema-and-acceptance-tests.md)
3. [ADR-0010-plugin-package-layout-and-manifest.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0010-plugin-package-layout-and-manifest.md)
4. [ADR-0015-node-type-catalog-and-extension-policy.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0015-node-type-catalog-and-extension-policy.md)
5. [ADR-0018-action-only-workflow-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0018-action-only-workflow-model.md)

## Status Transition Notes

  1. (Satisfied) UI 생성/삭제 제약과 validator 단계별 차단 수준 합의
  2. (Satisfied) `SKILL.md` import/compile 후 구조 위반 문서 처리 방식 합의
- Accepted -> Superseded 조건:
  1. MVP 이후 다중 시작점/다중 종료점 모델을 공식 지원할 때
