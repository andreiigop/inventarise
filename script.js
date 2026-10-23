const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const magicLoader = document.querySelector(".magic-loader");

if (magicLoader) {
  document.body.classList.add("magic-opening");
  magicLoader.classList.add("is-active");

  window.setTimeout(() => {
    magicLoader.classList.add("is-dismissing");
    document.body.classList.remove("magic-opening");
    document.body.classList.add("has-arrived");
    window.setTimeout(() => magicLoader.remove(), 720);
  }, prefersReducedMotion ? 180 : 2000);
}

const petalLayer = document.querySelector(".petal-drift");

if (petalLayer && !prefersReducedMotion) {
  for (let index = 0; index < 12; index += 1) {
    const petal = document.createElement("i");
    const seed = (index * 37) % 100;
    petal.style.setProperty("--petal-left", `${seed}%`);
    petal.style.setProperty("--petal-size", `${8 + (index % 4) * 3}px`);
    petal.style.setProperty("--petal-angle", `${(index * 53) % 360}deg`);
    petal.style.setProperty("--petal-drift", `${(index % 2 ? 1 : -1) * (35 + (index % 3) * 18)}px`);
    petal.style.setProperty("--petal-duration", `${18 + (index % 5) * 3}s`);
    petal.style.setProperty("--petal-delay", `${-index * 2.1}s`);
    petalLayer.append(petal);
  }
}

if (!prefersReducedMotion) {
  let parallaxFrame = 0;
  const atmosphere = document.querySelector(".atmosphere");
  const spellScene = document.querySelector(".spell-scene");

  const updateParallax = () => {
    const offset = window.scrollY;
    document.documentElement.style.setProperty("--far-shift", `${-offset * 0.035}px`);
    document.documentElement.style.setProperty("--near-shift", `${-offset * 0.075}px`);
    parallaxFrame = 0;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!parallaxFrame) {
        parallaxFrame = window.requestAnimationFrame(updateParallax);
      }
    },
    { passive: true },
  );

  if (atmosphere && spellScene) {
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    document.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch") {
          return;
        }

        pointerX = event.clientX / window.innerWidth;
        pointerY = event.clientY / window.innerHeight;
        if (!pointerFrame) {
          pointerFrame = window.requestAnimationFrame(() => {
            atmosphere.style.setProperty("--cursor-x", `${pointerX * 100}%`);
            atmosphere.style.setProperty("--cursor-y", `${pointerY * 100}%`);
            spellScene.style.setProperty("--world-x", `${(0.5 - pointerX) * 18}px`);
            spellScene.style.setProperty("--world-y", `${(0.5 - pointerY) * 12}px`);
            pointerFrame = 0;
          });
        }
      },
      { passive: true },
    );

    document.addEventListener("pointerdown", (event) => {
      if (
        !(event.target instanceof Element) ||
        event.target.closest("a, button, input, textarea, select, .magic-loader")
      ) {
        return;
      }

      const burst = document.createElement("span");
      burst.className = "spell-burst";
      burst.setAttribute("aria-hidden", "true");
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;
      atmosphere.append(burst);
      window.setTimeout(() => burst.remove(), 1100);
    });
  }
}

const revealTargets = document.querySelectorAll(
  ".intro-grid, .about-grid, .word-strip, .section-heading, .skills-grid, .skill-card, .project-showcase, .metric-box, .feature-card, .journey-heading, .journey-steps li, .stack-card, .honesty-card, .closing-card",
);

if (
  "IntersectionObserver" in window &&
  !prefersReducedMotion
) {
  document.body.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -38px 0px" },
  );

  revealTargets.forEach((target) => {
    target.classList.add("reveal-on-scroll");
    revealObserver.observe(target);
  });
}

const header = document.querySelector(".site-header");

if (header) {
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.innerHTML = "<span></span>";
  header.append(progress);

  const progressBar = progress.firstElementChild;
  let progressFrame = 0;

  const updateProgress = () => {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const amount =
      scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    progressBar.style.transform = `scaleX(${Math.min(amount, 1)})`;
    progressFrame = 0;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!progressFrame) {
        progressFrame = window.requestAnimationFrame(updateProgress);
      }
    },
    { passive: true },
  );

  updateProgress();
}

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Open navigation menu" : "Close navigation menu",
    );
    navLinks.classList.toggle("is-open", !isOpen);
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
      navLinks.classList.remove("is-open");
    }
  });

  navLinks.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
      navLinks.classList.remove("is-open");
      menuButton.focus();
    }
  });
}

const sectionLinks = Array.from(
  document.querySelectorAll(".nav-links a[href^='#']"),
);
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter((section) => section instanceof HTMLElement);

if ("IntersectionObserver" in window && observedSections.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleSection) {
        return;
      }

      sectionLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${visibleSection.target.id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.2, 0.5] },
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll(".feature-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    card.style.setProperty("--pointer-x", `${x * 100}%`);
    card.style.setProperty("--pointer-y", `${y * 100}%`);
    card.style.setProperty("--tilt-x", `${((0.5 - y) * 4).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${((x - 0.5) * 4).toFixed(2)}deg`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  });
});

if (
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !prefersReducedMotion
) {
  document.querySelectorAll(".skill-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") {
        return;
      }

      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;

      card.style.setProperty("--pointer-x", `${x * 100}%`);
      card.style.setProperty("--pointer-y", `${y * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--pointer-x");
      card.style.removeProperty("--pointer-y");
    });
  });
}

const phoneTabs = Array.from(document.querySelectorAll(".phone-tabbar [role='tab']"));

const activatePhoneTab = (tab) => {
  phoneTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    item.classList.toggle("tab-active", selected);

    const panel = document.getElementById(item.getAttribute("aria-controls"));
    if (panel) {
      panel.hidden = !selected;
    }
  });
};

if (phoneTabs.length > 0) {
  phoneTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activatePhoneTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % phoneTabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + phoneTabs.length) % phoneTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = phoneTabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      phoneTabs[nextIndex].focus();
      activatePhoneTab(phoneTabs[nextIndex]);
    });
  });
}

const inventariseTabs = Array.from(
  document.querySelectorAll(".demo-tabs [role='tab']"),
);

const activateInventariseTab = (tab) => {
  inventariseTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;

    const panel = document.getElementById(item.getAttribute("aria-controls"));
    if (panel) {
      panel.hidden = !selected;
    }
  });
};

if (inventariseTabs.length > 0) {
  inventariseTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateInventariseTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % inventariseTabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + inventariseTabs.length) % inventariseTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = inventariseTabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      inventariseTabs[nextIndex].focus();
      activateInventariseTab(inventariseTabs[nextIndex]);
    });
  });
}

document.querySelectorAll(".feature-action[data-preview-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const targetTab = document.getElementById(button.dataset.previewTab);
    const phone = document.querySelector(".phone");

    if (!(targetTab instanceof HTMLButtonElement) || !phone) {
      return;
    }

    activatePhoneTab(targetTab);
    phone.scrollIntoView({ behavior: "smooth", block: "center" });
    targetTab.focus({ preventScroll: true });
  });
});

const stackDetail = document.querySelector(".stack-detail");
const stackNodes = document.querySelectorAll(".stack-node[data-stack-detail]");

stackNodes.forEach((node) => {
  node.addEventListener("click", () => {
    stackNodes.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === node));
    });

    if (stackDetail) {
      stackDetail.textContent = node.dataset.stackDetail ?? "";
    }
  });
});

const heroVisual = document.querySelector(".hero-visual");

if (
  heroVisual &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !prefersReducedMotion
) {
  heroVisual.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const bounds = heroVisual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const phone = heroVisual.querySelector(".phone");

    if (phone) {
      phone.style.setProperty("--phone-tilt-x", `${((0.5 - y) * 5).toFixed(2)}deg`);
      phone.style.setProperty("--phone-tilt-y", `${((x - 0.5) * 7).toFixed(2)}deg`);
    }
  });

  heroVisual.addEventListener("pointerleave", () => {
    const phone = heroVisual.querySelector(".phone");
    phone?.style.removeProperty("--phone-tilt-x");
    phone?.style.removeProperty("--phone-tilt-y");
  });
}

const savedScholarships = new Map();
const savedList = document.querySelector(".saved-list");
const savedEmpty = document.querySelector(".saved-empty");
const phoneStatusMessage = document.querySelector(".phone-status-message");

const updateSavedScholarships = () => {
  document.querySelectorAll(".opportunity-card[data-scholarship-id]").forEach((card) => {
    const id = card.dataset.scholarshipId;
    const isSaved = savedScholarships.has(id);
    const button = card.querySelector(".bookmark");

    if (button) {
      button.setAttribute("aria-pressed", String(isSaved));
      button.setAttribute(
        "aria-label",
        `${isSaved ? "Remove" : "Save"} ${card.dataset.scholarshipTitle} ${isSaved ? "from" : "to"} saved`,
      );
      button.textContent = isSaved ? "♥" : "♡";
    }
  });

  if (!savedList || !savedEmpty) {
    return;
  }

  savedList.replaceChildren();
  savedEmpty.hidden = savedScholarships.size > 0;

  savedScholarships.forEach((scholarship) => {
    const card = document.createElement("article");
    card.className = "saved-scholarship";
    const title = document.createElement("strong");
    title.textContent = scholarship.title;
    const description = document.createElement("span");
    description.textContent = scholarship.description;
    card.append(title, description);
    savedList.append(card);
  });
};

document.querySelectorAll(".bookmark").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".opportunity-card");
    const id = card?.dataset.scholarshipId;
    const title = card?.dataset.scholarshipTitle;

    if (!id || !title) {
      return;
    }

    if (savedScholarships.has(id)) {
      savedScholarships.delete(id);
      if (phoneStatusMessage) {
        phoneStatusMessage.textContent = `${title} removed from saved scholarships.`;
      }
    } else {
      savedScholarships.set(id, {
        title,
        description: card.dataset.scholarshipDescription ?? "",
      });
      if (phoneStatusMessage) {
        phoneStatusMessage.textContent = `${title} added to saved scholarships.`;
      }
    }

    updateSavedScholarships();
  });
});

document.querySelectorAll(".scholarship-search").forEach((input) => {
  input.addEventListener("input", () => {
    const query = input.value.trim().toLocaleLowerCase();
    const cards = document.querySelectorAll(".scholarship-list .opportunity-card");
    let visibleCount = 0;

    cards.forEach((card) => {
      const matches = card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      visibleCount += Number(matches);
    });

    const resultCount = document.querySelector(".search-result-count");
    if (resultCount) {
      resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? "ITEM" : "ITEMS"}`;
    }

    const emptyState = document.querySelector(".search-empty");
    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  });
});
