// frontend/src/mockData.ts

// 화성시 중심 좌표 (위도 37.1~37.3, 경도 126.7~126.9 범위 내)
const MIN_LAT = 37.1000;
const MAX_LAT = 37.3000;
const MIN_LNG = 126.7000;
const MAX_LNG = 126.9000;

// 랜덤 좌표 생성 함수
const getRandomCoordinate = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// 랜덤 시간 생성 함수 (오늘 기준 임의의 시간)
const getRandomTime = () => {
  const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const seconds = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export interface CCTVData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  streamName: string;
}

export interface EventData {
  id: string;
  title: string;
  type: '강우량계' | '수위계' | '마을방송' | '지하차도 차단기' | '적설계';
  level: 'critical' | 'warning' | 'info';
  time: string;
  lat: number;
  lng: number;
  hasCctv: boolean;
}

// 1. CCTV 200대 무작위 생성
export const generateMockCCTVs = (): CCTVData[] => {
  const cctvs: CCTVData[] = [];
  for (let i = 1; i <= 200; i++) {
    cctvs.push({
      id: `cctv_${i}`,
      name: `화성시 방범/재난 CCTV #${i}`,
      lat: getRandomCoordinate(MIN_LAT, MAX_LAT),
      lng: getRandomCoordinate(MIN_LNG, MAX_LNG),
      streamName: 'cctv_test' // 모든 CCTV는 테스트 스트림을 공유합니다.
    });
  }
  return cctvs;
};

// 2. 이벤트(알람) 100개 무작위 생성
export const generateMockEvents = (): EventData[] => {
  const events: EventData[] = [];
  const eventTypes: Array<'강우량계' | '수위계' | '마을방송' | '지하차도 차단기' | '적설계'> = 
    ['강우량계', '수위계', '마을방송', '지하차도 차단기', '적설계'];
  const levels: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'info'];

  for (let i = 1; i <= 100; i++) {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    let title = '';
    if (type === '강우량계') title = `국지성 집중호우 경보 (강우량 초과)`;
    else if (type === '수위계') title = `하천 수위 위험 단계 도달`;
    else if (type === '마을방송') title = `재난 방송 시스템 단선 오류`;
    else if (type === '지하차도 차단기') title = `지하차도 침수 위험 - 자동차단기 강제 개방`;
    else if (type === '적설계') title = `대설 주의보 - 적설량 한계치 초과`;

    events.push({
      id: `evt_${i}`,
      title: `[${type}] ${title}`,
      type,
      level,
      time: getRandomTime(),
      lat: getRandomCoordinate(MIN_LAT, MAX_LAT),
      lng: getRandomCoordinate(MIN_LNG, MAX_LNG),
      hasCctv: true // 모든 이벤트에서 주변 CCTV를 띄울 수 있도록 true 설정
    });
  }

  // 시간순으로 정렬 (최신 시간이 위로 오게)
  return events.sort((a, b) => b.time.localeCompare(a.time));
};

// 3. 두 GPS 좌표 간의 거리를 계산하는 Haversine 알고리즘 (단위: 미터)
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // 지구 반경 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
};

// ==========================================
// FMS (시설관리시스템) 용 Mock Data
// ==========================================

export interface FacilityData {
  id: string;
  name: string;
  type: '수위계' | '강우량계' | '적설계' | '지하차도 차단기' | 'CCTV' | '마을방송';
  address: string;
  status: '정상' | '점검중' | '장애';
  lastInspected: string;
  nextInspection: string;
  manager: string;
}

export const generateMockFacilities = (): FacilityData[] => {
  const facilities: FacilityData[] = [];
  const types: Array<'수위계' | '강우량계' | '적설계' | '지하차도 차단기' | 'CCTV' | '마을방송'> = 
    ['수위계', '강우량계', '적설계', '지하차도 차단기', 'CCTV', '마을방송'];
  const statuses: Array<'정상' | '점검중' | '장애'> = ['정상', '정상', '정상', '정상', '점검중', '장애']; // 정상이 더 많도록 비율 조정
  const locations = ['남양읍', '향남읍', '동탄동', '병점동', '봉담읍', '우정읍', '마도면', '송산면', '서신면', '팔탄면'];
  const managers = ['김철수', '이영희', '박지민', '최동훈', '정상훈'];

  for (let i = 1; i <= 30; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const manager = managers[Math.floor(Math.random() * managers.length)];
    
    // YYYY-MM-DD 포맷 랜덤 날짜 생성기
    const getRandomDate = (startYear: number, endYear: number) => {
      const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    facilities.push({
      id: `fac_${i}`,
      name: `화성시 ${location} ${type} #${i}`,
      type,
      address: `경기도 화성시 ${location} 일대`,
      status,
      lastInspected: getRandomDate(2025, 2026),
      nextInspection: getRandomDate(2026, 2027),
      manager
    });
  }

  return facilities;
};

// ==========================================
// 시스템 간 상태 공유 (Singleton Mock Data)
// ==========================================

let sharedCCTVs: CCTVData[] | null = null;
let sharedEvents: EventData[] | null = null;

export const getSharedCCTVs = (): CCTVData[] => {
  if (!sharedCCTVs) sharedCCTVs = generateMockCCTVs();
  return sharedCCTVs;
};

export const getSharedEvents = (): EventData[] => {
  if (!sharedEvents) sharedEvents = generateMockEvents();
  return sharedEvents;
};

// FMS의 시설물 리스트는 Dashboard의 디바이스(CCTV + Event) 데이터를 그대로 맵핑하여 생성합니다.
export const getSharedFacilities = (): FacilityData[] => {
  const cctvs = getSharedCCTVs();
  const events = getSharedEvents();

  const statuses: Array<'정상' | '점검중' | '장애'> = ['정상', '정상', '정상', '정상', '점검중', '장애'];
  const managers = ['김철수', '이영희', '박지민', '최동훈', '정상훈'];
  
  const getRandomDate = (startYear: number, endYear: number) => {
    const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const facilities: FacilityData[] = [];

  // CCTV 데이터를 Facility로 변환
  cctvs.forEach((cctv) => {
    facilities.push({
      id: cctv.id,
      name: cctv.name,
      type: 'CCTV',
      address: `화성시 GPS(${cctv.lat.toFixed(4)}, ${cctv.lng.toFixed(4)})`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastInspected: getRandomDate(2025, 2026),
      nextInspection: getRandomDate(2026, 2027),
      manager: managers[Math.floor(Math.random() * managers.length)],
    });
  });

  // IoT 이벤트(센서) 데이터를 Facility로 변환
  events.forEach((evt) => {
    facilities.push({
      id: evt.id,
      name: evt.title.replace(/\[.*?\] /, ''), // "[강우량계] 국지성..." 형태에서 분류명 제거
      type: evt.type as FacilityData['type'],
      address: `화성시 GPS(${evt.lat.toFixed(4)}, ${evt.lng.toFixed(4)})`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastInspected: getRandomDate(2025, 2026),
      nextInspection: getRandomDate(2026, 2027),
      manager: managers[Math.floor(Math.random() * managers.length)],
    });
  });

  return facilities;
};
