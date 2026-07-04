/* =============================================================================
 * script.js — COLLEY Connect (모바일 앱)
 * 레퍼런스: 대동 커넥트 앱 (홈/원격/작업일지/차량관리/더보기)
 * -----------------------------------------------------------------------------
 * 구성:
 *   1) 아이콘/헬퍼
 *   2) 앱 상태 + 네비게이션(탭 + 서브 화면 스택)
 *   3) 지도(SVG) 빌더
 *   4) 화면 렌더러: 홈 / 원격 / 작업일지 / 차량관리 / 더보기
 *   5) 서브 화면: 가축 건강 / 초원 관리 / 보안 순찰 / 제품 정보
 *   6) 양몰이 임무 흐름 + 드론 제어 + 긴급 대응/시뮬레이션
 *   7) 차트(도넛/라인/바) · 열화상 · COLLEY 로봇 SVG
 *   8) 알림 시트 / 모달 / 토스트
 *
 * 실제 API 교체: 각 render 앞에서 fetch로 data.js 객체를 채우면 됩니다.
 * =============================================================================
 */

/* ============================================================
 * 1) 아이콘
 * ============================================================ */
const ICONS = {
  home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
  remote: '<circle cx="12" cy="12" r="3"/><path d="M5 5a10 10 0 0 1 14 0M8 8a6 6 0 0 1 8 0"/><path d="M12 15v5"/>',
  log: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  manage: '<path d="M14 6a4 4 0 0 0 5 5l-8 8-3-3 8-8-2-2z"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  drone: '<circle cx="6" cy="6" r="2.3"/><circle cx="18" cy="6" r="2.3"/><circle cx="6" cy="18" r="2.3"/><circle cx="18" cy="18" r="2.3"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M6 8.3v2.7M18 8.3v2.7M6 15.7v-2M18 15.7v-2"/>',
  robot: '<rect x="4" y="9" width="16" height="9" rx="3"/><path d="M4 14h2m12 0h2M8 18v2m8-2v2M9 13h.01M15 13h.01M12 9V5m0 0a1.4 1.4 0 1 0 0-2.8A1.4 1.4 0 0 0 12 5z"/>',
  ai: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
  sheep: '<circle cx="12" cy="13" r="6"/><path d="M8 9a2 2 0 1 1 3-3M16 9a2 2 0 1 0-3-3M10 20v1m4-1v1"/>',
  grass: '<path d="M12 21c0-6-3-9-3-9m3 9c0-6 3-9 3-9m-3 9c0-4 0-7 0-7M6 21c0-4-2-6-2-6m14 6c0-4 2-6 2-6"/>',
  shield: '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z"/>',
  play: '<path d="M7 4l13 8-13 8V4z"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  alert: '<path d="M12 2 2 20h20L12 2zm0 7v5m0 3h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrowR: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  battery: '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 10v4"/><rect x="4" y="9" width="8" height="6" rx="1" fill="currentColor" stroke="none"/>',
  temp: '<path d="M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0z"/>',
  coolant: '<path d="M12 3v6m0 0-3-3m3 3 3-3M6 14a6 6 0 1 0 12 0c0-3-2-5-6-8-4 3-6 5-6 8z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-6z"/>',
  power: '<path d="M12 3v9m6-5a8 8 0 1 1-12 0"/>',
  gauge: '<path d="M12 13l4-4M4 20a10 10 0 1 1 16 0"/>',
  location: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  route: '<circle cx="6" cy="19" r="2.3"/><circle cx="18" cy="5" r="2.3"/><path d="M8 19h6a4 4 0 0 0 4-4V8"/>',
  gather: '<path d="M12 12l7-7m-7 7L5 5m7 7v9M5 19h14"/><circle cx="12" cy="12" r="2"/>',
  seed: '<path d="M12 22c5-2 8-6 8-11 0-2-1-4-2-5-2 3-6 3-8 6s-1 8 2 10z"/>',
  wrench: '<path d="M14 6a4 4 0 0 0 5 5l-8 8-3-3 8-8-2-2z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  dot: '<circle cx="12" cy="12" r="4"/>',
  spanner: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M4 12H2m20 0h-2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  expand: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'
};
function icon(name, size = 20, sw = 2) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function cap(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }
function statusChip(text, kind) { return `<span class="st ${kind}"><span class="dot"></span>${text}</span>`; }

/* ============================================================
 * 2) 앱 상태 + 네비게이션
 * ============================================================ */
const APP = {
  tab: 'home',
  sub: null,                 // { name, title }
  selectedFlockId: null,
  targetZoneId: null,
  highlightStrayId: null,
  manageDevice: 'COLLEY-01', // 차량관리 선택 장치
  manageTab: '상세정보',
  herding: { active: false, phaseIndex: -1, progress: 0, timer: null },
  sim: { running: false },
  remoteTimer: null
};

const TABS = [
  { id: 'home', label: '홈', icon: 'home', title: '위치' },
  { id: 'remote', label: '원격', icon: 'remote', title: '원격 제어' },
  { id: 'worklog', label: '작업일지', icon: 'log', title: '작업일지' },
  { id: 'manage', label: '기기관리', icon: 'manage', title: '기기관리' },
  { id: 'more', label: '더보기', icon: 'more', title: '더보기' }
];

function buildTabbar() {
  const bar = $('#tabbar'); bar.innerHTML = '';
  TABS.forEach(t => {
    const b = h(`<button class="tab ${t.id === APP.tab ? 'is-active' : ''}" data-tab="${t.id}"><span class="tab__ic">${icon(t.icon, 22)}</span><span>${t.label}</span></button>`);
    b.addEventListener('click', () => setTab(t.id));
    bar.appendChild(b);
  });
}

function setTab(id) {
  APP.tab = id; APP.sub = null;
  $$('.tab').forEach(b => b.classList.toggle('is-active', b.dataset.tab === id));
  $$('.view').forEach(v => v.classList.remove('is-active'));
  $('#view-' + id).classList.add('is-active');
  const R = { home: renderHome, remote: renderRemote, worklog: renderWorklog, manage: renderManage, more: renderMore };
  R[id]();
  $('#screen').scrollTop = 0;
}

// 서브 화면 푸시 (더보기 → 가축/초원/보안/제품)
function pushSub(name, title) {
  APP.sub = { name, title };
  $$('.view').forEach(v => v.classList.remove('is-active'));
  const el = $('#view-sub');
  el.classList.add('is-active');
  const R = { livestock: renderLivestock, grassland: renderGrassland, security: renderSecurity, product: renderProduct };
  (R[name] || (() => {}))(el);
  // 상단바에 뒤로가기가 없으므로 서브 화면 내부에 뒤로가기 헤더 삽입
  el.insertAdjacentHTML('afterbegin',
    `<button class="sub-back" id="subBack" aria-label="뒤로"><span class="sub-back__ico"></span>${title}</button>`);
  const sb = $('#subBack'); if (sb) sb.addEventListener('click', popSub);
  $('#screen').scrollTop = 0;
}
function popSub() {
  if (APP.sub) { setTab(APP.tab); }
}

/* ============================================================
 * 3) 지도(SVG) 빌더 (홈/가축/보안 공용)
 * ============================================================ */
function buildMapSVG(opts = {}) {
  const o = Object.assign({ interactive: true, heatmap: true, scan: true, pins: true }, opts);
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1000 700');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '목장 위치 지도');
  const mk = (tag, attrs, cls) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (cls) e.setAttribute('class', cls); return e; };

  // 배경: 위성(항공) 사진 or 자연 목초지 톤
  if (o.satellite) {
    const im = mk('image', { x: 0, y: 0, width: 1000, height: 700, preserveAspectRatio: 'xMidYMid slice' });
    im.setAttribute('href', 'assets/images/ranch-satellite.jpg');
    im.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'assets/images/ranch-satellite.jpg');
    svg.appendChild(im);
    // 핀 대비를 위한 약한 오버레이
    const ov = mk('rect', { x: 0, y: 0, width: 1000, height: 700, fill: '#16200f' }); ov.style.opacity = '0.14'; svg.appendChild(ov);
  } else {
    svg.appendChild(mk('rect', { x: 0, y: 0, width: 1000, height: 700, fill: '#46612f' }));
  }

  // 방목 구역 — 위성모드: 얇은 윤곽선만 / 일반모드: 색 채움
  const zoneFill = { overgrazed: '#8a7a4a', available: '#7fb02f', healthy: '#4a8a30', recovery: '#8a9a3a' };
  RANCH.zones.forEach(z => {
    // 위성모드: 점선 네모 없이 투명한 클릭 영역만 / 일반모드: 색 채움
    const rect = o.satellite
      ? mk('rect', { x: z.x, y: z.y, width: z.w, height: z.h, fill: 'transparent' }, 'zone-hit' + (APP.targetZoneId === z.id ? ' is-target' : ''))
      : mk('rect', { x: z.x, y: z.y, width: z.w, height: z.h, fill: zoneFill[z.status] || '#5f7a45' }, 'zone-rect' + (APP.targetZoneId === z.id ? ' is-target' : ''));
    if (o.interactive) { rect.style.cursor = 'pointer'; rect.addEventListener('click', () => onZoneClick(z.id)); }
    svg.appendChild(rect);
    const lbl = mk('text', { x: z.x + 12, y: z.y + 26 }, 'zone-label'); lbl.textContent = z.name;
    if (o.satellite) lbl.setAttribute('style', 'paint-order:stroke;stroke:rgba(20,28,15,.55);stroke-width:3px');
    svg.appendChild(lbl);
  });
  // 목표 구역 강조(점선)는 일반 모드에서만 (위성 이미지 위에는 점선 네모 미표시)
  if (APP.targetZoneId && !o.satellite) { const r = svg.querySelector(`.is-target`); if (r) { r.setAttribute('stroke', '#0A6E8F'); r.setAttribute('stroke-width', '3'); r.setAttribute('stroke-dasharray', '8 5'); } }

  // 초원 heatmap (일반 모드에서만)
  if (o.heatmap && !o.satellite) RANCH.zones.forEach(z => {
    const g = GRASSLAND.find(g => g.zone === z.id); if (!g) return;
    const col = g.density > 75 ? '#4a9a3f' : g.density > 55 ? '#8cc23a' : g.density > 40 ? '#c9b046' : '#b0763a';
    const cell = mk('rect', { x: z.x, y: z.y, width: z.w, height: z.h, fill: col }, 'heat-cell'); cell.style.opacity = '0.20'; svg.appendChild(cell);
  });

  // 들꽃 노랑 포인트 (무드보드 톤) — 상태 좋은 구역에 은은하게 흩뿌림
  if (o.heatmap && !o.satellite) RANCH.zones.forEach((z, zi) => {
    const g = GRASSLAND.find(g => g.zone === z.id); if (!g || g.density < 55) return;
    for (let i = 0; i < 10; i++) {
      const fx = z.x + ((i * 97 + zi * 53) % (z.w - 20)) + 10;
      const fy = z.y + ((i * 61 + zi * 29) % (z.h - 20)) + 10;
      const fl = mk('circle', { cx: fx, cy: fy, r: 2.4, fill: '#e3c53c' }); fl.style.opacity = '0.55'; fl.style.pointerEvents = 'none'; svg.appendChild(fl);
    }
  });

  // 안전 구역 — 위성모드에선 점선 박스 없이 라벨만
  const sz = RANCH.safeZone;
  if (!o.satellite) svg.appendChild(mk('rect', { x: sz.x, y: sz.y, width: sz.w, height: sz.h, rx: 8 }, 'safe-zone'));
  svg.appendChild(mk('text', { x: sz.x + 8, y: sz.y + 22 }, 'zone-label')).textContent = 'Safe';

  // 울타리 / 장애물 (일반 모드에서만 — 위성 사진엔 실제 지형이 있음)
  if (!o.satellite) {
    svg.appendChild(mk('polyline', { points: RANCH.fence.map(p => p.join(',')).join(' ') }, 'fence-line'));
    RANCH.obstacles.forEach(ob => svg.appendChild(mk('circle', { cx: ob.x, cy: ob.y, r: ob.r }, 'obstacle ' + (ob.type === 'pond' ? 'pond' : ''))));
  }

  // AI 경로
  if (APP.selectedFlockId && APP.targetZoneId) {
    const fl = FLOCKS.find(f => f.id === APP.selectedFlockId), tz = RANCH.zones.find(z => z.id === APP.targetZoneId);
    if (fl && tz) {
      const tx = tz.x + tz.w / 2, ty = tz.y + tz.h / 2;
      svg.appendChild(mk('path', { d: `M ${fl.x} ${fl.y} Q ${(fl.x + tx) / 2 + 40} ${Math.min(fl.y, ty) - 30} ${tx} ${ty}` }, 'route-ai' + (REDUCED_MOTION ? '' : ' anim-flow')));
      svg.appendChild(mk('circle', { cx: tx, cy: ty, r: 8, fill: 'none', stroke: '#B8F0FF', 'stroke-width': 2.5 }));
    }
  }

  // 위험/포식자
  THREATS.forEach(t => {
    if (!t.active) return;
    svg.appendChild(mk('circle', { cx: t.x, cy: t.y, r: 70 }, 'danger-zone' + (REDUCED_MOTION ? '' : ' anim-blink')));
    svg.appendChild(mk('circle', { cx: t.x, cy: t.y, r: 18 }, 'predator__pulse' + (REDUCED_MOTION ? '' : ' anim-pulse')));
    svg.appendChild(mk('circle', { cx: t.x, cy: t.y, r: 8 }, 'predator__icon'));
  });

  // 드론 스캔
  if (o.scan && DRONE.docking === 'Undocked') svg.appendChild(mk('circle', { cx: DRONE.x, cy: DRONE.y, r: 95 }, 'scan-circle' + (REDUCED_MOTION ? '' : ' anim-scan')));

  // 양 무리
  FLOCKS.forEach(f => {
    const g = mk('g', {}, 'flock' + (f.health === 'Attention' ? ' attention' : '') + (APP.selectedFlockId === f.id ? ' is-selected' : ''));
    g.appendChild(mk('circle', { cx: f.x, cy: f.y, r: 30 }, 'flock__ring'));
    g.appendChild(mk('circle', { cx: f.x, cy: f.y, r: 22 }, 'flock__blob'));
    g.appendChild(mk('text', { x: f.x, y: f.y - 1 }, 'flock__count')).textContent = f.count;
    g.appendChild(mk('text', { x: f.x, y: f.y + 34 }, 'flock__name')).textContent = f.name;
    if (o.interactive) { g.style.cursor = 'pointer'; g.addEventListener('click', () => onFlockClick(f.id)); }
    svg.appendChild(g);
  });

  // 이상 개체
  LIVESTOCK.filter(s => s.risk !== 'Healthy').forEach(s => {
    const g = mk('g', {}, 'stray' + (APP.highlightStrayId === s.id ? ' is-highlight' : ''));
    g.appendChild(mk('circle', { cx: s.x, cy: s.y, r: 16 }, 'stray__pulse' + (REDUCED_MOTION ? '' : ' anim-pulse')));
    g.appendChild(mk('circle', { cx: s.x, cy: s.y, r: 5 }, 'stray__dot' + (s.risk === 'Critical' ? ' critical' : '')));
    if (o.interactive) { g.style.cursor = 'pointer'; g.addEventListener('click', () => openDeviceOrStray(s.id)); }
    svg.appendChild(g);
  });

  // COLLEY 위치 핀 (대동: 장치 핀 + 라벨)
  if (o.pins) {
    const cg = mk('g', {}, 'map-pin');
    cg.appendChild(mk('path', { d: pinPath(COLLEY.x, COLLEY.y) }, 'map-pin__body'));
    cg.appendChild(mk('circle', { cx: COLLEY.x, cy: COLLEY.y - 30, r: 9, fill: '#fff' }));
    const rc = mk('g', { transform: `translate(${COLLEY.x - 7} ${COLLEY.y - 37})` });
    rc.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0A6E8F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICONS.robot}</svg>`;
    cg.appendChild(rc);
    cg.appendChild(mk('text', { x: COLLEY.x, y: COLLEY.y + 18 }, 'map-colley__label')).textContent = COLLEY.id;
    if (o.interactive) { cg.style.cursor = 'pointer'; cg.addEventListener('click', () => openDeviceModal('COLLEY-01')); }
    svg.appendChild(cg);
  }

  // 드론 (도킹 해제 시)
  if (DRONE.docking === 'Undocked') {
    const dg = mk('g', {}, 'map-drone');
    dg.appendChild(mk('circle', { cx: DRONE.x, cy: DRONE.y, r: 9 }, 'map-drone__body'));
    [[-6,-6],[6,-6],[-6,6],[6,6]].forEach(([dx,dy]) => dg.appendChild(mk('circle', { cx: DRONE.x+dx, cy: DRONE.y+dy, r: 2.6, fill: '#3f78c4' })));
    if (o.interactive) { dg.style.cursor = 'pointer'; dg.addEventListener('click', () => openDeviceModal('DRONE-01')); }
    svg.appendChild(dg);
  }
  return svg;
}
function pinPath(cx, cy) { return `M ${cx} ${cy} C ${cx-13} ${cy-16} ${cx-13} ${cy-40} ${cx} ${cy-40} C ${cx+13} ${cy-40} ${cx+13} ${cy-16} ${cx} ${cy} Z`; }
function mapLegend() {
  const items = [['#4a9a3f','정상 초원'],['#b0763a','과방목'],['#fff','양 무리'],['#cc4438','위험']];
  return `<div class="map-legend">${items.map(([c,l]) => `<span class="lg"><span class="sw" style="background:${c};border:1px solid rgba(0,0,0,.15)"></span>${l}</span>`).join('')}</div>`;
}
function onFlockClick(id) { APP.selectedFlockId = id; APP.highlightStrayId = null; refreshMap(); openModal('Flock ' + id, flockDetailHTML(FLOCKS.find(f => f.id === id))); }
function onZoneClick(id) { if (APP.selectedFlockId) { APP.targetZoneId = id; refreshMap(); toast('목표 구역: Zone ' + id + ' — 원격 화면에서 START'); } }
function openDeviceOrStray(id) { openModal(id, livestockDetailHTML(LIVESTOCK.find(s => s.id === id))); }

function refreshMap() {
  // 현재 보이는 지도만 갱신
  const containers = [['#homeMap', { interactive: true, satellite: true }], ['#liveMapSub', { interactive: true }]];
  containers.forEach(([sel, opt]) => { const w = $(sel); if (w) { w.innerHTML = ''; w.appendChild(buildMapSVG(opt)); w.insertAdjacentHTML('beforeend', `<div class="home-map__badge">${icon('location',13)} 실시간 위치</div>` + mapLegend()); } });
  if (APP.sub && APP.sub.name === 'security') drawThermal();
}

/* ============================================================
 * 4) 홈 화면
 * ============================================================ */
function renderHome() {
  const el = $('#view-home');
  const total = FLOCKS.reduce((s, f) => s + f.count, 0);
  const critical = LIVESTOCK.filter(s => s.risk === 'Critical').length;
  const attention = LIVESTOCK.filter(s => s.risk === 'Attention').length;
  const atRisk = critical + attention;
  const running = APP.herding.active;
  el.innerHTML = `
    ${colleyActionScene()}

    <!-- 실시간 지도 -->
    <div class="card" style="padding:0">
      <div class="card__hd" style="padding:14px 14px 10px">
        <span class="chiplbl"><span class="dot"></span>LIVE MAP</span>
        <span class="card__spacer" style="flex:1"></span>
        <button class="ghostbtn" id="mapExpand">${icon('expand',13)} Expand</button>
      </div>
      <div style="padding:0 14px 14px">
        <div class="home-map" id="homeMap"></div>
      </div>
    </div>

    <!-- 상태 카드 -->
    <div class="sec-title"><span class="ic">${icon('gauge',18)}</span><h2>전체 현황</h2><span class="meta">실시간</span></div>
    <div class="summary">
      <div class="s"><span class="cap"></span><div class="v">${total}</div><div class="l">전체 양</div></div>
      <div class="s g"><span class="cap"></span><div class="v">${total - atRisk}</div><div class="l">건강</div></div>
      <div class="s a"><span class="cap"></span><div class="v">${atRisk}</div><div class="l">관심필요</div></div>
      <div class="s d"><span class="cap"></span><div class="v">${DEVICES.length}</div><div class="l">장치</div></div>
    </div>

    <!-- 빠른 기능 -->
    <div class="sec-title"><span class="ic">${icon('bolt',18)}</span><h2>빠른 실행</h2></div>
    <div class="quickmenu">
      <button class="qm green" data-q="herd"><span class="ic">${icon('route',28)}</span><span>양몰이</span></button>
      <button class="qm blue" data-q="drone"><span class="ic">${icon('drone',28)}</span><span>드론출동</span></button>
      <button class="qm amber" data-q="patrol"><span class="ic">${icon('shield',28)}</span><span>순찰</span></button>
      <button class="qm red" data-q="gather"><span class="ic">${icon('gather',28)}</span><span>긴급집결</span></button>
    </div>

    <!-- AI 협업 타임라인 -->
    <div class="sec-title"><span class="ic">${icon('ai',18)}</span><h2>AI 협업</h2><span class="meta">${running ? '임무 진행중' : '대기'}</span></div>
    <div class="card"><div class="card__pad"><div class="timeline" id="flowBox"></div></div></div>

    <!-- 기기목록 -->
    <div class="sec-title"><span class="ic">${icon('robot',18)}</span><h2>기기목록</h2><span class="meta">${DEVICES.length}대</span></div>
    <div id="deviceList"></div>
  `;
  const wrap = $('#homeMap');
  wrap.appendChild(buildMapSVG({ interactive: true, satellite: true }));
  wrap.insertAdjacentHTML('beforeend',
    `<div class="home-map__badge"><span class="dot"></span>LIVE MAP</div>` +
    `<button class="home-map__expand" id="mapExpand2">${icon('expand',13)} Expand</button>` +
    mapLegend());

  renderFlow($('#flowBox'));
  renderDeviceList($('#deviceList'));

  $('#mapExpand').addEventListener('click', openMapModal);
  const me2 = $('#mapExpand2'); if (me2) me2.addEventListener('click', openMapModal);

  $$('.qm', el).forEach(b => b.addEventListener('click', () => {
    const q = b.dataset.q;
    if (q === 'herd') { toast('지도에서 양 무리 → 목표 구역을 선택하세요'); }
    else if (q === 'drone') launchDrone();
    else if (q === 'patrol') pushSub('security', '보안 순찰');
    else if (q === 'gather') emergencyGather();
  }));
}

// 지도 확대 (Expand)
function openMapModal() {
  openModal('LIVE MAP', `<div class="modal-map" id="modalMap"></div>
    <div class="muted mt12" style="font-size:12.5px">위성 지도 위에서 양 무리·COLLEY·드론·AI 경로를 실시간으로 확인합니다.</div>`);
  const mm = $('#modalMap');
  if (mm) { mm.appendChild(buildMapSVG({ interactive: true, satellite: true })); mm.insertAdjacentHTML('beforeend', mapLegend()); }
}

// AI 협업 타임라인 (단계형: 상태 배지 + 진행률 + 타임스탬프)
function renderFlow(box) {
  const fl = FLOCKS.find(f => f.id === (APP.selectedFlockId || 'B')) || FLOCKS[1];
  const running = APP.herding.active;
  const prog = running ? APP.herding.progress : 0;
  const phase = running ? (HERDING_PHASES[APP.herding.phaseIndex]?.name || 'Drive') : 'Drive';
  const steps = [
    { ic: 'drone', col: '#2f80c4', name: '드론 스캔', sub: `${fl.name} 감지 · ${fl.count}마리`, state: 'done', time: '14:20' },
    { ic: 'ai', col: '#f9a825', name: 'AI 분석', sub: `경로 최적화 · 신뢰도 94%`, state: 'done', time: '14:21' },
    { ic: 'robot', col: '#001220', name: `COLLEY 구동`, sub: running ? `${phase} 단계 · 양 무리 유도 중` : `배터리 ${COLLEY.battery}% · 대기`, state: running ? 'running' : 'done', time: '14:22', prog: running ? prog : null },
    { ic: 'check', col: '#14a58a', name: '임무 완료', sub: running ? '진행 중' : '직전 임무 완료', state: running ? 'pending' : 'done', time: running ? '—' : '14:52' }
  ];
  const badge = s => `<span class="tl-badge ${s}">${s === 'done' ? '완료' : s === 'running' ? '진행중' : '대기'}</span>`;
  box.innerHTML = steps.map(s => `
    <div class="tl-step ${s.state}">
      <div class="tl-rail"><span class="tl-node" style="background:${s.col}1a;color:${s.col}">${icon(s.ic, 18)}</span><span class="tl-line"></span></div>
      <div class="tl-body">
        <div class="tl-top"><span class="tl-name">${s.name}</span>${badge(s.state)}<span class="tl-time">${s.time}</span></div>
        <div class="tl-sub">${s.sub}</div>
        ${s.prog != null ? `<div class="tl-prog"><span style="width:${s.prog}%"></span></div>` : ''}
      </div>
    </div>`).join('');
}

function deviceGlyph(kind) {
  if (kind === 'drone') return droneImg();        // 드론 실사
  return colleyImg(COLLEY.droneStatus, true);     // COLLEY 실사
}
function renderDeviceList(box) {
  box.innerHTML = '';
  DEVICES.forEach(d => {
    const runKind = d.run === '운행중' ? 'blue' : d.run === '대기' ? 'gray' : 'blue';
    const card = h(`<div class="card"><div class="dev-card">
      <div class="dev-card__img">${deviceGlyph(d.kind)}</div>
      <div class="dev-card__body">
        <div class="dev-card__name">${d.name}</div>
        <div class="dev-card__model">${d.model}</div>
        <div class="dev-card__pills">
          <span class="pill ${runKind}"><span class="dot"></span>${d.run}</span>
          <span class="pill green">${d.health}</span>
        </div>
        <div class="dev-card__note">${d.note}</div>
      </div>
      <button class="dev-card__more" aria-label="상세">${icon('arrowR',18)}</button>
    </div></div>`);
    card.addEventListener('click', () => { APP.manageDevice = d.id; setTab('manage'); });
    box.appendChild(card);
  });
}

/* ============================================================
 * 원격(Remote) 화면 — 대동 시그니처
 * ============================================================ */
function renderRemote() {
  const el = $('#view-remote');
  const running = TELEMETRY.running;
  el.innerHTML = `
    <div class="remote">
      <div class="remote__states" id="remoteStates"></div>

      <div class="dial-wrap">
        <svg viewBox="0 0 260 260" aria-hidden="true">
          <circle cx="130" cy="130" r="112" fill="none" stroke="#eef0f2" stroke-width="10"/>
          <path id="arcRpm" class="dial-arc" fill="none" stroke="url(#gOrange)" stroke-width="10" stroke-linecap="round"/>
          <path id="arcSpeed" class="dial-arc" fill="none" stroke="url(#gTeal)" stroke-width="10" stroke-linecap="round"/>
          <defs>
            <linearGradient id="gOrange" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FD6EE"/><stop offset="1" stop-color="#0A6E8F"/></linearGradient>
            <linearGradient id="gTeal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fbfae"/><stop offset="1" stop-color="#3f78c4"/></linearGradient>
          </defs>
        </svg>
        <button class="start-btn ${running ? 'is-running' : ''}" id="startBtn">${running ? 'RUNNING' : 'START'}</button>
        <div class="dial-label l">모터 RPM<b id="rpmVal">${TELEMETRY.rpm}</b></div>
        <div class="dial-label r">속도<b id="spdVal">${TELEMETRY.speed}</b></div>
      </div>
      <button class="stop-btn ${running ? 'is-active' : ''}" id="stopBtn">STOP</button>

      <div class="remote__guide ${running ? 'on' : ''}" id="remoteGuide">${running ? 'COLLEY-01 원격 운행 중입니다.' : 'COLLEY를 출동시키려면 START 버튼을 누르세요.'}</div>

      <div class="card"><div class="card__pad telemetry" id="teleBox"></div></div>

      <div class="card mt12"><div class="card__pad">
        <div class="card__title" style="margin-bottom:6px">원격 임무</div>
        <div class="mc-controls">
          <button class="btn btn--sm btn--primary" id="rmHerd">${icon('route',15)} 양몰이 출동</button>
          <button class="btn btn--sm" id="rmDrone">${icon('drone',15)} 드론 이륙</button>
          <button class="btn btn--sm btn--danger" id="rmGather">${icon('gather',15)} 긴급집결</button>
        </div>
      </div></div>
    </div>`;

  // 상태칩
  const sb = $('#remoteStates');
  const activeState = running ? '운행중' : (DRONE.docking === 'Undocked' ? '준비완료' : (COLLEY.battery > 20 ? '출동가능' : '대기중'));
  REMOTE_STATES.forEach(s => { sb.appendChild(h(`<span class="rs ${s === activeState ? 'is-active' : ''}">${s}</span>`)); });

  updateDial();
  renderTelemetry($('#teleBox'));

  $('#startBtn').addEventListener('click', toggleRemote);
  $('#stopBtn').addEventListener('click', stopRemote);
  $('#rmHerd').addEventListener('click', () => { if (!APP.selectedFlockId || !APP.targetZoneId) { toast('홈 지도에서 양 무리와 목표 구역을 먼저 선택하세요'); setTab('home'); } else startHerding(); });
  $('#rmDrone').addEventListener('click', () => launchDrone());
  $('#rmGather').addEventListener('click', () => emergencyGather());
}

function updateDial() {
  const arcRpm = $('#arcRpm'), arcSpeed = $('#arcSpeed');
  if (!arcRpm) return;
  // 좌측 반원(위→아래, RPM), 우측 반원(위→아래, SPEED)
  const cx = 130, cy = 130, r = 112;
  const arc = (startDeg, endDeg) => {
    const p = (deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
    const [x1, y1] = p(startDeg), [x2, y2] = p(endDeg);
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    const sweep = endDeg > startDeg ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`;
  };
  const rpmRatio = Math.min(1, TELEMETRY.rpm / 3000);
  const spdRatio = Math.min(1, TELEMETRY.speed / 15);
  // 좌: 240° → 120° (위쪽 왼편) ; 우: 300° → 60° (위쪽 오른편)
  arcRpm.setAttribute('d', arc(150, 150 + 120 * rpmRatio));
  arcSpeed.setAttribute('d', arc(30, 30 - 120 * spdRatio));
  const rv = $('#rpmVal'), sv = $('#spdVal'); if (rv) rv.textContent = Math.round(TELEMETRY.rpm); if (sv) sv.textContent = TELEMETRY.speed.toFixed(1);
}

function renderTelemetry(box) {
  const rows = [
    ['power', '평균 소비전력', TELEMETRY.power.toFixed(1), 'kWh'],
    ['temp', '모터 온도', Math.round(TELEMETRY.motorTemp), '°C'],
    ['coolant', '냉각 온도', Math.round(TELEMETRY.coolant), '°C'],
    ['bolt', '배터리 전압', TELEMETRY.voltage.toFixed(1), 'V']
  ];
  box.innerHTML = rows.map(([ic, k, v, u]) => `<div class="tele-row"><span class="ic">${icon(ic, 20)}</span><span class="k">${k}</span><span class="v">${v}<small>${u}</small></span></div>`).join('');
}

function toggleRemote() {
  TELEMETRY.running = !TELEMETRY.running;
  if (TELEMETRY.running) {
    COLLEY.mission = '원격 운행'; COLLEY.motor = 'active'; COLLEY.speed = 1.2;
    addAlert('Information', '원격 운행 시작', 'COLLEY-01 원격 시동을 걸었습니다.');
    startRemoteLoop();
  } else { stopRemoteLoop(); COLLEY.mission = 'Idle'; COLLEY.motor = 'online'; COLLEY.speed = 0; }
  renderRemote();
}
function stopRemote() {
  if (!TELEMETRY.running && TELEMETRY.rpm === 0) { toast('이미 정지 상태입니다'); return; }
  TELEMETRY.running = false; stopRemoteLoop();
  COLLEY.mission = 'Idle'; COLLEY.motor = 'online'; COLLEY.speed = 0;
  addAlert('Information', '원격 운행 정지', 'COLLEY-01을 정지했습니다.');
  renderRemote();
}
function startRemoteLoop() {
  clearInterval(APP.remoteTimer);
  APP.remoteTimer = setInterval(() => {
    // 목표값으로 부드럽게 수렴
    const targetRpm = 2200, targetSpd = 8.5;
    TELEMETRY.rpm += (targetRpm - TELEMETRY.rpm) * 0.15;
    TELEMETRY.speed += (targetSpd - TELEMETRY.speed) * 0.15;
    TELEMETRY.power = 3.2 + (TELEMETRY.rpm / 3000) * 6;
    TELEMETRY.motorTemp = 34 + (TELEMETRY.rpm / 3000) * 28;
    TELEMETRY.coolant = 28 + (TELEMETRY.rpm / 3000) * 18;
    TELEMETRY.voltage = 48.2 - (TELEMETRY.rpm / 3000) * 3;
    updateDial();
    if (APP.tab === 'remote') renderTelemetry($('#teleBox'));
  }, REDUCED_MOTION ? 200 : 400);
}
function stopRemoteLoop() {
  clearInterval(APP.remoteTimer);
  const ease = setInterval(() => {
    TELEMETRY.rpm *= 0.7; TELEMETRY.speed *= 0.7;
    TELEMETRY.power = 3.2 + (TELEMETRY.rpm / 3000) * 6;
    TELEMETRY.motorTemp = 34 + (TELEMETRY.rpm / 3000) * 28;
    TELEMETRY.coolant = 28 + (TELEMETRY.rpm / 3000) * 18;
    TELEMETRY.voltage = 48.2 - (TELEMETRY.rpm / 3000) * 3;
    if (TELEMETRY.rpm < 5) { TELEMETRY.rpm = 0; TELEMETRY.speed = 0; clearInterval(ease); }
    updateDial();
    if (APP.tab === 'remote') renderTelemetry($('#teleBox'));
  }, REDUCED_MOTION ? 60 : 200);
}

/* ============================================================
 * 작업일지 화면
 * ============================================================ */
let logFilter = '전체';
function renderWorklog() {
  const el = $('#view-worklog');
  el.innerHTML = `
    <div class="card"><div class="card__pad">
      <div class="card__title" style="margin-bottom:8px">현재 임무</div>
      <div id="currentMission"></div>
    </div></div>

    <div class="card mt12"><div class="card__pad">
      <div class="card__title" style="margin-bottom:10px">양몰이 알고리즘 · Sweep / Lift / Drive / Pen</div>
      <div class="phase-grid" id="phaseGrid"></div>
    </div></div>

    <div class="sec-title mt16"><span class="ic">${icon('log',20)}</span><h2>작업 기록</h2></div>
    <div class="sec-underline"></div>
    <div class="chips" id="logFilters"></div>
    <div id="logList"></div>`;
  renderCurrentMission($('#currentMission'));
  renderPhaseGrid($('#phaseGrid'));

  const types = ['전체', 'Herd Sheep', 'Drone Scan', 'Patrol Mode', 'Grassland Recovery', 'Health Inspection'];
  const fb = $('#logFilters');
  types.forEach(t => { const c = h(`<button class="chip ${logFilter === t ? 'is-active' : ''}">${t}</button>`); c.addEventListener('click', () => { logFilter = t; renderWorklog(); }); fb.appendChild(c); });

  const list = $('#logList');
  const rows = WORKLOG.filter(w => logFilter === '전체' ? true : w.type === logFilter);
  list.innerHTML = rows.map(w => `<div class="card"><div class="log-item">
    <div class="top"><span class="type">${w.type}</span><span class="pill green">${w.result}</span><span class="date">${w.date}</span></div>
    <div class="kv"><span class="k">대상</span><span class="vv">${w.target}</span>
      <span class="k">소요시간</span><span class="vv">${w.dur}</span>
      <span class="k">작업 면적</span><span class="vv">${w.area}</span></div>
  </div></div>`).join('') || `<div class="empty">기록이 없습니다.</div>`;
}

function renderCurrentMission(box) {
  const m = MISSIONS.find(m => m.id === SYSTEM.currentMissionId && m.status === 'Active');
  if (!m) {
    box.innerHTML = `<div class="mission-empty"><div class="ic">${icon('log',30)}</div>
      <div><b>진행 중인 임무가 없습니다.</b></div>
      <div class="mt8">홈 지도에서 양 무리와 목표 구역을 선택한 뒤 원격에서 시작하세요.</div>
      <button class="btn btn--primary btn--sm mt12" id="goHomeMission">${icon('home',15)} 홈으로 이동</button></div>`;
    const b = $('#goHomeMission'); if (b) b.addEventListener('click', () => setTab('home'));
    return;
  }
  const phaseName = APP.herding.active ? HERDING_PHASES[APP.herding.phaseIndex]?.name : (m.phase || '—');
  const prog = APP.herding.active ? APP.herding.progress : m.progress;
  box.innerHTML = `
    <div class="mission-hero" style="padding:0">
      <div class="name">${m.type}</div>
      <div class="sub">${m.id} · ${m.target}</div>
      <div class="mc-grid">
        <div><div class="k">현재 단계</div><div class="v">${phaseName}</div></div>
        <div><div class="k">목적지</div><div class="v">Zone ${APP.targetZoneId || 'C'}</div></div>
        <div><div class="k">완료 예정</div><div class="v">${m.eta}</div></div>
        <div><div class="k">위험도</div><div class="v">${m.risk}</div></div>
      </div>
      <div class="muted" style="font-size:11px;margin-bottom:5px">진행률 ${prog}%</div>
      <div class="progress"><span style="width:${prog}%"></span></div>
      <div class="mc-controls">
        <button class="btn btn--sm" id="mPause">${icon('pause',15)} 일시정지</button>
        <button class="btn btn--sm btn--primary" id="mResume">${icon('play',15)} 재개</button>
        <button class="btn btn--sm btn--danger" id="mStop">${icon('stop',15)} 정지</button>
      </div>
    </div>`;
  $('#mPause').addEventListener('click', pauseHerding);
  $('#mResume').addEventListener('click', resumeHerding);
  $('#mStop').addEventListener('click', stopHerding);
}

/* Sweep/Lift/Drive/Pen 미니 */
function phaseMiniSVG(id) {
  const zone = `<rect x="86" y="18" width="28" height="44" rx="4" class="mini-zone"/>`;
  const sheep = (x, y) => `<circle cx="${x}" cy="${y}" r="4" class="mini-sheep"/>`;
  const colley = (x, y) => `<rect x="${x - 5}" y="${y - 4}" width="10" height="8" rx="3" class="mini-colley"/>`;
  const arrow = (x, y, r = 0) => `<path d="M${x} ${y} l8 0 m-3 -3 l3 3 l-3 3" class="mini-arrow" transform="rotate(${r} ${x} ${y})" stroke="#0A6E8F" stroke-width="1.5" fill="none"/>`;
  if (id === 'sweep') return `<svg viewBox="0 0 120 80">${sheep(40,34)}${sheep(52,42)}${sheep(46,52)}${sheep(58,34)}<path d="M20 60 A 34 34 0 0 1 84 30" class="mini-path"/>${colley(20,60)}${arrow(78,32,-30)}</svg>`;
  if (id === 'lift') return `<svg viewBox="0 0 120 80">${sheep(46,34)}${sheep(56,40)}${sheep(50,48)}${sheep(60,50)}<path d="M40 62 L48 50" class="mini-path"/>${colley(38,64)}${arrow(52,44,-45)}</svg>`;
  if (id === 'drive') return `<svg viewBox="0 0 120 80">${zone}${sheep(46,34)}${sheep(56,40)}${sheep(50,50)}<path d="M32 42 L80 42" class="mini-path"/>${colley(30,42)}${arrow(72,40)}</svg>`;
  return `<svg viewBox="0 0 120 80">${zone}${sheep(92,30)}${sheep(100,42)}${sheep(94,52)}<path d="M60 24 L84 34 M60 58 L84 48" class="mini-path"/>${colley(56,40)}${arrow(80,40)}</svg>`;
}
function renderPhaseGrid(box) {
  box.innerHTML = '';
  HERDING_PHASES.forEach((p, i) => {
    const active = APP.herding.active && APP.herding.phaseIndex === i;
    const done = APP.herding.active && APP.herding.phaseIndex > i;
    box.appendChild(h(`<div class="phase-mini ${active ? 'is-active' : ''}">
      ${active ? '<span class="badge">진행중</span>' : done ? '<span class="badge">완료</span>' : ''}
      ${phaseMiniSVG(p.id)}
      <div class="nm">${p.name}${done ? `<span class="chk">${icon('check',13)}</span>` : ''}</div>
      <div class="ds">${p.desc}</div></div>`));
  });
}

/* ============================================================
 * 차량관리 (탭형 상세)
 * ============================================================ */
function renderManage() {
  const el = $('#view-manage');
  el.innerHTML = `
    <div class="seg" id="devSeg">
      ${DEVICES.map(d => `<button data-dev="${d.id}" class="${APP.manageDevice === d.id ? 'is-active' : ''}">${d.name}</button>`).join('')}
    </div>
    <div class="detail-tabs" id="detailTabs">
      ${['고장진단', '소모품', '상세정보'].map(t => `<button data-t="${t}" class="${APP.manageTab === t ? 'is-active' : ''}">${t}</button>`).join('')}
    </div>
    <div id="manageBody"></div>`;
  $$('#devSeg button').forEach(b => b.addEventListener('click', () => { APP.manageDevice = b.dataset.dev; renderManage(); }));
  $$('#detailTabs button').forEach(b => b.addEventListener('click', () => { APP.manageTab = b.dataset.t; renderManage(); }));
  const body = $('#manageBody');
  if (APP.manageTab === '고장진단') renderDiagnostics(body);
  else if (APP.manageTab === '소모품') renderConsumables(body);
  else renderDetailInfo(body);
}

function renderDiagnostics(box) {
  const d = DEVICES.find(x => x.id === APP.manageDevice);
  const isRobot = d.kind === 'robot';
  const checks = isRobot
    ? [['구동 모터', 'ok'], ['관절 액추에이터', 'ok'], ['카메라 · LiDAR', 'ok'], ['통신 모듈', 'ok'], ['배터리 시스템', 'ok']]
    : [['비행 모터', 'ok'], ['프로펠러', 'ok'], ['열화상 카메라', 'ok'], ['GPS', 'ok'], ['도킹 결합부', 'ok']];
  box.innerHTML = `
    <div class="diag">
      <div class="diag__img">${isRobot ? colleyImg(COLLEY.droneStatus) : droneImg()}</div>
      <div class="diag__check">${icon('check',26)}</div>
      <div class="diag__msg">${isRobot ? 'COLLEY 로봇' : '드론'} 상태가 아주 좋습니다.</div>
      <div class="diag__list">
        ${checks.map(([k, s]) => `<div class="diag-row"><span class="k">${k}</span>${statusChip('정상', s)}</div>`).join('')}
      </div>
      <button class="btn btn--primary btn--block mt16" id="runDiag">${icon('spanner',16)} 진단 다시 실행</button>
    </div>`;
  $('#runDiag').addEventListener('click', () => { toast('진단 실행 중... 모든 시스템 정상'); addAlert('Information', '진단 완료', `${d.name} 자가 진단 완료 — 이상 없음.`); });
}

function renderConsumables(box) {
  box.innerHTML = `<div class="card"><div class="card__pad">
    ${CONSUMABLES.map(c => {
      const col = c.wear > 70 ? 'var(--red)' : c.wear > 55 ? 'var(--amber)' : 'var(--green)';
      return `<div class="cons-row"><div class="top"><span class="nm">${c.name}</span>${statusChip(c.life, c.status === 'warn' ? 'warn' : 'ok')}</div>
        <div class="bar"><span style="width:${c.wear}%;background:${col}"></span></div>
        <div class="life">마모도 ${c.wear}%</div></div>`;
    }).join('')}
  </div></div>
  <button class="btn btn--ghost btn--block mt12" id="orderParts">${icon('wrench',16)} 소모품 점검 예약</button>`;
  $('#orderParts').addEventListener('click', () => { addAlert('Warning', '소모품 점검 예약', '마모도가 높은 부품 점검을 예약했습니다.'); toast('점검을 예약했습니다.'); });
}

function renderDetailInfo(box) {
  const d = DEVICES.find(x => x.id === APP.manageDevice);
  box.innerHTML = `
    <div class="dev-hero">
      <div class="dev-hero__img">${d.kind === 'robot' ? colleyImg(COLLEY.droneStatus, true) : droneImg()}</div>
      <div><div class="dev-hero__name">${d.name}</div>
        <div class="dev-hero__spec">${d.model}<br>출력 : ${d.power} &nbsp; 배터리 : ${d.capacity}<br>탑재 : ${d.pto}</div></div>
    </div>

    <div class="card"><div class="card__pad">
      <div class="stat-block">
        <div class="head"><span class="t">사용통계 · ${USAGE.month}</span></div>
        <div class="head"><span class="t">총 작업시간</span><span class="v">${USAGE.totalTime}</span></div>
        ${lineGraph(USAGE.worktime)}
      </div>
      <div class="stat-block mt16">
        <div class="head"><span class="t">에너지 소모량</span><span class="v">${USAGE.energyTotal}</span></div>
        ${barGraph(USAGE.energy)}
      </div>
    </div></div>

    <div class="card mt12"><div class="card__pad">
      <div class="card__title" style="margin-bottom:10px">드론 도킹 단계</div>
      <div class="dock" id="dockStages"></div>
      <div class="muted mt12" style="font-size:12px" id="dockDesc"></div>
    </div></div>`;
  renderDockStages($('#dockStages'), $('#dockDesc'));
}

/* 사용통계 그래프 */
function lineGraph(data) {
  const vals = data.map(v => v || 0); const max = Math.max(...vals, 1);
  const w = 340, hh = 96, n = vals.length, step = w / (n - 1);
  const pts = vals.map((v, i) => [i * step, hh - (v / max) * (hh - 16) - 6]);
  const line = 'M' + pts.map(p => p.join(',')).join(' L');
  const area = `M0,${hh} L` + pts.map(p => p.join(',')).join(' L') + ` L${w},${hh} Z`;
  const labels = pts.map((p, i) => `<text x="${p[0]}" y="${hh - 1}" text-anchor="middle" class="axis">${i + 1}</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${hh + 4}" class="graph"><path d="${area}" fill="#0A6E8F" opacity="0.10"/><path d="${line}" fill="none" stroke="#0A6E8F" stroke-width="2.2"/>${pts.filter((p,i)=>vals[i]>0).map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#0A6E8F"/>`).join('')}${labels}</svg>`;
}
function barGraph(data) {
  const vals = data.map(v => v || 0); const max = Math.max(...vals, 1);
  const w = 340, hh = 96, n = vals.length, bw = w / n, maxIdx = vals.indexOf(Math.max(...vals));
  // 값이 낮을수록 옐로우, 높을수록 그린으로 보간
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  const barColor = (v) => {
    if (v === 0) return '#e5e7eb';
    const t = v / max, y = [184, 240, 255], g = [4, 39, 65];
    return `rgb(${lerp(y[0], g[0], t)},${lerp(y[1], g[1], t)},${lerp(y[2], g[2], t)})`;
  };
  const bars = vals.map((v, i) => {
    const bh = (v / max) * (hh - 22); const x = i * bw + 3, y = hh - bh - 12;
    const col = barColor(v);
    const tip = i === maxIdx && v > 0 ? `<text x="${x + (bw - 6) / 2}" y="${y - 3}" text-anchor="middle" font-size="9" font-weight="700" fill="#001220">${v}</text>` : '';
    return `<rect x="${x}" y="${y}" width="${bw - 6}" height="${bh}" rx="2" fill="${col}"/>${tip}<text x="${x + (bw - 6) / 2}" y="${hh - 1}" text-anchor="middle" class="axis">${i + 1}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${hh + 4}" class="graph">${bars}</svg>`;
}

/* 도킹 단계 */
function dockIcon(id, active) {
  const col = active ? '#0A6E8F' : '#9aa0a6';
  const drone = (dy) => `<g transform="translate(0 ${dy})"><rect x="16" y="12" width="20" height="7" rx="3" fill="${col}"/><circle cx="14" cy="14" r="3.4" fill="none" stroke="${col}" stroke-width="1.8"/><circle cx="38" cy="14" r="3.4" fill="none" stroke="${col}" stroke-width="1.8"/></g>`;
  const base = `<rect x="12" y="30" width="28" height="10" rx="4" fill="none" stroke="${col}" stroke-width="2.2"/>`;
  if (id === 'docked') return `<svg viewBox="0 0 52 46">${drone(14)}${base}</svg>`;
  if (id === 'launch') return `<svg viewBox="0 0 52 46">${drone(2)}${base}</svg>`;
  if (id === 'scan') return `<svg viewBox="0 0 52 46">${drone(0)}<ellipse cx="26" cy="38" rx="14" ry="3.5" fill="none" stroke="${col}" stroke-width="1.5"/></svg>`;
  return `<svg viewBox="0 0 52 46">${drone(8)}${base}</svg>`;
}
function renderDockStages(box, descBox) {
  const active = DRONE_STATUS_TO_STAGE[DRONE.status] || 'docked';
  box.innerHTML = '';
  DOCK_STAGES.forEach((s, i) => {
    box.appendChild(h(`<div class="dock-step ${s.id === active ? 'is-active' : ''}">${dockIcon(s.id, s.id === active)}<div class="nm">${s.name}</div></div>`));
    if (i < DOCK_STAGES.length - 1) box.appendChild(h(`<div class="dock-arrow">${icon('arrowR',12)}</div>`));
  });
  if (descBox) descBox.textContent = `현재: ${DRONE.status} — ${DOCK_STAGES.find(s => s.id === active).desc}`;
}

/* ============================================================
 * 더보기
 * ============================================================ */
function renderMore() {
  const el = $('#view-more');
  const menu = [
    ['livestock', 'sheep', 'var(--green)', '가축 건강 관리', '체온·활동량 분석으로 이상 개체 탐지'],
    ['grassland', 'grass', '#001220', '초원 관리', '구역별 초원 상태와 회복 계획'],
    ['security', 'shield', 'var(--blue)', '보안 순찰', '야간 순찰·포식자·침입 감시'],
    ['product', 'robot', 'var(--ink)', 'COLLEY 제품 정보', '로봇·드론 도킹 구조 살펴보기']
  ];
  el.innerHTML = `
    <div class="card"><div class="card__pad" style="padding:4px 15px"><div class="menu-list">
      ${menu.map(([n, ic, col, t, d]) => `<button class="menu-row" data-sub="${n}">
        <span class="ic" style="background:${col}">${icon(ic, 20)}</span>
        <span class="body"><span class="t">${t}</span><span class="d">${d}</span></span>
        <span class="arrow"></span></button>`).join('')}
    </div></div></div>

    <div class="card mt12"><div class="card__pad app-about">
      <span class="app-about__ic">${icon('info',20)}</span>
      <div class="app-about__txt">
        <div class="app-about__name">COLLEY Connect</div>
        <div class="muted app-about__sub">v1.0 · Ground–Air Herding Control</div>
      </div>
    </div></div>`;
  $$('.menu-row[data-sub]', el).forEach(b => b.addEventListener('click', () => {
    const map = { livestock: '가축 건강', grassland: '초원 관리', security: '보안 순찰', product: 'COLLEY 제품' };
    pushSub(b.dataset.sub, map[b.dataset.sub]);
  }));
}

/* ============================================================
 * 5) 서브 화면: 가축 / 초원 / 보안 / 제품
 * ============================================================ */
let stockFilter = 'All';
function renderLivestock(el) {
  const healthy = LIVESTOCK.filter(s => s.risk === 'Healthy').length;
  const attention = LIVESTOCK.filter(s => s.risk === 'Attention').length;
  const critical = LIVESTOCK.filter(s => s.risk === 'Critical').length;
  el.innerHTML = `
    <div class="card"><div class="card__pad">
      <div class="card__title" style="margin-bottom:12px">건강 요약</div>
      <div class="donut-wrap">
        ${donutSVG([[healthy, '#0A6E8F'], [attention, '#d98f24'], [critical, '#cc4438']])}
        <div class="donut-legend">
          <div class="dl"><span class="sw" style="background:#0A6E8F"></span>Healthy <b>${healthy}</b></div>
          <div class="dl"><span class="sw" style="background:#d98f24"></span>Attention <b>${attention}</b></div>
          <div class="dl"><span class="sw" style="background:#cc4438"></span>Critical <b>${critical}</b></div>
        </div>
      </div>
    </div></div>
    <div class="chips mt12" id="stockFilters"></div>
    <div id="stockList"></div>`;
  const fb = $('#stockFilters', el);
  ['All', 'Healthy', 'Attention', 'Critical'].forEach(f => { const c = h(`<button class="chip ${stockFilter === f ? 'is-active' : ''}">${f}</button>`); c.addEventListener('click', () => { stockFilter = f; renderLivestock(el); }); fb.appendChild(c); });
  const list = $('#stockList', el);
  LIVESTOCK.filter(s => stockFilter === 'All' ? true : s.risk === stockFilter).forEach(s => {
    const rc = s.risk.toLowerCase() === 'healthy' ? 'green' : s.risk.toLowerCase() === 'attention' ? 'amber' : 'red';
    const card = h(`<div class="card"><div class="list-card">
      <div class="list-card__head">${icon('sheep',18)}<span class="list-card__title">${s.id}</span><span class="pill ${rc}" style="margin-left:auto">${s.risk}</span></div>
      <div class="kv"><span class="k">구역</span><span class="vv">Zone ${s.zone}</span>
        <span class="k">체온</span><span class="vv">${s.temp}°C</span>
        <span class="k">활동량</span><span class="vv">${s.activity}</span>
        <span class="k">보행</span><span class="vv">${s.gait}</span></div>
      <div class="list-actions">
        <button class="btn btn--sm" data-a="locate">${icon('location',14)} 위치</button>
        <button class="btn btn--sm" data-a="send">${icon('send',14)} COLLEY 출동</button>
        <button class="btn btn--sm" data-a="detail">${icon('eye',14)} 상세</button>
      </div></div></div>`);
    card.querySelector('[data-a="locate"]').addEventListener('click', () => locateSheep(s.id));
    card.querySelector('[data-a="send"]').addEventListener('click', () => sendColleyTo(s));
    card.querySelector('[data-a="detail"]').addEventListener('click', () => openModal(s.id, livestockDetailHTML(s)));
    list.appendChild(card);
  });
}
function locateSheep(id) { APP.highlightStrayId = id; APP.selectedFlockId = null; setTab('home'); toast(`${id} 개체를 지도에 강조합니다.`); }
function sendColleyTo(s) {
  COLLEY.mission = 'Health Inspection'; COLLEY.speed = 1.8; COLLEY.motor = 'active'; COLLEY.location = 'Zone ' + s.zone;
  addAlert('Warning', 'COLLEY 출동', `COLLEY-01이 ${s.id || '대상'} 위치로 이동합니다.`);
  toast('COLLEY를 출동시킵니다.');
  let n = 0; const t = setInterval(() => { n++; if (s.x) { COLLEY.x += (s.x - COLLEY.x) * 0.2; COLLEY.y += (s.y - COLLEY.y) * 0.2; } refreshMap(); if (n >= 10) { clearInterval(t); COLLEY.mission = 'Idle'; COLLEY.speed = 0; COLLEY.motor = 'online'; } }, REDUCED_MOTION ? 60 : 240);
}
function livestockDetailHTML(s) {
  const act = [3,4,3,2,2,3,5,7,8,6,5,6,7,5,4,6,8,7,5,4,3,4,3,2].map(v => s.risk === 'Critical' ? Math.max(1, v - 2) : v);
  const temps = [38.9,39,39.1,39,39.2,39.4,39.6,39.8, s.temp, s.temp+0.1, s.temp, s.temp-0.2,39.5,39.4,39.3,39.2,39.1,39,39.1,39.2,39.3,39.2,39.1,39];
  const rc = s.risk.toLowerCase() === 'healthy' ? 'green' : s.risk.toLowerCase() === 'attention' ? 'amber' : 'red';
  return `<div style="display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-size:16px;font-weight:800">${s.id}</div><div class="muted" style="font-size:12px">Zone ${s.zone} · ${s.lastSeen}</div></div>
      <span class="pill ${rc}">${s.risk}</span></div>
    <div class="kv mt12"><span class="k">체온</span><span class="vv">${s.temp}°C</span>
      <span class="k">활동량</span><span class="vv">${s.activity}</span>
      <span class="k">보행 패턴</span><span class="vv">${s.gait}</span></div>
    <div class="graph-box mt12"><h4>최근 24시간 활동량</h4>${barGraphSimple(act)}</div>
    <div class="graph-box mt12"><h4>체온 변화 (°C)</h4>${lineGraphRange(temps, 38.5, 41)}</div>
    <div class="list-actions mt12"><button class="btn btn--sm btn--primary" data-close="1" onclick="COLLEY_locate('${s.id}')">${icon('location',14)} 위치 보기</button></div>`;
}
function barGraphSimple(data) {
  const max = Math.max(...data), w = 320, hh = 80, bw = w / data.length;
  return `<svg viewBox="0 0 ${w} ${hh}" width="100%">${data.map((v, i) => { const bh = (v / max) * (hh - 8); return `<rect x="${i * bw + 1}" y="${hh - bh}" width="${bw - 2}" height="${bh}" rx="1.5" fill="#0A6E8F" opacity="${0.45 + (v / max) * 0.5}"/>`; }).join('')}</svg>`;
}
function lineGraphRange(data, min, max) {
  const w = 320, hh = 80, step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${hh - ((v - min) / (max - min)) * (hh - 10) - 5}`);
  return `<svg viewBox="0 0 ${w} ${hh}" width="100%"><path d="M0,${hh} L${pts.join(' L')} L${w},${hh} Z" fill="#0A6E8F" opacity="0.10"/><path d="M${pts.join(' L')}" fill="none" stroke="#0A6E8F" stroke-width="2"/></svg>`;
}

function renderGrassland(el) {
  const meta = { healthy: ['#4a9a3f', 'Healthy'], available: ['#8cc23a', 'Available'], overgrazed: ['#b0763a', 'Overgrazed'], recovery: ['#c9b046', 'Recovery Needed'], restricted: ['#9aa094', 'Restricted'] };
  el.innerHTML = `
    <div class="ai-tip"><span class="ic">${icon('ai',20)}</span><div>
      <div class="t">AI 추천</div>
      <div class="d">현재 Zone A의 목초 밀도가 34%까지 감소하고 있습니다. Flock A를 Zone C로 이동하면 약 12일간 안정적인 방목이 가능합니다.</div></div></div>

    <div class="card"><div class="card__pad">
      <div class="card__title" style="margin-bottom:10px">Heatmap</div>
      <div class="home-map" id="grassMap" style="height:200px"></div>
    </div></div>

    <div class="card mt12"><div class="card__pad">
      <div class="card__title" style="margin-bottom:12px">회복 Before / After</div>
      ${beforeAfterSVG()}
      <div class="muted mt12" style="font-size:12px">회복 작업 시 약 14일 후 Zone A 밀도가 34% → 82%로 회복될 것으로 예측됩니다.</div>
    </div></div>

    <div id="grassCards" class="mt12"></div>`;
  const gm = $('#grassMap', el); gm.appendChild(buildMapSVG({ interactive: false, scan: false, pins: false }));
  const cards = $('#grassCards', el);
  GRASSLAND.forEach(g => {
    const [col, label] = meta[g.status];
    const card = h(`<div class="card"><div class="card__pad grass-card">
      <span class="gc-status" style="background:${col}22;color:${col}">${icon(g.status === 'overgrazed' ? 'alert' : g.status === 'recovery' ? 'clock' : 'grass', 12)} ${label}</span>
      <div style="font-size:15px;font-weight:800;margin-top:6px">Zone ${g.zone} · 밀도 ${g.density}%</div>
      <div class="gc-bar"><span style="width:${g.density}%;background:${col}"></span></div>
      <div class="kv"><span class="k">방목 압력</span><span class="vv">${g.pressure}</span>
        <span class="k">회복 시간</span><span class="vv">${g.recovery}</span>
        <span class="k">현재 두수</span><span class="vv">${g.sheep}</span>
        <span class="k">권장 두수</span><span class="vv">${g.capacity}</span>
        <span class="k">씨앗 살포</span><span class="vv">${g.seed ? '필요' : '불필요'}</span>
        <span class="k">비료</span><span class="vv">${g.fertilizer ? '필요' : '불필요'}</span></div>
      <div class="list-actions">
        <button class="btn btn--sm" data-a="move">${icon('route',14)} 이동</button>
        <button class="btn btn--sm" data-a="recover">${icon('seed',14)} 회복</button>
        <button class="btn btn--sm" data-a="inspect">${icon('clock',14)} 점검</button>
      </div></div></div>`);
    card.querySelector('[data-a="move"]').addEventListener('click', () => { setTab('home'); toast(`Zone ${g.zone} 양 무리 이동을 설정하세요.`); });
    card.querySelector('[data-a="recover"]').addEventListener('click', () => { addAlert('Information', '초원 회복 시작', `Zone ${g.zone} 회복 작업을 예약했습니다.`); toast('회복 작업을 예약했습니다.'); });
    card.querySelector('[data-a="inspect"]').addEventListener('click', () => { addAlert('Information', '점검 예약', `Zone ${g.zone} 점검 일정을 등록했습니다.`); toast('점검을 예약했습니다.'); });
    cards.appendChild(card);
  });
}
function beforeAfterSVG() {
  const box = (density, label, col) => `<div class="ba-box"><div class="lbl">${label}</div>
    <svg viewBox="0 0 120 84" width="100%"><rect width="120" height="84" rx="8" fill="#eef1ea"/><rect width="120" height="84" rx="8" fill="${col}" opacity="${density / 130}"/>
    ${Array.from({ length: Math.round(density / 9) }, (_, i) => `<path d="M${12 + i * 9} 74 q0 -${10 + (i % 3) * 4} 0 -${12 + (i % 3) * 4}" stroke="${col}" stroke-width="2" fill="none"/>`).join('')}
    <text x="60" y="46" text-anchor="middle" font-size="19" font-weight="800" fill="#1c2126">${density}%</text></svg></div>`;
  return `<div class="before-after">${box(34, 'Before · Zone A', '#b0763a')}<div class="ba-arrow">${icon('arrowR',20)}</div>${box(82, 'After 회복', '#4a9a3f')}</div>`;
}

function renderSecurity(el) {
  el.innerHTML = `
    <div class="threat-banner ${THREATS.some(t => t.active) ? 'on' : ''}" id="threatBanner">${icon('alert',22)}
      <div><div class="tt">PREDATOR DETECTED</div><div class="td" id="threatDesc">North-East Field · 무리까지 180m · 위협 수준 Critical</div></div></div>

    <div class="card"><div class="card__pad">
      <div class="card__row" style="margin-bottom:10px"><span class="card__title">열화상 순찰 뷰</span><span class="muted" style="margin-left:auto;font-size:11px">야간 시뮬레이션</span></div>
      <div class="thermal-wrap"><canvas id="thermalCanvas" width="720" height="440"></canvas></div>
    </div></div>

    <div class="card mt12"><div class="card__pad">
      <div class="card__title" style="margin-bottom:10px">대응 조치</div>
      <div class="quickmenu" style="margin:0">
        <button class="qm red" id="secGather"><span class="ic">${icon('gather',18)}</span><span>긴급집결</span></button>
        <button class="qm" id="secColley"><span class="ic">${icon('robot',18)}</span><span>COLLEY</span></button>
        <button class="qm blue" id="secDrone"><span class="ic">${icon('drone',18)}</span><span>드론출동</span></button>
        <button class="qm green" id="secTrack"><span class="ic">${icon('route',18)}</span><span>추적</span></button>
      </div>
      <div class="mc-controls mt12">
        <button class="btn btn--sm btn--ghost" id="secDismiss">${icon('x',14)} 경보 해제</button>
        <button class="btn btn--sm" id="secSim">${icon('alert',14)} 포식자 감지 시뮬</button>
      </div>
    </div></div>`;
  drawThermal();
  $('#secGather', el).addEventListener('click', emergencyGather);
  $('#secColley', el).addEventListener('click', () => { const t = THREATS[0]; sendColleyTo({ x: t.x - 60, y: t.y }); });
  $('#secDrone', el).addEventListener('click', () => { launchDrone(); DRONE.scanMode = 'Predator Track'; });
  $('#secTrack', el).addEventListener('click', () => { launchDrone(); DRONE.scanMode = 'Predator Track'; addAlert('Warning', '포식자 추적', '드론이 포식자를 추적합니다.'); toast('드론이 추적을 시작합니다.'); });
  $('#secDismiss', el).addEventListener('click', () => { THREATS[0].active = false; setSystemAlert('Normal'); addAlert('Information', '경보 해제', '포식자 경보를 해제했습니다.'); renderSecurity(el); });
  $('#secSim', el).addEventListener('click', () => { THREATS[0].active = true; setSystemAlert('Critical'); addAlert('Critical', 'Predator detected', 'North-East Field에서 포식자가 감지되었습니다. 위협 수준 Critical'); renderSecurity(el); });
}
function drawThermal() {
  const cv = $('#thermalCanvas'); if (!cv) return;
  const ctx = cv.getContext('2d'); const W = cv.width, H = cv.height;
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0b1420'); bg.addColorStop(1, '#101a12');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(80,120,90,0.25)'; ctx.lineWidth = 1;
  for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.ellipse(W * 0.4, H * 0.6, i * 60, i * 34, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(90,150,200,0.5)'; ctx.setLineDash([6, 4]); ctx.strokeRect(W * 0.72, H * 0.08, W * 0.2, H * 0.22); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(120,180,220,0.8)'; ctx.font = '12px sans-serif'; ctx.fillText('Safe Zone', W * 0.73, H * 0.06);
  const mx = x => (x / 1000) * W, my = y => (y / 700) * H;
  FLOCKS.forEach(f => { for (let i = 0; i < 6; i++) heatBlob(ctx, mx(f.x) + (i % 3) * 9 - 9, my(f.y) + Math.floor(i / 3) * 9 - 4, 15, ['#f4d35e', '#f28f3b']); });
  heatBlob(ctx, mx(COLLEY.x), my(COLLEY.y), 17, ['#7fd0e0', '#4f9fc0']);
  ctx.fillStyle = '#cfe8ef'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('COLLEY', mx(COLLEY.x) - 18, my(COLLEY.y) + 28);
  if (DRONE.docking === 'Undocked') heatBlob(ctx, mx(DRONE.x), my(DRONE.y), 11, ['#a0d8ff', '#5fa0d0']);
  const t = THREATS[0];
  if (t.active) {
    heatBlob(ctx, mx(t.x), my(t.y), 20, ['#ff5a4d', '#c2453f']);
    ctx.strokeStyle = 'rgba(255,90,77,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(mx(t.x), my(t.y), 55, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ff8a80'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('PREDATOR', mx(t.x) - 30, my(t.y) - 28);
    if (DRONE.docking === 'Undocked') { ctx.strokeStyle = 'rgba(160,216,255,0.6)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(mx(DRONE.x), my(DRONE.y)); ctx.lineTo(mx(t.x), my(t.y)); ctx.stroke(); ctx.setLineDash([]); }
  }
}
function heatBlob(ctx, x, y, r, cols) { const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, cols[0]); g.addColorStop(0.5, cols[1]); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }

function renderProduct(el) {
  const specs = [
    ['Battery', COLLEY.battery + '%'], ['Current Mission', COLLEY.mission],
    ['Speed', COLLEY.speed.toFixed(1) + ' m/s'], ['Motor', cap(COLLEY.motor)],
    ['Camera', cap(COLLEY.camera)], ['Sensor', 'LiDAR ' + cap(COLLEY.lidar)], ['Drone', COLLEY.droneStatus]
  ];
  el.innerHTML = `
    <div class="card"><div class="card__pad">
      <div class="colley-render-slot">
        <span class="state-tag">${icon('drone',13)} ${COLLEY.droneStatus}</span>
        ${colleyImg(COLLEY.droneStatus)}
      </div>
      <div class="spec-list mt12">
        <div class="spec-row"><span class="k">Robot ID</span><span class="v">${COLLEY.id}</span></div>
        ${specs.map(([k, v]) => `<div class="spec-row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}
      </div>
    </div></div>

    <div class="card mt12"><div class="card__pad">
      <div class="card__title" style="margin-bottom:10px">탈부착 드론 도킹 시퀀스</div>
      <div class="dock" id="pDock"></div>
      <div class="muted mt12" style="font-size:12px" id="pDockDesc"></div>
    </div></div>

    <div class="card mt12"><div class="card__pad">
      <div class="card__title" style="margin-bottom:8px">제품 특징</div>
      <div class="muted" style="font-size:12.5px;line-height:1.7">
        · 보더콜리 구조를 연상시키는 4족 자율주행 로봇<br>
        · 몸체 상단 탈부착형 AI 드론 도킹 베이<br>
        · 얼굴부 카메라·LiDAR·열화상 센서 통합<br>
        · 드론이 관찰하고, AI가 판단하며, COLLEY가 실행</div>
    </div></div>`;
  renderDockStages($('#pDock', el), $('#pDockDesc', el));
}

/* ============================================================
 * COLLEY 제품 비주얼 — 실제 렌더 이미지 우선, 없으면 SVG 실루엣 자동 대체
 * -----------------------------------------------------------------------------
 * 아래 파일을 assets/images/ 에 저장하면 실제 사진이 자동 표시됩니다.
 *   assets/images/colley-render.png        (기본 · 도킹/대기/충전 상태)
 *   assets/images/colley-drone-flight.png  (드론 비행/이륙/복귀 상태)
 *   assets/images/colley-drone-docked.png  (도킹 클로즈업 · 선택)
 * 파일이 없으면 onerror 로 SVG 실루엣(colleyRobotSVG)으로 교체됩니다.
 * ============================================================ */
// COLLEY 기기 단독 실사 (흰 배경 스튜디오 컷). 없으면 SVG 실루엣으로 대체
function colleyImg(droneState, small) {
  return `<img class="colley-render-img" src="assets/images/colley-device.jpg" alt="COLLEY 로봇"
    onerror="this.onerror=null;this.outerHTML=window.colleyRobotSVG('${droneState}',${small ? 'true' : 'false'});">`;
}
// 드론 기기 단독 실사. 없으면 SVG 드론으로 대체
function droneImg() {
  return `<img class="drone-render-img" src="assets/images/drone-device.jpg" alt="탈부착 드론"
    onerror="this.onerror=null;this.outerHTML=window.droneBigSVG();">`;
}

/* ============================================================
 * COLLEY 로봇 SVG (실루엣) — 실제 이미지가 없을 때의 대체 그래픽
 * ============================================================ */
function colleyRobotSVG(droneState, small) {
  // 측면 실루엣 플랫 일러스트 — 실제 COLLEY 제품(흰 몸체·검은 관절 다리·파란 C 눈·등 위 드론) 기반
  const flying = (droneState === 'In Flight' || droneState === 'Launching' || droneState === 'Returning');
  const dy = droneState === 'Launching' ? -12 : flying ? -34 : droneState === 'Returning' ? -18 : 0;
  const cls = small ? 'colley-svg-sm' : 'colley-svg';
  const propOp = flying ? 0.45 : 0.9;
  return `<svg viewBox="0 0 240 180" class="${cls}" role="img" aria-label="COLLEY 로봇 (드론 ${droneState})">
    <!-- 그림자 -->
    <ellipse cx="122" cy="166" rx="86" ry="9" fill="#000" opacity="0.07"/>

    <!-- 뒤쪽 다리 (원경, 회색) -->
    <g stroke="#aeb4bb" stroke-width="7" stroke-linecap="round" fill="none">
      <path d="M96 106 L88 128 L96 148"/>
      <path d="M168 106 L176 128 L168 148"/>
    </g>
    <circle cx="96" cy="150" r="6" fill="#7b828a"/>
    <circle cx="168" cy="150" r="6" fill="#7b828a"/>

    <!-- 탈부착 드론 (등 위) -->
    <g transform="translate(0 ${dy})">
      ${flying ? '<ellipse cx="150" cy="122" rx="46" ry="7" fill="#3f78c4" opacity="0.12"/>' : ''}
      <line x1="122" y1="62" x2="104" y2="55" stroke="#1c2126" stroke-width="3" stroke-linecap="round"/>
      <line x1="180" y1="62" x2="198" y2="55" stroke="#1c2126" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="102" cy="54" rx="17" ry="3" fill="#1c2126" opacity="${propOp}"/>
      <ellipse cx="200" cy="54" rx="17" ry="3" fill="#1c2126" opacity="${propOp}"/>
      <circle cx="104" cy="55" r="3.5" fill="#2f363d"/><circle cx="198" cy="55" r="3.5" fill="#2f363d"/>
      <rect x="120" y="56" width="64" height="13" rx="5" fill="#23282e"/>
      <rect x="133" y="52" width="38" height="7" rx="3.5" fill="#333b42"/>
      <circle cx="152" cy="63" r="2.6" fill="#39bdf8" opacity="0.8"/>
    </g>

    <!-- 몸통 -->
    <path d="M82 78 q0 -14 18 -14 l66 0 q18 0 18 18 l0 20 q0 16 -18 16 l-66 0 q-18 0 -18 -18 z" fill="#eef0f2"/>
    <path d="M82 80 q0 -16 18 -16 l66 0 q18 0 18 18 l0 4 l-102 0 z" fill="#fbfcfd"/>
    <path d="M82 98 l102 0 l0 4 q0 16 -18 16 l-66 0 q-18 0 -18 -18 z" fill="#d9dde2"/>
    <rect x="120" y="90" width="30" height="8" rx="3" fill="#c4c9cf"/>
    ${small ? '' : '<text x="118" y="86" font-size="11" font-weight="800" fill="#1c2126" letter-spacing="0.5">COLLEY</text>'}

    <!-- 힙 관절 -->
    <circle cx="104" cy="100" r="16" fill="#cdd2d8"/><circle cx="104" cy="100" r="8" fill="#2f363d"/>
    <circle cx="162" cy="100" r="16" fill="#cdd2d8"/><circle cx="162" cy="100" r="8" fill="#2f363d"/>

    <!-- 앞쪽 다리 (근경, 블랙) -->
    <g stroke="#1c2126" stroke-width="8" stroke-linecap="round" fill="none">
      <path d="M104 104 L96 130 L104 152"/>
      <path d="M162 104 L170 130 L162 152"/>
    </g>
    <circle cx="104" cy="154" r="7" fill="#1c2126"/>
    <circle cx="162" cy="154" r="7" fill="#1c2126"/>

    <!-- 목 관절 -->
    <rect x="70" y="82" width="18" height="18" rx="6" fill="#2f363d" transform="rotate(-12 79 91)"/>

    <!-- 머리 -->
    <g>
      <!-- 헬멧 돔 (흰색) -->
      <path d="M26 62 q0 -24 30 -24 q26 0 30 20 l0 8 q0 5 -6 5 l-48 0 q-6 0 -6 -6 z" fill="#eef0f2"/>
      <path d="M26 60 q2 -22 30 -22 q18 0 26 12 l-56 0 z" fill="#fbfcfd"/>
      <rect x="60" y="42" width="14" height="6" rx="3" fill="#c4c9cf"/>
      <!-- 바이저(얼굴, 다크) -->
      <path d="M24 66 q0 -4 6 -4 l48 0 q6 0 6 6 l0 20 q0 8 -9 8 l-42 0 q-9 0 -9 -8 z" fill="#14181c"/>
      <!-- 파란 C자 눈 -->
      <path d="M52 74 a10 10 0 1 0 0 16" fill="none" stroke="#39bdf8" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="40" cy="82" r="4" fill="#39bdf8" opacity="0.55"/>
      <!-- 측면 센서 -->
      <rect x="68" y="70" width="9" height="7" rx="2" fill="#2b3138"/>
    </g>
  </svg>`;
}
function droneBigSVG() {
  return `<svg viewBox="0 0 200 150" role="img" aria-label="드론">
    <ellipse cx="100" cy="132" rx="60" ry="8" fill="#000" opacity="0.06"/>
    <rect x="70" y="66" width="60" height="24" rx="9" fill="#3f78c4"/>
    <rect x="82" y="60" width="36" height="10" rx="5" fill="#345d84"/>
    <circle cx="60" cy="70" r="12" fill="#1c2126"/><circle cx="60" cy="70" r="17" fill="none" stroke="#3f78c4" stroke-width="2" opacity=".5"/>
    <circle cx="140" cy="70" r="12" fill="#1c2126"/><circle cx="140" cy="70" r="17" fill="none" stroke="#3f78c4" stroke-width="2" opacity=".5"/>
    <path d="M60 82 L74 92 M140 82 L126 92" stroke="#345d84" stroke-width="4" stroke-linecap="round"/>
    <circle cx="100" cy="86" r="6" fill="#23a24d"/></svg>`;
}
// SVG 실루엣을 전역에 등록 (실제 이미지 로드 실패 시 대체)
window.colleyRobotSVG = colleyRobotSVG;
window.droneBigSVG = droneBigSVG;

/* ============================================================
 * COLLEY 실행 장면 (홈 히어로) — 실제 실행 사진 우선, 없으면 목초지 SVG
 * 실제 사진 저장: assets/images/colley-action.jpg
 * ============================================================ */
function colleyActionScene() {
  const running = APP.herding.active;
  return `<div class="hero">
    <video class="hero__img" autoplay muted loop playsinline preload="auto"
      poster="assets/images/colley-render.png"
      onerror="this.onerror=null;this.outerHTML=window.colleyActionSVG();">
      <source src="assets/images/hero.mp4" type="video/mp4">
    </video>
    <span class="hero__badge"><span class="dot"></span>${running ? 'MISSION ACTIVE' : 'LIVE'}</span>
    <div class="hero__overlay">
      <div class="hero__eyebrow">COLLEY Ground–Air Herding</div>
      <div class="hero__title">Drone observes<br><span class="accent">AI decides</span><br>COLLEY acts</div>
      <div class="hero__status"><span class="dot"></span>${running ? 'Mission Running' : 'System Online'}</div>
    </div>
  </div>`;
}
// 목초지 실행 장면 SVG (무드보드 톤)
function colleyActionSVG() {
  // 양 무리 클러스터 (오른쪽) — 결정적 배치
  let sheep = '';
  for (let i = 0; i < 15; i++) {
    const sx = 210 + ((i * 43) % 160) + (i % 2) * 8;
    const sy = 118 + ((i * 29) % 40);
    sheep += `<g transform="translate(${sx} ${sy})">
      <ellipse cx="0" cy="0" rx="11" ry="8" fill="#f3f1ea"/>
      <ellipse cx="0" cy="-3" rx="9" ry="6" fill="#fbfaf5"/>
      <circle cx="-9" cy="1" r="3.4" fill="#cdbfae"/></g>`;
  }
  // 들꽃 (전경)
  let flowers = '';
  for (let i = 0; i < 22; i++) {
    const fx = (i * 71) % 400, fy = 150 + ((i * 37) % 28);
    flowers += `<circle cx="${fx}" cy="${fy}" r="1.8" fill="#e3c53c" opacity="0.8"/>`;
  }
  return `<svg class="hero__svg" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label="COLLEY 양몰이 실행 장면">
    <defs>
      <linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe1e5"/><stop offset="1" stop-color="#e9f0e6"/></linearGradient>
      <linearGradient id="hGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5c8a3c"/><stop offset="1" stop-color="#3d672a"/></linearGradient>
    </defs>
    <rect width="400" height="180" fill="url(#hSky)"/>
    <path d="M0 72 Q90 48 190 64 T400 58 V120 H0 Z" fill="#89ac6c"/>
    <path d="M0 86 Q120 64 240 80 T400 76 V130 H0 Z" fill="#6d9550"/>
    <rect y="94" width="400" height="86" fill="url(#hGrass)"/>
    <!-- 돌담 -->
    <g opacity="0.92"><rect x="0" y="88" width="400" height="9" fill="#b7ad98"/>
      ${Array.from({ length: 26 }, (_, i) => `<rect x="${i * 16}" y="88" width="14" height="9" fill="${i % 2 ? '#aaa088' : '#c2b9a5'}"/>`).join('')}
    </g>
    <!-- 드론 + 스캔빔 -->
    <g transform="translate(302 32)">
      <polygon points="0,6 -20,58 20,58" fill="#ffffff" opacity="0.18"/>
      <line x1="-16" y1="0" x2="16" y2="0" stroke="#1c2126" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="-16" cy="-1" rx="9" ry="2" fill="#1c2126" opacity="0.5"/>
      <ellipse cx="16" cy="-1" rx="9" ry="2" fill="#1c2126" opacity="0.5"/>
      <rect x="-11" y="-2" width="22" height="7" rx="3" fill="#23282e"/>
      <circle cx="0" cy="2" r="1.6" fill="#39bdf8"/>
    </g>
    <!-- 양 무리 -->
    ${sheep}
    <!-- 먼지 -->
    <ellipse cx="118" cy="150" rx="42" ry="8" fill="#d8cbae" opacity="0.35"/>
    <!-- COLLEY 로봇 (측면, 우향) -->
    <g transform="translate(60 96)">
      <ellipse cx="45" cy="48" rx="34" ry="5" fill="#000" opacity="0.13"/>
      <path d="M24 22 L18 42" stroke="#9aa094" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M64 22 L70 42" stroke="#9aa094" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="14" y="6" width="60" height="22" rx="11" fill="#eef0f2"/>
      <rect x="16" y="6" width="58" height="8" rx="7" fill="#fbfcfd"/>
      <circle cx="26" cy="20" r="7" fill="#cdd2d8"/><circle cx="62" cy="20" r="7" fill="#cdd2d8"/>
      <path d="M26 22 L20 43" stroke="#1c2126" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M62 22 L68 43" stroke="#1c2126" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <circle cx="20" cy="44" r="3" fill="#1c2126"/><circle cx="68" cy="44" r="3" fill="#1c2126"/>
      <rect x="70" y="6" width="16" height="14" rx="5" fill="#14181c"/>
      <path d="M76 2 q10 -6 16 3 l0 11 q0 4 -5 4 l-9 0 q-4 0 -4 -5 z" fill="#eef0f2"/>
      <path d="M76 9 l16 0 l0 9 q0 3 -4 3 l-8 0 q-4 0 -4 -4 z" fill="#14181c"/>
      <path d="M86 11 a4 4 0 1 0 0 8" fill="none" stroke="#39bdf8" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    ${flowers}
  </svg>`;
}
window.colleyActionSVG = colleyActionSVG;

/* ============================================================
 * 6) 양몰이 임무 흐름 + 드론 제어 + 긴급대응
 * ============================================================ */
function startHerding() {
  if (!APP.selectedFlockId || !APP.targetZoneId) { toast('양 무리와 목표 구역을 먼저 선택하세요.'); return; }
  FLOCKS.find(f => f.id === APP.selectedFlockId).destination = APP.targetZoneId;
  const m = MISSIONS.find(m => m.id === SYSTEM.currentMissionId) || MISSIONS[0];
  m.type = 'Herd Sheep'; m.target = `Flock ${APP.selectedFlockId} → Zone ${APP.targetZoneId}`; m.status = 'Active'; m.progress = 0;
  SYSTEM.currentMissionId = m.id;
  APP.herding = { active: true, phaseIndex: 0, progress: 0, timer: null };
  COLLEY.mission = 'Herding'; COLLEY.speed = 1.4; COLLEY.motor = 'active';
  DEVICES[0].run = '운행중'; DEVICES[0].note = '양몰이 임무 수행중';
  addAlert('Information', '양몰이 임무 시작', `Flock ${APP.selectedFlockId}를 Zone ${APP.targetZoneId}로 유도합니다.`);
  if (DRONE.docking === 'Docked') launchDrone(true);
  setTab('worklog');
  runHerdingLoop();
}
function runHerdingLoop() {
  clearInterval(APP.herding.timer);
  const fl = FLOCKS.find(f => f.id === APP.selectedFlockId);
  const tz = RANCH.zones.find(z => z.id === APP.targetZoneId);
  const tx = tz.x + tz.w / 2, ty = tz.y + tz.h / 2;
  APP.herding.timer = setInterval(() => {
    if (!APP.herding.active) return;
    APP.herding.progress = Math.min(100, APP.herding.progress + 2);
    const np = Math.min(3, Math.floor(APP.herding.progress / 25.1));
    if (np !== APP.herding.phaseIndex) { APP.herding.phaseIndex = np; addAlert('Information', `단계: ${HERDING_PHASES[np].name}`, HERDING_PHASES[np].desc); }
    if (fl) { fl.x += (tx - fl.x) * 0.06; fl.y += (ty - fl.y) * 0.06; COLLEY.x += ((fl.x - 40) - COLLEY.x) * 0.08; COLLEY.y += ((fl.y + 30) - COLLEY.y) * 0.08; if (DRONE.docking === 'Undocked') { DRONE.x = fl.x + 20; DRONE.y = fl.y - 20; } }
    const m = MISSIONS.find(m => m.id === SYSTEM.currentMissionId); if (m) m.progress = APP.herding.progress;
    syncMission();
    if (APP.herding.progress >= 100) completeHerding();
  }, 500);
}
function completeHerding() {
  clearInterval(APP.herding.timer); APP.herding.active = false;
  const fl = FLOCKS.find(f => f.id === APP.selectedFlockId); if (fl) { fl.zone = APP.targetZoneId; fl.destination = null; }
  const m = MISSIONS.find(m => m.id === SYSTEM.currentMissionId); if (m) { m.status = 'Completed'; m.progress = 100; }
  COLLEY.mission = 'Idle'; COLLEY.speed = 0; COLLEY.motor = 'online'; COLLEY.location = 'Zone ' + APP.targetZoneId;
  DEVICES[0].run = '대기'; DEVICES[0].note = '임무 완료 · 대기중';
  WORKLOG.unshift({ date: '2026.07.03', type: 'Herd Sheep', target: `Flock ${APP.selectedFlockId} → Zone ${APP.targetZoneId}`, dur: '32분', area: '4.2 ha', result: '완료' });
  addAlert('Information', '양몰이 임무 완료', `Flock ${APP.selectedFlockId}를 Zone ${APP.targetZoneId}로 이동 완료했습니다.`);
  toast('양몰이 임무가 완료되었습니다.'); returnDrone(); syncMission();
}
function pauseHerding() { if (APP.herding.active) { APP.herding.active = false; COLLEY.speed = 0; toast('일시정지했습니다.'); syncMission(); } }
function resumeHerding() { const m = MISSIONS.find(m => m.id === SYSTEM.currentMissionId); if (m && m.status === 'Active' && APP.herding.phaseIndex >= 0) { APP.herding.active = true; COLLEY.speed = 1.4; toast('임무를 재개합니다.'); syncMission(); } }
function stopHerding() { clearInterval(APP.herding.timer); APP.herding = { active: false, phaseIndex: -1, progress: 0, timer: null }; const m = MISSIONS.find(m => m.id === SYSTEM.currentMissionId); if (m) m.status = 'Completed'; COLLEY.mission = 'Idle'; COLLEY.speed = 0; COLLEY.motor = 'online'; DEVICES[0].run = '대기'; addAlert('Warning', '양몰이 중단', '진행 중이던 임무를 중단했습니다.'); toast('임무를 중단했습니다.'); syncMission(); }

function syncMission() {
  if (APP.tab === 'worklog') { const cm = $('#currentMission'); if (cm) renderCurrentMission(cm); const pg = $('#phaseGrid'); if (pg) renderPhaseGrid(pg); }
  if (APP.tab === 'home') { const fb = $('#flowBox'); if (fb) renderFlow(fb); }
  refreshMap();
}

function launchDrone(silent) {
  if (DRONE.docking === 'Undocked') { if (!silent) toast('드론이 이미 비행 중입니다.'); return; }
  DRONE.status = 'Launching'; COLLEY.droneStatus = 'Launching'; DEVICES[1].run = '운행중'; DEVICES[1].note = '이륙 준비중'; softRefresh();
  setTimeout(() => {
    DRONE.docking = 'Undocked'; DRONE.status = 'In Flight'; DRONE.altitude = 45; DRONE.flightTime = 1; DRONE.scanMode = 'Flock Scan';
    COLLEY.droneStatus = 'In Flight'; DRONE.x = COLLEY.x + 30; DRONE.y = COLLEY.y - 30; DEVICES[1].note = '공중 관찰중';
    if (!silent) addAlert('Information', '드론 이륙', '드론이 이륙해 공중에서 목장을 관찰합니다.');
    softRefresh();
  }, REDUCED_MOTION ? 100 : 900);
}
function returnDrone() {
  if (DRONE.docking === 'Docked') return;
  DRONE.status = 'Returning'; COLLEY.droneStatus = 'Returning'; DEVICES[1].note = '복귀중'; softRefresh();
  setTimeout(() => {
    DRONE.docking = 'Docked'; DRONE.status = 'Charging'; COLLEY.droneStatus = 'Charging'; DRONE.altitude = 0; DRONE.scanMode = 'Standby'; DRONE.x = COLLEY.x; DRONE.y = COLLEY.y;
    DEVICES[1].run = '대기'; DEVICES[1].note = 'COLLEY 상단 도킹 · 충전중';
    addAlert('Information', 'COLLEY 복귀', '드론이 복귀해 도킹 및 충전을 시작합니다.'); softRefresh();
    setTimeout(() => { DRONE.status = 'Docked'; COLLEY.droneStatus = 'Docked'; DEVICES[1].note = 'COLLEY 상단 도킹 · 충전 완료'; softRefresh(); }, REDUCED_MOTION ? 100 : 1500);
  }, REDUCED_MOTION ? 100 : 1200);
}
function emergencyGather() {
  addAlert('Critical', 'Emergency Gather', '모든 양 무리를 안전 구역으로 긴급 집결시킵니다.');
  const sz = RANCH.safeZone, tx = sz.x + sz.w / 2, ty = sz.y + sz.h / 2;
  COLLEY.mission = 'Emergency Gather'; COLLEY.speed = 2.2; COLLEY.motor = 'active'; DEVICES[0].run = '운행중'; DEVICES[0].note = '긴급집결 수행중';
  let n = 0; const t = setInterval(() => { n++; FLOCKS.forEach(f => { f.x += (tx - f.x) * 0.12; f.y += (ty - f.y) * 0.12; }); COLLEY.x += (tx - 60 - COLLEY.x) * 0.14; COLLEY.y += (ty + 40 - COLLEY.y) * 0.14; softRefresh(); if (n >= 14) { clearInterval(t); FLOCKS.forEach(f => f.zone = 'PEN'); COLLEY.mission = 'Idle'; COLLEY.speed = 0; COLLEY.motor = 'online'; DEVICES[0].run = '대기'; DEVICES[0].note = '긴급집결 완료'; addAlert('Information', 'Emergency Gather 완료', '모든 양 무리가 안전 구역에 집결했습니다.'); toast('긴급 집결이 완료되었습니다.'); softRefresh(); } }, REDUCED_MOTION ? 60 : 320);
}

// 현재 탭/서브에 맞춰 가볍게 갱신
function softRefresh() {
  if (APP.sub) { const el = $('#view-sub'); const R = { livestock: renderLivestock, grassland: renderGrassland, security: renderSecurity, product: renderProduct }; if (R[APP.sub.name]) R[APP.sub.name](el); return; }
  if (APP.tab === 'home') { const fb = $('#flowBox'); if (fb) renderFlow(fb); const dl = $('#deviceList'); if (dl) renderDeviceList(dl); refreshMap(); }
  else if (APP.tab === 'worklog') syncMission();
  else if (APP.tab === 'manage') renderManage();
  else if (APP.tab === 'remote') { updateDial(); }
}

/* ============================================================
 * 7) 도넛 차트
 * ============================================================ */
function donutSVG(segments) {
  const total = segments.reduce((s, [v]) => s + v, 0) || 1;
  let acc = 0; const r = 46, c = 2 * Math.PI * r, cx = 62, cy = 62;
  const arcs = segments.map(([v, col]) => { const len = (v / total) * c; const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="16" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 ${cx} ${cy})"/>`; acc += len; return seg; }).join('');
  return `<svg viewBox="0 0 124 124" width="124" height="124"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#eef1ea" stroke-width="16"/>${arcs}<text x="${cx}" y="${cy - 1}" text-anchor="middle" font-size="24" font-weight="800" fill="#1c2126">${total}</text><text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="10" fill="#9aa0a6">Total</text></svg>`;
}

/* ============================================================
 * 8) 알림 / 모달 / 토스트 / 장치 상세
 * ============================================================ */
let alertFilter = 'All';
function addAlert(level, title, desc) {
  const now = new Date();
  const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  ALERTS.unshift({ id: 'AL-' + now.getTime(), level, title, desc, time, read: false });
  updateAlertCount();
  if ($('#alertSheet').classList.contains('on')) renderAlerts();
}
function updateAlertCount() { const n = ALERTS.filter(a => !a.read).length; const c = $('#alertCount'); c.textContent = n; c.style.display = n ? 'flex' : 'none'; }
function renderAlerts() {
  const body = $('#alertList');
  const arr = ALERTS.filter(a => alertFilter === 'All' ? true : alertFilter === 'Unread' ? !a.read : a.level === alertFilter);
  const ai = { Information: 'info', Warning: 'alert', Critical: 'alert' };
  body.innerHTML = arr.map(a => `<div class="alert-item lv-${a.level} ${a.read ? '' : 'unread'}" data-id="${a.id}">
    <div class="ic">${icon(ai[a.level], 17)}</div>
    <div style="flex:1;min-width:0"><div class="title">${a.title}</div><div class="desc">${a.desc}</div><div class="time">${a.level} · ${a.time}</div></div>
  </div>`).join('') || `<div class="empty">해당 조건의 알림이 없습니다.</div>`;
  $$('.alert-item', body).forEach(it => it.addEventListener('click', () => { const a = ALERTS.find(x => x.id === it.dataset.id); if (a) { a.read = true; updateAlertCount(); renderAlerts(); } }));
}
function buildAlertFilters() { const box = $('#alertFilters'); box.innerHTML = ''; ['All', 'Unread', 'Information', 'Warning', 'Critical'].forEach(f => { const c = h(`<button class="chip ${alertFilter === f ? 'is-active' : ''}">${f}</button>`); c.addEventListener('click', () => { alertFilter = f; buildAlertFilters(); renderAlerts(); }); box.appendChild(c); }); }
function openAlerts() { $('#alertSheet').classList.add('on'); $('#alertSheet').setAttribute('aria-hidden', 'false'); $('#sheetOverlay').classList.add('on'); buildAlertFilters(); renderAlerts(); }
function closeAlerts() { $('#alertSheet').classList.remove('on'); $('#alertSheet').setAttribute('aria-hidden', 'true'); $('#sheetOverlay').classList.remove('on'); }

function openModal(title, html) { $('#modalTitle').textContent = title; $('#modalBody').innerHTML = html; $('#modal').classList.add('on'); $('#modal').setAttribute('aria-hidden', 'false'); $('#modalOverlay').classList.add('on'); }
function closeModal() { $('#modal').classList.remove('on'); $('#modal').setAttribute('aria-hidden', 'true'); $('#modalOverlay').classList.remove('on'); }
window.closeModal = closeModal;
window.COLLEY_locate = function (id) { closeModal(); locateSheep(id); };

function flockDetailHTML(f) {
  return `<div style="font-size:16px;font-weight:800">${f.name}</div><div class="muted" style="font-size:12px">${f.count} Sheep</div>
    <div class="kv mt12"><span class="k">건강</span><span class="vv">${f.health}</span>
      <span class="k">현재 구역</span><span class="vv">Zone ${f.zone}</span>
      <span class="k">목적지</span><span class="vv">${f.destination ? 'Zone ' + f.destination : '—'}</span>
      <span class="k">배정 로봇</span><span class="vv">${f.robot || '—'}</span></div>
    <div class="muted mt12" style="font-size:12px">지도에서 목표 방목 구역을 선택한 뒤 원격 화면에서 양몰이를 시작하세요.</div>
    <button class="btn btn--primary btn--block mt12" onclick="closeModal()">확인</button>`;
}
function openDeviceModal(id) {
  const d = DEVICES.find(x => x.id === id);
  if (id === 'COLLEY-01') {
    openModal('COLLEY-01', `<div class="kv"><span class="k">배터리</span><span class="vv">${COLLEY.battery}%</span>
      <span class="k">속도</span><span class="vv">${COLLEY.speed.toFixed(1)} m/s</span>
      <span class="k">현재 임무</span><span class="vv">${COLLEY.mission}</span>
      <span class="k">센서</span><span class="vv">정상</span>
      <span class="k">드론 상태</span><span class="vv">${COLLEY.droneStatus}</span></div>
      <button class="btn btn--primary btn--block mt12" onclick="closeModal();COLLEY_manage('COLLEY-01')">기기관리 열기</button>`);
  } else {
    openModal('DRONE-01', `<div class="kv"><span class="k">배터리</span><span class="vv">${DRONE.battery}%</span>
      <span class="k">고도</span><span class="vv">${DRONE.altitude} m</span>
      <span class="k">비행시간</span><span class="vv">${DRONE.flightTime} min</span>
      <span class="k">카메라</span><span class="vv">${cap(DRONE.camera)}</span>
      <span class="k">스캔 모드</span><span class="vv">${DRONE.scanMode}</span>
      <span class="k">도킹</span><span class="vv">${DRONE.docking}</span></div>
      <button class="btn btn--primary btn--block mt12" onclick="closeModal();COLLEY_manage('DRONE-01')">기기관리 열기</button>`);
  }
}
window.COLLEY_manage = function (id) { APP.manageDevice = id; setTab('manage'); };

let toastTimer = null;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2600); }

function setSystemAlert(level) { SYSTEM.alertLevel = level; }

/* ============================================================
 * 긴급 시뮬레이션
 * ============================================================ */
const SIM_STEPS = ['포식자 감지', 'Critical Alert 표시', '드론 자동 출동', '포식자 위치 추적', 'Emergency Gather 시작', 'COLLEY 무리 뒤쪽 이동', '양 무리 안전구역 집결', '포식자 퇴각', '임무 완료 알림', '정상 상태 복귀'];
function runEmergencySimulation() {
  if (APP.sim.running) { toast('시뮬레이션이 이미 진행 중입니다.'); return; }
  APP.sim.running = true;
  const log = $('#simLog'), steps = $('#simSteps');
  log.classList.add('on');
  steps.innerHTML = SIM_STEPS.map((s, i) => `<div class="sim-step" data-i="${i}"><span class="n">${i + 1}</span><span>${s}</span></div>`).join('');
  const t = THREATS[0], sz = RANCH.safeZone, gx = sz.x + sz.w / 2, gy = sz.y + sz.h / 2;
  let i = 0;
  const setStep = (idx, cls) => { const e = steps.querySelector(`[data-i="${idx}"]`); if (e) e.className = 'sim-step ' + cls; };
  const advance = () => {
    if (i > 0) setStep(i - 1, 'done');
    if (i >= SIM_STEPS.length) { APP.sim.running = false; setTimeout(() => log.classList.remove('on'), 1800); return; }
    setStep(i, 'active'); handleSimStep(i, t, gx, gy); i++;
    setTimeout(advance, REDUCED_MOTION ? 400 : 1600);
  };
  setTab('home'); advance();
}
function handleSimStep(i, t, gx, gy) {
  switch (i) {
    case 0: t.active = true; addAlert('Critical', 'Predator detected', 'North-East Field에서 포식자가 감지되었습니다.'); softRefresh(); break;
    case 1: setSystemAlert('Critical'); break;
    case 2: launchDrone(); break;
    case 3: DRONE.scanMode = 'Predator Track'; DRONE.x = t.x + 40; DRONE.y = t.y - 40; addAlert('Warning', '포식자 추적', '드론이 포식자를 추적합니다.'); softRefresh(); break;
    case 4: COLLEY.mission = 'Emergency Gather'; COLLEY.speed = 2.2; COLLEY.motor = 'active'; DEVICES[0].run = '운행중'; addAlert('Critical', 'Emergency Gather', '긴급 집결을 시작합니다.'); break;
    case 5: { let s = 0; const mv = setInterval(() => { s++; COLLEY.x += (FLOCKS[1].x - 50 - COLLEY.x) * 0.3; COLLEY.y += (FLOCKS[1].y + 40 - COLLEY.y) * 0.3; softRefresh(); if (s >= 6) clearInterval(mv); }, REDUCED_MOTION ? 50 : 200); break; }
    case 6: { let s = 0; const mv = setInterval(() => { s++; FLOCKS.forEach(f => { f.x += (gx - f.x) * 0.16; f.y += (gy - f.y) * 0.16; }); COLLEY.x += (gx - 50 - COLLEY.x) * 0.16; COLLEY.y += (gy + 40 - COLLEY.y) * 0.16; softRefresh(); if (s >= 8) { clearInterval(mv); FLOCKS.forEach(f => f.zone = 'PEN'); } }, REDUCED_MOTION ? 50 : 200); break; }
    case 7: t.active = false; addAlert('Information', '포식자 퇴각', '포식자가 퇴각했습니다.'); softRefresh(); break;
    case 8: COLLEY.mission = 'Idle'; COLLEY.speed = 0; COLLEY.motor = 'online'; DEVICES[0].run = '대기'; addAlert('Information', '긴급 대응 완료', '긴급 대응 임무가 완료되었습니다.'); break;
    case 9: setSystemAlert('Normal'); returnDrone(); softRefresh(); toast('시스템이 정상 상태로 복귀했습니다.'); break;
  }
}

/* ============================================================
 * 초기화
 * ============================================================ */
function init() {
  $('#alertBtnIcon').innerHTML = icon('bell', 22);
  $('#modalCloseIcon').innerHTML = icon('x', 18);
  const si = $('#simIcon'); if (si) si.innerHTML = icon('alert', 13);

  // COLLEY 상단바 브랜드 로고 (사족 로봇 + 도킹 드론 심벌)
  $('#appLogo').innerHTML = `<svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
    <rect x="9" y="6" width="14" height="4" rx="2" fill="#2f80c4"/>
    <circle cx="8.5" cy="8" r="2.2" fill="none" stroke="#2f80c4" stroke-width="1.3"/>
    <circle cx="23.5" cy="8" r="2.2" fill="none" stroke="#2f80c4" stroke-width="1.3"/>
    <rect x="8" y="14" width="16" height="8.5" rx="4" fill="#0A6E8F"/>
    <circle cx="20" cy="18.2" r="1.9" fill="#B8F0FF"/>
    <path d="M9 22.5 l-1.5 4 M23 22.5 l1.5 4 M13 22.8 l-.6 3.6 M19 22.8 l.6 3.6" stroke="#0A6E8F" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;

  buildTabbar();
  updateAlertCount();

  $('#alertBtn').addEventListener('click', openAlerts);
  $('#sheetOverlay').addEventListener('click', closeAlerts);
  $('#modalOverlay').addEventListener('click', closeModal);
  $('#modalClose').addEventListener('click', closeModal);
  $('#markAllRead').addEventListener('click', () => { ALERTS.forEach(a => a.read = true); updateAlertCount(); renderAlerts(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeAlerts(); } });

  renderHome();
  requestAnimationFrame(ambientLoop);
}

/* 은은한 앰비언트 이동 */
let acc = 0;
function ambientLoop() {
  if (!REDUCED_MOTION) {
    acc++;
    if (acc % 90 === 0 && !APP.herding.active && !APP.sim.running) {
      FLOCKS.forEach(f => { f.x += Math.sin(f.count + acc / 90) * 1.1; f.y += Math.cos(f.count + acc / 90) * 0.9; });
      if (APP.tab === 'home') refreshMap();
      else if (APP.sub && APP.sub.name === 'security') drawThermal();
    }
  }
  requestAnimationFrame(ambientLoop);
}

document.addEventListener('DOMContentLoaded', init);
