# QUYLIRE brand website

An English-language flow-meter brand website for visitors in the United States and Canada, including business buyers and visitors coming from Amazon. No prices, checkout, tracking scripts, or customer-account system.

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

Tests use the cloud environment's `/usr/bin/chromium`. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to your browser's path on another machine. The test runner starts the production preview itself. Tests cover responsive layouts, mobile navigation, inquiry topic links, required-field validation, encoded email drafts, email copying, Amazon link configuration, and the privacy dialog. They do not send email or verify the recipient mailbox.

## Content and contact behavior

- `index.html`: page structure and English copy; includes the supplied Amazon brand-store URL and `contact@quylire.com`.
- `src/style.css`: responsive visual system. Colors are defined at the top.
- `src/typography.css`: self-hosted Manrope variable font from Fontsource (SIL Open Font License); no external font-service requests.
- `src/main.js`: mobile menu, local inquiry form, clipboard, and privacy dialog.
- `src/inquiry.js`: locally creates an encoded `mailto:` draft. There is no email API or backend. Visitors must send the email in their own email app. A copy-inquiry fallback is provided. Visitors' form data is not persisted by the website.
- `public/favicon.svg`: provisional monogram. The wordmark, illustration, and colors are draft treatments pending final brand assets.

Product imagery, detailed product listings, model names, specifications, certifications, brand-history claims, and technical documents have intentionally not been invented. The product range currently has an explicit information-pending state; the abstract illustrations are not representations of actual products.

## Before public launch

1. Replace the provisional brand treatment with the approved logo and brand assets.
2. Supply and add product photos, model names, confirmed specifications, application limits, and any approved manuals. Add individual product pages once the actual range is known.
3. Review the English copy and privacy notice, verify the Amazon store opens, and confirm `contact@quylire.com` can receive mail. Amazon was blocked by the onboarding network policy, so its visual design and live contents were not verified.
4. If a direct form submission is wanted, integrate and test a mail backend with spam controls and an appropriate privacy notice. The current form clearly says it opens an email draft.
5. Choose hosting, configure the domain and HTTPS, and verify email behavior on target devices. The source code and a local smoke test do not constitute a public deployment.
