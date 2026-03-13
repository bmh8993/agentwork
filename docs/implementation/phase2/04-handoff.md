# Phase 2 - Handoff

- Date: 2026-03-13
- Status: Active

## Handoff Prompt

```md
[Phase] phase2
[Task] Agent 카드 필수 슬롯 UX와 Draft/Publish 게이트를 연결해.
[Scope In] 슬롯 렌더/입력 상태 관리, publish_required_field_missing 매핑, 오류 카드 next_action 표시, 관련 UI 테스트
[Scope Out] installer 구현, 로그 마스킹, run orchestrator 상세 정책
[Validation] 필수 슬롯 누락 상태에서 Draft Save 성공과 Publish 실패를 확인하고, 오류 카드에 next_action이 표시되는지 확인할 것
[Done] publish-gate-required-fields/ui-error-next-action 게이트 통과 + 변경 파일/검증 절차/Pass-Fail/다음 1단계 보고
```

## Reporting Template

아래 형식으로 응답한다.

1. What I changed
2. How to verify
3. Pass/Fail 기준
4. Next 1 step

## Next 1 Step (default)

`Task 1 Node Palette and Graph Constraints`를 적용한 뒤 `Task 2 Agent Card Required Slots UX`로 이어간다.
