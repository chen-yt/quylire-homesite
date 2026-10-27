import { test, expect } from "@playwright/test";
import { buildInquiry } from "../src/inquiry.js";

test("brand site loads without errors or horizontal overflow on desktop and mobile", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 1024, 820, 768, 760, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page).toHaveTitle(/QUYLIRE/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "FLOW YOU CAN TRUST.",
    );
    await expect(page.locator("#contact-form")).toBeAttached();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("mobile menu supports navigation and escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const button = page.getByRole("button", { name: "Open navigation" });
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav).toBeHidden();
  await button.click();
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "Flow meters", exact: true }).click();
  await expect(page).toHaveURL(/#products$/);
  await expect(nav).toBeHidden();
  await button.click();
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(button).toBeFocused();
});

test("inquiry links select the relevant topic without clearing entered content", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Your name").fill("Jordan Lee");
  await page.getByRole("link", { name: /Business inquiries/ }).click();
  await expect(page.getByLabel("What’s your inquiry about?")).toHaveValue(
    "Business inquiry",
  );
  await expect(page.getByLabel("Your name")).toHaveValue("Jordan Lee");
  await page.getByRole("link", { name: "Ask about an Amazon product" }).click();
  await expect(page.getByLabel("What’s your inquiry about?")).toHaveValue(
    "Amazon product question",
  );
});

test("form validates required input and prepares a real, encoded email draft", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open email draft", exact: true })
    .click();
  await expect(page.locator("#draft-status")).toBeHidden();
  await page.getByLabel("Your name").fill("Jordan & Lee");
  await page
    .getByLabel("Email address", { exact: false })
    .fill("jordan@example.com");
  await page.getByLabel("Company").fill("Example #1");
  await page
    .getByLabel("Your message")
    .fill(
      "Question about water flow: 20 L/min & a 1/2-inch connection.\nProduct: https://example.com/?a=1&b=2",
    );
  const requests = [];
  page.on("request", (request) => {
    if (/^https?:/.test(request.url())) requests.push(request.url());
  });
  await page
    .getByRole("button", { name: "Open email draft", exact: true })
    .click();
  await expect(page.locator("#draft-status")).toBeVisible();
  await expect(page).toHaveURL("/");
  const href = await page.locator("#draft-link").getAttribute("href");
  const parsed = new URL(href);
  expect(parsed.protocol).toBe("mailto:");
  expect(parsed.pathname).toBe("contact@quylire.com");
  expect(parsed.searchParams.get("subject")).toBe(
    "QUYLIRE — Product information",
  );
  expect(parsed.searchParams.get("body")).toContain("Name: Jordan & Lee");
  expect(parsed.searchParams.get("body")).toContain(
    "https://example.com/?a=1&b=2",
  );
  expect(parsed.searchParams.get("body")).toContain("Company: Example #1");
  expect(requests).toEqual([]);
  await page.getByRole("button", { name: "Copy inquiry" }).click();
  await expect(page.locator("#inquiry-copy-status")).toContainText(
    "Inquiry copied.",
  );
  await page.getByLabel("Your message").fill("A different question");
  await expect(page.locator("#draft-status")).toBeHidden();
});

test("whitespace-only messages do not prepare a draft", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Your name").fill("Jordan");
  await page
    .getByLabel("Email address", { exact: false })
    .fill("jordan@example.com");
  await page.getByLabel("Your message").fill("   ");
  await page
    .getByRole("button", { name: "Open email draft", exact: true })
    .click();
  await expect(page.locator("#draft-status")).toBeHidden();
  expect(
    await page.locator("#message").evaluate((input) => input.validity.valid),
  ).toBe(false);
  await page.getByLabel("Your message").fill("Valid question");
  expect(
    await page.locator("#message").evaluate((input) => input.validity.valid),
  ).toBe(true);
});

test("email address can be copied and Amazon links use the supplied store URL", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Clipboard permissions are checked in Chromium.",
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Copy email address" }).click();
  await expect(page.locator("#copy-status")).toHaveText("Email copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "contact@quylire.com",
  );
  for (const link of await page.locator('a[href*="amazon.com"]').all()) {
    await expect(link).toHaveAttribute(
      "href",
      "https://www.amazon.com/stores/QUYLIRE/page/66E2E042-07BF-4E26-A367-F2CB7AEDA94A",
    );
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
});

test("privacy dialog opens and closes with keyboard focus restored", async ({
  page,
}) => {
  await page.goto("/");
  const button = page.getByRole("button", { name: "Privacy & contact" });
  await button.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText(
    "does not store your form entries",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(button).toBeFocused();
});

test("email draft preserves unicode and special characters without adding recipient headers", () => {
  const inquiry = buildInquiry({
    name: " Zoë & 李 ",
    email: "zoe+test@example.com",
    company: "",
    topic: "Application question",
    message: " Line 1\nLine 2? & # % ",
  });
  const url = new URL(inquiry.href);
  expect(url.pathname).toBe("contact@quylire.com");
  expect(url.searchParams.size).toBe(2);
  expect(url.searchParams.get("body")).toContain("Zoë & 李");
  expect(url.searchParams.get("body")).toContain("Line 2? & # %");
  expect(url.searchParams.get("body")).not.toContain("Company:");
});

test("without JavaScript the inquiry form cannot submit personal data", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.locator("#name")).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Open email draft", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".noscript-note")).toContainText(
    "contact@quylire.com",
  );
  await expect(page.locator(".noscript-note")).toBeVisible();
  await expect(page.locator(".contact-email")).toHaveAttribute(
    "href",
    "mailto:contact@quylire.com",
  );
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  await context.close();
});

test("catalog filters show the matching products and announce the result count", async ({
  page,
}) => {
  await page.goto("/");
  const filters = page.locator("#product-filters");
  const cards = page.locator("#catalog-grid .product-card:visible");
  const status = page.locator("#catalog-status");
  await expect(status).toHaveAttribute("role", "status");
  await expect(cards).toHaveCount(11);

  for (const [category, count] of [
    ["Aluminum alloy", 5],
    ["Stainless steel", 3],
    ["Garden water", 1],
    ["Camlock", 2],
    ["All products", 11],
  ]) {
    const button = filters.getByRole("button", { name: category, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(filters.locator('button[aria-pressed="true"]')).toHaveCount(1);
    await expect(cards).toHaveCount(count);
    await expect(status).toContainText(new RegExp(`\\b${count}\\b`));
  }
});

test("product details open from the catalog and escape restores keyboard focus", async ({
  page,
}) => {
  await page.goto("/");
  const button = page
    .locator("#catalog-grid .product-card")
    .first()
    .getByRole("button", { name: /View details/ });
  await button.click();
  const dialog = page.locator("#product-dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "Ask about this model" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
});

test("a selected product carries into the inquiry draft without overwriting the message", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Your name").fill("Jordan Lee");
  await page
    .getByLabel("Email address", { exact: false })
    .fill("jordan@example.com");
  const message = "Please share the specifications for my application.";
  await page.getByLabel("Your message").fill(message);
  await page
    .locator("#product-filters")
    .getByRole("button", { name: "Stainless steel", exact: true })
    .click();
  const card = page.locator("#catalog-grid .product-card:visible").first();
  await card.getByRole("button", { name: /View details/ }).click();
  await page
    .locator("#product-dialog")
    .getByRole("link", { name: "Ask about this model" })
    .click();
  await expect(page.locator("#product-dialog")).toBeHidden();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator("#form-title")).toBeFocused();
  await expect(page.getByLabel("Your message")).toHaveValue(message);
  const selection = page.locator("#selected-product-input");
  await expect(selection).toHaveAttribute("name", "product");
  await expect(selection).not.toHaveValue("");
  const product = await selection.inputValue();
  await expect(page.locator("#selected-product")).toContainText(product);
  await page
    .getByRole("button", { name: "Open email draft", exact: true })
    .click();
  await expect(page.locator("#draft-status")).toBeVisible();
  const draft = new URL(await page.locator("#draft-link").getAttribute("href"));
  expect(draft.searchParams.get("body")).toContain(
    `Product of interest: ${product}`,
  );
  expect(draft.searchParams.get("body")).toContain(message);
  await page.getByRole("button", { name: "Clear product selection" }).click();
  await expect(selection).toHaveValue("");
  await expect(page.locator("#draft-status")).toBeHidden();
  await expect(page.getByLabel("Your message")).toHaveValue(message);
});

test("catalog product images load and disclose their illustrative nature", async ({
  page,
}) => {
  await page.goto("/");
  const cards = page.locator("#catalog-grid .product-card");
  await expect(cards).toHaveCount(11);
  for (const card of await cards.all()) {
    const image = card.locator("img").first();
    await expect(image).toHaveAttribute("alt", /^Illustrative/);
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect
      .poll(() =>
        image.evaluate(
          (element) => element.complete && element.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
});

test("email draft safely encodes a selected product and omits the line when unselected", () => {
  const details = {
    name: "Jordan",
    email: "jordan@example.com",
    topic: "Product information",
    message: "Please send details.",
  };
  const selected = new URL(
    buildInquiry({
      ...details,
      product: "3/4″ Stainless Steel & Adapter #1",
    }).href,
  );
  expect(selected.pathname).toBe("contact@quylire.com");
  expect(selected.searchParams.size).toBe(2);
  expect(selected.searchParams.get("body")).toContain(
    "Product of interest: 3/4″ Stainless Steel & Adapter #1",
  );
  expect(
    new URL(buildInquiry(details).href).searchParams.get("body"),
  ).not.toContain("Product of interest:");
});
