import cheerio from 'cheerio';
import { range } from 'lodash';

import { parse as golangParse } from '@ctrl/golang-template';
import { Fields, Filters, GarbageDateparseFilter, Selector } from '@ctrl/tracker-definitions';

import * as filters from './filters';

export function parseSearchResults(rowsSelector: Selector, fields: Fields, html: string): any[] {
  const $ = cheerio.load(html);

  const rows = $(rowsSelector.selector);
  if (rowsSelector.filters) {
    for (const filter of rowsSelector.filters) {
      console.log(filter);
    }
  }

  const results = range(rows.length).map(() => ({}));
  for (let idx = 0; idx < results.length; idx++) {
    const row = rows[idx];
    for (const field of Object.keys(fields)) {
      const selector = fields[field];
      if (selector.selector) {
        const htmlResult = htmlSelector(selector, row, $);
        results[idx][field] = htmlResult;
      }
      if (selector.filters && selector.filters.length) {
        results[idx][field] = applyFilters(selector.filters, results[idx][field]);
      }
      if (selector.text) {
        // fields are capitalized in golang template
        // TODO: pass config
        results[idx][field] = golangParse(`${selector.text}`, { Result: results[idx] });
      }
      // do this last, always resolve template on field
      if (
        results[idx][field] &&
        results[idx][field].length &&
        typeof results[idx][field] === 'string'
      ) {
        results[idx][field] = golangParse(results[idx][field], { Result: results[idx] });
      }
    }
  }

  return results;
}

/**
 * The andmatch filter will make sure that only torrents which contain all words from the search string are returned. This is helpful if the tracker returns a lot of unrelated search results.
 */
export function andmatch() {
  // TODO
}

export function htmlSelector(select: Selector, row: CheerioElement, $: CheerioStatic) {
  // TODO: apply whatever RowsSelector.after is
  const result = $(row)
    .find($(select.selector))
    .first();

  if (select.attribute) {
    return result.attr(select.attribute);
  }
  return result.text();
}

export function applyFilters(filterElements: Filters[], str: string): string | Date {
  if (!str) {
    return str;
  }
  let result = str;
  for (const filter of filterElements) {
    // ignore random garbage filter
    if (filter && (filter as GarbageDateparseFilter).dateparse) {
      continue;
    }
    // multiple arg
    if (filter.name === 'replace') {
      result = filters.replace(result, filter.args[0], filter.args[1]);
      continue;
    }
    if (filter.name === 'split') {
      result = filters.split(result, filter.args[0], Number(filter.args[1]));
      continue;
    }
    if (filter.name === 're_replace') {
      result = filters.re_replace(result, filter.args[0], filter.args[1]);
      continue;
    }
    // one arg
    if (filter.name === 'regexp') {
      result = filters.regexp(result, filter.args);
      continue;
    }
    if (filter.name === 'trim') {
      result = filters.trim(result, filter.args ? filter.args : undefined);
      continue;
    }
    if (filter.name === 'append') {
      result = filters.append(result, filter.args);
      continue;
    }
    if (filter.name === 'dateparse') {
      // exit once its a date
      return filters.dateparse(result, filter.args);
    }
    if (filter.name === 'prepend') {
      result = filters.prepend(result, filter.args);
      continue;
    }
    if (filter.name === 'querystring') {
      result = filters.querystring(result, filter.args);
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
    throw new Error(`Filter not implemented: ${filter.name} - ${result}`);
  }
  return result;
}
