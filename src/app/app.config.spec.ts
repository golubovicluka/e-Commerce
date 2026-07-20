import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registers change detection, routing, and HTTP providers', () => {
    expect(appConfig.providers).toHaveLength(3);
  });
});
