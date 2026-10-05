'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {Volume2,VolumeX,Square,Turtle} from 'lucide-react';
import {toast} from 'sonner';
import {LearningAudio,type SoundEffect,type SpokenWord} from '@/lib/learning-audio';
const PREFERENCE='kanji-sound-enabled';
type AudioControls={enabled:boolean;speaking:SpokenWord;toggle:()=>void;effect:(kind:SoundEffect)=>void;speak:(text:string,rate?:number,manual?:boolean)=>void;stop:()=>void;stopSpeech:()=>void};
const AudioContext=createContext<AudioControls|null>(null);
export function LearningAudioProvider({children}:{children:ReactNode}){
 const [enabled,setEnabled]=useState(true),[speaking,setSpeaking]=useState<SpokenWord>(null);
 const engine=useRef<LearningAudio|null>(null);
 useEffect(()=>{
  const audio=new LearningAudio(setSpeaking,message=>toast.info(message,{id:'audio-help',duration:6000}));engine.current=audio;
  try{const on=localStorage.getItem(PREFERENCE)!=='off';audio.setEnabled(on);setEnabled(on);}catch{/* Storage may be disabled. */}
  const hide=()=>{if(document.hidden)audio.stop();};document.addEventListener('visibilitychange',hide);
  return()=>{document.removeEventListener('visibilitychange',hide);audio.dispose();engine.current=null;};
 },[]);
 const change=useCallback((value:boolean)=>{setEnabled(value);engine.current?.setEnabled(value);try{localStorage.setItem(PREFERENCE,value?'on':'off');}catch{/* Device preference is optional. */}},[]);
 const toggle=()=>{const next=!enabled;change(next);if(next)engine.current?.effect('correct');};
 const speak=(text:string,rate=.82,manual=false)=>{if(manual&&!engine.current?.enabled)change(true);engine.current?.speak(text,rate);};
 return <AudioContext.Provider value={{enabled,speaking,toggle,speak,effect:kind=>engine.current?.effect(kind),stop:()=>engine.current?.stop(),stopSpeech:()=>engine.current?.stopSpeech()}}>{children}</AudioContext.Provider>;
}
export function useLearningAudio(){const value=useContext(AudioContext);if(!value)throw new Error('LearningAudioProvider is required');return value;}
export function SoundToggle(){
 const {enabled,toggle}=useLearningAudio();
 return <button className={`audio-toggle ${enabled?'enabled':''}`} onClick={toggle} aria-pressed={enabled} aria-label={enabled?'소리 끄기':'소리 켜기'} title={enabled?'소리 끄기':'소리 켜기'}>{enabled?<Volume2 size={20}/>:<VolumeX size={20}/>}<span>소리 {enabled?'켜짐':'꺼짐'}</span></button>;
}
export function Speaker({text,label='일본어 듣기'}:{text:string;label?:string}){
 const {speak,speaking,stopSpeech}=useLearningAudio();
 const playing=speaking?.text===text;
 return <div className="speaker-controls" role="group" aria-label={label}>
  <button className={`sound-button ${playing&&speaking.rate===.82?'speaking':''}`} onClick={()=>playing&&speaking.rate===.82?stopSpeech():speak(text,.82,true)} aria-label={playing&&speaking.rate===.82?'일본어 재생 멈추기':label} aria-pressed={playing&&speaking.rate===.82}>{playing&&speaking.rate===.82?<Square size={17}/>:<Volume2 size={19}/>}<span>{playing&&speaking.rate===.82?'재생 중':label}</span></button>
  <button className={`sound-button slow-button ${playing&&speaking.rate===.6?'speaking':''}`} onClick={()=>playing&&speaking.rate===.6?stopSpeech():speak(text,.6,true)} aria-label={playing&&speaking.rate===.6?'느린 재생 멈추기':'일본어 천천히 듣기'} aria-pressed={playing&&speaking.rate===.6}>{playing&&speaking.rate===.6?<Square size={16}/>:<Turtle size={18}/>}<span>천천히</span></button>
 </div>;
}
