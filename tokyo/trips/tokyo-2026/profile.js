import days from './itinerary.js';
import phrases from './phrases.js';
import packing from './packing.js';
import places from '../../places-data.js';

// Existing IDs and asset URLs are permanent identifiers for the original trip.
export default {
  id: 'tokyo-2026', name: '하준이의 도쿄 여행', locale: 'ko-KR',
  city: '도쿄', cityLabel: 'TOKYO', localCity: '東京', timeZone: 'Asia/Tokyo',
  itineraryVersion: '2026-09-22-photo', legacyStorageKey: 'hajun-tokyo-trip-v1',
  days, phrases, packing, places,
  language: {code: 'ja', label: '일본어'},
  hotel: {
    name: '도쿄돔호텔', localName: '東京ドームホテル',
    address: '〒112-8562 東京都文京区後楽1-3-61', phone: '+81358052111', displayPhone: '03-5805-2111',
    query: 'Tokyo Dome Hotel, 1-3-61 Koraku, Bunkyo City, Tokyo',
    request: '東京ドームホテルまでお願いします。', url: 'https://www.tokyodome-hotels.co.jp/',
    nearbyArea: '도쿄돔·스이도바시', phraseId: 'hotel'
  },
  currency: {from: 'JPY', to: 'KRW', fromLabel: '일본 엔', toLabel: '원', symbol: '¥', unit: 100},
  brand: {name: 'HAJUN', avatar: '하', heroTitle: '오늘은 어디로\n가볼까, 하준아?', heroNote: '천천히 둘러봐도 충분히 즐거워.'},
  hero: {src: './assets/tokyo-diorama.webp', alt: '도쿄타워와 전철, 후지산을 표현한 입체 여행 일러스트'},
  talk: {url: '../talk/?v=3', title: '하준톡', description: '한국어로 말하면 일본어로 읽어줘요'},
  itineraryNote: '9월 22일 보내주신 일정표 반영 · 9.25–9.29',
  placesNote: '장소·매장 공식 안내 확인: 2026.09.20. 영업시간·휴무·메뉴·예약·입장권은 각 카드의 공식 정보에서 다시 확인해 주세요. 일정에 담기는 예약 기능이 아닙니다.',
  flights: {airline:'JEJU air',fromCode:'PUS',from:'김해',toCode:'NRT',to:'나리타',legs:[
    {label:'9.25 금요일',time:'07:30 → 09:30',note:'7C1151 · 도착 T3'},
    {label:'9.29 화요일 · 귀국',time:'10:30 → 13:00',note:'7C1152 · 나리타 출발 T3'}
  ],note:'가족 일정표 기준 · 당일 운항 확인'},
  help: {intro:'가족과 떨어졌다면 가까운 가게 직원이나 역무원에게 도움을 요청해요.',phraseIds:['lost','arm'],contacts:[
    {name:'일본 구급차 · 소방',note:'일본 안에서 긴급할 때',phone:'119',label:'119'},
    {name:'일본 경찰',note:'일본 안에서 긴급할 때',phone:'110',label:'110'},
    {name:'일본정부관광국 여행자 핫라인',note:'한국어 지원 · 24시간',phone:'+815038162787',label:'050-3816-2787'}
  ],source:{url:'https://www.japan.travel/en/plan/hotline/',label:'긴급번호·핫라인: JNTO 공식 안내'}},
  usefulLinks: [
    {url:'https://services.digital.go.jp/visit-japan-web/',label:'Visit Japan Web',note:'입국 준비 · 공식 사이트',icon:'passport'},
    {url:'https://www.gotokyo.org/en/plan/getting-around/subways/index.html',label:'도쿄 지하철 안내',note:'GO TOKYO · 공식 관광 안내',icon:'train'}
  ],
  sources: [
    {url:'https://www.tokyodome-hotels.co.jp/',label:'도쿄돔호텔 · 주소와 연락처'},
    {url:'https://www.tokyo-dome.co.jp/travel/',label:'도쿄돔시티 · 시설 안내'},
    {url:'https://www.gotokyo.org/en/destinations/eastern-tokyo/asakusa/index.html',label:'GO TOKYO · 아사쿠사'},
    {url:'https://www.gotokyo.org/en/destinations/central-tokyo/akihabara/index.html',label:'GO TOKYO · 아키하바라'},
    {url:'https://www.tokyoeki-1bangai.co.jp/shop/?area=area2&floor=b1f&anchor=1',label:'도쿄역 일번가 · 캐릭터 스트리트'},
    {url:'https://www.japan.travel/en/plan/hotline/',label:'JNTO · 긴급 연락처'}
  ],
  sourceNotes: [
    '여행 코스는 9월 22일 보내주신 일정표를 반영했어요. 예약번호·좌석·객실 등 예약 세부정보는 공개 페이지에 넣지 않았어요.',
    '항공권: 9.25 김해 07:30 → 나리타 09:30, 9.29 나리타 10:30 → 김해 13:00. 운항 변경은 항공사에서 확인해 주세요.',
    '숙소는 도쿄돔호텔 기준이에요. 예약 세부정보는 예약 안내에서 확인해 주세요.',
    '일본어 음성은 앱에 포함된 합성 음성 MP3예요. 도쿄 그림은 AI로 만든 창작 일러스트예요.',
    '외부 여행 정보 확인: 2026년 9월 20일 (한국 시간)'
  ]
};
