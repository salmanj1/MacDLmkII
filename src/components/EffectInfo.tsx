import { notSpecified, type EffectInfo as EffectInfoType } from '../data/commonParams';

type EffectInfoProps = {
  effect?: EffectInfoType;
};

const EffectInfo = ({ effect }: EffectInfoProps) => {
  if (!effect) {
    return (
      <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-slate-300 shadow-xl shadow-black/30 backdrop-blur">
        <p className="text-sm font-semibold text-slate-100">Nothing selected yet</p>
        <p className="text-sm text-slate-400">
          Pick a detent or use search to see the full description, knob behaviors, and notes.
        </p>
      </div>
    );
  }

  const description =
    effect.description === notSpecified
      ? 'No description provided in the manual yet.'
      : effect.description;
  const inspiration =
    effect.inspiration === notSpecified ? 'Inspiration not listed' : effect.inspiration;
  const rangeNote =
    effect.rangeNote === notSpecified ? 'Range not listed in the manual' : effect.rangeNote;
  const notes = effect.notes.filter((note) => note !== notSpecified);

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl shadow-black/40 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-glow ring-1 ring-glow/40">
            {effect.mode}
          </span>
          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-slate-300">
            Detent {effect.detent + 1}
          </span>
        </div>
        <span className="text-xs text-slate-400">Selector #{effect.selectorIndex + 1}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-lime-100">Current model</div>
          <div className="text-3xl font-semibold leading-tight text-slate-50">{effect.model}</div>
          <div className="text-sm text-slate-300">
            Inspired by <span className="text-slate-100">{inspiration}</span>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Range</div>
          <div className="font-semibold text-slate-100">{rangeNote}</div>
        </div>
      </div>

      <p className="mt-4 text-base leading-relaxed text-slate-200">{description}</p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 text-sm">
        {[{ title: 'Tweak', data: effect.tweak }, { title: 'Tweez', data: effect.tweez }].map(
          (entry) => (
            <div
              key={entry.title}
              className="rounded-xl border border-white/10 bg-slate-950/70 p-4 shadow-inner"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-slate-400">{entry.title}</div>
                <div className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-300">
                  {entry.data.label}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-white/5 bg-slate-900/80 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">CCW</div>
                  <div className="text-slate-100">{entry.data.behaviorCCW}</div>
                </div>
                <div className="rounded-lg border border-white/5 bg-slate-900/80 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">CW</div>
                  <div className="text-slate-100">{entry.data.behaviorCW}</div>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-5">
        <div className="text-xs uppercase tracking-wide text-slate-400">Notes</div>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-200">
          {notes.length ? (
            notes.map((note) => (
              <span
                key={note}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-100"
              >
                {note}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
              No extra notes listed.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EffectInfo;
