// frontend/src/Login.tsx
import React, { useState } from 'react';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/api/v1/auth/login`, {
        loginId,
        password,
        captchaToken,
      });

      const token = response.data.accessToken;
      localStorage.setItem('accessToken', token);

      setSuccess('로그인에 성공했습니다! 🎉');
      
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
      
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('서버와 연결할 수 없습니다. 백엔드 서버가 켜져 있는지 확인해 주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>FMS System</h1>
        <p>관리자 계정으로 로그인해 주세요</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="loginId">로그인 아이디</label>
          <input
            type="text"
            id="loginId"
            className="form-control"
            placeholder="admin"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
            onChange={(token) => setCaptchaToken(token)}
            theme="dark"
          />
        </div>

        <button 
          type="submit" 
          className="login-btn" 
          disabled={isLoading || !loginId || !password || !captchaToken} 
        >
          {isLoading ? '로그인 중...' : '로그인 (Login)'}
        </button>
      </form>
    </div>
  );
};

export default Login;
