const base = import.meta.env.BASE_URL;
const groups = {
  aluminum: {
    label: "Aluminum alloy",
    image: "meter-orange.webp",
    description: "Explore the orange-display QUYLIRE aluminum alloy range.",
  },
  stainless: {
    label: "Stainless steel",
    image: "meter-blue.webp",
    description: "Discover the blue-display QUYLIRE stainless steel range.",
  },
  garden: {
    label: "Garden water",
    image: "meter-garden.webp",
    description:
      "A closer look at the garden water model in the QUYLIRE collection.",
  },
  camlock: {
    label: "Camlock",
    image: "meter-camlock.webp",
    description: "Explore the QUYLIRE range with camlock-style connections.",
  },
};

export const products = [
  ...["3/4", "1", "1.5", "2", "3"].map((size) => ({
    id: `aluminum-${size.replace("/", "-")}`,
    category: "aluminum",
    size: `${size}\"`,
    name: `${size}\" Aluminum Alloy Flow Meter`,
  })),
  ...["3/4", "1", "2"].map((size) => ({
    id: `stainless-${size.replace("/", "-")}`,
    category: "stainless",
    size: `${size}\"`,
    name: `${size}\" Stainless Steel Flow Meter`,
  })),
  {
    id: "garden",
    category: "garden",
    size: "Garden model",
    name: "Garden Water Flow Meter",
  },
  ...["2", "3"].map((size) => ({
    id: `camlock-${size}`,
    category: "camlock",
    size: `${size}\"`,
    name: `${size}\" Camlock Flow Meter`,
  })),
];

export function initCatalog() {
  const grid = document.querySelector("#catalog-grid");
  const status = document.querySelector("#catalog-status");
  const dialog = document.querySelector("#product-dialog");
  const content = document.querySelector("#product-dialog-content");

  const imageUrl = (group) => `${base}images/${group.image}`;
  const arrow =
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>';

  function showDetails(product) {
    const group = groups[product.category];
    // Product text comes only from the local, reviewed catalog above.
    content.replaceChildren();
    const picture = document.createElement("div");
    picture.className = "detail-picture";
    const image = document.createElement("img");
    image.src = imageUrl(group);
    image.alt = `Illustrative render of a QUYLIRE ${group.label.toLowerCase()} flow meter; not a model-specific product photograph.`;
    picture.append(image);
    const caption = document.createElement("p");
    caption.textContent = "Illustrative product render";
    picture.append(caption);
    const copy = document.createElement("div");
    copy.className = "detail-copy";
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = `QUYLIRE / ${group.label}`;
    const heading = document.createElement("h2");
    heading.id = "product-dialog-title";
    heading.textContent = product.name;
    const description = document.createElement("p");
    description.textContent = group.description;
    const spec = document.createElement("dl");
    const term = document.createElement("dt");
    term.textContent =
      product.category === "garden"
        ? "Product family"
        : "Shown connection size";
    const value = document.createElement("dd");
    value.textContent = product.size;
    spec.append(term, value);
    const note = document.createElement("p");
    note.className = "detail-note";
    note.textContent =
      "Specifications and available configurations vary by model. Contact us to confirm connection standards, flow range, fluid compatibility, and application requirements.";
    const inquiry = document.createElement("a");
    inquiry.href = "#contact";
    inquiry.className = "button button-primary";
    inquiry.innerHTML = `Ask about this model ${arrow}`;
    inquiry.addEventListener("click", (event) => {
      event.preventDefault();
      document.dispatchEvent(
        new CustomEvent("quylire:select-product", { detail: product }),
      );
      dialog.close();
      if (window.location.hash !== "#contact") {
        window.history.pushState(null, "", "#contact");
      }
      document.querySelector("#contact").scrollIntoView({ block: "start" });
      document.querySelector("#form-title").focus({ preventScroll: true });
    });
    copy.append(eyebrow, heading, description, spec, note, inquiry);
    content.append(picture, copy);
    dialog.showModal();
  }

  function render(category = "all") {
    const visible = products.filter(
      (product) => category === "all" || product.category === category,
    );
    grid.replaceChildren();
    visible.forEach((product) => {
      const group = groups[product.category];
      const card = document.createElement("article");
      card.className = "product-card";
      const picture = document.createElement("div");
      picture.className = "product-picture";
      const image = document.createElement("img");
      image.src = imageUrl(group);
      image.alt = `Illustrative render of the QUYLIRE ${group.label.toLowerCase()} range; actual model appearance may vary.`;
      image.loading = "lazy";
      image.width = 1024;
      image.height = 1024;
      picture.append(image);
      const badge = document.createElement("span");
      badge.className = "size-badge";
      badge.textContent = product.size;
      picture.append(badge);
      const body = document.createElement("div");
      body.className = "product-card-copy";
      const categoryLabel = document.createElement("p");
      categoryLabel.className = "eyebrow";
      categoryLabel.textContent = group.label;
      const title = document.createElement("h3");
      title.textContent = product.name;
      const button = document.createElement("button");
      button.className = "text-link";
      button.type = "button";
      button.innerHTML = `View details <span class="sr-only"></span>${arrow}`;
      button.querySelector(".sr-only").textContent = `for ${product.name}`;
      button.addEventListener("click", () => showDetails(product));
      body.append(categoryLabel, title, button);
      card.append(picture, body);
      grid.append(card);
    });
    status.textContent = `${visible.length} ${visible.length === 1 ? "product" : "products"}${category === "all" ? " in the collection" : ` in ${groups[category].label.toLowerCase()}`}`;
    document.querySelectorAll("#product-filters button").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === category),
      );
    });
  }

  document.querySelectorAll("#product-filters button").forEach((button) => {
    button.addEventListener("click", () => render(button.dataset.filter));
  });
  document.querySelectorAll("[data-family]").forEach((link) => {
    link.addEventListener("click", () => render(link.dataset.family));
  });
  document
    .querySelector("#product-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  render();
}
