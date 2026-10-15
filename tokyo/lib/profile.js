export const clone = value => JSON.parse(JSON.stringify(value));
export const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
export function localDate(timeZone, now = new Date()) {
  if (!timeZone) return '';
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone, year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  return ['year','month','day'].map(key=>parts.find(p=>p.type===key).value).join('-');
}
export function dateLabel(date, locale='ko-KR', options={month:'long',day:'numeric',weekday:'short'}) {
  return new Intl.DateTimeFormat(locale,{...options,timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
}
export function initialDay(days, today) {
  if (!days.length || !today) return 0;
  const next = days.findIndex(day=>day.date >= today);
  return next < 0 ? days.length - 1 : next;
}
export function makeDays(start, end) {
  if (!validDate(start) || !validDate(end) || start>end) throw new Error('여행 시작일과 종료일을 확인해 주세요.');
  const count = (Date.parse(end)-Date.parse(start))/86400000+1;
  if (count>90) throw new Error('한 여행은 최대 90일까지 만들 수 있어요.');
  return Array.from({length:count},(_,i)=>{
    const date=new Date(Date.parse(start)+i*86400000).toISOString().slice(0,10);
    return {id:date,date,short:`${i+1}일차`,title:`${i+1}일차 일정`,note:'',events:[]};
  });
}
export const validEvent = e => isObject(e) && ['id','title','time','note','query','icon','tag'].every(k=>typeof e[k]==='string') && e.id.length>0 && e.id.length<=200 && e.title.length<=200 && e.note.length<=3000 && e.time.length<=100 && e.query.length<=500 && e.icon.length<=50 && e.tag.length<=100 && (e.mode===undefined || ['driving','walking','transit','bicycling'].includes(e.mode));
export function safeURL(value, {asset=false, relative=false}={}) {
  if (typeof value!=='string' || !value.trim()) return '';
  try {
    const url=new URL(value,'https://travel.invalid/tokyo/');
    if (!['https:','http:'].includes(url.protocol)) return '';
    if (!asset && !relative && !/^https?:\/\//i.test(value)) return '';
    return value;
  } catch { return ''; }
}
export const phoneURL = value => /^\+?[\d ()-]+$/.test(value||'') ? `tel:${value.replace(/[ ()-]/g,'')}` : '';
const assert = (condition,message) => {if(!condition)throw new Error(message);};
const textFields = (obj, fields) => isObject(obj) && fields.every(k=>typeof obj[k]==='string' && obj[k].length<=5000);
const unique = (items) => new Set(items.map(x=>x.id)).size===items.length;
export function validateProfile(p) {
  assert(textFields(p,['id','name','city','cityLabel','localCity','timeZone','locale','itineraryVersion']), '여행 설정 형식이 올바르지 않아요.');
  assert(/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.id) && p.name.trim(), '여행 ID와 이름을 확인해 주세요.');
  try {new Intl.DateTimeFormat(p.locale,{timeZone:p.timeZone||'UTC'});} catch {throw new Error('언어 또는 시간대 설정을 확인해 주세요.');}
  assert(Array.isArray(p.days)&&p.days.length<=90&&unique(p.days),'여행 날짜가 중복되거나 너무 많아요.');
  const eventIds=[];
  p.days.forEach((d,i)=>{
    assert(textFields(d,['id','date','short','title','note']) && d.id===d.date && validDate(d.date) && (!i||p.days[i-1].date<d.date),'날짜는 오름차순의 실제 날짜여야 해요.');
    assert(Array.isArray(d.events)&&d.events.length<=200&&d.events.every(validEvent),'기본 일정 형식이 올바르지 않아요.');
    eventIds.push(...d.events.map(e=>e.id));
  });
  assert(new Set(eventIds).size===eventIds.length,'일정 ID가 중복돼요.');
  assert(!p.days.length||p.timeZone,'여행지 시간대를 입력해 주세요.');
  assert(textFields(p.language,['code','label']), '회화 언어를 확인해 주세요.');
  assert(!p.language.code||/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i.test(p.language.code),'언어 코드를 확인해 주세요.');
  for(const [key,fields] of [['places',['id','name','en','area','category','kind','icon','color','desc','tip','query','url']],['phrases',['id','category','text','translation','reading']],['packing',['id','label']]]) {
    assert(Array.isArray(p[key])&&p[key].length<=500&&unique(p[key])&&p[key].every(x=>textFields(x,fields)&&/^[\w-]+$/.test(x.id)),`${key} 목록 형식을 확인해 주세요.`);
  }
  assert(!p.phrases.length||p.language.code,'회화가 있으면 언어 코드를 입력해 주세요.');
  assert(p.places.every(x=>!x.url||safeURL(x.url))&&p.phrases.every(x=>!x.audio||safeURL(x.audio,{asset:true})),'장소·음성 주소는 안전한 웹 주소여야 해요.');
  assert(p.hotel===null||textFields(p.hotel,['name','localName','address','phone','displayPhone','query','request','url','nearbyArea','phraseId']),'숙소 형식을 확인해 주세요.');
  if(p.hotel)assert((!p.hotel.url||safeURL(p.hotel.url))&&(!p.hotel.phone||phoneURL(p.hotel.phone)), '숙소 URL 또는 전화번호를 확인해 주세요.');
  if(p.currency)assert(textFields(p.currency,['from','to','fromLabel','toLabel','symbol'])&&/^[A-Z]{3}$/.test(p.currency.from)&&/^[A-Z]{3}$/.test(p.currency.to)&&Number.isFinite(p.currency.unit)&&p.currency.unit>0&&p.currency.unit<=100000,'환율 설정을 확인해 주세요.');
  assert(textFields(p.brand,['name','avatar','heroTitle','heroNote']),'화면 제목을 확인해 주세요.');
  assert(!p.hero||(textFields(p.hero,['src','alt'])&&safeURL(p.hero.src,{asset:true})),'표지 이미지 주소를 확인해 주세요.');
  assert(!p.talk||(textFields(p.talk,['url','title','description'])&&safeURL(p.talk.url,{relative:true})),'외부 앱 링크를 확인해 주세요.');
  assert(textFields(p.help,['intro'])&&Array.isArray(p.help.phraseIds)&&p.help.phraseIds.every(id=>p.phrases.some(ph=>ph.id===id))&&Array.isArray(p.help.contacts)&&p.help.contacts.length<=50&&p.help.contacts.every(c=>textFields(c,['name','note','phone','label'])&&phoneURL(c.phone)),'도움 연락처를 확인해 주세요.');
  const links=[...(p.usefulLinks||[]),...(p.sources||[]),...(p.help.source?[p.help.source]:[])];
  assert(Array.isArray(p.usefulLinks)&&Array.isArray(p.sources)&&links.length<=100&&links.every(l=>textFields(l,['url','label'])&&safeURL(l.url)), '참고 링크를 확인해 주세요.');
  assert(Array.isArray(p.sourceNotes)&&p.sourceNotes.length<=100&&p.sourceNotes.every(s=>typeof s==='string'&&s.length<=5000),'안내 문구를 확인해 주세요.');
  if(p.flights)assert(textFields(p.flights,['airline','fromCode','from','toCode','to','note'])&&Array.isArray(p.flights.legs)&&p.flights.legs.length<=20&&p.flights.legs.every(l=>textFields(l,['label','time','note'])),'항공편 형식을 확인해 주세요.');
  return clone(p);
}
