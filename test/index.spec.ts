import fs from 'fs';
import path from 'path';
import nock from 'nock';

import { getDefinition, finalizeFields, getSearchResults } from '../src';
import { parseSearchResults } from '../src/parse';
import { definition as eztvTrueDetective } from './html/eztv-true-detective-1-2018';

describe('torrent-search', () => {
  test('should pass', async () => {
    const definition = eztvTrueDetective;
    const search = definition.search;
    const html = fs.readFileSync(
      path.join(__dirname, `./html/eztv_true_detective_1_2018.text`),
      'utf8',
    );
    const scope = nock('https://eztv.io/')
      .get('/search/True%20Detective')
      .reply(200, html);
    const results = await getSearchResults(definition, 'True Detective');
    // const results = parseSearchResults(search.rows, search.fields, html);
    // console.log(results);
    expect(results).toHaveLength(47);
    expect(results[0]).toEqual({
      FirstSeen: '0001-01-01T00:00:00',
      Tracker: 'EZTV',
      TrackerId: 'eztv',
      CategoryDesc: 'TV',
      BlackholeLink: null,
      Title: 'True Detective S03E04 480p x264-mSD',
      Guid: 'https://eztv.io/ep/1306548/true-detective-s03e04-480p-x264-msd/',
      Link: null,
      Comments: 'https://eztv.io/ep/1306548/true-detective-s03e04-480p-x264-msd/',
      PublishDate: '2019-01-28T13:35:49.064149+00:00',
      Category: [5000, 100001],
      Size: 219162869,
      Files: null,
      Grabs: null,
      Description: null,
      RageID: null,
      TVDBId: null,
      Imdb: null,
      TMDb: null,
      Seeders: 238,
      Peers: 0,
      BannerUrl: null,
      InfoHash: null,
      MagnetUri:
        'magnet:?xt=urn:btih:fc6ba4a92feb6cfaf3625fa5ecc1495d30007fc1&dn=True.Detective.S03E04.480p.x264-mSD%5Beztv%5D.mkv%5Beztv%5D&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A80&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969',
      MinimumRatio: 1,
      MinimumSeedTime: 172800,
      DownloadVolumeFactor: 0,
      UploadVolumeFactor: 1,
      Gain: 48.57849481701851,
    });
  });
});

describe('getDefinition', () => {
  it('should get definition', () => {
    expect(getDefinition('eztv')).toBeTruthy();
  });
});
