# ADR-0014: 로컬 파일 경로와 권한 경계 정책

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

MVP는 로컬 파일 기반 설치/실행을 전제로 한다.
기본 실행 경계를 현재 프로젝트로 고정하지 않으면 비의도적 파일 접근 위험이 커진다.
반대로 사용자가 명시적으로 원할 때 외부 경로를 열 수 있어야 실제 업무 자동화에 대응할 수 있다.
OpenCode의 경계/권한 처리 방식을 우리 앱 정책의 기준으로 삼는다.

## Decision

MVP 경계 정책을 아래와 같이 고정한다.

1. 기본 허용 경계는 `현재 프로젝트(directory)`와 `worktree`로 제한한다.
2. 경계 밖 경로는 자동 허용하지 않는다.
3. 사용자가 원할 때만 `external_directory` 승인으로 외부 경로를 추가 허용한다.
4. 외부 경로 허용은 사용자 승인 기반이며, MVP에서는 세션 단위로 동작한다.
5. 우리 앱은 자체 경계 엔진을 만들지 않고 OpenCode의 경계/권한 판단을 그대로 사용한다.

## Rationale

1. OpenCode는 `Instance.containsPath`로 프로젝트 경계를 강제한다.
2. OpenCode 도구(`bash`, `write`, `apply_patch`)는 경계 밖 접근 시 `external_directory` 승인을 요구한다.
3. 기본은 닫고 필요 시 명시적으로 여는 방식이 안전성과 실용성을 동시에 만족한다.
4. 경계 판단 로직을 이중화하지 않으면 유지보수와 동작 불일치를 줄일 수 있다.

## Consequences

긍정 효과:

1. 기본 상태에서 프로젝트 외부 접근이 차단된다.
2. 사용자가 필요할 때만 외부 경로를 단계적으로 열 수 있다.
3. OpenCode와 동작 일치성이 높아져 예측 가능성이 높다.

제약:

1. 외부 파일 작업은 승인 단계가 추가되어 즉시 실행되지 않을 수 있다.
2. 승인 상태는 MVP에서 영구 저장하지 않으므로 세션 재시작 시 다시 승인할 수 있다.
3. 심볼릭 링크/크로스 드라이브 등 경계 우회 리스크는 OpenCode의 후속 보강에 의존한다.

## Scope

포함:

1. 기본 경계(`directory`, `worktree`) 정의
2. 경계 밖 접근 시 승인(`external_directory`) 정책
3. 앱-엔진 역할 분리(엔진 판단 재사용)

제외:

1. 원격 파일 시스템 접근 정책
2. 조직 단위 권한 위임/역할 기반 제어
3. OpenCode 내부 권한 시스템 재설계

## Related Decisions

1. [ADR-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0005-failure-taxonomy-and-error-ux.md)
2. [ADR-0012-skillrun-log-retention-and-masking-policy.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0012-skillrun-log-retention-and-masking-policy.md)
3. [ADR-0017-agent-card-ux-and-chat-refinement.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0017-agent-card-ux-and-chat-refinement.md)
