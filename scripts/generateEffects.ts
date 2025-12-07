import fs from 'fs/promises';
import { notSpecified, getCommonKnobBehavior } from '../src/data/commonParams';
import type { EffectInfo } from '../src/data/commonParams';
import { skeletonEffects } from '../src/data/effects';

const manualTextPath = new URL('../docs/manual.extracted.txt', import.meta.url);
const cheatSheetPath = new URL('../docs/cheatsheet.extracted.txt', import.meta.url);
const outputPath = new URL('../src/data/effects.full.json', import.meta.url);

const secretRouting = {
  ccw: '0%: Reverb → Delay',
  cw: '100%: Delay → Reverb',
  range: '50%: parallel'
};

const loadText = async (filePath: URL) => {
  const raw = await fs.readFile(filePath, 'utf8');
  return raw.replace(/\r/g, '');
};

const buildEffects = async (): Promise<{ effects: EffectInfo[]; missing: string[] }> => {
  const manualText = await loadText(manualTextPath);
  const cheatSheetText = await loadText(cheatSheetPath);
  const combinedUpper = `${manualText}\n${cheatSheetText}`.toUpperCase();

  const hasReverbNote =
    manualText.toLowerCase().includes('repeats controls decay') &&
    manualText.toLowerCase().includes('mix controls reverb mix');

  const missingModels: string[] = [];

  const effects = skeletonEffects.map((base) => {
    const anchorFound = combinedUpper.includes(base.model.toUpperCase());
    if (!anchorFound) {
      missingModels.push(`${base.model} (${base.id}) not found in extracted text`);
    }

    const tweakBehavior = getCommonKnobBehavior(base.tweak.label);
    const tweezBehavior = getCommonKnobBehavior(base.tweez.label);

    const tweezKnob =
      base.mode === 'Secret Reverb'
        ? {
            ...base.tweez,
            behaviorCCW: secretRouting.ccw,
            behaviorCW: secretRouting.cw
          }
        : {
            ...base.tweez,
            behaviorCCW: tweezBehavior?.behaviorCCW ?? notSpecified,
            behaviorCW: tweezBehavior?.behaviorCW ?? notSpecified
          };

    const rangeNote = base.mode === 'Secret Reverb' ? secretRouting.range : base.rangeNote;
    const notes =
      base.mode === 'Secret Reverb'
        ? [
            hasReverbNote
              ? 'REPEATS controls decay and MIX controls reverb mix in reverb mode'
              : notSpecified
          ]
        : base.notes;

    return {
      ...base,
      inspiration: anchorFound ? base.inspiration : notSpecified,
      description: anchorFound ? base.description : notSpecified,
      tweak: {
        ...base.tweak,
        behaviorCCW: tweakBehavior?.behaviorCCW ?? notSpecified,
        behaviorCW: tweakBehavior?.behaviorCW ?? notSpecified
      },
      tweez: tweezKnob,
      rangeNote,
      notes
    } satisfies EffectInfo;
  });

  return { effects, missing: missingModels };
};

(async () => {
  try {
    const { effects, missing } = await buildEffects();
    await fs.writeFile(outputPath, `${JSON.stringify(effects, null, 2)}\n`, 'utf8');

    const missingDescription = effects.filter((effect) => effect.description === notSpecified).length;
    const missingInspiration = effects.filter((effect) => effect.inspiration === notSpecified).length;

    console.log('Generation succeeded:', true);
    console.log(`Models missing description: ${missingDescription}`);
    console.log(`Models missing inspiration: ${missingInspiration}`);
    if (missing.length) {
      console.log('Models not found in extracted text:');
      missing.forEach((item) => console.log(`- ${item}`));
    } else {
      console.log('All models located in extracted text.');
    }
  } catch (error) {
    console.error('Failed to generate effects dataset', error);
    process.exitCode = 1;
  }
})();
