# ARD-0016: MVP 플러그인 설치 채널(Local + npm) 지원

- Status: Accepted
- Date: 2026-03-12
- Deciders: Product Owner, Builder

## Context

기존 MVP 결정은 플러그인 설치 채널을 로컬 파일 기반으로 제한했다.
하지만 OpenCode 기본 사용 방식은 로컬 파일과 npm 경로를 함께 지원한다.
제품이 OpenCode 생태계와 호환성을 확보하려면 설치 채널을 동일하게 맞출 필요가 있다.

## Decision

MVP 플러그인 설치 채널은 `local files + npm` 두 경로를 모두 지원한다.
Marketplace 연동은 계속 제외한다.

핵심 결정 사항:

1. 로컬 파일 기반 설치는 폴더 import만 지원한다(`zip` 미지원).
2. npm 기반 설치를 지원한다.
3. Marketplace 검색/스토어 UI는 MVP에서 제외한다.
4. 런타임은 계속 로컬 실행만 지원한다.

## Rationale

1. OpenCode 기본 채널과 정렬하면 사용자 기대와 사용성이 일치한다.
2. npm 지원은 재사용 가능한 플러그인 도입 속도를 높인다.
3. Marketplace 제외를 유지하면 MVP 복잡도는 통제할 수 있다.

## Consequences

긍정 효과:

1. 설치 경로 선택지가 늘어나 온보딩 유연성이 높아진다.
2. OpenCode 생태계 자산을 MVP에서 활용할 수 있다.

제약:

1. npm 설치 실패/의존성 충돌에 대한 오류 처리가 필요하다.
2. 네트워크 의존 시나리오에 대한 테스트/가이드 비용이 추가된다.

## Scope

포함:

1. 로컬 파일 설치 UX와 검증 규칙
2. npm 설치 UX와 검증/오류 처리 규칙
3. 설치된 plugin 리소스 조합 및 로컬 실행

제외:

1. Marketplace Installer UI
2. 클라우드 런타임
3. 조직/권한 관리

## Related Decisions

1. [ARD-0001-mvp-distribution-and-installation.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0001-mvp-distribution-and-installation.md) (Superseded)
2. [ARD-0010-plugin-package-layout-and-manifest.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0010-plugin-package-layout-and-manifest.md)
3. [ARD-0002-domain-model.md](/Users/zayden.ok/Desktop/dev-others/agent-work/docs/ard/ARD-0002-domain-model.md)

## References

1. [OpenCode Docs - Plugins](https://opencode.ai/docs/plugins/)
2. [OpenCode Docs - Ecosystem](https://opencode.ai/docs/ecosystem/)

## Status Transition Notes

- Proposed -> Accepted 조건:
  1. MVP 채널에 local+npm 포함 합의
  2. Marketplace 제외 원칙 유지 합의
- Accepted -> Superseded 조건:
  1. Marketplace 채널을 MVP 기본으로 승격할 때
  2. 설치 채널 정책이 재정의될 때
