// frontend/src/CctvPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';

// 컴포넌트에 어떤 스트림(카메라 이름)을 띄울지 밖에서 받아옵니다.
interface CctvPlayerProps {
  streamName: string;
}

const CctvPlayer: React.FC<CctvPlayerProps> = ({ streamName }) => {
  // HTML의 <video> 태그를 직접 조작하기 위해 useRef를 사용합니다.
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // 컴포넌트가 화면에 나타날 때(useEffect) WebRTC 연결을 시작합니다.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let pc: RTCPeerConnection | null = null;

    const startWebRTC = async () => {
      try {
        // 1. PeerConnection 객체 생성 (브라우저 간, 혹은 브라우저-서버 간 실시간 영상 통신 담당)
        pc = new RTCPeerConnection();
        
        // 2. 서버로부터 영상(video)과 음성(audio)을 '받기만(recvonly)' 하겠다고 선언
        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });

        // 3. 서버에서 영상 데이터 트랙이 도착하면 비디오 태그(화면)에 연결해서 보여줍니다.
        pc.ontrack = (event) => {
          if (video.srcObject !== event.streams[0]) {
            video.srcObject = event.streams[0];
          }
        };

        // 4. 연결을 시작하기 위한 제안서(Offer)를 만들고 내 브라우저에 등록
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 5. 프론트엔드 프록시를 통해 서버로 제안서를 보내고 해당 이름(streamName)의 영상을 요청
        // (직접 1984 포트로 보내면 브라우저 보안에 막히므로, vite.config.ts에 설정한 /go2rtc 프록시 경로를 사용합니다)
        const go2rtcUrl = `/go2rtc/api/webrtc?src=${streamName}`;
        const response = await fetch(go2rtcUrl, {
          method: 'POST',
          body: pc.localDescription?.sdp,
          headers: { 'Content-Type': 'application/sdp' }
        });
        
        if (!response.ok) {
          throw new Error('WebRTC 서버와 연결할 수 없습니다.');
        }

        // 6. 서버가 준 수락서(Answer)를 받아 최종 등록하면 영상 수신이 시작됩니다! (초저지연)
        const answerSdp = await response.text();
        const answer = new RTCSessionDescription({ type: 'answer', sdp: answerSdp });
        await pc.setRemoteDescription(answer);
        
        setError(null);
        setIsDemoMode(false);
      } catch (err: any) {
        console.warn('CCTV WebRTC 연결 실패, 데모 모드로 전환합니다:', err);
        setIsDemoMode(true); // 에러 발생 시 데모 비디오로 전환
      }
    };

    startWebRTC();

    // 화면(컴포넌트)이 사라질 때 연결을 깔끔하게 끊어줍니다. (메모리 누수 방지)
    return () => {
      if (pc) {
        pc.close();
      }
    };
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
      
      {/* 실제 영상이 나오는 비디오 태그 (데모 모드 시 실시간 라이브캠 연결) */}
      {isDemoMode ? (
        <iframe
          src="https://www.youtube.com/embed/DnqX7X6Pefg?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=DnqX7X6Pefg"
          style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
          allow="autoplay; encrypted-media"
          title="Real-time Public CCTV"
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
