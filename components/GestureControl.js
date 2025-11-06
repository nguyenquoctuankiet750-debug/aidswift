'use client';
import { useEffect, useRef, useState } from 'react';
import * as vision from '@mediapipe/tasks-vision';
import { supabase } from '../utils/supabaseClient';

export default function GestureControl() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [alertActive, setAlertActive] = useState(false);
  const [safeActive, setSafeActive] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [statusMsg, setStatusMsg] = useState('✋ Giơ 2 tay để gửi SOS hoặc 👍 để báo an toàn...');

  useEffect(() => {
    let visionTask, animationId;
    let sosSent = false;
    let timeoutSOS, cooldownTimeout;

    async function logToSupabase(message, status, lat = null, lon = null) {
      const { error } = await supabase.from('sos_signals').insert([
        {
          message,
          status,
          latitude: lat,
          longitude: lon,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) console.error('❌ Lỗi ghi Supabase:', error.message);
    }

    async function getLocation() {
      return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve({ lat: null, lon: null });
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => resolve({ lat: null, lon: null })
        );
      });
    }

    async function sendSOS() {
      if (alertActive || cooldown || sosSent) return;
      sosSent = true;
      setAlertActive(true);
      setSafeActive(false);
      setStatusMsg('🚨 Đang phát tín hiệu SOS...');
      const { lat, lon } = await getLocation();
      await logToSupabase('SOS detected via camera', 'active', lat, lon);

      timeoutSOS = setTimeout(() => {
        stopSOS(true);
      }, 10000);
    }

    async function stopSOS(auto = false) {
      setAlertActive(false);
      setSafeActive(false);
      sosSent = false;
      const { lat, lon } = await getLocation();

      if (auto) {
        console.log('⏱ SOS tự kết thúc sau 10 giây');
        await logToSupabase('SOS auto ended after 10s', 'ended', lat, lon);
      } else {
        console.log('✅ Người dùng báo an toàn');
        setSafeActive(true);
        await logToSupabase('User marked safe (thumbs up)', 'safe', lat, lon);
      }

      setStatusMsg(auto ? '🕒 Cooldown 5s chống spam SOS...' : '✅ Đã báo an toàn!');
      setCooldown(true);
      cooldownTimeout = setTimeout(() => {
        setCooldown(false);
        setStatusMsg('✋ Giơ 2 tay để gửi SOS hoặc 👍 để báo an toàn...');
        setSafeActive(false);
      }, 5000);
    }

    function getGesture(landmarks) {
      if (!landmarks || landmarks.length < 21) return null;
      const fingers = [
        { tip: 4, base: 2 },
        { tip: 8, base: 6 },
        { tip: 12, base: 10 },
        { tip: 16, base: 14 },
        { tip: 20, base: 18 },
      ];
      const folded = fingers.map((f, i) => {
        const tip = landmarks[f.tip];
        const base = landmarks[f.base];
        if (i === 0) return tip.x < base.x - 0.05;
        return tip.y > base.y + 0.05;
      });

      const foldedCount = folded.filter(f => f).length;
      let gesture = null;
      if (foldedCount === 0) gesture = 'open';
      if (foldedCount === 5) gesture = 'fist';
      const thumbUp = !folded[0] && folded.slice(1).filter(f => f).length >= 2;
      if (thumbUp) gesture = 'thumb';

      return gesture;
    }

    async function initGesture() {
      const visionFileset = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      visionTask = await vision.HandLandmarker.createFromOptions(visionFileset, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task',
        },
        runningMode: 'VIDEO',
        numHands: 2,
      });

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      video.srcObject = stream;
      await video.play();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const HAND_CONNECTIONS = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [5, 9], [9, 10], [10, 11], [11, 12],
        [9, 13], [13, 14], [14, 15], [15, 16],
        [13, 17], [17, 18], [18, 19], [19, 20],
        [0, 17],
      ];

      function drawResults(results) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (!results.landmarks) return;
        for (const landmarks of results.landmarks) {
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 2;
          for (const [s, e] of HAND_CONNECTIONS) {
            const start = landmarks[s];
            const end = landmarks[e];
            if (start && end) {
              ctx.beginPath();
              ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
              ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
              ctx.stroke();
            }
          }
          for (const p of landmarks) {
            ctx.beginPath();
            ctx.arc(p.x * canvas.width, p.y * canvas.height, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#00ff88';
            ctx.fill();
          }
        }
      }

      async function detectHands() {
        const results = await visionTask.detectForVideo(video, performance.now());
        drawResults(results);

        const hands = results.landmarks?.length || 0;
        if (hands === 2 && !alertActive && !cooldown && !sosSent) {
          sendSOS();
        } else if (hands >= 1 && results.landmarks[0]) {
          const gesture = getGesture(results.landmarks[0]);
          if (gesture === 'thumb' && !cooldown) stopSOS(false);
        }

        animationId = requestAnimationFrame(detectHands);
      }

      detectHands();
    }

    initGesture();

    return () => {
      if (visionTask) visionTask.close();
      if (animationId) cancelAnimationFrame(animationId);
      clearTimeout(timeoutSOS);
      clearTimeout(cooldownTimeout);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <video
          ref={videoRef}
          className="rounded-lg shadow-lg absolute"
          style={{ transform: 'scaleX(-1)' }}
          width="640"
          height="480"
          muted
        />
        <canvas
          ref={canvasRef}
          className="rounded-lg shadow-lg"
          style={{ transform: 'scaleX(-1)' }}
          width="640"
          height="480"
        />
        {alertActive && (
          <div className="absolute inset-0 bg-red-600 bg-opacity-40 flex items-center justify-center text-white text-2xl font-bold animate-pulse">
            🚨 SOS GỬI ĐI! 🚨
          </div>
        )}
        {safeActive && (
          <div className="absolute inset-0 bg-green-600 bg-opacity-40 flex items-center justify-center text-white text-2xl font-bold animate-pulse">
            ✅ AN TOÀN! ✅
          </div>
        )}
      </div>
      <p className="text-gray-600 mt-4 font-medium">{statusMsg}</p>
    </div>
  );
}
