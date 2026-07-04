/* =============================================================================
 * data.js — COLLEY 관제 시스템 샘플 데이터
 * -----------------------------------------------------------------------------
 * 이 파일은 모든 화면에서 사용하는 "가짜(mock) 데이터"를 한 곳에 모아 둡니다.
 * 추후 실제 API로 교체할 때는 이 객체들을 fetch() 결과로 대체하면 됩니다.
 * (예: COLLEY.state = await fetch('/api/robot').then(r => r.json()))
 *
 * 좌표계: 지도는 SVG viewBox "0 0 1000 700" 기준의 논리 좌표를 사용합니다.
 * =============================================================================
 */

/* -----------------------------------------------------------------------------
 * 1) 목장 지형 정의 — 방목 구역(Zone), 안전 구역, 울타리, 장애물
 * --------------------------------------------------------------------------- */
const RANCH = {
  // 방목 구역: 초원 상태(status)와 대략적 다각형 영역
  zones: [
    { id: 'A', name: 'Zone A', x: 120, y: 110, w: 300, h: 220, status: 'overgrazed' },
    { id: 'B', name: 'Zone B', x: 470, y: 90,  w: 320, h: 200, status: 'available' },
    { id: 'C', name: 'Zone C', x: 560, y: 340, w: 330, h: 260, status: 'healthy' },
    { id: 'D', name: 'Zone D', x: 110, y: 380, w: 330, h: 240, status: 'recovery' }
  ],
  // 안전 구역(축사/집결지)
  safeZone: { id: 'PEN', name: 'Safe Pen', x: 820, y: 40, w: 140, h: 120 },
  // 울타리(경계) — 폴리라인 좌표
  fence: [ [40,40],[960,40],[960,660],[40,660],[40,40] ],
  // 장애물(바위/연못 등)
  obstacles: [
    { id: 'ob1', type: 'pond', x: 470, y: 470, r: 46 },
    { id: 'ob2', type: 'rock', x: 300, y: 250, r: 26 },
    { id: 'ob3', type: 'rock', x: 700, y: 200, r: 22 }
  ]
};

/* -----------------------------------------------------------------------------
 * 2) 양 무리(Flock)
 * --------------------------------------------------------------------------- */
const FLOCKS = [
  {
    id: 'A', name: 'Flock A', count: 58, x: 250, y: 200,
    health: 'Stable', zone: 'A', destination: null, robot: 'COLLEY-01'
  },
  {
    id: 'B', name: 'Flock B', count: 64, x: 610, y: 170,
    health: 'Stable', zone: 'B', destination: 'C', robot: 'COLLEY-01'
  },
  {
    id: 'C', name: 'Flock C', count: 47, x: 260, y: 480,
    health: 'Attention', zone: 'D', destination: null, robot: null
  }
];

/* -----------------------------------------------------------------------------
 * 3) COLLEY 지상 로봇 상태
 * --------------------------------------------------------------------------- */
const COLLEY = {
  id: 'COLLEY-01',
  x: 520, y: 250,
  battery: 82,
  speed: 0.0,            // m/s
  mission: 'Idle',
  motor: 'online',       // online | active | fault
  camera: 'online',
  thermal: 'online',
  lidar: 'online',
  joint: 'online',
  comms: 'online',
  location: 'Zone B',
  lastMaintenance: '2026-06-28',
  droneStatus: 'Docked'  // Docked | Preparing | Launching | In Flight | Returning | Charging
};

/* -----------------------------------------------------------------------------
 * 4) 탈부착형 드론 상태
 * --------------------------------------------------------------------------- */
const DRONE = {
  id: 'DRONE-01',
  x: 520, y: 250,        // 도킹 시 COLLEY와 동일 좌표
  battery: 91,
  altitude: 0,           // m
  flightTime: 0,         // min
  camera: 'online',
  thermalCamera: 'online',
  gps: 'online',
  docking: 'Docked',     // Docked | Undocked
  scanMode: 'Standby',   // Standby | Flock Scan | Terrain Scan | Predator Track
  seedCapacity: 74,      // %
  fertilizerCapacity: 60,// %
  status: 'Docked',      // Docked | Preparing | Launching | In Flight | Returning | Charging
  lastMaintenance: '2026-06-25'
};

/* -----------------------------------------------------------------------------
 * 5) 포식자 / 위험 요소 (초기에는 감지되지 않은 상태)
 * --------------------------------------------------------------------------- */
const THREATS = [
  // active: false = 아직 감지되지 않음. Emergency Simulation / Security 화면에서 활성화됨.
  { id: 'pred1', type: 'predator', label: 'Predator', x: 880, y: 520, active: false, level: 'Critical' }
];

/* -----------------------------------------------------------------------------
 * 6) 초원(Grassland) 구역별 상세 데이터
 * --------------------------------------------------------------------------- */
const GRASSLAND = [
  {
    zone: 'A', status: 'overgrazed', density: 34, pressure: 'High',
    recovery: '14일', sheep: 58, capacity: 40, seed: true, fertilizer: true
  },
  {
    zone: 'B', status: 'available', density: 71, pressure: 'Medium',
    recovery: '0일', sheep: 64, capacity: 90, seed: false, fertilizer: false
  },
  {
    zone: 'C', status: 'healthy', density: 88, pressure: 'Low',
    recovery: '0일', sheep: 0, capacity: 110, seed: false, fertilizer: false
  },
  {
    zone: 'D', status: 'recovery', density: 52, pressure: 'Low',
    recovery: '7일', sheep: 47, capacity: 70, seed: true, fertilizer: false
  }
];

/* -----------------------------------------------------------------------------
 * 7) 가축(개체) 건강 데이터
 * --------------------------------------------------------------------------- */
const LIVESTOCK = [
  { id: 'SHP-014', zone: 'A', temp: 39.1, activity: 'Normal', gait: 'Normal',
    lastSeen: '2분 전', risk: 'Healthy', mission: null, x: 240, y: 190 },
  { id: 'SHP-027', zone: 'A', temp: 40.6, activity: 'Low', gait: 'Limping',
    lastSeen: '5분 전', risk: 'Critical', mission: 'Health Inspection', x: 285, y: 225 },
  { id: 'SHP-041', zone: 'B', temp: 39.4, activity: 'Normal', gait: 'Normal',
    lastSeen: '1분 전', risk: 'Healthy', mission: null, x: 620, y: 160 },
  { id: 'SHP-058', zone: 'D', temp: 40.1, activity: 'Low', gait: 'Uneven',
    lastSeen: '8분 전', risk: 'Attention', mission: null, x: 250, y: 470 },
  { id: 'SHP-063', zone: 'B', temp: 39.2, activity: 'High', gait: 'Normal',
    lastSeen: '3분 전', risk: 'Healthy', mission: null, x: 640, y: 190 },
  { id: 'SHP-072', zone: 'D', temp: 40.9, activity: 'Very Low', gait: 'Limping',
    lastSeen: '12분 전', risk: 'Critical', mission: null, x: 270, y: 500 },
  { id: 'SHP-088', zone: 'A', temp: 39.6, activity: 'Normal', gait: 'Normal',
    lastSeen: '4분 전', risk: 'Attention', mission: null, x: 210, y: 220 }
];

/* -----------------------------------------------------------------------------
 * 8) 임무(Mission) 목록
 * --------------------------------------------------------------------------- */
const MISSIONS = [
  {
    id: 'M-1042', type: 'Herd Sheep', target: 'Flock B → Zone C', robot: 'COLLEY-01',
    drone: 'In Flight', start: '14:20', eta: '14:52', progress: 68,
    risk: 'Low', status: 'Active', phase: 'Drive'
  },
  {
    id: 'M-1039', type: 'Drone Scan', target: 'Zone C Terrain', robot: 'COLLEY-01',
    drone: 'In Flight', start: '14:10', eta: '14:25', progress: 100,
    risk: 'Low', status: 'Completed', phase: null
  },
  {
    id: 'M-1051', type: 'Grassland Recovery', target: 'Zone A', robot: 'COLLEY-01',
    drone: 'Docked', start: '16:00', eta: '17:30', progress: 0,
    risk: 'Low', status: 'Scheduled', phase: null
  },
  {
    id: 'M-1033', type: 'Patrol Mode', target: 'North Fence', robot: 'COLLEY-01',
    drone: 'In Flight', start: '02:00', eta: '04:00', progress: 100,
    risk: 'Medium', status: 'Completed', phase: null
  },
  {
    id: 'M-1055', type: 'Health Inspection', target: 'SHP-027', robot: 'COLLEY-01',
    drone: 'Docked', start: '15:30', eta: '15:45', progress: 0,
    risk: 'Medium', status: 'Scheduled', phase: null
  }
];

/* -----------------------------------------------------------------------------
 * 9) 알림(Alerts)
 * --------------------------------------------------------------------------- */
const ALERTS = [
  { id: 'AL-1', level: 'Information', title: 'Herding mission completed', desc: 'Flock A를 Zone B로 이동 완료했습니다.', time: '13:40', read: false },
  { id: 'AL-2', level: 'Warning', title: 'Drone battery low', desc: '드론 배터리가 22%까지 감소했습니다. 도킹 후 충전이 필요합니다.', time: '14:02', read: false },
  { id: 'AL-3', level: 'Information', title: 'COLLEY returning to dock', desc: 'COLLEY-01이 충전을 위해 안전 구역으로 복귀 중입니다.', time: '14:15', read: true },
  { id: 'AL-4', level: 'Warning', title: 'Flock B separated', desc: 'Flock B의 일부 개체가 무리에서 이탈했습니다.', time: '14:22', read: false },
  { id: 'AL-5', level: 'Warning', title: 'Abnormal sheep detected', desc: 'SHP-027 개체에서 이상 체온과 보행 패턴이 감지되었습니다.', time: '14:28', read: false },
  { id: 'AL-6', level: 'Information', title: 'Grass density reduced', desc: 'Zone A의 목초 밀도가 34%까지 감소했습니다.', time: '14:35', read: true }
];

/* -----------------------------------------------------------------------------
 * 10) 양몰이 단계 정의 (보더콜리 행동 알고리즘)
 * --------------------------------------------------------------------------- */
const HERDING_PHASES = [
  { id: 'sweep', name: 'Sweep', desc: '양 무리 바깥을 넓은 반원으로 이동하며 흩어진 양을 모읍니다.' },
  { id: 'lift',  name: 'Lift',  desc: '무리 뒤쪽에서 일정 거리를 유지하며 접근해 움직임을 시작시킵니다.' },
  { id: 'drive', name: 'Drive', desc: '목표 방향으로 양 무리를 유도합니다.' },
  { id: 'pen',   name: 'Pen',   desc: '좌우 공간을 좁혀 안전 구역이나 축사로 집결시킵니다.' }
];

/* -----------------------------------------------------------------------------
 * 11) 드론 도킹 4단계 정의
 * --------------------------------------------------------------------------- */
const DOCK_STAGES = [
  { id: 'docked', name: 'Docked', desc: '드론이 COLLEY 상단에 결합된 상태' },
  { id: 'launch', name: 'Launch', desc: '드론이 자동 분리되어 이륙하는 상태' },
  { id: 'scan',   name: 'Scan',   desc: '양 무리·초원·포식자·장애물을 공중에서 분석' },
  { id: 'return', name: 'Return', desc: 'COLLEY로 복귀해 자동 도킹 및 충전' }
];

// 드론 상태 → 도킹 단계 매핑 (하이라이트용)
const DRONE_STATUS_TO_STAGE = {
  'Docked': 'docked',
  'Preparing': 'launch',
  'Launching': 'launch',
  'In Flight': 'scan',
  'Returning': 'return',
  'Charging': 'docked'
};

// 전역 시스템 상태 (앱 전체가 참조/변경)
const SYSTEM = {
  alertLevel: 'Normal',   // Normal | Warning | Critical
  currentMissionId: 'M-1042'
};

/* -----------------------------------------------------------------------------
 * 12) 장치 목록 (대동 커넥트 "차량목록" 대응)
 *     COLLEY 지상 로봇 + 탈부착 드론을 하나의 장치 리스트로 관리
 * --------------------------------------------------------------------------- */
const DEVICES = [
  {
    id: 'COLLEY-01', kind: 'robot', name: 'COLLEY-01', model: 'COLLEY GR-1',
    run: '운행중', health: '정상', note: '현재 양몰이 임무 수행중',
    power: '25 ps', capacity: '전기 · 8kWh', pto: 'AI 도킹 베이'
  },
  {
    id: 'DRONE-01', kind: 'drone', name: 'DRONE-01', model: 'COLLEY AD-1',
    run: '대기', health: '정상', note: 'COLLEY 상단 도킹 · 충전 완료',
    power: '—', capacity: '리튬 · 2.4kWh', pto: '열화상 · RGB 카메라'
  }
];

/* -----------------------------------------------------------------------------
 * 13) 원격 제어 텔레메트리 (대동 "원격" 화면 대응)
 *     대동 앱의 평균연비/유온/냉각수온도/배터리전압 → COLLEY 텔레메트리로 대응
 * --------------------------------------------------------------------------- */
const TELEMETRY = {
  rpm: 0,             // 모터 RPM (게이지 좌)
  speed: 0,           // 속도 (게이지 우)
  power: 3.2,         // 평균 소비전력 kWh
  motorTemp: 34,      // 모터 온도 °C
  coolant: 28,        // 냉각 온도 °C
  voltage: 48.2,      // 배터리 전압 V
  running: false      // START 상태
};

// 원격 화면 상단 상태칩 (대동: 운행중/운전자 대기/시동 준비)
const REMOTE_STATES = ['출동가능', '대기중', '준비완료', '운행중'];

/* -----------------------------------------------------------------------------
 * 14) 소모품 상태 (차량관리 > 소모품 탭)
 * --------------------------------------------------------------------------- */
const CONSUMABLES = [
  { name: '구동 배터리 셀', wear: 22, life: '잔여 78%', status: 'ok' },
  { name: '구동 모터', wear: 35, life: '잔여 65%', status: 'ok' },
  { name: '관절 액추에이터', wear: 61, life: '잔여 39%', status: 'warn' },
  { name: '카메라 · 센서 렌즈', wear: 18, life: '잔여 82%', status: 'ok' },
  { name: '주행 트랙 / 타이어', wear: 74, life: '잔여 26%', status: 'warn' },
  { name: '드론 프로펠러', wear: 12, life: '잔여 88%', status: 'ok' }
];

/* -----------------------------------------------------------------------------
 * 15) 사용 통계 (차량관리 > 상세정보 탭 그래프)
 * --------------------------------------------------------------------------- */
const USAGE = {
  month: '2026.06',
  totalTime: '총 62시간 32분',
  worktime: [8, 12, 18, 26, 34, 41, 52, 58, 62, 0, 0, 0], // 누적 작업시간(월별)
  energyTotal: '469 kWh',
  energy: [21, 34, 47, 62, 55, 38, 24, 0, 0, 0, 0, 0]      // 월별 에너지 소모
};

/* -----------------------------------------------------------------------------
 * 16) 작업일지 (작업일지 탭)
 * --------------------------------------------------------------------------- */
const WORKLOG = [
  { date: '2026.07.03', type: 'Herd Sheep', target: 'Flock B → Zone C', dur: '32분', area: '4.2 ha', result: '완료' },
  { date: '2026.07.03', type: 'Drone Scan', target: 'Zone C 지형', dur: '15분', area: '6.0 ha', result: '완료' },
  { date: '2026.07.02', type: 'Patrol Mode', target: 'North Fence', dur: '2시간', area: '전체', result: '완료' },
  { date: '2026.07.02', type: 'Grassland Recovery', target: 'Zone A', dur: '1시간 30분', area: '2.8 ha', result: '완료' },
  { date: '2026.07.01', type: 'Health Inspection', target: 'SHP-027', dur: '12분', area: 'Zone A', result: '완료' }
];
