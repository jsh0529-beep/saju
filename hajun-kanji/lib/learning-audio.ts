export type SoundEffect='start'|'flip'|'correct'|'retry'|'complete';
export type SpokenWord={text:string;rate:number}|null;
const melodies:Record<SoundEffect,number[][]>={
 start:[[523.25,0,.10],[659.25,.10,.14]],
 flip:[[440,0,.045]],
 correct:[[659.25,0,.11],[880,.12,.18]],
 retry:[[392,0,.10],[349.23,.12,.13]],
 complete:[[523.25,0,.14],[659.25,.15,.14],[783.99,.30,.14],[1046.5,.46,.32]]
};

// Created only in the browser. No remote audio service or microphone is used.
export class LearningAudio{
 enabled=true;
 private context:AudioContext|null=null;
 private nodes=new Set<OscillatorNode>();
 private voices:SpeechSynthesisVoice[]=[];
 private utterance:SpeechSynthesisUtterance|null=null;
 private watchdog:ReturnType<typeof setTimeout>|null=null;
 private generation=0;
 private voiceChanged=()=>{this.voices=window.speechSynthesis.getVoices();};
 constructor(private onSpeaking:(word:SpokenWord)=>void,private onError:(message:string)=>void){
  if('speechSynthesis'in window){this.voiceChanged();window.speechSynthesis.addEventListener('voiceschanged',this.voiceChanged);}
 }
 setEnabled(enabled:boolean){this.enabled=enabled;if(!enabled)this.stop();}
 unlock(){
  if(!this.enabled)return;
  const AudioCtor=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!AudioCtor)return;
  try{
   this.context??=new AudioCtor();
   if(this.context.state==='suspended')void this.context.resume().catch(()=>{});
  }catch{/* Speech and the visual feedback still work if Web Audio is unavailable. */}
 }
 effect(kind:SoundEffect){
  if(!this.enabled)return;
  this.unlock();
  const context=this.context;if(!context)return;
  const generation=this.generation;
  const play=()=>{
   if(!this.enabled||generation!==this.generation||context.state!=='running')return;
   this.stopTones();
   const start=context.currentTime+.015;
   for(const [frequency,offset,duration] of melodies[kind]){
    const oscillator=context.createOscillator(),gain=context.createGain();
    oscillator.type='sine';oscillator.frequency.value=frequency;
    gain.gain.setValueAtTime(0,start+offset);
    gain.gain.linearRampToValueAtTime(kind==='flip'?.06:.13,start+offset+.012);
    gain.gain.exponentialRampToValueAtTime(.001,start+offset+duration);
    oscillator.connect(gain);gain.connect(context.destination);
    this.nodes.add(oscillator);
    oscillator.onended=()=>{this.nodes.delete(oscillator);oscillator.disconnect();gain.disconnect();};
    oscillator.start(start+offset);oscillator.stop(start+offset+duration+.025);
   }
  };
  if(context.state==='running')play();else void context.resume().then(play).catch(()=>{});
 }
 speak(text:string,rate=.82){
  if(!this.enabled)return;
  this.stopSpeech();this.stopTones();
  if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){
   this.onError('일본어 읽기를 지원하지 않는 브라우저야. Chrome이나 Safari에서 열어 봐.');return;
  }
  const synth=window.speechSynthesis;
  this.voices=synth.getVoices();
  const voice=this.voices.find(v=>/^ja(?:[-_]|$)/i.test(v.lang));
  // An initially empty voice list is normal on mobile: allow the engine to resolve ja-JP.
  if(this.voices.length&&!voice){
   this.onError('일본어 음성이 없어서 읽어 주지 못했어. 기기의 음성 설정에서 일본어를 추가해 줘. 효과음은 그대로 들을 수 있어.');return;
  }
  const u=new SpeechSynthesisUtterance(text);this.utterance=u;
  u.lang='ja-JP';u.rate=rate;u.pitch=1;u.volume=.9;if(voice)u.voice=voice;
  this.onSpeaking({text,rate});
  const finish=()=>{if(this.utterance!==u)return;if(this.watchdog)clearTimeout(this.watchdog);this.watchdog=null;this.utterance=null;this.onSpeaking(null);};
  u.onend=finish;
  u.onerror=event=>{
   if(this.utterance!==u)return;
   finish();
   if(event.error==='canceled'||event.error==='interrupted')return;
   this.onError(event.error==='language-unavailable'||event.error==='voice-unavailable'
    ?'기기의 음성 설정에서 일본어를 추가한 뒤 다시 눌러 줘.'
    :'소리가 나오지 않으면 미디어 음량을 올리고 듣기 버튼을 다시 눌러 줘.');
  };
  this.watchdog=setTimeout(()=>{if(this.utterance===u){this.stopSpeech();this.onError('음성이 시작되지 않았어. 미디어 음량과 일본어 음성 설정을 확인하고 다시 눌러 줘.');}},15000);
  try{if(synth.paused)synth.resume();synth.speak(u);}catch{finish();this.onError('음성을 재생하지 못했어. 듣기 버튼을 다시 눌러 줘.');}
 }
 stopSpeech(){
  if(this.watchdog)clearTimeout(this.watchdog);this.watchdog=null;
  const wasSpeaking=!!this.utterance;this.utterance=null;
  if('speechSynthesis'in window)window.speechSynthesis.cancel();
  if(wasSpeaking)this.onSpeaking(null);
 }
 private stopTones(){for(const node of this.nodes){try{node.stop();}catch{/* Already ended. */}}this.nodes.clear();}
 stop(){this.generation++;this.stopSpeech();this.stopTones();}
 dispose(){this.stop();if('speechSynthesis'in window)window.speechSynthesis.removeEventListener('voiceschanged',this.voiceChanged);void this.context?.close().catch(()=>{});}
}
