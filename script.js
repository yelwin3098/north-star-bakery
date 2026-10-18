const FAVORITES_STORAGE_KEY = "northStarBakeryFavorites";
const CATEGORY_STORAGE_KEY = "northStarBakeryCategory";

const productCatalog = [
  { id: "signature-loaf", name: "Signature loaf", category: "breads" },
  { id: "country-sourdough", name: "Country sourdough", category: "breads" },
  { id: "seasonal-fruit-danish", name: "Seasonal fruit danish", category: "pastries" },
  { id: "chocolate-chip-cookie", name: "Chocolate chip cookie", category: "pastries" },
  { id: "celebration-cake", name: "Celebration cake", category: "cakes" },
  { id: "mini-tea-cake", name: "Mini tea cake", category: "cakes" }
];

const categoryNames = {
  all: "All products",
  breads: "Breads",
  pastries: "Pastries",
  cakes: "Cakes"
};

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("[data-products-page]")) {
    initializeProductsPage();
  }

  const contactForm = document.querySelector("#bakery-contact-form");
  if (contactForm) {
    initializeContactForm(contactForm);
  }
});

function initializeProductsPage() {
  const favoriteButtons = document.querySelectorAll(".favorite-button");
  const favoriteCount = document.querySelector("#favorite-count");
  const favoriteList = document.querySelector("#favorite-list");
  const favoriteStatus = document.querySelector("#favorite-status");
  const categoryFilter = document.querySelector("#category-filter");
  const pageState = {
    favorites: loadFavorites(),
    category: loadCategory()
  };

  categoryFilter.value = pageState.category;
  renderFavorites(pageState.favorites, favoriteCount, favoriteList);
  updateFavoriteButtons(pageState.favorites, favoriteButtons);
  filterProductSections(pageState.category);

  favoriteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleFavorite(button.dataset.productId, pageState, favoriteButtons, favoriteCount, favoriteList, favoriteStatus);
    });
  });

  categoryFilter.addEventListener("change", () => {
    pageState.category = categoryFilter.value;
    saveCategory(pageState.category);
    filterProductSections(pageState.category);
  });
}

function loadFavorites() {
  try {
    const storedFavorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY));
    if (!Array.isArray(storedFavorites)) {
      return [];
    }

    return storedFavorites.filter((id) => productCatalog.some((product) => product.id === id));
  } catch (error) {
    return [];
  }
}

function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    return false;
  }
}

function loadCategory() {
  try {
    const storedCategory = localStorage.getItem(CATEGORY_STORAGE_KEY);
    return Object.prototype.hasOwnProperty.call(categoryNames, storedCategory) ? storedCategory : "all";
  } catch (error) {
    return "all";
  }
}

function saveCategory(category) {
  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, category);
  } catch (error) {
    return false;
  }

  return true;
}

function toggleFavorite(productId, pageState, buttons, count, list, status) {
  const product = productCatalog.find((item) => item.id === productId);
  if (!product) {
    status.textContent = "That product could not be found.";
    return;
  }

  const isFavorite = pageState.favorites.includes(productId);
  pageState.favorites = isFavorite
    ? pageState.favorites.filter((id) => id !== productId)
    : [...pageState.favorites, productId];

  const saved = saveFavorites(pageState.favorites);
  updateFavoriteButtons(pageState.favorites, buttons);
  renderFavorites(pageState.favorites, count, list);

  const action = isFavorite ? "removed from" : "added to";
  status.textContent = `${product.name} ${action} your favorites.`;
  if (!saved) {
    status.textContent += " Your browser could not save this change.";
  }
}

function updateFavoriteButtons(favorites, buttons) {
  buttons.forEach((button) => {
    const selected = favorites.includes(button.dataset.productId);
    const product = productCatalog.find((item) => item.id === button.dataset.productId);
    button.textContent = selected ? "Remove favorite" : "Add to favorites";
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", `${selected ? "Remove" : "Add"} ${product.name} ${selected ? "from" : "to"} favorites`);
  });
}

function renderFavorites(favorites, count, list) {
  const selectedProducts = productCatalog.filter((product) => favorites.includes(product.id));
  count.textContent = `${selectedProducts.length} favorite${selectedProducts.length === 1 ? "" : "s"} selected.`;
  list.replaceChildren();

  if (selectedProducts.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No favorites selected yet.";
    list.appendChild(emptyItem);
    return;
  }

  selectedProducts.forEach((product) => {
    const item = document.createElement("li");
    item.textContent = product.name;
    list.appendChild(item);
  });
}

function filterProductSections(category) {
  document.querySelectorAll("[data-product-section]").forEach((section) => {
    section.hidden = category !== "all" && section.dataset.category !== category;
  });
}

function initializeContactForm(form) {
  const fields = {
    name: {
      input: document.querySelector("#full-name"),
      error: document.querySelector("#full-name-error")
    },
    email: {
      input: document.querySelector("#email"),
      error: document.querySelector("#email-error")
    },
    message: {
      input: document.querySelector("#item-details"),
      error: document.querySelector("#item-details-error")
    }
  };
  const formMessage = document.querySelector("#form-message");

  Object.values(fields).forEach((field) => {
    field.input.addEventListener("input", () => validateField(field));
  });

  form.addEventListener("invalid", (event) => {
    const field = Object.values(fields).find((item) => item.input === event.target);
    if (field) {
      validateField(field);
    }
  }, true);

  form.addEventListener("submit", (event) => {
    const valid = Object.values(fields).every((field) => validateField(field));
    if (!valid) {
      event.preventDefault();
      formMessage.textContent = "Please correct the highlighted fields before continuing.";
      return;
    }

    event.preventDefault();
    formMessage.textContent = "Demo only: your request passed validation. No message was sent.";
  });
}

function validateField(field) {
  const value = field.input.value.trim();
  let message = "";

  if (field.input.id === "full-name" && value.length === 0) {
    message = "Please enter your name.";
  } else if (field.input.id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    message = "Please enter a valid email address.";
  } else if (field.input.id === "item-details" && value.length < 10) {
    message = "Please enter at least 10 characters about your request.";
  }

  field.error.textContent = message;
  field.input.toggleAttribute("aria-invalid", Boolean(message));
  return message === "";
}
