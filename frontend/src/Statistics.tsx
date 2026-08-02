// frontend/src/Statistics.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Activity, PieChart as PieChartIcon, TrendingUp, Cctv, CloudRain, Waves, Megaphone, OctagonAlert, AlertTriangle, MapPin, User, CheckCircle2, ServerCrash, Wrench } from 'lucide-react';
import { getSharedFacilities, getSharedEvents, type FacilityData } from './mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

// UI 렌더링용 아이콘 헬퍼
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

const Statistics: React.FC = () => {
  const navigate = useNavigate();
  const facilities = useMemo(() => getSharedFacilities(), []);
  const events = useMemo(() => getSharedEvents(), []);

  // 상태 관리 (풀다운 메뉴 및 개별 장비 선택)
  const [openDropdownType, setOpenDropdownType] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<FacilityData | null>(null);

  // 분류별 통계 계산
  const typeCounts = useMemo(() => {
    return facilities.reduce((acc, fac) => {
      acc[fac.type] = (acc[fac.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [facilities]);

  // 1. 도넛 차트 데이터 (시설물 상태 비율)
  const statusData = useMemo(() => {
    const normal = facilities.filter(f => f.status === '정상').length;
    const maintenance = facilities.filter(f => f.status === '점검중').length;
    const error = facilities.filter(f => f.status === '장애').length;
    return [
      { name: '정상 가동', value: normal, color: '#34d399' },
      { name: '점검 진행중', value: maintenance, color: '#fb923c' },
      { name: '장애 발생', value: error, color: '#f87171' }
    ];
  }, [facilities]);

  // 2. 바 차트 데이터 (이벤트 분류별 건수)
  const eventTypeData = useMemo(() => {
    const counts = events.reduce((acc, evt) => {
      acc[evt.type] = (acc[evt.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const colors: Record<string, string> = {
      '수위계': '#60a5fa',
      '강우량계': '#38bdf8',
      '적설계': '#e2e8f0',
      '지하차도 차단기': '#f87171',
      '마을방송': '#fb923c',
    };

    return Object.entries(counts).map(([name, value]) => ({ 
      name, 
      '발생 건수': value, 
      fill: colors[name] || '#818cf8' 
    }));
  }, [events]);

  // 3. 라인 차트 데이터 (시간대별 이벤트 발생 흐름)
  const timeData = useMemo(() => {
    const hourlyCounts = Array(24).fill(0);
    events.forEach(evt => {
      const hour = parseInt(evt.time.split(':')[0], 10);
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        hourlyCounts[hour]++;
      }
    });
    return hourlyCounts.map((count, index) => ({
      time: `${String(index).padStart(2, '0')}시`,
      '알람 수': count
    }));
  }, [events]);

  // 개별 시설물 용 24시간 가상 센서 데이터 생성 (센서형 장비 전용)
  const isSensor = ['수위계', '강우량계', '적설계'].includes(selectedFacility?.type || '');
  
  const individualSensorData = useMemo(() => {
    if (!selectedFacility || !isSensor) return [];
    const data = [];
    let baseValue = selectedFacility.type === '강우량계' ? 0 : (selectedFacility.type === '수위계' ? 2.5 : 100);
    for (let i = 0; i < 24; i++) {
      let change = (Math.random() - 0.5) * (selectedFacility.type === '수위계' ? 0.5 : 10);
      if (selectedFacility.type === '강우량계') change = Math.max(0, change);
      baseValue = Math.max(0, baseValue + change);
      data.push({
        time: `${String(i).padStart(2, '0')}:00`,
        '측정값': parseFloat(baseValue.toFixed(1))
      });
    }
    return data;
  }, [selectedFacility, isSensor]);

  // 가상 장애 이력 데이터 생성 (비센서형 장비 전용)
  const mockFaultHistory = useMemo(() => {
    if (!selectedFacility || isSensor) return [];
    return [
      { date: '2026-07-28 14:30', description: '통신 모듈 단절 (네트워크 오류)', status: '복구 완료' },
      { date: '2026-06-15 09:12', description: '메인 전원 공급 장치 이상 징후', status: '복구 완료' },
      { date: '2026-03-02 22:45', description: '정기 점검 중 케이블 노후화 발견', status: '조치 완료' },
      { date: '2025-11-10 11:00', description: '소프트웨어 업데이트 중 일시적 오류', status: '조치 완료' },
    ];
  }, [selectedFacility, isSensor]);

  const totalEvents = events.length;
  const mostFrequentType = [...eventTypeData].sort((a, b) => b['발생 건수'] - a['발생 건수'])[0]?.name || '-';
  const normalRatio = ((statusData[0].value / facilities.length) * 100).toFixed(1);
  const CustomTooltipStyle = { backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff' };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
      
      {/* 1. 상단 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={() => navigate('/select')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1rem', cursor: 'pointer' }}
        >
          <ArrowLeft size={24} /> 
        </button>
        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>
        <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart3 size={28} color="var(--primary-color)" />
          통계 분석 시스템 (Statistics)
        </h1>
      </div>

      {/* 2. 요약 위젯 3개 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(244, 63, 94, 0.2)', padding: '1.25rem', borderRadius: '16px' }}>
            <Activity size={36} color="#f43f5e" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>오늘 발생한 총 알람 건수</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{totalEvents}<span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '0.5rem' }}>건</span></div>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(96, 165, 250, 0.2)', padding: '1.25rem', borderRadius: '16px' }}>
            <TrendingUp size={36} color="#60a5fa" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>최다 발생 재난 유형</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, color: '#60a5fa' }}>{mostFrequentType}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(52, 211, 153, 0.2)', padding: '1.25rem', borderRadius: '16px' }}>
            <PieChartIcon size={36} color="#34d399" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>전체 시설물 정상 가동률</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, color: '#34d399' }}>{normalRatio}%</div>
          </div>
        </div>
      </div>

      {/* 3. 분류별 현황 뱃지 및 드롭다운 (Drill-down 기능) */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative', zIndex: 50 }}>
        <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>분류별 현황</span>
        <div style={{ width: '1px', height: '16px', background: 'var(--glass-border)' }}></div>
        <div style={{ display: 'flex', gap: '1.5rem', flex: 1, flexWrap: 'wrap' }}>
          {['수위계', '강우량계', '적설계', '지하차도 차단기', 'CCTV', '마을방송'].map(type => {
            const count = typeCounts[type] || 0;
            const isOpen = openDropdownType === type;
            const targetFacilities = facilities.filter(f => f.type === type);
            
            return (
              <div key={type} style={{ position: 'relative' }}>
                <div 
                  onClick={() => setOpenDropdownType(isOpen ? null : type)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.4rem', 
                    background: isOpen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)', 
                    border: isOpen ? '1px solid var(--primary-color)' : '1px solid transparent',
                    padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                >
                  {getTypeReactIcon(type)}
                  <span style={{ fontSize: '0.9rem', color: isOpen ? '#fff' : 'var(--text-secondary)', fontWeight: isOpen ? 600 : 400 }}>{type}</span>
                  <span style={{ background: isOpen ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                    {count}
                  </span>
                </div>

                {/* 풀다운 메뉴 */}
                {isOpen && (
                  <div style={{
                    position: 'absolute', top: '120%', left: 0, width: '300px',
                    background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)',
                    border: '1px solid var(--glass-border)', borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 9999, maxHeight: '350px', overflowY: 'auto'
                  }} className="scroll-container">
                    {targetFacilities.length > 0 ? targetFacilities.map(fac => (
                      <div 
                        key={fac.id} 
                        onClick={() => { setSelectedFacility(fac); setOpenDropdownType(null); }}
                        style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{fac.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{fac.address.substring(0, 15)}...</span>
                          <span style={{ color: fac.status === '정상' ? '#34d399' : '#f87171' }}>{fac.status}</span>
                        </div>
                      </div>
                    )) : (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>데이터 없음</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 차트 영역 (전체 통계 모드 vs 개별 장비 모드) */}
      {!selectedFacility ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1, minHeight: '400px' }}>
          {/* 전체 라인 차트 */}
          <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#818cf8" /> 시간대별 전체 알람 발생 추이
            </h2>
            <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Line type="monotone" dataKey="알람 수" stroke="#818cf8" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 바 차트 */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="#60a5fa" /> 재난 유형별 알람 발생 건수
            </h2>
            <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventTypeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={14} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="발생 건수" radius={[6, 6, 0, 0]}>
                    {eventTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 파이 차트 */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChartIcon size={20} color="#34d399" /> 전체 시설물 가동 상태 현황
            </h2>
            <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={80} outerRadius={130} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* 개별 장비 모드 (Drill-down View) */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flex: 1 }}>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <button onClick={() => setSelectedFacility(null)} style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} /> 전체 통계로 돌아가기
            </button>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: '1rem 0', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getTypeReactIcon(selectedFacility.type)}
                {selectedFacility.name}
              </h2>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}><MapPin size={16} style={{ display: 'inline', marginRight: '4px' }}/> 주소</span>
                  <span style={{ fontWeight: 500 }}>{selectedFacility.address}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}><User size={16} style={{ display: 'inline', marginRight: '4px' }}/> 담당자</span>
                  <span style={{ fontWeight: 500 }}>{selectedFacility.manager}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}><CheckCircle2 size={16} style={{ display: 'inline', marginRight: '4px' }}/> 최근 점검일</span>
                  <span style={{ fontWeight: 500 }}>{selectedFacility.lastInspected}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>현재 상태</span>
                  <span style={{ 
                    fontWeight: 700, 
                    color: selectedFacility.status === '정상' ? '#34d399' : (selectedFacility.status === '점검중' ? '#fb923c' : '#f87171') 
                  }}>
                    {selectedFacility.status === '정상' && <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />}
                    {selectedFacility.status === '점검중' && <Wrench size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />}
                    {selectedFacility.status === '장애' && <ServerCrash size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />}
                    {selectedFacility.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            {isSensor ? (
              <>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={20} color="#34d399" /> 24시간 센서 변화 추이 ({selectedFacility.type})
                </h2>
                <div style={{ flex: 1, width: '100%', minHeight: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={individualSensorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} />
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <Tooltip contentStyle={CustomTooltipStyle} />
                      <Area type="monotone" dataKey="측정값" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}>
                  <ServerCrash size={20} color="#f87171" /> 최근 장애 및 조치 이력 ({selectedFacility.type})
                </h2>
                <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-container">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {mockFaultHistory.map((hist, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #f87171', transition: 'all 0.2s', cursor: 'default' }}
                           onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'}
                           onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Activity size={14} /> {hist.date}
                          </span>
                          <span style={{ fontSize: '0.8rem', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>{hist.status}</span>
                        </div>
                        <div style={{ fontWeight: 500, color: '#fff', fontSize: '1rem', marginTop: '0.5rem' }}>{hist.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Statistics;
