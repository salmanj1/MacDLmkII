import type { EffectInfo as EffectInfoType } from '../data/commonParams';

type EffectInfoProps = {
  effect?: EffectInfoType;
};

const EffectInfo = ({ effect }: EffectInfoProps) => {
  if (!effect) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-4 text-slate-400">
        Select a detent to view details.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-5 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">{effect.mode}</div>
        <div className="text-sm text-slate-400">Detent {effect.detent + 1}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold text-glow">{effect.model}</div>
      <div className="text-sm text-slate-300">Inspired by {effect.inspiration}</div>
      <p className="mt-3 text-slate-200 leading-relaxed">{effect.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-slate-700 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">Twist CCW</div>
          <div className="text-slate-100">{effect.tweak.ccw}</div>
        </div>
        <div className="rounded-lg border border-slate-700 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">Twist CW</div>
          <div className="text-slate-100">{effect.tweak.cw}</div>
        </div>
      </div>
    </div>
  );
};

export default EffectInfo;
