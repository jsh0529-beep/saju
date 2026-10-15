(function(root){
const E={
 eligible(recipes,prefs,meal){const words=(prefs.dislike||'').split(/[,，]/).map(x=>x.trim()).filter(Boolean); return recipes.filter(r=>(!meal||r.meal===meal)&&r.time<=prefs.maxTime&&!r.allergens.some(a=>prefs.allergens.includes(a))&&!words.some(w=>r.title.includes(w)||r.ingredients.some(i=>i.name.includes(w))));},
 pick(pool,exclude=[],usedProteins=[]){if(!pool.length)return null;let choices=pool.filter(r=>!exclude.includes(r.id)); if(!choices.length) choices=pool; const low=choices.filter(r=>!usedProteins.includes(r.protein));if(low.length)choices=low;return choices[Math.floor(Math.random()*choices.length)].id;},
 plan(recipes,prefs,first={}){const used=[],proteins=[],out=[]; for(let d=0;d<7;d++){const row={};for(const meal of ['breakfast','dinner']){const pool=E.eligible(recipes,prefs,meal);row[meal]=d===0&&pool.some(r=>r.id===first[meal])?first[meal]:E.pick(pool,used,meal==='dinner'?proteins.slice(-2):[]);if(row[meal]){used.push(row[meal]);if(meal==='dinner')proteins.push(recipes.find(r=>r.id===row[meal]).protein)}}out.push(row)}return out;},
 shopping(recipes,ids,prefs){const totals=new Map(), factor=(prefs.son+prefs.husband)/2;ids.filter(Boolean).forEach(id=>{const r=recipes.find(x=>x.id===id);if(!r)return;r.ingredients.forEach(i=>{if(i.name==='물')return;const key=i.name+'|'+i.unit; const old=totals.get(key)||{...i,qty:0,key};old.qty+=i.qty*factor;totals.set(key,old);})});return [...totals.values()];},
 format(n){return Math.round(n*10)/10;},
 dateKey(date=new Date()){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
};if(typeof module!=='undefined')module.exports=E;else root.MealEngine=E;
})(typeof window!=='undefined'?window:globalThis);
