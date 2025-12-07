import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Mode } from '../data/commonParams';
import { clampDetent, detentsByMode } from '../data/selectorMaps';
import { knobBehavior } from '../data/commonParams';

type KnobProps = {
  mode: Mode;
  detent: number;
  onDetentChange: (detent: number) => void;
};

const Knob = ({ mode, detent, onDetentChange }: KnobProps) => {
  const knobRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ y: number; detent: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragStart.current) return;
      const delta = dragStart.current.y - event.clientY;
      const steps = Math.round(delta / knobBehavior.dragPixelsPerDetent);
      const next = clampDetent(mode, dragStart.current.detent + steps);
      onDetentChange(next);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStart.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, mode, onDetentChange]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragStart.current = { y: event.clientY, detent };
    setIsDragging(true);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    const steps = Math.round(Math.abs(event.deltaY) / knobBehavior.wheelDeltaStep) || 1;
    const next = clampDetent(mode, detent + direction * steps);
    onDetentChange(next);
  };

  const renderTicks = () => {
    return detentsByMode[mode].map((_, idx) => {
      const angle = (idx / detentsByMode[mode].length) * 270 - 135;
      const isActive = idx === detent;
      return (
        <div
          key={idx}
          className={`absolute h-3 w-[2px] origin-bottom rounded-full ${
            isActive ? 'bg-glow shadow-glow' : 'bg-slate-500'
          }`}
          style={{ transform: `rotate(${angle}deg) translateY(-46px)` }}
        />
      );
    });
  };

  const detentMeta = detentsByMode[mode][detent];

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div
        ref={knobRef}
        role="slider"
        aria-label="Detent selector"
        aria-valuemin={0}
        aria-valuemax={detentsByMode[mode].length - 1}
        aria-valuenow={detent}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            onDetentChange(clampDetent(mode, detent - 1));
          }
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            onDetentChange(clampDetent(mode, detent + 1));
          }
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        className={`relative h-32 w-32 rounded-full border-2 border-slate-600 bg-slate-900 shadow-lg transition-transform ${
          isDragging ? 'scale-105 border-glow shadow-cyan-500/40' : ''
        }`}
      >
        <div className="absolute inset-2 rounded-full bg-gradient-to-b from-slate-800 to-slate-900" />
        <div className="absolute inset-4 rounded-full bg-slate-950" />
        <div className="absolute inset-1 flex items-center justify-center">
          <div className="relative h-full w-full flex items-center justify-center">
            {renderTicks()}
            <div
              className="h-2 w-6 rounded-full bg-glow shadow-lg shadow-cyan-500/40"
              style={{ transform: `rotate(${detent * (270 / (detentsByMode[mode].length - 1)) - 135}deg) translateY(-36px)` }}
            />
          </div>
        </div>
      </div>
      <div className="text-center text-sm">
        <div className="font-semibold">{detentMeta.label}</div>
        <div className="text-slate-400">{detentMeta.description}</div>
      </div>
    </div>
  );
};

export default Knob;
