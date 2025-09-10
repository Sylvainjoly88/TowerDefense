import React, { useEffect, useRef, useState } from "react";
import "../styles.css";

// Si ton projet a déjà ces imports, garde les tiens.
// Le moteur de jeu est supposé exposer une API start/stop et des callbacks d'input.
// Adapte les imports si besoin selon ton arborescence.
import { Game } from "../td/core/Game";
import { createLevel } from "../td/state/level";

type HUDState = {
  gold: number;
  life: number;
  wave: number;
  running: boolean;
  timeScale: number;
};

// Utilitaire: convertit un event pointeur/touch/souris en coordonnées canvas corrigées
function getCanvasCoordinates(
  e: PointerEvent | MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement
) {
  const rect = canvas.getBoundingClientRect();

  let clientX: number;
  let clientY: number;

  if ((e as TouchEvent).touches && (e as TouchEvent).touches.length > 0) {
    const t = (e as TouchEvent).touches[0];
    clientX = t.clientX;
    clientY = t.clientY;
  } else if ((e as any).clientX != null && (e as any).clientY != null) {
    clientX = (e as MouseEvent).clientX;
    clientY = (e as MouseEvent).clientY;
  } else if ((e as PointerEvent).clientX != null && (e as PointerEvent).clientY != null) {
    clientX = (e as PointerEvent).clientX;
    clientY = (e as PointerEvent).clientY;
  } else {
    clientX = 0;
    clientY = 0;
  }

  // Position relative au canvas dans l'espace CSS
  const xCss = clientX - rect.left;
  const yCss = clientY - rect.top;

  // Corrige l'échelle si le canvas est redimensionné par CSS
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: xCss * scaleX,
    y: yCss * scaleY,
  };
}

export default function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);

  const [hud, setHud] = useState<HUDState>({
    gold: 0,
    life: 10,
    wave: 1,
    running: true,
    timeScale: 1,
  });

  // Petit verrou pour éviter multiples placements tant que le doigt reste posé
  const pointerLockRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    // Important pour mobile: empêche le scroll et le zoom gestuel sur la zone du jeu
    canvas.style.touchAction = "none";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Init jeu
    const level = createLevel();
    const game = new Game(ctx, level, {
      onHudUpdate: (state: HUDState) => setHud((prev) => ({ ...prev, ...state })),
    });
    gameRef.current = game;
    game.start();

    // Gestion unifiée avec Pointer Events
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      if (pointerLockRef.current) return;
      pointerLockRef.current = true;

      const { x, y } = getCanvasCoordinates(e, canvas);
      // On laisse le moteur gérer l'action principale au pointerdown
      game.handlePrimaryAction(x, y);
    };

    const onPointerUp = (e: PointerEvent) => {
      e.preventDefault();
      pointerLockRef.current = false;
      // Si tu veux aussi déclencher une action au relâchement, tu peux:
      // const { x, y } = getCanvasCoordinates(e, canvas);
      // game.handlePointerUp?.(x, y);
    };

    const onPointerMove = (e: PointerEvent) => {
      // Optionnel: survol/drag
      const { x, y } = getCanvasCoordinates(e, canvas);
      game.handlePointerMove?.(x, y, e.buttons > 0);
    };

    // Fallback pour navigateurs anciens: souris + touch
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      if (pointerLockRef.current) return;
      pointerLockRef.current = true;
      const { x, y } = getCanvasCoordinates(e, canvas);
      game.handlePrimaryAction(x, y);
    };
    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      pointerLockRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (pointerLockRef.current) return;
      pointerLockRef.current = true;
      const { x, y } = getCanvasCoordinates(e, canvas);
      game.handlePrimaryAction(x, y);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      pointerLockRef.current = false;
    };

    // On préfère Pointer Events s'ils sont disponibles
    const supportsPointer = window.PointerEvent != null;

    if (supportsPointer) {
      canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
      canvas.addEventListener("pointerup", onPointerUp, { passive: false });
      canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    } else {
      canvas.addEventListener("mousedown", onMouseDown, { passive: false });
      window.addEventListener("mouseup", onMouseUp, { passive: false });
      canvas.addEventListener("touchstart", onTouchStart, { passive: false });
      window.addEventListener("touchend", onTouchEnd, { passive: false });
    }

    return () => {
      game.stop();
      if (supportsPointer) {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointermove", onPointerMove);
      } else {
        canvas.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchend", onTouchEnd);
      }
    };
  }, []);

  const toggleRun = () => {
    const game = gameRef.current;
    if (!game) return;
    if (hud.running) {
      game.pause();
      setHud((h) => ({ ...h, running: false }));
    } else {
      game.resume();
      setHud((h) => ({ ...h, running: true }));
    }
  };

  const setSpeed = (s: number) => {
    const game = gameRef.current;
    if (!game) return;
    game.setTimeScale(s);
    setHud((h) => ({ ...h, timeScale: s }));
  };

  return (
    <div className="screen game-screen">
      <div className="hud">
        <div>❤️ {hud.life}</div>
        <div>💰 {hud.gold}</div>
        <div>Wave {hud.wave}</div>
        <div className="controls">
          <button onClick={toggleRun}>{hud.running ? "Pause" : "Play"}</button>
          <button
            className={hud.timeScale === 1 ? "active" : ""}
            onClick={() => setSpeed(1)}
          >
            ×1
          </button>
          <button
            className={hud.timeScale === 1.5 ? "active" : ""}
            onClick={() => setSpeed(1.5)}
          >
            ×1.5
          </button>
          <button
            className={hud.timeScale === 2 ? "active" : ""}
            onClick={() => setSpeed(2)}
          >
            ×2
          </button>
        </div>
      </div>

      {/* Dimensions internes du canvas en pixels logiques.
          Le CSS peut redimensionner visuellement, d’où l’importance du mapping coords */}
      <div className="canvas-wrap">
        <canvas ref={canvasRef} width={960} height={640} />
      </div>
    </div>
  );
}