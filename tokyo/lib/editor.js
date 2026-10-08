import {clone,makeDays,validateProfile} from './profile.js';
import {addProfile,loadProfiles,catalogKey} from './profiles-store.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const input=(label,name,value='',type='text',extra='')=>`<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
const text=(label,name,value='')=>`<label>${label}<textarea name="${name}" rows="2" maxlength="3000">${esc(value)}</textarea></label>`;
const id=()=>`entry-${crypto.randomUUID()}`;
const languageNames=new Intl.DisplayNames(['ko'],{type:'language'});
const languageCodes=['ko','ja','en','zh','zh-Hant','es','fr','de','it','pt','vi','th','id','ms','tl','ar','hi','ru','tr','el','nl','sv','da','no','fi','pl','cs','hu','ro','uk','he'];
const fields={
  places:[['장소 이름','name'],['지역','area'],['분류','category'],['종류','kind'],['지도 검색어','query'],['공식 URL','url','url'],['설명','desc'],['방문 팁','tip']],
  phrases:[['한국어 표현','text'],['현지어 표현','translation'],['읽는 법','reading'],['분류','category'],['음성 파일 URL (선택)','audio','url']],
  packing:[['준비물','label']],
  contacts:[['연락처 이름','name'],['전화번호','phone','tel'],['설명','note']],
  usefulLinks:[['링크 이름','label'],['웹 주소','url','url'],['설명','note']]
};
function row(kind,value={}) {
  return `<fieldset class="editor-row" data-kind="${kind}" data-id="${esc(value.id||id())}">${fields[kind].map(([label,key,type])=>input(label,key,value[key]||'',type||'text',key==='audio'?'':'maxlength="1000"')).join('')}<button type="button" class="subtle-link" data-editor-remove>이 항목 삭제</button></fieldset>`;
}
export function openEditor({template,profile,builtIns,storage,openModal,onSaved}) {
  const editing=profile&&!builtIns.some(p=>p.id===profile.id);
  const source=clone(editing?profile:template);
  openModal(`<span class="eyebrow">TRIP BUILDER</span><h2 id="modal-title">${editing?'여행 정보 편집':'새 여행 만들기'}</h2>
    <p class="modal-description">여행 정보를 입력하고 저장하면 바로 일정표를 쓸 수 있어요. 날짜별 일정은 여행 화면에서 추가해 주세요.</p>
    <form id="profile-form" class="edit-form">
    <h3>여행 기본 정보</h3>${input('여행 이름','name',editing?source.name:'','text','required maxlength="100"')}
    <div class="form-row">${input('도시','city',source.city,'text','required maxlength="100"')}${input('도시의 현지어 이름 (선택)','localCity',source.localCity)}</div>
    <div class="form-row">${input('시작일','start',source.days[0]?.date,'date',editing?'readonly required':'required')}${input('종료일','end',source.days.at(-1)?.date,'date',editing?'readonly required':'required')}</div>
    ${editing?'<p class="storage-note">기록과 날짜를 연결해 보존하기 위해 저장 후 여행 기간은 고정돼요. 다른 기간은 새 여행으로 만들어 주세요.</p>':''}
    ${input('여행지 시간대','timeZone',source.timeZone,'text','required list="timezones" placeholder="지역/도시 형식"')}<datalist id="timezones">${(Intl.supportedValuesOf?.('timeZone')||[]).map(z=>`<option value="${esc(z)}">`).join('')}</datalist>
    <label>현지 언어 (선택)<select name="languageCode"><option value="">선택 안 함</option>${[...new Set([...languageCodes,...(source.language.code?[source.language.code]:[])])].map(code=>`<option value="${esc(code)}" ${code===source.language.code?'selected':''}>${esc(languageNames.of(code))}</option>`).join('')}</select></label>
    <h3>숙소 (선택)</h3>${input('숙소 이름','hotelName',source.hotel?.name)}${input('현지어 숙소 이름','hotelLocalName',source.hotel?.localName)}${input('주소','hotelAddress',source.hotel?.address)}${input('전화번호','hotelPhone',source.hotel?.phone,'tel')}${input('지도 검색어','hotelQuery',source.hotel?.query)}${input('공식 홈페이지','hotelURL',source.hotel?.url,'url')}${text('기사님께 보여줄 현지어 문장','hotelRequest',source.hotel?.request)}${input('숙소 주변 지역 (장소의 지역명과 일치)','nearbyArea',source.hotel?.nearbyArea)}
    <h3>환율 계산 (선택)</h3><p class="storage-note">두 통화 코드를 모두 입력하면 계산기를 사용할 수 있어요.</p><div class="form-row">${input('현지 통화 코드','from',source.currency?.from,'text','maxlength="3"')}${input('기준 통화 코드','to',source.currency?.to,'text','maxlength="3"')}</div>${input('현지 통화 몇 단위당 환율인가요?','unit',source.currency?.unit||1,'number','min="1" max="100000"')}
    <h3>장소 목록</h3><div data-editor-list="places">${source.places.map(p=>row('places',p)).join('')}</div><button type="button" class="button" data-editor-add="places">장소 추가</button>
    <h3>회화 카드</h3><div data-editor-list="phrases">${source.phrases.map(p=>row('phrases',p)).join('')}</div><button type="button" class="button" data-editor-add="phrases">회화 추가</button>
    <h3>준비물</h3><div data-editor-list="packing">${source.packing.map(p=>row('packing',p)).join('')}</div><button type="button" class="button" data-editor-add="packing">준비물 추가</button>
    <h3>도움 연락처</h3><div data-editor-list="contacts">${source.help.contacts.map(p=>row('contacts',p)).join('')}</div><button type="button" class="button" data-editor-add="contacts">연락처 추가</button>
    <h3>참고 링크</h3><div data-editor-list="usefulLinks">${source.usefulLinks.map(p=>row('usefulLinks',p)).join('')}</div><button type="button" class="button" data-editor-add="usefulLinks">링크 추가</button>
    <p id="profile-error" class="form-error" role="alert"></p><div class="modal-actions"><button type="button" class="button" data-action="close-modal">취소</button><button class="button primary" type="submit">여행 저장</button></div></form>`);
  const form=document.querySelector('#profile-form');
  // Existing packing IDs may already be checked in a saved record.
  if(editing)form.querySelectorAll('[data-kind="packing"] [data-editor-remove]').forEach(button=>button.remove());
  form.addEventListener('click',event=>{
    const add=event.target.closest('[data-editor-add]');
    if(add)form.querySelector(`[data-editor-list="${add.dataset.editorAdd}"]`).insertAdjacentHTML('beforeend',row(add.dataset.editorAdd));
    event.target.closest('[data-editor-remove]')?.closest('fieldset').remove();
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    try {
      const data=new FormData(form), get=key=>String(data.get(key)||'').trim();
      const next=clone(source);
      next.id=editing?source.id:`trip-${crypto.randomUUID()}`;
      next.name=get('name');next.city=get('city');next.cityLabel=get('city');next.localCity=get('localCity');next.timeZone=get('timeZone');
      next.days=editing?source.days:makeDays(get('start'),get('end'));
      next.language={code:get('languageCode'),label:get('languageCode')?languageNames.of(get('languageCode')):'여행 회화'};
      next.brand={name:next.name,avatar:Array.from(next.name)[0],heroTitle:next.name,heroNote:'우리의 여행을 한곳에서 준비해요.'};
      next.itineraryNote='일정을 추가하고 나만의 여행을 완성해 보세요.';
      next.hotel=get('hotelName')?{name:get('hotelName'),localName:get('hotelLocalName'),address:get('hotelAddress'),phone:get('hotelPhone'),displayPhone:get('hotelPhone'),query:get('hotelQuery')||[get('hotelName'),get('hotelAddress'),next.city].join(' '),request:get('hotelRequest'),url:get('hotelURL'),nearbyArea:get('nearbyArea'),phraseId:''}:null;
      if(Boolean(get('from'))!==Boolean(get('to')))throw new Error('현지 통화와 기준 통화를 모두 입력해 주세요.');
      next.currency=get('from')?{from:get('from').toUpperCase(),to:get('to').toUpperCase(),fromLabel:get('from').toUpperCase(),toLabel:get('to').toUpperCase(),symbol:get('from').toUpperCase(),unit:Number(get('unit'))}:null;
      for(const kind of Object.keys(fields)) {
        const values=[...form.querySelectorAll(`[data-kind="${kind}"]`)].map(fieldset=>{
          const originals=kind==='contacts'?source.help.contacts:source[kind];
          const value={...originals.find(item=>item.id===fieldset.dataset.id),id:fieldset.dataset.id};fieldset.querySelectorAll('input').forEach(el=>value[el.name]=el.value.trim());
          if(!value[fields[kind][0][1]])throw new Error('추가한 항목의 이름이나 표현을 입력하거나 빈 항목을 삭제해 주세요.');
          if(kind==='places')return {en:'',icon:'pin',color:'blue',...value,category:value.category||'장소',query:value.query||`${value.name} ${next.city}`};
          if(kind==='phrases')return {...value,category:value.category||'기본'};
          if(kind==='contacts')return {...value,label:value.phone};
          if(kind==='usefulLinks')return {...value,icon:'external'};
          return value;
        });
        if(kind==='contacts')next.help.contacts=values;else next[kind]=values;
      }
      next.help.phraseIds=next.help.phraseIds.filter(id=>next.phrases.some(p=>p.id===id));
      const checked=validateProfile(next);
      if(editing) {
        const profiles=loadProfiles(storage,builtIns);
        storage.setItem(catalogKey,JSON.stringify({version:1,profiles:profiles.map(p=>p.id===checked.id?checked:p)}));
      } else addProfile(storage,builtIns,checked);
      onSaved(checked);
    } catch(error) {form.querySelector('#profile-error').textContent=error.message;}
  });
}
