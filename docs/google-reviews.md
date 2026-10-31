# Automatic Google reviews

The homepage fetches reviews at build time using the owner's Google Business
Profile API access. It follows every results page, sorts by original `createTime`
(the API only sorts by update time), and displays up to 10 newest reviews,
including low ratings and rating-only reviews. Dates, overall rating and count
come from Google. Review text is escaped by Astro, never rendered as HTML.

No API credentials, refresh tokens, owner replies or raw API responses are
written into the website or Git. There is no scraping, review reply automation,
paid Maps API, or runtime Google Cloud server.

## One-time activation

1. In a Google Cloud project owned by the clinic, request Business Profile API
   access and wait for approval. Use the Google account that manages the verified
   clinic. Enable the Google My Business API, Account Management API, and Business
   Information API as needed.
2. Configure Google's OAuth consent screen and an OAuth client. Authorize the
   owner account for `https://www.googleapis.com/auth/business.manage` with offline
   access to obtain a refresh token. This Google scope grants management access;
   this integration only calls review-list endpoints. Do not post credentials in
   chat, Git, or screenshots. Google OAuth Playground can be used with your own
   OAuth client; register its callback as instructed by Google. An external app
   in Testing typically has short-lived refresh tokens; complete the appropriate
   publishing/verification setup for durable operation.
3. Use Account Management `accounts.list` and Business Information
   `accounts.locations.list` to find the clinic's API account and location IDs.
   Set the full resource name `accounts/ACCOUNT_ID/locations/LOCATION_ID`.
   Do not substitute the public Maps CID or the Business Profile UI ID.
4. Under GitHub repository Settings → Secrets and variables → Actions, add:

   | Secret | Value |
   | --- | --- |
   | `GOOGLE_CLIENT_ID` | Your OAuth client ID |
   | `GOOGLE_CLIENT_SECRET` | Your OAuth client secret |
   | `GOOGLE_REFRESH_TOKEN` | Owner-authorized offline refresh token |
   | `GOOGLE_BUSINESS_LOCATION` | `accounts/ACCOUNT_ID/locations/LOCATION_ID` |

5. Add the repository **variable** `GOOGLE_REVIEWS_ENABLED` with value `true`.
6. Once the code is approved and deployed, run the existing Deploy to GitHub Pages
   workflow manually. Verify the carousel, dates, rating and count on the live
   homepage. The workflow will then refresh daily around 06:47 IST (GitHub may
   delay scheduled jobs). It does not commit review data.

Creating OAuth access and storing credentials require the owner's authorization.
Activation completed on 31 October 2026: the clinic project has API approval,
the required APIs are enabled, the OAuth app is in production mode, owner
authorization is complete, and the four encrypted repository secrets and enabled
build variable are configured. A live fetch returned 147 reviews and selected the
10 newest by posting date. Public app disclosures are
available at `/reviews-privacy/` and `/reviews-terms/`.

## Local use

Copy `.env.reviews.example` to `.env` (ignored by Git), enter the values locally,
and run `node --env-file=.env --run build`. Ordinary `npm run build` uses exported
shell variables; without activation it builds a Google reviews link only.
Run `npm run test:reviews` for the credential-free mock tests.

## Failure, retention and disabling

On an API error, invalid response, missing credentials or incomplete pagination,
the new build publishes a link to the Google listing rather than a partial or
stale carousel. The log contains a generic warning, never API responses or tokens.
No local review cache is retained. If the entire build/deployment fails, the
previous site remains live, so monitor GitHub Actions failures.

Google limits temporary API content storage to 30 days. Keep daily refreshes
running; if stopping the integration or if deployments remain broken, remove the
review content from the live site within that limit. To disable, set the variable
to `false` and manually deploy; simply stopping the workflow does not remove
previously published reviews. Do not add generated review HTML/data to Git or
long-lived backups. Review applicable Google terms before activation.

This feature keeps testimonials current; it does not promise improved rankings.

## Official references

- [API access prerequisites](https://developers.google.com/my-business/content/prereqs)
- [OAuth setup](https://developers.google.com/my-business/content/basic-setup)
- [Review pagination and sorting](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list)
- [Content storage policies](https://developers.google.com/my-business/content/policies)
