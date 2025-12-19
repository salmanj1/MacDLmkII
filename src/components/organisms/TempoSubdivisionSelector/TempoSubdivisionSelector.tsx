import { useEffect, useMemo, useState } from 'react';
import styles from './TempoSubdivisionSelector.module.less';
import {
  delayMsForSubdivision,
  subdivisions,
  type Subdivision,
  type SubdivisionId
} from '../../../data/subdivisions';

type TempoSubdivisionSelectorProps = {
  bpm: number;
  tempoSource: 'clock' | 'manual';
  selectedSubdivisionId: SubdivisionId;
  onSubdivisionSelect: (subdivisionId: SubdivisionId) => void;
  onBpmChange: (bpm: number) => void;
  onBpmCommit?: (bpm: number) => void;
  onPushTempo?: (bpm: number) => void | Promise<void>;
  clockSending?: boolean;
  onClockSendToggle?: () => void | Promise<void>;
};

const familyClass = (family: Subdivision['family']) => {
  if (family === 'dotted') return styles.dotted;
  if (family === 'triplet') return styles.triplet;
  return styles.straight;
};

const TempoSubdivisionSelector = ({
  bpm,
  tempoSource,
  selectedSubdivisionId,
  onSubdivisionSelect,
  onBpmChange,
  onBpmCommit,
  onPushTempo,
  clockSending = false,
  onClockSendToggle
}: TempoSubdivisionSelectorProps) => {
  const [bpmInput, setBpmInput] = useState(bpm);

  useEffect(() => {
    setBpmInput(bpm);
  }, [bpm]);

  const selected = useMemo(
    () => subdivisions.find((entry) => entry.id === selectedSubdivisionId) ?? subdivisions[0],
    [selectedSubdivisionId]
  );

  const handleBpmCommit = (next: number) => {
    const clamped = Math.max(30, Math.min(300, Math.round(next || 0)));
    setBpmInput(clamped);
    onBpmChange(clamped);
    onBpmCommit?.(clamped);
  };

  return (
    <section className={styles.wrap} aria-label="Tempo and subdivision selector">
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Tempo</p>
          <div className={styles.tempoRow}>
            <span className={styles.tempoValue}>{bpmInput}</span>
            <span className={styles.tempoUnit}>BPM</span>
            <span className={styles.tempoSource}>
              {tempoSource === 'clock' ? 'MIDI Clock' : 'Tap/Manual'}
            </span>
          </div>
        </div>
        <div className={styles.bpmInputGroup}>
          <label htmlFor="tempo-input" className={styles.label}>
            Set BPM
          </label>
          <div className={styles.bpmControls}>
            <input
              id="tempo-input"
              className={styles.bpmInput}
              type="number"
              min={30}
              max={300}
              value={Number.isFinite(bpmInput) ? bpmInput : ''}
              onChange={(event) => setBpmInput(Number(event.target.value))}
              onBlur={() => handleBpmCommit(bpmInput)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleBpmCommit(bpmInput);
              }}
            />
            <button
              type="button"
              className={styles.pushButton}
              onClick={() => onPushTempo?.(bpmInput)}
            >
              Send Tap
            </button>
            <button
              type="button"
              className={`${styles.pushButton} ${clockSending ? styles.pushButtonActive : ''}`}
              onClick={onClockSendToggle}
              aria-pressed={clockSending}
            >
              {clockSending ? 'Clock: On' : 'Send Clock'}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.grid} role="list">
        {subdivisions.map((entry) => {
          const delayMs = delayMsForSubdivision(bpmInput, entry.id);
          const active = entry.id === selected.id;
          return (
            <button
              key={entry.id}
              type="button"
              className={`${styles.tile} ${familyClass(entry.family)} ${
                active ? styles.active : ''
              }`}
              onClick={() => onSubdivisionSelect(entry.id)}
              role="listitem"
              aria-pressed={active}
            >
              <div className={styles.tileTop}>
                <span className={styles.noteSymbol}>{entry.noteSymbol}</span>
                <span className={styles.label}>{entry.label}</span>
              </div>
              <div className={styles.meta}>
                <span className={styles.midiValue}>CC {entry.midiValue}</span>
                <span className={styles.delayMs}>{delayMs} ms</span>
              </div>
              <div className={styles.pulseBar}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={styles.pulse}
                    style={{
                      animationDuration: `${Math.max(delayMs, 120)}ms`,
                      animationDelay: `${idx * (delayMs / 4)}ms`
                    }}
                    aria-hidden
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className={styles.metronome} aria-hidden>
        <p className={styles.metronomeLabel}>Delay hits</p>
        <div className={styles.metronomeTrack}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <span
              key={idx}
              className={styles.metronomeDot}
              style={{
                animationDuration: `${Math.max(
                  delayMsForSubdivision(bpmInput, selected.id),
                  140
                )}ms`,
                animationDelay: `${idx * delayMsForSubdivision(bpmInput, selected.id)}ms`
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TempoSubdivisionSelector;
