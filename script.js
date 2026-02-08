const planCards = document.querySelectorAll("[data-plan]");
planCards.forEach((card) => {
  const button = card.querySelector("button, a");
  button?.addEventListener("click", () => {
    planCards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
  });
});

const navLinks = document.querySelectorAll(".nav-links a");
const currentPage = window.location.pathname.split("/").pop() || "index.html";
navLinks.forEach((link) => {
  const href = link.getAttribute("href") || "";
  const normalized = href === "/" ? "index.html" : href;
  if (normalized === currentPage) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});

const browseTabs = document.querySelectorAll(".browse-tabs button");
const assetCards = document.querySelectorAll(".asset-card[data-type]");
browseTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-tab");
    browseTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    assetCards.forEach((card) => {
      const type = card.getAttribute("data-type");
      if (!target || target === "all" || type === target) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  });
});
