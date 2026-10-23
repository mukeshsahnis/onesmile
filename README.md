# One Smile Dental Care

A high-performance, SEO-first dental clinic website built with **Astro**, **Tailwind CSS v4**, and **DaisyUI v5**. Designed around topical authority, content relationships, and local SEO optimizations.

---

## 🚀 Tech Stack

- **Framework**: [Astro (v7)](https://astro.build/) - Ultra-fast static site generator.
- **Styling**: [Tailwind CSS (v4)](https://tailwindcss.com/) & [DaisyUI (v5)](https://daisyui.com/) - Responsive, CSS-first custom theme layout.
- **Transitions**: Astro's ClientRouter - Fluid client-side page routing.
- **SEO & Feeds**: `@astrojs/sitemap` (automated sitemaps) & `@astrojs/rss` (automated blog RSS feeds).
- **Content Management**: Astro Content Collections with strong **Zod** schema validations.

---

## 🛠️ Local Setup

Follow these steps to set up the project on your local machine:

### Prerequisites

Make sure you have Node.js installed:
- **Node.js**: `>=22.12.0`
- **npm**: `>=10.0.0`

### 1. Clone the Repository

```bash
git clone https://github.com/mukeshsahnis/onesmile.git
cd onesmile
```

### 2. Install Dependencies

Install the required packages:

```bash
npm install
```

### 3. Start the Development Server

Run the development server locally (usually mounts at `http://localhost:4321/`):

```bash
npm run dev
```

### 4. Build for Production

Compile a production-ready, highly optimized static build:

```bash
npm run build
```

### 5. Preview the Production Build

Serve your locally built `/dist` directory to test production behaviors (routing, transitions, sitemaps):

```bash
npm run preview
```

---

## 📂 Content Collections & Directory Structure

The website leverages Astro's **Content Layer API** to manage dynamic data models located under `src/content/`:

### 🦷 Services (`src/content/services/`)
Represents the 14 dental procedures. Each file is a Markdown (`.md`) file matching the schema defined in `src/content.config.ts`.
- **Key Fields**: `title`, `description` (SEO), `image`, `summary` (Excerpt), `order` (Sort position), `benefits` (List of strings), `faqs` (Structured questions/answers), and `relatedServices` (IDs of other services).
- **SEO Benefit**: Generates dynamic Schema.org `FAQPage` markup and `OfferCatalog` entries.

### ✍️ Blog (`src/content/blog/`)
Represents article guides written by clinical authors.
- **Key Fields**: `title`, `description`, `pubDate`, `heroImage`, `author`, `category`, `tags`, and `relatedServices` (IDs of services discussed in the post).
- **SEO Benefit**: Generates `BlogPosting` structured metadata and establishes bidirectional internal linking between guides and treatments.

---


## SEO redirects and validation

Legacy URLs and their equivalent current pages are mapped in
`src/legacy-redirects.mjs`. GitHub Pages serves static files, so Astro generates
zero-second HTML refresh redirects with destination canonical links, not HTTP
301 responses. Keep these files available for existing links and bookmarks.
Pages with no equivalent replacement (for example, removed account pages or
articles) should remain 404s rather than redirecting to unrelated content.

`npm run build` also runs `npm run check:seo`. This checks the generated
redirects, destination pages, canonical URLs, sitemap exclusions and internal
page links. Run it before deployment; `dist/` must exist when running the check
on its own.

The GitHub Pages workflow deploys pushes to `main`. After deployment:

1. Verify the old treatment URLs open their matching `/treatments/` pages.
2. Use Search Console URL Inspection on the final gum-treatment and
   crowns-and-bridges URLs, including a live test. Request indexing if appropriate.
3. Confirm important current URLs are indexed; the sitemap should contain the
   24 current pages, without legacy aliases.
4. Expect old aliases to be reported as redirects or excluded pages after
   recrawling. A zero-exclusion count is not the goal. Do not validate the entire
   404 group as fixed while intentionally removed URLs still return 404.

## 📄 License

This project is proprietary and built specifically for One Smile Dental Care. All assets, images, and content rights are reserved.

---
*Last deployed: July 2026*
