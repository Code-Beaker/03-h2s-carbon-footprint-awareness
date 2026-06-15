// Dynamic Web Audio API Sound Generator (Zero assets, high performance)
const SoundManager = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  playClick() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  },

  playTabSwitch() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  },

  playGuitarPluck(index, isChecked) {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Pentatonic scale representing bright acoustic guitar strings: C4, D4, E4, G4, A4, C5, D5, E5, G5
    const scale = [
      261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99,
    ];
    const targetFreq = scale[index % scale.length];

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Checked is dynamic and bright (triangle); Unchecked is muted and detuned (sawtooth)
    osc.type = isChecked ? "triangle" : "sawtooth";

    // Emulate string tension bending/gliding into pitch on pluck
    if (isChecked) {
      osc.frequency.setValueAtTime(targetFreq * 0.98, now);
      osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.04);
    } else {
      osc.frequency.setValueAtTime(targetFreq, now);
      osc.frequency.linearRampToValueAtTime(targetFreq * 0.85, now + 0.14);
    }

    // Filter creates the bright pluck decay (Karplus-Strong string emulation)
    filter.type = "lowpass";
    filter.Q.value = 6;
    if (isChecked) {
      filter.frequency.setValueAtTime(targetFreq * 4, now);
      filter.frequency.exponentialRampToValueAtTime(
        targetFreq * 1.2,
        now + 0.18,
      );
    } else {
      filter.frequency.setValueAtTime(targetFreq * 1.5, now);
      filter.frequency.linearRampToValueAtTime(80, now + 0.14);
    }

    // Envelope for sharp pluck and ring-out
    if (isChecked) {
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    } else {
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + (isChecked ? 0.5 : 0.15));
  },

  playResult(score) {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (score < 180) {
      // VERY HAPPY arpeggio (C Major scale sweep up: C4 -> E4 -> G4 -> C5 -> E5 -> G5 -> C6)
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, index) => {
        const time = now + index * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.35);
      });
    } else {
      // VERY SAD warning arpeggio (C minor descending chord: C4 -> Ab3 -> F3 -> D3 -> C3)
      const notes = [261.63, 207.65, 174.61, 146.83, 130.81];
      notes.forEach((freq, index) => {
        const time = now + index * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.linearRampToValueAtTime(freq * 0.95, time + 0.45); // sad slide down

        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.55);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.55);
      });
    }
  },

  playCongratsChime() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99, 1046.5];
    
    notes.forEach((freq, index) => {
      const time = now + index * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = index % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, time);
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 3, time);
      filter.frequency.exponentialRampToValueAtTime(80, time + 0.8);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.08, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 1.2);
    });
  },
};

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

// Regional emission factors (coal grid, LPG cylinders, transit splits)
const EMISSION_FACTORS = {
  electricity: 0.82, // kg CO2e per kWh (coal-dominated electricity grid)
  lpgCylinder: 14.2 * 2.984, // ~42.37 kg CO2e per 14.2 kg cylinder
  png: 2.02, // kg CO2e per cubic meter (PNG)
  twoWheeler: 0.045, // kg CO2e per km (average petrol scooter/bike)
  carPetrol: 0.18, // kg CO2e per km
  carDiesel: 0.2, // kg CO2e per km
  carCng: 0.12, // kg CO2e per km
  carEv: 0.07, // kg CO2e per km (efficiency ~7 km/kWh charged on coal grid)
  publicTransit: 0.015, // kg CO2e per km (weighted mix of local train, metro & buses)
  dietBase: {
    "vegetarian-low": 80,
    "vegetarian-high": 110,
    eggetarian: 120,
    "nonveg-low": 150,
    "nonveg-high": 220,
  },
  diningOutMultiplier: 6, // kg CO2e per occurrence
  wasteBase: {
    yes: 5,
    partial: 12,
    no: 20,
  },
  wasteCompostNo: 15, // kg CO2e added if wet waste is not composted
  plasticAddition: {
    minimal: 0,
    moderate: 4,
    high: 8,
  },
};

let currentCalculatedFootprint = 150; // default initial fallback footprint

const footprintForm = document.getElementById("footprintForm");
const calcResults = document.getElementById("calcResults");
const recalcBtn = document.getElementById("recalcBtn");

if (footprintForm) {
  footprintForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Gather inputs
    const electricity =
      parseFloat(document.getElementById("electricity").value) || 0;
    const cookingFuel = document.getElementById("cookingFuel").value;
    const lpgCylinders =
      parseFloat(document.getElementById("lpgCylinders").value) || 0;
    const pngUsage = parseFloat(document.getElementById("pngUsage").value) || 0;

    const twoWheeler =
      parseFloat(document.getElementById("twoWheeler").value) || 0;
    const carTravel =
      parseFloat(document.getElementById("carTravel").value) || 0;
    const carFuel = document.getElementById("carFuel").value;
    const publicTransit =
      parseFloat(document.getElementById("publicTransit").value) || 0;

    const dietType = document.getElementById("dietType").value;
    const diningOut =
      parseFloat(document.getElementById("diningOut").value) || 0;
    const localFood = document.getElementById("localFood").value;

    const wasteSegregation = document.getElementById("wasteSegregation").value;
    const composting = document.getElementById("composting").value;
    const singleUsePlastic = document.getElementById("singleUsePlastic").value;

    // Calculations
    // 1. Energy
    let energyEmissions = electricity * EMISSION_FACTORS.electricity;
    if (cookingFuel === "lpg") {
      energyEmissions += lpgCylinders * EMISSION_FACTORS.lpgCylinder;
    } else if (cookingFuel === "png") {
      energyEmissions += pngUsage * EMISSION_FACTORS.png;
    }

    // 2. Mobility (daily to monthly * 30)
    let mobilityEmissions =
      twoWheeler * EMISSION_FACTORS.twoWheeler * 30 +
      publicTransit * EMISSION_FACTORS.publicTransit * 30;
    if (carTravel > 0) {
      let carFactor = EMISSION_FACTORS.carPetrol;
      if (carFuel === "diesel") carFactor = EMISSION_FACTORS.carDiesel;
      else if (carFuel === "cng") carFactor = EMISSION_FACTORS.carCng;
      else if (carFuel === "ev") carFactor = EMISSION_FACTORS.carEv;

      mobilityEmissions += carTravel * carFactor * 30;
    }

    // 3. Lifestyle
    let dietEmissions =
      EMISSION_FACTORS.dietBase[dietType] +
      diningOut * EMISSION_FACTORS.diningOutMultiplier;
    if (localFood === "mostly") {
      dietEmissions *= 0.9; // 10% reduction
    } else if (localFood === "rarely") {
      dietEmissions *= 1.15; // 15% increase
    }

    // 4. Waste
    let wasteEmissions = EMISSION_FACTORS.wasteBase[wasteSegregation];
    if (composting === "no") {
      wasteEmissions += EMISSION_FACTORS.wasteCompostNo;
    }
    wasteEmissions += EMISSION_FACTORS.plasticAddition[singleUsePlastic];

    // Total monthly footprint
    const totalFootprint =
      energyEmissions + mobilityEmissions + dietEmissions + wasteEmissions;
    currentCalculatedFootprint = totalFootprint;

    // Display Results
    displayFootprintResults(
      totalFootprint,
      energyEmissions,
      mobilityEmissions,
      dietEmissions,
      wasteEmissions,
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
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    congratsDialog.addEventListener("click", (event) => {
      if (event.target !== congratsDialog) return;

      const rect = congratsDialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      if (isDialogContent) return;

      closeCelebrationModal();
    });
  }
}

function updatePledgeDashboard(initialFootprint = currentCalculatedFootprint) {
  const pledges = document.querySelectorAll(".pledge-checkbox");
  const dashInitial = document.getElementById("dashInitial");
  const dashSavings = document.getElementById("dashSavings");
  const dashResult = document.getElementById("dashResult");
  const dashTrees = document.getElementById("dashTrees");
  const headerSavingsVal = document.getElementById("headerSavingsVal");

  if (!dashInitial || !dashSavings || !dashResult || !dashTrees || !headerSavingsVal) return;

  let savings = 0;

  // Calculate total active pledge values
  pledges.forEach((pledge) => {
    if (pledge.checked) {
      savings += parseFloat(pledge.value);
    }
  });

  // Calculate final result (cap at minimum 20 kg to represent unavoidable public overhead)
  const optimizedFootprint = Math.max(initialFootprint - savings, 20);
  const correctedSavings = initialFootprint - optimizedFootprint;

  // Equivalent trees (absorb 22 kg CO2 per year)
  // savings are monthly, so annual savings = correctedSavings * 12
  const treesOffset = (correctedSavings * 12) / 22;

  // Update DOM elements
  dashInitial.textContent = initialFootprint.toFixed(1);
  dashSavings.textContent = correctedSavings.toFixed(1);
  dashResult.textContent = optimizedFootprint.toFixed(1);
  dashTrees.textContent = treesOffset.toFixed(1);
  headerSavingsVal.textContent = correctedSavings.toFixed(0);

  const headerSavingsValMobile = document.getElementById("headerSavingsValMobile");
  if (headerSavingsValMobile) {
    headerSavingsValMobile.textContent = correctedSavings.toFixed(0);
  }

  // Re-draw tree based on the optimized carbon footprint and active pledges!
  const currentCount = pledgesCheckedCount();
  drawDigitalCanopy(optimizedFootprint, currentCount);

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

// Interactive SVG Tree Drawer (Virtual Canopy Simulator)

// Recursive Fractal Tree Drawer
function drawDigitalCanopy(footprint, activePledges) {
  const treeGroup = document.getElementById("treeGroup");
  const treeStatusBadge = document.getElementById("treeStatusBadge");

  // Determine tree health state variables based on optimized carbon score
  let depth = 4;
  let leafCount = 2;
  let leafColor = "#8a7043"; // Stressed/dry brown-green
  let leafScale = 0.8;
  let statusText = "Stressed";
  let badgeColor = "#E63946"; // Red
  let showBlossoms = false;

  if (footprint < 100) {
    depth = 6;
    leafCount = 5;
    leafColor = "#52B788"; // Lush emerald green
    leafScale = 1.2;
    statusText = "Flourishing Canopy";
    badgeColor = "#52B788"; // Emerald Green
    showBlossoms = activePledges >= 4; // Sprouts blossoms if pledges are high
  } else if (footprint >= 100 && footprint < 200) {
    depth = 5;
    leafCount = 4;
    leafColor = "#74C69D"; // Soft green
    leafScale = 1.0;
    statusText = "Growing Sapling";
    badgeColor = "#74C69D"; // Mint Green
    showBlossoms = activePledges >= 6;
  } else if (footprint >= 200 && footprint < 350) {
    depth = 4;
    leafCount = 3;
    leafColor = "#8D99AE"; // Pale grey-green
    leafScale = 0.9;
    statusText = "Young Seedling";
    badgeColor = "#F77F00"; // Amber
  }

  // Update status badge
  if (treeStatusBadge) {
    treeStatusBadge.textContent = statusText;
    treeStatusBadge.style.backgroundColor = badgeColor;
  }

  if (!treeGroup) return;

  // Clear previous drawing
  treeGroup.innerHTML = "";

  // Draw recursive branch function
  function createBranch(x1, y1, angle, currentDepth, maxLength, branchWidth) {
    if (currentDepth === 0) return;

    // Calculate endpoint
    const rad = (angle * Math.PI) / 180;
    const x2 = x1 + Math.cos(rad) * maxLength;
    const y2 = y1 + Math.sin(rad) * maxLength;

    // Draw branch line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    // Large trunk uses custom gradient
    line.setAttribute(
      "stroke",
      currentDepth > 3 ? "url(#trunkGrad)" : "#3e271a",
    );
    line.setAttribute("stroke-width", branchWidth);
    line.setAttribute("stroke-linecap", "round");

    // Add CSS stroke-draw animations
    const totalLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    line.style.strokeDasharray = totalLen;
    line.style.strokeDashoffset = totalLen;
    line.style.animation = `drawStroke 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards`;
    line.style.animationDelay = `${(depth - currentDepth) * 0.15}s`;

    treeGroup.appendChild(line);

    // If we are near the branch tips, draw foliage leaves
    if (currentDepth <= 2) {
      for (let i = 0; i < leafCount; i++) {
        // Random offset positioning along the branch
        const leafDist = Math.random() * maxLength;
        const leafAngle = angle + (Math.random() - 0.5) * 80;
        const lx = x1 + Math.cos(rad) * leafDist;
        const ly = y1 + Math.sin(rad) * leafDist;

        // Leaf path representing standard leafy silhouette
        const leaf = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        leaf.setAttribute("d", "M 0 0 C 3 -6, 9 -6, 12 0 C 9 6, 3 6, 0 0 Z");
        leaf.setAttribute("fill", leafColor);
        leaf.setAttribute(
          "transform",
          `translate(${lx}, ${ly}) rotate(${leafAngle}) scale(${leafScale * (0.6 + Math.random() * 0.4)})`,
        );

        leaf.style.opacity = "0";
        leaf.style.transition = "opacity 0.5s ease-out";
        leaf.style.transitionDelay = `${(depth - currentDepth) * 0.2 + Math.random() * 0.4}s`;

        treeGroup.appendChild(leaf);

        // Trigger transition paint asynchronously
        setTimeout(() => {
          leaf.style.opacity = "1";
        }, 50);

        // Add pink blossom flowers if flourishing state permits
        if (showBlossoms && Math.random() > 0.65) {
          const blossom = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle",
          );
          blossom.setAttribute("cx", lx);
          blossom.setAttribute("cy", ly - 4);
          blossom.setAttribute("r", 3 * leafScale);
          blossom.setAttribute("fill", "#F28482"); // Blossom Pink

          blossom.style.opacity = "0";
          blossom.style.transition = "opacity 0.6s ease-out";
          blossom.style.transitionDelay = `${(depth - currentDepth) * 0.25 + 0.3}s`;

          treeGroup.appendChild(blossom);
          setTimeout(() => {
            blossom.style.opacity = "1";
          }, 70);
        }
      }
    }

    // Recursion steps
    const newDepth = currentDepth - 1;
    const newWidth = branchWidth * 0.65;
    const branchLengthFactor = 0.72 + Math.random() * 0.08;

    // Split branches left/right with random variation
    createBranch(
      x2,
      y2,
      angle - 25 - Math.random() * 12,
      newDepth,
      maxLength * branchLengthFactor,
      newWidth,
    );
    createBranch(
      x2,
      y2,
      angle + 25 + Math.random() * 12,
      newDepth,
      maxLength * branchLengthFactor,
      newWidth,
    );
  }

  // Start initial trunk call: root center bottom (200, 360), pointing straight up (-90 deg)
  const initialTrunkLength = 70;
  const initialBranchWidth = 8;
  createBranch(200, 360, -90, depth, initialTrunkLength, initialBranchWidth);
}

// Smooth scrolling helper for anchors (e.g. "Begin Carbon Lab", navigation, scroll indicators)
document
  .querySelectorAll(".nav-link, .scroll-indicator, #startBtn, .drawer-nav-link")
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
      treeVideo.play().then(() => {
        videoControlBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        videoControlBtn.setAttribute("aria-label", "Pause video");
      }).catch(() => {});
    } else {
      treeVideo.pause();
      videoControlBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
      videoControlBtn.setAttribute("aria-label", "Play video");
    }
  });

  // Intersection Observer to lazy-play when scrolled close to view
  if (!('IntersectionObserver' in window)) {
    treeVideo.play().then(() => {
      videoControlBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
      videoControlBtn.setAttribute("aria-label", "Pause video");
    }).catch(() => {});
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        treeVideo.play().then(() => {
          videoControlBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
          videoControlBtn.setAttribute("aria-label", "Pause video");
        }).catch(() => {});
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: "0px 0px 300px 0px", // triggers play 300px before scrolling into view
    threshold: 0.01
  });

  observer.observe(treeVideo);
}

// Initial draw sequence (seedling state by default based on fallback baseline)
function initializeApp() {
  initTheme();
  drawDigitalCanopy(180, 0);
  updatePledgeDashboard(180);
  initLazyLoadVideo();
}

// Lazy‑load SVG “vector‑foliage” layers using IntersectionObserver
function initLazyLoadSVGs() {
  const foliageElements = document.querySelectorAll('.vector-foliage');
  if (!('IntersectionObserver' in window)) {
    // Fallback: make all visible immediately
    foliageElements.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px 200px 0px', // preload slightly before entering view
    threshold: 0.1,
  });
  foliageElements.forEach(el => observer.observe(el));
}

// Call lazy‑load init after DOM ready (before drawing canopy)
function initEcoIllustrationCacheCheck() {
  const ecoImg = document.querySelector('.eco-illustration');
  if (ecoImg) {
    if (ecoImg.complete) {
      ecoImg.classList.add('loaded');
    } else {
      ecoImg.addEventListener('load', () => {
        ecoImg.classList.add('loaded');
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
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  updateToggleIcon(currentTheme);

  themeToggleBtn.addEventListener("click", () => {
    const oldTheme = document.documentElement.getAttribute("data-theme") || "dark";
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
  const drawer = document.getElementById('drawer');
  const openBtn = document.getElementById('hamburgerMenuBtn');
  const closeBtn = document.getElementById('drawerCloseBtn');
  if (!drawer || !openBtn || !closeBtn) return;

  const scroller = drawer.querySelector('.Drawer-scroller');
  const sheet = drawer.querySelector('.Drawer-sheet');
  if (!scroller || !sheet) return;

  function openDrawer() {
    drawer.showPopover();
    
    // Fallback: scroll immediately to closed target before sliding in
    if (!CSS.supports('scroll-initial-target', 'nearest')) {
      scroller.scrollLeft = scroller.offsetWidth;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scroller.scrollTo({left: 0, behavior: 'auto'});
        });
      });
    } else {
      scroller.scrollTo({left: 0, behavior: 'auto'});
    }
  }

  function closeDrawer() {
    scroller.scrollTo({left: scroller.offsetWidth, behavior: 'auto'});
  }

  function onDrawerOpened() {
    document.querySelectorAll('.app-header, .hero-section, .calculator-section, .visualizer-section, .pledges-section, .app-footer').forEach(el => el.setAttribute('inert', ''));
    openBtn.setAttribute('aria-expanded', 'true');
    sheet.focus();
  }

  function onDrawerClosed() {
    try {
      drawer.hidePopover();
    } catch (e) {
      // Fallback catch to prevent execution halts
    }
    document.querySelectorAll('.app-header, .hero-section, .calculator-section, .visualizer-section, .pledges-section, .app-footer').forEach(el => el.removeAttribute('inert'));
    openBtn.setAttribute('aria-expanded', 'false');
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
    {threshold: [visibleThreshold, 1]}
  );
  observer.observe(sheet);

  // Bind trigger buttons and handlers
  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);

  // Close drawer if user clicks on backdrop area (outside of sheet)
  drawer.addEventListener('click', (event) => {
    if (!sheet.contains(event.target)) {
      closeDrawer();
    }
  });

  // Close drawer on link clicks inside the drawer
  const drawerLinks = drawer.querySelectorAll('.drawer-nav-link');
  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      // Small delay to let smooth scroll trigger, then close
      setTimeout(closeDrawer, 150);
    });
  });

  // Escape key handler
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDrawer();
    }
  });

  // Fallback for CSS scroll-driven backdrop animations
  if (!CSS.supports('animation-timeline: scroll()')) {
    scroller.addEventListener('scroll', () => {
      const ratio = 1 - scroller.scrollLeft / sheet.offsetWidth;
      drawer.style.setProperty('--drawer-backdrop', Math.max(0, Math.min(ratio, 1)));
    });
  }
}

// Call drawer initialization
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initNavigationDrawer);
} else {
  initNavigationDrawer();
}


