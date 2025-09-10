import React, { useEffect, useRef, useState } from "react";
import "../styles.css";

// Adapte les chemins si nécessaire en fonction de ton repo
import { Game as GameClass } from "../td/core/Game";
import { createLevel } from "../td/state/level";

type HUDState = {
  gold: number;
  life: number;
  wave: number;
  running: boolean;
  timeScale: number;
};

// Interface "souple" qui couvre ce qu'on utilise côté React.
// Cela évite les erreurs TS si la classe Game réelle a une signature différente.
interface GameLike {
  start: () => void;
  stop: () => void;
  pause?: () => void;
  resume?: () => void;
  setTimeScale?: (s: number) => void;
  handlePrimaryAction?: (x: number, y: number) => void;
  handlePointerMove?: (x: number, y: number, dragging?: boolean) => void;
}

// Props attendues par GameScreen, pour corriger l'erreur onExit
type Props = {
  onExit?: () => void;
};

// Utilitaire: convertit un event en coordonnées canvas corrigées
function getCanvasCoordinates(
  e: PointerEvent | MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement
) {
  const rect = canvas.getBoundingClientRect();

  let clientX = 0;
  let clientY = 0;

  if ("touches" in e && e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ("clientX" in e && "clientY" in e) {
    clientX = (e as MouseEvent).clientX;
    clientY = (e as MouseEvent).clientY;
  }

  const xCss = clientX - rect.left;
  const yCss = clientY - rect.top;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: xCss * scaleX,
    y: yCss * scaleY,
  };
}

export default function GameScreen({ onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<GameLike | null>(null);

  const [hud, setHud] = useState<HUDState>({
    gold: 0,
    life: 10,
    wave: 1,
    running: true,
    timeScale: 1,
  });

  const pointerLockRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Empêche scroll/zoom tactiles sur la zone du jeu
    canvas.style.touchAction = "none";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Crée le level et instancie le moteur
    const level = createLevel();

    // Cast en any puis en GameLike pour éviter les erreurs
    // de signature constructeur ou méthodes manquantes.
    const game: GameLike = new (GameClass as any)(
      ctx,
      level,
      {
        onHudUpdate: (partial: Partial<HUDState>) => {
          setHud((prev) => ({ ...prev, ...partial }));
        },
      }
    ) as GameLike;

    gameRef.current = game;

    // Démarre la boucle
    if (game.start) game.start();

    // Handlers pointeur
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      if (pointerLockRef.current) return;
      pointerLockRef.current = true;

      const { x, y } = getCanvasCoordinates(e, canvas);
      game.handlePrimaryAction?.(x, y);
    };

    const onPointerUp = (e: PointerEvent) => {
      e.preventDefault();
      pointerLockRef.current = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      const { x, y } = getCanvasCoordinates(e, canvas);
      game.handlePointerMove?.(x, y, e.buttons > 0);
    };

    // Fallback souris/touch si PointerEvent indisponible
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      if (pointerLockRef.current) return;
      pointerLockRef.current = true;
      const { x, y } = getCanvasCoordinates(e, canvas);
      game.handlePrimaryAction?.(x, y);
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
      game.handlePrimaryAction?.(x, y);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      pointerLockRef.current = false;
    };

    const supportsPointer = typeof window !== "undefined" && "PointerEvent" in window;

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
      try {
        game.stop?.();
      } catch {
        // no-op
      }
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
      game.pause?.();
      setHud((h) => ({ ...h, running: false }));
    } else {
      game.resume?.();
      setHud((h) => ({ ...h, running: true }));
    }
  };

  const setSpeed = (s: number) => {
    const game = gameRef.current;
    game?.setTimeScale?.(s);
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
          <button className={hud.timeScale === 1 ? "active" : ""} onClick={() => setSpeed(1)}>×1</button>
          <button className={hud.timeScale === 1.5 ? "active" : ""} onClick={() => setSpeed(1.5)}>×1.5</button>
          <button className={hud.timeScale === 2 ? "active" : ""} onClick={() => setSpeed(2)}>×2</button>
          {onExit && <button onClick={onExit}>Quitter</button>}
        </div>
      </div>

      <div className="canvas-wrap">
        {/* Dimensions internes du canvas en pixels logiques */}
        <canvas ref={canvasRef} width={960} height={640} />
      </div>
    </div>
  );
}