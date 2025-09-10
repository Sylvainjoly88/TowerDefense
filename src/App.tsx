import React, { useState } from "react";
import GameScreen from "./screens/GameScreen";
// Adapte ces imports à ton arborescence réelle si besoin :
import Menu from "./screens/Menu";
import Placeholder from "./screens/Placeholder";

type Screen = "menu" | "game" | "placeholder";

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");

  const goMenu = () => setScreen("menu");
  const goGame = () => setScreen("game");
  const goPlaceholder = () => setScreen("placeholder");

  return (
    <div className="app-root">
      {screen === "menu" && (
        <Menu
          onStartGame={goGame}
          onOpenPlaceholder={goPlaceholder}
        />
      )}

      {screen === "game" && (
        <GameScreen onExit={goMenu} />
      )}

      {screen === "placeholder" && (
        <Placeholder onExit={goMenu} />
      )}
    </div>
  );
}

/**
 * Si tes composants Menu et Placeholder ne déclarent pas encore leurs props,
 * voici des déclarations minimales à placer dans leurs fichiers respectifs
 * pour lever l’erreur "onExit n'existe pas sur IntrinsicAttributes".
 *
 * // src/screens/Menu.tsx
 * import React from "react";
 * type Props = { onStartGame?: () => void; onOpenPlaceholder?: () => void };
 * export default function Menu({ onStartGame, onOpenPlaceholder }: Props) {
 *   return (
 *     <div className="menu">
 *       <button onClick={onStartGame}>Start</button>
 *       <button onClick={onOpenPlaceholder}>Placeholder</button>
 *     </div>
 *   );
 * }
 *
 * // src/screens/Placeholder.tsx
 * import React from "react";
 * type Props = { onExit?: () => void };
 * export default function Placeholder({ onExit }: Props) {
 *   return (
 *     <div className="placeholder">
 *       <p>Work in progress...</p>
 *       <button onClick={onExit}>Back</button>
 *     </div>
 *   );
 * }
 */