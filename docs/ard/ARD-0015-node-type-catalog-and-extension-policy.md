# ARD-0015: 노드 타입 카탈로그와 확장 승인 정책

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

MVP 실행 규칙은 단순성과 예측 가능성을 우선한다.
기본 노드 타입은 ARD-0018에서 `Start`, `Agent`, `End` 3종으로 확정되었다.
이 문서의 목적은 "기본 타입 재정의"가 아니라 "신규 타입 확장 통제"를 고정하는 것이다.
추가 타입이 무계획으로 늘어나면 실행/검증/UX 복잡도가 급격히 증가한다.

## Decision

MVP 노드 타입 확장 정책과 비지원 타입 처리 규칙을 고정한다.

핵심 결정 사항:

1. MVP 기본 노드 타입은 ARD-0018 기준(`Start`, `Agent`, `End`)을 따른다.
2. 기본 타입 외 노드는 `비지원(unsupported)`으로 취급한다.
3. 비지원 노드는 문서 로드 시 보존한다. 실행과 편집은 차단한다.
4. UI는 비지원 노드를 숨기지 않고 `Unsupported` 상태와 다음 액션을 명시한다.
5. 신규 노드 타입 도입은 별도 ARD 승인 후에만 허용한다.
6. 단계별 강제 수준은 아래로 고정한다.
   1. `Load(Open)`: read-only 호환 모드 허용(원본 보존).
   2. `Publish`/`Run`: strict 검증으로 차단.
7. 신규 타입 ARD에는 최소 4가지를 반드시 포함한다.
   1. 실행 의미(상태 전이/분기 포함 여부)
   2. 검증 규칙(스키마/런타임 제약)
   3. 실패 코드와 사용자 `next_action`
   4. 마이그레이션/호환 및 수용 테스트 갱신

## Rationale

1. 기본 타입 기준을 ARD-0018에 단일화하면 중복 결정을 줄일 수 있다.
2. 확장 승인 절차는 범위 확장을 통제한다.
3. 비지원 노드 보존 규칙은 데이터 손실을 방지한다.
4. 실행/편집 차단과 명시적 안내는 예측 가능한 실패 UX를 만든다.
5. 실행 의미와 검증 규칙을 함께 확정해야 회귀 위험이 줄어든다.

## Consequences

긍정 효과:

1. MVP 구현과 테스트 범위가 안정된다.
2. 노드 확장 시 영향 범위를 명확히 검토할 수 있다.
3. 비지원 타입이 포함된 문서를 열 때도 데이터 보존이 가능하다.

제약:

1. 고급 시나리오 표현력은 제한된다.
2. 신규 타입 도입 속도가 느려질 수 있다.
3. 비지원 노드가 있을 때 실행 불가 상태를 사용자가 먼저 해소해야 한다.

## Scope

포함:

1. MVP 기본 타입 참조 기준(ARD-0018)
2. 비지원 노드의 로드/실행/편집/UI 처리 규칙
3. 신규 노드 타입 승인 절차 원칙

제외:

1. 신규 노드 타입의 상세 스펙
2. Non-MVP 확장 타입 우선순위 로드맵

## Related Decisions

1. [ARD-0018-action-only-workflow-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0018-action-only-workflow-model.md)
2. [ARD-0009-skill-json-v1-schema-and-acceptance-tests.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0009-skill-json-v1-schema-and-acceptance-tests.md)
3. [ARD-0008-skill-json-schema-versioning-and-migration-policy.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0008-skill-json-schema-versioning-and-migration-policy.md)
4. [ARD-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0005-failure-taxonomy-and-error-ux.md)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. (Satisfied) 기본 3종(`Start`, `Agent`, `End`) 기준 재확인
  2. (Satisfied) 비지원 노드 처리 규칙 합의
  3. (Satisfied) 신규 타입 ARD 승인 절차 합의
- Accepted -> Superseded 조건:
  1. 타입 확장 정책 또는 비지원 노드 처리 규칙이 재정의될 때
