/**
 * Boucle de jeu "bas niveau".
 * - Gère requestAnimationFrame
 * - Calcule dt (temps écoulé) et applique le timeScale (vitesse x1/x1.5/x2)
 * - Appelle update(state, dt) puis render(ctx, state) à chaque frame
 *
 * Avantage : la boucle ne dépend pas de React.
 */
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

  /** Lance la boucle requestAnimationFrame */
  start() {
    const loop = (ts: number) => {
      // dt brut en secondes
      const dtRaw = this.state.lastTimestamp ? (ts - this.state.lastTimestamp) / 1000 : 0;
      this.state.lastTimestamp = ts;

      // Application du facteur de vitesse (timeScale)
      const dt = dtRaw * (this.state.timeScale || 1);

      // Logique puis rendu
      update(this.state, dt);
      render(this.ctx, this.state);

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  /** Arrête proprement la boucle (ex: quand on quitte l'écran de jeu) */
  stop() {
    cancelAnimationFrame(this.rafId);
  }
}
