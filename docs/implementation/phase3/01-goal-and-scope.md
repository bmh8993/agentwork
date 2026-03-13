# Phase 3 - Goal and Scope

- Date: 2026-03-13
- Status: Ready

## Goal

설치(local folder + npm), 실행 게이트, 로그 보안(마스킹/보존), 산출물 생성(`SKILL.json -> SKILL.md`)을 통합해 MVP를 완료한다.

## Scope In

1. installer 채널 구현(local folder + npm)
2. 설치 입력/레이아웃 검증(`missing_required_file`, `invalid_package_layout`, `unsupported_source`)
3. npm 설치 실패 시 표준 에러 매핑(`dependency_resolution_failed` 등)
4. Run 시작 전 strict 검증 게이트 연결
5. 구조화 로그 + 마스킹 정책 적용
6. 로그 보존/정리 정책 적용
7. `SKILL.json -> SKILL.md` generated artifact 파이프라인 연결

## Scope Out

1. Marketplace/zip 채널
2. 원격 실행 환경
3. Condition 기반 런타임 분기
4. 고급 운영 관측 대시보드

## Constraints (from ADR)

1. 설치 채널은 local folder + npm만 지원한다.
2. 실행 환경은 로컬 실행만 지원한다.
3. canonical은 `SKILL.json`이며 `SKILL.md`는 generated artifact다.
4. 민감 정보는 로그에 평문으로 남기지 않는다.
5. Publish는 포맷 버전을 변경하지 않는다.

## Exit Criteria

1. zip/unsupported source 입력이 설치 단계에서 차단된다.
2. npm 설치 오류가 표준 에러 코드로 노출된다.
3. Run strict 실패 시 실행이 시작되지 않는다.
4. 로그 마스킹/보존 정책이 검증된다.
5. `SKILL.json -> SKILL.md` 생성이 안정적으로 동작한다.

## Artifacts

1. `docs/implementation/phase3/02-implementation.md`
2. `docs/implementation/phase3/03-validation.md`
3. `docs/implementation/phase3/04-handoff.md`
4. (코드 시작 시) installer/run-orchestrator/logging/generator 관련 파일
