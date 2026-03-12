# AGENTS.md

## Documentation Rules

이 저장소의 제품/설계 의사결정은 ARD(Architecture/Decision Record)로 관리한다.

### 1) 원칙

1. "확정된 내용만" 문서화한다.
2. 미확정/아이디어/옵션 비교는 ARD에 기록하지 않는다.
3. 한 ARD에는 하나의 핵심 결정만 담는다.
4. ARD는 결론(Decision)과 이유(Rationale)를 반드시 함께 기록한다.

### 2) 위치와 파일명

1. 경로: `docs/ard/`
2. 파일명: `ARD-XXXX-<kebab-case-title>.md`
3. 번호는 4자리 순번(`0001`, `0002`, ...)
4. 신규 ARD는 `docs/ard/ARD-template.md` 복사로 시작한다.

### 3) 필수 섹션

아래 섹션은 항상 포함한다.

1. `Status` (`Proposed`, `Accepted`, `Superseded`)
2. `Date` (YYYY-MM-DD)
3. `Context`
4. `Decision`
5. `Rationale`
6. `Consequences` (긍정/제약)
7. `Scope` (포함/제외)
8. `Related Decisions` (후속 ARD 링크/번호)

### 4) 작성 규칙

1. 문장은 짧고 단정적으로 쓴다.
2. 실행 가능한 수준의 경계(포함/제외)를 명확히 쓴다.
3. 도구명/경로/포맷은 가능한 한 구체적으로 쓴다.
4. KPI, 수용 기준, 범위 변경은 ARD로 남긴다.

### 5) 변경 규칙

1. 기존 결정을 뒤집을 때는 기존 ARD를 직접 덮어쓰지 않는다.
2. 새 ARD를 추가하고 기존 ARD 상태를 `Superseded`로 변경한다.
3. 어떤 ARD를 대체했는지 `Related Decisions`에 명시한다.

### 6) 현재 확정된 기준 (MVP)

1. Marketplace 연동은 제외한다.
2. OpenCode plugin 설치 채널은 `local(folder only) + npm`을 지원한다(`zip` 미지원).
3. Skill canonical은 `SKILL.json`으로 관리하고, `SKILL.md`는 generated artifact로 관리한다.
4. 실행 환경은 로컬 실행만 지원한다.
5. 워크플로우 모델은 Action 텍스트 중심이며, Condition은 MVP에서 사용하지 않는다.
6. 워크플로우 최소 노드 타입은 `Start`, `Agent`, `End` 3종으로 고정한다.
7. Agent 카드 필수 슬롯은 `Knowledge`, `Tool`, `Action`, `Done Criteria`이며, `Action`/`Done Criteria`는 Publish 전 필수다.
8. `Draft Save`는 허용한다. `Publish`/`Run`은 strict 검증 통과 시에만 허용한다.
9. 비지원 노드 타입은 `Load(Open)`에서 read-only 호환 모드로 열고 원본을 보존한다. `Publish`/`Run`은 차단한다.
10. `Publish`는 파일 포맷 버전을 변경하지 않는다(`SKILL.json.version` 유지).

근거 ARD:

1. ARD-0016 (설치 채널)
2. ARD-0007, ARD-0008, ARD-0009 (canonical/검증)
3. ARD-0017, ARD-0018 (UX/워크플로우 모델)
4. ARD-0015 (비지원 노드/확장 정책)
