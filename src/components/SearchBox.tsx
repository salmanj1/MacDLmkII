import { useEffect, useRef } from 'react';

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onFocusedShortcut: (ref: HTMLInputElement | null) => void;
};

const SearchBox = ({ value, onChange, onFocusedShortcut }: SearchBoxProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onFocusedShortcut(inputRef.current);
  }, [onFocusedShortcut]);

  return (
    <label className="block">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
        <span>Search the library</span>
        <span className="flex items-center gap-2 text-[10px] font-semibold text-slate-300">
          <span className="rounded-md bg-white/5 px-1.5 py-0.5">⌘/Ctrl</span>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5">F</span>
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 shadow-inner transition focus-within:border-glow">
        <span className="text-lg text-slate-500" aria-hidden>
          🔎
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Filter by model name, inspiration, or keywords..."
          className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
          type="search"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
          >
            Clear
          </button>
        )}
      </div>
    </label>
  );
};

export default SearchBox;
