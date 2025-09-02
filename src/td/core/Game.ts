// src/td/core/Game.ts
import type { GameState } from './Types';
import { update } from '../systems/Update';
import { render } from '../systems/Render';

export class Game {
  state: GameState;
  ctx: CanvasRenderingContext2D;
  rafId = 0;

  constructor(ctx: CanvasRenderingContext2D, initial: GameState) {
    this.ctx = ctx;
    this.state = initial;
  }

  start() {
    const loop = (ts: number) => {
      const dt = this.state.lastTimestamp ? (ts - this.state.lastTimestamp) / 1000 : 0;
      this.state.lastTimestamp = ts;
      update(this.state, dt);
      render(this.ctx, this.state);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.rafId);
  }
}
