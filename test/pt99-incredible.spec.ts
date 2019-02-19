import fs from 'fs';
import path from 'path';
import nock from 'nock';
import tk from 'timekeeper';

import { Indexer } from '../src';
import { definition as pt99Incredible } from './html/pt99-incredible-2-2019';

describe('getSearchResults', () => {
  afterAll(() => {
    tk.reset();
  });

  it('should get incredible from pt99', async () => {
    const indexer = new Indexer({ site: 'pt99' });
    // override definition
    indexer.definition = pt99Incredible;
    const html = fs.readFileSync(
      path.join(__dirname, './html/pt99-incredible-2-2019.text'),
      'utf8',
    );
    const scope = nock('https://pt.j99.info/')
      .get('/torrents.php')
      .query({
        incldead: 0,
        spstate: 0,
        inclbookmarked: 0,
        search: 'Incredible',
        // eslint-disable-next-line @typescript-eslint/camelcase
        search_area: 0,
        // eslint-disable-next-line @typescript-eslint/camelcase
        search_mode: 0,
      })
      .reply(200, html);

    const results = await indexer.getSearchResults('Incredible', []);
    const first = results[0];

    expect(first.FirstSeen).toBe('0001-01-01T00:00:00');
    expect(first.Tracker).toBe('PT99');
    expect(first.TrackerId).toBe('pt99');
    expect(first.CategoryDesc).toBe('Movies');
    expect(first.BlackholeLink).toBe(null);
    expect(first.Title).toBe('The Incredible Hulk (1080p HD) m4v H264 AAC');
    expect(first.Guid).toBe('https://pt.j99.info/details.php?id=1545&hit=1');
    // jackett protects links with its own auth thing
    expect(first.Link).toBe('https://pt.j99.info/download.php?id=1545&hit=1');
    expect(first.Comments).toBe('https://pt.j99.info/details.php?id=1545&hit=1');
    // expect(first.PublishDate).toBe('2019-02-16T17:00:28');
    // whatever format jackett is using is bad
    expect(first.PublishDate).toBe('2019-02-16T17:00:28.000Z');
    expect(first.Category).toEqual([2000, 100401]);
    // expect(first.Size).toBe(4262755072);
    // js rounding error
    expect(first.Size).toBe(4262755041);
    expect(first.Files).toBe(null);
    expect(first.Grabs).toBe(8);
    expect(first.Description).toBe(null);
    expect(first.RageID).toBe(null);
    expect(first.TVDBId).toBe(null);
    expect(first.Imdb).toBe(null);
    expect(first.TMDb).toBe(null);
    expect(first.Seeders).toBe(6);
    expect(first.Peers).toBe(0);
    expect(first.BannerUrl).toBe(null);
    expect(first.InfoHash).toBe(null);
    expect(first.MagnetUri).toBe(null);
    expect(first.MinimumRatio).toBe(1);
    expect(first.MinimumSeedTime).toBe(172800);
    expect(first.DownloadVolumeFactor).toBe(0.3);
    expect(first.UploadVolumeFactor).toBe(1);
    expect(first.Gain).toBeCloseTo(23.820000171661377, -3);
    expect(scope.isDone()).toBe(true);
  });
});
