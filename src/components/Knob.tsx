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
  const dragStart = useRef<{ y: number; detent: number } | null>(null);
  const wheelAccumulator = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const detents = detentsByMode[mode];
  const angleForIndex = (index: number) => {
    if (detents.length <= 1) return -135;
    return index * (270 / (detents.length - 1)) - 135;
  };

  const indicatorAngle = angleForIndex(detent);

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
    wheelAccumulator.current += event.deltaY;

    const threshold = knobBehavior.wheelDeltaStep;
    let nextDetent = detent;

    while (Math.abs(wheelAccumulator.current) >= threshold) {
      const direction = wheelAccumulator.current > 0 ? -1 : 1;
      nextDetent = clampDetent(mode, nextDetent + direction);
      wheelAccumulator.current -= threshold * Math.sign(wheelAccumulator.current);
    }

    if (nextDetent !== detent) onDetentChange(nextDetent);
  };

  const renderTicks = () => {
    return detents.map((_, idx) => {
      const angle = angleForIndex(idx);
      const isActive = idx === detent;
      return (
        <div
          key={idx}
          className={`absolute h-3 w-[3px] origin-bottom rounded-full ${
            isActive ? 'bg-glow shadow-glow' : 'bg-slate-400'
          }`}
          style={{ transform: `rotate(${angle}deg) translateY(-64px)` }}
        />
      );
    });
  };

  const renderLabels = () => {
    return detents.map((entry, idx) => {
      const angle = angleForIndex(idx);
      const isActive = idx === detent;

      return (
        <div
          key={entry.label}
          className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{
            transform: `rotate(${angle}deg) translateY(-94px) rotate(${-angle}deg)`
          }}
        >
          <span
            className={`mb-1 h-1.5 w-1.5 rounded-full ${
              isActive ? 'bg-glow shadow-[0_0_10px_rgba(99,255,219,0.6)]' : 'bg-slate-400'
            }`}
          />
          <span
            className={`text-center text-[11px] leading-tight ${
              isActive ? 'font-semibold text-slate-50' : 'text-slate-400'
            }`}
          >
            {entry.label}
          </span>
        </div>
      );
    });
  };

  const detentMeta = detents[detent];

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="relative h-64 w-64">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-full w-full">{renderLabels()}</div>
        </div>

        <div
          role="slider"
          aria-label="Detent selector"
          aria-valuemin={0}
          aria-valuemax={detents.length - 1}
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
          className={`absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform ${
            isDragging ? 'scale-105 drop-shadow-[0_0_30px_rgba(99,255,219,0.45)]' : ''
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-700 shadow-[0_16px_30px_rgba(0,0,0,0.55)]" />
          <div className="absolute inset-[5px] rounded-full border border-black/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 shadow-[inset_0_10px_14px_rgba(255,255,255,0.12),inset_0_-16px_18px_rgba(0,0,0,0.6)]" />
          <div className="absolute inset-4 rounded-full border border-white/20 bg-gradient-to-b from-[#1d1d1d] via-[#121212] to-black shadow-[inset_10px_14px_22px_rgba(255,255,255,0.06),inset_-14px_-18px_28px_rgba(0,0,0,0.9)]" />
          <div className="absolute inset-7 rounded-full border border-white/20 bg-gradient-to-b from-[#6c6c6c]/70 via-[#b5b5b5]/60 to-[#6c6c6c]/70 shadow-[inset_0_8px_14px_rgba(255,255,255,0.25),inset_0_-10px_16px_rgba(0,0,0,0.35)]" />
          <div className="absolute inset-9 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_40%)]" />

          <div className="absolute inset-2 flex items-center justify-center">
            <div className="relative h-full w-full flex items-center justify-center">
              {renderTicks()}

              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${indicatorAngle}deg)` }}
              >
                <div className="flex -translate-y-10 flex-col items-center gap-1">
                  <div className="h-14 w-8 rounded-2xl border border-white/15 bg-gradient-to-b from-[#2d2d2d] via-[#1f1f1f] to-[#0f0f0f] shadow-[inset_0_8px_14px_rgba(255,255,255,0.16),inset_0_-14px_20px_rgba(0,0,0,0.82)]" />
                  <div className="h-10 w-[3px] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
                </div>
              </div>

              <div className="absolute left-1/2 top-[8%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-slate-200/80 shadow-[0_0_10px_rgba(255,255,255,0.45)]" />
            </div>
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
