import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registers change detection, routing, HTTP, and PrimeNG providers', () => {
    expect(appConfig.providers).toHaveLength(4);
  });
});
