import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import LibraryPanel from './LibraryPanel';
import type { EffectInfo } from '../../../data/commonParams';
import { skeletonEffects } from '../../../data/effects';
import { buildQaStats } from '../../../utils/effectQa';

const sampleEffects: EffectInfo[] = skeletonEffects.slice(0, 8).map((effect, idx) => ({
  ...effect,
  inspiration: effect.inspiration === 'Not specified in manual' ? 'Classic rack unit' : effect.inspiration,
  model: `${effect.model} ${idx + 1}`
}));

const meta: Meta<typeof LibraryPanel> = {
  title: 'Organisms/LibraryPanel',
  component: LibraryPanel,
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof LibraryPanel>;

export const WithQaAndSearch: Story = {
  render: () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<EffectInfo>(sampleEffects[0]);

    const filtered = sampleEffects.filter((effect) =>
      effect.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <LibraryPanel
        filteredEffects={filtered}
        mode={selected.mode}
        currentDetent={selected.detent}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchInputRef={() => {}}
        onSelectEffect={setSelected}
        qaStats={buildQaStats(sampleEffects)}
        showQa
      />
    );
  }
};
