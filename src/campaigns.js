import { levels as coreLevels } from './levels.js';
import { woolLevels } from './levels-wool.js';

export const campaigns = [
  { id: 'core', label: 'NEON ROAD', levels: coreLevels, chapters: null },
  { id: 'wool', label: 'WOOL ROAD', levels: woolLevels, chapters: [{ at: 0, name: 'THIMBLE MEADOW' }] },
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
