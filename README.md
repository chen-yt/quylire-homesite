# QUYLIRE brand website

An English-language flow-meter brand website for visitors in the United States and Canada, including business buyers and visitors coming from Amazon. The orange/yellow palette, condensed headlines, circular motifs, and “Flow You Can Trust” tagline follow the brand-store screenshot supplied by the user. No prices, checkout, tracking scripts, or customer-account system.

## Development

Requires Node.js 22.12+ (verified with 24.19.0) and npm. Use this existing checkout; cloud tasks are already isolated, so do not create a Git worktree unless explicitly requested.

```sh
cd /workspace/quylire-homesite
npm ci --cache /tmp/quylire-npm-cache
npm run dev -- --port 5173 --strictPort
```

For a production build and local production smoke test:

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

`dist/` is a static site that can be hosted on a static hosting provider. The development server is not a production deployment. No secret or environment variable is required to build or run it.

## GitHub Pages deployment

The `.github/workflows/deploy-pages.yml` workflow builds and deploys `main` automatically. It can also be run manually from the repository's Actions tab. No SSH server, deployment key, or custom token is required; the deployment uses GitHub's built-in token and OIDC.

One-time repository setting: open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**. If a run failed before Pages was enabled, rerun it or select **Actions → Deploy QUYLIRE to GitHub Pages → Run workflow** after enabling it. The repository must be eligible for Pages under its GitHub plan and organization policy.

The expected default address is `https://chen-yt.github.io/quylire-homesite/`. This address is not proof of a successful deployment; confirm the workflow succeeds and check the URL shown by GitHub Pages. The workflow reads the configured Pages base path so Vite generates the correct asset URLs for a project site or a future custom domain. Configure a custom domain in Pages settings separately; this workflow does not change DNS.

To verify the project-path build locally:

```sh
npm run build -- --base /quylire-homesite/
npm run preview -- --port 4173 --strictPort --base /quylire-homesite/
```

Then check the page and its assets under `/quylire-homesite/`. The regular `npm run build && npm test` commands continue to validate the root-path build.

## Browser verification

```sh
npm run build
npm test
```

Tests use the cloud environment's `/usr/bin/chromium`. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to your browser's path on another machine. The test runner starts the production preview itself. The 14 checks cover responsive layouts, mobile navigation, inquiry topics, required-field validation, encoded email drafts, copying, Amazon links, privacy, no-JavaScript form safety, product filters, product details, image loading, and preserving selected products in inquiries. They do not send email or verify the recipient mailbox.

## Content and contact behavior

- `index.html`: page structure and English copy; includes the supplied Amazon brand-store URL and `contact@quylire.com`.
- `src/style.css`: responsive visual system. Colors are defined at the top.
- `src/typography.css`: self-hosted Manrope and Oswald variable fonts from Fontsource (SIL Open Font License); no external font-service requests.
- `src/catalog.js`: local product catalog, family filters, product detail dialog, and selection for inquiries. The screenshot supplies the family names and connection-size labels: aluminum alloy (3/4, 1, 1.5, 2, 3 inches, with the 1-inch model shown in the featured banner), stainless steel (3/4, 1, 2 inches), garden water, and camlock (2, 3 inches). No model/SKU numbers, flow ranges, accuracy, pressure/temperature limits, or certifications are inferred.
- `src/main.js`: mobile menu, local inquiry form, clipboard, and privacy dialog.
- `src/inquiry.js`: locally creates an encoded `mailto:` draft. There is no email API or backend. Visitors must send the email in their own email app. A copy-inquiry fallback is provided. Visitors' form data is not persisted by the website.
- `public/images/`: four AI-generated illustrative product renders based on the user's screenshot, optimized to transparent WebP. They are explicitly labeled as illustrations on the page and in alt text; the same family image is reused for size options and does not document size-specific geometry. Replace with approved, model-specific product photographs before treating them as a definitive catalog.
- `public/favicon.svg`: provisional monogram. The text wordmark remains provisional pending the original logo.

The screenshot is the reference for visual direction, family names, and shown size options. Product details link directly to an inquiry without overwriting the visitor's message. A selected product is visible in the form, can be cleared, and is included in the email draft. Technical specifications, certifications, company-history claims, and manuals remain pending. The screenshot's “IP68” wording has not been generalized to all models or presented as an independently verified certification.

## Before public launch

1. Replace the provisional wordmark with the approved logo and brand assets.
2. Replace generated illustrations with original product photographs and confirm model names, connection standards, specifications, application limits, and any approved manuals. The current detail dialogs show only the family and size information available from the screenshot.
3. Review the English copy and privacy notice, verify the Amazon store opens, and confirm `contact@quylire.com` can receive mail. Amazon's live page was blocked by the onboarding network policy; the user-supplied screenshot is the design reference.
4. If a direct form submission is wanted, integrate and test a mail backend with spam controls and an appropriate privacy notice. The current form clearly says it opens an email draft.
5. Choose hosting, configure the domain and HTTPS, and verify email behavior on target devices. The source code and a local smoke test do not constitute a public deployment.
