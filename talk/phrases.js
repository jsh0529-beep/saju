'use strict';
const PHRASES = [
 {id:'this',cat:'식당·쇼핑',emoji:'🍡',ko:'이거 주세요',ja:'これをください。',reading:'고레오 구다사이',aliases:['이것 주세요','이거 하나 주세요','이거 줘']},
 {id:'water',cat:'식당·쇼핑',emoji:'💧',ko:'물 주세요',ja:'お水をください。',reading:'오미즈오 구다사이',aliases:['물 좀 주세요','물을 주세요','물 줘']},
 {id:'price',cat:'식당·쇼핑',emoji:'🏷️',ko:'얼마예요?',ja:'いくらですか。',reading:'이쿠라데스카',aliases:['이거 얼마예요','얼마야','이거 얼마야','가격이 얼마예요']},
 {id:'card',cat:'식당·쇼핑',emoji:'💳',ko:'카드로 계산할 수 있나요?',ja:'カードで払えますか。',reading:'카아도데 하라에마스카',aliases:['카드 되나요','카드로 결제할 수 있나요','카드 돼요']},
 {id:'thanks',cat:'인사',emoji:'🙌',ko:'감사합니다',ja:'ありがとうございます。',reading:'아리가토오 고자이마스',aliases:['고마워요','고마워','고맙습니다','감사해요']},
 {id:'excuse',cat:'인사',emoji:'👋',ko:'실례합니다',ja:'すみません。',reading:'스미마센',aliases:['저기요','죄송합니다','미안합니다']},
 {id:'slow',cat:'인사',emoji:'🐢',ko:'천천히 말씀해 주세요',ja:'ゆっくり話してください。',reading:'윳쿠리 하나시테 구다사이',aliases:['천천히 말해 주세요','천천히 말해주세요']},
 {id:'toilet',cat:'길 찾기',emoji:'🚻',ko:'화장실은 어디예요?',ja:'トイレはどこですか。',reading:'토이레와 도코데스카',aliases:['화장실 어디야','화장실 어디예요','화장실 어디 있어요','화장실은 어디에 있나요']},
 {id:'hotel',cat:'길 찾기',emoji:'🏨',ko:'도쿄돔호텔로 가 주세요',ja:'東京ドームホテルまでお願いします。',reading:'토오쿄오 도오무 호테루마데 오네가이시마스',aliases:['도쿄돔 호텔로 가 주세요','도쿄돔호텔까지 가 주세요']},
 {id:'elevator',cat:'길 찾기',emoji:'🛗',ko:'엘리베이터는 어디예요?',ja:'エレベーターはどこですか。',reading:'에레베에타아와 도코데스카',aliases:['엘리베이터 어디예요','엘리베이터 어디 있어요']},
 {id:'rest',cat:'도움 요청',emoji:'🪑',ko:'잠깐 앉아서 쉬고 싶어요',ja:'少し座って休みたいです。',reading:'스코시 스왓테 야스미타이데스',aliases:['조금 앉아서 쉬고 싶어요']},
 {id:'arm',cat:'도움 요청',emoji:'🩹',ko:'팔을 다쳤어요',ja:'腕をけがしています。',reading:'우데오 케가시테이마스',aliases:['팔 다쳤어요','팔을 다쳤습니다']},
 {id:'lost',cat:'도움 요청',emoji:'🤝',ko:'가족을 놓쳤어요. 도와주세요',ja:'家族とはぐれました。助けてください。',reading:'카조쿠토 하구레마시타. 타스케테 구다사이',aliases:[]},
 {id:'ambulance',cat:'도움 요청',emoji:'🚑',ko:'구급차를 불러 주세요',ja:'救急車を呼んでください。',reading:'큐우큐우샤오 욘데 구다사이',aliases:['구급차 불러 주세요','구급차를 불러주세요']}
];
const normalizePhrase = text => String(text).normalize('NFKC').replace(/[\s.,!?。！？·]/g,'').toLowerCase();
const matchPhrase = text => PHRASES.find(p => [p.ko,...p.aliases].some(s=>normalizePhrase(s)===normalizePhrase(text)));
if(typeof module!=='undefined') module.exports={PHRASES,normalizePhrase,matchPhrase};
