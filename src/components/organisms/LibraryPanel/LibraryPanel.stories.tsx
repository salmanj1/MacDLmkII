import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import LibraryPanel from './LibraryPanel';
import type { EffectInfo } from '../../../data/commonParams';
import fullEffects from '../../../data/effects.full.json';
import { mergeEffects } from '../../../data/effects';
import { buildQaStats } from '../../../utils/effectQa';

const merged = mergeEffects(fullEffects);
const sampleEffects: EffectInfo[] = merged.slice(0, 18);

const meta: Meta<typeof LibraryPanel> = {
  title: 'Organisms/LibraryPanel',
  component: LibraryPanel,
  tags: ['autodocs'],
  parameters: {
    controls: { hideNoControlsWarning: true }
  }
};

export default meta;

type Story = StoryObj<typeof LibraryPanel>;

export const WithQaAndSearch: Story = {
  render: () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<EffectInfo>(sampleEffects[0]);

    const filtered = useMemo(
      () =>
        sampleEffects.filter((effect) =>
          `${effect.model} ${effect.inspiration} ${effect.description}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        ),
      [searchTerm]
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

export const Loading: Story = {
  args: {
    filteredEffects: [],
    mode: sampleEffects[0].mode,
    currentDetent: 0,
    searchTerm: '',
    onSearchChange: () => {},
    onSearchInputRef: () => {},
    onSelectEffect: () => {},
    qaStats: buildQaStats(sampleEffects),
    showQa: true,
    loading: true
  }
};

export const EmptyResults: Story = {
  args: {
    filteredEffects: [],
    mode: sampleEffects[0].mode,
    currentDetent: 0,
    searchTerm: 'nope',
    onSearchChange: () => {},
    onSearchInputRef: () => {},
    onSelectEffect: () => {},
    qaStats: buildQaStats(sampleEffects),
    showQa: false,
    loading: false
  }
};
