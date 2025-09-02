/**
 * Types centraux du moteur de jeu (indépendants de React).
 * Idée clé : un GameState "vivant" muté par la boucle (update),
 * évite de re-render React à 60 FPS.
 */

export type Vec2 = { x: number; y: number };

/** Type d'une case de la grille : chemin (path) ou herbe (grass) */
export type Tile = 'path' | 'grass';
export type Grid = Tile[][];

/** Types de tours disponibles (facile à étendre) */
export type TowerKind = 'mage' | 'combat';

/** Ennemi basique qui suit le chemin "path" (polyline en cellules) */
export type Enemy = {
  id: number;
  pos: Vec2;           // position en PIXELS (pas en cellules)
  speed: number;       // vitesse (px/s)
  life: number;        // points de vie restants
  alive: boolean;      // filtré ensuite si false
  pathIndex: number;   // index de l'étape suivante sur le chemin
};

/** Tour de défense */
export type Tower = {
  id: number;
  kind: TowerKind;     // "mage" ou "combat"
  cell: Vec2;          // position en CELLULES (x,y de la grille)
  range: number;       // portée en px
  fireRate: number;    // tirs par seconde
  damage: number;      // dégâts par projectile
  lastShotAt: number;  // timestamp du dernier tir (ms, via performance.now())
  level: number;       // niveau (pour futurs upgrades)
};

/** Projectile simple (homing vers une cible) */
export type Bullet = {
  id: number;
  pos: Vec2;           // position en px
  targetId: number;    // id de l'ennemi visé
  speed: number;       // vitesse du projectile (px/s)
  alive: boolean;      // filtré ensuite si false
  kind: TowerKind;     // sert à déterminer la couleur / type de dégâts
};

/** État global du jeu (muté en continu par la boucle) */
export type GameState = {
  gridSize: number;    // ex: 15 => grille 15x15
  cellSize: number;    // taille d'une case en px (ex: 36)
  grid: Grid;          // matrice de tiles
  path: Vec2[];        // chemin en coordonnées CELLULES (polyline)
  enemies: Enemy[];    // liste plate (facile à itérer/filtrer)
  towers: Tower[];
  bullets: Bullet[];
  gold: number;        // or du joueur
  life: number;        // points de vie restants (fuit si ennemi atteint la fin)
  wave: number;        // numéro de la vague en cours (1,2,3...)
  lastTimestamp: number; // dernier timestamp rAF pour calculer dt
  running: boolean;    // false => pause
  timeScale: number;   // accélération du temps (1 / 1.5 / 2)
};
