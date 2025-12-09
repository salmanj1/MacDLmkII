import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Organisms/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof ErrorBoundary>;

const ProblemChild = () => {
  throw new Error('Boom');
};

export const CatchesErrors: Story = {
  render: () => {
    const [shouldThrow, setShouldThrow] = useState(false);
    return (
      <ErrorBoundary fallbackTitle="Error caught" fallbackMessage="Reload to retry.">
        <button type="button" onClick={() => setShouldThrow(true)}>
          Trigger error
        </button>
        {shouldThrow && <ProblemChild />}
      </ErrorBoundary>
    );
  }
};
