// Idealized seasonal model: fixed declination for each equinox/solstice.
// Hours are apparent solar time, NOT Korean Standard Time.
export const CITIES = {
  daegu: { name: '대구', lat: 35.87 },
  seoul: { name: '서울', lat: 37.57 },
  busan: { name: '부산', lat: 35.18 },
  jeju: { name: '제주', lat: 33.50 },
};
export const SEASONS = {
  spring: { name:'봄', term:'춘분 무렵', month:'3월 무렵', dec:0, color:'#e988ad', icon:'✿', detail:'겨울보다 높아진 태양. 낮과 밤의 길이는 비슷해.' },
  summer: { name:'여름', term:'하지 무렵', month:'6월 무렵', dec:23.4, color:'#eaaa26', icon:'☀', detail:'1년 중 남중고도가 가장 높고, 낮도 가장 길어.' },
  autumn: { name:'가을', term:'추분 무렵', month:'9월 무렵', dec:0, color:'#de8150', icon:'❧', detail:'춘분 무렵과 남중고도가 비슷해. 낮과 밤도 비슷해.' },
  winter: { name:'겨울', term:'동지 무렵', month:'12월 무렵', dec:-23.4, color:'#689cde', icon:'❄', detail:'1년 중 남중고도가 가장 낮고, 낮도 가장 짧아.' },
};
const rad = Math.PI / 180;
export function altitude(lat, dec, solarHour) {
  const s = Math.sin(lat*rad)*Math.sin(dec*rad) + Math.cos(lat*rad)*Math.cos(dec*rad)*Math.cos((solarHour-12)*15*rad);
  return Math.asin(Math.min(1, Math.max(-1,s))) / rad;
}
export function noonAltitude(lat, dec) { return 90 - Math.abs(lat-dec); }
export function shadowLength(alt, height=1) { return alt > 0 ? height / Math.tan(alt*rad) : null; }
export function daylight(lat, dec) {
  return 2 * Math.acos(Math.min(1, Math.max(-1,-Math.tan(lat*rad)*Math.tan(dec*rad)))) / rad / 15;
}
export function solarAzimuth(lat, dec, hour) {
  const h=(hour-12)*15*rad;
  return (Math.atan2(Math.sin(h), Math.cos(h)*Math.sin(lat*rad)-Math.tan(dec*rad)*Math.cos(lat*rad))/rad+180+360)%360;
}
export function clock(hour) { const m=Math.round(hour*60); return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`; }
export function duration(hours) { const m=Math.round(hours*60); return `${Math.floor(m/60)}시간 ${m%60}분`; }
export function shadowText(length) { return length===null ? '없음' : length>=100 ? '100m 이상' : `${length.toFixed(2)}m`; }
export function sunState(city, season, time, height=1) {
  const {lat}=CITIES[city],{dec}=SEASONS[season];
  const alt=altitude(lat,dec,time);
  return {alt,shadow:shadowLength(alt,height),noon:noonAltitude(lat,dec),day:daylight(lat,dec),az:solarAzimuth(lat,dec,time),isNoon:Math.abs(time-12)<.001,isDay:alt>0};
}
