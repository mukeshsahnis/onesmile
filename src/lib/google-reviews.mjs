// Build-time only. Never import this module from a browser script.
export const GOOGLE_REVIEWS_URL = 'https://www.google.com/maps?cid=11247058903890459605';
const stars = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GOOGLE_BUSINESS_LOCATION'];

async function requestJson(fetcher, url, options = {}) {
  const response = await fetcher(url, { ...options, signal: AbortSignal.timeout(20000) });
  // Do not log response bodies: OAuth errors can contain sensitive information.
  if (!response.ok) throw new Error(`Google request failed (HTTP ${response.status})`);
  return response.json();
}

export async function fetchGoogleReviews(env = process.env, fetcher = fetch) {
  if (!required.every(key => env[key])) throw new Error('Google review credentials are incomplete');
  const parent = env.GOOGLE_BUSINESS_LOCATION;
  if (!/^accounts\/\d+\/locations\/\d+$/.test(parent)) {
    throw new Error('GOOGLE_BUSINESS_LOCATION must be accounts/ACCOUNT_ID/locations/LOCATION_ID');
  }
  const token = await requestJson(fetcher, 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' }),
  });
  if (typeof token.access_token !== 'string' || !token.access_token) throw new Error('Google returned no access token');

  const reviews = new Map();
  const seenTokens = new Set();
  let pageToken;
  let averageRating;
  let totalReviewCount;
  for (let page = 0; page < 100; page++) {
    const url = new URL(`https://mybusiness.googleapis.com/v4/${parent}/reviews`);
    url.searchParams.set('pageSize', '50');
    url.searchParams.set('orderBy', 'updateTime desc');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const data = await requestJson(fetcher, url, { headers: { Authorization: `Bearer ${token.access_token}` } });
    if (page === 0) {
      averageRating = data.averageRating;
      totalReviewCount = data.totalReviewCount;
      if (!Number.isInteger(totalReviewCount) || totalReviewCount < 0 ||
          (totalReviewCount > 0 && (!Number.isFinite(averageRating) || averageRating < 1 || averageRating > 5))) {
        throw new Error('Invalid Google review totals');
      }
    }
    if (data.reviews !== undefined && !Array.isArray(data.reviews)) throw new Error('Invalid Google review list');
    for (const review of data.reviews ?? []) {
      if (!review.reviewId || !stars[review.starRating] || !Number.isFinite(Date.parse(review.createTime))) {
        throw new Error('Invalid Google review');
      }
      reviews.set(review.reviewId, review);
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
    if (seenTokens.has(pageToken) || page === 99) throw new Error('Google review pagination did not complete');
    seenTokens.add(pageToken);
  }
  if (totalReviewCount > 0 && reviews.size === 0) throw new Error('Google returned no reviews');
  return {
    fetchedAt: new Date().toISOString(), averageRating, totalReviewCount,
    reviews: [...reviews.values()]
      .sort((a, b) => Date.parse(b.createTime) - Date.parse(a.createTime) || a.reviewId.localeCompare(b.reviewId))
      .slice(0, 10).map(review => ({
        name: review.reviewer?.isAnonymous ? 'Google user' : (review.reviewer?.displayName || 'Google user'),
        rating: stars[review.starRating],
        text: typeof review.comment === 'string' ? review.comment : '',
        date: new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' }).format(new Date(review.createTime)),
        createdAt: review.createTime,
        // Render Google-provided profile photos only from Google's image host.
        avatar: /^https:\/\/lh\d+\.googleusercontent\.com\//.test(review.reviewer?.profilePhotoUrl ?? '')
          ? review.reviewer.profilePhotoUrl : null,
      })),
  };
}

export async function loadGoogleReviews(env = process.env, fetcher = fetch, warn = console.warn) {
  if (env.GOOGLE_REVIEWS_ENABLED !== 'true') return null;
  try {
    return await fetchGoogleReviews(env, fetcher);
  } catch {
    // A failed refresh must not leave stale reviews embedded in a new deployment.
    warn('Google reviews unavailable; displaying the Google reviews link instead. Check API approval and OAuth credentials.');
    return null;
  }
}
