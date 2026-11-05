const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(process.env.SAJU_HTML_PATH||path.resolve(__dirname,'../../index.html'),'utf8');
const lunar=fs.readFileSync(require.resolve('lunar-javascript/lunar.js'),'utf8');
const origin='http://127.0.0.1:4173';
const apiKey='sk-ant-test-only-never-a-real-key';
const adminKey='test-only-admin-key';
const payloads=[
  '<img src=x onerror="window.__xss=1">',
  '<svg onload="window.__xss=2"></svg>',
  '"><img src=x onerror="window.__xss=3">',
  "'><iframe srcdoc=\"<script>parent.__xss=4</script>\"></iframe>",
  '<script>window.__xss=5</script><a href="javascript:window.__xss=6">실행</a>',
  '&lt;img src=x onerror=window.__xss=7&gt; & " \'',
  '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=x onerror=window.__xss=8>">',
  '<input id="adminKey" autofocus onfocus="window.__xss=9"><form id="boards"></form>',
];

// Every request is intercepted: no real customer data, emails, credentials, or
// paid model requests ever reach Apps Script or Anthropic during this suite.
async function boot(page,options={}){
  const calls=[],unexpected=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({blocked,legacy})=>{
    window.__xss=0;
    if(legacy){
      for(const storage of [localStorage,sessionStorage]){
        storage.setItem('mh_key','legacy-api-test'); storage.setItem('mh_adm','legacy-admin-test');
        storage.setItem('unrelated-setting','keep');
      }
    }
    if(blocked){
      for(const name of ['localStorage','sessionStorage'])Object.defineProperty(window,name,{get(){throw new DOMException('disabled','SecurityError');}});
    }
  },{blocked:!!options.blocked,legacy:!!options.legacy});
  await page.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===origin&&url.pathname==='/saju/')return route.fulfill({contentType:'text/html',body:html});
    if(url.pathname.endsWith('/lunar.js'))return route.fulfill({contentType:'application/javascript',body:lunar});
    if(url.pathname.endsWith('/qrcode.min.js'))return route.fulfill({contentType:'application/javascript',body:''});
    if(url.hostname==='fonts.googleapis.com')return route.fulfill({contentType:'text/css',body:''});
    if(url.hostname==='script.google.com'||url.hostname==='api.anthropic.com'){
      const body=request.postData()?JSON.parse(request.postData()):null;
      const call={url,method:request.method(),body,headers:request.headers()}; calls.push(call);
      const data=options.respond?await options.respond(call):undefined;
      return route.fulfill({contentType:'application/json',body:JSON.stringify(data??{ok:true,text:'【첫마디】\n차분하게 살펴보겠습니다.',id:'test-application'})});
    }
    unexpected.push(request.url()); return route.abort();
  });
  await page.goto(origin+'/saju/#admin');
  await expect(page.locator('#admin')).toBeVisible();
  return {calls,unexpected,errors};
}
async function calculate(page,name='장성혁'){
  await page.locator('#name').fill(name);
  await page.locator('#email').fill('customer@example.invalid');
  await page.locator('#bdate').fill('19830524');
  await page.locator('#btime').fill('20:00');
  await page.locator('#calcBtn').click();
  await expect(page.locator('#board')).toBeVisible();
  return page.evaluate(()=>JSON.parse(JSON.stringify(sajuData)));
}
async function safeDOM(page,selector){
  await expect(page.locator(selector).locator('script,img,svg,iframe,math,a,form,style,link,object,embed')).toHaveCount(0);
  expect(await page.locator(selector).evaluate(el=>[...el.querySelectorAll('*')].some(node=>[...node.attributes].some(a=>/^on/i.test(a.name))))).toBe(false);
  expect(await page.evaluate(()=>window.__xss)).toBe(0);
}
async function noStoredKeys(page){
  expect(await page.evaluate(()=>[localStorage,sessionStorage].map(s=>[s.getItem('mh_key'),s.getItem('mh_adm')]))).toEqual([[null,null],[null,null]]);
}
async function paste(page,data){
  await page.locator('#pasteBox').fill('테스트 신청\nDATA: '+JSON.stringify(data));
  await page.locator('#loadPaste').click();
}

test('Korean names, Hanja, hunum, calendar, application and payment state remain usable',async({page})=>{
  const {calls,unexpected,errors}=await boot(page);
  await calculate(page);
  for(const [i,v] of ['張','이룰 성','赫'].entries())await page.locator('#hanChars input').nth(i).fill(v);
  await page.locator('#bongwan').fill('인동 장씨 (仁同 張氏)');
  await page.locator('#question').fill('이직 시기와 가족의 건강이 궁금합니다.');
  await page.locator('#calcBtn').click();
  await expect(page.locator('#boards')).toContainText('張');
  await expect(page.locator('#boards')).toContainText('훈음: 이룰 성');
  await expect(page.locator('#boards')).toContainText('인동 장씨 (仁同 張氏)');
  await page.locator('#applyBtn').click();
  await expect(page.locator('#payBtn')).toBeEnabled();
  const application=calls.find(c=>c.body?.name==='장성혁'&&!c.body.action);
  expect(application.body.data.nameChars[1]['한자']).toBe('훈음: 이룰 성');
  expect(application.body.data.email).toBe('customer@example.invalid');
  await page.locator('#calSeg [data-v=lunar]').click();
  await page.locator('#noTime').check();
  await page.locator('#calcBtn').click();
  await expect(page.locator('#boards .pl')).toHaveCount(3);
  await page.locator('#modeSeg [data-v=couple]').click();
  await page.locator('#name2').fill('홍길동');
  await page.locator('#bdate2').fill('19850316');
  await page.locator('#noTime2').check();
  await page.locator('#calcBtn').click();
  await expect(page.locator('#boards .wongook')).toHaveCount(2);
  await expect(page.locator('#boards')).toContainText('홍길동');
  expect(unexpected).toEqual([]); expect(errors).toEqual([]);
});

for(const [n,attack] of payloads.entries()){
  test(`untrusted board/name/teaser/pasted/nested fields stay text: payload ${n+1}`,async({page})=>{
    const {unexpected,errors}=await boot(page,{respond:()=>({ok:true,text:attack})});
    const chart=await calculate(page,'장성혁'+attack);
    await safeDOM(page,'#boards');
    await page.locator('#hanChars input').first().fill(attack);
    await page.locator('#name').fill('장성혁'+attack+'가');
    await expect(page.locator('#hanChars input').first()).toHaveValue(attack);
    await page.locator('#bongwan').fill(attack);
    await page.locator('#calcBtn').click();
    await expect(page.locator('#boards')).toContainText(attack);
    await expect(page.locator('#teaserBody')).toContainText(attack);
    await safeDOM(page,'#boards'); await safeDOM(page,'#teaserBody'); await safeDOM(page,'#hanChars');
    // Saved/pasted charts can replace even computed scalar fields with strings.
    function poison(value){
      if(Array.isArray(value))return value.map(poison);
      if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,typeof v==='boolean'?v:poison(v)]));
      return attack;
    }
    const bad=poison(chart);
    for(const type of ['samhap','name','tojeong','personal','couple']){
      const data=type==='couple'?{type,p1:bad,p2:bad}:{...bad,type};
      await paste(page,data);
      await expect(page.locator('#boards')).toContainText(attack);
      await safeDOM(page,'#boards');
    }
    expect(unexpected).toEqual([]); expect(errors).toEqual([]);
  });
}

test('admin list, more, saved AI headings/body and report IDs are safe; download/send contracts preserved',async({page})=>{
  const attack=payloads[0],id='id"&action=sendserver&key=other#'+attack;
  let chart;
  const {calls,unexpected,errors}=await boot(page,{respond:c=>{
    if(c.url.hostname==='api.anthropic.com')throw new Error('Unexpected paid request');
    if(c.method==='GET'&&c.url.searchParams.get('action')==='report')return {ok:true,sections:JSON.stringify(Array(7).fill(`【${attack}】\n【요약 ${attack}】본문 ${attack}\n${attack}`))};
    if(c.method==='GET')return {ok:true,list:Array.from({length:7},(_,i)=>({id:i===6?id:String(i),name:attack,ts:attack,status:'작성완료 '+attack,data:JSON.stringify({...chart,product:attack})}))};
    if(c.body?.action==='pdfmake')return {ok:true,b64:Buffer.from('mock-document').toString('base64'),fname:'테스트.docx'};
    return {ok:true,text:'첫마디'};
  }});
  chart=await calculate(page);
  await page.locator('#adminKey').fill(adminKey);
  await page.locator('#listBtn').click();
  await expect(page.locator('.app-item')).toHaveCount(5);
  await page.locator('#moreBtn').click();
  await expect(page.locator('.app-item')).toHaveCount(7);
  await safeDOM(page,'#appList');
  await page.locator('.app-item').first().click();
  await expect(page.locator('#preview')).toBeVisible();
  await expect(page.locator('#preview')).toContainText(attack);
  await expect(page.locator('#preview b')).toHaveCount(7);
  await safeDOM(page,'#preview');
  const read=calls.find(c=>c.url.searchParams.get('action')==='report');
  expect(read.url.searchParams.get('id')).toBe(id);
  expect(read.url.searchParams.getAll('action')).toEqual(['report']);
  expect(read.url.searchParams.get('key')).toBe(adminKey);
  expect(read.headers.referer).toBeUndefined();
  const download=page.waitForEvent('download');
  await page.locator('#docBtn').click();
  expect((await download).suggestedFilename()).toBe('테스트.docx');
  await page.evaluate(()=>window.confirm=()=>true);
  await page.locator('#sendBtn').click();
  await expect.poll(()=>calls.some(c=>c.body?.action==='sendserver')).toBe(true);
  expect(calls.find(c=>c.body?.action==='sendserver').body).toEqual({action:'sendserver',key:adminKey,id});
  await noStoredKeys(page);
  expect(unexpected).toEqual([]); expect(errors).toEqual([]);
});

test('background generation keeps existing server contract and needs no browser API key',async({page})=>{
  let chart;
  const {calls,errors}=await boot(page,{respond:c=>c.method==='GET'?{ok:true,list:[{id:'queue-test',name:'장성혁',ts:'테스트',status:'대기',data:chart}]}:{ok:true,text:'첫마디'}});
  chart=await calculate(page);
  await page.locator('#adminKey').fill(adminKey);
  await page.locator('#listBtn').click();
  await page.evaluate(()=>{let n=0;window.confirm=()=>++n===1;});
  await page.locator('.app-item').click();
  await expect.poll(()=>calls.some(c=>c.body?.action==='queue')).toBe(true);
  expect(calls.find(c=>c.body?.action==='queue').body).toEqual({action:'queue',key:adminKey,id:'queue-test',autoSend:false});
  expect(calls.some(c=>c.url.hostname==='api.anthropic.com')).toBe(false);
  await noStoredKeys(page); expect(errors).toEqual([]);
});

test('four-step direct generation renders AI as text and clears its temporary API key',async({page})=>{
  const {calls,errors}=await boot(page,{respond:c=>c.url.hostname==='api.anthropic.com'?{content:[{type:'text',text:`【제목 ${payloads[1]}】\n【소제목】본문 ${payloads[0]}`}]}:undefined});
  const chart=await calculate(page);
  await paste(page,{...chart,type:'personal',tier:'standard'});
  await page.locator('#apiKey').fill(apiKey);
  await page.locator('#genBtn').click();
  await expect(page.locator('#preview')).toBeVisible();
  await expect(page.locator('#preview b')).toHaveCount(4);
  await safeDOM(page,'#preview');
  const modelCalls=calls.filter(c=>c.url.hostname==='api.anthropic.com');
  expect(modelCalls).toHaveLength(4);
  expect(modelCalls.every(c=>c.headers['x-api-key']===apiKey)).toBe(true);
  await expect(page.locator('#apiKey')).toHaveValue('');
  await noStoredKeys(page); expect(errors).toEqual([]);
});

test('legacy secrets are removed without restoring or deleting unrelated settings; reload clears typed keys',async({page})=>{
  await boot(page,{legacy:true});
  await noStoredKeys(page);
  await expect(page.locator('#apiKey')).toHaveValue(''); await expect(page.locator('#adminKey')).toHaveValue('');
  expect(await page.evaluate(()=>[localStorage.getItem('unrelated-setting'),sessionStorage.getItem('unrelated-setting')])).toEqual(['keep','keep']);
  await page.locator('#apiKey').fill(apiKey); await page.locator('#adminKey').fill(adminKey);
  await page.reload();
  await expect(page.locator('#apiKey')).toHaveValue(''); await expect(page.locator('#adminKey')).toHaveValue('');
  await noStoredKeys(page);
});

test('failed direct generation also clears the temporary API key',async({page})=>{
  await boot(page,{respond:c=>c.url.hostname==='api.anthropic.com'?{content:[]}:undefined});
  const chart=await calculate(page); await paste(page,{...chart,type:'personal',tier:'standard'});
  await page.locator('#apiKey').fill(apiKey); await page.locator('#genBtn').click();
  await expect(page.locator('#progMsg')).toContainText('오류:');
  await expect(page.locator('#apiKey')).toHaveValue('');
  await expect(page.locator('#genBtn')).toBeEnabled(); await noStoredKeys(page);
});

for(const how of ['button','moon','pagehide','bfcache']){
  test(`closing admin clears credentials/customer view: ${how}`,async({page})=>{
    await boot(page); await calculate(page);
    await page.locator('#apiKey').fill(apiKey); await page.locator('#adminKey').fill(adminKey);
    await page.locator('#pasteBox').fill('고객 테스트');
    if(how==='button')await page.locator('#lockAdmin').click();
    if(how==='moon')await page.evaluate(()=>{for(let i=0;i<5;i++)document.getElementById('moon').click();});
    if(how==='pagehide')await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide')));
    if(how==='bfcache')await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
    await expect(page.locator('#admin')).toBeHidden();
    await expect(page.locator('#apiKey')).toHaveValue(''); await expect(page.locator('#adminKey')).toHaveValue('');
    await expect(page.locator('#pasteBox')).toHaveValue('');
    await expect(page.locator('#boards')).toBeEmpty(); await expect(page.locator('#preview')).toBeEmpty();
    expect(await page.evaluate(()=>({data:sajuData,parts:sections,id:currentAppId}))).toEqual({data:null,parts:[],id:null});
    await noStoredKeys(page);
  });
}

test('storage-denied browsers still calculate and render without errors',async({page})=>{
  const {errors}=await boot(page,{blocked:true});
  await calculate(page);
  await expect(page.locator('#boards')).toContainText('장성혁');
  await page.locator('#lockAdmin').click(); expect(errors).toEqual([]);
});

test('closing admin aborts in-flight generation and does not repopulate a locked preview',async({page})=>{
  let release;
  const pending=new Promise(resolve=>release=resolve);
  const {calls}=await boot(page,{respond:async c=>{
    if(c.url.hostname==='api.anthropic.com'){await pending;return {content:[{type:'text',text:'늦은 응답'}]};}
  }});
  const chart=await calculate(page); await paste(page,{...chart,type:'personal',tier:'standard'});
  await page.locator('#apiKey').fill(apiKey); await page.locator('#genBtn').click();
  await expect.poll(()=>calls.filter(c=>c.url.hostname==='api.anthropic.com').length).toBe(1);
  await page.locator('#lockAdmin').click(); release();
  await expect.poll(()=>page.evaluate(()=>genRunning)).toBe(false);
  await expect(page.locator('#preview')).toBeEmpty(); await expect(page.locator('#preview')).toBeHidden();
  await expect(page.locator('#apiKey')).toHaveValue('');
  expect(calls.filter(c=>c.url.hostname==='api.anthropic.com')).toHaveLength(1);
});
