import {ageGroups,paces,interests,validateCompanions,buildPlan,appendPlan} from './planner.js';
import {dateLabel} from './profile.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const options=(values,current)=>Object.entries(values).map(([value,label])=>`<option value="${value}" ${value===current?'selected':''}>${label}</option>`).join('');
function companionRow(person,index) {
  const p=person||{id:`companion-${crypto.randomUUID()}`,name:'',ageGroup:'adult',pace:'normal',interests:[]};
  return `<fieldset class="companion-row editor-row" data-id="${esc(p.id)}"><legend>동행자 ${index+1}</legend><label>이름 또는 별명<input name="companionName" maxlength="50" value="${esc(p.name)}" placeholder="나 / 동행자 별명"></label><div class="form-row"><label>연령대<select name="ageGroup">${options(ageGroups,p.ageGroup)}</select></label><label>걷는 속도<select name="pace">${options(paces,p.pace)}</select></label></div><div class="interest-options"><span>좋아하는 활동</span>${Object.entries(interests).map(([key,label])=>`<label><input type="checkbox" name="interest" value="${key}" ${p.interests.includes(key)?'checked':''}>${label}</label>`).join('')}</div><button class="subtle-link" type="button" data-remove-companion>동행자 삭제</button></fieldset>`;
}
export function openPlanner({profile,state,openModal,save,onApplied}) {
  if(!profile.days.length)return;
  const renderForm=()=>{
    const people=state.companions||[];
    openModal(`<span class="eyebrow">PLAN TOGETHER</span><h2 id="modal-title">누구와 함께 가나요?</h2><p class="modal-description">나를 포함해 동행자를 추가하면 연령대·관심사·걷는 속도에 맞춰 일정을 제안해요. 장소 목록이 없어도 여행의 기본 틀을 만들 수 있어요.</p><form id="companion-form" class="edit-form"><div id="companion-list">${(people.length?people:[null]).map(companionRow).join('')}</div><button type="button" class="button" id="add-companion">동행자 추가</button><h3>일정을 만들 날짜</h3><p class="storage-note">빈 날짜를 먼저 선택했어요. 기존 일정이 있는 날짜는 원래 일정 뒤에 제안을 추가해요.</p><div class="plan-days">${profile.days.map(d=>`<label><input type="checkbox" name="planDay" value="${esc(d.id)}" ${state.events[d.id]?.length?'':'checked'}>${esc(dateLabel(d.date,profile.locale))}<small>${state.events[d.id]?.length||0}개 일정</small></label>`).join('')}</div><p class="storage-note">동행자 정보는 이 기기와 개인 기록 백업에만 저장돼요. 배포용 여행 템플릿에는 포함하지 않아요.</p><p id="planner-error" class="form-error" role="alert"></p><div class="modal-actions"><button class="button" type="button" data-action="close-modal">취소</button><button class="button primary" type="submit">맞춤 일정 미리보기</button></div></form>`);
    const form=document.querySelector('#companion-form');
    form.querySelector('#add-companion').addEventListener('click',()=>{
      const count=form.querySelectorAll('.companion-row').length;
      if(count>=20){form.querySelector('#planner-error').textContent='최대 20명까지 추가할 수 있어요.';return;}
      form.querySelector('#companion-list').insertAdjacentHTML('beforeend',companionRow(null,count));
    });
    form.addEventListener('click',event=>event.target.closest('[data-remove-companion]')?.closest('fieldset').remove());
    form.addEventListener('submit',event=>{
      event.preventDefault();
      try {
        const companions=[...form.querySelectorAll('.companion-row')].map((row,index)=>({id:row.dataset.id,name:row.querySelector('[name="companionName"]').value.trim()||`동행자 ${index+1}`,ageGroup:row.querySelector('[name="ageGroup"]').value,pace:row.querySelector('[name="pace"]').value,interests:[...row.querySelectorAll('[name="interest"]:checked')].map(input=>input.value)}));
        validateCompanions(companions);
        const dayIds=[...form.querySelectorAll('[name="planDay"]:checked')].map(input=>input.value);
        const plan=buildPlan(profile,companions,{dayIds,existingEvents:state.events});
        const previous=state.companions;state.companions=companions;
        if(!save()){state.companions=previous;throw new Error('동행자 정보를 저장할 수 없어요. 기기 저장 상태를 확인해 주세요.');}
        showPreview(plan);
      }catch(error){form.querySelector('#planner-error').textContent=error.message;}
    });
  };
  function showPreview(plan) {
    openModal(`<span class="eyebrow">YOUR SUGGESTED PLAN</span><h2 id="modal-title">함께 가는 여행 일정</h2><p class="modal-description">${esc(plan.summary)}</p>${plan.interests.length?`<p>관심사: ${plan.interests.map(esc).join(' · ')}</p>`:''}<p class="storage-note">${plan.hasPlaces?'등록된 장소에서 후보를 골랐어요. 같은 지역의 장소를 우선해요.':'등록된 장소가 없어 활동 중심으로 구성했어요. 구체적인 장소는 직접 정해 주세요.'} 실제 영업시간·예약·이동 경로는 확인해 주세요. 적용 후 각 일정을 자유롭게 수정할 수 있어요.</p><div class="plan-preview">${Object.entries(plan.events).map(([date,events])=>`<section><h3>${esc(dateLabel(date,profile.locale))}</h3><ol>${events.map(e=>`<li><span>${esc(e.time)}</span><strong>${esc(e.title)}</strong></li>`).join('')}</ol></section>`).join('')}</div><p id="plan-apply-error" class="form-error" role="alert"></p><div class="modal-actions"><button class="button" id="revise-companions">동행자·날짜 다시 선택</button><button class="button primary" id="apply-plan">선택한 날짜에 추가</button></div>`);
    document.querySelector('#revise-companions').addEventListener('click',renderForm);
    document.querySelector('#apply-plan').addEventListener('click',()=>{
      try {
        const previous=state.events;state.events=appendPlan(state.events,plan);
        if(!save()){state.events=previous;throw new Error('제안을 저장하지 못했어요. 기존 일정은 그대로예요.');}
        onApplied(Object.keys(plan.events)[0]);
      }catch(error){document.querySelector('#plan-apply-error').textContent=error.message;}
    });
  }
  renderForm();
}
