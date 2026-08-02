// frontend/src/Dashboard.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Tooltip, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Bell, Video, ArrowLeft, ShieldCheck, AlertTriangle, CloudSun, Info, MapPin, Clock, CloudRain, Waves, Megaphone, OctagonAlert, Cctv, Map, Globe } from 'lucide-react';
import CctvPlayer from './CctvPlayer';
import { getSharedCCTVs, getSharedEvents, calculateDistance, type CCTVData, type EventData } from './mockData';

// React-Leaflet 지도 중심 이동을 위한 컨트롤러 컴포넌트
const MapController = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      // 선택된 좌표로 부드럽게 이동(flyTo)하고 줌을 15단계로 확대합니다.
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  
  return null;
};

// SVG 아이콘을 Leaflet 마커로 렌더링해주는 헬퍼 함수
const createCustomIcon = (iconElement: React.ReactElement, bgColor: string, color: string) => {
  const iconHtml = renderToString(
    <div style={{
      backgroundColor: bgColor,
      color: color,
      borderRadius: '50%',
      padding: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
      border: `2px solid ${color}`,
      backdropFilter: 'blur(4px)'
    }}>
      {iconElement}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-div-icon', // 기본 백그라운드를 지우기 위한 클래스 (index.css 추가)
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// 분류별 커스텀 마커 아이콘 정의
const cctvIcon = createCustomIcon(<Cctv size={20} />, 'rgba(30, 41, 59, 0.8)', '#94a3b8'); // CCTV: 짙은 회색 바탕에 밝은 회색 CCTV 아이콘
const rainIcon = createCustomIcon(<CloudRain size={20} />, 'rgba(14, 165, 233, 0.3)', '#38bdf8'); // 강우량계: 하늘색
const waveIcon = createCustomIcon(<Waves size={20} />, 'rgba(59, 130, 246, 0.3)', '#60a5fa'); // 수위계: 파란색
const megaIcon = createCustomIcon(<Megaphone size={20} />, 'rgba(249, 115, 22, 0.3)', '#fb923c'); // 마을방송: 주황색
const alertIcon = createCustomIcon(<OctagonAlert size={20} />, 'rgba(239, 68, 68, 0.3)', '#f87171'); // 차단기: 빨간색

const getEventIcon = (type: string) => {
  switch (type) {
    case '강우량계': return rainIcon;
    case '수위계': return waveIcon;
    case '마을방송': return megaIcon;
    case '지하차도 차단기': return alertIcon;
    case '적설계': return rainIcon; // 적설계도 강우량계와 유사한 날씨 마커 사용
    default: return alertIcon;
  }
};

// UI 컴포넌트 렌더링용 아이콘 헬퍼 (지도 마커와 동일한 디자인)
const getTypeReactIcon = (type: string) => {
  switch (type) {
    case 'CCTV': return <Cctv size={16} color="#94a3b8" />;
    case '강우량계': return <CloudRain size={16} color="#38bdf8" />;
    case '수위계': return <Waves size={16} color="#60a5fa" />;
    case '마을방송': return <Megaphone size={16} color="#fb923c" />;
    case '지하차도 차단기': return <OctagonAlert size={16} color="#f87171" />;
    case '적설계': return <CloudRain size={16} color="#e2e8f0" />;
    default: return <AlertTriangle size={16} color="#f87171" />;
  }
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // 전역 상태에 저장된 300개의 데이터 호출
  const cctvs = useMemo(() => getSharedCCTVs(), []);
  const events = useMemo(() => getSharedEvents(), []);

  // 상태 관리
  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);
  const [nearbyCCTVs, setNearbyCCTVs] = useState<CCTVData[]>([]);
  
  // 단일 CCTV 클릭 시 뜨는 모달을 위한 상태
  const [activeSingleCCTV, setActiveSingleCCTV] = useState<CCTVData | null>(null);
  
  // 지도 이동을 위한 중심 좌표 상태
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // 지도 모드 (일반 / 위성)
  const [mapType, setMapType] = useState<'normal' | 'satellite'>('normal');

  // 지도 위 디바이스 분류별 갯수 집계
  const typeCounts = useMemo(() => {
    const counts = events.reduce((acc, evt) => {
      acc[evt.type] = (acc[evt.type] || 0) + 1;
      return acc;
    }, { CCTV: cctvs.length } as Record<string, number>);
    return counts;
  }, [events, cctvs]);

  // 이벤트 클릭 (좌측 리스트 또는 지도 위 마커)
  const handleEventClick = (event: EventData) => {
    setActiveSingleCCTV(null); // 단일 CCTV 모달 닫기
    
    // 1. 이벤트 중심 반경 4대 CCTV 찾기
    const cctvsWithDistance = cctvs.map(cctv => {
      const distance = calculateDistance(event.lat, event.lng, cctv.lat, cctv.lng);
      return { ...cctv, distance };
    });
    cctvsWithDistance.sort((a, b) => a.distance - b.distance);
    setNearbyCCTVs(cctvsWithDistance.slice(0, 4));
    
    // 2. 이벤트 활성화 및 지도 이동
    setActiveEvent(event);
    setMapCenter([event.lat, event.lng]);
  };

  // 지도 위 CCTV 마커 단일 클릭
  const handleCctvClick = (cctv: CCTVData) => {
    setActiveEvent(null); // 이벤트 모달 닫기
    
    // 단일 CCTV 활성화 및 지도 이동
    setActiveSingleCCTV(cctv);
    setMapCenter([cctv.lat, cctv.lng]);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. 배경 GIS 지도 */}
      <MapContainer 
        center={[37.1995, 126.8315]} 
        zoom={12} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <MapController center={mapCenter} />
        {mapType === 'normal' ? (
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
        ) : (
          <TileLayer
            attribution='Tiles &copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        
        {/* CCTV 30대 렌더링 (커스텀 아이콘) */}
        {cctvs.map(cctv => (
          <Marker 
            key={cctv.id} 
            position={[cctv.lat, cctv.lng]} 
            icon={cctvIcon}
            eventHandlers={{ click: () => handleCctvClick(cctv) }}
          >
            <Tooltip direction="top" offset={[0, -15]} opacity={0.9}>
              <div style={{ fontWeight: 600 }}>{cctv.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>클릭하여 영상 보기</div>
            </Tooltip>
          </Marker>
        ))}

        {/* 이벤트 100건 렌더링 (분류별 커스텀 아이콘) */}
        {events.map(evt => {
          const isActive = activeEvent?.id === evt.id;
          return (
            <Marker 
              key={evt.id} 
              position={[evt.lat, evt.lng]} 
              icon={getEventIcon(evt.type)}
              zIndexOffset={isActive ? 1000 : 0} // 클릭된 건 최상단 노출
              eventHandlers={{ click: () => handleEventClick(evt) }}
            >
              <Tooltip direction="right" offset={[15, 0]} opacity={0.9}>
                <div style={{ fontWeight: 'bold' }}>{evt.title}</div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* 현재 활성화된 이벤트가 있을 경우, 주변 탐색 반경(동심원) 표출 */}
        {activeEvent && (
          <Circle 
            center={[activeEvent.lat, activeEvent.lng]} 
            pathOptions={{ fillColor: '#ef4444', color: '#ef4444', weight: 1, dashArray: '4' }} 
            radius={2000} // 2km 반경
          />
        )}
      </MapContainer>


      {/* 2. 상단 헤더 패널 */}
      <div className="glass-panel" style={{
        position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 4rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/select')}
            title="시스템 선택 화면으로"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
          >
            <ArrowLeft size={24} />
          </button>
          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
          <ShieldCheck size={32} color="var(--primary-color)" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>
            화성시 통합 관제 시스템
          </h1>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            연동된 디바이스: {cctvs.length + events.length}대 (CCTV {cctvs.length}, IoT {events.length})
          </span>
        </div>
      </div>


      {/* 3. 좌측 이벤트 리스트 패널 */}
      <div className="glass-panel" style={{
        position: 'absolute', top: '6.5rem', left: '2rem', bottom: '2rem',
        width: '360px', padding: '1.5rem', zIndex: 1000, display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="#f43f5e" /> 실시간 알람 ({events.length}건)
          </h2>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }} className="scroll-container">
          {events.map(evt => (
            <div 
              key={evt.id} 
              className={`event-card ${evt.level} ${activeEvent?.id === evt.id ? 'active' : ''}`} 
              onClick={() => handleEventClick(evt)}
            >
              <div className="event-header">
                <span className="event-time">{evt.time}</span>
                {evt.level === 'critical' && <AlertTriangle size={16} color="#fca5a5" />}
              </div>
              <div className="event-title">{evt.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{evt.type}</span>
                <div className="event-cctv-badge">
                  <Video size={14} /> CCTV 보기
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* 4 & 5. 우측 정보 패널 그룹 (기상청 + 이벤트 상세) */}
      <div style={{
        position: 'absolute', top: '6.5rem', right: '2rem',
        display: 'flex', flexDirection: 'column', gap: '1.5rem',
        zIndex: 1000, width: '320px'
      }}>
        {/* 디바이스 분류별 갯수 패널 */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
            <MapPin size={18} /> 실시간 연동 현황
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {getTypeReactIcon(type)}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{type}</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 기상청 실시간 날씨 정보 패널 (크기 2/3로 축소) */}
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <h2 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CloudSun size={16} color="#60a5fa" /> 기상청 실시간 연계
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>24°</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.75rem' }}>경기 화성시 남양읍</div>
            </div>
            <CloudSun size={42} color="#60a5fa" opacity={0.8} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>강수확률</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#60a5fa' }}>10%</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>미세먼지</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#34d399' }}>좋음</div>
            </div>
          </div>
        </div>

        {/* 이벤트 상세 정보 패널 */}
        {activeEvent && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
              <Info size={20} /> 이벤트 상세 정보
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>발생 유형</div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{activeEvent.type} 경보</div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>상세 내용</div>
                <div style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 }}>{activeEvent.title}</div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Clock size={16} color="var(--text-secondary)" />
                <div style={{ fontSize: '0.95rem' }}>{activeEvent.time}</div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <MapPin size={16} color="var(--text-secondary)" />
                <div style={{ fontSize: '0.95rem' }}>GPS: {activeEvent.lat.toFixed(4)}, {activeEvent.lng.toFixed(4)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. 다중 CCTV 팝업 모달 (이벤트 클릭 시, 2x2 Grid) */}
      {activeEvent && (
        <div className="cctv-modal-overlay" style={{
          position: 'absolute', left: '50%', top: '55%', transform: 'translate(-50%, -50%)',
          width: '760px', height: '600px',
          zIndex: 2000, display: 'flex', flexDirection: 'column', gap: '1rem'
        }}>
          {/* 팝업 헤더 */}
          <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
            <button 
              onClick={() => setActiveEvent(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 }}
            >
              &times;
            </button>

            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={24} /> 반경 2km 내 인접 CCTV 송출
            </h2>
          </div>
          
          <div className="glass-panel" style={{ 
            flex: 1, padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '1rem' 
          }}>
            {nearbyCCTVs.map((cctv: any, index: number) => (
              <div key={cctv.id} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>CH{index + 1} - {cctv.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#34d399' }}>{cctv.distance}m</span>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <CctvPlayer streamName={cctv.streamName} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. 단일 CCTV 팝업 모달 (지도 카메라 아이콘 클릭 시, 1x1 화면) */}
      {activeSingleCCTV && (
        <div className="cctv-modal-overlay" style={{
          position: 'absolute', left: '50%', top: '55%', transform: 'translate(-50%, -50%)',
          width: '760px', height: '520px',
          zIndex: 2000, display: 'flex', flexDirection: 'column', gap: '1rem'
        }}>
          {/* 팝업 헤더 */}
          <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
            <button 
              onClick={() => setActiveSingleCCTV(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 }}
            >
              &times;
            </button>

            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              <Cctv size={24} /> {activeSingleCCTV.name} 실시간 관제
            </h2>
          </div>
          
          {/* 1x1 단일 CCTV 화면 영역 */}
          <div className="glass-panel" style={{ 
            flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}>
              <CctvPlayer streamName={activeSingleCCTV.streamName} />
            </div>
          </div>
        </div>
      )}

      {/* 8. 지도 모드 전환 버튼 (우측 패널 바로 왼쪽) */}
      <div className="glass-panel" style={{
        position: 'absolute', top: '6.5rem', right: 'calc(2rem + 320px + 1rem)',
        zIndex: 1000, padding: '0.5rem', display: 'flex', gap: '0.5rem',
        borderRadius: '12px'
      }}>
        <button
          onClick={() => setMapType('normal')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
            background: mapType === 'normal' ? 'var(--primary-color)' : 'transparent',
            color: mapType === 'normal' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.9rem'
          }}
        >
          <Map size={16} /> 일반 지도
        </button>
        <button
          onClick={() => setMapType('satellite')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
            background: mapType === 'satellite' ? '#10b981' : 'transparent',
            color: mapType === 'satellite' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.9rem'
          }}
        >
          <Globe size={16} /> 위성 지도
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
