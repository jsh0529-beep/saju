import {clone,isObject} from './profile.js';

export const ageGroups={young:'미취학 아동',child:'어린이',teen:'청소년',adult:'성인',senior:'시니어'};
export const paces={easy:'천천히, 자주 쉬기',normal:'보통',active:'활동적으로 둘러보기'};
export const interests={nature:'자연·산책',culture:'전시·체험',shopping:'쇼핑·캐릭터',food:'맛집·카페',views:'풍경·전망'};
const keywords={nature:/공원|정원|자연|산책|숲|park|garden/i,culture:/전시|체험|박물관|미술관|수족관|museum|aquarium/i,shopping:/쇼핑|캐릭터|상점|가게|shop|character/i,food:/맛집|카페|식사|디저트|restaurant|café|cafe/i,views:/전망|풍경|타워|tower|view/i};
const genericActivities={nature:'자연 공간에서 가볍게 산책하기',culture:'전시나 체험 공간 둘러보기',shopping:'관심 있는 상점 구경하기',food:'함께 먹고 싶은 음식 고르기',views:'도시 풍경을 천천히 둘러보기'};
export function validateCompanions(value) {
  if(!Array.isArray(value)||value.length>20||new Set(value.map(p=>p?.id)).size!==value.length)throw new Error('동행자는 중복 없이 최대 20명까지 추가할 수 있어요.');
  for(const p of value)if(!isObject(p)||typeof p.id!=='string'||!/^companion-[\w-]+$/.test(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>50||!Object.hasOwn(ageGroups,p.ageGroup)||!Object.hasOwn(paces,p.pace)||!Array.isArray(p.interests)||p.interests.length>5||new Set(p.interests).size!==p.interests.length||p.interests.some(i=>!Object.hasOwn(interests,i)))throw new Error('동행자의 이름·연령대·걷는 속도·관심사를 확인해 주세요.');
  return clone(value);
}
export function buildPlan(profile,companions,{dayIds,existingEvents={},idPrefix=`plan-${globalThis.crypto.randomUUID()}`}={}) {
  validateCompanions(companions);
  if(!companions.length)throw new Error('나를 포함해 여행할 사람을 한 명 이상 추가해 주세요.');
  if(!Array.isArray(dayIds)||!dayIds.length||new Set(dayIds).size!==dayIds.length||dayIds.some(id=>!profile.days.some(d=>d.id===id)))throw new Error('일정을 만들 날짜를 한 개 이상 선택해 주세요.');
  const slow=companions.some(p=>p.pace==='easy'||p.ageGroup==='young'||p.ageGroup==='senior');
  const active=!slow&&companions.every(p=>p.pace==='active');
  const activityCount=slow?2:active?4:3;
  const votes=Object.keys(interests).map(key=>[key,companions.filter(p=>p.interests.includes(key)).length]).sort((a,b)=>b[1]-a[1]);
  const favorites=votes.filter(([,count])=>count>0).map(([key])=>key);
  const kids=companions.some(p=>p.ageGroup==='young'||p.ageGroup==='child');
  const score=p=>{
    const text=[p.name,p.category,p.kind,p.desc,p.tip].join(' ');
    return votes.reduce((sum,[key,count])=>sum+(keywords[key].test(text)?count*4:0),0)+(kids&&/체험|공원|캐릭터|박물관|수족관/.test(text)?3:0);
  };
  const queryKey=p=>p.query?.trim().toLocaleLowerCase()||`place:${p.id}`;
  const used=new Set(Object.values(existingEvents).flat().filter(e=>e.query).map(e=>e.query.trim().toLocaleLowerCase()));
  const places=profile.places.map((p,index)=>({p,index,score:score(p)}));
  const isMeal=p=>/맛집|카페|식당|디저트|restaurant|café|cafe/i.test([p.category,p.kind].join(' '));
  const planned={};let seq=0;
  for(const day of profile.days.filter(d=>dayIds.includes(d.id))) {
    const events=[];let area=profile.hotel?.nearbyArea||'';
    const add=(time,title,note='',query='',icon='pin')=>events.push({id:`${idPrefix}-${seq++}`,time,title,note,query,icon,tag:'동행자 맞춤 제안',mode:'transit'});
    const choose=meal=>{
      const ranked=places.filter(({p})=>isMeal(p)===meal&&!used.has(queryKey(p))).sort((a,b)=>(b.score+(b.p.area===area?3:0))-(a.score+(a.p.area===area?3:0))||a.index-b.index);
      const place=ranked[0]?.p;if(place){used.add(queryKey(place));area=place.area;}return place;
    };
    const activityTimes=activityCount===2?['오전','오후']:activityCount===3?['오전','점심 후','오후']:['오전','늦은 오전','오후','저녁 전'];
    for(let i=0;i<activityCount;i++) {
      const place=choose(false);
      if(place)add(activityTimes[i],place.name,[place.desc,place.tip].filter(Boolean).join('\n'),place.query,place.icon);
      else {
        const interest=favorites.length?favorites[i%favorites.length]:null;
        add(activityTimes[i],interest?genericActivities[interest]:'함께 가고 싶은 곳 둘러보기','구체적인 장소는 함께 골라 주세요. 장소 목록에 후보를 추가하면 다음 제안에 반영돼요.','','pin');
      }
      if(slow||i===activityCount-1)add(i===0?'오전 활동 후':'활동 사이','앉아서 쉬는 시간',kids?'동행한 아이의 컨디션을 보고 다음 활동을 조절해요.':'물과 간식을 챙기고 동행자 모두의 컨디션을 확인해요.','','coffee');
      const lunchAfter=activityCount===4?1:0;
      if(i===lunchAfter){const meal=choose(true);add('점심',meal?`${meal.name}에서 식사`:'함께 점심 먹기',meal?[meal.desc,meal.tip].filter(Boolean).join('\n'):'함께 먹을 메뉴와 식사 시간을 정해요.',meal?.query||'','food');}
    }
    if(profile.hotel)add('하루 마무리',`${profile.hotel.name}에서 쉬기`,'그날의 컨디션에 따라 일찍 마무리해도 좋아요.',profile.hotel.query,'home');
    else add('하루 마무리','오늘 일정 정리하고 쉬기','다음 날 필요한 준비물과 이동 방법을 함께 확인해요.','','home');
    planned[day.id]=events;
  }
  return {events:planned,summary:`동행자 ${companions.length}명 · ${slow?'여유롭게':active?'활동적으로':'보통 속도로'} · 하루 방문 후보 ${activityCount}곳과 식사·휴식`,interests:favorites.map(key=>interests[key]),hasPlaces:profile.places.length>0};
}
export function appendPlan(currentEvents,plan) {
  const next=clone(currentEvents),ids=new Set(Object.values(next).flat().map(e=>e.id));
  for(const [day,events] of Object.entries(plan.events)) {
    if(!Array.isArray(next[day])||next[day].length+events.length>200)throw new Error('적용할 날짜가 없거나 하루 최대 일정 수를 넘어요.');
    for(const event of events){if(ids.has(event.id))throw new Error('이미 적용한 제안이에요.');ids.add(event.id);}
    next[day].push(...clone(events));
  }
  return next;
}
