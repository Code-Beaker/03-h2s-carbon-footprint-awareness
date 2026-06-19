/**
 * Resolves the visual attributes of the virtual canopy tree based on carbon footprint.
 * Returns classification data for easy unit testing.
 */
export function getCanopyHealthState(footprint, activePledges) {
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

  return {
    depth,
    leafCount,
    leafColor,
    leafScale,
    statusText,
    badgeColor,
    showBlossoms,
  };
}

/**
 * Recursive Fractal Tree Drawer rendering inside SVG container treeGroup.
 */
export function drawDigitalCanopy(footprint, activePledges) {
  const treeGroup = document.getElementById("treeGroup");
  const treeStatusBadge = document.getElementById("treeStatusBadge");

  // Determine tree health state variables based on optimized carbon score
  const {
    depth,
    leafCount,
    leafColor,
    leafScale,
    statusText,
    badgeColor,
    showBlossoms,
  } = getCanopyHealthState(footprint, activePledges);

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
