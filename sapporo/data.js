'use strict';
const TRIP = {
 title:'윤시윤의 삿포로 여행',dates:['2026-10-09','2026-10-10','2026-10-11'],checked:'2026-10-04',
 hotel:{name:'Cross Hotel Sapporo',jp:'クロスホテル札幌',address:'〒060-0002 北海道札幌市中央区北2条西2丁目23番地',phone:'+81112720010',map:'Cross Hotel Sapporo 北2条西2丁目23',url:'https://cross-sapporo.orixhotelsandresorts.com/access/'},
 links:{jr:'https://www.jrhokkaido.co.jp/airport/',jrStatus:'https://www3.jrhokkaido.co.jp/webunkou/senku.html?id=02',bus:'https://www.jotetsu.co.jp/bus/kappa_liner/',jozankei:'https://jozankei.jp/en/about/seasons/autumn/',transfer:'https://www.koreanair.com/contents/plan-your-travel/at-the-airport/incheon-airport/transfer/international-flights',airport:'https://www.hokkaido-airports.com/en/new-chitose/',vjw:'https://services.digital.go.jp/ko/visit-japan-web/',weather:'https://www.jma.go.jp/bosai/forecast/',hanamaru:'https://www.sushi-hanamaru.com/store/details/s03.html',garaku:'https://sitatte.jp/shops_restaurants/',white:'https://www.shiroikoibitopark.jp/ko/',jnto:'https://www.japan.travel/ko/plan/hotline/'},
 flights:[
  {date:'10월 9일 금요일',n:'KE1432',from:'대구 TAE',to:'인천 ICN',dep:'07:55',arr:'09:00',duration:'1시간 5분',note:'대구 국제선 청사 · 인천 T2 / 환승전용 내항기'},
  {date:'10월 9일 금요일',n:'KE765',from:'인천 ICN',to:'신치토세 CTS',dep:'10:35',arr:'13:25',duration:'2시간 50분',note:'인천 T2 · 신치토세 국제선 / 대한항공 운항'},
  {date:'10월 11일 일요일',n:'KE5486',from:'신치토세 CTS',to:'인천 ICN',dep:'14:30',arr:'17:45',duration:'3시간 15분',note:'신치토세 국제선 · 인천 T2 / 아시아나항공 운항 공동운항편'},
  {date:'10월 11일 일요일',n:'KE1431',from:'인천 ICN',to:'대구 TAE',dep:'18:50',arr:'19:55',duration:'1시간 5분',note:'인천 T2 · 대구 국제선 청사 / 환승전용 내항기'}
 ],
 days:[{title:'삿포로에 도착하는 날',desc:'공항에서 호텔로, 가볍게 도심을 걷고 따뜻한 저녁.',tags:['도심 도보 약 3~4km','입국·이동 여유 확보']},{title:'계곡의 가을을 만나는 날',desc:'조잔케이 온천마을을 느긋하게 걷는 하루.',tags:['가을 추천','왕복 버스 예약 필요','도보 약 3~4km']},{title:'서두르지 않는 귀국',desc:'아침은 호텔 가까이. 오전 10시 공항으로 출발.',tags:['11:30 국제선 도착 목표','14:30 출발','인천 환승 65분']}],
 itinerary:{
 '0':[
 {id:'d1-airport',t:'05:50',type:'권장 도착',title:'대구공항 국제선 청사',desc:'여권·전자항공권을 준비해 대한항공 카운터로 이동합니다. 삿포로까지 탑승권 발급과 수하물 연결 여부를 확인하고 출국 절차를 밟으세요. 체크인 마감은 항공사 안내가 우선입니다.',meta:'07:55 KE1432 출발 · 국내선 청사로 가지 않기',place:'대구국제공항 국제선',mode:'driving'},
 {id:'d1-flight',t:'07:55',type:'예약 항공편',title:'대구 출발, 인천에서 환승',desc:'09:00 인천 도착 후 Transfer 표지를 따라 보안검색과 출발 게이트 이동. 10:35 KE765로 신치토세로 출발합니다. 환승 95분은 쇼핑보다 게이트 확인을 우선하세요.',meta:'07:55–09:00 / 10:35–13:25 · 시차 없음',url:'https://www.koreanair.com/contents/plan-your-travel/at-the-airport/incheon-airport/transfer/international-flights',linkLabel:'공식 환승 안내'},
 {id:'d1-arrival',t:'13:25',type:'도착',title:'신치토세 입국·수하물 수령',desc:'입국심사와 세관을 마친 뒤 국내선 터미널 지하 JR 신치토세공항역으로 이동합니다. 입국·수하물에 60~90분, 국제선에서 역까지 도보 15~20분을 계획상 배정했습니다.',meta:'도착 지연 시 시계탑·오도리 산책을 줄이면 됩니다.',place:'新千歳空港駅',mode:'walking'},
 {id:'d1-jr',t:'14:50',type:'탑승 목표 · 열차 지정 아님',title:'JR 에어포트로 삿포로역',desc:'삿포로 방면 선발 열차를 탑니다. 열차에 따라 약 37~45분. 삿포로역에서 호텔까지 공식 안내는 도보 약 5분이며, 짐을 들고 10~15분 여유를 두세요.',meta:'일반석 성인 편도 ¥1,230 · 지정석 별도',place:'札幌駅',origin:'新千歳空港駅',mode:'transit',url:'https://www.jrhokkaido.co.jp/airport/',linkLabel:'JR 시간·운임'},
 {id:'d1-hotel',t:'15:45',type:'숙소',title:'크로스호텔 체크인·잠깐 휴식',desc:'2층 프런트에서 체크인합니다. 조식 포함 여부, 객실 배정, 현지 추가 정산이 있는지 확인하세요. 다음 날 조잔케이 버스는 왕복 모두 예약되어 있어야 합니다.',meta:'체크인 15:00부터 · 수하물 정리와 휴식 40분',place:'クロスホテル札幌',mode:'walking'},
 {id:'d1-walk',t:'16:30',type:'가벼운 산책',title:'시계탑 외관·오도리공원',desc:'호텔에서 시계탑 외관을 보고 오도리공원·TV타워 주변까지 남쪽으로 걷습니다. 실내 관람을 서두르지 않고, 가을 해질녘 도심을 둘러보는 짧은 코스입니다.',meta:'호텔 → 시계탑 약 5분 → 오도리 약 7~10분 · 이동시간은 추정',place:'大通公園 札幌テレビ塔',origin:'クロスホテル札幌',mode:'walking'},
 {id:'d1-dinner',t:'17:30',type:'저녁',title:'수프카레 또는 역 주변 식사',desc:'호텔 가까운 GARAKU 시탓테 삿포로점을 우선 후보로 삼습니다. 영업·재료 소진 여부를 확인한 뒤 이동하세요. 대기가 길면 삿포로역 스텔라플레이스 식당가로 바꾸면 됩니다.',meta:'식사 예산 1인 ¥1,500~2,500 · 계획용 추정',place:'GARAKU sitatte sapporo',mode:'walking',url:'https://sitatte.jp/shops_restaurants/',linkLabel:'매장 영업 안내'},
 {id:'d1-night',t:'19:00',type:'선택',title:'다누키코지·스스키노 저녁 산책',desc:'체력이 남으면 아케이드와 스스키노 교차로를 짧게 둘러봅니다. 비가 오거나 피곤하면 이 일정을 건너뛰고 호텔로 돌아가세요.',meta:'왕복 추가 도보 약 2km · 20:30 전후 호텔 복귀 권장',place:'狸小路商店街 札幌',mode:'walking'},
 {id:'d1-rest',t:'20:30',type:'휴식',title:'호텔 대욕장, 그리고 내일 준비',desc:'호텔 최상층 대욕장 이용시간은 객실 안내에서 확인하세요. 버스 예약 화면을 저장하고 바람막이·작은 수건·걷기 편한 신발을 챙깁니다.',meta:'대욕장 이용 조건은 현장 안내 우선',place:'クロスホテル札幌',mode:'walking'}
 ],
 '1-autumn':[
 {id:'d2-breakfast',t:'07:30',type:'아침',title:'아침 식사·당일 운행 확인',desc:'호텔 조식은 포함 여부를 먼저 확인합니다. 조잔케이 날씨·버스 운행·산책로 통제 공지를 확인하세요. 강한 비나 통제 시 위의 실내 코스로 바꿉니다.',meta:'계곡은 도심보다 서늘합니다. 겉옷과 접이식 우산을 챙기세요.',url:'https://jozankei.jp/',linkLabel:'현지 공지'},
 {id:'d2-stop',t:'08:25',type:'호텔 출발',title:'삿포로역 27번 버스 정류장으로',desc:'예약 화면의 정류장 위치를 확인하고 출발 15~20분 전 도착합니다. 역 공사로 승차장이 흩어져 있으므로 JR 개찰구로 들어가지 말고 버스 정류장 지도를 보세요.',meta:'호텔 → 예약 승차장 도보 약 10~20분 · 위치 재확인',place:'じょうてつバス 札幌駅 27番のりば',mode:'walking',url:'https://www.jotetsu.co.jp/bus/kappa_liner/',linkLabel:'27번 정류장 안내'},
 {id:'d2-bus-out',t:'09:10',type:'공식 시간표 후보 · 미예약',title:'갓파라이너로 조잔케이',desc:'삿포로역 출발 09:10 → 조잔케이 유노마치 10:06 편을 기준으로 구성했습니다. 왕복 좌석 확보 후 이용하며, 예약한 시간·정류장이 다르면 그 표에 맞춰 움직이세요.',meta:'편도 일반 ¥1,700 / 웹 할인 ¥1,460 · 연휴 정체 가능',url:'https://www.jotetsu.co.jp/bus/kappa_liner/',linkLabel:'왕복 예약·시간표'},
 {id:'d2-walk',t:'10:15',type:'가을 산책',title:'후타미공원·후타미 현수교',desc:'유노마치에서 후타미공원과 붉은 현수교까지 걷습니다. 계곡 풍경을 즐기되 단풍 절정은 해마다 다릅니다. 비에 젖은 계단과 비포장 구간은 피하고, 통제 표지가 있으면 진입하지 마세요.',meta:'왕복 약 60~90분 계획 · 편한 운동화 권장',place:'定山渓 二見吊橋',origin:'定山渓湯の町',mode:'walking'},
 {id:'d2-lunch',t:'11:45',type:'점심',title:'온천마을에서 점심',desc:'관광안내소 주변에서 당일 영업 중인 소바·정식집을 골라 식사합니다. 소규모 가게는 쉬는 날과 품절이 있어 두 곳을 비교하고, 긴 줄이면 먼저 카페에서 쉬세요.',meta:'1인 ¥1,500~2,500 예산 · 특정 식당 예약 없음',place:'定山渓温泉 ランチ',mode:'walking',url:'https://jozankei.jp/en/',linkLabel:'공식 관광안내'},
 {id:'d2-footbath',t:'13:00',type:'휴식',title:'겐센공원 족욕·카페',desc:'온천마을에서 족욕과 카페를 즐깁니다. 족욕에는 작은 수건을 준비하세요. 전신 온천을 원하면 당일 이용 가능 시설·접수 마감·타투 규정을 확인한 경우에만 이 시간대와 바꿉니다.',meta:'전신 온천 비용·예약은 포함하지 않았습니다.',place:'定山源泉公園',mode:'walking'},
 {id:'d2-return-stop',t:'15:10',type:'복귀 준비',title:'유노마치 귀환 정류장 대기',desc:'하차한 곳과 돌아가는 승차 위치가 다를 수 있습니다. 예약 화면의 방향을 확인하고 15:30 편에 늦지 않게 모입니다. 돌아오는 표를 먼저 확보해야 합니다.',meta:'15:30 출발 → 삿포로역 16:34 예정 · 정체 시 지연',place:'定山渓湯の町 バス停',mode:'walking',url:'https://www.jotetsu.co.jp/bus/kappa_liner/',linkLabel:'귀환 시간 확인'},
 {id:'d2-bus-back',t:'15:30',type:'예약 버스 후보 · 시간 고정',title:'갓파라이너로 삿포로 복귀',desc:'왕복 예약 화면의 시각과 승차장을 따르세요. 공식 시간표상 삿포로역 16:34 도착 후보이며, 정체로 늦어질 수 있습니다.',meta:'15:30–16:34 · 예약한 편이 다르면 공식 안내 확인',url:'https://www.jotetsu.co.jp/bus/kappa_liner/',linkLabel:'귀환 버스 안내'},
 {id:'d2-hotel',t:'17:00',type:'휴식',title:'호텔에서 옷 정리·휴식',desc:'버스 지연을 흡수하는 시간입니다. 도착이 늦어지면 다음 식사 시간을 늦추고, 저녁 식사 후보를 호텔 가까이로 줄이세요.',meta:'도보 약 10~15분 여유',place:'クロスホテル札幌',mode:'walking'},
 {id:'d2-dinner',t:'18:00',type:'저녁',title:'스텔라플레이스에서 초밥·생선요리',desc:'네무로 하나마루는 6층 현장 발권 방식으로 좌석 예약을 받지 않습니다. 대기가 45분 이상이면 같은 층 데키타테야의 생선구이·해산물 식사로 바꾸세요.',meta:'1인 ¥2,500~4,000 예산 · 식당별 대기 별도',place:'根室花まる JRタワーステラプレイス店',mode:'walking',url:'https://www.sushi-hanamaru.com/store/details/s03.html',linkLabel:'매장·대기 안내'},
 {id:'d2-pack',t:'20:00',type:'마무리',title:'역 주변 쇼핑, 귀국 짐 정리',desc:'면세품·액체류·배터리를 나누어 정리하고 여권·환승 탑승권을 확인합니다. 아침에 호텔을 나올 준비까지 마쳐 두세요.',meta:'10/11 호텔 출발 10:00 · 공항 국제선 11:30 목표',place:'クロスホテル札幌',mode:'walking'}
 ],
 '1-otaru':[
 {id:'ot-breakfast',t:'08:00',type:'아침',title:'호텔 주변 아침 식사',desc:'조식 후 가벼운 가방으로 출발합니다. 오타루는 바닷바람이 차고 도보 구간이 많아 얇은 방풍 겉옷이 유용합니다.',meta:'조잔케이와 같은 날 함께 방문하지 않는 대체 코스'},
 {id:'ot-train',t:'09:00',type:'탑승 목표 · 열차 지정 아님',title:'JR 삿포로역에서 오타루로',desc:'오타루 방면 열차로 약 35~50분을 계획합니다. 실제 열차·운임은 JR 검색에서 확인하세요. 오타루역에서 운하까지는 도보 약 10~15분입니다.',place:'小樽駅',origin:'札幌駅',mode:'transit',url:'https://www.jrhokkaido.co.jp/',linkLabel:'JR 공식 안내'},
 {id:'ot-canal',t:'10:10',type:'산책',title:'오타루 운하·창고 거리',desc:'아사쿠사바시 주변에서 운하를 따라 사진을 찍고 오래된 창고 거리를 걷습니다. 운하 크루즈는 일정에 예약된 항목이 아니며, 바람·대기 상태에 따라 현장에서 결정하세요.',meta:'운하 산책 50~60분',place:'小樽運河 浅草橋',mode:'walking'},
 {id:'ot-lunch',t:'11:20',type:'점심',title:'오타루 초밥·해산물 식사',desc:'사카이마치로 이동하는 길에 당일 영업하는 초밥집을 고릅니다. 성인 4명 좌석과 예산을 먼저 확인하고, 점심 혼잡 전에 식사하세요.',meta:'1인 ¥2,500~4,000 계획용 예산',place:'小樽 堺町 寿司',mode:'walking'},
 {id:'ot-street',t:'12:30',type:'거리 탐방',title:'사카이마치·기타이치 유리',desc:'사카이마치 상점가를 남쪽으로 걸으며 유리 공예와 과자를 둘러봅니다. 쇼핑백을 늘리기 전에 귀국 수하물 여유를 확인하세요.',meta:'가게별 영업시간 확인 · 실외 이동 포함',place:'北一硝子 三号館',mode:'walking'},
 {id:'ot-music',t:'14:00',type:'실내·카페',title:'오르골당·디저트 휴식',desc:'오타루 오르골당 본관 주변을 둘러보고 카페에서 쉽니다. 여행 기념품은 이 구간에서 마무리하면 역으로 되돌아가는 동선을 줄일 수 있습니다.',place:'小樽オルゴール堂 本館',mode:'walking',url:'https://www.otaru-orgel.co.jp/',linkLabel:'오르골당 공식'},
 {id:'ot-return',t:'15:30',type:'귀환 목표',title:'미나미오타루역에서 삿포로 복귀',desc:'오르골당 주변에서 미나미오타루역까지 약 10~15분 걸어 삿포로 방면 열차를 탑니다. 승강장·열차 도착 시각을 확인하세요.',meta:'열차·환승 여부에 따라 약 40~55분 계획',place:'札幌駅',origin:'南小樽駅',mode:'transit'},
 {id:'ot-dinner',t:'18:00',type:'저녁',title:'삿포로 수프카레·도심 저녁',desc:'점심에 해산물을 먹었다면 저녁은 호텔 근처 수프카레나 따뜻한 정식으로 고릅니다. 피로하면 역에서 식사를 마치고 호텔로 복귀하세요.',place:'GARAKU sitatte sapporo',mode:'walking',url:'https://sitatte.jp/shops_restaurants/',linkLabel:'영업 확인'},
 {id:'ot-pack',t:'20:00',type:'귀국 준비',title:'호텔에서 휴식·짐 정리',desc:'다음 날은 10:00 호텔 출발입니다. 여권·탑승권·충전기·여행 선물을 미리 정리해 두세요.',place:'クロスホテル札幌',mode:'walking'}
 ],
 '1-rain':[
 {id:'rn-breakfast',t:'08:00',type:'아침',title:'천천히 아침 식사',desc:'강한 비가 예보되면 버스 예약의 취소 조건을 확인하고 실내 중심 일정으로 바꿉니다. 항공·JR 운행 공지를 함께 확인하세요.'},
 {id:'rn-subway',t:'09:10',type:'지하철 이동',title:'오도리역에서 미야노사와역',desc:'지하철 도자이선 미야노사와 방면을 이용합니다. 역에서 시로이코이비토 파크까지 도보 약 7~10분으로 우산이 필요합니다.',meta:'호텔에서 전체 약 40~50분 계획 · 완전 실내 동선은 아닙니다.',place:'白い恋人パーク',origin:'クロスホテル札幌',mode:'transit'},
 {id:'rn-park',t:'10:00',type:'실내 중심',title:'시로이코이비토 파크',desc:'유료 실내 견학과 카페를 중심으로 둘러봅니다. 체험은 별도 예약·비용이 있을 수 있으므로 공식 사이트에서 당일 운영과 입장권을 확인하세요.',meta:'약 2시간 · 입장권 미구매',place:'白い恋人パーク',mode:'walking',url:'https://www.shiroikoibitopark.jp/ko/',linkLabel:'운영·티켓 안내'},
 {id:'rn-lunch',t:'12:00',type:'점심',title:'삿포로역 식당가로 돌아와 점심',desc:'미야노사와역에서 오도리역으로 돌아온 뒤 지하보행공간으로 삿포로역까지 걷습니다. 비를 피해 스텔라플레이스 식당가에서 식사하세요.',meta:'이동 약 45~55분 + 식사 60분',place:'札幌ステラプレイス',origin:'白い恋人パーク',mode:'transit'},
 {id:'rn-shopping',t:'14:00',type:'실내 쇼핑',title:'다이마루·스텔라플레이스',desc:'역 연결 상업시설에서 쇼핑과 커피를 즐깁니다. 원한다면 시야가 확보된 경우에만 JR타워 전망대를 선택하세요. 흐린 날 전망은 보장되지 않습니다.',place:'大丸 札幌店',mode:'walking'},
 {id:'rn-rest',t:'16:00',type:'호텔 휴식',title:'호텔에서 충분히 쉬기',desc:'이른 시간에 돌아와 젖은 옷을 정리하고 휴식합니다. 대욕장 운영시간은 호텔 안내를 확인하세요.',place:'クロスホテル札幌',mode:'walking'},
 {id:'rn-dinner',t:'18:00',type:'저녁',title:'호텔 가까이에서 따뜻한 저녁',desc:'GARAKU 시탓테점 또는 역 식당가로 이동합니다. 강풍·폭우가 심하면 프런트에서 가까운 영업 식당과 택시를 안내받으세요.',place:'GARAKU sitatte sapporo',mode:'walking',url:'https://sitatte.jp/shops_restaurants/',linkLabel:'매장 안내'},
 {id:'rn-pack',t:'20:00',type:'귀국 준비',title:'짐 정리와 항공편 재확인',desc:'귀국 항공편의 운항사·터미널·게이트 안내를 재확인합니다. 이른 취침으로 마지막 날의 공항 이동에 대비하세요.'}
 ],
 '2':[
 {id:'d3-breakfast',t:'07:30',type:'아침',title:'호텔 주변 아침 식사',desc:'조식 또는 호텔 근처 카페에서 식사합니다. 비행 전 장거리 외출은 넣지 않았습니다. JR 운행 이상이 있으면 산책을 생략하고 즉시 공항 이동 대안을 확인하세요.',url:'https://www3.jrhokkaido.co.jp/webunkou/senku.html?id=02',linkLabel:'JR 운행 상황'},
 {id:'d3-walk',t:'08:30',type:'선택 · 짧은 산책',title:'아카렌가 주변, 마지막 도심 산책',desc:'홋카이도청 구 본청사 주변에서 외관 사진을 찍고 호텔로 돌아옵니다. 비가 오거나 짐 정리가 늦어지면 생략하세요. 실내 관람 일정은 포함하지 않았습니다.',meta:'09:30까지 호텔 복귀 · 짐은 객실에 두고 이동',place:'北海道庁旧本庁舎 赤れんが庁舎',origin:'クロスホテル札幌',mode:'walking'},
 {id:'d3-checkout',t:'09:45',type:'체크아웃',title:'추가 정산·분실물 확인',desc:'호텔 공식 체크아웃은 11:00이지만 공항 이동을 위해 09:45에 정산합니다. 여권·휴대전화·충전기·객실 금고·냉장고를 확인하세요.',meta:'10:00에는 호텔에서 출발',place:'クロスホテル札幌',mode:'walking'},
 {id:'d3-jr',t:'10:20',type:'탑승 목표 · 열차 지정 아님',title:'신치토세공항행 JR 탑승',desc:'삿포로역에서 신치토세공항행 선발 열차를 탑니다. 열차 약 37~45분에 역에서 국제선 출발층까지 15~20분을 더해 11:30 이전 도착을 목표로 합니다. 10:20은 탑승 목표이며 실제 시간표의 그 이전 열차를 우선하세요.',meta:'열차 지연 시 공항 도착 목표를 우선해 즉시 대안 판단',place:'新千歳空港駅',origin:'札幌駅',mode:'transit',url:'https://www.jrhokkaido.co.jp/airport/',linkLabel:'열차 시간 확인'},
 {id:'d3-airport',t:'11:30',type:'국제선 도착 목표',title:'아시아나 운항 카운터에서 수속',desc:'KE5486은 예약 화면상 아시아나항공 운항입니다. 국제선 전광판에서 실제 운항편·체크인 카운터를 확인하세요. 대구까지 수하물 연결, 인천 환승 탑승권·터미널을 다시 확인합니다.',meta:'공항의 국제선 안내를 따르세요. 예약 앱의 CTS T2 표기는 재확인 필요',place:'新千歳空港 国際線ターミナル',mode:'walking'},
 {id:'d3-security',t:'12:30',type:'출국 준비',title:'보안검색·출국심사 후 게이트 근처',desc:'수속이 끝나면 식사와 쇼핑을 짧게 마치고 보안검색으로 이동합니다. 대기 상황이 길면 식사보다 출국 절차가 우선입니다. 탑승 시작·마감 시각은 탑승권을 따르세요.',meta:'13:30까지 게이트 주변 대기를 권장'},
 {id:'d3-flight',t:'14:30',type:'예약 항공편',title:'KE5486 신치토세 출발',desc:'17:45 인천 도착 예정입니다. 출발이 지연되면 탑승 전 또는 기내에서 대구 연결편 환승 지원을 요청하세요.',meta:'아시아나항공 운항 · 도착 후 환승 65분'},
 {id:'d3-transfer',t:'17:45',type:'최우선 · 환승',title:'인천에서 입국하지 말고 환승',desc:'Transfer 표지를 따라 보안검색을 거쳐 KE1431 게이트로 바로 이동합니다. 인천에서 일반 입국심사·수하물 찾는 곳으로 나가지 마세요. 연결편 문제가 생기면 항공사 환승 직원에게 즉시 문의합니다.',meta:'18:50 출발 · 65분은 예정 간격이며 연결 보장은 아닙니다.',url:'https://www.koreanair.com/contents/plan-your-travel/at-the-airport/incheon-airport/transfer/international-flights',linkLabel:'공식 환승 안내'},
 {id:'d3-home',t:'19:55',type:'예약 도착',title:'대구 도착·입국·수하물 수령',desc:'대구 국제선 청사에서 입국·세관 절차를 마치고 수하물을 찾습니다. 실제 귀가 시간은 도착 후 수속 시간을 더해 잡으세요.',meta:'KE1431 · 18:50–19:55',place:'대구국제공항 국제선',mode:'driving'}
 ]
 },
 phrases:[
 {ko:'호텔로 가 주세요',jp:'クロスホテル札幌までお願いします。北2条西2丁目23番地です。',reading:'쿠로스 호테루 삿포로마데 오네가이시마스.',hint:'호텔 이름과 주소를 함께 보여주세요.'},
 {ko:'4명이 함께 앉고 싶어요',jp:'4人です。できれば一緒の席をお願いします。',reading:'요닌데스. 데키레바 잇쇼노 세키오 오네가이시마스.'},
 {ko:'얼마나 기다려야 하나요?',jp:'待ち時間はどのくらいですか。',reading:'마치지칸와 도노쿠라이데스카.'},
 {ko:'덜 맵게 해 주세요',jp:'辛さを控えめにしてください。',reading:'카라사오 히카에메니 시테쿠다사이.'},
 {ko:'카드로 결제할 수 있나요?',jp:'クレジットカードは使えますか。',reading:'쿠레짓토 카아도와 츠카에마스카.'},
 {ko:'따뜻한 물을 주세요',jp:'お湯をいただけますか。',reading:'오유오 이타다케마스카.'},
 {ko:'조잔케이행 버스가 맞나요?',jp:'このバスは定山渓湯の町に行きますか。',reading:'코노 바스와 조오잔케이 유노마치니 이키마스카.'},
 {ko:'삿포로로 돌아가는 정류장은?',jp:'札幌駅行きのバス停はどこですか。',reading:'삿포로에키 유키노 바스테이와 도코데스카.'},
 {ko:'화장실은 어디인가요?',jp:'トイレはどこですか。',reading:'토이레와 도코데스카.'},
 {ko:'조식이 포함돼 있나요?',jp:'朝食は宿泊料金に含まれていますか。',reading:'초오쇼쿠와 슈쿠하쿠료오킨니 후쿠마레테이마스카.'},
 {ko:'대구까지 수하물이 연결되나요?',jp:'預けた荷物は仁川で受け取らずに、大邱まで運ばれますか。乗り継ぎの搭乗券も確認したいです。',reading:'아즈케타 니모츠와 인촌데 우케토라즈니, 테구마데 하코바레마스카.',hint:'귀국 체크인 때 탑승권과 함께 보여주세요.'},
 {ko:'연결편 환승 시간이 짧아요',jp:'仁川で大邱行きのKE1431便に乗り継ぎます。乗り継ぎ時間が短いので、案内をお願いします。',reading:'인촌데 테구 유키노 케이이 이치욘산이치빈니 노리츠기마스.'},
 {ko:'음식 알레르기가 있어요',jp:'食物アレルギーがあります。食材を確認させてください。',reading:'쇼쿠모츠 아레루기이가 아리마스. 쇼쿠자이오 카쿠닌사세테 쿠다사이.',hint:'알레르기 유발 식재료 이름도 반드시 따로 전달하세요.'},
 {ko:'구급차를 불러 주세요',jp:'救急車を呼んでください。',reading:'큐우큐우샤오 욘데쿠다사이.',hint:'일본 구급·소방은 119입니다.'}
 ],
 checks:[
 {group:'출발 전',id:'passport',title:'여권·왕복 전자항공권',note:'원본 여권 지참. 예약번호는 항공사 앱이나 개인 보관함에 저장'},
 {group:'출발 전',id:'transfer',title:'왕복 연결편·수하물 연결 확인',note:'특히 10/11 인천 환승 65분, 운항사·터미널을 항공사에 확인'},
 {group:'출발 전',id:'bus',title:'조잔케이 왕복 버스 예약',note:'10/10 이용분은 공식 안내상 10/9 17:00 접수 마감. 가능하면 출국 전에 확보'},
 {group:'출발 전',id:'entry',title:'Visit Japan Web·입국 준비',note:'공식 서비스에서 준비하고 QR은 개인 기기에 저장'},
 {group:'출발 전',id:'insurance',title:'여행자보험·로밍/eSIM',note:'보험 연락처와 해외 결제 가능 여부 확인. 데이터 전용 eSIM은 일반 전화가 안 될 수 있음'},
 {group:'짐 챙기기',id:'coat',title:'겹쳐 입을 옷·방풍 겉옷',note:'긴소매, 가디건 또는 경량 보온복. 계곡·밤 산책은 체감온도 하락'},
 {group:'짐 챙기기',id:'shoes',title:'운동화·접이식 우산·작은 수건',note:'젖은 계단을 피하고 족욕 뒤 발을 닦을 수건 준비'},
 {group:'짐 챙기기',id:'charger',title:'일본용 플러그·충전기·보조배터리',note:'기기 입력전압 확인. 보조배터리는 항공사 기내 휴대 규정 확인'},
 {group:'짐 챙기기',id:'medicines',title:'복용약·처방 정보',note:'필요량과 일본 반입 규정을 출발 전에 확인'},
 {group:'짐 챙기기',id:'money',title:'해외 결제 카드·엔화 소액권',note:'교통카드는 1인 1장 준비. 현금만 받는 가게 대비'},
 {group:'현지 도착',id:'hotel',title:'호텔 조식·추가 정산·대욕장 확인',note:'조식 포함 여부와 숙박세 등 별도 청구 여부는 예약 조건 확인'},
 {group:'현지 도착',id:'offline',title:'이 페이지 오프라인 준비 확인',note:'Wi-Fi에서 처음 열고 하단의 저장 완료 표시 확인. 지도·번역은 인터넷 필요'},
 {group:'귀국 전날',id:'pack',title:'여권·귀국편·수하물 최종 점검',note:'10/11 10:00 호텔 출발. 인천에서 입국하지 않고 환승'},
 {group:'귀국 전날',id:'rail',title:'JR 운행·공항 날씨 확인',note:'철도 운휴면 호텔에서 공항버스·택시 소요시간을 즉시 확인'}
 ],
 sources:[
 ['항공·숙소 예약','사용자가 제공한 5장의 예약 화면에서 날짜·편명·시각·숙소만 추출. 예약번호·탑승객 영문명·좌석·원본 이미지는 공개하지 않음.',null],
 ['크로스호텔 삿포로','주소·연락처·역 접근', 'https://cross-sapporo.orixhotelsandresorts.com/access/'],
 ['호텔 투숙 안내','체크인 15:00 / 체크아웃 11:00','https://cross-sapporo.orixhotelsandresorts.com/page-8685/'],
 ['대한항공 환승 안내','환승전용 내항기 이용 시 인천 입국 금지','https://www.koreanair.com/contents/plan-your-travel/at-the-airport/incheon-airport/transfer/international-flights'],
 ['인천공항 환승 안내','환승 표지·보안검색·탑승권','https://www.airport.kr/ap_en/1467/subview.do'],
 ['JR 홋카이도','공항철도 운임·열차·지정석','https://www.jrhokkaido.co.jp/airport/'],
 ['일본 공휴일 안내','10/10~12 주말·스포츠의 날 연휴','https://www.gotokyo.org/en/story/guide/public-holidays/index.html'],
 ['조테쓰 갓파라이너','예약 마감·27번 승차장·09:10/15:30 후보·운임','https://www.jotetsu.co.jp/bus/kappa_liner/'],
 ['조잔케이 관광협회','계곡 산책·계절 정보·당일 공지','https://jozankei.jp/en/about/seasons/autumn/'],
 ['삿포로 공식 관광','도심 단풍은 통상 10월 중순~11월 초','https://visit.sapporo.travel/seasons/autumn/'],
 ['삿포로 가을 옷차림','아침저녁 기온 하강·겉옷 권장','https://www.sapporo.travel/en/spot/feature/autumn-in-sapporo/'],
 ['일본 내각부','2026년 10월 12일 스포츠의 날','https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html'],
 ['시로이코이비토 파크','당일 영업·티켓·체험','https://www.shiroikoibitopark.jp/ko/'],
 ['네무로 하나마루','현장 접수·영업·대기 안내','https://www.sushi-hanamaru.com/store/details/s03.html'],
 ['데키타테야','스텔라플레이스 6층 식사 대안','https://www.sushi-hanamaru.com/store/details/post_6.html'],
 ['시탓테 삿포로','GARAKU 등 입점 식당 안내','https://sitatte.jp/shops_restaurants/'],
 ['일본정부관광국','24시간 한국어 방문객 지원','https://www.japan.travel/ko/plan/hotline/'],
 ['Open-Meteo','접속 시 가져오는 삿포로 예보·CC BY 4.0','https://open-meteo.com/'],
 ['오타루 사진','megawind / Wikimedia Commons, CC BY 2.1 JP. 2009년 10월 13일 사진, 화면에 맞게 잘라 표시. 이번 여행의 실제 단풍 상태를 뜻하지 않음.','https://commons.wikimedia.org/wiki/File:Otaru_canal_02.jpg']
 ]
};
