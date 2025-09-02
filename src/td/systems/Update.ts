// src/td/systems/update.ts
import type { GameState } from '../core/Types';

export function spawnWave(state: GameState) {
  const start = state.path[0];
  const toPx = (c: number) => c * state.cellSize + state.cellSize / 2;
  const baseId = state.enemies.length ? state.enemies[state.enemies.length - 1].id + 1 : 1;

  const count = 6 + state.wave * 2;
  for (let i = 0; i < count; i++) {
    state.enemies.push({
      id: baseId + i,
      pos: { x: toPx(start.x) - i * 24, y: toPx(start.y) },
      speed: 40 + state.wave * 4,
      life: 60 + state.wave * 10,
      alive: true,
      pathIndex: 0,
    });
  }
  state.wave += 1;
}

export function update(state: GameState, dt: number) {
  if (!state.running) return;

  // ENNEMIS
  const toPx = (c: number) => c * state.cellSize + state.cellSize / 2;
  for (const e of state.enemies) {
    if (!e.alive) continue;
    const nextCell = state.path[Math.min(e.pathIndex + 1, state.path.length - 1)];
    const target = { x: toPx(nextCell.x), y: toPx(nextCell.y) };
    const dx = target.x - e.pos.x;
    const dy = target.y - e.pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) {
      e.pathIndex++;
      if (e.pathIndex >= state.path.length - 1) {
        e.alive = false;
        state.life = Math.max(0, state.life - 1);
      }
      continue;
    }
    e.pos.x += (dx / dist) * e.speed * dt;
    e.pos.y += (dy / dist) * e.speed * dt;
  }

  // TIRS DES TOURS
  const now = performance.now();
  for (const t of state.towers) {
    if (now - t.lastShotAt < 1000 / t.fireRate) continue;
    const tx = t.cell.x * state.cellSize + state.cellSize / 2;
    const ty = t.cell.y * state.cellSize + state.cellSize / 2;

    const target = state.enemies.find(
      (e) => e.alive && Math.hypot(e.pos.x - tx, e.pos.y - ty) <= t.range,
    );
    if (target) {
      state.bullets.push({
        id: Date.now() + Math.random(),
        pos: { x: tx, y: ty },
        targetId: target.id,
        speed: 280,
        alive: true,
        kind: t.kind,
      });
      t.lastShotAt = now;
    }
  }

  // PROJECTILES
  for (const b of state.bullets) {
    if (!b.alive) continue;
    const target = state.enemies.find((e) => e.id === b.targetId && e.alive);
    if (!target) {
      b.alive = false;
      continue;
    }
    const dx = target.pos.x - b.pos.x;
    const dy = target.pos.y - b.pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) {
      b.alive = false;
      const dmg = b.kind === 'mage' ? 35 : 20;
      target.life -= dmg;
      if (target.life <= 0) {
        target.alive = false;
        state.gold += 5;
      }
      continue;
    }
    b.pos.x += (dx / dist) * b.speed * dt;
    b.pos.y += (dy / dist) * b.speed * dt;
  }

  // CLEANUP
  state.enemies = state.enemies.filter((e) => e.alive);
  state.bullets = state.bullets.filter((b) => b.alive);
}
