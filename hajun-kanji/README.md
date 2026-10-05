# 하준이의 칸지 퀘스트

일본어에 흥미가 있는 한국어권 한자 입문자를 위한 한자 60자 학습 앱.

- 12개 코스, 하루 새 글자 3개 목표
- 모양 기억 힌트 → 일본어 단어 → 뜻·형태·읽기 3단계 회상
- 틀린 답은 힌트와 재도전, 감점 없음
- 복습 간격: 1/3/7/14/30일; 오류 시 10분 뒤 재등장
- 한자 4개부터 열리는 4쌍 카드 기억 게임
- 자유 그리기(획순 안내 또는 자동 채점 기능은 아님)
- 로그인 없는 공개 앱. 방문자별 D1 진도 저장: 256비트 임의 쿠키의 해시로 기록을 구분. 같은 브라우저는 같은 진도를 사용하며 쿠키 삭제/만료 또는 기기 변경 시 새 진도로 시작. 기존 소유자의 진도는 인증된 소유자 접속에서만 유지
- 브라우저 일본어 TTS. 일본어 음성 미설치 시 안내, 한글 발음은 보조 힌트

## Content

`lib/curriculum.ts`: 60개의 학습 항목. 한국 한자 이름, 일본어 단어/읽기/뜻, 직접 작성한 기억 힌트와 추가 단어.
`lib/learning.ts`: 한국 날짜 기준과 복습 일정 규칙.
`app/api/progress/route.ts`: 서버 저장 및 중복 제출 방지.

공식 참고: https://www.mext.go.jp/a_menu/shotou/new-cs/1385768.htm 및 https://www.irodori.jpf.go.jp/resources.html . 기관 인증/제작 앱은 아님. 기억 힌트는 어원이 아니라 학습용 상상.

## Validation

TypeScript 검사 및 Worker 빌드. 60개 고유 한자, 코스 구분, 단어의 한자 포함 여부와 가나 필드, 한국 날짜 경계, 신규/복습/자유연습/오답 일정 검증. 내부 브라우저 데스크톱 및 390px 프레임에서 학습, 오답 재도전, 결과 저장, 새로고침 후 보존, 기억 게임 열기/카드 뒤집기를 확인.

테스트 진도는 로컬 미리보기 데이터베이스에만 존재하며 배포에 포함하지 않음. 학습 진도 WebMCP 읽기 도구는 지원 환경에서만 등록하며 현재 검증 브라우저에는 해당 문서 API가 제공되지 않음. 실제 사용 기기의 음성 재생은 기기별 확인이 필요.

## Illustrations and icons

Three original built-in-generated adventure scenes (forest, sky and Japanese town), plus a native SVG 山 favicon and PNG icons at 32/180/192/512px. The prompt set is in `public/images/prompts.json`. The scene illustrations provide an adventure setting and are not kanji-origin diagrams. Native text remains separate from generated pictures.

Live app: https://hajun-kanji-quest.soraguide.chatgpt.site (public; no sign-in required).

The GitHub copy is application source, not a static GitHub Pages export. Learning records stay in the live app's database, are isolated per visitor, and are not uploaded to GitHub. The source requires a Cloudflare Workers/D1-compatible runtime. The `.openai/hosting.json` deployment identity is omitted in the GitHub copy; configure a deployment identity for your own environment before publishing separately.

Public-access verification: `node scripts/check-progress.mjs` checks independent visitors, reload persistence, duplicate submissions, legacy-owner isolation, cookie flags and cross-origin rejection against SQLite.

## Public visitor isolation

The original `kanji_cards` and `mission_events` tables remain available only to the original owner through dispatch-verified identity headers. Anonymous and other visitors use `visitor_cards` / `visitor_events` with compound learner keys. A Secure/HttpOnly/SameSite cookie authorizes access to the visitor’s own records; only its SHA-256 digest is used in the database. No progress identifiers are accepted from query parameters or request bodies. The identity-header trust boundary is Sites dispatch; a self-hosted deployment must strip client-supplied identity headers and supply verified ones, or disable the legacy-owner branch.
