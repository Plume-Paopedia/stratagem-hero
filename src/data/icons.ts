/**
 * SVG icon path data for all stratagems.
 * Each icon uses a 24x24 viewBox, monochromatic, uses currentColor.
 * Designed for clarity at 16-48px, military/tactical style.
 */

export interface IconDef {
  paths: string[];
  viewBox?: string;
  stroke?: boolean;
  strokeWidth?: number;
}

export const iconData: Record<string, IconDef> = {
  // ══════════════════════════════════════════════════════════════
  // GENERAL STRATAGEMS
  // ══════════════════════════════════════════════════════════════

  // Reinforce — helmet with antenna
  reinforce: {
    stroke: true,
    paths: [
      'M6 18v-2a6 6 0 0 1 12 0v2',
      'M6 18h12',
      'M8 11V9a4 4 0 0 1 8 0v2',
      'M17 8l2-4',
      'M19 4l1 1',
    ],
  },

  // Resupply — crate with parachute
  resupply: {
    stroke: true,
    paths: [
      'M5 13h14v8H5z',
      'M12 13V3',
      'M12 3L6 9',
      'M12 3l6 6',
      'M8 17h8',
    ],
  },

  // SOS Beacon — radio tower with waves
  'sos-beacon': {
    stroke: true,
    paths: [
      'M12 21V8',
      'M8 21l4-13 4 13',
      'M6 8a8 8 0 0 1 4-4',
      'M18 8a8 8 0 0 0-4-4',
      'M4 6a12 12 0 0 1 5-5',
      'M20 6a12 12 0 0 0-5-5',
    ],
  },

  // SSSD Delivery — data disk
  'sssd-delivery': {
    stroke: true,
    paths: [
      'M4 6h16v12H4z',
      'M4 6l2-2h12l2 2',
      'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
      'M12 11v2',
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // MISSION STRATAGEMS
  // ══════════════════════════════════════════════════════════════

  // Hellbomb — bomb with skull
  hellbomb: {
    stroke: true,
    paths: [
      'M12 22a8 8 0 1 1 0-16 8 8 0 0 1 0 16z',
      'M12 6V3',
      'M10 3h4',
      'M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0z',
      'M10 16h4',
      'M11 16v2',
      'M13 16v2',
    ],
  },

  // Upload Data — satellite antenna
  'upload-data': {
    stroke: true,
    paths: [
      'M4 4a16 16 0 0 1 16 16',
      'M4 4l16 16',
      'M4 10a10 10 0 0 1 10 10',
      'M4 4v4h4',
    ],
  },

  // Seismic Probe — pin in ground
  'seismic-probe': {
    stroke: true,
    paths: [
      'M12 2v14',
      'M8 6l4-4 4 4',
      'M6 20h12',
      'M8 16l4 4 4-4',
      'M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // EAGLES (Patriotic Administration Center)
  // Shared eagle body: top-down view with spread wings
  // ══════════════════════════════════════════════════════════════

  // Eagle Strafing Run — eagle with bullet lines
  'eagle-strafing-run': {
    stroke: true,
    paths: [
      'M12 4l-8 8 3 2 5-4 5 4 3-2z',
      'M12 10v10',
      'M8 18l-2 2',
      'M16 18l2 2',
    ],
  },

  // Eagle Airstrike — eagle with bomb
  'eagle-airstrike': {
    stroke: true,
    paths: [
      'M12 3l-8 8 3 2 5-4 5 4 3-2z',
      'M12 9v4',
      'M10 17h4v3h-4z',
      'M12 13v4',
    ],
  },

  // Eagle Cluster Bomb — eagle with scatter dots
  'eagle-cluster-bomb': {
    stroke: true,
    paths: [
      'M12 3l-8 8 3 2 5-4 5 4 3-2z',
      'M12 9v3',
    ],
    viewBox: '0 0 24 24',
  },

  // Eagle Napalm Airstrike — eagle with flame
  'eagle-napalm-airstrike': {
    stroke: true,
    paths: [
      'M12 3l-8 8 3 2 5-4 5 4 3-2z',
      'M12 13c-2 2-3 4-1 6 1-1 1-3-1-4 2 0 4 2 4 5-1-1-2-4-2-7z',
    ],
  },

  // Eagle Smoke Strike — eagle with cloud
  'eagle-smoke-strike': {
    stroke: true,
    paths: [
      'M12 3l-8 8 3 2 5-4 5 4 3-2z',
      'M7 18a3 3 0 0 1 3-3 3 3 0 0 1 5 1 3 3 0 0 1 2-1 3 3 0 0 1 0 6H7z',
    ],
  },

  // Eagle 110mm Rocket Pods — eagle with rockets
  'eagle-110mm-rocket-pods': {
    stroke: true,
    paths: [
      'M12 3l-8 8 3 2 5-4 5 4 3-2z',
      'M8 14v6',
      'M12 14v6',
      'M16 14v6',
      'M7 20h2',
      'M11 20h2',
      'M15 20h2',
    ],
  },

  // Eagle 500kg Bomb — eagle with huge bomb
  'eagle-500kg-bomb': {
    stroke: true,
    strokeWidth: 2,
    paths: [
      'M12 2l-8 8 3 2 5-4 5 4 3-2z',
      'M10 14h4v6h-4z',
      'M9 20h6',
      'M8 12l4 2 4-2',
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // ORBITAL CANNONS
  // Shared: vertical beam + crosshair/reticle
  // ══════════════════════════════════════════════════════════════

  // Orbital Gatling Barrage — crosshair with rapid fire
  'orbital-gatling-barrage': {
    stroke: true,
    paths: [
      'M12 2v4M12 18v4M2 12h4M18 12h4',
      'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
      'M10 10v4M12 9v6M14 10v4',
    ],
  },

  // Orbital Airburst Strike — crosshair with burst
  'orbital-airburst-strike': {
    stroke: true,
    paths: [
      'M12 2v4M12 18v4M2 12h4M18 12h4',
      'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
      'M12 6l1-3M12 6l-1-3M15 7l2-2M9 7l-2-2',
    ],
  },

  // Orbital 120mm HE Barrage — crosshair with shell
  'orbital-120mm-he-barrage': {
    stroke: true,
    paths: [
      'M12 2v4M12 18v4M2 12h4M18 12h4',
      'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
      'M12 10v4',
    ],
  },

  // Orbital 380mm HE Barrage — large crosshair with big shell
  'orbital-380mm-he-barrage': {
    stroke: true,
    strokeWidth: 2.5,
    paths: [
      'M12 1v5M12 18v5M1 12h5M18 12h5',
      'M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z',
    ],
  },

  // Orbital Walking Barrage — crosshair with forward arrows
  'orbital-walking-barrage': {
    stroke: true,
    paths: [
      'M12 2v4M12 18v4M2 12h4M18 12h4',
      'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
      'M6 20l3-3M6 20h3M6 20v-3',
      'M18 20l-3-3M18 20h-3M18 20v-3',
    ],
  },

  // Orbital Laser — crosshair with beam
  'orbital-laser': {
    stroke: true,
    paths: [
      'M12 2v20',
      'M8 6l4-4 4 4',
      'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
      'M10 14l-4 6M14 14l4 6',
    ],
  },

  // Orbital Railcannon Strike — crosshair with rail lines
  'orbital-railcannon-strike': {
    stroke: true,
    paths: [
      'M12 2v20',
      'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
      'M8 2h8',
      'M9 4h6',
      'M10 22h4',
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // BRIDGE (Orbital support)
  // ══════════════════════════════════════════════════════════════

  // Orbital Precision Strike — simple precise crosshair + dot
  'orbital-precision-strike': {
    stroke: true,
    paths: [
      'M12 2v7M12 15v7M2 12h7M15 12h7',
      'M12 12m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0',
    ],
  },

  // Orbital Gas Strike — crosshair with gas cloud
  'orbital-gas-strike': {
    stroke: true,
    paths: [
      'M12 2v4M12 18v4M2 12h4M18 12h4',
      'M8 10c0-2 2-3 4-3s4 1 4 3',
      'M6 14c0-2 3-3 6-3s6 1 6 3',
      'M7 14a4 4 0 0 0 4 3 4 4 0 0 0 6-1 4 4 0 0 0 1-2',
    ],
  },

  // Orbital EMS Strike — crosshair with lightning bolt
  'orbital-ems-strike': {
    stroke: true,
    paths: [
      'M12 2v4M12 18v4M2 12h4M18 12h4',
      'M13 8l-3 5h4l-3 5',
    ],
  },

  // Orbital Smoke Strike — crosshair with smoke
  'orbital-smoke-strike': {
    stroke: true,
    paths: [
      'M12 2v4M12 18v4M2 12h4M18 12h4',
      'M8 16a3 3 0 0 1 3-3 2 2 0 0 1 4 0 3 3 0 0 1 1 0 3 3 0 0 1 0 5H8z',
    ],
  },

  // Orbital Napalm Barrage — crosshair with fire
  'orbital-napalm-barrage': {
    stroke: true,
    paths: [
      'M12 2v4M12 20v2M2 12h4M18 12h4',
      'M12 8c-3 3-4 6-2 8 1-1 1-3-1-5 3 1 5 4 5 7-2-1-3-5-2-10z',
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // ENGINEERING BAY (Support Weapons)
  // Each is a unique weapon silhouette
  // ══════════════════════════════════════════════════════════════

  // Machine Gun — MG profile
  'machine-gun': {
    stroke: true,
    paths: [
      'M2 14h14l4-2v-1H4v-2h16v2',
      'M6 14v4',
      'M14 14v4',
      'M6 11V8',
    ],
  },

  // Anti-Materiel Rifle — long sniper rifle
  'anti-materiel-rifle': {
    stroke: true,
    paths: [
      'M1 13h18l3-1v-1H3',
      'M5 13v3',
      'M15 13l2 3',
      'M20 12l2-3',
      'M8 11V8l2-1',
    ],
  },

  // Stalwart — light machine gun
  stalwart: {
    stroke: true,
    paths: [
      'M3 13h15l3-1H4v-2h14v1',
      'M7 13v3',
      'M14 13v3',
      'M4 11V9',
    ],
  },

  // Expendable Anti-Tank — tube launcher
  'expendable-anti-tank': {
    stroke: true,
    paths: [
      'M2 14l20-4',
      'M2 12l20-4',
      'M4 14v3',
      'M20 8l2-1',
      'M2 12l2 2',
    ],
  },

  // Recoilless Rifle — tube with backblast
  'recoilless-rifle': {
    stroke: true,
    paths: [
      'M4 13h16',
      'M4 11h16',
      'M4 11v2',
      'M20 10v4',
      'M2 10l-1 2 1 2',
      'M8 13v4',
    ],
  },

  // Flamethrower — nozzle with flame
  flamethrower: {
    stroke: true,
    paths: [
      'M3 14h10v-2H3z',
      'M13 12l5-2',
      'M13 14l5 0',
      'M18 10c2 0 4 2 4 4s-2 4-4 3c1-1 2-2 2-3s-1-3-2-4z',
    ],
  },

  // Autocannon — heavy barrel with magazine
  autocannon: {
    stroke: true,
    paths: [
      'M2 13h18l2-1v-2H4',
      'M4 10v-2h3v2',
      'M7 13v5h3v-5',
      'M14 13v3',
    ],
  },

  // Railgun — sci-fi rail weapon with parallel rails
  railgun: {
    stroke: true,
    paths: [
      'M2 10h20',
      'M2 14h20',
      'M4 10v4',
      'M10 10v4',
      'M16 10v4',
      'M22 10v4',
      'M6 14v3',
    ],
  },

  // Spear — guided missile launcher
  spear: {
    stroke: true,
    paths: [
      'M2 13h12l8-3',
      'M2 11h12l8 3',
      'M22 10v4',
      'M6 13v4',
      'M3 9h6v2H3z',
    ],
  },

  // Grenade Launcher — revolving tube
  'grenade-launcher': {
    stroke: true,
    paths: [
      'M4 14h12l4-2H6',
      'M6 12v2',
      'M10 10a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
      'M6 14v4',
    ],
  },

  // Laser Cannon — beam emitter
  'laser-cannon': {
    stroke: true,
    paths: [
      'M3 14h10v-4H3z',
      'M13 10l9 2',
      'M13 14l9-2',
      'M7 14v4',
      'M22 12m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0',
    ],
  },

  // Arc Thrower — tesla coil weapon
  'arc-thrower': {
    stroke: true,
    paths: [
      'M3 14h8v-3H3z',
      'M11 11v3',
      'M14 8l-2 4h4l-2 4',
      'M17 7l-2 4h3l-2 4',
      'M6 14v4',
    ],
  },

  // Quasar Cannon — energy weapon with charge rings
  'quasar-cannon': {
    stroke: true,
    paths: [
      'M2 14h12l2-2-2-2H2z',
      'M16 12a3 3 0 1 1 0 0',
      'M19 12a2 2 0 1 1 0 0',
      'M22 12m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0',
      'M6 14v4',
    ],
  },

  // Heavy Machine Gun — beefy MG
  'heavy-machine-gun': {
    stroke: true,
    strokeWidth: 2.5,
    paths: [
      'M2 14h16l4-2H4v-2h16',
      'M6 14v4',
      'M14 14v4',
    ],
  },

  // Airburst Rocket Launcher — tube with burst
  'airburst-rocket-launcher': {
    stroke: true,
    paths: [
      'M2 14h14l4-2v-1H4v-2h14',
      'M6 14v4',
      'M20 10l2-3M20 10l3 0M20 10l2 3',
    ],
  },

  // Commando — guided missile launcher with scope
  commando: {
    stroke: true,
    paths: [
      'M3 14h14l3-2H5v-2h14',
      'M7 14v4',
      'M15 10v-3h3v3',
      'M20 12l2-1v2l-2-1',
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // ROBOTICS WORKSHOP (Sentries & Defenses)
  // Sentries share tripod base + turret top
  // ══════════════════════════════════════════════════════════════

  // Machine Gun Sentry — turret with barrel
  'machine-gun-sentry': {
    stroke: true,
    paths: [
      'M12 14v6',
      'M8 20h8',
      'M9 14h6v-2H9z',
      'M12 12V8',
      'M15 12h5',
    ],
  },

  // Gatling Sentry — turret with multi-barrel
  'gatling-sentry': {
    stroke: true,
    paths: [
      'M12 14v6',
      'M8 20h8',
      'M9 14h6v-3H9z',
      'M15 11h5',
      'M15 12h5',
      'M15 13h5',
    ],
  },

  // Mortar Sentry — turret with angled mortar
  'mortar-sentry': {
    stroke: true,
    paths: [
      'M12 16v4',
      'M8 20h8',
      'M9 16h6v-3H9z',
      'M12 13l-4-8',
      'M6 5h4',
    ],
  },

  // Autocannon Sentry — turret with heavy barrel
  'autocannon-sentry': {
    stroke: true,
    strokeWidth: 2.5,
    paths: [
      'M12 14v6',
      'M8 20h8',
      'M9 14h6v-3H9z',
      'M15 12h6',
    ],
  },

  // Rocket Sentry — turret with rocket tubes
  'rocket-sentry': {
    stroke: true,
    paths: [
      'M12 15v5',
      'M8 20h8',
      'M9 15h6v-3H9z',
      'M15 10h5v2h-5',
      'M15 12h5v2h-5',
    ],
  },

  // EMS Mortar Sentry — turret with lightning
  'ems-mortar-sentry': {
    stroke: true,
    paths: [
      'M12 16v4',
      'M8 20h8',
      'M9 16h6v-3H9z',
      'M12 13l-4-8',
      'M7 3l-1 3h3l-1 3',
    ],
  },

  // Anti-Personnel Minefield — mine shape
  'anti-personnel-minefield': {
    stroke: true,
    paths: [
      'M12 16a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
      'M12 6V4',
      'M8 7l-1-2',
      'M16 7l1-2',
      'M4 20h16',
      'M6 18h12v2H6z',
    ],
  },

  // Incendiary Mines — mine with flame
  'incendiary-mines': {
    stroke: true,
    paths: [
      'M12 18a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
      'M12 8V6',
      'M12 10c-1 1-2 3 0 4 1-1 1-2 0-3',
      'M4 22h16',
      'M6 20h12v2H6z',
    ],
  },

  // Shield Generator Relay — dome shield
  'shield-generator-relay': {
    stroke: true,
    paths: [
      'M4 20a10 10 0 0 1 16 0',
      'M6 20a8 8 0 0 1 12 0',
      'M4 20h16',
      'M12 20v-6',
      'M10 14h4',
    ],
  },

  // Tesla Tower — tower with arcs
  'tesla-tower': {
    stroke: true,
    paths: [
      'M12 22V8',
      'M9 22h6',
      'M10 8h4v-2h-4z',
      'M12 6V4',
      'M8 4l-3-2',
      'M16 4l3-2',
      'M6 6l-4 0',
      'M18 6l4 0',
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // HANGAR (Backpacks, Drones, Vehicles)
  // ══════════════════════════════════════════════════════════════

  // Guard Dog Rover — drone with laser beam
  'guard-dog-rover': {
    stroke: true,
    paths: [
      'M8 8h8v4H8z',
      'M6 10h2M16 10h2',
      'M10 8V6h4v2',
      'M12 12v6',
      'M12 18m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0',
    ],
  },

  // Guard Dog — drone with gun
  'guard-dog': {
    stroke: true,
    paths: [
      'M8 8h8v4H8z',
      'M6 10h2M16 10h2',
      'M10 8V6h4v2',
      'M12 12v3',
      'M9 15h6l1 2H8l1-2z',
    ],
  },

  // Ballistic Shield Backpack — shield
  'ballistic-shield': {
    stroke: true,
    strokeWidth: 2,
    paths: [
      'M6 4h12v10a6 6 0 0 1-6 6 6 6 0 0 1-6-6V4z',
      'M12 7v8',
      'M9 10h6',
    ],
  },

  // Shield Generator Pack — backpack with shield bubble
  'shield-generator-pack': {
    stroke: true,
    paths: [
      'M8 8h8v10H8z',
      'M6 10h2M16 10h2',
      'M10 6h4',
      'M4 12a8 8 0 0 0 16 0',
    ],
  },

  // Jump Pack — jetpack
  'jump-pack': {
    stroke: true,
    paths: [
      'M8 4h8v12H8z',
      'M6 8h2v6H6z',
      'M16 8h2v6h-2z',
      'M7 14l-2 6',
      'M17 14l2 6',
      'M10 16h4',
    ],
  },

  // Supply Pack — backpack with cross
  'supply-pack': {
    stroke: true,
    paths: [
      'M7 5h10v14H7z',
      'M5 8h2v8H5z',
      'M17 8h2v8h-2z',
      'M12 9v6',
      'M9 12h6',
    ],
  },

  // Guard Dog "Dog Breath" — drone with flame
  'guard-dog-dog-breath': {
    stroke: true,
    paths: [
      'M8 8h8v4H8z',
      'M6 10h2M16 10h2',
      'M10 8V6h4v2',
      'M12 12v2',
      'M12 14c-2 2-2 4 0 5 1-1 1-2 0-3 2 1 2 3 0 5',
    ],
  },

  // Patriot Exosuit — mech silhouette
  'patriot-exosuit': {
    stroke: true,
    strokeWidth: 2,
    paths: [
      'M10 4h4v3h-4z',
      'M8 7h8v8H8z',
      'M6 9h2v4H6z',
      'M16 9h2v4h-2z',
      'M4 11h2',
      'M18 11h2',
      'M9 15v5',
      'M15 15v5',
      'M7 20h4M13 20h4',
    ],
  },

  // Emancipator Exosuit — heavy mech with dual guns
  'emancipator-exosuit': {
    stroke: true,
    strokeWidth: 2,
    paths: [
      'M10 3h4v3h-4z',
      'M7 6h10v9H7z',
      'M5 8h2v5H5z',
      'M17 8h2v5h-2z',
      'M2 10h3',
      'M19 10h3',
      'M2 12h3',
      'M19 12h3',
      'M9 15v5',
      'M15 15v5',
      'M7 20h4M13 20h4',
    ],
  },
};
