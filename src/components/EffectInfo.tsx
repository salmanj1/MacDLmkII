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
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
        <div className="rounded-lg border border-slate-700 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">Tweak</div>
          <div className="text-sm font-semibold text-slate-100">{effect.tweak.label}</div>
          <div className="mt-2 space-y-1">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-400">CCW</div>
              <div className="text-slate-100">{effect.tweak.behaviorCCW}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-400">CW</div>
              <div className="text-slate-100">{effect.tweak.behaviorCW}</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-700 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">Tweez</div>
          <div className="text-sm font-semibold text-slate-100">{effect.tweez.label}</div>
          <div className="mt-2 space-y-1">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-400">CCW</div>
              <div className="text-slate-100">{effect.tweez.behaviorCCW}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-400">CW</div>
              <div className="text-slate-100">{effect.tweez.behaviorCW}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-300">
        <div className="font-semibold text-slate-100">Range / Notes</div>
        <p className="text-slate-200">{effect.rangeNote}</p>
        {effect.notes.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-200">
            {effect.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EffectInfo;
