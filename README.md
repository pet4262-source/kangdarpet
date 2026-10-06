# KANGDARPET B2B product console

A **B2B-only** Next.js product console for www.kangdarpet.com. It manages a synchronized wholesale product catalog, product-page inquiries and product media. It intentionally does **not** implement a cart, orders, checkout or payment flow.

## What is included

- Alibaba-style seller workspace at `/admin/products`: overview counts, search, category/status filters, SKU and slug uniqueness, full product editor, MOQ, material/size, custom attributes, option groups, cover selection and ordered multi-image galleries.
- **Draft / Published** state. Published products are read dynamically by `/products` and `/products/[slug]`; drafts are completely omitted from public catalog responses and pages.
- 48 products and 6 categories are initialized from `data/homepage-baseline.json` (`catalog.items` and `products.items`). The seed is never reduced to the older one-product repository data.
- Vercel Blob persistence: every catalog save writes a unique immutable JSON version under `kangdarpet/catalog/versions/` in production, or `kangdarpet/preview/catalog/versions/` in preview/local. Reads list and fetch the newest version with `no-store`. Revision locks and expected revisions return a conflict rather than silently overwriting another editor.
- Admin-authorized browser-to-Blob product and homepage image upload, MIME/6 MB validation, and immutable Blob image paths; the file does not pass through a size-limited Vercel Function.
- Homepage CMS at `/admin/homepage`: server-authorized public content editing for all homepage sections, including six category cards and their multi-image/video media. It writes homepage-only content and deliberately never reads or saves the B2B product catalog.
- Product-page inquiry forms with server-side input validation, timing/honeypot anti-spam checks and a non-reversible IP fingerprint. Buyer records are AES-GCM encrypted before Blob persistence and are visible only through `/admin/inquiries`.
- Password login backed by `ADMIN_PASSWORD`, timing-safe server comparison, and signed `HttpOnly` cookies. There is no browser password, `localStorage` admin flag, or static admin token.

## Environment variables

Set these **only in Vercel project environment settings** (and in an untracked local `.env.local` if required):

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_...
ADMIN_PASSWORD=use-a-long-unique-password
INQUIRY_ENCRYPTION_KEY=base64url-encoded-32-random-bytes
```

Do not commit or print any value. `INQUIRY_ENCRYPTION_KEY` is an independent, high-entropy **base64url-encoded 32-byte key**; it must not reuse or be derived from `ADMIN_PASSWORD`. It encrypts inquiry records and keys their IP-fingerprint rate limiter. Without `BLOB_READ_WRITE_TOKEN`, local development/preview serves the checked-in 48-product seed in **read-only mode**; production instead reports the public catalog unavailable so an accidentally missing token cannot republish formerly hidden products. Admin mutations, uploads and inquiries return an explicit unavailable error rather than pretending to save.

`ADMIN_PASSWORD` must be set to use `/admin/login`. In HTTPS preview/production, the session cookie is `Secure`, `HttpOnly`, and `SameSite=None`; local HTTP uses `SameSite=Lax` for development.

`INQUIRY_ENCRYPTION_KEY` is required in each Vercel Preview and Production environment where inquiries are enabled. If it is missing or malformed, inquiry writes return **503**; if it cannot decrypt a record, the administrator inquiry API returns an explicit **503 unavailable** response rather than silently showing an empty list. New records include encryption `version` and `keyId` fields. **Do not rotate or delete this key without first decrypting and re-encrypting historical inquiries**; there are no pre-existing production records using this new format, so the first launch needs no migration.

## Run and verify

```bash
npm install
npm run dev
# visit http://localhost:3000/admin/login
npm run typecheck
npm test
npm run build
```

The preview route declaration is `public/manus-routes.json`.

## Change homepage images from your computer

1. Sign in at `/admin/login` and open **Homepage CMS** (`/admin/homepage`).
2. Choose **Hero 主视觉** for the main banner, **产品分类与媒体** for category covers or extra images, or the **OEM & ODM**, **工厂数据**, or **关于我们** section for those pictures.
3. Select a JPEG, PNG, WebP or AVIF file under 6 MB with the adjacent **从电脑上传** control. The uploaded image URL and preview appear in the editor; the public homepage has **not** changed yet.
4. Click **保存首页** to publish the new image, then use **查看首页** to confirm. Uploading a file without saving the homepage leaves the current public image untouched.

## Operations / migration notes

1. Deploying this branch for the first time with Blob configured reads the environment-specific catalog prefix. If it is empty, it serves the latest checked-in baseline; the first catalog save creates the initial persistent version. Preview/local catalog, inquiry, inquiry-rate-limit, product-image, and homepage-image paths have separate prefixes and cannot appear in production. Administrator clients obtain the product prefix from authenticated `GET /api/admin/uploads` or the homepage prefix from `GET /api/admin/uploads?kind=homepage` before requesting an upload token.
2. Homepage CMS production content uses immutable `cms/homepage-<timestamp>-<uuid>.json` versions. With `VERCEL_ENV=production`, reads and writes use that live prefix. In preview/local, reads prioritize `cms-preview/homepage-*`, then may show the newest production version as an initial display; **all preview/local saves write only `cms-preview/homepage-*`**. This is intentional because the same Blob token may be configured for production and preview.
3. With no `BLOB_READ_WRITE_TOKEN`, homepage CMS is explicitly read-only and serves `data/homepage-baseline.json`; it never reports a successful save. Blob versions use the Vercel-supported minimum cache lifetime (60 seconds), while application reads fetch the selected immutable URL with `no-store`.
4. Before production deployment, verify the protected preview, all 48 product image paths, homepage category media, and the original admin login. Preview edits are isolated; production still requires its own final verification.
5. The historic extracted CMS is useful as a reference only. Its old local-file homepage editor is **not** treated as a production data source; the checked-in baseline is the fallback and live production homepage content is read from the existing Blob versions.
6. Blob listing is bounded defensively in code. At very high catalog-version volume, add a reviewed compaction/retention job; never replace immutable versions with a cached fixed URL.

## Security boundaries

- All admin APIs verify the signed session on the server. Every state-changing administrator endpoint (login/logout, catalog writes, homepage writes, and upload-token issuance) also requires an exact server-side `Origin`/`Host` match. This rejects missing Origin and cross-site CORS-simple `text/plain` requests; it is not dependent on CORS.
- The Vercel Blob upload-completion callback remains exempt from browser Origin checks because the SDK verifies its signed callback.
- Public inquiries also require a same-origin browser request and have a durable Blob unique-slot limiter of **3 submissions per IP fingerprint per 10 minutes**, in addition to validation, timing, and honeypot checks. Rate-limit reservations are released if the inquiry record write fails.
- Inquiry encryption is AES-256-GCM using only `INQUIRY_ENCRYPTION_KEY`, never `ADMIN_PASSWORD`; the encrypted envelope carries an encryption version and key ID. The independent key is mandatory for inquiry persistence and administrative reads.
- Public catalog API sends only published products.
- Inquiry API does not return inquiries or administrator details.
- Uploaded media is public product/homepage imagery by design. Do not upload buyer files, contracts, or secrets.
