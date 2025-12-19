import styles from './RoutingSelector.module.less';
import { defaultRoutingValue, routingOptions } from '../../../data/routing';

type RoutingSelectorProps = {
  value: number;
  label?: string;
  onChange: (next: number) => void;
};

const RoutingSelector = ({ value, label = 'Routing', onChange }: RoutingSelectorProps) => {
  const current =
    routingOptions.find((option) => option.value === value) ??
    routingOptions.find((option) => option.value === defaultRoutingValue)!;

  return (
    <div className={styles.wrap} role="group" aria-label={label}>
      <div className={styles.label}>{label}</div>
      <div className={styles.options}>
        {routingOptions.map((option) => {
          const active = option.value === current.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.option} ${active ? styles.optionActive : ''}`}
              onClick={() => onChange(option.value)}
              aria-pressed={active}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoutingSelector;
