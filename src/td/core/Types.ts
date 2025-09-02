// src/td/core/types.ts
export type Vec2 = { x: number; y: number };

export type Tile = 'path' | 'grass';
export type Grid = Tile[][];

export type TowerKind = 'mage' | 'combat';

export type Enemy = {
  id: number;
  pos: Vec2;        // px
  speed: number;    // px/s
  life: number;
  alive: boolean;
  pathIndex: number;
};

export type Tower = {
  id: number;
  kind: TowerKind;
  cell: Vec2;       // cell coords
  range: number;    // px
  fireRate: number; // shots/s
  damage: number;
  lastShotAt: number;
  level: number;
};

export type Bullet = {
  id: number;
  pos: Vec2;
  targetId: number;
  speed: number;
  alive: boolean;
  kind: TowerKind;
};

export type GameState = {
  gridSize: number;
  cellSize: number;
  grid: Grid;
  path: Vec2[];       // in cells
  enemies: Enemy[];
  towers: Tower[];
  bullets: Bullet[];
  gold: number;
  life: number;
  wave: number;
  lastTimestamp: number;
  running: boolean;
};
