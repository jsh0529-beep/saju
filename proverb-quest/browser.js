/* A tap opens Chrome on Android. No automatic scheme redirects or redirect loops. */
(() => {
'use strict';
const ua=navigator.userAgent;
const inKakao=/KAKAOTALK/i.test(ua);
const android=/Android/i.test(ua);
const ios=/iPad|iPhone|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const launcher=document.body.hasAttribute('data-browser-launcher');
if(!inKakao&&!launcher)return;
const root=new URL('./',location.href);
const target=new URL('./',root);
target.searchParams.set('v','1.1.0');
const fallback=new URL('chrome.html',root);
fallback.searchParams.set('manual','1');
const intent='intent://'+target.host+target.pathname+target.search+'#Intent;scheme='+target.protocol.slice(0,-1)+';package=com.android.chrome;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url='+encodeURIComponent(fallback.href)+';end';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chromeIcon='<svg aria-hidden="true" viewBox="0 0 48 48" width="25" height="25"><circle cx="24" cy="24" r="23" fill="#fff"/><path d="M24 2a22 22 0 0 1 19 11H24a11 11 0 0 0-9.5 16.5L5 13A22 22 0 0 1 24 2" fill="#ea4335"/><path d="M43 13a22 22 0 0 1-19 33l9.5-16.5A11 11 0 0 0 24 13" fill="#fbbc05"/><path d="M24 46A22 22 0 0 1 5 13l9.5 16.5A11 11 0 0 0 33.5 29.5" fill="#34a853"/><circle cx="24" cy="24" r="10" fill="#4285f4" stroke="white" stroke-width="2"/></svg>';
let gate=null;
function content(){
 const onChrome=!inKakao&&(/Chrome\//.test(ua)||/CriOS\//.test(ua))&&!/Edg|OPR|SamsungBrowser/.test(ua);
 const action=onChrome?`<a class="pq-chrome-button" href="${escape(target.href)}">${chromeIcon} Chrome에서 학습 시작 →</a>`:android?`<a class="pq-chrome-button" data-browser="chrome" href="${escape(intent)}">${chromeIcon} Chrome으로 열기 ↗</a>`:`<button class="pq-chrome-button" data-browser="copy">${chromeIcon} 주소 복사해서 Chrome에서 열기</button>`;
 return `<div class="pq-browser-card"><img class="pq-browser-mascot" src="icon.svg" width="76" height="76" alt="여우 루미"><span class="pq-browser-tag">하준이의 속담 탐험</span><h1 id="pq-browser-title">소리도 함께 배우려면<br><em>Chrome에서 열어 줘!</em></h1><p class="pq-browser-desc">${inKakao?'카카오톡 안에서는 영어·일본어 듣기가 작동하지 않을 수 있어. Chrome으로 옮겨서 모험을 이어 가자.':'아래에서 학습 앱을 열어 줘. Chrome의 영어·일본어 목소리로 문장을 들을 수 있어.'}</p>${action}<button class="pq-copy-button" data-browser="copy">학습 주소 복사</button><p class="pq-browser-status" role="status" aria-live="polite"></p><div class="pq-browser-help"><strong>${new URLSearchParams(location.search).has('manual')?'Chrome이 바로 열리지 않았어. 아래 방법으로 열어 줘.':'버튼을 눌러도 그대로라면'}</strong><ol><li>위의 <b>학습 주소 복사</b>를 눌러.</li><li>${ios?'홈 화면에서 Chrome 앱을 직접 열어.':'홈 화면에서 Chrome 앱을 직접 열어.'}</li><li>주소창에 붙여넣고 이동하면 돼.</li></ol>${inKakao?'<p>카카오톡의 메뉴에서 <b>다른 브라우저로 열기</b>를 선택할 수도 있어.</p>':''}<label class="pq-address-label" for="pq-app-address">학습 주소 · 길게 눌러서 직접 복사할 수도 있어</label><input id="pq-app-address" class="pq-app-address" value="${escape(target.href)}" readonly aria-label="복사할 학습 주소"></div><p class="pq-browser-footnote">Chrome으로 옮기면 처음에 음량을 확인해 줘.<br>학습 기록은 브라우저마다 따로 저장돼.</p>${launcher?`<a class="pq-stay-button" href="${escape(target.href)}">현재 브라우저에서 학습 화면 열기</a>`:'<button class="pq-stay-button" data-browser="stay">여기서 글로만 먼저 볼게</button>'}</div>`;
}
function showGate(){
 if(launcher)return;
 if(!gate){gate=document.createElement('dialog');gate.id='pq-browser-gate';gate.setAttribute('aria-labelledby','pq-browser-title');gate.innerHTML=content();document.body.append(gate);}
 if(!gate.open){if(typeof gate.showModal==='function')gate.showModal();else gate.setAttribute('open','');}
}
function message(text){const el=document.querySelector('.pq-browser-status');if(el)el.textContent=text;}
async function copyAddress(){
 let copied=false;
 if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(target.href);copied=true;}catch{}}
 if(!copied){const input=document.querySelector('#pq-app-address');if(input){input.focus();input.select();input.setSelectionRange(0,input.value.length);try{copied=document.execCommand('copy');}catch{}}}
 message(copied?'주소를 복사했어! Chrome 주소창에 붙여넣어 줘.':'아래 주소를 길게 눌러 복사한 뒤, Chrome 주소창에 붙여넣어 줘.');
}
if(launcher){document.querySelector('#pq-browser-launcher').innerHTML=content();}
else{
 const shell=document.querySelector('.shell');
 const banner=document.createElement('div');banner.className='pq-browser-banner';banner.innerHTML='<span>🎧 소리 학습은 Chrome에서!</span><button data-browser="show">Chrome으로 열기 ↗</button>';
 if(shell)shell.insertBefore(banner,shell.querySelector('main'));
 showGate();
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-browser]');
 if(button){switch(button.dataset.browser){
 case'show':showGate();break;
 case'stay':if(gate?.open){if(typeof gate.close==='function')gate.close();else gate.removeAttribute('open');}break;
 case'copy':copyAddress();break;
 case'chrome':message('Chrome 실행을 요청했어. 열리지 않으면 아래 주소 복사 방법을 이용해 줘.');break;
 }return;}
 if(inKakao&&event.target.closest('[data-do="speak"],[data-do="install"],[data-do="game"][data-mode="listen"]')){
  event.preventDefault();event.stopImmediatePropagation();showGate();
 }
},true);
})();
