import { useState } from 'react';
import styles from './PresetLibraryPanel.module.less';

type PresetLibraryEntry = {
  id: string;
  name: string;
  createdAt: number;
  summary: string;
  description?: string;
};

type PresetLibraryPanelProps = {
  entries: PresetLibraryEntry[];
  loadingId: string | null;
  onSave: (name: string, description: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
};

const PresetLibraryPanel = ({
  entries,
  loadingId,
  onSave,
  onLoad,
  onDelete
}: PresetLibraryPanelProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <section className={styles.panel} aria-label="Preset library">
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Preset Library</div>
          <div className={styles.subtitle}>Store extra presets locally and load them later.</div>
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
          >
            Save
          </button>
        </div>
      </div>

      <div className={styles.list} role="list">
        {entries.length === 0 && <div className={styles.empty}>No saved presets yet.</div>}
        {entries.map((entry) => (
          <div key={entry.id} className={styles.row} role="listitem">
            <div className={styles.meta}>
              <div className={styles.name}>{entry.name}</div>
              <div className={styles.date}>
                {new Date(entry.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className={styles.summary}>{entry.summary}</div>
              {entry.description ? (
                <div className={styles.description}>{entry.description}</div>
              ) : null}
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.loadButton}
                onClick={() => onLoad(entry.id)}
                disabled={loadingId === entry.id}
              >
                {loadingId === entry.id ? 'Loading…' : 'Load'}
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
