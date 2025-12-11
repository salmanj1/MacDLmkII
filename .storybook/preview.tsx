import type { Decorator, Preview } from '@storybook/react-vite';
import '../src/index.css';

const DataNotice: Decorator = (Story, context) => {
  if (context.viewMode !== 'docs') return <Story />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div
        style={{
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          background: 'rgba(15, 23, 42, 0.85)',
          color: '#e2e8f0',
          border: '1px solid rgba(148, 163, 184, 0.35)'
        }}
      >
        Storybook pulls real DL4 MkII metadata from <code>effects.full.json</code>
        and uses the merge fallback to skeleton data when fields are missing. Mode
        accents mirror the hardware (MkII white, Legacy green, Reverb orange).
      </div>
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    }
  },
  decorators: [DataNotice]
};

export default preview;
