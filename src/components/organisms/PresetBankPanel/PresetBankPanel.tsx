import { useMemo, useState, useRef } from 'react';
import { usePresetBank, presetBankActions } from '../../../state/usePresetBank';
import type { Preset } from '../../../state/usePresetBank';
import styles from './PresetBankPanel.module.less';
import { invoke } from '@tauri-apps/api/core';

type Props = {
  onLoad?: (id: number) => void;
  onRename?: (id: number, name: string) => void;
  onDuplicate?: (sourceId: number, targetId: number) => void;
  onDelete?: (id: number) => void;
  onUpdateDescription?: (id: number, description: string) => void;
  onUpdateTags?: (id: number, tags: string[]) => void;
};

const PresetBankPanel = ({
  onLoad,
  onRename,
  onDuplicate,
  onDelete,
  onUpdateDescription,
  onUpdateTags
}: Props) => {
  const { presets, filter, selectedId } = usePresetBank();
  const [contextId, setContextId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tauri runtime detection for download handling.
  const isTauriRuntime =
    typeof window !== 'undefined' &&
    Boolean(
      (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ??
        (window as unknown as { __TAURI_IPC__?: unknown }).__TAURI_IPC__
    );

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return presets;
    return presets.filter((p) => p.name.toLowerCase().includes(term));
  }, [filter, presets]);

  const handleLoad = (id: number) => {
    presetBankActions.select(id);
    onLoad?.(id);
  };

  const handleRename = (preset: Preset) => {
    const next = prompt('Rename preset', preset.name);
    if (next && next.trim()) {
      presetBankActions.updatePreset(preset.id, (prev) => ({
        ...prev,
        name: next.trim(),
        isEmpty: false,
        lastModified: new Date().toISOString()
      }));
      onRename?.(preset.id, next.trim());
    }
  };

  const handleDuplicate = (preset: Preset) => {
    const target = parseInt(prompt('Duplicate to slot (1-128)', `${preset.id + 1}`) ?? '', 10);
    if (Number.isNaN(target)) return;
    const idx = Math.max(1, Math.min(128, target)) - 1;
    presetBankActions.duplicatePreset(preset.id, idx);
    onDuplicate?.(preset.id, idx);
  };

  const handleDelete = (preset: Preset) => {
    const confirm = window.confirm(`Delete "${preset.name}"?`);
    if (!confirm) return;
    presetBankActions.updatePreset(preset.id, (prev) => ({
      ...prev,
      name: `Preset ${prev.id + 1}`,
      tags: [],
      isEmpty: true,
      lastModified: new Date().toISOString()
    }));
    onDelete?.(preset.id);
  };

  const handleDragStart = (id: number) => setContextId(id);
  const handleDrop = (targetId: number) => {
    if (contextId === null) return;
    presetBankActions.swapPresets(contextId, targetId);
    setContextId(null);
  };

  const handleTagEdit = (preset: Preset) => {
    const next = prompt('Comma-separated tags', preset.tags.join(', ')) ?? '';
    const tags = next
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    presetBankActions.setTags(preset.id, tags);
    onUpdateTags?.(preset.id, tags);
  };

  const handleExport = async () => {
    if (isTauriRuntime) {
      try {
        const savedTo = await invoke<string>('export_preset_bank', {
          data: JSON.stringify(presets, null, 2)
        });
        if (savedTo) {
          // Provide a minimal confirmation so it doesn't feel like a no-op in Tauri.
          alert(`Exported preset-bank.json to:\n${savedTo}`);
        }
        return;
      } catch (err) {
        console.error('Failed to export presets', err);
      }
    }

    const blob = new Blob([JSON.stringify(presets, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preset-bank.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) return;
        presetBankActions.replaceBank(parsed as Preset[]);
      } catch {
        // ignore bad import
      }
    };
    reader.readAsText(file);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>Preset Bank</div>
      </div>
      <div className={styles.searchRow}>
        <input
          className={styles.search}
          placeholder="Search presets"
          value={filter}
          onChange={(e) => presetBankActions.setFilter(e.target.value)}
        />
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={handleExport} className={styles.actionButton}>
          Export
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={styles.actionButton}
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
            e.target.value = '';
          }}
        />
      </div>

      <div className={styles.grid} role="list">
        {filtered.map((preset) => (
          <div
            key={preset.id}
            className={`${styles.card} ${selectedId === preset.id ? styles.active : ''} ${preset.isEmpty ? styles.empty : ''}`}
            role="listitem"
            draggable
            onDragStart={() => handleDragStart(preset.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(preset.id)}
            onClick={() => handleLoad(preset.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextId(preset.id === contextId ? null : preset.id);
            }}
          >
            <div className={styles.cardTop}>
              <span className={styles.slotLabel}>#{preset.id + 1}</span>
            {preset.tags.length > 0 && (
              <span className={styles.tag}>{preset.tags[0]}</span>
            )}
          </div>
          <div className={styles.name}>{preset.name}</div>
            <div className={styles.meta}>
              {preset.isEmpty ? 'Empty' : `Edited ${new Date(preset.lastModified).toLocaleDateString()}`}
            </div>
            {preset.description && (
              <div className={styles.description}>{preset.description}</div>
            )}

            {contextId === preset.id && (
              <div className={styles.contextMenu}>
                <button type="button" onClick={() => handleRename(preset)}>Rename</button>
                <button type="button" onClick={() => handleDuplicate(preset)}>Duplicate</button>
                <button type="button" onClick={() => handleTagEdit(preset)}>Edit Tags</button>
                <button
                  type="button"
                  onClick={() => {
                    const next = prompt('Update description', preset.description ?? '');
                    if (next !== null) {
                      presetBankActions.updatePreset(preset.id, (prev) => ({
                        ...prev,
                        description: next.trim(),
                        lastModified: new Date().toISOString(),
                        isEmpty: false
                      }));
                      onUpdateDescription?.(preset.id, next.trim());
                    }
                  }}
                >
                  Edit Description
                </button>
                <button type="button" onClick={() => handleDelete(preset)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PresetBankPanel;
