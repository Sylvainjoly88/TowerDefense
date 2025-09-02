/**
 * Composant racine :
 * - Ajoute un écran "selectMap" entre le Menu et le Jeu.
 * - Stocke le choix de carte (shape, cols, rows) et le passe à GameScreen.
 */

import { useState } from 'react';
import Menu from './screens/Menu';
import Placeholder from './screens/Placeholder';
import GameScreen from './screens/GameScreen';
import SelectMap from './screens/SelectMap';
import type { PathShape } from './td/state/Level';

type Screen = 'menu' | 'selectMap' | 'play' | 'search' | 'encyclo' | 'stats';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  // État : choix de carte (défaut = serpent vertical 15×20)

  const [mapShape, setMapShape] = useState<PathShape>('U');
  const [mapCols, setMapCols] = useState<number>(15);
  const [mapRows, setMapRows] = useState<number>(20);

  return (
    <div className="app">
      {screen === 'menu' && (
        <Menu
          onPlay={() => setScreen('selectMap')}
          onSearch={() => setScreen('search')}
          onEncyclo={() => setScreen('encyclo')}
          onStats={() => setScreen('stats')}
        />
      )}

      {screen === 'selectMap' && (
        <SelectMap
          onBack={() => setScreen('menu')}
          onPick={(shape, cols, rows) => {
            setMapShape(shape);
            setMapCols(cols);
            setMapRows(rows);
            setScreen('play');
          }}
        />
      )}

      {screen === 'play' && (
        <GameScreen
          onExit={() => setScreen('menu')}
          shape={mapShape}
          cols={mapCols}
          rows={mapRows}
        />
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
