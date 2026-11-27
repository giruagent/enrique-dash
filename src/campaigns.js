import { levels as coreLevels } from './levels.js';
import { woolLevels } from './levels-wool.js';

export const campaigns = [
  { id: 'core', label: 'NEON ROAD', levels: coreLevels, chapters: null },
  { id: 'wool', label: 'WOOL ROAD', levels: woolLevels, chapters: [
      { at: 0, name: 'THIMBLE MEADOW' },
      { at: 5, name: 'PATCHWORK VILLAGE' },
      { at: 10, name: 'YARNSTORM' },
      { at: 15, name: 'THE ATTIC' },
    ] },
];

export function getLevelById(id) {
  for (const campaign of campaigns) {
    const level = campaign.levels.find((course) => course.id === id);
    if (level) return level;
  }
  return undefined;
}

export function campaignOf(level) {
  if (!level) return undefined;
  return campaigns.find((campaign) => (
    campaign.levels.includes(level) || campaign.id === (level.campaign ?? 'core')
  ));
}
