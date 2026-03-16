# ADR-0010: Plugin 패키지 레이아웃과 매니페스트 규격

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

MVP는 local files와 npm 두 설치 채널을 지원한다.
설치 성공률을 높이려면 채널별 패키지 구조와 필수 메타 규격이 고정되어야 한다.
규격이 없으면 import/install 실패 원인이 불명확해진다.

## Decision

MVP plugin 설치 채널별 입력 포맷과 패키지 레이아웃/매니페스트를 고정한다.

핵심 결정 사항:

1. local 채널은 `folder only`로 제한한다(`zip` 미지원).
2. npm 채널 입력은 `name` 또는 `name@version`만 허용한다(URL/tarball 미지원).
3. 설치 경로는 기본 `project`로 하며, 사용자 선택으로 `global` 설치를 허용한다.
4. plugin 루트에는 `SKILL.json` 또는 `SKILL.md` 중 하나가 반드시 있어야 한다.
5. `SKILL.md`만 있는 경우 설치 단계에서 `SKILL.json`으로 컴파일한다.
6. 최소 매니페스트 스키마는 `name`, `version`, `skills`(또는 `entry`)를 필수로 한다.
7. 검증 실패는 표준 오류 코드(`missing_required_file`, `invalid_package_layout`, `unsupported_source`, `skill_compile_failed`, `dependency_resolution_failed`)로 반환한다.
8. 보안 제약은 강제한다(path traversal 차단, symlink 기본 금지, 민감 필드 차단).

## Install Policy (MVP)

1. local 설치 입력은 디렉터리 경로만 허용한다.
2. npm 설치 입력은 레지스트리 패키지 식별자만 허용한다.
3. 설치 전 검증에 실패하면 파일 쓰기 없이 즉시 중단한다.

## Compiler Policy (MVP)

1. `SKILL.json`이 있으면 canonical로 사용한다.
2. `SKILL.md`만 있으면 `SKILL.md -> SKILL.json` 컴파일을 수행한다.
3. 컴파일 결과는 `ADR-0009` 스키마 검증과 `ADR-0019` 구조 규칙 검증을 반드시 통과해야 한다.
4. 컴파일 실패 시 원본은 보존하고 `skill_compile_failed`를 기록한다.

## Security Policy (MVP)

1. 경로 정규화 후 workspace 경계를 벗어나는 접근을 차단한다.
2. symlink는 기본 금지한다.
3. 금지 필드(`credentials`, `pinData`, `instanceId`)가 발견되면 설치를 차단한다.
4. 검증 우회 경로(부분 설치, 경고 후 진행)를 허용하지 않는다.

## Rationale

1. 고정 규격은 설치 UX를 단순하게 만든다.
2. 실패 원인 분류와 가이드 자동화가 쉬워진다.
3. 강한 입력/보안 제약은 공급망 및 파일시스템 리스크를 줄인다.

## Consequences

긍정 효과:

1. 설치 실패율을 낮출 수 있다.
2. 디버깅 시간이 줄어든다.
3. 보안 사고 가능성을 낮출 수 있다.

제약:

1. `zip` 미지원으로 일부 사용자 편의가 줄어든다.
2. npm URL/tarball 미지원으로 초기 유연성이 제한된다.
3. 검증 규칙 유지보수 비용이 든다.

## Scope

포함:

1. local/npm 입력 규격
2. 패키지 레이아웃 규칙
3. 매니페스트 최소 스키마
4. `SKILL.md -> SKILL.json` 컴파일 정책
5. 설치 단계 검증 실패 코드
6. 보안 제약 규칙

제외:

1. 원격 레지스트리/마켓플레이스 배포 규격
2. 서명/공급망 보안 고급 정책
3. npm URL/tarball 직접 설치
4. zip import 지원

## Related Decisions

1. [ADR-0016-mvp-plugin-install-channels-local-and-npm.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0016-mvp-plugin-install-channels-local-and-npm.md)
2. [ADR-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0002-domain-model.md)
3. [ADR-0007-skill-json-single-source-and-md-generation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0007-skill-json-single-source-and-md-generation.md)
4. [ADR-0009-skill-json-v1-schema-and-acceptance-tests.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0009-skill-json-v1-schema-and-acceptance-tests.md)
5. [ADR-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0005-failure-taxonomy-and-error-ux.md)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. local/npm 입력 규격 합의
  2. 컴파일/검증/보안 제약 합의
- Accepted -> Superseded 조건:
  1. 배포 채널/패키지 규격이 전면 개편될 때
