import { definitions, TrackerDefinition } from '@ctrl/tracker-definitions';
import { TorznabCategory } from './torznab-category';

/**
 * get definition by site
 * @param site - site name in tracker definition
 * @param source - optional source to favor if two are found
 */
export function getDefinition(site: string, source = 'jackett'): TrackerDefinition {
  const defs = definitions.filter(n => n.site === site);

  // if two definitions for a site is found, filter by source
  let def = defs[0];
  if (defs.length > 1) {
    def = defs.find(n => n.source === source) || defs[0];
  }
  return def;
}


export function mapTrackerCatToNewznab(input: string, categories: TorznabCategory[]): number[] {
  if (input === null) {
    return [];
  }

  const int = parseInt(input, 10);
  if (!Number.isNaN(int)) {
    // results.push(int + 100000);
    const intCat = categories.find(n => n.id === int + 100000);
    if (intCat) {
      // console.log({ intCat, found: categories.filter(n => n.name === intCat.name).map(n => n.id) });
      return categories.filter(n => n.name === intCat.name).map(n => n.id);
    }
  }

  return categories.filter(n => n.id === Number(input)).map(n => n.id);
}

export function mapTrackerCategory(categoryIds: number[], categories: TorznabCategory[]) {
  if (!categoryIds || !categoryIds.length) {
    return null;
  }
  for (const id of categoryIds) {
    const result = categories.find(n => n.id === id);
    if (result) {
      return result.name;
    }
  }
  return null;
}
