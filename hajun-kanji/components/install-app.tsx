'use client';
import {useEffect,useRef,useState} from 'react';
import {Check,Download,Share,Copy,Smartphone} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {toast} from 'sonner';
type InstallPrompt=Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
type Platform='ios'|'android'|'desktop';
export function InstallApp(){
 const prompt=useRef<InstallPrompt|null>(null);
 const [installed,setInstalled]=useState(false),[busy,setBusy]=useState(false),[guide,setGuide]=useState(false),[ready,setReady]=useState(false),[platform,setPlatform]=useState<Platform>('desktop'),[embedded,setEmbedded]=useState(false),[address,setAddress]=useState('');
 useEffect(()=>{
  const display=window.matchMedia('(display-mode: standalone)');
  const check=()=>setInstalled(display.matches||!!(navigator as Navigator & {standalone?:boolean}).standalone);
  check();display.addEventListener('change',check);
  const agent=navigator.userAgent;
  setPlatform(/iPad|iPhone|iPod/i.test(agent)||(/Macintosh/i.test(agent)&&navigator.maxTouchPoints>1)?'ios':/Android/i.test(agent)?'android':'desktop');
  setEmbedded(/KAKAOTALK|Instagram|FBAN|FBAV|NAVER|; wv\)/i.test(agent));
  setAddress(window.location.origin+'/');
  const available=(event:Event)=>{event.preventDefault();prompt.current=event as InstallPrompt;setReady(true);};
  const complete=()=>{prompt.current=null;setReady(false);setInstalled(true);setBusy(false);setGuide(false);toast.success('설치가 완료됐어. 홈 화면이나 앱 목록에서 칸지 퀘스트를 열어 봐.');};
  window.addEventListener('beforeinstallprompt',available);window.addEventListener('appinstalled',complete);
  if('serviceWorker'in navigator&&window.isSecureContext){void navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(error=>console.warn('Offline page unavailable',error));}
  return()=>{display.removeEventListener('change',check);window.removeEventListener('beforeinstallprompt',available);window.removeEventListener('appinstalled',complete);};
 },[]);
 async function install(){
  if(installed||busy)return;
  const event=prompt.current;
  if(!event){setGuide(true);return;}
  setBusy(true);
  try{
   await event.prompt();const choice=await event.userChoice;
   if(choice.outcome==='accepted'){setGuide(false);toast.info('설치를 진행하고 있어. 완료되면 홈 화면이나 앱 목록에서 열어 줘.');}
  }catch{setGuide(true);}
  finally{prompt.current=null;setReady(false);setBusy(false);}
 }
 async function copy(){try{await navigator.clipboard.writeText(address);toast.success('주소를 복사했어. 기본 브라우저에서 붙여 넣어 줘.');}catch{toast.info('아래 주소를 길게 눌러 복사해 줘.');}}
 return <><button className="install-button" onClick={install} disabled={installed||busy}>{installed?<Check size={18}/>:<Download size={18}/>}<span>{installed?'설치됨':busy?'설치 중…':'앱 설치'}</span></button>
 <Dialog open={guide} onOpenChange={setGuide}><DialogContent className="install-dialog"><DialogTitle>홈 화면에 칸지 퀘스트 설치</DialogTitle><DialogDescription>아이콘을 누르면 주소를 찾지 않고 바로 공부할 수 있어.</DialogDescription>
 <div className="install-app-preview"><img src="/icon-192.png" width="64" height="64" alt="칸지 퀘스트 앱 아이콘"/><div><b>칸지 퀘스트</b><p>한 글자씩, 일본어가 보여!</p></div></div>
 {ready?<button className="primary full" onClick={install} disabled={busy}><Download size={18}/>지금 설치하기</button>:<>
 {embedded&&<p className="install-hint">지금 열린 앱 안에서는 설치가 안 될 수 있어. 메뉴에서 ‘다른 브라우저로 열기’를 누르거나 아래 주소를 {platform==='ios'?'Safari':'Chrome'}에서 열어 줘.</p>}
 {platform==='ios'?<ol className="install-steps"><li><Share size={19}/><span>Safari에서 이 페이지를 열고 <b>공유</b> 버튼을 눌러.</span></li><li><Smartphone size={19}/><span><b>홈 화면에 추가</b>를 골라 줘.</span></li><li><Check size={19}/><span>‘웹 앱으로 열기’가 보이면 켜고, <b>추가</b>를 눌러.</span></li></ol>:platform==='android'?<ol className="install-steps"><li><Smartphone size={19}/><span><b>Chrome</b>에서 이 페이지를 열어 줘.</span></li><li><Download size={19}/><span>오른쪽 위 <b>⋮ 메뉴</b>에서 <b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 골라.</span></li><li><Check size={19}/><span><b>설치</b>나 <b>추가</b>를 누르면 홈 화면에서 열 수 있어.</span></li></ol>:<ol className="install-steps"><li><Smartphone size={19}/><span><b>Chrome 또는 Edge</b>에서 이 페이지를 열어 줘.</span></li><li><Download size={19}/><span>주소창의 <b>설치 아이콘</b>이나 브라우저 메뉴의 <b>이 페이지를 앱으로 설치</b>를 골라.</span></li><li><Check size={19}/><span>설치한 뒤 앱 목록에서 열어. Mac Safari에서는 <b>파일 → Dock에 추가</b>도 사용할 수 있어.</span></li></ol>}
 <p className="install-hint">설치 메뉴가 없다면 이미 설치되어 있는지 확인해 줘. 브라우저에 따라 메뉴 이름은 조금 다를 수 있어.</p>
 <div className="install-address"><input value={address} readOnly aria-label="앱 주소" onFocus={event=>event.currentTarget.select()}/><button className="secondary" onClick={copy}><Copy size={17}/>주소 복사</button></div>
 </>}
 <p className="install-note">학습과 진도 저장에는 인터넷 연결이 필요해. 진도는 브라우저별로 구분돼서, 다른 브라우저로 열면 새 기록으로 시작할 수 있어.</p>
 </DialogContent></Dialog></>;
}
