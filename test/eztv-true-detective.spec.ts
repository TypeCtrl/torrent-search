import fs from 'fs';
import nock from 'nock';
import path from 'path';
import tk from 'timekeeper';

import { Indexer } from '../src';
import { definition as eztvTrueDetective } from './html/eztv-true-detective-1-2019';
import { subHours, subMinutes } from 'date-fns';

describe('getSearchResults', () => {
  afterAll(() => {
    tk.reset();
  });

  it('should get true detective from eztv', async () => {
    tk.freeze('2019-01-29T15:34:49.064Z');
    const indexer = new Indexer({ site: 'eztv' });
    // override definition
    indexer.definition = eztvTrueDetective;
    const html = fs.readFileSync(
      path.join(__dirname, `./html/eztv-true-detective-1-2019.text`),
      'utf8',
    );
    const scope = nock('https://eztv.io/')
      .get('/search/True%20Detective')
      .reply(200, html);
    const results = await indexer.getSearchResults('True Detective', []);
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
    // expect(first.PublishDate).toBe('2019-01-28T13:35:49.064000+00:00');
    // should be 17h 59m ago
    expect(first.PublishDate).toBe(subMinutes(subHours(new Date(), 17), 59).toISOString());
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
});

