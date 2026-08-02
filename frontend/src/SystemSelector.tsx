// frontend/src/SystemSelector.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Building2, Settings, BarChart3, LogOut, ShieldCheck } from 'lucide-react';

interface SystemSelectorProps {
  onLogout: () => void;
}

const SystemSelector: React.FC<SystemSelectorProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100vw', minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* 상단 헤더 로고 & 로그아웃 버튼 */}
      <div style={{ position: 'absolute', top: '2rem', width: '100%', padding: '0 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={36} color="var(--primary-color)" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>
            통합 플랫폼 포털
          </h1>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} style={{ marginRight: '0.5rem' }} /> 로그아웃
        </button>
      </div>

      {/* 중앙 안내 문구 */}
      <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>환영합니다, 관리자님!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>접속하실 시스템을 선택해 주세요.</p>
      </div>

      {/* 4개의 시스템 선택 카드 (CSS Grid 활용) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '2rem',
        maxWidth: '900px',
        width: '100%'
      }}>
        
        {/* 1. 관제 시스템 */}
        <div 
          className="system-card"
          onClick={() => navigate('/dashboard')}
        >
          <div className="icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
            <Map size={48} />
          </div>
          <h3>스마트 관제 시스템</h3>
          <p>GIS 기반 실시간 시설물 모니터링 및 영상 관제 (WebRTC)</p>
        </div>

        {/* 2. 시설관리시스템 (FMS) */}
        <div 
          className="system-card"
          onClick={() => navigate('/fms')}
        >
          <div className="icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
            <Building2 size={48} />
          </div>
          <h3>시설관리시스템 (FMS)</h3>
          <p>건축물, 설비, 자산 현황 조회 및 점검 이력 통합 관리</p>
        </div>

        {/* 3. 데이터 통계 */}
        <div 
          className="system-card"
          onClick={() => navigate('/statistics')}
        >
          <div className="icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
            <BarChart3 size={48} />
          </div>
          <h3>데이터 통계</h3>
          <p>기간별 이벤트 발생 빈도, 장애 통계 및 분석 리포트</p>
        </div>

        {/* 4. 관리자 설정 */}
        <div 
          className="system-card"
          onClick={() => navigate('/admin')}
        >
          <div className="icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc' }}>
            <Settings size={48} />
          </div>
          <h3>관리자 설정</h3>
          <p>시스템 환경 설정, 사용자 권한 부여 및 로그 감사 내역</p>
        </div>

      </div>
    </div>
  );
};

export default SystemSelector;
