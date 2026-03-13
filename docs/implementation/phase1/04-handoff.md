# Phase 1 - Handoff

- Date: 2026-03-13
- Status: Active

## Handoff Prompt

```md
[Phase] phase1
[Task] Stage validator(Load/Draft/Publish/Run) 골격을 구현하고 publish required fields 게이트를 추가해.
[Scope In] AJV 기반 schema validator 연동, stage별 에러코드 매핑, publish_required_field_missing 반환, 관련 단위 테스트
[Scope Out] 설치 채널 구현, workflow UI 편집 기능, 로그 마스킹
[Validation] missing field fixture로 Draft Save와 Publish 결과 차이를 확인하고, run strict 차단을 확인할 것
[Done] 필수 테스트 게이트 중 schema-contract/publish-gate-required-fields/run-gate-strict 통과 + 변경 파일/검증 절차/Pass-Fail/다음 1단계 보고
```

## Reporting Template

아래 형식으로 응답한다.

1. What I changed
2. How to verify
3. Pass/Fail 기준
4. Next 1 step

## Next 1 Step (default)

`Task 1 Validator Contract Skeleton`부터 시작하고, 완료 즉시 `Task 2 Stage Validator 분리`로 진행한다.
