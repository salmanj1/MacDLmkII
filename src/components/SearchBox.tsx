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
    <div className="w-full">
      <label className="text-xs uppercase tracking-wide text-slate-400">Search</label>
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 shadow-inner">
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Filter models or inspiration..."
          className="w-full bg-transparent text-slate-100 outline-none"
          type="search"
        />
        <span className="text-[10px] text-slate-500">⌘F</span>
      </div>
    </div>
  );
};

export default SearchBox;
