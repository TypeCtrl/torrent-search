import fs from 'fs';
import path from 'path';
import nock from 'nock';

import { getDefinition, getSearchResults } from '../src';
import { definition as eztvTrueDetective } from './html/eztv-true-detective-1-2019';
import { definition as pt99Incredible } from './html/pt99-incredible-2-2019';

describe('getSearchResults', () => {
  it('should get true detective from eztv', async () => {
    const definition = eztvTrueDetective;
    const html = fs.readFileSync(
      path.join(__dirname, `./html/eztv-true-detective-1-2019.text`),
      'utf8',
    );
    const scope = nock('https://eztv.io/')
      .get('/search/True%20Detective')
      .reply(200, html);
    const results = await getSearchResults(definition, 'True Detective', []);
    expect(results).toHaveLength(47);
    const first = results[0];
    expect(first.Tracker).toBe('EZTV');
    expect(first.TrackerId).toBe('eztv');
    expect(first.CategoryDesc).toBe('TV');
    expect(first.BlackholeLink).toBe(null);
    expect(first.Title).toBe('True Detective S03E04 480p x264-mSD');
    expect(first.FirstSeen).toBe('0001-01-01T00:00:00');
    expect(first.Guid).toBe('https://eztv.io/ep/1306548/true-detective-s03e04-480p-x264-msd/');
    expect(first.Link).toBe(null);
    expect(first.Comments).toBe('https://eztv.io/ep/1306548/true-detective-s03e04-480p-x264-msd/');
    // ignore date for now
    // expect(first.PublishDate).toBe('2019-01-28T13:35:49.064149+00:00');
    expect(first.Category).toEqual([5000, 100001]);
    expect(first.Size).toBe(219162869);
    expect(first.Files).toBe(null);
    expect(first.Grabs).toBe(null);
    expect(first.Description).toBe(null);
    expect(first.RageID).toBe(null);
    expect(first.TVDBId).toBe(null);
    expect(first.Imdb).toBe(null);
    expect(first.BannerUrl).toBe(null);
    expect(first.InfoHash).toBe(null);
    expect(first.Seeders).toBe(238);
    expect(first.Peers).toBe(0);
    expect(first.MinimumRatio).toBe(1);
    expect(first.MinimumSeedTime).toBe(172800);
    expect(first.DownloadVolumeFactor).toBe(0);
    // Gain: 48.57849481701851, js rounding error
    expect(first.Gain).toBeGreaterThan(48);
    expect(first.MagnetUri).toBe(
      'magnet:?xt=urn:btih:fc6ba4a92feb6cfaf3625fa5ecc1495d30007fc1&dn=True.Detective.S03E04.480p.x264-mSD%5Beztv%5D.mkv%5Beztv%5D&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A80&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969',
    );
    scope.done();
  });

  it('should get incredible from pt99', async () => {
    const definition = pt99Incredible;
    const html = fs.readFileSync(
      path.join(__dirname, `./html/pt99-incredible-2-2019.text`),
      'utf8',
    );
    const scope = nock('https://pt.j99.info/')
      .get('/torrents.php')
      .query({
        incldead: 0,
        spstate: 0,
        inclbookmarked: 0,
        search: 'Incredible',
        search_area: 0,
        search_mode: 0,
      })
      .reply(200, html);
    const results = await getSearchResults(definition, 'Incredible', []);
    expect(results).toEqual({
      FirstSeen: '0001-01-01T00:00:00',
      Tracker: 'PT99',
      TrackerId: 'pt99',
      CategoryDesc: 'Movies',
      BlackholeLink: null,
      Title: 'The Incredible Monk III 2019 4K WEB-DL H265 AAC 2Audio-99TV',
      Guid: 'https://pt.j99.info/details.php?id=1414&hit=1',
      Link:
        'http://localhost:32769/dl/pt99/?jackett_apikey=6i5cjkkyze5as7fdkhkhqa0b4g5gvf3y&path=Q2ZESjhHLTZmWTZBS2pwTXBhWFE4UmxlaFQtQVZ6YzNvR1FJQUtuUDExQlZJNy00SC1XVVk1Y0lSZzkzM29RUDdENGxQUzNFRWpXSHBWQzExMXZvZjUxR2VackdvOEFWSTEyQWJvazJxcHJ2a005eDRidDBSSFB3UmliZnNKM0FkMWs5cDNxbTlRY2FCOFg5V3NoYUFhYlNURGw4YjV5RFd0SHI3aHNkNmlMSkduSFc&file=The+Incredible+Monk+III+2019+4K+WEB-DL+H265+AAC+2Audio-99TV',
      Comments: 'https://pt.j99.info/details.php?id=1414&hit=1',
      PublishDate: '2019-02-07T00:10:09',
      Category: [2000, 100401],
      Size: 2662879744,
      Files: null,
      Grabs: 39,
      Description: null,
      RageID: null,
      TVDBId: null,
      Imdb: null,
      TMDb: null,
      Seeders: 30,
      Peers: 0,
      BannerUrl: null,
      InfoHash: null,
      MagnetUri: null,
      MinimumRatio: 1,
      MinimumSeedTime: 172800,
      DownloadVolumeFactor: 1,
      UploadVolumeFactor: 1,
      Gain: 74.40000057220459,
    });
    expect(scope.done()).toBe(true);
  });
});

describe('getDefinition', () => {
  it('should get definition', () => {
    expect(getDefinition('eztv')).toBeTruthy();
  });
});
