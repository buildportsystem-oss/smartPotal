// frontend/src/Fms.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ServerCrash, Wrench, CheckCircle2, LayoutGrid, X, Cctv, CloudRain, Waves, Megaphone, OctagonAlert, AlertTriangle } from 'lucide-react';
import { getSharedFacilities, type FacilityData } from './mockData';

// UI 컴포넌트 렌더링용 아이콘 헬퍼 (관제 화면 마커와 동일)
const getTypeReactIcon = (type: string) => {
  switch (type) {
    case 'CCTV': return <Cctv size={16} color="#94a3b8" />;
    case '강우량계': return <CloudRain size={16} color="#38bdf8" />;
    case '수위계': return <Waves size={16} color="#60a5fa" />;
    case '마을방송': return <Megaphone size={16} color="#fb923c" />;
    case '지하차도 차단기': return <OctagonAlert size={16} color="#f87171" />;
    case '적설계': return <CloudRain size={16} color="#e2e8f0" />; // 적설계용 하얀색 아이콘
    default: return <AlertTriangle size={16} color="#f87171" />;
  }
};

const Fms: React.FC = () => {
  const navigate = useNavigate();

  // 관제 시스템과 100% 동일한 300대 장비 데이터를 연동하여 FMS 리스트로 가져옴
  const facilities = useMemo(() => getSharedFacilities(), []);

  // 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null); // 필터링 상태 추가

  // 요약 통계 계산
  const total = facilities.length;
  const normalCount = facilities.filter(f => f.status === '정상').length;
  const maintenanceCount = facilities.filter(f => f.status === '점검중').length;
  const errorCount = facilities.filter(f => f.status === '장애').length;

  // 분류별 통계 계산
  const typeCounts = facilities.reduce((acc, fac) => {
    acc[fac.type] = (acc[fac.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 상태 배지 컴포넌트
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = 'rgba(52, 211, 153, 0.2)'; // 초록
    let color = '#34d399';
    if (status === '점검중') {
      bgColor = 'rgba(251, 146, 60, 0.2)'; // 주황
      color = '#fb923c';
    } else if (status === '장애') {
      bgColor = 'rgba(248, 113, 113, 0.2)'; // 빨강
      color = '#f87171';
    }
    
    return (
      <span style={{
        background: bgColor, color: color,
        padding: '0.25rem 0.75rem', borderRadius: '9999px',
        fontSize: '0.85rem', fontWeight: 600, border: `1px solid ${color}40`
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. 상단 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/select')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1rem', cursor: 'pointer' }}
          >
            <ArrowLeft size={24} /> 
          </button>
          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LayoutGrid size={28} color="var(--primary-color)" />
            시설관리시스템 (FMS)
          </h1>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--primary-color)', color: '#fff', border: 'none',
            padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          <Plus size={20} /> 새 시설 등록
        </button>
      </div>

      {/* 2. 요약 통계 위젯 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '12px' }}>
            <LayoutGrid size={32} color="#60a5fa" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>전체 시설 수</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{total}</div>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(52, 211, 153, 0.2)', padding: '1rem', borderRadius: '12px' }}>
            <CheckCircle2 size={32} color="#34d399" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>정상 가동</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399' }}>{normalCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(251, 146, 60, 0.2)', padding: '1rem', borderRadius: '12px' }}>
            <Wrench size={32} color="#fb923c" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>점검 중</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fb923c' }}>{maintenanceCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(248, 113, 113, 0.2)', padding: '1rem', borderRadius: '12px' }}>
            <ServerCrash size={32} color="#f87171" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>장애 발생</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f87171' }}>{errorCount}</div>
          </div>
        </div>
      </div>

      {/* 2.5 분류별 통계 바 */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>분류별 현황</span>
        <div style={{ width: '1px', height: '16px', background: 'var(--glass-border)' }}></div>
        <div style={{ display: 'flex', gap: '1.5rem', flex: 1, flexWrap: 'wrap' }}>
          {['전체', '수위계', '강우량계', '적설계', '지하차도 차단기', 'CCTV', '마을방송'].map(type => {
            const isSelected = filterType === type || (type === '전체' && filterType === null);
            const count = type === '전체' ? total : (typeCounts[type] || 0);
            
            return (
              <div 
                key={type} 
                onClick={() => setFilterType(type === '전체' ? null : type)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.4rem', 
                  background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)', 
                  border: isSelected ? '1px solid var(--primary-color)' : '1px solid transparent',
                  padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' 
                }}
              >
                {type !== '전체' && getTypeReactIcon(type)}
                <span style={{ fontSize: '0.9rem', color: isSelected ? '#fff' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>{type}</span>
                <span style={{ background: isSelected ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 데이터 그리드 (테이블) */}
      <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>시설물 자산 리스트</h2>
        
        <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 10 }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>시설 ID</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>시설명</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>분류</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>주소</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>최근 점검일</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>담당자</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {facilities
                .filter(fac => filterType === null || fac.type === filterType)
                .map((fac, idx) => (
                <tr key={fac.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding: '1rem' }}>{fac.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{fac.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {getTypeReactIcon(fac.type)}
                      {fac.type}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{fac.address}</td>
                  <td style={{ padding: '1rem' }}>{fac.lastInspected}</td>
                  <td style={{ padding: '1rem' }}>{fac.manager}</td>
                  <td style={{ padding: '1rem' }}>
                    <StatusBadge status={fac.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 새 시설 등록 모달 (팝업) */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="glass-panel" style={{ width: '500px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={24} color="var(--primary-color)" /> 새 시설물 등록
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              새로운 시설물의 정보 및 점검 일정을 등록합니다. (추후 DB 연동 시 활성화)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>시설명</label>
                <input type="text" placeholder="예: 남양읍 지하차도 차단기 #2" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>분류</label>
                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                  <option>수위계</option>
                  <option>강우량계</option>
                  <option>적설계</option>
                  <option>지하차도 차단기</option>
                  <option>CCTV</option>
                  <option>마을방송</option>
                </select>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ width: '100%', padding: '1rem', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  등록하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Fms;
