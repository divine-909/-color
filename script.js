const state = {
  palette: ["#f0f0f0"],
  backgroundMode: "gradient",
  gradientSelection: [],
  currentTemplate: "time",
  currentFont: "editorial-serif",
  textColor: "#161616",
  textColorMode: "auto",
  activeImageColor: "",
  texture: {
    type: "none",
    intensity: 18
  },
  particles: {
    enabled: false,
    shape: "circle",
    count: 18,
    size: 26,
    variation: 36
  },
  fontSizes: {
    time: 60,
    poetry: 42,
    free: 36
  },
  transform: {
    x: 0,
    y: 0,
    scale: 1
  },
  pointers: new Map(),
  pinchStartDistance: 0,
  pinchStartScale: 1,
  editorOpen: false
};

const elements = {
  controlsPanel: document.querySelector(".controls-panel"),
  editorToggle: document.querySelector("#editorToggle"),
  editorBody: document.querySelector("#editorBody"),
  panelBranchNav: document.querySelector("#panelBranchNav"),
  imageUpload: document.querySelector("#imageUpload"),
  posterFrame: document.querySelector("#posterFrame"),
  textHalf: document.querySelector("#textHalf"),
  textureOverlay: document.querySelector("#textureOverlay"),
  textLayer: document.querySelector("#textLayer"),
  imageStage: document.querySelector("#imageStage"),
  posterImage: document.querySelector("#posterImage"),
  particleLayer: document.querySelector("#particleLayer"),
  imagePlaceholder: document.querySelector("#imagePlaceholder"),
  paletteBar: document.querySelector("#paletteBar"),
  backgroundMode: document.querySelector("#backgroundMode"),
  gradientHint: document.querySelector("#gradientHint"),
  templateSelector: document.querySelector("#templateSelector"),
  ratioSelector: document.querySelector("#ratioSelector"),
  fontSelect: document.querySelector("#fontSelect"),
  textureSelect: document.querySelector("#textureSelect"),
  textureIntensityInput: document.querySelector("#textureIntensityInput"),
  textureIntensityValue: document.querySelector("#textureIntensityValue"),
  particleToggleBtn: document.querySelector("#particleToggleBtn"),
  particleShapeSelect: document.querySelector("#particleShapeSelect"),
  particleCountInput: document.querySelector("#particleCountInput"),
  particleCountValue: document.querySelector("#particleCountValue"),
  particleSizeInput: document.querySelector("#particleSizeInput"),
  particleSizeValue: document.querySelector("#particleSizeValue"),
  particleVariationInput: document.querySelector("#particleVariationInput"),
  particleVariationValue: document.querySelector("#particleVariationValue"),
  fontSizeInput: document.querySelector("#fontSizeInput"),
  fontSizeValue: document.querySelector("#fontSizeValue"),
  eyedropperBtn: document.querySelector("#eyedropperBtn"),
  resetTextColorBtn: document.querySelector("#resetTextColorBtn"),
  downloadBtn: document.querySelector("#downloadBtn"),
  textColorBar: document.querySelector("#textColorBar"),
  locationInput: document.querySelector("#locationInput"),
  timeInput: document.querySelector("#timeInput"),
  poetryInput: document.querySelector("#poetryInput"),
  freeTextInput: document.querySelector("#freeTextInput"),
  locationText: document.querySelector("#locationText"),
  timeText: document.querySelector("#timeText"),
  poetryText: document.querySelector("#poetryText"),
  freeText: document.querySelector("#freeText"),
  textEditorFields: document.querySelector("#textEditorFields")
};

const colorThief = typeof ColorThief !== "undefined" ? new ColorThief() : null;

function init() {
  bindEvents();
  syncTextInputs();
  renderPalette(state.palette);
  renderTextColorPalette();
  applyCurrentBackground();
  applyTexture();
  updateGradientHint();
  updateTemplateEditorVisibility();
  updateMobileEditorState();
  closeDrawer();
  applyTextStyles();
  syncParticleControls();
  renderParticles();
}

function bindEvents() {
  elements.editorToggle.addEventListener("click", toggleEditorPanel);
  elements.panelBranchNav.addEventListener("click", handleBranchChange);
  elements.editorBody.addEventListener("click", handleDrawerClose);
  elements.imageUpload.addEventListener("change", handleImageUpload);
  elements.backgroundMode.addEventListener("click", handleBackgroundModeChange);
  elements.templateSelector.addEventListener("click", handleTemplateChange);
  elements.ratioSelector.addEventListener("click", handleRatioChange);
  elements.fontSelect.addEventListener("change", handleFontChange);
  elements.textureSelect.addEventListener("change", handleTextureChange);
  elements.textureIntensityInput.addEventListener("input", handleTextureIntensityChange);
  elements.particleToggleBtn.addEventListener("click", toggleParticles);
  elements.particleShapeSelect.addEventListener("change", handleParticleShapeChange);
  elements.particleCountInput.addEventListener("input", handleParticleCountChange);
  elements.particleSizeInput.addEventListener("input", handleParticleSizeChange);
  elements.particleVariationInput.addEventListener("input", handleParticleVariationChange);
  elements.fontSizeInput.addEventListener("input", handleFontSizeChange);
  elements.eyedropperBtn.addEventListener("click", handleEyeDropper);
  elements.resetTextColorBtn.addEventListener("click", handleResetTextColor);
  elements.downloadBtn.addEventListener("click", downloadPoster);
  elements.paletteBar.addEventListener("click", handlePaletteClick);
  elements.textColorBar.addEventListener("click", handleTextColorClick);
  elements.locationInput.addEventListener("input", syncTextInputs);
  elements.timeInput.addEventListener("input", syncTextInputs);
  elements.poetryInput.addEventListener("input", syncTextInputs);
  elements.freeTextInput.addEventListener("input", syncTextInputs);
  window.addEventListener("resize", updateMobileEditorState);
  window.addEventListener("resize", renderParticles);

  elements.imageStage.addEventListener("pointerdown", handlePointerDown);
  elements.imageStage.addEventListener("pointermove", handlePointerMove);
  elements.imageStage.addEventListener("pointerup", handlePointerUp);
  elements.imageStage.addEventListener("pointercancel", handlePointerUp);
  elements.imageStage.addEventListener("wheel", handleWheelZoom, { passive: false });
}

function handleImageUpload(event) {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  const image = elements.posterImage;
  image.onload = () => {
    resetImageTransform();
    image.style.display = "block";
    elements.imagePlaceholder.style.display = "none";
    extractPaletteFromImage(image);
    URL.revokeObjectURL(objectUrl);
  };
  image.src = objectUrl;
}

function extractPaletteFromImage(image) {
  if (!colorThief) {
    return;
  }

  try {
    const palette = colorThief.getPalette(image, 6).map(rgbToHex);
    state.palette = palette.length ? palette : state.palette;
  } catch (error) {
    console.error("Palette extraction failed:", error);
  }

  if (state.backgroundMode === "gradient") {
    state.gradientSelection = state.palette.slice(0, 2);
  }
  renderPalette(state.palette);
  renderTextColorPalette();
  applyCurrentBackground();
  renderParticles();
}

function renderPalette(palette) {
  elements.paletteBar.innerHTML = "";
  palette.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "palette-swatch";
    swatch.style.background = color;
    swatch.dataset.color = color;
    swatch.dataset.code = color;
    if (state.gradientSelection.includes(color)) {
      swatch.classList.add("is-gradient-source");
    }
    if (state.activeImageColor && state.activeImageColor.toUpperCase() === color.toUpperCase()) {
      swatch.classList.add("is-revealed");
    }
    elements.paletteBar.appendChild(swatch);
  });
}

function handlePaletteClick(event) {
  const target = event.target.closest(".palette-swatch");

  if (!target) {
    return;
  }

  const color = target.dataset.color;
  state.activeImageColor = color;
  revealSwatch(elements.paletteBar, color);

  if (state.backgroundMode === "solid") {
    state.gradientSelection = [];
    applyBackground(color);
    renderPalette(state.palette);
    renderParticles();
    return;
  }

  if (state.gradientSelection.length === 2) {
    state.gradientSelection = [];
  }

  state.gradientSelection.push(color);
  state.gradientSelection = [...new Set(state.gradientSelection)];
  renderPalette(state.palette);
  applyCurrentBackground();
}

function handleBackgroundModeChange(event) {
  const button = event.target.closest("button[data-mode]");

  if (!button) {
    return;
  }

  state.backgroundMode = button.dataset.mode;
  setActiveButton(elements.backgroundMode, button, "[data-mode]");
  state.gradientSelection = state.backgroundMode === "gradient"
    ? state.palette.slice(0, 2)
    : [];
  renderPalette(state.palette);
  updateGradientHint();
  applyCurrentBackground();
  renderParticles();
}

function handleTemplateChange(event) {
  const button = event.target.closest("button[data-template]");

  if (!button) {
    return;
  }

  state.currentTemplate = button.dataset.template;
  setActiveButton(elements.templateSelector, button, "[data-template]");

  document.querySelectorAll("[data-template-panel]").forEach((panel) => {
    panel.classList.toggle("is-visible", panel.dataset.templatePanel === state.currentTemplate);
  });
  updateTemplateEditorVisibility();
  applyTextStyles();
}

function handleRatioChange(event) {
  const button = event.target.closest("button[data-aspect]");

  if (!button) {
    return;
  }

  setActiveButton(elements.ratioSelector, button, "[data-aspect]");
  elements.posterFrame.style.setProperty("--poster-ratio", button.dataset.aspect);
}

function handleFontChange(event) {
  const value = event.target.value;
  state.currentFont = value;
  elements.textLayer.className = `text-layer font-${value}`;
}

function handleTextureChange(event) {
  state.texture.type = event.target.value;
  applyTexture();
}

function handleTextureIntensityChange(event) {
  state.texture.intensity = Number(event.target.value);
  applyTexture();
}

function handleFontSizeChange(event) {
  state.fontSizes[state.currentTemplate] = Number(event.target.value);
  applyTextStyles();
}

function toggleParticles() {
  state.particles.enabled = !state.particles.enabled;
  syncParticleControls();
  renderParticles();
}

function handleParticleShapeChange(event) {
  state.particles.shape = event.target.value;
  renderParticles();
}

function handleParticleCountChange(event) {
  state.particles.count = Number(event.target.value);
  syncParticleControls();
  renderParticles();
}

function handleParticleSizeChange(event) {
  state.particles.size = Number(event.target.value);
  syncParticleControls();
  renderParticles();
}

function handleParticleVariationChange(event) {
  state.particles.variation = Number(event.target.value);
  syncParticleControls();
  renderParticles();
}

function handleBranchChange(event) {
  const button = event.target.closest("button[data-branch]");

  if (!button) {
    return;
  }

  setActiveButton(elements.panelBranchNav, button, "[data-branch]");
  openDrawer(button.dataset.branch);
}

function handleDrawerClose(event) {
  const button = event.target.closest("[data-close-drawer]");

  if (!button) {
    return;
  }

  closeDrawer();
}

function openDrawer(branch) {
  elements.editorBody.classList.add("is-drawer-open");
  document.querySelectorAll("[data-branch-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.branchPanel === branch);
  });
}

function closeDrawer() {
  elements.editorBody.classList.remove("is-drawer-open");
  document.querySelectorAll("[data-branch-panel]").forEach((panel) => {
    panel.classList.remove("is-active");
  });
  elements.panelBranchNav.querySelectorAll("[data-branch]").forEach((button) => {
    button.classList.remove("is-active");
  });
}

async function handleEyeDropper() {
  if (!("EyeDropper" in window)) {
    window.alert("当前浏览器不支持 EyeDropper API。请使用最新版 Chrome / Edge。");
    return;
  }

  try {
    const eyeDropper = new window.EyeDropper();
    const result = await eyeDropper.open();
    state.palette = [result.sRGBHex, ...state.palette.filter((color) => color !== result.sRGBHex)].slice(0, 6);
    if (state.backgroundMode === "gradient") {
      state.gradientSelection = state.palette.slice(0, 2);
    }
    renderPalette(state.palette);
    renderTextColorPalette();
    applyCurrentBackground();
    renderParticles();
  } catch (error) {
    if (error?.name !== "AbortError") {
      console.error("EyeDropper failed:", error);
    }
  }
}

async function downloadPoster() {
  const canvas = await html2canvas(elements.posterFrame, {
    backgroundColor: null,
    scale: 2,
    useCORS: true
  });

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "split-poster.png";
  link.click();
}

function applyBackground(background) {
  elements.textHalf.style.background = background;
}

function renderTextColorPalette() {
  const swatches = ["#161616", "#FFFFFF", ...state.palette];
  const uniqueSwatches = [...new Set(swatches)];
  elements.textColorBar.innerHTML = "";

  uniqueSwatches.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "palette-swatch";
    swatch.style.background = color;
    swatch.dataset.color = color;
    swatch.dataset.code = color;
    if (state.textColor.toUpperCase() === color.toUpperCase()) {
      swatch.classList.add("is-gradient-source");
      swatch.classList.add("is-revealed");
    }
    elements.textColorBar.appendChild(swatch);
  });
}

function updateGradientHint() {
  elements.gradientHint.textContent = state.backgroundMode === "gradient"
    ? "默认使用图片前两个主色生成上下渐变，也可以手动点两个色块重组。"
    : "纯色模式下点击任意色块即可替换背景。";
}

function syncTextInputs() {
  elements.locationText.textContent = elements.locationInput.value || "未命名地点";
  elements.timeText.textContent = elements.timeInput.value || "00:00";
  elements.poetryText.textContent = elements.poetryInput.value || "请输入诗句";
  elements.freeText.textContent = elements.freeTextInput.value || "请输入文字";
}

function updateTemplateEditorVisibility() {
  elements.textEditorFields.querySelectorAll("[data-fields]").forEach((field) => {
    field.classList.toggle("is-hidden", field.dataset.fields !== state.currentTemplate);
  });
}

function handleTextColorClick(event) {
  const target = event.target.closest(".palette-swatch");

  if (!target) {
    return;
  }

  state.textColor = target.dataset.color;
  state.textColorMode = "manual";
  revealSwatch(elements.textColorBar, state.textColor);
  renderTextColorPalette();
  applyTextStyles();
}

function handleResetTextColor() {
  state.textColorMode = "auto";
  syncAutoTextColor();
}

function toggleEditorPanel() {
  state.editorOpen = !state.editorOpen;
  updateMobileEditorState();
}

function updateMobileEditorState() {
  elements.controlsPanel.classList.toggle("is-collapsed", !state.editorOpen && window.innerWidth <= 640);
  elements.editorToggle.setAttribute("aria-expanded", String(state.editorOpen));
  elements.editorToggle.textContent = state.editorOpen ? "收起编辑面板" : "展开编辑面板";
}

function applyCurrentBackground() {
  if (state.backgroundMode === "solid") {
    applyBackground(state.palette[0] || "#f0f0f0");
    syncAutoTextColor();
    return;
  }

  const [first = "#f0f0f0", second = first] = state.gradientSelection.length
    ? state.gradientSelection
    : state.palette;
  applyBackground(`linear-gradient(180deg, ${first}, ${second})`);
  syncAutoTextColor();
}

function applyTextStyles() {
  const currentSize = state.fontSizes[state.currentTemplate] || 48;
  const value = `${currentSize}px`;
  elements.fontSizeValue.textContent = value;
  elements.fontSizeInput.value = String(currentSize);
  elements.textLayer.style.color = state.textColor;

  elements.locationText.parentElement.style.fontSize = `${state.fontSizes.time}px`;
  elements.poetryText.style.fontSize = `${state.fontSizes.poetry}px`;
  elements.freeText.style.fontSize = `${state.fontSizes.free}px`;
}

function applyTexture() {
  elements.textureSelect.value = state.texture.type;
  elements.textureIntensityInput.value = String(state.texture.intensity);
  elements.textureIntensityValue.textContent = `${state.texture.intensity}%`;
  elements.textureOverlay.className = `texture-overlay texture-${state.texture.type}`;
  elements.textureOverlay.style.opacity = state.texture.type === "none"
    ? "0"
    : String(state.texture.intensity / 100);
}

function syncAutoTextColor() {
  if (state.textColorMode !== "auto") {
    return;
  }

  const sampleColors = state.backgroundMode === "solid"
    ? [state.palette[0] || "#f0f0f0"]
    : (state.gradientSelection.length ? state.gradientSelection : state.palette.slice(0, 2));
  const brightness = getAverageBrightness(sampleColors);
  state.textColor = brightness < 150 ? "#FFFFFF" : "#161616";
  renderTextColorPalette();
  applyTextStyles();
}

function revealSwatch(container, color) {
  container.querySelectorAll(".palette-swatch").forEach((swatch) => {
    swatch.classList.toggle(
      "is-revealed",
      swatch.dataset.color?.toUpperCase() === color.toUpperCase()
    );
  });
}

function syncParticleControls() {
  elements.particleToggleBtn.textContent = state.particles.enabled ? "关闭" : "开启";
  elements.particleShapeSelect.value = state.particles.shape;
  elements.particleCountInput.value = String(state.particles.count);
  elements.particleSizeInput.value = String(state.particles.size);
  elements.particleVariationInput.value = String(state.particles.variation);
  elements.particleCountValue.textContent = String(state.particles.count);
  elements.particleSizeValue.textContent = `${state.particles.size}px`;
  elements.particleVariationValue.textContent = `${state.particles.variation}%`;
}

function renderParticles() {
  elements.particleLayer.innerHTML = "";

  if (!state.particles.enabled) {
    return;
  }

  const stageWidth = elements.imageStage.clientWidth;
  const stageHeight = elements.imageStage.clientHeight;

  if (!stageWidth || !stageHeight) {
    return;
  }

  const particleColor = state.activeImageColor || state.palette[0] || "#161616";
  const variationFactor = state.particles.variation / 100;

  for (let index = 0; index < state.particles.count; index += 1) {
    const sizeJitter = 1 + ((Math.random() * 2 - 1) * variationFactor * 0.7);
    const size = Math.max(8, state.particles.size * sizeJitter);
    const rotation = (Math.random() * 2 - 1) * 90 * variationFactor;
    const x = Math.random() * Math.max(1, stageWidth - size);
    const y = Math.random() * Math.max(1, stageHeight - size);
    const opacity = 0.48 + Math.random() * 0.38;

    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.opacity = String(opacity);
    particle.style.transform = `rotate(${rotation}deg)`;
    particle.innerHTML = getParticleSvg(state.particles.shape, particleColor);
    elements.particleLayer.appendChild(particle);
  }
}

function getParticleSvg(shape, color) {
  const shapes = {
    circle: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="42" fill="${color}"/></svg>`,
    star: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="${color}" d="M50 10l11.2 22.7L86 36.3 68 53.8 72.4 79 50 67.2 27.6 79 32 53.8 14 36.3l24.8-3.6L50 10Z"/></svg>`,
    heart: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="${color}" d="M50 82C24 66 13 51 13 34c0-11 8-20 19-20 7 0 13 3.5 18 10 5-6.5 11-10 18-10 11 0 19 9 19 20 0 17-11 32-37 48Z"/></svg>`,
    diamond: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="${color}" d="M50 8 86 50 50 92 14 50 50 8Z"/></svg>`,
    raindrop: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="${color}" d="M50 8c17 24 28 38 28 53 0 16-12.5 29-28 29S22 77 22 61c0-15 11-29 28-53Z"/></svg>`
  };

  return shapes[shape] || shapes.circle;
}

function getAverageBrightness(colors) {
  if (!colors.length) {
    return 240;
  }

  const values = colors.map(hexToRgb).filter(Boolean).map(({ r, g, b }) => {
    return (r * 299 + g * 587 + b * 114) / 1000;
  });

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;

  if (full.length !== 6) {
    return null;
  }

  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function setActiveButton(container, activeButton, selector) {
  container.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle("is-active", button === activeButton);
  });
}

function resetImageTransform() {
  const stageRect = elements.imageStage.getBoundingClientRect();
  const image = elements.posterImage;
  const widthRatio = stageRect.width / image.naturalWidth;
  const heightRatio = stageRect.height / image.naturalHeight;
  state.transform.scale = Math.max(widthRatio, heightRatio);
  state.transform.x = 0;
  state.transform.y = 0;
  updateImageTransform();
}

function updateImageTransform() {
  const { x, y, scale } = state.transform;
  elements.posterImage.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
}

function handlePointerDown(event) {
  if (!elements.posterImage.src) {
    return;
  }

  elements.imageStage.setPointerCapture(event.pointerId);
  state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (state.pointers.size === 2) {
    const points = [...state.pointers.values()];
    state.pinchStartDistance = getDistance(points[0], points[1]);
    state.pinchStartScale = state.transform.scale;
  }
}

function handlePointerMove(event) {
  if (!state.pointers.has(event.pointerId)) {
    return;
  }

  const previous = state.pointers.get(event.pointerId);
  const current = { x: event.clientX, y: event.clientY };
  state.pointers.set(event.pointerId, current);

  if (state.pointers.size === 1) {
    state.transform.x += current.x - previous.x;
    state.transform.y += current.y - previous.y;
    updateImageTransform();
    return;
  }

  if (state.pointers.size === 2) {
    const points = [...state.pointers.values()];
    const distance = getDistance(points[0], points[1]);

    if (state.pinchStartDistance > 0) {
      const scaleFactor = distance / state.pinchStartDistance;
      state.transform.scale = clamp(state.pinchStartScale * scaleFactor, 0.2, 8);
      updateImageTransform();
    }
  }
}

function handlePointerUp(event) {
  state.pointers.delete(event.pointerId);

  if (state.pointers.size < 2) {
    state.pinchStartDistance = 0;
  }
}

function handleWheelZoom(event) {
  if (!elements.posterImage.src) {
    return;
  }

  event.preventDefault();
  const delta = event.deltaY < 0 ? 1.06 : 0.94;
  state.transform.scale = clamp(state.transform.scale * delta, 0.2, 8);
  updateImageTransform();
}

function getDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rgbToHex(rgb) {
  const [r, g, b] = rgb;
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

init();
