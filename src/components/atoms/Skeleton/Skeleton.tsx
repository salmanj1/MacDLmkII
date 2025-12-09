import styles from './Skeleton.module.less';

type SkeletonProps = {
  width?: string;
  height?: string;
  rounded?: boolean;
  'aria-label'?: string;
};

/**
 * Animated skeleton placeholder used across loading states. Width/height are inline
 * to stay flexible per layout while keeping the visual treatment in CSS.
 */
const Skeleton = ({
  width = '100%',
  height = '1rem',
  rounded = false,
  ...aria
}: SkeletonProps) => {
  return (
    <span
      className={`${styles.skeleton} ${rounded ? styles.rounded : ''}`}
      style={{ width, height }}
      {...aria}
    />
  );
};

export default Skeleton;
