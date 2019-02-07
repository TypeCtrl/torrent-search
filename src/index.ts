import got, { GotOptions, Response } from 'got';
import { CookieJar } from 'tough-cookie';
import uaString from 'ua-string';
import bytes from 'bytes';
import { URL } from 'url';
import { flatten } from 'lodash';

import { catchCloudflare } from '@ctrl/cloudflare';
import { parse as golangParse } from '@ctrl/golang-template';
import { definitions, TrackerDefinition } from '@ctrl/tracker-definitions';

import { parseSearchResults } from './parse';
import { format } from 'date-fns';
import { fromUnknown } from './date';
import { TorznabCategory, ALL_CATS } from './torznab-category';

/**
 * get definition by site
 * @param site - site name in tracker definition
 * @param source - optional source to favor if two are found
 */
export function getDefinition(site: string, source = 'jackett') {
  const defs = definitions.filter(n => n.site === site);

  // if two definitions for a site is found, filter by source
  let def = defs[0];
  if (defs.length > 1) {
    def = defs.find(n => n.source === source) || defs[0];
  }
  return def;
}

function addCategoryMapping(definition: TrackerDefinition) {
  const results: TorznabCategory[] = [...ALL_CATS];
  if (!definition.caps.categorymappings) {
    return results;
  }
  for (const categoryMapping of definition.caps.categorymappings) {
    const trackerCategoryInt = parseInt(categoryMapping.id, 10);
    const add: TorznabCategory = {
      id: trackerCategoryInt + 100000,
      name: categoryMapping.cat,
    };
    results.push(add);
  }
  return results;
}

export async function getSearchResults(definition: TrackerDefinition, q: string) {
  const search = definition.search;
  const baseUrl = definition.links[0].endsWith('/')
    ? definition.links[0].substring(0, definition.links[0].length - 1)
    : definition.links[0];
  const config: any = {};

  const cookieJar = new CookieJar();
  const options: GotOptions<any> = {
    baseUrl,
    cookieJar,
    headers: {
      // helps to pass user-agent
      'user-agent': uaString,
    },
    retry: {
      // either disable retry or remove status code 503 from retries
      retries: 0,
      statusCodes: [408, 413, 429, 500, 502, 504],
    },
  };

  const availableCategories = addCategoryMapping(definition);

  const responses: any[] = [];
  let idx = 0;
  for (const searchPath of search.paths) {
    let path = golangParse(searchPath.path, { Config: config, Keywords: q });
    path = path.startsWith('/') ? path : '/' + path;
    path = encodeURI(path);
    // TODO: $raw
    const query: any = {};
    if (search.inputs) {
      for (const name of Object.keys(search.inputs)) {
        // TODO: pass config
        // TODO: imdb feature
        query[name] = golangParse(`${search.inputs[name]}`, { Keywords: q });
      }
    }
    console.log({ path, query });

    let page: Response<any>;
    try {
      page = await got(baseUrl, { ...options, path, query });
      // console.log(page);
    } catch (e) {
      // console.log(e)
      page = await catchCloudflare(e, { ...options, path, query });
      // console.log(page.headers)
    }
    for (const response of parseSearchResults(search.rows, search.fields, page.body)) {
      responses.push(finalizeFields(response, baseUrl, availableCategories));
    }
    idx += 1;
  }

  // flatten
  return flatten(responses);
}

export interface ReleaseInfo {
  Title: string;
  Guid: string | null;
  Link: string | null;
  Comments: string | null;
  PublishDate: string | null;
  Category: number[];
  Size?: number;
  Files: number | null;
  Grabs: number | null;
  Description: string | null;
  RageID: number | null;
  TVDBId: number | null;
  Imdb: number | null;
  TMDb: number | null;
  Seeders?: number;
  Peers: number | null;
  BannerUrl: string | null;
  InfoHash: string | null;
  MagnetUri: string | null;
  MinimumRatio?: number;
  MinimumSeedTime?: number;
  DownloadVolumeFactor?: number;
  UploadVolumeFactor?: number;
  BlackholeLink: string | null;
}

export function mapTrackerCatToNewznab(input: string, categories: TorznabCategory[]): number[] {
  console.log({ input });
  if (input === null) {
    return [];
  }

  const int = parseInt(input, 10);
  if (!Number.isNaN(int)) {
    // results.push(int + 100000);
    const intCat = categories.find(n => n.id === int + 100000);
    if (intCat) {
      console.log({intCat, found: categories.filter(n => n.name === intCat.name).map(n => n.id) });
      return categories.filter(n => n.name === intCat.name).map(n => n.id);
    }
  }

  return categories.filter(n => n.id === Number(input)).map(n => n.id);
}

/**
 * normalize the fields returned from the cardigann page parse
 */
export function finalizeFields(body: any, baseUrl: string, categories: TorznabCategory[]) {
  // TODO: add release interface
  const release: ReleaseInfo = {
    Title: '',
    Comments: null,
    PublishDate: null,
    Category: [],
    MagnetUri: null,
    Guid: null,
    Link: null,
    InfoHash: null,
    Imdb: null,
    TMDb: null,
    TVDBId: null,
    RageID: null,
    Files: null,
    Grabs: null,
    Description: null,
    BannerUrl: null,
    BlackholeLink: null,
    Peers: null,
  };
  for (const key of Object.keys(body)) {
    const value = body[key];
    switch (key) {
      case 'download':
        if (!value) {
          release.Link = null;
          break;
        }
        if (value.startsWith('magnet:')) {
          // might need to parse URI?
          release.MagnetUri = value;
        } else {
          release.Link = `${baseUrl}${value}`;
        }
        break;
      case 'magnet':
        // might need to parse URI?
        release.MagnetUri = value;
        break;
      case 'title':
        // if (FieldModifiers.Contains("append")) {
        //     release.Title += value;
        // } else {
        //     release.Title = value;
        // }
        release.Title = value;
        break;
      case 'size':
        release.Size = bytes.parse(value);
        break;
      case 'leechers':
        const leechers = parseInt(value, 10);
        release.Peers = leechers;
        break;
      case 'seeders':
        const seeders = parseInt(value, 10);
        release.Seeders = seeders;
        break;
      case 'date':
        console.log(value);
        const date = fromUnknown(value);
        // "2019-01-28T13:35:49.064149+00:00"
        release.PublishDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx");
        break;
      case 'details':
        const url = new URL(value, baseUrl);
        release.Guid = url.toString();
        release.Comments = url.toString();
        break;
      case 'comments':
        const commentsUrl = new URL(value, baseUrl);
        if (release.Comments === null) {
          release.Comments = commentsUrl.toString();
        }
        if (release.Guid === null) {
          release.Guid = commentsUrl.toString();
        }
        break;
      case 'category':
        const cats = mapTrackerCatToNewznab(value, categories);
        if (release.Category === null) {
          release.Category = cats;
          break;
        }
        for (const cat of cats) {
          if (!release.Category.includes(cat)) {
            release.Category.push(cat);
          }
        }
        break;
      default:
        console.log(key);
      // throw new Error("I HAVE NO HANDLER. I CAN'T BE HANDLED");
    }
  }
  return release;
}
