# Phase 3 - Handoff

- Date: 2026-03-13
- Status: Active

## ⚠️ Phase 1-2 Completion Review

**Phase 3를 시작하기 전에 먼저 읽어야 할 문서:**

1. **`docs/implementation/phase1/04-handoff.md`** - 백엔드 검증 로직
   - `validateRun` - 실행 전 strict 검증
   - Error contract - 에러 코드 매핑

2. **`docs/implementation/phase2/04-handoff.md`** - UI 연동 상태
   - Agent 카드 필수 슬롯 완료 여부
   - Draft/Publish 게이트 UX 완료 여부

**완료하지 않으면 Phase 3 진행 불가:**
- ✅ Phase 1: `run-gate-strict` 게이트 통과
- ✅ Phase 2: Agent 카드 필수 슬롯 UX 동작
- ✅ Phase 2: Draft/Publish 경계 확인

---

## Handoff Prompt

```md
[Phase] phase3
[Task] installer source gate(local/npm only)와 run strict gate를 통합하고 npm 오류 매핑을 추가해.
[Scope In] unsupported_source 차단, package layout 검증, dependency_resolution_failed 매핑, run 사전검증 차단, 관련 테스트
[Scope Out] marketplace/zip 지원 확대, 원격 실행, 고급 대시보드
[Validation] zip 설치 차단, npm 실패 코드 매핑, strict 실패 run 차단을 확인할 것
[Done] install-folder-only/installer-npm-errors/run-gate-strict 게이트 통과 + 변경 파일/검증 절차/Pass-Fail/다음 1단계 보고
```

## Reporting Template

아래 형식으로 응답한다.

1. What I changed
2. How to verify
3. Pass/Fail 기준
4. Next 1 step

## Next 1 Step (default)

`Task 1 Installer Source Gate`를 먼저 구현하고, 즉시 `Task 2 Package Layout Validation`으로 진행한다.
