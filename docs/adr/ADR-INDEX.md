# ADR Index and Status Board

- Date: 2026-03-18
- Status: Active
- Scope: `docs/adr/*`

## 1) Summary

1. Total ADR: `23`
2. `Accepted`: `16`
3. `Superseded`: `6`
4. `Proposed`: `1`

## 2) Accepted

| ADR | Date | Title |
|---|---|---|
| `ADR-0002` | 2026-03-12 | 도메인 모델 정의 (MVP) |
| `ADR-0005` | 2026-03-12 | 실패 분류 체계와 에러 UX 표준 (MVP) |
| `ADR-0007` | 2026-03-12 | SKILL.json 단일 SoT와 SKILL.md 생성 규칙 |
| `ADR-0008` | 2026-03-12 | SKILL.json 스키마 버전/호환/마이그레이션 정책 |
| `ADR-0009` | 2026-03-12 | SKILL.json v1 스키마와 수용 테스트 기준 |
| `ADR-0010` | 2026-03-12 | Plugin 패키지 레이아웃과 매니페스트 규격 |
| `ADR-0012` | 2026-03-12 | SkillRun 로그 보존과 마스킹 정책 |
| `ADR-0014` | 2026-03-12 | 로컬 파일 경로와 권한 경계 정책 |
| `ADR-0015` | 2026-03-12 | 노드 타입 카탈로그와 확장 승인 정책 |
| `ADR-0016` | 2026-03-12 | MVP 플러그인 설치 채널(Local + npm) 지원 |
| `ADR-0017` | 2026-03-12 | Agent 카드 중심 UX와 채팅 구체화 플로우 |
| `ADR-0018` | 2026-03-12 | Action 텍스트 중심 워크플로우 모델 (Condition 제거) |
| `ADR-0019` | 2026-03-14 | Start/End 각각 1개 고정과 구조 오류 호환 정책 |
| `ADR-0020` | 2026-03-17 | AgentNode 조합 단위와 Action 소유권 명확화 |
| `ADR-0021` | 2026-03-17 | AgentNode 리소스 참조 필드 shape 고정 |
| `ADR-0022` | 2026-03-17 | Platform-neutral Assistant Package Canonical과 AgentNode Reference |

## 3) Superseded

| ADR | Date | Title |
|---|---|---|
| `ADR-0001` | 2026-03-12 | MVP 배포/설치/실행 경계 정의 |
| `ADR-0003` | 2026-03-12 | Skill Canonical 문서와 GUI 메타 분리 |
| `ADR-0004` | 2026-03-12 | Skill 캔버스 최소 실행 규칙 (MVP) |
| `ADR-0006` | 2026-03-12 | SKILL-META.md 최소 스키마와 좌표 규칙 (MVP) |
| `ADR-0011` | 2026-03-12 | 내부 Condition 표현식 평가 정책 (UI 비노출) |
| `ADR-0013` | 2026-03-12 | Run 상태 머신과 Timeout/Cancel 정책 |

## 4) Proposed

| ADR | Date | Title |
|---|---|---|
| `ADR-0023` | 2026-03-18 | Graph Fan-out/Fan-in 기반 Parallel AgentNode Execution |

## 5) Lifecycle Rules

1. 신규 결정은 `ADR-XXXX-*.md`로 추가한다.
2. 기존 결정을 뒤집을 때는 기존 ADR을 수정하지 않는다.
3. 새 ADR을 추가하고 기존 ADR의 `Status`를 `Superseded`로 변경한다.
4. 대체 관계는 양쪽 ADR의 `Related Decisions`에 기록한다.
5. 이 인덱스는 ADR 상태가 바뀔 때 같이 업데이트한다.

## 6) Update Checklist

1. 신규 ADR 번호가 순번 규칙(`0001`, `0002`, ...)을 지켰는가?
2. `Status`, `Date`, `Related Decisions`가 모두 채워졌는가?
3. 이 인덱스의 Summary 수치가 최신인가?
4. `Accepted`/`Superseded` 섹션 이동이 반영됐는가?
