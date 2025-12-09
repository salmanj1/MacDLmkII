import type { PropsWithChildren } from 'react';
import styles from './Pill.module.less';

type PillTone = 'glow' | 'muted' | 'inverse';

type PillProps = PropsWithChildren<{
  tone?: PillTone;
  ariaLabel?: string;
}>;

/**
 * Compact label used across the UI to keep small bits of meta-data visually consistent
 * (e.g. modes, detent numbers). The tone prop swaps between accent and neutral styling
 * without repeating CSS in every caller.
 */
const Pill = ({ children, tone = 'muted', ariaLabel }: PillProps) => {
  const toneClass = styles[tone];

  return (
    <span aria-label={ariaLabel} className={`${styles.pill} ${toneClass}`}>
      {children}
    </span>
  );
};

export default Pill;
