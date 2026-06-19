import { calculateTotalFootprint, calculatePledgeSavings } from "./src/calculations.js";
import { SoundManager } from "./src/sound.js";
import { drawDigitalCanopy } from "./src/canopy.js";

// Global click event listener for user buttons and inputs
document.addEventListener("click", (e) => {
  const target = e.target.closest("button, a, select");
  if (target) {
    // Prevent double play on tab switch buttons
    if (!target.classList.contains("step-tab")) {
      SoundManager.playClick();
    }
  }
});

// Custom Cursor Movement
const cursor = document.getElementById("customCursor");
document.addEventListener("mousemove", (e) => {
  if (cursor) {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  }
});

// Interactive hover effect for custom cursor
const hoverElements = document.querySelectorAll(
  "a, button, label, select, input, .step-tab",
);
hoverElements.forEach((elem) => {
  elem.addEventListener("mouseenter", () => cursor?.classList.add("hover"));
  elem.addEventListener("mouseleave", () => cursor?.classList.remove("hover"));
});

// 3D Parallax Effect in Hero
const parallaxContainer = document.getElementById("parallaxContainer");
const layers = document.querySelectorAll(".parallax-layer");

if (parallaxContainer) {
  window.addEventListener("mousemove", (e) => {
    // Disable parallax moving effect on mobile viewports
    if (window.innerWidth <= 768) {
      layers.forEach((layer) => {
        layer.style.transform = "";
      });
      return;
    }

    // Calculate normalized mouse positions relative to screen center (-1 to 1)
    const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

    layers.forEach((layer) => {
      const speedX = parseFloat(layer.getAttribute("data-speed-x")) || 0;
      const speedY = parseFloat(layer.getAttribute("data-speed-y")) || 0;

      // Calculate shifts (e.g. 50px max movement for top layer speed=0.5)
      const moveX = x * speedX * 50;
      const moveY = y * speedY * 50;

      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  });
}

// Scroll Reveal Animations
const revealElements = document.querySelectorAll(".animate-reveal");
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // trigger animation only once
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  },
);

revealElements.forEach((elem) => revealObserver.observe(elem));

// Stepped Calculator Tabs & Navigation
const tabs = document.querySelectorAll(".step-tab");
const panes = document.querySelectorAll(".calc-step-pane");
const nextBtns = document.querySelectorAll(".next-step");
const prevBtns = document.querySelectorAll(".prev-step");

let activeStepIdx = 0;

function setActiveStep(idx) {
  if (activeStepIdx !== idx) {
    SoundManager.playTabSwitch();
  }
  activeStepIdx = idx;

  // Update Tabs
  tabs.forEach((tab, i) => {
    if (i === idx) {
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      tab.removeAttribute("tabindex");
    } else {
      tab.classList.remove("active");
      tab.setAttribute("aria-selected", "false");
      tab.setAttribute("tabindex", "-1");
    }
  });

  // Update Panes
  panes.forEach((pane, i) => {
    if (i === idx) {
      pane.classList.add("active");
    } else {
      pane.classList.remove("active");
    }
  });
}

// Bind tabs click event
tabs.forEach((tab, idx) => {
  tab.addEventListener("click", () => {
    setActiveStep(idx);
  });
});

// Bind next/prev button actions
nextBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (activeStepIdx < tabs.length - 1) {
      setActiveStep(activeStepIdx + 1);
    }
  });
});

prevBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (activeStepIdx > 0) {
      setActiveStep(activeStepIdx - 1);
    }
  });
});

// Stepped Calculator Fuel conditional display
const cookingFuelSelect = document.getElementById("cookingFuel");
const lpgGroup = document.getElementById("lpgGroup");
const pngGroup = document.getElementById("pngGroup");

if (cookingFuelSelect) {
  cookingFuelSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    if (value === "lpg") {
      lpgGroup.classList.remove("hidden");
      pngGroup.classList.add("hidden");
    } else if (value === "png") {
      lpgGroup.classList.add("hidden");
      pngGroup.classList.remove("hidden");
    } else {
      lpgGroup.classList.add("hidden");
      pngGroup.classList.add("hidden");
    }
  });
}

let currentCalculatedFootprint = 180; // default initial fallback footprint

const footprintForm = document.getElementById("footprintForm");
const calcResults = document.getElementById("calcResults");
const recalcBtn = document.getElementById("recalcBtn");

if (footprintForm) {
  footprintForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Gather inputs (sanitize to prevent negative values)
    const inputs = {
      electricity: Math.max(0, parseFloat(document.getElementById("electricity").value) || 0),
      cookingFuel: document.getElementById("cookingFuel").value,
      lpgCylinders: Math.max(0, parseFloat(document.getElementById("lpgCylinders").value) || 0),
      pngUsage: Math.max(0, parseFloat(document.getElementById("pngUsage").value) || 0),
      twoWheeler: Math.max(0, parseFloat(document.getElementById("twoWheeler").value) || 0),
      carTravel: Math.max(0, parseFloat(document.getElementById("carTravel").value) || 0),
      carFuel: document.getElementById("carFuel").value,
      publicTransit: Math.max(0, parseFloat(document.getElementById("publicTransit").value) || 0),
      dietType: document.getElementById("dietType").value,
      diningOut: Math.max(0, parseFloat(document.getElementById("diningOut").value) || 0),
      localFood: document.getElementById("localFood").value,
      wasteSegregation: document.getElementById("wasteSegregation").value,
      composting: document.getElementById("composting").value,
      singleUsePlastic: document.getElementById("singleUsePlastic").value,
    };

    // Calculate footprint using external library
    const results = calculateTotalFootprint(inputs);
    currentCalculatedFootprint = results.total;

    // Display Results
    displayFootprintResults(
      results.total,
      results.energy,
      results.mobility,
      results.diet,
      results.waste,
    );
  });
}

function displayFootprintResults(total, energy, mobility, diet, waste) {
  const annual = (total * 12) / 1000; // tonnes per year

  // Update numbers
  document.getElementById("userScore").textContent = total.toFixed(1);
  document.getElementById("userScoreAnnual").textContent = annual.toFixed(2);

  // Meter Fill (max 800 kg/mo)
  const maxMeterVal = 800;
  const meterFillPct = Math.min((total / maxMeterVal) * 100, 100);
  document.getElementById("meterFill").style.width = `${meterFillPct}%`;

  // Dynamic context narrative
  let contextText = "";
  if (total < 120) {
    contextText =
      "Outstanding! Your footprint is exceptionally low, well below regional averages. Your conscious energy, transit, and diet habits are setting a template for minimal environmental drag.";
  } else if (total >= 120 && total < 250) {
    contextText =
      "Admirable effort. You are aligned with or slightly above regional baselines, and significantly cleaner than global individual averages. Minor shifts in local transport or waste will push you to exemplary levels.";
  } else if (total >= 250 && total < 450) {
    contextText =
      "Moderate footprint. Your energy consumption and transit emissions reflect standard modern lifestyles, but place you closer to high-intensity global benchmarks. Consider optimizing your electric loads or adding pledges.";
  } else {
    contextText =
      "High emission trajectory. Your monthly footprint is heavy. Coal-based electricity, private travel, or non-segregated waste are driving up your score. Review the Pledge Hub to actively offset and prune your emissions.";
  }
  document.getElementById("scoreContextText").textContent = contextText;

  // Breakdown percentages
  const energyPct = Math.round((energy / total) * 100) || 0;
  const mobilityPct = Math.round((mobility / total) * 100) || 0;
  const dietPct = Math.round((diet / total) * 100) || 0;
  const wastePct = 100 - energyPct - mobilityPct - dietPct; // avoid rounding offsets

  document.getElementById("breakdownEnergyPct").textContent = `${energyPct}%`;
  document.getElementById("breakdownMobilityPct").textContent =
    `${mobilityPct}%`;
  document.getElementById("breakdownLifestylePct").textContent = `${dietPct}%`;
  document.getElementById("breakdownWastePct").textContent = `${wastePct}%`;

  document.getElementById("barEnergy").style.width = `${energyPct}%`;
  document.getElementById("barMobility").style.width = `${mobilityPct}%`;
  document.getElementById("barLifestyle").style.width = `${dietPct}%`;
  document.getElementById("barWaste").style.width = `${wastePct}%`;

  // Update Pledge Hub dashboard defaults
  updatePledgeDashboard(total);

  // Play result arpeggio / chimes / warnings based on emission score
  SoundManager.playResult(total);

  // Show Results Screen
  calcResults.classList.remove("hidden");
}

if (recalcBtn) {
  recalcBtn.addEventListener("click", () => {
    calcResults.classList.add("hidden");
  });
}

// Pledge Hub interactive checkbox calculation logic
const pledges = document.querySelectorAll(".pledge-checkbox");
const dashInitial = document.getElementById("dashInitial");
const dashSavings = document.getElementById("dashSavings");
const dashResult = document.getElementById("dashResult");
const dashTrees = document.getElementById("dashTrees");
const headerSavingsVal = document.getElementById("headerSavingsVal");

const congratsDialog = document.getElementById("congratsDialog");
const closeCongratsBtn = document.getElementById("closeCongratsBtn");
let congratsTimeoutId = null;
let congratsFadeTimeoutId = null;
let lastPledgeCount = 0;

function showCelebrationModal() {
  if (!congratsDialog) return;

  // Clear any existing timeouts to prevent overlapping logic
  clearCongratsTimeouts();

  // Play audio congrats chime
  SoundManager.playCongratsChime();

  // Reset SVG animation state by removing and re-adding class
  congratsDialog.classList.remove("grow-active", "fading-out");

  // Show dialog modal
  congratsDialog.showModal();

  // Small delay to trigger the SVG CSS transition/animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      congratsDialog.classList.add("grow-active");
    });
  });
}

function closeCelebrationModal() {
  if (!congratsDialog || !congratsDialog.open) return;

  clearCongratsTimeouts();
  congratsDialog.classList.add("fading-out");

  setTimeout(() => {
    congratsDialog.close();
    congratsDialog.classList.remove("grow-active", "fading-out");
  }, 500);
}

function clearCongratsTimeouts() {
  if (congratsTimeoutId) {
    clearTimeout(congratsTimeoutId);
    congratsTimeoutId = null;
  }
  if (congratsFadeTimeoutId) {
    clearTimeout(congratsFadeTimeoutId);
    congratsFadeTimeoutId = null;
  }
}

// Bind close button
if (closeCongratsBtn) {
  closeCongratsBtn.addEventListener("click", closeCelebrationModal);
}

// Fallback for light-dismiss on backdrop click & Esc key close
if (congratsDialog) {
  congratsDialog.addEventListener("close", () => {
    clearCongratsTimeouts();
    congratsDialog.classList.remove("grow-active", "fading-out");
  });

  // Backdrop click dismissal logic
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    congratsDialog.addEventListener("click", (event) => {
      if (event.target !== congratsDialog) return;

      const rect = congratsDialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (isDialogContent) return;

      closeCelebrationModal();
    });
  }
}

function updatePledgeDashboard(initialFootprint = currentCalculatedFootprint) {
  if (
    !dashInitial ||
    !dashSavings ||
    !dashResult ||
    !dashTrees ||
    !headerSavingsVal
  )
    return;

  // Collect checked pledge values
  const activeValues = [];
  pledges.forEach((pledge) => {
    if (pledge.checked) {
      activeValues.push(parseFloat(pledge.value));
    }
  });

  // Calculate pledge dashboard statistics using calculations module
  const savingsResults = calculatePledgeSavings(activeValues, initialFootprint);

  // Update DOM elements
  dashInitial.textContent = initialFootprint.toFixed(1);
  dashSavings.textContent = savingsResults.savings.toFixed(1);
  dashResult.textContent = savingsResults.optimizedFootprint.toFixed(1);
  dashTrees.textContent = savingsResults.treesOffset.toFixed(1);
  headerSavingsVal.textContent = savingsResults.savings.toFixed(0);

  const headerSavingsValMobile = document.getElementById(
    "headerSavingsValMobile",
  );
  if (headerSavingsValMobile) {
    headerSavingsValMobile.textContent = savingsResults.savings.toFixed(0);
  }

  // Re-draw tree based on the optimized carbon footprint and active pledges!
  const currentCount = pledgesCheckedCount();
  drawDigitalCanopy(savingsResults.optimizedFootprint, currentCount);

  // Trigger celebration modal when all pledges are checked for the first time
  if (currentCount === pledges.length && lastPledgeCount < pledges.length) {
    showCelebrationModal();
  }
  lastPledgeCount = currentCount;
}

function pledgesCheckedCount() {
  const pledges = document.querySelectorAll(".pledge-checkbox");
  let count = 0;
  pledges.forEach((p) => {
    if (p.checked) count++;
  });
  return count;
}

// Bind checkbox changes with custom guitar pluck sound feedback
pledges.forEach((pledge, index) => {
  pledge.addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    SoundManager.playGuitarPluck(index, isChecked);
    updatePledgeDashboard(currentCalculatedFootprint);
  });
});

// Smooth scrolling helper for anchors (e.g. "Begin Carbon Lab", navigation, scroll indicators)
document
  .querySelectorAll(
    ".nav-link, .scroll-indicator, #startBtn, .drawer-nav-link, .learn-cta",
  )
  .forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

// Video Play/Pause & Lazy-Loading Controller (Aerial Forest Background Video Loop)
function initLazyLoadVideo() {
  const treeVideo = document.getElementById("treeVideo");
  const videoControlBtn = document.getElementById("videoControlBtn");
  if (!treeVideo || !videoControlBtn) return;

  // Play/Pause Click Handler
  videoControlBtn.addEventListener("click", () => {
    if (treeVideo.paused) {
      treeVideo
        .play()
        .then(() => {
          videoControlBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
          videoControlBtn.setAttribute("aria-label", "Pause video");
        })
        .catch(() => {});
    } else {
      treeVideo.pause();
      videoControlBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
      videoControlBtn.setAttribute("aria-label", "Play video");
    }
  });

  // Intersection Observer to lazy-play when scrolled close to view
  if (!("IntersectionObserver" in window)) {
    treeVideo
      .play()
      .then(() => {
        videoControlBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        videoControlBtn.setAttribute("aria-label", "Pause video");
      })
      .catch(() => {});
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          treeVideo
            .play()
            .then(() => {
              videoControlBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
              videoControlBtn.setAttribute("aria-label", "Pause video");
            })
            .catch(() => {});
          obs.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px 300px 0px", // triggers play 300px before scrolling into view
      threshold: 0.01,
    },
  );

  observer.observe(treeVideo);
}

// Interactive Climate 101 Learn Cards
function initLearnCards() {
  const learnCards = document.querySelectorAll(".learn-card");
  learnCards.forEach((card) => {
    // Mouse coordinates for premium hover glow gradient
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });

    // Interactive quick-fact toggle on click
    card.addEventListener("click", () => {
      card.classList.toggle("active");
      const isExpanded = card.classList.contains("active");
      card.setAttribute("aria-expanded", isExpanded ? "true" : "false");

      // Play a neat click audio chime
      SoundManager.playClick();
    });

    // Accessibility: Keyboard interaction with Enter or Space keys
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });
}

// Initial draw sequence (seedling state by default based on fallback baseline)
function initializeApp() {
  initTheme();
  initLearnCards();
  drawDigitalCanopy(180, 0);
  updatePledgeDashboard(180);
  initLazyLoadVideo();
}

// Lazy‑load SVG “vector‑foliage” layers using IntersectionObserver
function initLazyLoadSVGs() {
  const foliageElements = document.querySelectorAll(".vector-foliage");
  if (!("IntersectionObserver" in window)) {
    // Fallback: make all visible immediately
    foliageElements.forEach((el) => el.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px 200px 0px", // preload slightly before entering view
      threshold: 0.1,
    },
  );
  foliageElements.forEach((el) => observer.observe(el));
}

// Call lazy‑load init after DOM ready (before drawing canopy)
function initEcoIllustrationCacheCheck() {
  const ecoImg = document.querySelector(".eco-illustration");
  if (ecoImg) {
    if (ecoImg.complete) {
      ecoImg.classList.add("loaded");
    } else {
      ecoImg.addEventListener("load", () => {
        ecoImg.classList.add("loaded");
      });
    }
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => {
    initLazyLoadSVGs();
    initEcoIllustrationCacheCheck();
    initializeApp();
  });
} else {
  initLazyLoadSVGs();
  initEcoIllustrationCacheCheck();
  initializeApp();
}

// Color Scheme / Theme Toggle Controller
function initTheme() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeToggleIcon = document.getElementById("themeToggleIcon");
  if (!themeToggleBtn || !themeToggleIcon) return;

  // Retrieve pinned theme initialized by FOUC script
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "dark";
  updateToggleIcon(currentTheme);

  themeToggleBtn.addEventListener("click", () => {
    const oldTheme =
      document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = oldTheme === "dark" ? "light" : "dark";

    // Apply soft layout animation transition
    document.documentElement.classList.add("theme-transition");

    // Set theme parameters
    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.style.colorScheme = newTheme;
    localStorage.setItem("theme", newTheme);

    updateToggleIcon(newTheme);

    // Prune transitions after completion
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 500);
  });
}

function updateToggleIcon(theme) {
  const themeToggleIcon = document.getElementById("themeToggleIcon");
  if (!themeToggleIcon) return;
  if (theme === "dark") {
    themeToggleIcon.className = "bi bi-moon-fill";
  } else {
    themeToggleIcon.className = "bi bi-sun-fill";
  }
}

// Mobile Navigation Drawer popover logic
function initNavigationDrawer() {
  const drawer = document.getElementById("drawer");
  const openBtn = document.getElementById("hamburgerMenuBtn");
  const closeBtn = document.getElementById("drawerCloseBtn");
  if (!drawer || !openBtn || !closeBtn) return;

  const scroller = drawer.querySelector(".Drawer-scroller");
  const sheet = drawer.querySelector(".Drawer-sheet");
  if (!scroller || !sheet) return;

  function openDrawer() {
    drawer.showPopover();

    // Fallback: scroll immediately to closed target before sliding in
    if (!CSS.supports("scroll-initial-target", "nearest")) {
      scroller.scrollLeft = scroller.offsetWidth;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scroller.scrollTo({ left: 0, behavior: "auto" });
        });
      });
    } else {
      scroller.scrollTo({ left: 0, behavior: "auto" });
    }
  }

  function closeDrawer() {
    scroller.scrollTo({ left: scroller.offsetWidth, behavior: "auto" });
  }

  function onDrawerOpened() {
    document
      .querySelectorAll(
        ".app-header, .hero-section, .calculator-section, .grow-section, .pledges-section, .app-footer",
      )
      .forEach((el) => el.setAttribute("inert", ""));
    openBtn.setAttribute("aria-expanded", "true");
    sheet.focus();
  }

  // Set visible threshold for open/close checks
  const visibleThreshold = 1 / window.innerWidth;
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries.at(-1);
      if (entry.intersectionRatio < visibleThreshold) {
        onDrawerClosed();
      }
      if (entry.intersectionRatio === 1) {
        onDrawerOpened();
      }
    },
    { threshold: [visibleThreshold, 1] },
  );
  observer.observe(sheet);

  function onDrawerClosed() {
    try {
      drawer.hidePopover();
    } catch (e) {
      // Fallback catch to prevent execution halts
    }
    document
      .querySelectorAll(
        ".app-header, .hero-section, .calculator-section, .grow-section, .pledges-section, .app-footer",
      )
      .forEach((el) => el.removeAttribute("inert"));
    openBtn.setAttribute("aria-expanded", "false");
  }

  // Bind trigger buttons and handlers
  openBtn.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);

  // Close drawer if user clicks on backdrop area (outside of sheet)
  drawer.addEventListener("click", (event) => {
    if (!sheet.contains(event.target)) {
      closeDrawer();
    }
  });

  // Close drawer on link clicks inside the drawer
  const drawerLinks = drawer.querySelectorAll(".drawer-nav-link");
  drawerLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // Small delay to let smooth scroll trigger, then close
      setTimeout(closeDrawer, 150);
    });
  });

  // Escape key handler
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
    }
  });

  // Fallback for CSS scroll-driven backdrop animations
  if (!CSS.supports("animation-timeline: scroll()")) {
    scroller.addEventListener("scroll", () => {
      const ratio = 1 - scroller.scrollLeft / sheet.offsetWidth;
      drawer.style.setProperty(
        "--drawer-backdrop",
        Math.max(0, Math.min(ratio, 1)),
      );
    });
  }
}

// Call drawer initialization
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initNavigationDrawer);
} else {
  initNavigationDrawer();
}
