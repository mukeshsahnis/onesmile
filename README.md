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

## 🤝 Contributing

We welcome contributions to improve One Smile Dental Care! To contribute:

1. **Create a Branch**: Create a descriptive branch name (e.g., `feature/add-contact-tests` or `fix/nav-spacing`).
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit Changes**: Use clean, descriptive commit messages.
   ```bash
   git commit -m "Add new blog post about teeth whitening safety"
   ```
3. **Verify Build**: Ensure the project compiles cleanly without TypeScript or Astro errors:
   ```bash
   npm run build
   ```
4. **Push & Open a Pull Request**: Push your branch and request a review.
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 📄 License

This project is proprietary and built specifically for One Smile Dental Care. All assets, images, and content rights are reserved.
