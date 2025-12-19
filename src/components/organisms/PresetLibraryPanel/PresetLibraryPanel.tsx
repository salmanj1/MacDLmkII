import { useRef, useState } from 'react';
import type { Mode } from '../../../data/commonParams';
import styles from './PresetLibraryPanel.module.less';

type PresetLibraryEntry = {
  id: string;
  name: string;
  createdAt: number;
  summary: string;
  description?: string;
  snapshot: {
    mode: Mode;
    detent: number;
    reverbDetent: number;
    delayControlValues: Record<Mode, Record<string, number>>;
    reverbControlValues: Record<string, number>;
    tapSubdivisionIndex: number;
    tapBpm: number;
  };
};

type PresetLibraryPanelProps = {
  entries: PresetLibraryEntry[];
  loadingId: string | null;
  onSave: (name: string, description: string) => void;
  onLoad: (id: string) => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
};

const PresetLibraryPanel = ({
  entries,
  loadingId,
  onSave,
  onLoad,
  onUpdate,
  onDelete,
  onExport,
  onImport
}: PresetLibraryPanelProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const importRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className={styles.panel} aria-label="Preset library">
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Preset Library</div>
          <div className={styles.subtitle}>
            Save the current pedal state here, then load or replace slots later.
          </div>
        </div>
        <div className={styles.saveRow}>
          <input
            className={styles.input}
            placeholder="Name this preset"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className={styles.textarea}
            placeholder="Optional description or notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <button
            type="button"
            className={styles.saveButton}
            onClick={() => {
              onSave(name, description);
              setName('');
              setDescription('');
            }}
            aria-label="Save current preset"
          >
            💾
          </button>
        </div>
        <div className={styles.importExportRow}>
          <button type="button" className={styles.smallButton} onClick={onExport} aria-label="Export presets">
            ⇩ Export
          </button>
          <button
            type="button"
            className={styles.smallButton}
            onClick={() => importRef.current?.click()}
            aria-label="Import presets"
          >
            ⇧ Import
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            className={styles.fileInput}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImport(file);
              event.target.value = '';
            }}
          />
        </div>
      </div>

      <div className={styles.list} role="list">
        {entries.length === 0 && <div className={styles.empty}>No saved presets yet.</div>}
        {entries.map((entry) => (
          <div key={entry.id} className={styles.row} role="listitem">
            <div className={styles.meta}>
              <div className={styles.nameLine}>
                <span className={styles.name}>
                  {(entry.name.split('—')[0] || entry.name).trim() || 'Preset'}
                </span>
                <span className={styles.date}>
                  {new Date(entry.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className={styles.summary}>{entry.summary || entry.description}</div>
              {entry.description ? (
                <div className={styles.description}>{entry.description}</div>
              ) : null}
              <div className={styles.expressionValues}>
                {(() => {
                  const delayValues = entry.snapshot.delayControlValues[entry.snapshot.mode] || {};
                  const read = (id: string) => {
                    const val = delayValues[id];
                    return typeof val === 'number' ? val : '—';
                  };
                  return `Knobs: Time ${read('time')} · Repeats ${read('repeats')} · Tweez ${read('tweez')}`;
                })()}
              </div>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.loadButton}
                onClick={() => onLoad(entry.id)}
                disabled={loadingId === entry.id}
                aria-label={`Load ${entry.name}`}
              >
                {loadingId === entry.id ? '…' : '⟳'}
              </button>
              <button
                type="button"
                className={styles.updateButton}
                onClick={() => onUpdate(entry.id)}
                disabled={loadingId === entry.id}
                aria-label={`Update ${entry.name} with current settings`}
              >
                ↻
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                aria-label={`Delete ${entry.name}`}
                onClick={() => onDelete(entry.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PresetLibraryPanel;
