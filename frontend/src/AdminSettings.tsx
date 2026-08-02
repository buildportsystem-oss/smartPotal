// frontend/src/AdminSettings.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Settings, Users, ShieldAlert, Sliders, Bell, History, 
  CheckCircle2, XCircle, Search, Plus, Save
} from 'lucide-react';

// === 가상 데이터 모음 ===
const MOCK_USERS = [
  { id: 'admin_sys', name: '시스템 총괄', role: '최고 관리자', lastLogin: '2026-08-02 14:32:10', status: '활성' },
  { id: 'op_user1', name: '관제 요원 1', role: '일반 요원', lastLogin: '2026-08-02 09:10:05', status: '활성' },
  { id: 'op_user2', name: '관제 요원 2', role: '일반 요원', lastLogin: '2026-07-30 18:45:22', status: '활성' },
  { id: 'op_user3', name: '관제 요원 3', role: '일반 요원', lastLogin: '2026-05-12 11:20:00', status: '휴면' },
];

const MOCK_LOGS = [
  { id: 1, time: '2026-08-02 15:42', user: 'admin_sys', action: '강우량계 경보 임계치를 50mm에서 45mm로 하향 조정함', type: '설정 변경' },
  { id: 2, time: '2026-08-02 14:32', user: 'admin_sys', action: '시스템 총괄 관리자 로그인 성공', type: '접속' },
  { id: 3, time: '2026-08-01 10:15', user: 'op_user1', action: '수위계 #4 장애 조치 완료 상태로 변경', type: '데이터 조작' },
  { id: 4, time: '2026-07-31 09:00', user: 'SYSTEM', action: '주간 정기 데이터 백업 완료', type: '시스템' },
  { id: 5, time: '2026-07-30 18:45', user: 'op_user2', action: '관제 요원 2 로그아웃', type: '접속' },
];

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'config' | 'logs'>('users');

  // 토글 스위치 컴포넌트
  const ToggleSwitch = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <div 
      onClick={onClick}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', background: active ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
        position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
        position: 'absolute', top: '2px', left: active ? '22px' : '2px', transition: 'all 0.3s ease',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }} />
    </div>
  );

  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', backgroundColor: '#0f172a' }}>
      
      {/* 좌측 사이드바 네비게이션 */}
      <div style={{ width: '280px', background: 'rgba(15, 23, 42, 0.95)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => navigate('/select')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} /> 포털로 돌아가기
          </button>
          <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <Settings size={24} color="#c084fc" />
            관리자 설정
          </h1>
        </div>

        <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('users')}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
              background: activeTab === 'users' ? 'rgba(192, 132, 252, 0.15)' : 'transparent',
              color: activeTab === 'users' ? '#c084fc' : 'var(--text-secondary)',
              border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: activeTab === 'users' ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
            }}
          >
            <Users size={20} /> 사용자 관리
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
              background: activeTab === 'config' ? 'rgba(192, 132, 252, 0.15)' : 'transparent',
              color: activeTab === 'config' ? '#c084fc' : 'var(--text-secondary)',
              border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: activeTab === 'config' ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
            }}
          >
            <Sliders size={20} /> 시스템 환경 설정
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
              background: activeTab === 'logs' ? 'rgba(192, 132, 252, 0.15)' : 'transparent',
              color: activeTab === 'logs' ? '#c084fc' : 'var(--text-secondary)',
              border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: activeTab === 'logs' ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
            }}
          >
            <History size={20} /> 보안 및 감사 로그
          </button>
        </div>
        
        <div style={{ padding: '2rem', borderTop: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>
          Platform Build v1.0.0<br/>ⓒ 2026 B2G System
        </div>
      </div>

      {/* 우측 메인 컨텐츠 영역 */}
      <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        
        {/* === 1. 사용자 관리 === */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#fff' }}>시스템 사용자 관리</h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>관제 시스템에 접근할 수 있는 요원 및 관리자 계정을 관리합니다.</p>
              </div>
              <button style={{ background: '#c084fc', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Plus size={18} /> 신규 계정 발급
              </button>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                  <input type="text" placeholder="이름 또는 ID 검색..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff' }} />
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>ID</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>이름</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>권한 그룹</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>마지막 접속일시</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>상태</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_USERS.map((u, i) => (
                    <tr key={u.id} style={{ borderTop: '1px solid var(--glass-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{u.id}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>{u.name}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ 
                          background: u.role === '최고 관리자' ? 'rgba(192, 132, 252, 0.2)' : 'rgba(255,255,255,0.1)',
                          color: u.role === '최고 관리자' ? '#c084fc' : 'var(--text-secondary)',
                          padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem'
                        }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{u.lastLogin}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        {u.status === '활성' 
                          ? <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}><CheckCircle2 size={16}/>활성</span>
                          : <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}><XCircle size={16}/>휴면</span>
                        }
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>수정</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === 2. 시스템 환경 설정 === */}
        {activeTab === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#fff' }}>시스템 환경 설정</h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>알림 규칙 및 센서 임계치 등 전역 환경을 설정합니다.</p>
              </div>
              <button style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Save size={18} /> 설정 저장하기
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
                  <ShieldAlert size={20} /> 재난 센서 경보 임계치 설정
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>강우량 경보 발송 기준 (mm/시간)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="number" defaultValue={50} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: '#fff', fontSize: '1.1rem' }} />
                      <span>mm</span>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>적설량 경보 발송 기준 (cm)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="number" defaultValue={10} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: '#fff', fontSize: '1.1rem' }} />
                      <span>cm</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>

              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
                  <Bell size={20} /> 비상 알림 발송 설정
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>긴급 재난 시 전체 SMS 자동 발송</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>'Critical' 등급 알람 발생 시 등록된 관리자 전원에게 SMS 전송</div>
                    </div>
                    <ToggleSwitch active={true} onClick={() => {}} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>지하차도 자동차단기 작동 시 유관기관 공유</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>차단기가 내려갈 시 경찰/소방 시스템과 데이터 연동</div>
                    </div>
                    <ToggleSwitch active={true} onClick={() => {}} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>야간 모드 자동 적용 (22:00 ~ 06:00)</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>야간 시간대에는 알람 발생 시 사이렌 소리 활성화</div>
                    </div>
                    <ToggleSwitch active={false} onClick={() => {}} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === 3. 감사 로그 === */}
        {activeTab === 'logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#fff' }}>보안 및 감사 로그</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>사용자 로그인 이력 및 주요 데이터 변경 내역을 추적합니다.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {MOCK_LOGS.map(log => (
                  <div key={log.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '4px solid #c084fc' }}>
                    <div style={{ width: '150px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{log.time.split(' ')[0]}</span>
                      <span>{log.time.split(' ')[1]}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>{log.user}</span>
                        <span style={{ 
                          background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', 
                          padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' 
                        }}>{log.type}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>{log.action}</div>
                    </div>
                  </div>
                ))}
                
                <button style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px dashed var(--glass-border)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}>
                  더 많은 기록 불러오기 (최근 30일)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminSettings;
