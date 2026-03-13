# Document Writing Rules

- Date: 2026-03-13
- Status: Active
- Scope: `docs/` 하위 전체 문서

## 1) Purpose

이 문서는 저장소 문서의 작성/수정/분류 규칙을 고정한다.

## 2) Document Categories (Fixed)

문서는 아래 3개 카테고리로만 관리한다.

1. 프로젝트 정책 (`docs/policy/*`, `docs/adr/*`)
2. 구현 (`docs/implementation/*`)
3. 외부 기술 참고 문서 (`docs/reference/*`)

## 3) Source of Truth Order

문서 간 충돌 시 아래 우선순위를 따른다.

1. `docs/adr/*` (확정 의사결정)
2. `docs/policy/*` (운영/검증/문서 정책)
3. `docs/implementation/IMP-00-reference.md`
4. `docs/implementation/IMP-01-blueprint.md`
5. `docs/implementation/phaseN/*`
6. `docs/reference/*` (참고, 비-정책)

## 4) Writing Rules (Common)

1. 문장은 짧고 단정적으로 쓴다.
2. 포함/제외 범위를 명시한다.
3. 경로/파일명/명령어/포맷을 구체적으로 적는다.
4. MUST/SHOULD/MAY 표현을 일관되게 사용한다.
5. 미확정 내용은 "결정"으로 쓰지 않는다.

## 5) Category-specific Rules

### 5.1 정책 문서 (`docs/policy/*`)

1. 운영 기준, 검증 기준, 예외 정책만 기록한다.
2. 문서 상단에 `Date`, `Status`, `Scope`를 반드시 둔다.
3. 구현 아이디어/브레인스토밍은 포함하지 않는다.

### 5.2 구현 문서 (`docs/implementation/*`)

1. 현재 실행 가능한 계획과 검증 절차만 기록한다.
2. `phase` 문서는 `01/02/03/04` 구조를 유지한다.
3. 범위 변경, KPI 변경, 포맷/버전 정책 변경은 ADR 승격 대상로 표시한다.

### 5.3 외부 참고 문서 (`docs/reference/*`)

1. 외부 근거는 링크와 함께 기록한다.
2. 참고 문서는 정책 결정의 단일 근거로 사용하지 않는다.
3. "우리 기준"으로 채택한 항목은 ADR 또는 policy로 승격한다.

## 6) ADR Rules (Do Not Override)

ADR 작성/변경 규칙은 `AGENTS.md`의 ADR 규칙을 따른다.

## 7) File Naming Rules

1. 정책 문서: `POL-XX-<kebab-case>.md`
2. 구현 기준 문서: `IMP-XX-<kebab-case>.md`
3. phase 문서: `phaseN/01-goal-and-scope.md`, `02-implementation.md`, `03-validation.md`, `04-handoff.md`
4. 참고 문서: `REF-XX-<kebab-case>.md`

## 8) Change Rules

1. 기존 문서 목적이 바뀌면 수정이 아니라 새 문서를 추가한다.
2. 정책 변경은 변경 이유와 영향 범위를 함께 기록한다.
3. 구현 문서의 완료 항목은 archive 이동 후 수정하지 않는다.

## 9) Checklist (Before Merge)

1. 문서 카테고리가 올바른가?
2. SoT 우선순위와 충돌하지 않는가?
3. 경로/파일명/링크가 실제 파일과 일치하는가?
4. 검증 기준(Pass/Fail)이 필요한 문서에 명시되어 있는가?
5. 결정 변경이 ADR 승격 대상인지 검토했는가?
