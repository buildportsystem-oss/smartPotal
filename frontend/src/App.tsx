// frontend/src/App.tsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css'; 

import Login from './Login';
import SystemSelector from './SystemSelector';
import Dashboard from './Dashboard';
import AdminSettings from './AdminSettings';
import Statistics from './Statistics';
import Fms from './Fms';

function App() {
  // 로컬 스토리지에 토큰이 있으면 로그인된 것으로 간주합니다.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('accessToken'));

  // 로그아웃 시 실행되는 함수
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 접속 주소: 로그인 안 했으면 Login창, 했으면 select창으로 리다이렉트 */}
        <Route 
          path="/" 
          element={isLoggedIn ? <Navigate to="/select" replace /> : <Login onLoginSuccess={() => setIsLoggedIn(true)} />} 
        />
        
        {/* 시스템 선택 포털 화면 */}
        <Route 
          path="/select" 
          element={isLoggedIn ? <SystemSelector onLogout={handleLogout} /> : <Navigate to="/" replace />} 
        />
        
        {/* 시스템 1. 관제 대시보드 */}
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/" replace />} 
        />

        {/* 시스템 2. 시설관리시스템 (FMS) */}
        <Route 
          path="/fms" 
          element={isLoggedIn ? <Fms /> : <Navigate to="/" replace />} 
        />
        
        {/* 시스템 3. 데이터 통계 */}
        <Route 
          path="/statistics" 
          element={isLoggedIn ? <Statistics /> : <Navigate to="/" replace />} 
        />
        
        {/* 시스템 4. 관리자 설정 */}
        <Route 
          path="/admin" 
          element={isLoggedIn ? <AdminSettings /> : <Navigate to="/" replace />} 
        />

        {/* 없는 주소로 들어올 경우 안전하게 메인으로 보냅니다 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
