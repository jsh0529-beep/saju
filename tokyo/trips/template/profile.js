// Copy this destination-free profile, or use “새 여행 만들기” in the app.
// IDs must stay stable after people begin saving records for a trip.
export default {
  id: 'template', name: '새 여행 템플릿', locale: 'ko-KR',
  city: '', cityLabel: '', localCity: '', timeZone: '',
  itineraryVersion: '1', days: [], places: [], phrases: [], packing: [],
  language: {code: '', label: '여행 회화'}, hotel: null, currency: null,
  brand: {name: 'MY TRIP', avatar: '여', heroTitle: '다음 여행을 준비해요', heroNote: '여행 정보를 입력하고 나만의 일정을 채워보세요.'},
  hero: null, talk: null, flights: null,
  itineraryNote: '아직 목적지와 날짜를 정하지 않은 템플릿이에요.', placesNote: '',
  help: {intro: '여행지의 도움 연락처를 여행 설정에서 추가해 주세요.', phraseIds: [], contacts: [], source: null},
  usefulLinks: [], sources: [], sourceNotes: []
};
