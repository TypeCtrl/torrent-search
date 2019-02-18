import bytes from 'bytes';
import got, { GotOptions, Response } from 'got';
import { flatten } from 'lodash';
import { CookieJar } from 'tough-cookie';
import uaString from 'ua-string';
import { URL } from 'url';
import { format } from 'date-fns-tz';

import { catchCloudflare } from '@ctrl/cloudflare';
import { parse as golangParse } from '@ctrl/golang-template';
import { TrackerDefinition } from '@ctrl/tracker-definitions';

import { fromUnknown } from './date';
import { parseSearchResults } from './parse';
import { ALL_CATS, TorznabCategory } from './torznab-category';
import { getDefinition, mapTrackerCatToNewznab, mapTrackerCategory } from './definition';

export interface IndexerOptions {
  site: string;
  source?: 'jackett' | 'cardigann';
  config?: TrackerConfig;
}

export interface TrackerConfig {
  /**
   * the autenticated cookie for the site
   * @link https://github.com/Jackett/Jackett/wiki/Finding-cookies
   */
  cookie?: string;
}

export class Indexer {
  definition: TrackerDefinition;
  cookieJar: CookieJar;

  constructor(private options: IndexerOptions) {
    this.definition = getDefinition(options.site, options.source);
    // TODO: parse passed in existing cookies json
    this.cookieJar = new CookieJar();
  }

  /**
   * setup this.cookieJar to make authenticated requests
   */
  async doLogin() {
    if (!this.definition.login) {
      return;
    }
    const login = this.definition.login;
    if (login.method === 'post') {
      // TODO
    }
    if (login.method === 'form') {
      // TODO
    }
    if (login.method === 'cookie') {
    if (!this.options.config || !this.options.config.cookie) {
        throw new Error('Cookie is required');
      }
      this.cookieJar.setCookieSync('cookie', this.options.config.cookie);
    }
    if (login.method === 'get') {
      // TODO
    }
  }

  addCategoryMapping() {
    const results: TorznabCategory[] = [...ALL_CATS];
    if (!this.definition.caps.categorymappings) {
      return results;
    }
    for (const categoryMapping of this.definition.caps.categorymappings) {
      const trackerCategoryInt = parseInt(categoryMapping.id, 10);
      const add: TorznabCategory = {
        id: trackerCategoryInt + 100000,
        name: categoryMapping.cat,
      };
      results.push(add);
    }
    return results;
  }

  async getSearchResults(q: string, categories: any[]) {
    const search = this.definition.search;
    const baseUrl = this.definition.links[0].endsWith('/')
      ? this.definition.links[0].substring(0, this.definition.links[0].length - 1)
      : this.definition.links[0];
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

    const availableCategories = this.addCategoryMapping();

    const responses: ReleaseInfo[] = [];
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
          console.log(search.inputs[name], { Keywords: q });
          // TODO: Categories should be an array of ID's from selected cats
          const value = golangParse(`${search.inputs[name]}`, {
            Keywords: q,
            Categories: categories,
          });
          console.log({ value });
          if (name === '$raw') {
            for (const part of value.split('&')) {
              const [key, val] = part.split('=');
              if (!key || !val) {
                continue;
              }
              query[key] = val;
            }
            continue;
          }
          query[name] = value;
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
        responses.push(this.finalizeFields(response, baseUrl, availableCategories));
      }
    }

    // flatten
    return flatten(responses);
  }

  /**
   * normalize the fields returned from the cardigann page parse
   */
  finalizeFields(
    body: any,
    baseUrl: string,
    categories: TorznabCategory[],
  ) {
    // TODO: add release interface
    const release: ReleaseInfo = {
      Tracker: this.definition.name,
      TrackerId: this.definition.site,
      Title: '',
      Comments: null,
      PublishDate: null,
      Category: [],
      CategoryDesc: null,
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
      MinimumRatio: 1,
      MinimumSeedTime: 48 * 60 * 60,
      Size: 0,
      Seeders: 0,
      Gain: 0,
      FirstSeen: '0001-01-01T00:00:00',
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
            release.Link = new URL(value, baseUrl).toString();
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
          if (release.Peers === null) {
            release.Peers = release.Seeders;
          } else {
            release.Peers += release.Seeders;
          }
          break;
        case 'date':
          const date = fromUnknown(value);
          // "2019-01-28T13:35:49.064149+00:00"
          release.PublishDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx", {
            timeZone: 'Etc/UTC',
          });
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
        case 'minimumratio':
          release.MinimumRatio = Number(value);
          break;
        case 'minimumseedtime':
          release.MinimumSeedTime = Number(value);
          break;
        case 'downloadvolumefactor':
          release.DownloadVolumeFactor = Number(value);
          break;
        case 'uploadvolumefactor':
          release.UploadVolumeFactor = Number(value);
          break;
        case 'imdb':
          release.Imdb = Number(value);
          break;
        default:
          console.log(key);
        // throw new Error("I HAVE NO HANDLER. I CAN'T BE HANDLED");
      }
    }

    release.Peers = (release.Peers || -1) - (release.Seeders || 0);
    const sizeInGB = release.Size / 1024.0 / 1024.0 / 1024.0;
    release.Gain = release.Seeders * sizeInGB;
    release.CategoryDesc = mapTrackerCategory(release.Category, categories);
    return release;
  }
}

export interface ReleaseInfo {
  Tracker: string;
  TrackerId: string;
  Title: string;
  Guid: string | null;
  Link: string | null;
  Comments: string | null;
  PublishDate: string | null;
  Category: number[];
  Size: number;
  Gain: number;
  Files: number | null;
  Grabs: number | null;
  Description: string | null;
  RageID: number | null;
  TVDBId: number | null;
  Imdb: number | null;
  TMDb: number | null;
  Seeders: number;
  Peers: number | null;
  BannerUrl: string | null;
  InfoHash: string | null;
  MagnetUri: string | null;
  MinimumRatio: number;
  MinimumSeedTime: number;
  DownloadVolumeFactor?: number;
  UploadVolumeFactor?: number;
  BlackholeLink: string | null;
  CategoryDesc: string | null;
  /**
   * used in cached releases
   */
  FirstSeen: string;
}
