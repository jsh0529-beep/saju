const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const qaDir=process.env.SUN_QA_DIR||path.join(require('node:os').tmpdir(),'hajun-sun-qa');
function boot(saved){
 const d=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://jsh0529-beep.github.io/saju/sun-lab/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=d.window;w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 if(saved)w.localStorage.setItem('hajun-sun-lab-v1',saved);
 const code=['science.js','curriculum.js','app.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'')).join('\n');
 w.eval(code);return d;
}
let d=boot(),w=d.window,doc=w.document;
const el=s=>{const n=doc.querySelector(s);assert.ok(n,`Missing: ${s}`);return n;};
const click=s=>el(s).click();
const input=(s,v)=>{el(s).value=v;el(s).dispatchEvent(new w.Event('input',{bubbles:true}));};
const change=(s,v)=>{el(s).value=v;el(s).dispatchEvent(new w.Event('change',{bubbles:true}));};
const data=()=>JSON.parse(w.localStorage.getItem('hajun-sun-lab-v1'));
function audit(){
 const ids=[...doc.querySelectorAll('[id]')].map(e=>e.id);assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');
 assert.ok(!doc.querySelector('#screen').innerHTML.includes('NaN'));
 for(const input of doc.querySelectorAll('input,select')) assert.ok(input.getAttribute('aria-label')||input.closest('label')||doc.querySelector(`label[for="${input.id}"]`),`Unlabeled ${input.id}`);
 for(const svg of doc.querySelectorAll('svg[role=img]'))assert.ok(svg.getAttribute('aria-label'));
}
audit();assert.match(el('#time-label').textContent,/09:00/);
click('[data-action="check-mission"]');assert.match(el('#mission-message').textContent,/다시 관찰/);
click('[data-time="12"]');assert.match(el('#alt-metric').textContent,/54.1/);click('[data-action="check-mission"]');assert.deepEqual(data().missions,['noon']);
click('[data-season="summer"]');assert.match(el('#alt-metric').textContent,/77.5/);click('[data-mission="1"]');click('[data-action="check-mission"]');
click('[data-action="capture"]');click('[data-action="capture"]');assert.equal(data().notes.length,1);
click('[data-season="winter"]');assert.match(el('#alt-metric').textContent,/30.7/);click('[data-mission="2"]');click('[data-action="check-mission"]');click('[data-action="capture"]');
change('#height','2');assert.match(el('#shadow-label').textContent,/2m/);assert.match(el('#shadow-metric').textContent,/3.36/);
click('[data-season="spring"]');click('[data-time="16"]');click('[data-mission="3"]');click('[data-action="check-mission"]');assert.equal(data().missions.length,4);
input('#time',4);assert.match(el('#alt-metric').textContent,/地|지평선 아래/);assert.match(el('#shadow-metric').textContent,/없음/);
for(const c of ['daegu','seoul','busan','jeju']){change('#city',c);for(const s of ['spring','summer','autumn','winter']){click(`[data-season="${s}"]`);for(const t of [4,6,9,12,15,18,20]){input('#time',t);audit();}}}
click('[data-tab="seasons"]');audit();assert.equal(doc.querySelectorAll('.season-card').length,4);input('#energy',15);assert.match(el('#energy-stat').textContent,/26%/);input('#energy',85);assert.match(el('#energy-stat').textContent,/100%/);click('[data-tilt="no"]');assert.match(el('#tilt-message').textContent,/0°/);click('[data-tilt="yes"]');assert.match(el('#earth-diagram').innerHTML,/rotate\(23.4\)/);
click('[data-explore-season="summer"]');assert.match(el('#time-label').textContent,/12:00/);audit();
click('[data-tab="game"]');audit();for(const angle of [30,65,45,75,20]){input('#guess',angle);click('[data-action="game-submit"]');assert.match(el('.feedback').textContent,/별을 얻었어/);click('[data-action="game-next"]');}assert.equal(data().gameBest,5);assert.match(el('#screen').textContent,/임무 완료/);
click('[data-tab="quiz"]');click('[data-action="quiz-start"]');audit();click('[data-answer="0"]');assert.equal(data().wrong.length,1);assert.ok(el('.feedback.error'));click('[data-action="quiz-next"]');
const answers=[1,1,2,0,2,0,1,1,1,1,2];for(const a of answers){click(`[data-answer="${a}"]`);audit();click('[data-action="quiz-next"]');}
assert.equal(data().mastered.length,11);assert.match(el('#screen').textContent,/12문제 중 11문제/);click('[data-action="quiz-review"]');click('[data-answer="1"]');click('[data-action="quiz-next"]');assert.equal(data().mastered.length,12);assert.equal(data().wrong.length,0);
click('[data-tab="notes"]');audit();assert.equal(doc.querySelectorAll('.badge.earned').length,6);assert.equal(doc.querySelectorAll('tbody tr').length,2);
const saved=w.localStorage.getItem('hajun-sun-lab-v1');d.window.close();d=boot(saved);w=d.window;doc=w.document;click('[data-tab="notes"]');assert.equal(doc.querySelectorAll('.badge.earned').length,6);assert.equal(doc.querySelectorAll('tbody tr').length,2);
click('[data-delete-note]');assert.equal(data().notes.length,1);click('#install');assert.ok(el('#dialog').open);click('#close-dialog');click('#sources');assert.equal(doc.querySelectorAll('.sources a').length,3);click('#close-dialog');
// Export rendered code-native diagrams for visual inspection (not a browser screenshot).
click('[data-tab="lab"]');click('[data-season="summer"]');click('[data-time="12"]');
fs.mkdirSync(qaDir,{recursive:true});
for(const [name,sel] of [['sky','#sky svg'],['angle','#angle-diagram svg']]) fs.writeFileSync(path.join(qaDir,`${name}.svg`),el(sel).outerHTML.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
click('[data-tab="seasons"]');fs.writeFileSync(path.join(qaDir,'earth.svg'),el('#earth-diagram svg').outerHTML.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
click('[data-tab="notes"]');click('[data-action="reset-confirm"]');assert.ok(el('#dialog').open);click('[data-action="reset-all"]');assert.equal(data().notes.length,0);assert.equal(data().mastered.length,0);d.window.close();
console.log('PASS: 112 city/season/time states; four missions; duplicate-safe observations; height changes; night; energy and tilt controls; 5-round game; 12-question quiz and wrong-only review; persistence; badges; dialogs; reset; accessible control labels and unique IDs.');
