// frontend/src/CctvPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';

// 컴포넌트에 어떤 스트림(카메라 이름)을 띄울지 밖에서 받아옵니다.
interface CctvPlayerProps {
  streamName: string;
}

const CctvPlayer: React.FC<CctvPlayerProps> = ({ streamName }) => {
  // HTML의 <video> 태그를 직접 조작하기 위해 useRef를 사용합니다.
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error] = useState<string | null>(null);
  const [isDemoMode] = useState<boolean>(true); // 항상 데모 모드(공개 CCTV)로 시작

  // 컴포넌트가 화면에 나타날 때(useEffect) WebRTC 연결을 시작합니다.
  useEffect(() => {
    // 로컬 go2rtc 서버가 켜져 있을 경우 연결은 성공하지만 카메라가 꺼져있어 칼라바를 송출하는 문제가 있습니다.
    // 사용자 요청에 따라 무조건 '공개 실시간 CCTV(유튜브)'를 띄우기 위해 WebRTC 연결을 건너뜁니다.
    /*
    const video = videoRef.current;
    if (!video) return;
    let pc: RTCPeerConnection | null = null;
    ... 
    */
  }, [streamName]);

  return (
    <div style={{
      width: '100%', 
      height: '100%', 
      backgroundColor: '#000', 
      borderRadius: '12px', 
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.2)',
      position: 'relative'
    }}>
      {/* 에러 발생 시 붉은색 메시지를 화면 한가운데에 띄워줍니다 (이제 데모 모드가 켜지므로 잘 안 뜸) */}
      {error && !isDemoMode && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          color: '#fca5a5', fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}
      
      {/* 실제 영상이 나오는 비디오 태그 (유튜브 차단 방지 및 가장 안정적인 고정 교통 영상 MP4) */}
      {isDemoMode ? (
        <video
          src="/cctv.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          controls
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* 데모 모드 알림 뱃지 */}
      {isDemoMode && (
        <div style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          background: 'rgba(59, 130, 246, 0.8)', color: 'white',
          padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
          fontWeight: 'bold', zIndex: 10
        }}>
          🔴 LIVE (공개 라이브캠)
        </div>
      )}
    </div>
  );
};

export default CctvPlayer;
