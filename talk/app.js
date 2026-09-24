'use strict';
const $=s=>document.querySelector(s);
const ICONS={mic:'<rect x="8" y="2" width="8" height="13" rx="4"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',volume:'<path d="m11 4-6 5H2v6h3l6 5Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.5 2.5 0 0 1 5 .5c0 2-2.5 2-2.5 4m0 3v.5"/>',expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/>'};
const icon=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]||''}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
const synth=window.speechSynthesis;
const input=$('#korean');
let recognition=null,recognitionTimer=null,recognitionError=false,finalTranscript='',interimTranscript='';
let requestNumber=0,controller=null,current=null,phase='idle',history=[],count=0,category='전체';
let audio=null,utterance=null,soundNumber=0,soundTimer=null,toastTimer=null,installPrompt=null;
const memoryCache=new Map();
const STATES={idle:['누르고 한국어로 말해봐','말이 끝나면 일본어로 읽어줄게.'],listening:['듣고 있어, 하준아','다 말했으면 마이크를 한 번 더 눌러도 돼.'],translating:['일본어로 바꾸는 중','잠깐만, 한마디를 전해줄게.'],ready:['한마디, 잘 전했어!','다른 말도 해볼까?'],error:['다시 한번 해볼까?','아래 입력창이나 여행 카드를 써도 좋아.']};
function setPhase(next,message){phase=next;$('#mic-stage').className='mic-stage '+(next==='listening'||next==='translating'?next:'');$('#mic-title').textContent=STATES[next][0];$('#status').textContent=message||STATES[next][1];$('#mic').setAttribute('aria-pressed',String(next==='listening'));$('#mic').setAttribute('aria-label',next==='listening'?'말하기 끝내기':'한국어로 말하기');$('#translate').disabled=next==='translating';input.readOnly=next==='listening';}
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4000);}
function updateCount(){ $('#char-count').textContent=`${input.value.length} / 150`; }
function externalLink(text){$('#external').href='https://translate.google.com/?sl=ko&tl=ja&text='+encodeURIComponent(text)+'&op=translate';$('#external').hidden=!text;}
function stopSound(){soundNumber++;clearTimeout(soundTimer);if(audio){audio.onended=null;audio.onerror=null;audio.pause();audio=null;}if(synth)synth.cancel();utterance=null;$('#mic-stage').classList.remove('speaking');}
function cancelTranslation(){requestNumber++;if(controller){controller.abort();controller=null;}}
function cancelRecognition(){clearTimeout(recognitionTimer);if(recognition){const previous=recognition;recognition=null;previous.onend=null;previous.onresult=null;previous.onerror=null;try{previous.abort();}catch{}}input.readOnly=false;}
function clearResult(){current=null;$('#result').hidden=true;$('#empty-result').hidden=false;$('#result-tag').textContent='한마디 준비 중';$('#audio-status').textContent='';}
function edited(){cancelTranslation();stopSound();clearResult();updateCount();externalLink(input.value.trim());setPhase('idle');}
function audioFailure(message){$('#audio-status').textContent=message;$('#mic-stage').classList.remove('speaking');}
function nativeSpeak(text,rate,token,testing=false){
 if(token!==soundNumber)return;
 if(!synth||!window.SpeechSynthesisUtterance){audioFailure('이 브라우저에는 읽기 기능이 없어요. 여행 카드의 음성이나 Google 번역을 이용해 주세요.');return;}
 const voices=synth.getVoices();const japanese=voices.filter(v=>/^ja(?:[-_]|$)/i.test(v.lang));
 if(voices.length&&!japanese.length){audioFailure('일본어 목소리가 설치되어 있지 않아요. 오른쪽 위 ? → 음성 설정을 확인해 주세요. 여행 카드 14개는 바로 들을 수 있어요.');return;}
 const u=new SpeechSynthesisUtterance(text);utterance=u;u.lang='ja-JP';u.rate=rate;u.pitch=1;u.volume=1;
 if(japanese.length)u.voice=japanese.find(v=>/Google|Kyoko|O-Ren|Nanami/i.test(v.name))||japanese[0];
 let started=false;
 soundTimer=setTimeout(()=>{if(token!==soundNumber)return;synth.cancel();audioFailure('자동 재생이 시작되지 않았어요. ‘다시 듣기’를 누르거나 ?에서 일본어 음성을 확인해 주세요.');},8000);
 u.onstart=()=>{if(token!==soundNumber)return;started=true;clearTimeout(soundTimer);$('#audio-status').textContent=testing?'일본어 테스트 음성을 재생하고 있어요.':'일본어로 읽고 있어요.';$('#mic-stage').classList.add('speaking');soundTimer=setTimeout(()=>{if(token===soundNumber){stopSound();audioFailure('읽기가 오래 걸려 멈췄어요. 문장을 짧게 나눠 다시 들어보세요.');}},90000);};
 u.onend=()=>{if(token!==soundNumber)return;clearTimeout(soundTimer);$('#mic-stage').classList.remove('speaking');$('#audio-status').textContent=started?'다시 듣거나, 크게 보여줄 수 있어요.':'소리가 안 났다면 ‘다시 듣기’를 눌러 주세요.';};
 u.onerror=e=>{if(token!==soundNumber||e.error==='interrupted'||e.error==='canceled')return;clearTimeout(soundTimer);audioFailure(e.error==='not-allowed'?'재생 버튼을 한 번 눌러 주세요. 휴대전화가 자동 읽기를 잠시 막았어요.':'일본어 음성을 읽지 못했어요. 미디어 음량과 ?의 일본어 음성 설정을 확인해 주세요.');};
 try{synth.resume();synth.speak(u);}catch{clearTimeout(soundTimer);audioFailure('읽기를 시작하지 못했어요. ‘다시 듣기’를 눌러 주세요.');}
}
function speak(item=current,slow=false,testing=false){
 if(!item)return;cancelRecognition();stopSound();const token=soundNumber;const rate=slow?.72:.92;$('#audio-status').textContent='음성을 준비하고 있어요.';
 if(item.id&&!testing){
  const player=new Audio('../tokyo/assets/audio/'+item.id+'.mp3');audio=player;player.playbackRate=slow?.78:1;player.preservesPitch=true;
  const fallback=()=>{if(token!==soundNumber)return;clearTimeout(soundTimer);player.onerror=null;player.pause();nativeSpeak(item.ja,rate,token);};
  player.onended=()=>{if(token!==soundNumber)return;clearTimeout(soundTimer);$('#mic-stage').classList.remove('speaking');$('#audio-status').textContent='한마디를 다시 듣거나, 크게 보여줘도 좋아.';};
  player.onerror=fallback;soundTimer=setTimeout(fallback,8000);
  const promise=player.play();if(promise)promise.then(()=>{if(token!==soundNumber)return;clearTimeout(soundTimer);$('#audio-status').textContent='일본어로 읽고 있어요.';$('#mic-stage').classList.add('speaking');}).catch(e=>{if(token!==soundNumber)return;clearTimeout(soundTimer);if(e.name==='NotAllowedError')audioFailure('‘다시 듣기’를 한 번 눌러 주세요. 자동 재생이 차단되어 있어요.');else fallback();});
 }else nativeSpeak(item.ja,rate,token,testing);
}
function displayResult(item,play=true,remember=true){
 current={...item};$('#empty-result').hidden=true;$('#result').hidden=false;$('#source-line').textContent=item.ko;$('#japanese').textContent=item.ja;$('#reading').textContent=item.reading||'';$('#reading').hidden=!item.reading;$('#result-note').textContent=item.id?'준비된 여행 문장 · 한글은 발음 도움용이에요.':'MyMemory 자동 번역 · 뜻이 맞는지 확인해 주세요.';$('#result-tag').textContent=item.id?'여행 카드':'자유 번역';$('#audio-status').textContent='';externalLink(item.ko);setPhase('ready');
 if(remember){count++;$('#talk-count').textContent=`오늘 ${count}번의 한마디를 전했어 ✦`;history=[{...item},...history.filter(h=>h.ko!==item.ko)].slice(0,6);renderHistory();}
 if(play)speak(item);
}
function decodeEntities(text){return String(text).replace(/&(?:amp|lt|gt|quot|apos|#39|#34|#x[0-9a-f]+|#\d+);/gi,e=>{const named={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'",'&#34;':'"'};if(named[e])return named[e];const n=e[2].toLowerCase()==='x'?parseInt(e.slice(3,-1),16):parseInt(e.slice(2,-1),10);return n>0&&n<=0x10ffff?String.fromCodePoint(n):e;});}
function validateTranslation(data,original){
 if(data.quotaFinished||Number(data.responseStatus)===429)throw new Error('오늘 무료 번역 사용량을 다 썼어요. 여행 카드나 Google 번역을 이용해 주세요.');
 if(Number(data.responseStatus)!==200)throw new Error('번역 서비스가 응답하지 않았어요. 잠시 뒤 다시 하거나 Google 번역을 열어 주세요.');
 const translated=decodeEntities(data.responseData?.translatedText||'').trim();
 if(!translated||translated.length>2000||!/[\u3040-\u30ff\u3400-\u9fff]/u.test(translated)||/[가-힣]/u.test(translated)||normalizePhrase(translated)===normalizePhrase(original))throw new Error('일본어 번역을 확인하지 못했어요. 조금 더 구체적으로 말하거나 Google 번역을 열어 주세요.');
 return translated;
}
async function translate(){
 cancelRecognition();cancelTranslation();stopSound();clearResult();const original=input.value.trim();updateCount();externalLink(original);
 if(!original){setPhase('idle','먼저 한국어로 말하거나 문장을 입력해 줘.');input.focus();return;}
 if(original.length>150||new TextEncoder().encode(original).length>500){setPhase('error','문장을 조금 나눠줘. 한 번에 150자까지 번역할 수 있어.');return;}
 const phrase=matchPhrase(original);if(phrase){displayResult({...phrase,ko:original},$('#autoplay').checked);return;}
 if(memoryCache.has(original)){displayResult(memoryCache.get(original),$('#autoplay').checked);return;}
 if(!navigator.onLine){setPhase('error','인터넷이 연결되지 않았어. 아래 여행 카드는 사용할 수 있어.');return;}
 const token=requestNumber;const abort=new AbortController();controller=abort;let timeout=false;
 const timer=setTimeout(()=>{timeout=true;abort.abort();},14000);setPhase('translating');
 try{
  const url=new URL('https://api.mymemory.translated.net/get');url.searchParams.set('q',original);url.searchParams.set('langpair','ko|ja');url.searchParams.set('mt','1');
  const response=await fetch(url,{signal:abort.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
  if(!response.ok)throw new Error(response.status===429?'오늘 무료 번역 사용량을 다 썼어요. 여행 카드나 Google 번역을 이용해 주세요.':'번역 연결이 잠시 끊겼어요. 다시 시도해 주세요.');
  const data=await response.json();if(token!==requestNumber)return;const ja=validateTranslation(data,original);const item={ko:original,ja};memoryCache.set(original,item);if(memoryCache.size>30)memoryCache.delete(memoryCache.keys().next().value);displayResult(item,$('#autoplay').checked);
 }catch(e){if(token!==requestNumber)return;setPhase('error',timeout?'번역이 오래 걸리고 있어요. 연결을 확인하고 다시 눌러 주세요.':e.name==='TypeError'?'인터넷이나 번역 서비스에 연결하지 못했어요. 아래 카드나 Google 번역을 이용해 주세요.':e.message||'번역하지 못했어요. 다시 시도해 주세요.');}
 finally{clearTimeout(timer);if(token===requestNumber)controller=null;}
}
function startRecognition(){
 if(recognition){recognition.stop();return;}
 if(!Recognition){setPhase('error','이 창은 음성 인식을 지원하지 않아. Chrome에서 열거나 아래에 글자로 입력해 줘.');input.focus();return;}
 if(!window.isSecureContext){setPhase('error','마이크는 안전한 HTTPS 주소에서 사용할 수 있어. GitHub Pages 주소로 열어 줘.');return;}
 cancelTranslation();stopSound();clearResult();input.value='';updateCount();finalTranscript='';interimTranscript='';recognitionError=false;const rec=new Recognition();recognition=rec;rec.lang='ko-KR';rec.continuous=false;rec.interimResults=true;rec.maxAlternatives=1;
 rec.onstart=()=>{if(recognition!==rec)return;setPhase('listening');};
 rec.onresult=e=>{if(recognition!==rec)return;let complete='',interim='';for(let i=0;i<e.results.length;i++){if(e.results[i].isFinal)complete+=e.results[i][0].transcript;else interim+=e.results[i][0].transcript;}finalTranscript=complete;interimTranscript=interim;input.value=complete+interim;updateCount();if(input.value.length>150){recognitionError=true;rec.stop();setPhase('error','말이 조금 길었어. 입력된 문장을 150자 이내로 나눠줘.');}};
 rec.onerror=e=>{if(recognition!==rec)return;recognitionError=true;const messages={'not-allowed':'마이크 사용을 허용해 줘. Chrome 주소 옆 설정에서 마이크를 켤 수 있어.','service-not-allowed':'이 브라우저에서 음성 인식이 제한되어 있어. Chrome에서 열거나 글자로 입력해 줘.','audio-capture':'마이크를 찾지 못했어. 다른 앱이 사용 중인지 확인해 줘.','no-speech':'목소리가 잘 안 들렸어. 마이크를 다시 누르고 가까이 말해 줘.','network':'음성 인식에 연결하지 못했어. 인터넷을 확인하거나 직접 입력해 줘.','aborted':'말하기를 멈췄어. 다시 누르면 시작할 수 있어.','language-not-supported':'한국어 음성 인식을 사용할 수 없어. 직접 입력해 줘.'};setPhase('error',messages[e.error]||'목소리를 듣지 못했어. 직접 입력하거나 한 번 더 말해 줘.');};
 rec.onend=()=>{if(recognition!==rec)return;recognition=null;clearTimeout(recognitionTimer);input.readOnly=false;if(recognitionError)return;if(finalTranscript.trim()){input.value=finalTranscript.trim();updateCount();void translate();}else if(interimTranscript.trim()){setPhase('idle','들은 문장을 확인한 뒤 ‘일본어로 말하기’를 눌러 줘.');}else setPhase('idle','잘 못 들었어. 마이크를 누르고 다시 말해 줘.');};
 try{setPhase('listening','마이크를 준비하고 있어. 권한 요청이 뜨면 허용해 줘.');rec.start();recognitionTimer=setTimeout(()=>{if(recognition===rec)rec.stop();},20000);}catch{recognition=null;setPhase('error','마이크를 시작하지 못했어. Chrome에서 다시 열거나 직접 입력해 줘.');}
}
function renderPhrases(){
 const categories=['전체','식당·쇼핑','인사','길 찾기','도움 요청'];$('#categories').replaceChildren();for(const name of categories){const b=document.createElement('button');b.className='category';b.textContent=name;b.setAttribute('aria-pressed',String(name===category));b.onclick=()=>{category=name;renderPhrases();};$('#categories').append(b);}
 $('#phrases').replaceChildren();PHRASES.filter(p=>category==='전체'||p.cat===category).forEach(p=>{const b=document.createElement('button');b.className='phrase';b.setAttribute('aria-label',p.ko+' 일본어 듣기');const emoji=document.createElement('span');emoji.className='phrase-emoji';emoji.textContent=p.emoji;emoji.setAttribute('aria-hidden','true');const ko=document.createElement('strong');ko.textContent=p.ko;const ja=document.createElement('span');ja.className='phrase-ja';ja.lang='ja';ja.textContent=p.ja;b.append(emoji,ko,ja);b.insertAdjacentHTML('beforeend',icon('volume'));b.onclick=()=>{cancelRecognition();cancelTranslation();stopSound();input.value=p.ko;updateCount();displayResult(p,true);if(innerWidth<621)$('#result-heading').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});};$('#phrases').append(b);});
}
function renderHistory(){$('#history-section').hidden=history.length===0;$('#history').replaceChildren();history.forEach(item=>{const b=document.createElement('button');const ko=document.createElement('strong');ko.textContent=item.ko;const ja=document.createElement('span');ja.lang='ja';ja.textContent=item.ja;b.append(ko,ja);b.onclick=()=>{cancelRecognition();cancelTranslation();stopSound();input.value=item.ko;updateCount();displayResult(item,true,false);};$('#history').append(b);});}
function updateVoiceInfo(){const voices=synth?.getVoices()||[];const ja=voices.filter(v=>/^ja(?:[-_]|$)/i.test(v.lang));$('#voice-info').textContent=ja.length?'일본어 목소리: '+ja.map(v=>v.name).join(', '):'일본어 음성 목록을 아직 확인하지 못했어요. 테스트 버튼을 눌러 주세요.';}
function help(){cancelRecognition();if(phase==='listening')setPhase('idle');updateVoiceInfo();$('#help-dialog').showModal();}
$('#mic').onclick=startRecognition;$('#translate').onclick=translate;input.addEventListener('input',edited);input.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();void translate();}});
$('#clear').onclick=()=>{cancelRecognition();input.value='';edited();input.focus();};
$('#replay').onclick=()=>speak();$('#slow').onclick=()=>speak(current,true);$('#stop').onclick=()=>{stopSound();$('#audio-status').textContent='소리를 멈췄어요.';};
$('#help').onclick=help;$('#privacy').onclick=help;$('#voice-test').onclick=()=>{speak({ja:'こんにちは。日本語の音声テストです。'},false,true);$('#voice-info').textContent='“곤니치와”로 시작하는 일본어가 들리는지 확인해 주세요.';};
$('#large').onclick=()=>{if(!current)return;$('#large-japanese').textContent=current.ja;$('#large-korean').textContent=current.ko;$('#large-dialog').showModal();};$('#large-play').onclick=()=>speak();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>stopSound());});
$('#clear-history').onclick=()=>{history=[];memoryCache.clear();renderHistory();toast('이 화면의 대화 기록을 지웠어.');};
function connection(){ $('#connection').textContent=navigator.onLine?'여행 통역기':'오프라인 · 여행 카드 사용'; }window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();
if(synth){synth.addEventListener('voiceschanged',updateVoiceInfo);updateVoiceInfo();}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});$('#install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;}else toast('Chrome 메뉴 ⋮ → ‘홈 화면에 추가’ 또는 ‘앱 설치’를 눌러 주세요. 아이폰은 Safari 공유 메뉴에서 추가해요.');};
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelRecognition();stopSound();cancelTranslation();if(phase==='listening'||phase==='translating')setPhase('idle','잠시 멈췄어. 다시 눌러서 이어가 줘.');}});
if(!Recognition)$('#status').textContent='이 창에서는 음성 인식을 지원하지 않아. Chrome으로 열거나 직접 입력해 줘.';
renderPhrases();
if('serviceWorker' in navigator){window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='OFFLINE_READY')$('#offline-note').textContent='오프라인 준비 완료 · 여행 카드 14개와 준비된 음성을 인터넷 없이 쓸 수 있어요.';if(e.data?.type==='OFFLINE_PARTIAL')$('#offline-note').textContent='일부 음성을 저장하지 못했어요. 오프라인에서는 소리가 안 날 수 있어요.';});const ready=await navigator.serviceWorker.ready;ready.active?.postMessage({type:'CHECK_OFFLINE'});void reg.update();}catch{$('#offline-note').textContent='오프라인 저장을 사용할 수 없어요. 여행 중 인터넷에 연결해 주세요.';}});}
