'use strict';
// A normal HTML audio element is the primary player. Japanese OS voices are
// an optional fallback, never a prerequisite for online translated speech.
class HajunSpeechPlayer {
  constructor({element,onStatus=()=>{},synthesis=window.speechSynthesis,Utterance=window.SpeechSynthesisUtterance}) {
    this.element=element;this.onStatus=onStatus;this.synthesis=synthesis;this.Utterance=Utterance;
    this.generation=0;this.attempt=0;this.timer=null;this.utterance=null;this.state='idle';
  }
  static chunks(text,limit=180) {
    const chars=Array.from(String(text).trim());const chunks=[];
    while(chars.length){let end=Math.min(limit,chars.length);if(end<chars.length){for(let i=end-1;i>=Math.floor(limit*.45);i--){if(/[。！？!?、\n ]/u.test(chars[i])){end=i+1;break;}}}chunks.push(chars.splice(0,end).join(''));}
    return chunks;
  }
  static url(text) {
    const url=new URL('https://translate.googleapis.com/translate_tts');
    url.searchParams.set('ie','UTF-8');url.searchParams.set('client','gtx');url.searchParams.set('tl','ja');url.searchParams.set('q',text);
    return url.href;
  }
  status(state,message,extra={}) {this.state=state;this.onStatus({state,message,...extra});}
  clearTimer(){clearTimeout(this.timer);this.timer=null;}
  detach(){for(const event of ['onplaying','onended','onerror','onpause','onwaiting'])this.element[event]=null;}
  stop() {
    this.generation++;this.attempt++;this.clearTimer();this.detach();this.element.pause();
    this.element.removeAttribute('src');this.element.load();
    if(this.synthesis)this.synthesis.cancel();this.utterance=null;this.state='idle';
  }
  play(item,{slow=false}={}) {
    this.stop();const token=this.generation;
    if(!item||typeof item.ja!=='string'||!item.ja.trim()||item.ja.length>2000){this.status('error','읽을 일본어 문장을 먼저 만들어 주세요.');return;}
    const ids=new Set(['this','water','price','card','thanks','excuse','slow','toilet','hotel','elevator','rest','arm','lost','ambulance']);
    const bundled=ids.has(item.id);this.element.hidden=false;this.element.muted=false;this.element.volume=1;this.element.controls=true;
    this.element.preload='auto';this.element.playbackRate=slow?.78:1;this.element.preservesPitch=true;
    const parts=bundled?[item.ja]:HajunSpeechPlayer.chunks(item.ja);
    const urls=bundled?['../tokyo/assets/audio/'+item.id+'.mp3']:parts.map(HajunSpeechPlayer.url);
    this.startTrack({parts,urls,index:0,slow,token,bundled});
  }
  startTrack(context) {
    const {parts,urls,index,slow,token,bundled}=context;
    if(token!==this.generation)return;
    this.clearTimer();this.detach();const player=this.element;const attempt=++this.attempt;let failed=false;
    const active=()=>token===this.generation&&attempt===this.attempt&&!failed;
    const label=parts.length>1?` (${index+1}/${parts.length})`:'';
    const fail=()=>{
      if(!active()||failed)return;failed=true;this.clearTimer();this.detach();player.pause();
      this.nativeFallback(parts.slice(index).join(''),slow,token);
    };
    const armTimeout=()=>{this.clearTimer();this.timer=setTimeout(fail,18000);};
    player.onplaying=()=>{if(!active())return;this.clearTimer();this.status('playing','일본어 음성을 재생하고 있어요.'+label,{mode:bundled?'bundled':'online',part:index+1,total:parts.length});};
    player.onwaiting=()=>{if(!active()||this.state==='blocked')return;this.status('loading','음성을 불러오고 있어요.'+label);armTimeout();};
    player.onpause=()=>{if(!active()||player.ended)return;this.clearTimer();this.status('paused','아래 ▶ 버튼으로 이어서 들을 수 있어요.');};
    player.onended=()=>{if(!active())return;this.clearTimer();if(index+1<urls.length)this.startTrack({...context,index:index+1});else this.status('ended','재생을 마쳤어요. 다시 듣거나 크게 보여줄 수 있어요.');};
    player.onerror=fail;
    player.src=urls[index];player.load();
    this.status('loading',bundled?'여행 카드 음성을 준비하고 있어요.':'일본어 음성을 준비하고 있어요.');armTimeout();
    try{
      const promise=player.play();
      if(promise?.catch)promise.catch(error=>{
        if(!active()||failed)return;
        if(error.name==='NotAllowedError'){this.clearTimer();this.status('blocked','소리가 준비됐어요. 아래 ▶ 재생 버튼을 한 번 눌러 주세요.');}
        else if(error.name==='AbortError'){this.clearTimer();this.status('paused','아래 ▶ 버튼을 눌러 음성을 재생해 주세요.');}
        else fail();
      });
    }catch{fail();}
  }
  nativeFallback(text,slow,token) {
    if(token!==this.generation)return;const synth=this.synthesis;
    const unavailable=()=>this.status('error','온라인 음성을 연결하지 못했어요. 인터넷을 확인하고 ‘다시 듣기’를 눌러 주세요.');
    if(!synth||!this.Utterance){unavailable();return;}
    const voices=synth.getVoices();const ja=voices.filter(v=>/^ja(?:[-_]|$)/i.test(v.lang));
    if(voices.length&&!ja.length){unavailable();return;}
    const utterance=new this.Utterance(text);this.utterance=utterance;
    utterance.lang='ja-JP';utterance.rate=slow?.72:.92;utterance.volume=1;
    if(ja.length)utterance.voice=ja.find(v=>/Google|Kyoko|Nanami/i.test(v.name))||ja[0];
    let completed=false;const active=()=>token===this.generation&&!completed;
    const failure=()=>{if(!active())return;completed=true;this.clearTimer();synth.cancel();unavailable();};
    this.timer=setTimeout(failure,8000);
    utterance.onstart=()=>{if(!active())return;this.clearTimer();this.status('playing','휴대전화의 일본어 목소리로 읽고 있어요.',{mode:'device'});this.timer=setTimeout(failure,90000);};
    utterance.onend=()=>{if(!active())return;completed=true;this.clearTimer();this.status('ended','재생을 마쳤어요.');};
    utterance.onerror=failure;
    try{synth.resume();synth.speak(utterance);}catch{failure();}
  }
}
if(typeof module!=='undefined')module.exports={HajunSpeechPlayer};
