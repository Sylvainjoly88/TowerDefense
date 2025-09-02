/**
 * Système de mise à jour (logique temps réel) :
 * - Fait avancer les ennemis le long du chemin
 * - Fait tirer les tours si une cible est à portée
 * - Déplace les projectiles et applique les dégâts
 * - Nettoie les entités mortes
 *
 * Note : la pause est gérée via state.running (voir début de update()).
 */
import type { GameState } from '../core/Types';

/** Crée une nouvelle vague d'ennemis (plus nombreux et plus résistants à chaque vague). */
export function spawnWave(state: GameState) {
  const start = state.path[0]; // première cellule du chemin (spawn)
  const toPx = (c: number) => c * state.cellSize + state.cellSize / 2;
  const baseId = state.enemies.length ? state.enemies[state.enemies.length - 1].id + 1 : 1;

  const count = 6 + state.wave * 2; // augmente avec le numéro de vague
  for (let i = 0; i < count; i++) {
    state.enemies.push({
      id: baseId + i,
      pos: { x: toPx(start.x) - i * 24, y: toPx(start.y) }, // "train" d'ennemis espacés
      speed: 40 + state.wave * 4,
      life: 60 + state.wave * 10,
      alive: true,
      pathIndex: 0,
    });
  }
  state.wave += 1;
}

/** Mise à jour d'une frame (dt = secondes écoulées, déjà multiplié par timeScale). */
export function update(state: GameState, dt: number) {
  // Si pause activée, on ne met pas à jour la logique
  if (!state.running) return;

  // --------- ENNEMIS : déplacement le long du chemin ---------
  const toPx = (c: number) => c * state.cellSize + state.cellSize / 2;

  for (const e of state.enemies) {
    if (!e.alive) continue;

    // Étape suivante sur le chemin (en cellules) -> convertie en px
    const nextCell = state.path[Math.min(e.pathIndex + 1, state.path.length - 1)];
    const target = { x: toPx(nextCell.x), y: toPx(nextCell.y) };

    // Vecteur de déplacement
    const dx = target.x - e.pos.x;
    const dy = target.y - e.pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 1) {
      // Prochaine étape
      e.pathIndex++;
      // S'il a atteint la fin du chemin, on le retire et on enlève 1 point de vie
      if (e.pathIndex >= state.path.length - 1) {
        e.alive = false;
        state.life = Math.max(0, state.life - 1);
      }
      continue;
    }

    // Avance vers la cible
    e.pos.x += (dx / dist) * e.speed * dt;
    e.pos.y += (dy / dist) * e.speed * dt;
  }

  // --------- TOURS : tir automatique si ennemi à portée ---------
  const now = performance.now();
  for (const t of state.towers) {
    // Respecte la cadence (tir seulement si assez de temps écoulé depuis le dernier tir)
    if (now - t.lastShotAt < 1000 / t.fireRate) continue;

    const tx = t.cell.x * state.cellSize + state.cellSize / 2;
    const ty = t.cell.y * state.cellSize + state.cellSize / 2;

    // Cible = premier ennemi vivant dans la portée (simple mais efficace)
    const target = state.enemies.find(
      (e) => e.alive && Math.hypot(e.pos.x - tx, e.pos.y - ty) <= t.range,
    );
    if (target) {
      // Crée un projectile dirigé vers la cible
      state.bullets.push({
        id: Date.now() + Math.random(),
        pos: { x: tx, y: ty },
        targetId: target.id,
        speed: 280,
        alive: true,
        kind: t.kind, // pour style/couleur/dégâts
      });
      t.lastShotAt = now;
    }
  }

  // --------- PROJECTILES : déplacement + dégâts au contact ---------
  for (const b of state.bullets) {
    if (!b.alive) continue;

    // Retrouve la cible par id
    const target = state.enemies.find((e) => e.id === b.targetId && e.alive);
    if (!target) {
      // Si la cible est morte entre-temps, on détruit le projectile
      b.alive = false;
      continue;
    }

    // Déplacement vers la cible
    const dx = target.pos.x - b.pos.x;
    const dy = target.pos.y - b.pos.y;
    const dist = Math.hypot(dx, dy);

    // Collision / impact (rayon très simple)
    if (dist < 6) {
      b.alive = false;
      const dmg = b.kind === 'mage' ? 35 : 20;
      target.life -= dmg;
      if (target.life <= 0) {
        target.alive = false;
        state.gold += 5; // petite récompense d'or
      }
      continue;
    }

    // Avance
    b.pos.x += (dx / dist) * b.speed * dt;
    b.pos.y += (dy / dist) * b.speed * dt;
  }

  // --------- Nettoyage : on filtre les entités "mortes" ---------
  state.enemies = state.enemies.filter((e) => e.alive);
  state.bullets = state.bullets.filter((b) => b.alive);
}
