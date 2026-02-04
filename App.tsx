
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { GestureType } from './types';
import { GESTURE_MESSAGES, GESTURE_ICONS, GESTURE_HINTS, COLORS } from './constants';
import Particles from './components/Particles';
import { Camera, Hand, Sparkles, Info } from 'lucide-react';

const App: React.FC = () => {
  const [gesture, setGesture] = useState<GestureType>(GestureType.NONE);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const handPosRef = useRef({ x: 0.5, y: 0.5 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastGestureRef = useRef<GestureType>(GestureType.NONE);

  const handleGestureChange = useCallback((newGesture: GestureType) => {
    if (newGesture === lastGestureRef.current) return;
    lastGestureRef.current = newGesture;
    setGesture(newGesture);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handPosRef.current = {
      x: touch.clientX / window.innerWidth,
      y: touch.clientY / window.innerHeight
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handPosRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight
    };
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (isCameraActive && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => {
          console.error("Camera error:", err);
          setIsCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  return (
    <div 
      className="relative w-screen h-screen bg-[#050505] overflow-hidden flex flex-col select-none touch-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 18], fov: 65 }} dpr={[1, 2]}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color={COLORS.GOLD} />
          <Particles gesture={gesture} handPosRef={handPosRef} />
          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={0.5} />
          <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* HTML Overlay UI */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none p-5 md:p-10">
        {/* Header - Mobile Compact */}
        <div className="flex flex-col gap-1 items-center text-center mt-4">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl italic tracking-tighter">
            2026 灵马贺岁
          </h1>
          <p className="text-white/40 text-[9px] uppercase tracking-[0.3em] font-bold flex items-center gap-1">
            <Info size={10} className="text-red-500" />
            互动粒子 · 瑞马迎新
          </p>
        </div>

        {/* Status Bubble - Floating Middle */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 bg-black/60 border border-white/10 px-6 py-3 rounded-full backdrop-blur-2xl shadow-2xl transition-all duration-500 mb-20 scale-90">
            <span className="text-yellow-500 font-black flex items-center gap-2 text-lg tracking-tight">
              {GESTURE_ICONS[gesture]} {gesture.includes('马') ? '3D 骏马形态' : GESTURE_MESSAGES[gesture]}
            </span>
          </div>
        </div>

        {/* Gesture Controls - Horizontal Scroll for Mobile */}
        <div className="pointer-events-auto w-full pb-8">
          <div className="flex overflow-x-auto no-scrollbar gap-4 px-2 py-4 snap-x snap-mandatory">
            <div className="snap-center shrink-0">
              <MobileGestureButton 
                active={gesture === GestureType.NONE} 
                onClick={() => handleGestureChange(GestureType.NONE)}
                icon={<Hand size={22} />}
                label="重置"
                color="bg-slate-800"
              />
            </div>
            <div className="snap-center shrink-0">
              <MobileGestureButton 
                active={gesture === GestureType.HAPPY_NEW_YEAR} 
                onClick={() => handleGestureChange(GestureType.HAPPY_NEW_YEAR)}
                icon={<Sparkles size={22} />}
                label="新春快乐"
                color="bg-red-700"
              />
            </div>
            <div className="snap-center shrink-0">
              <MobileGestureButton 
                active={gesture === GestureType.HORSE} 
                onClick={() => handleGestureChange(GestureType.HORSE)}
                icon={<span className="text-2xl">🐎</span>}
                label="3D骏马"
                color="bg-orange-700"
              />
            </div>
            <div className="snap-center shrink-0">
              <MobileGestureButton 
                active={gesture === GestureType.LUCKY_HORSE} 
                onClick={() => handleGestureChange(GestureType.LUCKY_HORSE)}
                icon={<span className="text-2xl">🍀</span>}
                label="马年大吉"
                color="bg-yellow-700"
              />
            </div>
            <div className="snap-center shrink-0">
              <MobileGestureButton 
                active={gesture === GestureType.RED_ENVELOPE} 
                onClick={() => handleGestureChange(GestureType.RED_ENVELOPE)}
                icon={<span className="text-2xl">🧧</span>}
                label="红包拿来"
                color="bg-red-900"
              />
            </div>
          </div>
          <div className="text-center text-white/20 text-[8px] uppercase tracking-[0.4em] mt-2 font-black">
            滑动选择手势 · Slide to explore
          </div>
        </div>

        {/* Camera Toggle - Floating Top Right */}
        <div className="absolute top-6 right-6 pointer-events-auto">
          <button 
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`p-3 rounded-full backdrop-blur-3xl shadow-2xl border transition-all duration-300 ${isCameraActive ? "bg-red-600/20 border-red-500 text-red-500" : "bg-white/5 border-white/10 text-white"}`}
          >
            <Camera size={20} />
          </button>
        </div>

        {/* Camera Preview - Small Circle PIP */}
        {isCameraActive && (
          <div className="absolute top-20 right-6 w-24 h-24 rounded-full border-2 border-red-600/50 overflow-hidden shadow-2xl bg-black/80">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover scale-x-[-1] opacity-80" 
            />
          </div>
        )}
      </div>

      <footer className="absolute bottom-2 left-0 right-0 text-center text-white/10 text-[7px] uppercase tracking-[0.5em] pointer-events-none font-bold">
        2026 Year of the Horse
      </footer>
    </div>
  );
};

interface MobileGestureButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const MobileGestureButton: React.FC<MobileGestureButtonProps> = ({ active, onClick, icon, label, color }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 w-28 h-28 rounded-3xl transition-all duration-300 border-2 ${
      active 
        ? `${color} border-white shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.2)] scale-105` 
        : "bg-white/5 border-white/5 text-white/30"
    }`}
  >
    <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>
      {icon}
    </div>
    <span className={`font-black text-[11px] tracking-tight uppercase ${active ? 'text-white' : 'text-inherit'}`}>
      {label}
    </span>
  </button>
);

export default App;
