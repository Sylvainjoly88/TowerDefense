// src/App.tsx
import { useState } from 'react';
import Menu from './screens/Menu.tsx';
import Placeholder from './screens/Placeholder.tsx';
import GameScreen from './screens/GameScreen.tsx';

type Screen = 'menu' | 'play' | 'search' | 'encyclo' | 'stats';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  return (
    <div className="app">
      {screen === 'menu' && (
        <Menu
          onPlay={() => setScreen('play')}
          onSearch={() => setScreen('search')}
          onEncyclo={() => setScreen('encyclo')}
          onStats={() => setScreen('stats')}
        />
      )}

      {screen === 'play' && (
        <GameScreen onExit={() => setScreen('menu')} />
      )}

      {screen === 'search' && (
        <Placeholder title="Recherche" onBack={() => setScreen('menu')} />
      )}
      {screen === 'encyclo' && (
        <Placeholder title="Encyclopédie" onBack={() => setScreen('menu')} />
      )}
      {screen === 'stats' && (
        <Placeholder title="Statistiques" onBack={() => setScreen('menu')} />
      )}
    </div>
  );
}
