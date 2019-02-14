import fs from 'fs';
import path from 'path';
import nock from 'nock';
import tk from 'timekeeper';

import { getSearchResults } from '../src';
import { definition as pt99Incredible } from './html/pt99-incredible-2-2019';

describe('getSearchResults', () => {
  afterAll(() => {
    tk.reset();
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
    const first = results[0];
    expect(first.FirstSeen).toBe('0001-01-01T00:00:00');
    expect(first.Tracker).toBe('PT99');
    expect(first.TrackerId).toBe('pt99');
    expect(first.CategoryDesc).toBe('Movies');
    expect(first.BlackholeLink).toBe(null);
    expect(first.Title).toBe('The Incredible Monk III 2019 4K WEB-DL H265 AAC 2Audio-99TV');
    expect(first.Guid).toBe('https://pt.j99.info/details.php?id=1414&hit=1');
    // jackett protects links with its own auth thing
    expect(first.Link).toBe('https://pt.j99.info/download.php?id=1414&hit=1');
    expect(first.Comments).toBe('https://pt.j99.info/details.php?id=1414&hit=1');
    // for some reason jackett is not emitting the same date format for different parsers
    // expect(first.PublishDate).toBe('2019-02-07T00:10:09');
    expect(first.PublishDate).toBe('2019-02-07T00:10:09.000000+00:00');
    expect(first.Category).toEqual([2000, 100401]);
    expect(first.Size).toBeCloseTo(2662879744, -3);
    expect(first.Files).toBe(null);
    expect(first.Grabs).toBe(39);
    expect(first.Description).toBe(null);
    expect(first.RageID).toBe(null);
    expect(first.TVDBId).toBe(null);
    expect(first.Imdb).toBe(null);
    expect(first.TMDb).toBe(null);
    expect(first.Seeders).toBe(30);
    expect(first.Peers).toBe(0);
    expect(first.BannerUrl).toBe(null);
    expect(first.InfoHash).toBe(null);
    expect(first.MagnetUri).toBe(null);
    expect(first.MinimumRatio).toBe(1);
    expect(first.MinimumSeedTime).toBe(172800);
    expect(first.DownloadVolumeFactor).toBe(1);
    expect(first.UploadVolumeFactor).toBe(1);
    expect(first.Gain).toBeCloseTo(74.40000057220459);
    expect(scope.done()).toBe(true);
  });
});
