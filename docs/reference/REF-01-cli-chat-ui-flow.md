# CLI to Chat UI Flow (OpenWork Reference)

- Date: 2026-03-12
- Purpose: `openwork`에서 CLI 실행 결과가 Chat UI로 전달되는 실제 경로를 구현 관점으로 정리
- Scope: 외부 레퍼런스(OpenWork) 분석 문서이며, 코드 경로/라인 번호는 참고 시점 스냅샷 기준이다.

## 1. 결론 요약

OpenWork는 **CLI stdout/stderr를 채팅 본문으로 직접 렌더링하지 않는다**.  
채팅 본문은 OpenCode 서버의 **SSE 이벤트(`event.subscribe`)**를 통해 반영된다.

즉, 구조는 아래와 같다.

1. CLI(orchestrator)가 엔진 프로세스 실행
2. UI는 SDK 클라이언트로 prompt 요청
3. UI session store가 SSE 이벤트 수신
4. 이벤트를 message/part 상태로 반영
5. Chat 컴포넌트가 part 타입별로 렌더

## 2. 단계별 데이터 흐름

### 2.1 Process Start (CLI)

1. orchestrator CLI가 `opencode serve`를 `spawn`으로 실행한다.
2. `stdout/stderr`는 `prefixStream`으로 수집되어 로그로 처리한다.

관련 파일:

1. `packages/orchestrator/src/cli.ts`
2. `startOpencode(...)`
3. `prefixStream(...)`

### 2.2 Prompt Request (UI)

1. UI가 `session.promptAsync(...)` 또는 `session.command(...)`를 호출한다.
2. 호출은 `createClient(...)`로 생성된 SDK 클라이언트를 사용한다.

관련 파일:

1. `packages/app/src/app/app.tsx`
2. `packages/app/src/app/lib/opencode.ts`

### 2.3 Streaming Sync (SSE)

1. session store가 `c.event.subscribe(...)`로 SSE 스트림을 구독한다.
2. 수신 이벤트는 큐/코얼레싱 후 배치로 적용된다.
3. reconnect(backoff) 로직으로 스트림 단절을 복구한다.
4. 별도로 `global-sdk`에도 `event.subscribe(...)`가 존재하지만, 채팅 타임라인 상태 반영의 중심은 `context/session.ts`다.

관련 파일:

1. `packages/app/src/app/context/session.ts`
2. `connectSse(...)`
3. `applyEvent(...)`

### 2.4 State Projection

주요 이벤트 반영 규칙:

1. `message.updated`: 메시지 메타(`MessageInfo`) 갱신
2. `message.part.updated`: 파트(`Part`) 누적/병합(특히 text delta)
3. `session.status`, `session.idle`, `session.error`: 세션 상태 갱신
4. `todo.updated`, `permission.*`, `question.*`: 부가 상태 갱신

`messages`는 `MessageInfo + parts[]`로 합성된다.

### 2.5 Chat Rendering

1. `message-list`가 renderable parts를 필터링한다.
2. `groupMessageParts(...)`로 타임라인/스텝 뷰를 구성한다.
3. `PartView`가 `text/tool/agent/file` 타입별 UI를 렌더한다.

관련 파일:

1. `packages/app/src/app/components/session/message-list.tsx`
2. `packages/app/src/app/components/part-view.tsx`

## 3. stdout/stderr의 역할

`stdout/stderr`는 채팅 본문 소스가 아니라 다음 용도다.

1. orchestrator/sidecar/engine 운영 로그
2. 상태 진단(설정 화면의 `lastStdout`/`lastStderr`)

관련 파일:

1. `packages/orchestrator/src/cli.ts`
2. `packages/app/src/app/pages/settings.tsx`

## 4. 우리 구현에 주는 기준

OpenWork와 동일한 UX를 원하면 다음 경계를 유지해야 한다.

1. Chat 본문 데이터 소스는 `event stream(SSE)`로 고정한다.
2. CLI 출력은 별도 diagnostics/log 패널로 분리한다.
3. session store에 `event -> state` 단일 변환 지점을 둔다.
4. `message.updated`와 `message.part.updated`를 분리 처리한다.
5. UI는 `Part` 타입 중심으로 렌더한다(텍스트/툴/파일/에이전트).

## 5. 체크리스트

1. `prompt` 요청 API와 `event.subscribe` 스트림이 동일 세션 ID 기준으로 연결되는가
2. part delta 병합 로직이 있는가(스트리밍 텍스트 누적)
3. SSE 단절 시 reconnect/backoff가 있는가
4. CLI 로그가 채팅 본문으로 섞이지 않는가
5. tool part를 별도 시각화(상태, 입력/출력, 오류)하는가

## 6. 코드 근거 (핵심 라인)

1. Process start / spawn
   1. `packages/orchestrator/src/cli.ts:2708` (`startOpencode`)
   2. `packages/orchestrator/src/cli.ts:2728` (`spawnProcess`)
2. CLI stdout/stderr 처리
   1. `packages/orchestrator/src/cli.ts:1025` (`prefixStream`)
   2. `packages/orchestrator/src/cli.ts:2755`
   3. `packages/orchestrator/src/cli.ts:2756`
3. Prompt 호출
   1. `packages/app/src/app/app.tsx:1518` (`session.promptAsync`)
   2. `packages/app/src/app/app.tsx:1505` (`session.command`)
4. SSE 구독/이벤트 적용
   1. `packages/app/src/app/context/session.ts:1322` (`event.subscribe`)
   2. `packages/app/src/app/context/session.ts:966` (`applyEvent`)
   3. `packages/app/src/app/context/session.ts:1087` (`message.updated`)
   4. `packages/app/src/app/context/session.ts:1124` (`message.part.updated`)
5. 메시지 합성/렌더
   1. `packages/app/src/app/context/session.ts:583` (`MessageWithParts` memo)
   2. `packages/app/src/app/components/session/message-list.tsx:352` (`groupMessageParts`)
   3. `packages/app/src/app/components/session/message-list.tsx:628` (`PartView`)
6. stdout/stderr 진단 노출
   1. `packages/app/src/app/pages/settings.tsx:673`
   2. `packages/app/src/app/pages/settings.tsx:678`
7. 보조 SSE 구독(global SDK)
   1. `packages/app/src/app/context/global-sdk.tsx:122`
