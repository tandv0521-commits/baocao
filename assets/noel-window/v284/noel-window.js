(() => {
  'use strict';

  const ASSET_BASE = 'assets/noel-window/v284';
  const MODE_STORAGE_KEY = 'noel_window_scene_mode_v1';
  const UTC7_MS = 7 * 3600 * 1000;
  const DAY_MS = 86400000;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const TAU = Math.PI * 2;

  // ---------------- PURE HELPERS (EXPOSED FOR UNIT VERIFICATION) ----------------
  function getVietnamParts(nowDate = new Date()) {
    const dt = nowDate instanceof Date ? nowDate : new Date(nowDate);
    if (!Number.isFinite(dt.getTime())) throw new RangeError('Invalid date');
    const vn = new Date(dt.getTime() + UTC7_MS);
    let year = vn.getUTCFullYear();
    let month = vn.getUTCMonth() + 1;
    let day = vn.getUTCDate();
    let hour = vn.getUTCHours();
    let minute = vn.getUTCMinutes();
    try {
      if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
        const parts = new Intl.DateTimeFormat('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23'
        }).formatToParts(dt);
        const pick = t => {
          const item = parts.find(p => p.type === t);
          return item ? parseInt(item.value, 10) : NaN;
        };
        const y = pick('year'), m = pick('month'), d = pick('day'), h = pick('hour'), mi = pick('minute');
        if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d) && Number.isFinite(h) && Number.isFinite(mi)) {
          year = y; month = m; day = d; hour = h % 24; minute = mi;
        }
      }
    } catch (e) { }
    return { year, month, day, hour, minute };
  }

  function resolveAutoSceneMode(nowDate = new Date()) {
    const p = getVietnamParts(nowDate);
    const mins = p.hour * 60 + p.minute;
    // Day: 06:00 -> 17:29 (360 .. 1049); Night: 17:30 -> 05:59
    return mins >= 360 && mins < 1050 ? 'day' : 'night';
  }

  function getSmartReportPeriodVN(nowDate = new Date()) {
    const p = getVietnamParts(nowDate);
    let m = p.month;
    let y = p.year;
    if (p.day <= 10) {
      m -= 1;
      if (m < 1) { m = 12; y -= 1; }
    }
    return { m, y, label: `Kỳ ${String(m).padStart(2, '0')}/${y}` };
  }

  function getChristmasCountdownInfo(nowDate = new Date()) {
    const p = getVietnamParts(nowDate);
    const todayUtc = Date.UTC(p.year, p.month - 1, p.day);
    const xmasUtc = Date.UTC(p.year, 11, 25);
    const diffDays = Math.round((xmasUtc - todayUtc) / DAY_MS);
    if (diffDays > 0) {
      return { visible: true, days: diffDays, text: `Còn ${diffDays} ngày tới 25/12` };
    }
    if (diffDays === 0) {
      return { visible: true, days: 0, text: 'Hôm nay 25/12 · Giáng Sinh An Lành' };
    }
    return { visible: false, days: diffDays, text: '' };
  }

  // ---------------- WINDOW VISITORS RIG CONSTANTS (24.3 KB PNG) ----------------
  const VISITOR_PARTS = {
    girlBody: { rect: [3, 3, 175, 175], size: [256, 256] },
    blueBody: { rect: [181, 3, 163, 163], size: [256, 256] },
    greenBody: { rect: [347, 3, 150, 150], size: [256, 256] },
    girlCloth: { rect: [3, 181, 33, 72], size: [36, 112] },
    blueCloth: { rect: [39, 181, 31, 67], size: [36, 112] },
    greenCloth: { rect: [73, 181, 28, 62], size: [36, 112] },
    girlFree: { rect: [104, 181, 29, 33], size: [64, 74], anchor: [38.44, 66.65], scale: 0.65 },
    blueLeft: { rect: [136, 181, 25, 31], size: [61, 76], anchor: [18.09, 72.93], scale: 0.65 },
    blueRight: { rect: [164, 181, 26, 31], size: [62, 76], anchor: [42.99, 72.86], scale: 0.65 },
    greenLeft: { rect: [193, 181, 23, 25], size: [45, 50], anchor: [11.14, 10.19], scale: 0.9 },
    greenRight: { rect: [219, 181, 22, 25], size: [44, 50], anchor: [7.85, 11.10], scale: 0.9 },
    girlSupport: { rect: [244, 181, 26, 14], size: [58, 30], anchor: [46.65, 15.78], scale: 0.65 },
    girlClosed0: { rect: [273, 181, 17, 13], size: [24, 18], target: [118.98, 65.69] },
    girlClosed1: { rect: [293, 181, 17, 13], size: [24, 18], target: [141.46, 65.34] },
    blueClosed0: { rect: [313, 181, 16, 12], size: [24, 18], target: [117.16, 54.08] },
    blueClosed1: { rect: [332, 181, 16, 12], size: [24, 18], target: [139.84, 54.00] },
    blueLeft0: { rect: [351, 181, 16, 12], size: [24, 18], target: [117.16, 54.08] },
    blueLeft1: { rect: [370, 181, 16, 12], size: [24, 18], target: [139.84, 54.00] },
    blueRight0: { rect: [389, 181, 16, 12], size: [24, 18], target: [117.16, 54.08] },
    blueRight1: { rect: [408, 181, 16, 12], size: [24, 18], target: [139.84, 54.00] },
    greenClosed0: { rect: [427, 181, 14, 11], size: [24, 18], target: [115.30, 64.33] },
    greenClosed1: { rect: [444, 181, 14, 11], size: [24, 18], target: [138.74, 64.22] },
    greenDown0: { rect: [461, 181, 14, 11], size: [24, 18], target: [115.30, 64.33] },
    greenDown1: { rect: [478, 181, 14, 11], size: [24, 18], target: [138.74, 64.22] }
  };

  const DAY_VISITORS = [
    { name: 'girl', action: 'greeting', delay: 0.65, enter: 1.65, activity: 2.85, rest: 0.8, leave: 1.55, x: 215, mobileX: 215, size: 176, mobileSize: 112 },
    { name: 'blue', action: 'peering', delay: 0.65, enter: 1.6, activity: 3.8, rest: 0.9, leave: 1.6, x: 215, mobileX: 215, size: 164, mobileSize: 112 },
    { name: 'green', action: 'warming', delay: 0.65, enter: 1.7, activity: 3.3, rest: 0.7, leave: 1.6, x: 215, mobileX: 215, size: 152, mobileSize: 108 }
  ];

  const NIGHT_VISITORS = [
    { name: 'blue', action: 'peering', delay: 0.45, enter: 1.6, activity: 3.8, rest: 0.9, leave: 1.6, x: 246, mobileX: 250, size: 164, mobileSize: 112 },
    { name: 'green', action: 'warming', delay: 1.9, enter: 1.7, activity: 3.3, rest: 0.7, leave: 1.6, x: 518, mobileX: 524, size: 152, mobileSize: 108 },
    { name: 'girl', action: 'greeting', delay: 1.1, enter: 1.7, activity: 2.85, rest: 1.0, leave: 1.55, x: 422, mobileX: 430, size: 164, mobileSize: 114 }
  ];

  // Tree starlight twinkle coordinates relative to the Christmas tree crop in world space
  // Sprite index ci maps into TREE_GLOW_SPRITES: 0 warm-gold, 1 peach-red, 2 mint-green, 3 ice-blue
  const TREE_GLINTS = [
    { u: 0.50, v: 0.08, r: 9.5, ci: 0, p: 0.0 },
    { u: 0.42, v: 0.24, r: 6.5, ci: 0, p: 1.1 },
    { u: 0.58, v: 0.28, r: 6.5, ci: 1, p: 2.3 },
    { u: 0.35, v: 0.40, r: 7.0, ci: 2, p: 0.7 },
    { u: 0.51, v: 0.44, r: 7.5, ci: 0, p: 3.0 },
    { u: 0.66, v: 0.46, r: 6.5, ci: 3, p: 1.8 },
    { u: 0.29, v: 0.58, r: 7.0, ci: 1, p: 2.6 },
    { u: 0.45, v: 0.62, r: 7.5, ci: 0, p: 0.4 },
    { u: 0.62, v: 0.65, r: 7.0, ci: 0, p: 3.7 },
    { u: 0.73, v: 0.69, r: 6.5, ci: 2, p: 1.4 },
    { u: 0.24, v: 0.76, r: 7.5, ci: 3, p: 2.9 },
    { u: 0.40, v: 0.79, r: 7.5, ci: 1, p: 0.9 },
    { u: 0.56, v: 0.81, r: 7.5, ci: 0, p: 4.1 },
    { u: 0.72, v: 0.83, r: 7.0, ci: 0, p: 2.0 }
  ];

  const clamp01 = x => Math.max(0, Math.min(1, x));
  const ease5 = x => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
  const mix = (a, b, t) => a + (b - a) * t;
  const env = (t, start, end, a, r) => ease5((t - start) / a) * (1 - ease5((t - (end - r)) / r));

  // ---------------- MODULE STATE ----------------
  let mounted = false;
  let paused = false;
  let rafHandle = 0;
  let lastTs = 0;
  let clockTimer = null;
  let sunsetTimer = null;
  let resizeObserver = null;
  let cleanups = [];

  // DOM handles
  let loginScreenEl = null;
  let canvasShellEl = null;
  let rootEl = null;
  let leftCardEl = null;
  let lightsSvgEl = null;
  let lightsGlowCanvas = null;
  let lightsGlowCtx = null;
  let lightsBulbNodes = [];
  let lightsDims = { w: 0, h: 0, pad: 22 };
  let footerEl = null;
  let windowStageEl = null;
  let windowFrameImg = null;
  let gardenDayCanvas = null;
  let gardenNightCanvas = null;
  let sunsetWashEl = null;
  let fxCanvas = null;
  let fxCtx = null;
  let visitorsCanvas = null;
  let visitorsCtx = null;
  let kittenCanvas = null;
  let kittenCtx = null;

  // Controls & metadata DOM
  let clockNode = null;
  let dateNode = null;
  let periodNode = null;
  let countdownNode = null;
  let sceneLabelNode = null;
  let btnDayEl = null;
  let btnNightEl = null;
  let btnMusicEl = null;

  // Media / preferences
  let compactMql = null;
  let reducedMql = null;
  let scenePref = 'auto'; // 'auto' | 'day' | 'night'
  let activeScene = 'day';
  let nightLevel = 0;
  let nightTarget = 0;

  // Audio (strictly lazy: preload="none", src attached ONLY on first user Play click)
  let audioEl = null;
  let musicPlaying = false;

  // Camera & loaded assets
  const worldCamera = { scale: 1, left: 0, top: 0 };
  const gardenImgs = { day: null, night: null, dayTier: '', nightTier: '', dayLoading: '', nightLoading: '' };

  // Pre-rendered glow sprites (48x48 for tree glints, 44x44 for perimeter bulb halo)
  let treeGlowSprites = null;
  let bulbGlowSprites = null;

  // Snowfall state (batched into 3 opacity buckets for 3 draw calls total per frame)
  let snowBuckets = [[], [], []];
  let snowW = 0, snowH = 0, snowTotal = 0;

  // Courtyard children state (desktop only, offscreen 192x256 cached per quantized pose + night tint)
  const courtyardKids = [
    {
      role: 'runner', file: 'children-run-red-v3.png', height: 96, baseline: 480,
      anchors: [[175.8, 473], [179.9, 483], [183.0, 483], [180.6, 471], [180.5, 475], [182.2, 482], [179.7, 483], [179.2, 475]]
    },
    {
      role: 'thrower', file: 'children-play-green-v2.png', x: 672, y: 811, height: 102, baseline: 500, facing: -1,
      anchors: [[203.1, 499], [191.8, 499], [200.8, 499], [200.8, 499], [190.5, 500], [192.9, 500], [192.2, 500], [206.9, 500]]
    },
    {
      role: 'builder', file: 'children-play-blue-v2.png', x: 585, y: 853, height: 93, baseline: 480, facing: 1,
      anchors: [[201.1, 480], [172.1, 480], [180.4, 479], [157.0, 479], [191.5, 479], [179.5, 480], [186.9, 480], [193.4, 480]]
    }
  ];
  let courtyardReady = false;
  let courtyardTime = 0;

  // Window visitors state
  let visitorAtlas = null;
  let visitorSleeves = {};
  let visitorBuffers = {};
  let visitorClocks = { day: 1.4, night: 1.4 };
  let currentDayVisitor = DAY_VISITORS[0];
  let visitorLogicalH = 600;
  let lastVisitorSig = '';

  // Sill kitten state (16-frame 4x4 WebP atlas: 0..7 wake, 8..15 stretch)
  let kittenAtlas = null;
  let lastKittenKey = '';
  const kitten = {
    state: 'sleeping', // sleeping | waking | stretching | awake | settling
    progress: 0,
    elapsed: 0,
    hoverActive: false,
    x: 204
  };

  // ---------------- HELPERS ----------------
  function isCompact() {
    return Boolean(compactMql && compactMql.matches);
  }

  function isReducedMotion() {
    return Boolean(reducedMql && reducedMql.matches);
  }

  function addListener(target, event, handler, opts) {
    if (!target || typeof target.addEventListener !== 'function') return;
    target.addEventListener(event, handler, opts);
    cleanups.push(() => {
      try { target.removeEventListener(event, handler, opts); } catch (e) { }
    });
  }

  function readStoredScenePref() {
    try {
      const v = sessionStorage.getItem(MODE_STORAGE_KEY);
      if (v === 'day' || v === 'night' || v === 'auto') return v;
    } catch (e) { }
    return 'auto';
  }

  function writeStoredScenePref(val) {
    try { sessionStorage.setItem(MODE_STORAGE_KEY, val); } catch (e) { }
  }

  function loadDecodedImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(() => resolve(img), () => resolve(img));
        } else {
          resolve(img);
        }
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  function initGlowSprites() {
    if (!treeGlowSprites) {
      const treeColors = ['#FFE194', '#FFAE96', '#B8F0CA', '#BCE8FF'];
      treeGlowSprites = treeColors.map(hex => {
        const c = document.createElement('canvas');
        c.width = 48;
        c.height = 48;
        const gctx = c.getContext('2d');
        const grad = gctx.createRadialGradient(24, 24, 1, 24, 24, 24);
        grad.addColorStop(0, 'rgba(255,252,235,0.95)');
        grad.addColorStop(0.32, hex);
        grad.addColorStop(1, 'rgba(255,240,200,0)');
        gctx.fillStyle = grad;
        gctx.fillRect(0, 0, 48, 48);
        return c;
      });
    }
    if (!bulbGlowSprites) {
      const bulbColors = [
        'rgba(255,153,128,',
        'rgba(255,229,162,',
        'rgba(163,236,181,',
        'rgba(188,234,255,'
      ];
      bulbGlowSprites = bulbColors.map(rgbaPrefix => {
        const c = document.createElement('canvas');
        c.width = 44;
        c.height = 44;
        const gctx = c.getContext('2d');
        const grad = gctx.createRadialGradient(22, 22, 1, 22, 22, 21);
        grad.addColorStop(0, 'rgba(255,253,236,0.92)');
        grad.addColorStop(0.24, rgbaPrefix + '0.68)');
        grad.addColorStop(0.55, rgbaPrefix + '0.24)');
        grad.addColorStop(1, rgbaPrefix + '0)');
        gctx.fillStyle = grad;
        gctx.fillRect(0, 0, 44, 44);
        return c;
      });
    }
  }

  // ---------------- GARDEN RENDERING (DPR=1 + ASYNC DECODE) ----------------
  function ensureGardenImage(mode) {
    const tier = isCompact() ? '768' : '1280';
    const keyTier = mode + 'Tier';
    const keyLoad = mode + 'Loading';
    if (gardenImgs[mode] && gardenImgs[keyTier] === tier) {
      drawGardenCanvas(mode);
      return;
    }
    if (gardenImgs[keyLoad] === tier) return;
    gardenImgs[keyLoad] = tier;
    const url = `${ASSET_BASE}/img/garden-${mode}-${tier}.webp`;
    loadDecodedImage(url).then(img => {
      if (!mounted) return;
      gardenImgs[mode] = img;
      gardenImgs[keyTier] = tier;
      gardenImgs[keyLoad] = '';
      requestAnimationFrame(() => {
        if (mounted) drawGardenCanvas(mode);
      });
    }).catch(() => {
      gardenImgs[keyLoad] = '';
    });
  }

  function computeWorldCamera() {
    if (!windowStageEl) return;
    const compact = isCompact();
    const frame = windowStageEl.getBoundingClientRect();
    if (!frame.width || !frame.height) return;
    const mobileFrameH = 360;
    const windowAnchorY = frame.top + frame.height * (compact ? (mobileFrameH - 19) / (2 * mobileFrameH) : 0.52);
    const frameScale = compact
      ? (frame.height * (mobileFrameH - 125) / mobileFrameH) / 760
      : frame.width / 950;
    const skyCoverageScale = (windowAnchorY + 2) / (576 + 724);
    worldCamera.scale = compact ? Math.max(frameScale, 0.32) : Math.max(frameScale, skyCoverageScale);
    worldCamera.left = frame.left + frame.width * 0.5 - 522 * worldCamera.scale;
    worldCamera.top = windowAnchorY - 576 * worldCamera.scale;
  }

  function drawGardenCanvas(mode) {
    const canvas = mode === 'night' ? gardenNightCanvas : gardenDayCanvas;
    const img = gardenImgs[mode];
    if (!canvas) return;
    const vw = Math.max(1, Math.round(window.innerWidth || 1280));
    const vh = Math.max(1, Math.round(window.innerHeight || 720));
    // Cap garden backing store to 1x CSS pixels (matches 1280px WebP cleanly without 5MP VRAM bloat)
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = mode === 'night' ? '#0D1E38' : '#88B9EF';
    ctx.fillRect(0, 0, vw, vh);
    if (!img) return;

    const k = worldCamera.scale || 1;
    const originX = -720;
    const originY = -724;
    const tileW = 3600;
    const tileH = 2400;
    const drawY = worldCamera.top + originY * k;
    const drawW = tileW * k;
    const drawH = tileH * k;

    const worldLeft = -worldCamera.left / k;
    const worldRight = (vw - worldCamera.left) / k;
    const firstTile = Math.floor((worldLeft - originX) / tileW) - 1;
    const lastTile = Math.ceil((worldRight - originX) / tileW) + 1;

    ctx.imageSmoothingEnabled = true;
    for (let t = firstTile; t <= lastTile; t++) {
      const worldX = originX + t * tileW;
      const sx = worldCamera.left + worldX * k;
      const mirrored = ((t % 2) + 2) % 2 === 1;
      ctx.save();
      if (mirrored) {
        ctx.translate(sx + drawW, drawY);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, drawW, drawH);
      } else {
        ctx.drawImage(img, sx, drawY, drawW, drawH);
      }
      ctx.restore();
    }

    const bottomEdge = drawY + drawH - 2;
    if (bottomEdge < vh) {
      ctx.fillStyle = mode === 'night' ? '#243C5A' : '#DCEAF5';
      ctx.fillRect(0, bottomEdge, vw, vh - bottomEdge + 4);
    }
  }

  // ---------------- PERIMETER FAIRY LIGHTS (STATIC SVG + GPU PHASE CANVASES) ----------------
  function buildPerimeter(width, height, inset, radius) {
    const x = inset, y = inset, w = Math.max(40, width - inset * 2), h = Math.max(40, height - inset * 2);
    const r = Math.max(0, Math.min(radius - inset, w / 2, h / 2));
    const horiz = Math.max(0, w - r * 2);
    const vert = Math.max(0, h - r * 2);
    const arc = Math.PI * r / 2;
    const corner = (cx, cy, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.cos(a), Math.sin(a)];
    const segs = [
      { len: horiz, pt: t => [x + r + t, y, 0, -1] },
      { len: arc, pt: t => corner(x + w - r, y + r, -Math.PI / 2 + t / r) },
      { len: vert, pt: t => [x + w, y + r + t, 1, 0] },
      { len: arc, pt: t => corner(x + w - r, y + h - r, t / r) },
      { len: horiz, pt: t => [x + w - r - t, y + h, 0, 1] },
      { len: arc, pt: t => corner(x + r, y + h - r, Math.PI / 2 + t / r) },
      { len: vert, pt: t => [x, y + h - r - t, -1, 0] },
      { len: arc, pt: t => corner(x + r, y + r, Math.PI + t / r) }
    ].filter(s => s.len > 0);
    const length = segs.reduce((acc, s) => acc + s.len, 0);
    const path = `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
    return {
      length,
      path,
      at(d) {
        let rem = d % length;
        for (const s of segs) {
          if (rem < s.len) return s.pt(rem);
          rem -= s.len;
        }
        return segs[0].pt(0);
      }
    };
  }

  function svgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  }

  function buildLightsOverlaySvg() {
    const svg = svgEl('svg', { id: 'noelFrameLightsOverlay', 'aria-hidden': 'true', focusable: 'false' });
    const defs = svgEl('defs');
    const colors = [
      { hi: '#ff9b82', mid: '#cf5350', lo: '#853c36' },
      { hi: '#ffe5a2', mid: '#d5ad57', lo: '#8f7138' },
      { hi: '#a3ecb5', mid: '#518667', lo: '#30513e' },
      { hi: '#bceaff', mid: '#80a8b9', lo: '#426778' }
    ];
    colors.forEach((c, idx) => {
      const lg = svgEl('linearGradient', { id: `nw-bulb-${idx}`, x1: 0, y1: 0, x2: 1, y2: 0.8 });
      lg.append(
        svgEl('stop', { 'stop-color': c.hi }),
        svgEl('stop', { offset: 0.45, 'stop-color': c.mid }),
        svgEl('stop', { offset: 1, 'stop-color': c.lo })
      );
      defs.append(lg);
    });
    svg.append(defs);
    svg.append(
      svgEl('path', { class: 'nw-lights-wire', fill: 'none', stroke: '#3E5140', 'stroke-width': 1.7, 'stroke-linejoin': 'round' }),
      svgEl('g', { class: 'nw-lights-bulbs' })
    );
    return svg;
  }

  function buildLightsGlowCanvas() {
    const c = document.createElement('canvas');
    c.id = 'noelFrameLightsGlowWrap';
    c.setAttribute('aria-hidden', 'true');
    return c;
  }

  let lastLightsGeomKey = '';
  let lastLightsFrame = -1;
  function paintLightsGlow(nowMs) {
    if (!lightsGlowCtx || !lightsBulbNodes.length || activeScene !== 'night' && nightLevel <= 0.02) return;
    if (paused) return;
    const reduced = isReducedMotion();
    const tickStep = reduced ? 0 : Math.floor(nowMs / 42); // ~24fps smooth bulb glow step
    const nq = Math.round(nightLevel * 16);
    const frameKey = `${tickStep}:${nq}:${reduced}`;
    if (frameKey === lastLightsFrame) return;
    lastLightsFrame = frameKey;

    const { w, h, pad } = lightsDims;
    const cw = w + pad * 2;
    const ch = h + pad * 2;
    const strip = pad * 2 + 8;
    // Clear only the 4 perimeter strips instead of wiping the solid card center
    lightsGlowCtx.clearRect(0, 0, cw, strip);
    lightsGlowCtx.clearRect(0, ch - strip, cw, strip);
    lightsGlowCtx.clearRect(0, strip, strip, Math.max(0, ch - strip * 2));
    lightsGlowCtx.clearRect(cw - strip, strip, strip, Math.max(0, ch - strip * 2));

    const alphaMult = activeScene === 'night' ? Math.max(0.2, nightLevel) : nightLevel;
    if (alphaMult <= 0.02 || !bulbGlowSprites) {
      lightsGlowCtx.globalAlpha = 1;
      return;
    }

    const tSec = nowMs * 0.0024;
    const phaseAlphas = reduced
      ? [0.85, 0.85, 0.85]
      : [0, 1, 2].map(p => (0.54 + 0.46 * (0.5 + 0.5 * Math.sin(tSec + p * 2.094))) * alphaMult);

    for (let i = 0; i < lightsBulbNodes.length; i++) {
      const b = lightsBulbNodes[i];
      lightsGlowCtx.globalAlpha = phaseAlphas[b.phase];
      lightsGlowCtx.drawImage(bulbGlowSprites[b.ci], b.x, b.y, b.size, b.size);
    }
    lightsGlowCtx.globalAlpha = 1;
  }

  function syncFrameLights() {
    if (!lightsSvgEl || !lightsGlowCanvas || !canvasShellEl || !leftCardEl) return;
    const rightCol = document.getElementById('loginRightCol');
    if (!rightCol) return;
    const shellRect = canvasShellEl.getBoundingClientRect();
    const compact = isCompact();
    const leftRect = leftCardEl.getBoundingClientRect();
    const rightRect = rightCol.getBoundingClientRect();
    if (!shellRect.width || !rightRect.width || !rightRect.height) return;

    const left = compact ? (rightRect.left - shellRect.left) : (leftRect.left - shellRect.left);
    const top = compact ? (rightRect.top - shellRect.top) : Math.min(leftRect.top, rightRect.top) - shellRect.top;
    const width = compact ? rightRect.width : (rightRect.right - leftRect.left);
    const height = compact ? rightRect.height : Math.max(leftRect.bottom, rightRect.bottom) - Math.min(leftRect.top, rightRect.top);
    const radius = compact ? 20 : 24;

    const key = [Math.round(left), Math.round(top), Math.round(width), Math.round(height), radius, compact].join(':');
    if (key === lastLightsGeomKey) return;
    lastLightsGeomKey = key;
    lastLightsFrame = -1;

    const cw = Math.max(60, Math.round(width));
    const ch = Math.max(60, Math.round(height));
    const pad = 22;
    lightsDims = { w: cw, h: ch, pad };

    lightsSvgEl.style.left = `${left}px`;
    lightsSvgEl.style.top = `${top}px`;
    lightsSvgEl.style.width = `${width}px`;
    lightsSvgEl.style.height = `${height}px`;
    lightsSvgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);

    lightsGlowCanvas.style.left = `${left - pad}px`;
    lightsGlowCanvas.style.top = `${top - pad}px`;
    lightsGlowCanvas.style.width = `${cw + pad * 2}px`;
    lightsGlowCanvas.style.height = `${ch + pad * 2}px`;
    lightsGlowCanvas.width = cw + pad * 2;
    lightsGlowCanvas.height = ch + pad * 2;
    lightsGlowCtx = lightsGlowCanvas.getContext('2d');
    if (lightsGlowCtx) lightsGlowCtx.setTransform(1, 0, 0, 1, 0, 0);

    const route = buildPerimeter(width, height, 0, radius);
    const step = compact ? 44 : 48;
    const count = Math.max(16, Math.round(route.length / step));
    const bulbScale = compact ? 0.64 : 0.78;
    const strokeColors = ['#853c36', '#8f7138', '#30513e', '#426778'];

    const wire = lightsSvgEl.querySelector('.nw-lights-wire');
    const bulbsGroup = lightsSvgEl.querySelector('.nw-lights-bulbs');
    wire.setAttribute('d', route.path);
    bulbsGroup.replaceChildren();

    initGlowSprites();
    const glowHalf = 22 * bulbScale;
    lightsBulbNodes = [];

    for (let i = 0; i < count; i++) {
      const [bx, by, nx, ny] = route.at((i + 0.5) * route.length / count);
      const angleRad = Math.atan2(ny, nx) - Math.PI / 2;
      const angleDeg = angleRad * 180 / Math.PI;
      const tr = `translate(${bx.toFixed(1)} ${by.toFixed(1)}) rotate(${angleDeg.toFixed(1)}) scale(${bulbScale})`;
      const ci = i % 4;

      const b = svgEl('g', { transform: tr });
      b.append(
        svgEl('path', { d: 'M-3 2C-6 5-5 10-2 13Q0 16 2 13C5 10 6 5 3 2Z', fill: `url(#nw-bulb-${ci})`, stroke: strokeColors[ci], 'stroke-width': 0.5 }),
        svgEl('rect', { x: -3.4, y: -2, width: 6.8, height: 4.6, rx: 1, fill: '#3c4e3f' })
      );
      bulbsGroup.append(b);

      const gx = pad + bx - Math.sin(angleRad) * (7.5 * bulbScale);
      const gy = pad + by + Math.cos(angleRad) * (7.5 * bulbScale);
      lightsBulbNodes.push({ x: gx - glowHalf, y: gy - glowHalf, size: glowHalf * 2, ci, phase: i % 3 });
    }
    paintLightsGlow(performance.now());
  }

  // ---------------- BATCHED SNOWFALL + UNIFIED FX CANVAS (DPR=1) ----------------
  function resizeFxCanvas() {
    if (!fxCanvas) return;
    snowW = Math.max(1, Math.round(window.innerWidth || 1280));
    snowH = Math.max(1, Math.round(window.innerHeight || 720));
    fxCanvas.width = snowW;
    fxCanvas.height = snowH;
    fxCtx = fxCanvas.getContext('2d');
    if (fxCtx) {
      fxCtx.setTransform(1, 0, 0, 1, 0, 0);
      fxCtx.imageSmoothingEnabled = true;
    }

    const maxCount = isCompact() ? 58 : Math.min(114, Math.max(66, Math.round(snowW * snowH / 13500)));
    snowTotal = maxCount;
    snowBuckets = [[], [], []];
    for (let i = 0; i < maxCount; i++) {
      const depth = Math.random();
      const bIdx = depth < 0.36 ? 0 : depth < 0.72 ? 1 : 2;
      snowBuckets[bIdx].push({
        idx: i,
        x: Math.random() * snowW,
        y: Math.random() * snowH,
        r: 0.8 + depth * 1.85,
        speed: 12 + depth * 23,
        phase: Math.random() * TAU,
        sway: 4 + Math.random() * 8.5,
        drift: -1.4 + Math.random() * 4.2
      });
    }
  }

  function paintSnow(ctx, dt, nowMs) {
    const dayRatio = 0.62;
    const visibleCount = snowTotal * (dayRatio + (1 - dayRatio) * nightLevel);
    const speedMult = 0.85 + nightLevel * 0.25;
    const sizeMult = 1 + nightLevel * 0.22;
    const bucketAlphas = [
      (0.28 + nightLevel * 0.06).toFixed(2),
      (0.50 + nightLevel * 0.08).toFixed(2),
      (0.74 + nightLevel * 0.08).toFixed(2)
    ];

    for (let b = 0; b < 3; b++) {
      const list = snowBuckets[b];
      if (!list.length) continue;
      ctx.beginPath();
      ctx.fillStyle = `rgba(249,253,255,${bucketAlphas[b]})`;
      for (let i = 0; i < list.length; i++) {
        const f = list[i];
        if (dt > 0) {
          f.y += f.speed * speedMult * dt;
          f.x += f.drift * (1 + nightLevel * 0.3) * dt;
          if (f.y > snowH + 8) { f.y = -8; f.x = Math.random() * snowW; }
          if (f.x > snowW + 14) f.x = -14;
          if (f.x < -14) f.x = snowW + 14;
        }
        if (f.idx >= visibleCount) continue;
        const sx = f.x + Math.sin(nowMs * 0.00045 + f.phase) * f.sway;
        const rad = f.r * sizeMult;
        ctx.moveTo(sx + rad, f.y);
        ctx.arc(sx, f.y, rad, 0, TAU);
      }
      ctx.fill();
    }
  }

  // ---------------- COURTYARD CHILDREN (NO CTX.FILTER) + TREE SPRITE GLINTS ----------------
  function initCourtyardSprites() {
    if (isCompact() || courtyardReady) return;
    Promise.allSettled(courtyardKids.map(async kid => {
      if (kid.loaded) return;
      kid.image = await loadDecodedImage(`${ASSET_BASE}/img/${kid.file}`);
      kid.buf = document.createElement('canvas');
      kid.buf.width = 192;
      kid.buf.height = 256;
      kid.bufCtx = kid.buf.getContext('2d');
      kid.bufCtx.imageSmoothingEnabled = true;
      kid.lastKey = '';
      kid.loaded = true;
    })).then(() => {
      if (!mounted) return;
      courtyardReady = courtyardKids.some(k => k.loaded);
      paintFx(0, performance.now());
    });
  }

  function drawKidSprite(ctx, kid, x, y, facing, frameFloat, bob) {
    const step = Math.floor(frameFloat * 4) % 32; // 32 crisp sub-steps across 8 poses
    const nightStep = Math.round(nightLevel * 12);
    const cacheKey = step + ':' + nightStep;

    if (kid.lastKey !== cacheKey) {
      kid.lastKey = cacheKey;
      const poseFloat = step / 4;
      const poseA = Math.floor(poseFloat) % 8;
      const poseB = (poseA + 1) % 8;
      const alphaB = poseFloat - Math.floor(poseFloat);
      const sw = kid.image.naturalWidth / 4;
      const sh = kid.image.naturalHeight / 2;
      const bCtx = kid.bufCtx;

      bCtx.globalCompositeOperation = 'source-over';
      bCtx.globalAlpha = 1;
      bCtx.clearRect(0, 0, 192, 256);

      const drawHalfPose = (p, op, comp) => {
        if (op < 0.01) return;
        const [ax, ay] = kid.anchors[p];
        bCtx.globalAlpha = op;
        bCtx.globalCompositeOperation = comp;
        bCtx.drawImage(
          kid.image,
          (p % 4) * sw, Math.floor(p / 4) * sh, sw, sh,
          96 - ax * 0.5, (kid.baseline - ay) * 0.5, 192, 256
        );
      };
      drawHalfPose(poseA, 1 - alphaB, 'source-over');
      drawHalfPose(poseB, alphaB, 'lighter');

      // Apply subtle moonlight tint directly on tiny 192x256 buffer (replaces costly ctx.filter)
      if (nightStep > 0) {
        bCtx.globalCompositeOperation = 'source-atop';
        bCtx.globalAlpha = (nightStep / 12) * 0.28;
        bCtx.fillStyle = '#0E1C3A';
        bCtx.fillRect(0, 0, 192, 256);
      }
      bCtx.globalAlpha = 1;
      bCtx.globalCompositeOperation = 'source-over';
    }

    const sc = kid.height / 230;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = `rgba(38,56,82,${(0.16 + nightLevel * 0.08).toFixed(2)})`;
    ctx.ellipse(x, y + 1, kid.height * 0.16, kid.height * 0.035, 0, 0, TAU);
    ctx.fill();

    ctx.translate(x, y + bob);
    ctx.scale(facing, 1);
    ctx.drawImage(kid.buf, -96 * sc, -(kid.baseline * 0.5) * sc, 192 * sc, 256 * sc);
    ctx.restore();
  }

  function paintTreeGlints(ctx, nowMs) {
    if (nightLevel < 0.03) return;
    initGlowSprites();
    const sourceScale = 3600 / 3072;
    const cropX = 1664 * sourceScale;
    const cropY = -724 + 800 * sourceScale;
    const worldW = 464 * sourceScale;
    const worldH = 592 * sourceScale;
    const period = 7200;
    const origin = -720;
    const k = worldCamera.scale || 1;
    const leftWorld = -worldCamera.left / k;
    const rightWorld = (snowW - worldCamera.left) / k;
    const first = Math.floor((leftWorld - origin) / period) - 1;
    const last = Math.ceil((rightWorld - origin) / period);
    const reduced = isReducedMotion();

    const drawTreeSet = (wx, mirrored) => {
      for (let i = 0; i < TREE_GLINTS.length; i++) {
        const g = TREE_GLINTS[i];
        const u = mirrored ? 1 - g.u : g.u;
        const gx = wx + u * worldW;
        const gy = cropY + g.v * worldH;
        const tw = reduced ? 0.78 : (0.38 + 0.62 * Math.pow(0.5 + 0.5 * Math.sin(nowMs * 0.0024 + g.p), 1.6));
        const op = tw * nightLevel * 0.92;
        if (op <= 0.02) continue;
        const half = g.r * (0.85 + 0.35 * tw) * 2.1;
        ctx.globalAlpha = op;
        ctx.drawImage(treeGlowSprites[g.ci], gx - half, gy - half, half * 2, half * 2);
      }
    };

    ctx.save();
    for (let tile = first; tile <= last; tile++) {
      drawTreeSet(origin + tile * period + cropX, false);
      drawTreeSet(origin + tile * period + period - cropX - worldW, true);
    }
    ctx.restore();
  }

  function paintFx(dt, nowMs) {
    if (!fxCtx) return;
    fxCtx.clearRect(0, 0, snowW, snowH);

    if (worldCamera.scale) {
      if (dt > 0 && !isReducedMotion()) courtyardTime += dt;

      fxCtx.save();
      fxCtx.translate(worldCamera.left, worldCamera.top);
      fxCtx.scale(worldCamera.scale, worldCamera.scale);

      paintTreeGlints(fxCtx, nowMs);

      if (!isCompact() && courtyardReady) {
        const actors = [];
        for (let i = 0; i < courtyardKids.length; i++) {
          const kid = courtyardKids[i];
          if (!kid.loaded) continue;
          if (kid.role === 'runner') {
            const clk = (courtyardTime + 1.1) % 9.6;
            if (clk < 7.6) {
              const p = clk / 7.6;
              const x = 120 + p * 820;
              const y = 789 + Math.sin(p * Math.PI) * 7;
              const gait = (clk * 9.6) % 8;
              const bob = -Math.pow(Math.sin(gait * Math.PI / 4), 2) * 1.5;
              actors.push({ kid, x, y, facing: 1, frame: gait, bob });
            }
          } else if (kid.role === 'thrower') {
            const frame = (courtyardTime * 2.6 + 1.4) % 8;
            actors.push({ kid, x: kid.x, y: kid.y, facing: kid.facing, frame, bob: Math.sin(courtyardTime * 1.9) * 0.6 });
          } else {
            const frame = (courtyardTime * 2.1 + 0.6) % 8;
            actors.push({ kid, x: kid.x, y: kid.y, facing: kid.facing, frame, bob: Math.sin(courtyardTime * 1.5 + 1) * 0.5 });
          }
        }
        actors.sort((a, b) => a.y - b.y);
        for (let i = 0; i < actors.length; i++) {
          const a = actors[i];
          drawKidSprite(fxCtx, a.kid, a.x, a.y, a.facing, a.frame, a.bob);
        }
      }

      fxCtx.restore();
    }

    paintSnow(fxCtx, dt, nowMs);
  }

  // ---------------- WINDOW VISITORS (CACHED SLEEVE PATTERNS + 24FPS QUANTIZED SKIP) ----------------
  function initWindowVisitors() {
    if (visitorAtlas) return;
    for (const s of ['day', 'night']) {
      for (const p of (s === 'day' ? DAY_VISITORS : NIGHT_VISITORS)) {
        const c = document.createElement('canvas');
        c.width = 288;
        c.height = 288;
        const bctx = c.getContext('2d', { alpha: true });
        if (bctx) bctx.imageSmoothingEnabled = true;
        visitorBuffers[s + p.name] = { surface: c, ctx: bctx, pat: null };
      }
    }
    loadDecodedImage(`${ASSET_BASE}/img/window-visitors-rig.png`).then(img => {
      if (!mounted) return;
      visitorAtlas = img;
      for (const name of ['girl', 'blue', 'green']) {
        const part = VISITOR_PARTS[name + 'Cloth'];
        const c = document.createElement('canvas');
        c.width = part.size[0];
        c.height = part.size[1];
        c.getContext('2d', { alpha: true }).drawImage(img, ...part.rect, 0, 0, ...part.size);
        visitorSleeves[name] = c;
      }
      // Pre-cache sleeve pattern once per buffer context
      for (const s of ['day', 'night']) {
        for (const p of (s === 'day' ? DAY_VISITORS : NIGHT_VISITORS)) {
          const b = visitorBuffers[s + p.name];
          if (b && b.ctx && visitorSleeves[p.name]) {
            try { b.pat = b.ctx.createPattern(visitorSleeves[p.name], 'repeat'); } catch (e) { }
          }
        }
      }
      lastVisitorSig = '';
      paintVisitors(0);
    }).catch(() => { });
  }

  function resizeWindowCanvas(canvas, logicalW, logicalH) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const targetW = Math.max(120, Math.min(logicalW, Math.round((rect.width || logicalW) * dpr)));
    const targetH = Math.max(80, Math.min(logicalH, Math.round((rect.height || logicalH) * dpr)));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    const ctx = canvas.getContext('2d', { alpha: true });
    if (ctx) {
      ctx.setTransform(targetW / logicalW, 0, 0, targetH / logicalH, 0, 0);
      ctx.imageSmoothingEnabled = true;
    }
    return ctx;
  }

  function resizeVisitors() {
    visitorLogicalH = isCompact() ? 360 : 600;
    visitorsCtx = resizeWindowCanvas(visitorsCanvas, 680, visitorLogicalH);
    lastVisitorSig = '';
  }

  function visitorPoseAt(person, clock, reduced) {
    if (reduced) return { phase: person.action, reveal: 1, actionTime: person.name === 'girl' ? 1 : 1.4, time: 0, still: true };
    let t = (clock % 16) - person.delay;
    if (t < 0) return null;
    const time = t;
    if (t < person.enter) return { phase: 'peeking', reveal: ease5(t / person.enter), actionTime: -1, time };
    t -= person.enter;
    if (t < person.activity) return { phase: person.action, reveal: 1, actionTime: t, time };
    t -= person.activity;
    if (t < person.rest) return { phase: 'resting', reveal: 1, actionTime: person.activity, time };
    t -= person.rest;
    if (t < person.leave) return { phase: 'ducking', reveal: 1 - ease5(t / person.leave), actionTime: person.activity, time };
    return null;
  }

  function visitorJoints(name, pose) {
    const rise = (1 - pose.reveal) * 228;
    const breath = pose.still ? 0 : Math.sin(pose.time * 2.3) * 0.32 * pose.reveal;
    const root = rise + breath;
    const a = pose.actionTime;
    let lift = 0, wave = 0, rub = 0;
    if (name === 'girl') {
      const entry = 0.3 * ease5((pose.reveal - 0.28) / 0.72);
      lift = pose.phase === 'peeking' ? entry : pose.phase === 'ducking' ? 0 : mix(0.3, 1, ease5(a / 0.55)) * (1 - ease5((a - 1.95) / 0.8));
      const ww = pose.still ? 0 : env(a, 0.35, 2.25, 0.3, 0.4);
      wave = ww * Math.sin((a - 0.35) * Math.PI * 3.8);
    } else if (name === 'blue') {
      lift = pose.phase === 'peeking' ? 0.12 * ease5((pose.reveal - 0.5) / 0.5) : pose.phase === 'ducking' ? 0 : mix(0.12, 1, ease5(a / 0.65)) * (1 - ease5((a - 2.8) / 1));
    } else {
      lift = pose.phase === 'peeking' ? 0.1 * ease5((pose.reveal - 0.5) / 0.5) : pose.phase === 'ducking' ? 0 : mix(0.1, 1, ease5(a / 0.65)) * (1 - ease5((a - 2.45) / 0.85));
      rub = pose.still ? 0 : env(a, 0.55, 2.5, 0.3, 0.35) * Math.sin((a - 0.55) * Math.PI * 3.4);
    }
    const restW = 220 + Math.max(0, root - 76);
    const left = { s: [88, 128 + root], e: [65, 173 + root * 0.72], p: [76, restW] };
    const right = { s: [170, 128 + root], e: [191, 173 + root * 0.72], p: [181, restW] };
    if (name === 'girl') {
      left.e = [mix(65, 54, lift) - Math.sin(lift * Math.PI) * 18, mix(173 + root * 0.72, 160 + root, lift)];
      left.p = [mix(76, 72 + wave * 1.6, lift) - Math.sin(lift * Math.PI) * 2, mix(restW, 117 + root + wave * 0.7, lift)];
      right.e = [190, 171 + root * 0.72];
      right.p = [180, 209 + Math.max(0, root - 76)];
    } else if (name === 'blue') {
      left.e = [mix(65, 49, lift) - Math.sin(lift * Math.PI) * 18, mix(173 + root * 0.72, 120 + root, lift)];
      right.e = [mix(191, 207, lift) + Math.sin(lift * Math.PI) * 18, mix(173 + root * 0.72, 120 + root, lift)];
      const arc = Math.sin(lift * Math.PI) * 8;
      left.p = [mix(76, 79, lift) - arc, mix(restW, 79 + root, lift)];
      right.p = [mix(181, 177, lift) + arc, mix(restW, 79 + root, lift)];
    } else {
      left.e = [mix(65, 77, lift) - Math.sin(lift * Math.PI) * 6, mix(173 + root * 0.72, 181 + root, lift)];
      right.e = [mix(191, 181, lift) + Math.sin(lift * Math.PI) * 6, mix(173 + root * 0.72, 184 + root, lift)];
      left.p = [mix(76, 109 + rub * 1.2, lift), mix(restW, 167 + root + rub * 3, lift)];
      right.p = [mix(181, 146 - rub * 1.2, lift), mix(restW, 169 + root - rub * 3, lift)];
    }
    const axis = name === 'girl' ? [-1.95, Math.PI] : name === 'blue' ? [-1.27, -1.85] : [1.25, 1.27];
    left.angle = Math.atan2(left.p[1] - left.e[1], left.p[0] - left.e[0]) - axis[0];
    right.angle = Math.atan2(right.p[1] - right.e[1], right.p[0] - right.e[0]) - axis[1];
    if (name === 'girl') left.angle += lift * (-0.18 + wave * 0.27);
    if (name === 'blue') { left.angle -= lift * 0.32; right.angle += lift * 0.32; }
    if (name === 'green') { left.angle -= lift * 0.52 - rub * 0.045; right.angle += lift * 0.08 - rub * 0.045; }
    return { root, left, right };
  }

  function drawVisitorPart(brush, key, x, y, op = 1) {
    if (op <= 0.005) return;
    const p = VISITOR_PARTS[key];
    if (!p) return;
    brush.globalAlpha = op;
    brush.drawImage(visitorAtlas, ...p.rect, x, y, ...p.size);
    brush.globalAlpha = 1;
  }

  function drawVisitorSleeve(brush, arm, pat) {
    const { s, e, p } = arm;
    brush.save();
    brush.strokeStyle = pat || '#993338';
    brush.lineCap = 'round';
    brush.lineJoin = 'round';
    brush.lineWidth = 28;
    brush.beginPath();
    brush.moveTo(s[0], s[1]);
    brush.quadraticCurveTo(e[0], e[1], p[0], p[1]);
    brush.stroke();
    brush.restore();
  }

  function rasterVisitor(scene, person, pose) {
    const buf = visitorBuffers[scene + person.name];
    if (!buf || !buf.ctx || !visitorAtlas) return null;
    const brush = buf.ctx;
    const name = person.name;
    const arms = visitorJoints(name, pose);
    brush.setTransform(1, 0, 0, 1, 0, 0);
    brush.globalAlpha = 1;
    brush.clearRect(0, 0, 288, 288);
    brush.save();
    brush.translate(16, 16);
    brush.beginPath();
    brush.rect(-16, -16, 288, 230);
    brush.clip();

    drawVisitorSleeve(brush, arms.left, buf.pat);
    drawVisitorSleeve(brush, arms.right, buf.pat);
    drawVisitorPart(brush, name + 'Body', 0, arms.root);

    const t = pose.actionTime;
    const paintEyes = (st, w) => {
      if (w <= 0.01) return;
      for (let i = 0; i < 2; i++) {
        const p = VISITOR_PARTS[name + st + i];
        if (p) drawVisitorPart(brush, name + st + i, p.target[0] - p.size[0] / 2, p.target[1] + arms.root - p.size[1] / 2, w);
      }
    };
    if (name === 'blue') {
      paintEyes('Left', env(t, 0.7, 1.75, 0.23, 0.23));
      paintEyes('Right', env(t, 2.05, 2.85, 0.22, 0.22));
    }
    if (name === 'green') paintEyes('Down', env(t, 0.55, 1.7, 0.3, 0.3) * 0.85);
    if (!pose.still) {
      const bAt = name === 'girl' ? 1.3 : name === 'blue' ? 1.85 : 2.15;
      paintEyes('Closed', env(t, bAt, bAt + 0.19, 0.072, 0.09));
    }

    const paintMitten = (mKey, arm) => {
      const p = VISITOR_PARTS[mKey];
      const fit = mKey.startsWith('green') ? 0.95 : mKey.startsWith('blue') ? 0.98 : 1;
      brush.save();
      brush.translate(arm.p[0], arm.p[1]);
      brush.rotate(arm.angle);
      brush.scale(p.scale * fit, p.scale * fit);
      drawVisitorPart(brush, mKey, -p.anchor[0], -p.anchor[1]);
      brush.restore();
    };
    paintMitten(name === 'girl' ? 'girlSupport' : name + 'Right', arms.right);
    paintMitten(name === 'girl' ? 'girlFree' : name + 'Left', arms.left);
    brush.restore();
    return buf.surface;
  }

  function paintVisitors(dt) {
    if (!visitorsCtx || !visitorAtlas) return;
    const reduced = isReducedMotion();
    if (dt > 0 && !reduced) {
      if (nightLevel < 0.99) {
        const next = visitorClocks.day + dt * 1.1;
        if (next >= 16) {
          const choices = DAY_VISITORS.filter(v => v !== currentDayVisitor);
          currentDayVisitor = choices[Math.floor(Math.random() * choices.length)];
        }
        visitorClocks.day = next % 16;
      }
      if (nightLevel > 0.01) {
        visitorClocks.night = (visitorClocks.night + dt * 1.1) % 16;
      }
    }

    // Quantize to 24fps & skip redraw when poses haven't changed
    const qDay = Math.floor(visitorClocks.day * 24);
    const qNight = Math.floor(visitorClocks.night * 24);
    const qBlend = Math.round(nightLevel * 32);
    const compact = isCompact();
    const sig = `${visitorLogicalH}:${compact}:${qBlend}:${qBlend < 32 ? currentDayVisitor.name + qDay : ''}:${qBlend > 0 ? qNight : ''}:${reduced}`;
    if (sig === lastVisitorSig) return;
    lastVisitorSig = sig;

    const draws = [];
    const sets = [
      ['day', [currentDayVisitor], 1 - nightLevel, qDay / 24],
      ['night', NIGHT_VISITORS, nightLevel, qNight / 24]
    ];
    for (const [scene, roster, op, qClk] of sets) {
      if (op <= 0.01) continue;
      for (const person of roster) {
        const pose = visitorPoseAt(person, qClk, reduced);
        if (!pose) continue;
        const raster = rasterVisitor(scene, person, pose);
        if (raster) draws.push({ person, op, raster });
      }
    }

    visitorsCtx.clearRect(0, 0, 680, visitorLogicalH);
    const bottom = compact ? 288 : 528;
    visitorsCtx.save();
    visitorsCtx.beginPath();
    visitorsCtx.rect(103, 53, 474, bottom - 53);
    visitorsCtx.clip();

    for (let i = 0; i < draws.length; i++) {
      const { person, op, raster } = draws[i];
      const sz = compact ? person.mobileSize : person.size;
      const px = compact ? person.mobileX : person.x;
      const sc = sz / 214;
      visitorsCtx.globalAlpha = op;
      visitorsCtx.drawImage(raster, px - 144 * sc, bottom - (214 * 0.8 + 16) * sc, 288 * sc, 288 * sc);
    }
    visitorsCtx.restore();
  }

  // ---------------- SILL KITTEN (DIRTY-KEY SKIP WHEN SLEEPING/IDLE) ----------------
  function initKitten() {
    if (kittenAtlas) return;
    loadDecodedImage(`${ASSET_BASE}/img/kitten-atlas.webp`).then(img => {
      if (!mounted) return;
      kittenAtlas = img;
      lastKittenKey = '';
      paintKitten(0);
    }).catch(() => { });
  }

  function resizeKitten() {
    const h = isCompact() ? 360 : 600;
    kittenCtx = resizeWindowCanvas(kittenCanvas, 680, h);
    lastKittenKey = '';
  }

  function paintKitten(dt) {
    if (!kittenCtx || !kittenAtlas) return;
    const compact = isCompact();
    const logicalH = compact ? 360 : 600;
    const groundY = compact ? 307 : 547;
    const scale = compact ? 0.36 : 0.45;
    const wantAwake = nightTarget > 0.5 || kitten.hoverActive;

    if (isReducedMotion()) {
      kitten.state = wantAwake ? 'awake' : 'sleeping';
      kitten.progress = wantAwake ? 1 : 0;
    } else if (dt > 0) {
      kitten.elapsed += dt;
      if (kitten.state === 'sleeping') {
        if (wantAwake) { kitten.state = 'waking'; kitten.elapsed = 0; }
      } else if (kitten.state === 'waking') {
        kitten.progress = Math.min(1, kitten.progress + dt / 1.9);
        if (kitten.progress >= 1) {
          kitten.state = wantAwake ? 'stretching' : 'settling';
          kitten.elapsed = 0;
        }
      } else if (kitten.state === 'stretching') {
        if (kitten.elapsed >= 2.6) {
          kitten.state = wantAwake ? 'awake' : 'settling';
          kitten.elapsed = 0;
        }
      } else if (kitten.state === 'awake') {
        if (!wantAwake) {
          kitten.state = 'settling';
          kitten.elapsed = 0;
        } else if (kitten.elapsed >= 5.5) {
          kitten.state = 'stretching';
          kitten.elapsed = 0;
        }
      } else if (kitten.state === 'settling') {
        kitten.progress = Math.max(0, kitten.progress - dt / 1.9);
        if (kitten.progress <= 0) {
          kitten.hoverActive = false;
          kitten.state = 'sleeping';
          kitten.elapsed = 0;
        }
      }
    }

    let frameIdx = 0;
    if (kitten.state === 'sleeping') frameIdx = 0;
    else if (kitten.state === 'waking' || kitten.state === 'settling') frameIdx = Math.min(7, Math.floor(kitten.progress * 7.99));
    else if (kitten.state === 'stretching') frameIdx = 8 + Math.min(7, Math.floor(clamp01(kitten.elapsed / 2.6) * 7.99));
    else frameIdx = 7;

    const kKey = `${frameIdx}:${kitten.state === 'sleeping'}:${compact}`;
    if (kKey === lastKittenKey) return;
    lastKittenKey = kKey;

    const cellW = 151, cellH = 128, cols = 4;
    const sx = (frameIdx % cols) * cellW;
    const sy = Math.floor(frameIdx / cols) * cellH;
    const kx = compact ? 188 : kitten.x;

    kittenCtx.clearRect(0, 0, 680, logicalH);
    kittenCtx.save();
    kittenCtx.fillStyle = 'rgba(48, 65, 55, 0.16)';
    kittenCtx.beginPath();
    kittenCtx.ellipse(kx, groundY + 1, kitten.state === 'sleeping' ? 36 * (compact ? 0.8 : 1) : 28 * (compact ? 0.8 : 1), 2.5, 0, 0, TAU);
    kittenCtx.fill();

    kittenCtx.translate(kx, groundY);
    kittenCtx.scale(scale, scale);
    kittenCtx.drawImage(kittenAtlas, sx, sy, cellW, cellH, -160, -248, 320, 272);
    kittenCtx.restore();
  }

  // ---------------- UNIFIED ANIMATION LOOP ----------------
  function stopRaf() {
    if (rafHandle) cancelAnimationFrame(rafHandle);
    rafHandle = 0;
    lastTs = 0;
  }

  function tick(ts) {
    rafHandle = 0;
    if (!mounted || paused || document.hidden) return;
    const dt = lastTs ? Math.min(0.05, Math.max(0, (ts - lastTs) / 1000)) : 0.016;
    lastTs = ts;

    if (Math.abs(nightTarget - nightLevel) > 0.002) {
      const step = isReducedMotion() ? 1 : dt * 1.45;
      nightLevel = nightTarget > nightLevel
        ? Math.min(nightTarget, nightLevel + step)
        : Math.max(nightTarget, nightLevel - step);
    } else {
      nightLevel = nightTarget;
    }

    paintFx(dt, ts);
    paintVisitors(dt);
    paintKitten(dt);
    paintLightsGlow(ts);

    if (!isReducedMotion()) {
      rafHandle = requestAnimationFrame(tick);
    }
  }

  function startOrPaint() {
    if (!mounted) return;
    if (paused || document.hidden) {
      stopRaf();
      return;
    }
    if (isReducedMotion()) {
      stopRaf();
      nightLevel = nightTarget;
      const now = performance.now();
      paintFx(0, now);
      paintVisitors(0);
      paintKitten(0);
      paintLightsGlow(now);
      return;
    }
    if (!rafHandle) {
      lastTs = 0;
      rafHandle = requestAnimationFrame(tick);
    }
  }

  // ---------------- SCENE MODE & LIVE METADATA ----------------
  function syncPreviewBarToggle() {
    const previewBtn = document.getElementById('btnPreviewNoelDayNight');
    if (!previewBtn) return;
    const isNight = activeScene === 'night';
    previewBtn.innerHTML = isNight
      ? '<i class="fa-solid fa-sun text-amber-300" aria-hidden="true"></i><span>Xem Ban ngày</span>'
      : '<i class="fa-solid fa-moon text-sky-200" aria-hidden="true"></i><span>Xem Ban đêm</span>';
    previewBtn.setAttribute('aria-pressed', String(isNight));
  }

  function applySceneMode(mode, { persist = false, animateSunset = false } = {}) {
    const next = mode === 'night' ? 'night' : 'day';
    const changed = next !== activeScene;
    activeScene = next;
    nightTarget = next === 'night' ? 1 : 0;
    if (isReducedMotion()) nightLevel = nightTarget;

    if (persist) {
      scenePref = next;
      writeStoredScenePref(next);
    }
    if (loginScreenEl) loginScreenEl.setAttribute('data-noel-scene', next);
    if (btnDayEl) btnDayEl.setAttribute('aria-pressed', String(next === 'day'));
    if (btnNightEl) btnNightEl.setAttribute('aria-pressed', String(next === 'night'));
    if (sceneLabelNode) {
      sceneLabelNode.textContent = next === 'night'
        ? (scenePref === 'auto' ? 'Đêm đông · Tự động' : 'Đêm đông')
        : (scenePref === 'auto' ? 'Ban ngày · Tự động' : 'Ban ngày');
    }
    lastLightsFrame = -1;
    paintLightsGlow(performance.now());
    syncPreviewBarToggle();

    ensureGardenImage(next);

    if (animateSunset && changed && sunsetWashEl && !isReducedMotion()) {
      sunsetWashEl.setAttribute('data-active', '1');
      if (sunsetTimer) clearTimeout(sunsetTimer);
      sunsetTimer = setTimeout(() => {
        if (sunsetWashEl) sunsetWashEl.removeAttribute('data-active');
        sunsetTimer = null;
      }, 420);
    }
    startOrPaint();
  }

  function updateClockAndMetadata(nowDate = new Date()) {
    const p = getVietnamParts(nowDate);
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${pad(p.hour)}:${pad(p.minute)}`;
    const dateStr = `${pad(p.day)}/${pad(p.month)}/${p.year}`;
    const period = getSmartReportPeriodVN(nowDate);
    const xmas = getChristmasCountdownInfo(nowDate);

    if (clockNode) clockNode.textContent = timeStr;
    if (dateNode) dateNode.textContent = dateStr;
    if (periodNode) periodNode.textContent = period.label;

    const pill = document.getElementById('loginPeriodPill');
    if (pill && loginScreenEl && loginScreenEl.getAttribute('data-login-theme') === 'noel-advent') {
      pill.textContent = period.label;
    }

    if (countdownNode) {
      countdownNode.hidden = !xmas.visible;
      if (xmas.visible) {
        countdownNode.textContent = xmas.text;
      }
    }

    if (scenePref === 'auto') {
      const autoMode = resolveAutoSceneMode(nowDate);
      if (autoMode !== activeScene) {
        applySceneMode(autoMode, { persist: false, animateSunset: true });
      }
    }
  }

  function scheduleMinuteClock() {
    if (clockTimer) { clearTimeout(clockTimer); clockTimer = null; }
    if (!mounted) return;
    updateClockAndMetadata(new Date());
    const now = Date.now();
    const delay = Math.max(1000, 60000 - (now % 60000) + 150);
    clockTimer = setTimeout(scheduleMinuteClock, delay);
  }

  // ---------------- LAZY HOLIDAY AUDIO ----------------
  function syncMusicButton() {
    if (!btnMusicEl) return;
    btnMusicEl.setAttribute('aria-pressed', String(musicPlaying));
    btnMusicEl.setAttribute('title', musicPlaying ? 'Tạm dừng nhạc Giáng sinh' : 'Bật nhạc Giáng sinh nhẹ nhàng');
    btnMusicEl.setAttribute('aria-label', musicPlaying ? 'Tạm dừng nhạc Giáng sinh' : 'Bật nhạc Giáng sinh nhẹ nhàng');
  }

  function toggleMusic() {
    if (!mounted) return;
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.preload = 'none';
      audioEl.loop = true;
      audioEl.volume = 0.28;
      audioEl.src = `${ASSET_BASE}/audio/jingle-bells.mp3`;
      audioEl.addEventListener('pause', () => { musicPlaying = false; syncMusicButton(); });
      audioEl.addEventListener('play', () => { musicPlaying = true; syncMusicButton(); });
    }
    if (musicPlaying) {
      audioEl.pause();
    } else {
      audioEl.play().catch(() => {
        musicPlaying = false;
        syncMusicButton();
      });
    }
  }

  function releaseAudio() {
    if (!audioEl) return;
    try {
      audioEl.pause();
      audioEl.removeAttribute('src');
      audioEl.load();
    } catch (e) { }
    audioEl = null;
    musicPlaying = false;
    syncMusicButton();
  }

  // ---------------- DOM CONSTRUCTION ----------------
  function buildLeftWindowCard() {
    const card = document.createElement('section');
    card.id = 'noelWindowCardLeft';
    card.setAttribute('aria-label', 'Ô cửa sổ Giáng sinh Nhựa Tiền Phong');
    card.innerHTML = `
      <header class="nw-left-head">
        <div class="nw-brand-row">
          <div class="nw-brand-id">
            <div class="nw-brand-logo-wrap">
              <img class="nw-brand-logo" src="tienphong_logo2.png"
                onerror="this.onerror=null; this.src='https://nhuatienphong.vn/main/imgs/ntp/logo2.png';"
                alt="Nhựa Tiền Phong" />
            </div>
            <div class="nw-brand-text">
              <div class="nw-brand-company">NHỰA TIỀN PHONG</div>
              <div class="nw-brand-dept">Ban Dịch Vụ Khách Hàng</div>
            </div>
          </div>
          <div class="nw-controls">
            <div class="nw-mode-toggle" role="group" aria-label="Chế độ cảnh Ngày và Đêm">
              <button type="button" class="nw-mode-btn" data-nw-mode="day" aria-pressed="true" title="Cảnh Ban ngày">
                <i class="fa-solid fa-sun" aria-hidden="true"></i><span>Ngày</span>
              </button>
              <button type="button" class="nw-mode-btn" data-nw-mode="night" aria-pressed="false" title="Cảnh Ban đêm">
                <i class="fa-solid fa-moon" aria-hidden="true"></i><span>Đêm</span>
              </button>
            </div>
            <button type="button" class="nw-music-btn" data-nw-music aria-pressed="false" aria-label="Bật nhạc Giáng sinh nhẹ nhàng" title="Bật nhạc Giáng sinh nhẹ nhàng">
              <i class="fa-solid fa-music nw-music-icon text-xs" aria-hidden="true"></i>
              <span class="nw-music-bars" aria-hidden="true"><i></i><i></i><i></i></span>
            </button>
          </div>
        </div>
        <div class="nw-heading-block">
          <h1 class="nw-portal-title">Cổng Báo Cáo Công Việc</h1>
          <div class="nw-meta-line" aria-live="off">
            <span class="nw-meta-clock" data-nw-clock>08:30</span>
            <span class="nw-meta-dot" aria-hidden="true">·</span>
            <span data-nw-date>27/11/2026</span>
            <span class="nw-meta-dot" aria-hidden="true">·</span>
            <span data-nw-period>Kỳ 11/2026</span>
            <span class="nw-countdown-pill" data-nw-countdown>Còn 28 ngày tới 25/12</span>
          </div>
        </div>
      </header>
      <div class="nw-window-stage">
        <canvas class="nw-visitors-canvas" aria-hidden="true"></canvas>
        <img class="nw-window-frame-img" src="${ASSET_BASE}/img/window-frame-desktop.svg" alt="" aria-hidden="true" />
        <canvas class="nw-kitten-canvas" aria-hidden="true"></canvas>
      </div>
      <div class="nw-left-foot">
        <span class="nw-left-foot-note">
          <i class="fa-regular fa-snowflake" aria-hidden="true"></i>
          <span>Mùa Giáng Sinh An Lành · Nhịp Báo Cáo Chuẩn Xác</span>
        </span>
        <span class="nw-scene-indicator" data-nw-scene-label>Ban ngày</span>
      </div>
      <svg class="nw-wave-divider" viewBox="0 0 72 800" preserveAspectRatio="none" aria-hidden="true">
        <path fill="#F8F4EC" d="M0 0C0 160 72 302 72 466C72 615 18 735 18 800H0Z"></path>
      </svg>
    `;
    return card;
  }

  function syncLayout() {
    if (!mounted) return;
    const compact = isCompact();
    if (windowFrameImg) {
      const wantSrc = `${ASSET_BASE}/img/${compact ? 'window-frame-mobile.svg' : 'window-frame-desktop.svg'}`;
      if (windowFrameImg.getAttribute('src') !== wantSrc) {
        windowFrameImg.setAttribute('src', wantSrc);
      }
    }
    computeWorldCamera();
    ensureGardenImage(activeScene);
    if (gardenImgs.day) drawGardenCanvas('day');
    if (gardenImgs.night) drawGardenCanvas('night');
    resizeFxCanvas();
    resizeVisitors();
    resizeKitten();
    if (!compact) initCourtyardSprites();
    lastLightsGeomKey = '';
    syncFrameLights();

    const now = performance.now();
    paintFx(0, now);
    paintVisitors(0);
    paintKitten(0);
  }

  // ---------------- PUBLIC LIFECYCLE API ----------------
  function mount() {
    if (mounted) {
      paused = false;
      syncLayout();
      startOrPaint();
      return true;
    }
    loginScreenEl = document.getElementById('loginScreen');
    canvasShellEl = document.getElementById('loginScreenCanvas');
    rootEl = document.getElementById('noelWindowRoot');
    const rightCol = document.getElementById('loginRightCol');
    if (!loginScreenEl || !canvasShellEl || !rootEl || !rightCol) return false;
    if (loginScreenEl.getAttribute('data-login-theme') !== 'noel-advent') return false;
    if (loginScreenEl.classList.contains('hidden') || document.documentElement.classList.contains('app-auto-login-pending')) {
      return false;
    }

    mounted = true;
    paused = false;
    cleanups = [];
    lastLightsGeomKey = '';
    lastVisitorSig = '';
    lastKittenKey = '';

    compactMql = window.matchMedia('(max-width: 850px)');
    reducedMql = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 1. Populate streamlined backdrop inside #noelWindowRoot (unified single FX canvas at DPR=1)
    rootEl.innerHTML = `
      <canvas class="nw-garden-canvas nw-garden-day" aria-hidden="true"></canvas>
      <canvas class="nw-garden-canvas nw-garden-night" aria-hidden="true"></canvas>
      <div class="nw-sunset-wash" aria-hidden="true"></div>
      <canvas class="nw-fx-canvas" aria-hidden="true"></canvas>
      <div class="nw-stage-vignette" aria-hidden="true"></div>
    `;
    gardenDayCanvas = rootEl.querySelector('.nw-garden-day');
    gardenNightCanvas = rootEl.querySelector('.nw-garden-night');
    sunsetWashEl = rootEl.querySelector('.nw-sunset-wash');
    fxCanvas = rootEl.querySelector('.nw-fx-canvas');

    // 2. Insert Left Window Card right before #loginRightCol
    leftCardEl = buildLeftWindowCard();
    canvasShellEl.insertBefore(leftCardEl, rightCol);

    windowStageEl = leftCardEl.querySelector('.nw-window-stage');
    windowFrameImg = leftCardEl.querySelector('.nw-window-frame-img');
    visitorsCanvas = leftCardEl.querySelector('.nw-visitors-canvas');
    kittenCanvas = leftCardEl.querySelector('.nw-kitten-canvas');
    clockNode = leftCardEl.querySelector('[data-nw-clock]');
    dateNode = leftCardEl.querySelector('[data-nw-date]');
    periodNode = leftCardEl.querySelector('[data-nw-period]');
    countdownNode = leftCardEl.querySelector('[data-nw-countdown]');
    sceneLabelNode = leftCardEl.querySelector('[data-nw-scene-label]');
    btnDayEl = leftCardEl.querySelector('[data-nw-mode="day"]');
    btnNightEl = leftCardEl.querySelector('[data-nw-mode="night"]');
    btnMusicEl = leftCardEl.querySelector('[data-nw-music]');

    // 3. Insert static perimeter lights SVG + GPU-composited phase glow canvases + legal footer
    lightsSvgEl = buildLightsOverlaySvg();
    canvasShellEl.appendChild(lightsSvgEl);

    lightsGlowCanvas = buildLightsGlowCanvas();
    canvasShellEl.appendChild(lightsGlowCanvas);

    footerEl = document.createElement('footer');
    footerEl.id = 'noelLegalFooter';
    footerEl.className = 'select-none';
    footerEl.textContent = 'Công ty CP Nhựa Thiếu Niên Tiền Phong · Trụ sở số 2 An Đà · Nhà máy 222 Mạc Đăng Doanh · Hải Phòng';
    canvasShellEl.appendChild(footerEl);

    // 4. Bind UI interactions
    addListener(btnDayEl, 'click', () => applySceneMode('day', { persist: true, animateSunset: true }));
    addListener(btnNightEl, 'click', () => applySceneMode('night', { persist: true, animateSunset: true }));
    addListener(btnMusicEl, 'click', toggleMusic);

    addListener(windowStageEl, 'pointerenter', () => {
      if (!isReducedMotion() && kitten.state === 'sleeping') {
        kitten.hoverActive = true;
      }
    });
    addListener(windowStageEl, 'pointerleave', () => {
      kitten.hoverActive = false;
    });

    // 5. Responsive, visibility, pagehide & reduced-motion listeners
    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        syncLayout();
      });
    };
    cleanups.push(() => { if (resizeRaf) cancelAnimationFrame(resizeRaf); });

    addListener(window, 'resize', onResize, { passive: true });
    addListener(window, 'orientationchange', onResize, { passive: true });
    addListener(compactMql, 'change', onResize);
    addListener(reducedMql, 'change', () => {
      syncFrameLights();
      startOrPaint();
    });
    addListener(document, 'visibilitychange', () => {
      if (document.hidden) pause();
      else resume();
    });
    addListener(window, 'pagehide', pause);

    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(leftCardEl);
      resizeObserver.observe(rightCol);
    }

    // 6. Initialize scene mode
    scenePref = readStoredScenePref();
    const initialMode = scenePref === 'auto' ? resolveAutoSceneMode(new Date()) : scenePref;
    activeScene = initialMode;
    nightTarget = initialMode === 'night' ? 1 : 0;
    nightLevel = nightTarget;

    // 7. Kick off lightweight sprites & initial paint
    initGlowSprites();
    initWindowVisitors();
    initKitten();
    if (!isCompact()) initCourtyardSprites();

    loginScreenEl.setAttribute('data-noel-ready', '1');
    applySceneMode(initialMode, { persist: false, animateSunset: false });
    scheduleMinuteClock();
    syncLayout();
    startOrPaint();
    return true;
  }

  function pause() {
    if (!mounted) return;
    paused = true;
    stopRaf();
    if (audioEl && !audioEl.paused) {
      try { audioEl.pause(); } catch (e) { }
    }
  }

  function resume() {
    if (!mounted) return;
    if (!loginScreenEl || loginScreenEl.classList.contains('hidden') || loginScreenEl.getAttribute('data-login-theme') !== 'noel-advent') {
      unmount();
      return;
    }
    paused = false;
    updateClockAndMetadata(new Date());
    lastLightsFrame = -1;
    startOrPaint();
  }

  function unmount() {
    if (!mounted) return;
    paused = true;
    mounted = false;
    stopRaf();
    if (clockTimer) { clearTimeout(clockTimer); clockTimer = null; }
    if (sunsetTimer) { clearTimeout(sunsetTimer); sunsetTimer = null; }
    if (resizeObserver) {
      try { resizeObserver.disconnect(); } catch (e) { }
      resizeObserver = null;
    }
    for (const fn of cleanups) {
      try { fn(); } catch (e) { }
    }
    cleanups = [];
    releaseAudio();

    if (leftCardEl && leftCardEl.parentNode) leftCardEl.parentNode.removeChild(leftCardEl);
    if (lightsSvgEl && lightsSvgEl.parentNode) lightsSvgEl.parentNode.removeChild(lightsSvgEl);
    if (lightsGlowCanvas && lightsGlowCanvas.parentNode) lightsGlowCanvas.parentNode.removeChild(lightsGlowCanvas);
    if (footerEl && footerEl.parentNode) footerEl.parentNode.removeChild(footerEl);
    if (rootEl) rootEl.innerHTML = '';
    if (loginScreenEl) {
      loginScreenEl.removeAttribute('data-noel-scene');
      loginScreenEl.removeAttribute('data-noel-ready');
    }

    leftCardEl = lightsSvgEl = lightsGlowCanvas = lightsGlowCtx = footerEl = windowStageEl = windowFrameImg = null;
    lightsBulbNodes = [];
    gardenDayCanvas = gardenNightCanvas = sunsetWashEl = fxCanvas = fxCtx = null;
    visitorsCanvas = visitorsCtx = kittenCanvas = kittenCtx = null;
    clockNode = dateNode = periodNode = countdownNode = sceneLabelNode = btnDayEl = btnNightEl = btnMusicEl = null;
    lastLightsGeomKey = '';
    lastLightsFrame = -1;
    lastVisitorSig = '';
    lastKittenKey = '';
  }

  function setSceneMode(mode) {
    if (mode === 'auto') {
      scenePref = 'auto';
      writeStoredScenePref('auto');
      applySceneMode(resolveAutoSceneMode(new Date()), { persist: false, animateSunset: true });
      return activeScene;
    }
    if (mode === 'toggle') {
      const next = activeScene === 'night' ? 'day' : 'night';
      applySceneMode(next, { persist: true, animateSunset: true });
      return activeScene;
    }
    if (mode === 'day' || mode === 'night') {
      applySceneMode(mode, { persist: true, animateSunset: true });
    }
    return activeScene;
  }

  window.NoelWindowTheme = Object.freeze({
    mount,
    pause,
    resume,
    unmount,
    setSceneMode,
    getSceneMode: () => activeScene,
    isMounted: () => mounted,
    isPaused: () => paused,
    getDebugStats: () => ({
      mounted,
      paused,
      activeScene,
      scenePref,
      hasRaf: rafHandle !== 0,
      hasClockTimer: clockTimer !== null,
      hasAudio: audioEl !== null,
      musicPlaying
    }),
    _utils: Object.freeze({
      getVietnamParts,
      resolveAutoSceneMode,
      getSmartReportPeriodVN,
      getChristmasCountdownInfo
    })
  });
})();
