import assert from 'node:assert/strict';
import {CITIES,SEASONS,altitude,noonAltitude,shadowLength,daylight,solarAzimuth,clock,sunState} from '../science.js';
const close=(a,b,e=1e-8)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
// Independent analytic reference cases, not snapshots of implementation.
close(altitude(0,0,12),90);close(altitude(0,0,6),0);close(altitude(0,0,9),45);
close(altitude(45,0,12),45);close(shadowLength(45),1);close(shadowLength(30),Math.sqrt(3));
close(noonAltitude(35.87,23.4),77.53);close(noonAltitude(35.87,0),54.13);close(noonAltitude(35.87,-23.4),30.73);
assert.equal(shadowLength(0),null);assert.equal(shadowLength(-15),null);
for(const {lat} of Object.values(CITIES)){
 const seq=[];
 for(const {dec} of Object.values(SEASONS)){
  const noon=altitude(lat,dec,12);close(noon,noonAltitude(lat,dec));close(solarAzimuth(lat,dec,12),180);
  for(let t=4;t<=20;t+=.25){assert.ok(altitude(lat,dec,t)<=noon+1e-8);close(altitude(lat,dec,t),altitude(lat,dec,24-t));const sh=shadowLength(altitude(lat,dec,t));assert.ok(sh===null||Number.isFinite(sh));}
  close(shadowLength(noon,2),2*shadowLength(noon,1));seq.push(noon);
 }
 assert.ok(seq[1]>seq[0]&&seq[0]>seq[3]);close(seq[0],seq[2]);close(daylight(lat,0),12);assert.ok(daylight(lat,23.4)>12&&daylight(lat,-23.4)<12);
}
assert.equal(clock(12), '12:00');assert.equal(clock(4.1),'04:06');assert.equal(sunState('daegu','summer',12).isNoon,true);
console.log('PASS: analytic reference cases, all city/season noon maxima, symmetry, shadows, azimuth, day length, and time formatting');
