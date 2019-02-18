import { getDefinition } from '../src/definition';

describe('getDefinition', () => {
  it('should get definition', () => {
    expect(getDefinition('eztv')).toBeTruthy();
  });
});
