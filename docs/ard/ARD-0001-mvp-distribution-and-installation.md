# ARD-0001: MVP 배포/설치/실행 경계 정의

- Status: Superseded
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

초기 논의에서 "OpenCode 기반 GUI" 제품의 설치 소스와 실행 범위를 어디까지 둘지 선택이 필요했다.
특히 비개발자 대상 MVP에서는 마켓플레이스 연동보다 단순하고 실패율이 낮은 경로가 우선이다.
본 결정의 설치 채널 정책은 ARD-0016에서 대체되었다.

## Decision

MVP는 아래 4가지를 고정한다.

1. Marketplace 연동은 제외한다.
2. OpenCode plugin 설치는 "로컬 파일 기반 설치"만 지원한다.
3. 공유 방식은 텍스트 파일 기반으로 제한한다(`SKILL.json` canonical + `SKILL.md` generated).
4. 실행 환경은 로컬 실행만 지원한다(원격/클라우드 실행 제외).

## Rationale

1. 구현 복잡도를 줄이고 초기 성공률을 높일 수 있다.
2. 비개발자 온보딩에서 설치 실패 요인을 최소화할 수 있다.
3. 공유 포맷을 텍스트 기반(`.json`, `.md`)으로 고정하면 버전 관리와 전달이 단순하다.
4. 보안/권한/인프라 의존성을 줄여 빠른 MVP 검증이 가능하다.

## Consequences

긍정 효과:

1. UI/UX 핵심(설치 단순화, 조합 경험) 검증에 집중할 수 있다.
2. 배포/운영 인프라 없이도 로컬 사용자 테스트가 가능하다.

제약:

1. 마켓플레이스 검색/설치 경험은 MVP에서 제공하지 않는다.
2. 팀 단위 공유/배포 자동화는 수동 텍스트 전달에 의존한다.
3. 원격 실행/스케일링 요구는 후속 단계로 이관된다.

## Scope

포함:

1. 로컬 plugin import/install GUI
2. 설치된 plugin 리소스(Agent/Tool/Knowledge) 조합
3. Skill 실행 및 로그 확인
4. `SKILL.json` import/export 및 `SKILL.md` 생성물 관리

제외:

1. Marketplace Installer UI
2. 클라우드 런타임
3. 권한/조직 관리

## Related Decisions

연결된 결정:

1. [ARD-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0002-domain-model.md)
2. [ARD-0007-skill-json-single-source-and-md-generation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0007-skill-json-single-source-and-md-generation.md)

연결된 후속 결정:

1. [ARD-0004-skill-canvas-minimum-execution-rules.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0004-skill-canvas-minimum-execution-rules.md)
2. [ARD-0005-failure-taxonomy-and-error-ux.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0005-failure-taxonomy-and-error-ux.md)
3. Superseded by: [ARD-0016-mvp-plugin-install-channels-local-and-npm.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0016-mvp-plugin-install-channels-local-and-npm.md)
