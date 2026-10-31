import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchGoogleReviews, loadGoogleReviews } from '../src/lib/google-reviews.mjs';

const env = { GOOGLE_REVIEWS_ENABLED: 'true', GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-secret',
  GOOGLE_REFRESH_TOKEN: 'test-refresh', GOOGLE_BUSINESS_LOCATION: 'accounts/123/locations/456' };
const review = (n, extra = {}) => ({ reviewId: String(n), createTime: `2026-10-${String(n).padStart(2, '0')}T12:00:00Z`,
  starRating: n === 12 ? 'ONE' : 'FIVE', reviewer: { displayName: `Person ${n}` }, comment: `Review ${n}`, ...extra });
const json = data => ({ ok: true, json: async () => data });

test('paginates and selects newest posted reviews, not recently edited reviews or only positive ones', async () => {
  let calls = 0;
  const result = await fetchGoogleReviews(env, async (url, options) => {
    calls++;
    if (calls === 1) {
      assert.equal(String(url), 'https://oauth2.googleapis.com/token');
      assert.equal(options.body.get('grant_type'), 'refresh_token');
      return json({ access_token: 'test-access' });
    }
    assert.equal(options.headers.Authorization, 'Bearer test-access');
    assert.equal(url.searchParams.get('orderBy'), 'updateTime desc');
    if (calls === 2) return json({ reviews: [review(1), review(2)], averageRating: 4.5, totalReviewCount: 12, nextPageToken: 'second' });
    assert.equal(url.searchParams.get('pageToken'), 'second');
    return json({ reviews: Array.from({ length: 10 }, (_, i) => review(i + 3)) });
  });
  assert.equal(calls, 3);
  assert.equal(result.reviews.length, 10);
  assert.equal(result.reviews[0].name, 'Person 12');
  assert.equal(result.reviews[0].rating, 1);
  assert.equal(result.reviews.at(-1).name, 'Person 3');
  assert.equal(result.averageRating, 4.5);
  assert.ok(!JSON.stringify(result).includes('test-access'));
});

test('handles anonymous and rating-only reviews without injecting an avatar URL', async () => {
  let calls = 0;
  const result = await fetchGoogleReviews(env, async () => ++calls === 1 ? json({ access_token: 'token' }) : json({
    averageRating: 5, totalReviewCount: 1, reviews: [review(1, { comment: undefined,
      reviewer: { isAnonymous: true, displayName: 'Hidden', profilePhotoUrl: 'javascript:alert(1)' } })],
  }));
  assert.equal(result.reviews[0].name, 'Google user');
  assert.equal(result.reviews[0].text, '');
  assert.equal(result.reviews[0].avatar, null);
});

test('disabled integration makes no network requests', async () => {
  assert.equal(await loadGoogleReviews({}, () => { throw Error('Must not fetch'); }), null);
});

test('failed or incomplete fetch falls back without leaking credential or response data', async () => {
  const warnings = [];
  const result = await loadGoogleReviews(env, async () => { throw Error('test-secret'); }, message => warnings.push(message));
  assert.equal(result, null);
  assert.equal(warnings.length, 1);
  assert.ok(!warnings[0].includes('test-secret'));
});

test('rejects invalid location names before sending credentials', async () => {
  await assert.rejects(fetchGoogleReviews({ ...env, GOOGLE_BUSINESS_LOCATION: '../elsewhere' }, () => { throw Error('Must not fetch'); }), /must be accounts/);
});

test('does not silently display partial results when pagination repeats', async () => {
  let calls = 0;
  await assert.rejects(fetchGoogleReviews(env, async () => ++calls === 1 ? json({ access_token: 'token' }) : json({
    reviews: [review(1)], averageRating: 5, totalReviewCount: 100, nextPageToken: 'repeat',
  })), /pagination/);
});
