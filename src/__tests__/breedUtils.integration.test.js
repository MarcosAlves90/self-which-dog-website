/* global process */
import { describe, it } from 'vitest';
import { fetchArtworkByApi } from '../utils/breedUtils';
import { breeds } from '../utils/breeds';

// Integration tests that hit the dog.ceo API. These are skipped unless
// RUN_INTEGRATION_TESTS=1 is set in the environment to avoid flakiness in CI.
const runIntegration = Boolean(process.env.RUN_INTEGRATION_TESTS);

describe('integration: fetchArtworkByApi', () => {
  if (!runIntegration) {
    it.skip('skipped integration tests (set RUN_INTEGRATION_TESTS=1 to run)', () => {});
    return;
  }

  for (const [name, profile] of Object.entries(breeds)) {
    it(`${name} should have an image`, async () => {
      const api = profile.api || name.toLowerCase().replace(/ /g, '-');
      const data = await fetchArtworkByApi(api);
      if (!data || !data.message) throw new Error(`No image for ${name} (api: ${api})`);
      if (typeof data.message !== 'string') throw new Error(`Unexpected payload for ${name}`);
    }, { timeout: 30_000 });
  }
});
