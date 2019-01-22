import cheerio from 'cheerio';

import { parse as golangParse } from '@ctrl/golang-template';
import { Fields, FilterElement, Selector } from '@ctrl/tracker-definitions';

import * as filters from './filters';

export function parseSearchResults(fields: Fields, html: string) {
  const $ = cheerio.load(html);

  const titleSelector = fields.title;
  let results = selector('title', titleSelector, $, []);
  // todo throw on no titles

  for (const field of Object.keys(fields).filter(f => f !== 'title')) {
    const select = fields[field];
    results = selector(field, select, $, results);
  }
  return results;
}

export function selector(field: string, select: Selector, $: CheerioStatic, current: object[]) {
  if (field === 'date') {
    debugger;
  }
  let results: any[] = current;
  for (const action of Object.keys(select)) {
    // actions return array
    if (action === 'selector' && select.selector) {
      const htmlResult = htmlSelector(select, $);
      htmlResult.forEach((r, idx) => {
        // is the first action, will have to setup results as objects
        if (!results[idx]) {
          results[idx] = {};
        }
        results[idx][field] = r;
      });
      continue;
    }
    // actions mutate array
    results = current.map(n => {
      if (action === 'filters' && select.filters && select.filters.length) {
        n[field] = applyFilters(select.filters, n[field]);
      }
      if (action === 'text' && typeof select.text === 'string') {
        // fields are capitalized in golang template
        // TODO: pass config
        n[field] = golangParse(select.text, { Result: n });
      }
      // do this last, always resolve template on field
      if (n[field] && n[field].length && typeof n[field] === 'string') {
        n[field] = golangParse(n[field], { Result: n });
      }
      return n;
    });
  }
  return results;
}

export function htmlSelector(select: Selector, $: CheerioStatic) {
  return $(select.selector)
    .map((_, el) => {
      if (select.attribute) {
        return $(el).attr(select.attribute);
      }
      return $(el).text();
    })
    .get();
}

export function applyFilters(filterElements: FilterElement[], str: string): string | Date {
  if (!str) {
    return str;
  }
  let result: string = str;
  for (const filter of filterElements) {
    // multiple arg
    if (filter.name === 'replace' && Array.isArray(filter.args) && filter.args.length === 2) {
      result = filters.replace(result, `${filter.args[0]}`, `${filter.args[1]}`);
      continue;
    }
    if (filter.name === 'split' && Array.isArray(filter.args) && filter.args.length === 2) {
      result = filters.split(result, `${filter.args[0]}`, Number(filter.args[1]));
      continue;
    }
    // one arg
    if (
      filter.name === 'regexp' &&
      filter.args &&
      !Array.isArray(filter.args) &&
      typeof filter.args === 'string'
    ) {
      result = filters.regexp(result, filter.args);
      continue;
    }
    if (filter.name === 'append' && filter.args && !Array.isArray(filter.args)) {
      result = filters.append(result, filter.args);
      continue;
    }
    if (filter.name === 'dateparse' && filter.args && !Array.isArray(filter.args)) {
      // exit once its a date
      return filters.dateparse(result, `${filter.args}`);
    }
    if (filter.name === 'prepend' && filter.args && !Array.isArray(filter.args)) {
      result = filters.prepend(result, filter.args);
      continue;
    }
    // no arg
    if (filter.name === 'toupper') {
      result = filters.toupper(result);
      continue;
    }
    if (filter.name === 'urlencode') {
      result = filters.urlencode(result);
      continue;
    }
    // throw new Error(`Filter not implemented or args incorrect: ${filter.name}`);
  }
  return result;
}
