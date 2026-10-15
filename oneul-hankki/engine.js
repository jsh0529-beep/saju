(function(root){
const portions=[0.5,0.75,1,1.25,1.5,2];
const E={
 members(prefs={}){
  const source=Array.isArray(prefs.members)&&prefs.members.length?prefs.members:[{id:'son',relation:'아들',age:13,portion:prefs.son??1},{id:'husband',relation:'남편',age:44,portion:prefs.husband??1}];
  const ids=new Set();
  return source.slice(0,12).map((m,i)=>{m=m&&typeof m==='object'?m:{};let id=String(m.id||`member-${i}`).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,60)||`member-${i}`;if(ids.has(id))id=`member-${i}`;while(ids.has(id))id+='x';ids.add(id);const age=m.age===null||m.age===undefined||m.age===''?null:Number(m.age);return {id,relation:String(m.relation||'가족').trim().slice(0,16)||'가족',name:String(m.name||'').trim().slice(0,20),age:Number.isInteger(age)&&age>=0&&age<=120?age:null,portion:portions.includes(Number(m.portion))?Number(m.portion):1};});
 },
 servings(prefs){return E.members(prefs).reduce((sum,m)=>sum+m.portion,0);},
 eligible(recipes,prefs,meal){const words=(prefs.dislike||'').split(/[,，]/).map(x=>x.trim()).filter(Boolean);return recipes.filter(r=>(!meal||r.meal===meal)&&r.time<=prefs.maxTime&&(!prefs.koreanOnly||r.korean)&&(!prefs.mildOnly||!r.spicy)&&!r.allergens.some(a=>(prefs.allergens||[]).includes(a))&&!words.some(w=>r.title.includes(w)||r.ingredients.some(i=>i.name.includes(w))));},
 pick(pool,exclude=[],usedProteins=[]){if(!pool.length)return null;let choices=pool.filter(r=>!exclude.includes(r.id));if(!choices.length)choices=pool;const low=choices.filter(r=>!usedProteins.includes(r.protein));if(low.length)choices=low;return choices[Math.floor(Math.random()*choices.length)].id;},
 plan(recipes,prefs,first={}){const used=[],proteins=[],out=[];for(let d=0;d<7;d++){const row={};for(const meal of ['breakfast','dinner']){const pool=E.eligible(recipes,prefs,meal);row[meal]=d===0&&pool.some(r=>r.id===first[meal])?first[meal]:E.pick(pool,used,meal==='dinner'?proteins.slice(-2):[]);if(row[meal]){used.push(row[meal]);if(meal==='dinner')proteins.push(recipes.find(r=>r.id===row[meal]).protein)}}out.push(row)}return out;},
 shopping(recipes,ids,prefs){const totals=new Map(),factor=E.servings(prefs)/2;ids.filter(Boolean).forEach(id=>{const r=recipes.find(x=>x.id===id);if(!r)return;r.ingredients.forEach(i=>{if(i.name==='물')return;const key=i.name+'|'+i.unit;const old=totals.get(key)||{...i,qty:0,key};old.qty+=i.qty*factor;totals.set(key,old);})});return [...totals.values()];},
 format(n){return Math.round(n*10)/10;},
 dateKey(date=new Date()){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
};if(typeof module!=='undefined')module.exports=E;else root.MealEngine=E;
})(typeof window!=='undefined'?window:globalThis);
