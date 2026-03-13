# Phase 2 - Implementation Breakdown

- Date: 2026-03-13
- Status: Ready

## Tasks

### Task 1. Node Palette and Graph Constraints

1. 캔버스에서 생성 가능한 노드 타입을 `Start`, `Agent`, `End`로 제한
2. 최소 연결 규칙(`Start -> Agent -> End`) 유효성 검사
3. 비정상 그래프 상태를 Draft 수준 경고로 표시

완료 기준:

1. 비지원 타입 생성 UI가 노출되지 않는다.
2. 그래프 최소 구조 위반 시 사용자 경고가 보인다.

### Task 2. Agent Card Required Slots UX

1. Agent 카드에 `Knowledge`, `Tool`, `Action`, `Done Criteria` 슬롯 렌더
2. 빈 필드 상태에서 슬롯별 validation 힌트 표시
3. 슬롯 변경이 workflow state에 즉시 반영

완료 기준:

1. 필수 슬롯 위치와 편집 경로가 일관된다.
2. 편집값이 새로고침/재오픈 후 유지된다.

### Task 3. Draft Save vs Publish Gate

1. Draft Save 버튼은 구조 무결성만 검증
2. Publish 버튼은 `Action`/`Done Criteria` strict 검증
3. Publish 실패 시 `publish_required_field_missing` 매핑

완료 기준:

1. 동일 문서에서 Draft Save는 성공, Publish는 실패 가능한 상태가 재현된다.
2. Publish 실패 메시지에 `next_action`이 포함된다.

### Task 4. Unsupported Node Read-only Mode UX

1. Load 단계에서 unsupported node 탐지 플래그 구독
2. 화면 상단에 read-only compatibility 배너 표시
3. Publish/Run 버튼 비활성 + 사유 안내

완료 기준:

1. unsupported node 문서를 안전하게 열 수 있다.
2. 원본 변경 작업으로 진입하지 않는다.

### Task 5. Error Presentation Consistency

1. 오류 패널 공통 컴포넌트(코드/메시지/다음 행동) 적용
2. ValidationError와 InstallError 표기 규칙 통일
3. 사용자 복구 흐름 CTA(필드로 이동/문서 열기) 연결

완료 기준:

1. 에러 UI가 stage와 무관하게 같은 구조를 갖는다.
2. `next_action`이 누락되지 않는다.

### Task 6. UI Contract Tests

1. Publish 게이트 테스트 작성(필드 누락/충족 케이스)
2. read-only compatibility 테스트 작성
3. 에러 카드 렌더 테스트(`ui-error-next-action`) 작성

완료 기준:

1. 핵심 UI 게이트 테스트가 자동화된다.
2. 실패 시 원인을 에러 코드 기준으로 즉시 식별할 수 있다.

## Open Questions

1. Agent 카드의 `Knowledge`/`Tool` 필드 최소 요구사항을 Publish 필수로 볼지 여부
2. read-only 모드에서 허용할 뷰 액션(복사/내보내기) 범위
3. 그래프 자동 정렬/자동 연결 보정 기능을 MVP에 포함할지 여부

## Artifacts (expected)

1. workflow canvas/agent card UI 모듈
2. publish gate state/action 로직
3. compatibility read-only 배너/차단 처리
4. UI contract test 파일
