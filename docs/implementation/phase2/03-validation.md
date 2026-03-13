# Phase 2 - Validation Plan

- Date: 2026-03-13
- Status: Ready

## Validation

### V1. agent-card-required-slots

시나리오:

1. Agent 카드 생성 후 슬롯별 입력 전/후 상태 확인
2. `Action`, `Done Criteria` 누락 상태 유지

기대 결과:

1. 누락 슬롯이 시각적으로 표시된다.
2. 필수 슬롯 입력 시 경고가 해제된다.

### V2. draft-vs-publish-gate

시나리오:

1. 필수 필드 누락 상태에서 Draft Save
2. 동일 상태에서 Publish 시도

기대 결과:

1. Draft Save는 성공
2. Publish는 실패(`publish_required_field_missing`)
3. `next_action`이 명시된다.

### V3. unsupported-node-readonly-ui

시나리오:

1. unsupported node 포함 문서를 Load(Open)
2. read-only 배너/버튼 상태 확인

기대 결과:

1. read-only compatibility 배너가 보인다.
2. Publish/Run 버튼이 비활성화된다.
3. 원본 데이터가 변경되지 않는다.

### V4. ui-error-next-action

시나리오:

1. Publish 오류와 Run 오류를 각각 발생시킴
2. 오류 카드의 필드 렌더 확인

기대 결과:

1. 모든 오류 카드에 `error_code`, `message_user`, `next_action`이 표시된다.
2. 단계별 오류라도 UI 구조는 동일하다.

### V5. minimal-graph-constraint

시나리오:

1. `Start` 없는 그래프, `End` 없는 그래프, 단절 그래프 생성
2. Draft/Publish 동작 확인

기대 결과:

1. 구조 위반은 사용자에게 명확히 안내된다.
2. Publish는 strict 실패로 차단된다.

## Pass/Fail 기준

1. V1~V5 전부 기대 결과를 만족하면 Pass
2. 하나라도 실패하면 Fail
3. Fail 시 재현 단계와 수정 계획을 `04-handoff.md`에 업데이트

## Manual Check Notes

1. 검증 리포트는 요청/응답 4개 섹션 포맷으로 공유한다.
2. 테스트 로그에는 화면 상태와 에러 코드를 함께 남긴다.
