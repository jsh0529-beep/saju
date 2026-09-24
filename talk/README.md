# 하준톡

한국어 음성 → 일본어 번역 → 일본어 읽기. 로그인·API 키 없이 GitHub Pages에서 실행하는 정적 웹 앱입니다.

- 주소: https://jsh0529-beep.github.io/saju/talk/
- Android Chrome 권장. SpeechRecognition/webkitSpeechRecognition으로 `ko-KR` 인식.
- MyMemory 공식 공개 GET API로 `ko|ja` 번역. 150자 및 UTF-8 500바이트 제한, 14초 타임아웃, 사용량 초과·오프라인·잘못된 응답 표시. MyMemory 무료 익명 이용은 공식 안내 기준 5,000자/일이며 운영 정책 및 네트워크 환경에 따라 제한될 수 있습니다.
- 14개 정확 일치 문장과 별칭은 로컬 문장집 + 기존 `../tokyo/assets/audio/*.mp3`를 사용합니다. 부분 문자열/유사도 매칭은 오역을 막기 위해 사용하지 않습니다.
- 자유 문장은 Web Speech Synthesis `ja-JP`로 읽습니다. 기기에 일본어 목소리가 없거나 브라우저가 자동 재생을 차단하면 재생 버튼·설정 안내를 표시합니다. 실제 기기에서 마이크 허용 및 일본어 음성 테스트가 필요합니다.
- 대화는 메모리에만 유지하며 새로고침 시 삭제합니다. 로컬 저장소·서버에 녹음이나 대화를 보관하지 않습니다. 음성은 브라우저의 음성 인식 서비스, 자유 입력문은 MyMemory에 전송됩니다.
- 서비스 워커의 오프라인 저장 범위는 이 앱의 정적 파일 및 공유된 14개 음성/이미지뿐입니다. 다른 앱 캐시·저장소를 수정하지 않습니다. ‘오프라인 준비 완료’ 후 문장 카드 사용 가능. 인식/자유 번역에는 인터넷이 필요합니다.
- 사용자 입력과 API 결과는 `textContent`로 렌더링합니다. 새로운 요청·입력 변경·카드 선택·페이지 숨김은 이전 요청과 읽기를 취소합니다.

기존 도쿄 앱의 정적 그림과 음성을 상대 경로로 재사용하므로 `/talk/`와 `/tokyo/`를 같은 저장소 루트에 유지합니다. 기존 일정·저장 데이터는 건드리지 않습니다.

## 확인한 공식 기술 자료

- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- https://mymemory.translated.net/doc/spec.php
- https://mymemory.translated.net/doc/usagelimits.php

## 로컬 확인

저장소 루트에서 `python -m http.server 8000` 후 `http://localhost:8000/talk/` 접속. 일반 HTTP 원격 주소에서는 마이크를 사용할 수 없습니다.

## 직접 확인할 사용자 흐름

1. ‘물 주세요’ 카드를 누르고 준비된 MP3 재생/천천히 재생/큰 글씨를 확인합니다.
2. ‘이 장난감은 얼마인가요’ 입력 → 일본어가 표시되는지 확인합니다.
3. 도움말의 자유 문장 음성 테스트 → 실제 기기 일본어 음성을 확인합니다.
4. 마이크 허용 후 짧은 한국어 발화 → 인식·번역·자동 읽기를 확인합니다.
5. 입력 도중 새 문장 또는 카드를 선택했을 때 이전 응답이 덮어쓰지 않는지 확인합니다.
6. 오프라인 준비 완료 후 비행기 모드에서 카드 음성과 화면을 확인합니다.
