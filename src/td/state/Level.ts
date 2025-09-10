/**
 * Niveaux rectangulaires (cols × rows).
 * 4 formes jouables :
 * - 'U'         : U classique
 * - 'S'         : S classique
 * - 'x-base'    : X avec base en bas
 * - 'aleatoire' : chemin pseudo-aléatoire CONTINU (ajoute 1–2 croisements)
 *
 * IMPORTANT : le mode "aleatoire" utilise une connexion H/V "case par case" ⇒ pas de trou.
 */
import type { GameState, Grid, Vec2 } from '../core/Types';

// Stub minimal pour satisfaire la compilation.
// Remplace par ta vraie logique si tu as déjà un générateur de niveau.

export type Level = any;

export function createLevel(): Level {
  return {};
}

export type PathShape = 'U' | 'S' | 'x-base' | 'aleatoire';

export function createLevel(
  cols = 15,
  rows = 20,
  cellSize = 36,
  shape: PathShape = 'U',
): GameState {
  const grid: Grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 'grass'),
  );

  const path = generatePath(shape, cols, rows);

  // Marque le chemin
  for (const { x, y } of path) {
    if (y >= 0 && y < rows && x >= 0 && x < cols) {
      grid[y][x] = 'path';
    }
  }

  return {
    gridSize: cols, // "largeur" en cellules
    cellSize,
    grid,
    path,
    enemies: [],
    towers: [],
    bullets: [],
    gold: 0,
    life: 10,
    wave: 0,
    lastTimestamp: 0,
    running: true,
    timeScale: 1,
  };
}

function generatePath(shape: PathShape, cols: number, rows: number): Vec2[] {
  switch (shape) {
    case 'U':        return pathU(cols, rows);
    case 'S':        return pathS(cols, rows);
    case 'x-base':   return pathXBase(cols, rows);
    case 'aleatoire':return pathAleatoire(cols, rows);
  }
}

/* ------------------------------ OUTILS ------------------------------ */

/**
 * Ajoute une séquence de cases qui relie "from" → "to" **pas à pas** (H/V uniquement).
 * - garantit la CONTIGUÏTÉ (chaque case voisine de la précédente).
 * - `hFirst` : si true, on fait d’abord l’horizontal puis la verticale (ou l’inverse).
 */
function connectHV(path: Vec2[], from: Vec2, to: Vec2, hFirst = true) {
  let { x, y } = from;
  const stepX = to.x === x ? 0 : to.x > x ? 1 : -1;
  const stepY = to.y === y ? 0 : to.y > y ? 1 : -1;

  const goH = () => {
    while (x !== to.x) {
      x += stepX;
      path.push({ x, y });
    }
  };
  const goV = () => {
    while (y !== to.y) {
      y += stepY;
      path.push({ x, y });
    }
  };

  if (hFirst) { goH(); goV(); } else { goV(); goH(); }
}

function dedupe(path: Vec2[]): Vec2[] {
  const out: Vec2[] = [];
  for (const p of path) {
    const last = out[out.length - 1];
    if (!last || last.x !== p.x || last.y !== p.y) out.push(p);
  }
  return out;
}

/* ------------------------------ FORMES ------------------------------ */

function pathU(cols: number, rows: number): Vec2[] {
  const p: Vec2[] = [];
  const leftX = Math.max(1, Math.floor(cols * 0.15));
  const rightX = cols - 1 - Math.max(1, Math.floor(cols * 0.15));
  const topY = 1;
  const botY = rows - 2;

  let cur = { x: leftX, y: topY };
  p.push(cur);
  connectHV(p, cur, { x: leftX, y: botY }, false);  cur = p[p.length - 1];
  connectHV(p, cur, { x: rightX, y: botY }, true);   cur = p[p.length - 1];
  connectHV(p, cur, { x: rightX, y: topY }, false);

  return dedupe(p);
}

function pathS(cols: number, rows: number): Vec2[] {
  const p: Vec2[] = [];
  const leftX = Math.max(1, Math.floor(cols * 0.15));
  const rightX = cols - 1 - Math.max(1, Math.floor(cols * 0.15));
  const yTop = 2;
  const yMid = Math.floor(rows / 2);
  const yBot = rows - 3;

  let cur = { x: leftX, y: yTop };
  p.push(cur);
  connectHV(p, cur, { x: rightX, y: yTop }, true); cur = p[p.length - 1];
  connectHV(p, cur, { x: rightX, y: yMid }, false); cur = p[p.length - 1];
  connectHV(p, cur, { x: leftX,  y: yMid }, true);  cur = p[p.length - 1];
  connectHV(p, cur, { x: leftX,  y: yBot }, false); cur = p[p.length - 1];
  connectHV(p, cur, { x: rightX, y: yBot }, true);

  return dedupe(p);
}

function pathXBase(cols: number, rows: number): Vec2[] {
  const p: Vec2[] = [];
  const mx = Math.max(1, Math.floor(cols * 0.1));
  const start = { x: mx, y: 1 };
  const dr    = { x: cols - 1 - mx, y: rows - 2 };
  const baseL = { x: mx, y: rows - 2 };
  const ur    = { x: cols - 1 - mx, y: 1 };

  let cur = start;
  p.push(cur);
  connectHV(p, cur, dr, true);   cur = p[p.length - 1];
  connectHV(p, cur, baseL, true);cur = p[p.length - 1];
  connectHV(p, cur, ur, false);

  return dedupe(p);
}

/**
 * Chemin aléatoire CONTINU :
 * - on définit des waypoints (gauche/droite aux hauteurs y1,y2,y3, etc.)
 * - on relie chaque waypoint au suivant avec connectHV (H/V step-by-step)
 * - on ajoute 1–2 "croisements" horizontaux en milieu de carte (ils restent CONTINUS,
 *   car on part du point courant pour les rejoindre, puis on continue).
 */
function pathAleatoire(cols: number, rows: number): Vec2[] {
  const p: Vec2[] = [];
  const leftX  = Math.max(1, Math.floor(cols * 0.15));
  const rightX = cols - 1 - Math.max(1, Math.floor(cols * 0.15));
  const midX   = Math.floor(cols / 2);

  const y1 = 1;
  const y2 = Math.max(3, Math.floor(rows * 0.35));
  const y3 = Math.max(y2 + 2, Math.floor(rows * 0.6));
  const y4 = rows - 2;

  // Aléa d’entrée/sortie et de l’ordre H/V
  const startLeft  = Math.random() < 0.5;
  const exitLeft   = Math.random() < 0.5;

  // Séquence de waypoints PRINCIPAUX (type serpentin)
  const w: Vec2[] = [];
  w.push({ x: startLeft ? leftX : rightX, y: y1 });
  w.push({ x: startLeft ? rightX : leftX, y: y1 });
  w.push({ x: startLeft ? rightX : leftX, y: y2 });
  w.push({ x: startLeft ? leftX  : rightX, y: y2 });
  w.push({ x: startLeft ? leftX  : rightX, y: y3 });
  w.push({ x: startLeft ? rightX : leftX, y: y3 });
  w.push({ x: exitLeft  ? leftX  : rightX, y: y4 });

  // Point de départ
  let cur = w[0];
  p.push(cur);

  // Relie les waypoints 1→2→3… avec connectHV (adjacent garanti)
  for (let i = 1; i < w.length; i++) {
    const next = w[i];
    const hFirst = Math.random() < 0.5;
    connectHV(p, cur, next, hFirst);
    cur = next;
  }

  // 1 à 2 "croisements" CONTINUS au milieu
  const crossings = 1 + Math.round(Math.random()); // 1 ou 2
  for (let i = 0; i < crossings; i++) {
    const cy = Math.max(2, Math.min(rows - 3, Math.floor(rows * (0.35 + 0.2 * Math.random()))));
    // rejoindre le milieu de ligne
    const toMid = { x: midX, y: cy };
    connectHV(p, cur, toMid, Math.random() < 0.5);
    cur = toMid;

    // traverser au bord opposé
    const toEdge = { x: cur.x < (leftX + rightX) / 2 ? rightX : leftX, y: cy };
    connectHV(p, cur, toEdge, true);
    cur = toEdge;
  }

  // S’assurer de sortir bien en bas sur le bord choisi
  const final = { x: exitLeft ? leftX : rightX, y: y4 };
  connectHV(p, cur, final, true);

  return dedupe(p);
}
