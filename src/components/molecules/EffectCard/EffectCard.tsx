import styles from './EffectCard.module.less';
import type { EffectInfo, Mode } from '../../../data/commonParams';

type EffectCardProps = {
  effect: EffectInfo;
  mode: Mode;
  currentDetent: number;
  onSelect: (effect: EffectInfo) => void;
};

/**
 * Reusable card for library listings.
 */
const EffectCard = ({ effect, mode, currentDetent, onSelect }: EffectCardProps) => {
  const isActive = effect.mode === mode && effect.detent === currentDetent;

  return (
    <button
      type="button"
      onClick={() => onSelect(effect)}
      className={`${styles.effectCard} ${isActive ? styles.effectCardActive : ''}`}
    >
      <div className={styles.cardTop}>
        <span>{effect.mode}</span>
        <span>Detent {effect.detent + 1}</span>
      </div>
      <div className={styles.cardTitle}>{effect.model}</div>
      <div className={styles.cardMeta}>
        <span>{effect.inspiration}</span>
        {isActive && <span className={styles.activeBadge}>Active</span>}
      </div>
    </button>
  );
};

export default EffectCard;
