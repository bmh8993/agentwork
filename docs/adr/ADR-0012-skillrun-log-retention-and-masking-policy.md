# ADR-0012: SkillRun 로그 보존과 마스킹 정책

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

MVP는 로컬 실행과 디버깅 경험을 제공한다.
로그가 과도하면 사용성이 떨어지고, 민감정보가 노출되면 위험하다.
보존 범위와 마스킹 기준을 먼저 고정해야 한다.

## Decision

MVP `SkillRun` 로그의 저장 범위, 보존 기간, 마스킹 규칙을 고정한다.

핵심 결정 사항:

1. 저장 로그 포맷은 구조화 스키마 `{ service, level, message, extra? }`로 고정한다.
2. 로그 레벨은 `debug`, `info`, `warn`, `error`만 허용한다.
3. `SkillRun` 범위의 실행 로그(run/node 이벤트)만 저장한다.
4. 민감정보 패턴은 저장 전에 최소 마스킹 규칙으로 처리한다.
5. 로그 보존은 최신 10개 파일 유지로 고정한다(초과분은 오래된 순 삭제).

## Log Field Policy (MVP)

1. 필수 필드: `service`, `level`, `message`, `timestamp`, `run_id`.
2. 선택 필드: `extra`(디버깅 메타), `node_id`, `agent_id`, `error_code`.
3. 금지 필드 원문 저장: `credentials`, `token`, `secret`, `password`, `Authorization`.

## Masking Policy (MVP)

1. 키 이름 기반 차단: `password`, `secret`, `token`, `credentials`, `authorization`(대소문자 무시).
2. 값 패턴 기반 차단: `Bearer ...` 형태 토큰 문자열.
3. 마스킹 방식: 원문 전체 노출 금지, 부분 노출(앞 2자 + `…` + 뒤 2자) 또는 `hidden`.
4. 마스킹 실패/불확실 시 보수적으로 `hidden` 처리한다.

## Retention Policy (MVP)

1. 로그 파일은 타임스탬프 기반으로 저장한다.
2. 최신 10개 파일만 유지한다.
3. 11번째부터는 가장 오래된 파일부터 자동 삭제한다.
4. 원격 로그 수집/중앙집중 보관은 MVP에서 지원하지 않는다.

## Rationale

1. 디버깅 필요 정보와 개인정보 보호를 동시에 만족해야 한다.
2. 기준이 있어야 구현 채널 간 정책 일관성이 생긴다.
3. 고정된 보존 정책은 저장소 증가를 통제한다.

## Consequences

긍정 효과:

1. 보안 리스크를 줄일 수 있다.
2. 필요한 디버깅 정보는 유지된다.
3. 로그 폭증을 방지할 수 있다.

제약:

1. 마스킹 규칙 유지보수 비용이 발생한다.
2. 과도한 마스킹은 분석 가치를 낮출 수 있다.
3. 10개 파일 제한으로 장기 분석에는 별도 보관이 필요하다.

## Scope

포함:

1. `SkillRun` 실행 로그 필드 저장 기준
2. 마스킹 패턴/적용 지점
3. 파일 수 기반 보존/정리 규칙(최신 10개)

제외:

1. 중앙집중식 원격 로그 수집
2. 조직 단위 감사 로그 정책
3. 장기 보관/규제 준수 보관(archive)

## Related Decisions

1. [ADR-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0002-domain-model.md)
2. [ADR-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0005-failure-taxonomy-and-error-ux.md)
3. [ADR-0018-action-only-workflow-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/adr/ADR-0018-action-only-workflow-model.md)

## References

1. [OpenCode troubleshooting (logs)](/Users/zayden.ok/Desktop/dev-others/opencode/packages/web/src/content/docs/troubleshooting.mdx)
2. [OpenCode server logging contract](/Users/zayden.ok/Desktop/dev-others/opencode/packages/web/src/content/docs/server.mdx)
3. [OpenCode plugin structured logging](/Users/zayden.ok/Desktop/dev-others/opencode/packages/web/src/content/docs/plugins.mdx)
4. [OpenWork blocked patterns example](/Users/zayden.ok/Desktop/dev-others/openwork/packages/orchestrator/src/cli.ts)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. 저장 필드/마스킹 목록 합의
  2. 보존 기간 및 삭제 정책 합의
- Accepted -> Superseded 조건:
  1. 로그 저장 아키텍처가 로컬에서 원격 중심으로 전환될 때
