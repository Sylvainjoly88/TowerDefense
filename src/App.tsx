import { useState } from "react";
import GameScreen from "./screens/GameScreen";
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
        <Menu onStartGame={goGame} onOpenPlaceholder={goPlaceholder} />
      )}

      {screen === "game" && <GameScreen onExit={goMenu} />}

      {screen === "placeholder" && <Placeholder onExit={goMenu} />}
    </div>
  );
}