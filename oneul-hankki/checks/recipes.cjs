const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const recipes=require('../recipes.js'),E=require('../engine.js');
const crypto=require('node:crypto');
const photoHashes=new Set();
for(const r of recipes){assert.equal(r.image,'recipes/'+r.id);const image=fs.readFileSync(path.join(__dirname,'../assets',r.image+'.webp'));assert.equal(image.toString('ascii',8,12),'WEBP');photoHashes.add(crypto.createHash('sha256').update(image).digest('hex'));}
assert.equal(photoHashes.size,recipes.length,'Every recipe must have its own distinct photo');
const prefs={maxTime:15,son:1,husband:1,allergens:[],dislike:''};
assert.equal(recipes.length,84);assert.equal(new Set(recipes.map(r=>r.id)).size,84);
for(const r of recipes){assert.ok(r.ingredients.length>=4);assert.ok(r.steps.length>=3);assert.ok(r.time<=15);assert.ok(fs.existsSync(path.join(__dirname,'../assets',r.image+'.webp')));r.ingredients.forEach(i=>assert.ok(i.qty>0));}
assert.equal(recipes.filter(r=>r.meal==='breakfast').length,32);
assert.equal(recipes.filter(r=>r.meal==='dinner').length,52);
assert.equal(new Set(recipes.map(r=>r.title)).size,84);
assert.equal(new Set(recipes.map(r=>r.category)).size,8);
for(let run=0;run<20;run++){const plan=E.plan(recipes,prefs,{breakfast:'b1',dinner:'d1'});assert.equal(plan.length,7);assert.equal(plan[0].breakfast,'b1');assert.equal(plan[0].dinner,'d1');const ids=plan.flatMap(x=>[x.breakfast,x.dinner]);assert.equal(new Set(ids).size,14);}
for(const a of new Set(recipes.flatMap(r=>r.allergens))){const p={...prefs,allergens:[a]};assert.ok(E.eligible(recipes,p).every(r=>!r.allergens.includes(a)));assert.ok(E.plan(recipes,p).flatMap(r=>Object.values(r)).filter(Boolean).every(id=>!recipes.find(r=>r.id===id).allergens.includes(a)));}
assert.equal(E.eligible(recipes,{...prefs,maxTime:5},'dinner').length,0);
assert.ok(E.plan(recipes,{...prefs,maxTime:5}).every(r=>r.dinner===null));
assert.ok(E.eligible(recipes,{...prefs,dislike:'버섯, 오이'}).every(r=>!r.ingredients.some(i=>/버섯|오이/.test(i.name))));
assert.ok(E.eligible(recipes,{...prefs,koreanOnly:true}).every(r=>r.korean));
assert.equal(E.eligible(recipes,{...prefs,koreanOnly:true}).length,74);
assert.ok(E.eligible(recipes,{...prefs,mildOnly:true}).every(r=>!r.spicy));
assert.ok(E.eligible(recipes,{...prefs,allergens:['소고기','돼지고기','닭고기','토마토']}).every(r=>!r.ingredients.some(i=>/소고기|돼지고기|삼겹살|닭|토마토/.test(i.name))));
const items=E.shopping(recipes,['b1','d1'],prefs);
assert.equal(items.find(i=>i.name==='식용유').qty,4);
assert.equal(items.find(i=>i.name==='달걀').qty,4);
assert.ok(!items.some(i=>i.name==='물'));
const large=E.shopping(recipes,['b1','d1'],{...prefs,son:1.5,husband:1});
assert.equal(large.find(i=>i.name==='달걀').qty,5);
assert.equal(large.find(i=>i.name==='식용유').qty,5);
assert.equal(E.shopping(recipes,['b1','b1'],prefs).find(i=>i.name==='달걀').qty,8);
assert.equal(E.pick([]),null);
for(let i=0;i<50;i++)assert.equal(E.pick([{id:'a',protein:'a'},{id:'b',protein:'b'}],['a']),'b');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
for(const file of [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(x=>x[1])){if(!file.startsWith('http'))assert.ok(fs.existsSync(path.join(__dirname,'..',file.split('?')[0])),file);}
console.log('PASS: 84 recipes, 20 diverse weekly plans, exclusions, empty-state, portion scaling, shopping aggregation and local assets.');
