import got, { GotOptions, Response } from 'got';
import { CookieJar } from 'tough-cookie';
import uaString from 'ua-string';

import { catchCloudflare } from '@ctrl/cloudflare';
import { parse as golangParse } from '@ctrl/golang-template';
import { definitions, TrackerDefinition } from '@ctrl/tracker-definitions';

import { parseSearchResults } from './parse';

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

async function getSearchResults(definition: TrackerDefinition, q: string) {
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

  const responses: any[] = [];
  for (const searchPath of search.paths) {
    let path = golangParse(searchPath.path, { Config: config, Keywords: q });
    console.log(searchPath.path);
    path = path.startsWith('/') ? path : '/' + path;
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
    console.log(page.body);
    responses.push(parseSearchResults(search.fields, page.body));
  }

  // flatten
  return [].concat(...responses);
}
