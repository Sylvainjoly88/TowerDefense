/**
 * Composant racine : gère la navigation "écran" par un simple state local.
 * Écrans :
 *  - menu       : écran d'accueil
 *  - play       : jeu (boucle canvas)
 *  - search     : placeholder "Recherche"
 *  - encyclo    : placeholder "Encyclopédie"
 *  - stats      : placeholder "Statistiques"
 *
 * Remarque : on n'utilise PAS de router ici pour rester simple.
 */
import { useState } from 'react';
import Menu from './screens/Menu';
import Placeholder from './screens/Placeholder';
import GameScreen from './screens/GameScreen';

type Screen = 'menu' | 'play' | 'search' | 'encyclo' | 'stats';

export default function App() {
  // État courant de l'écran affiché
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

      {/* Écran de jeu (canvas + HUD). On passe un handler pour revenir au menu. */}
      {screen === 'play' && <GameScreen onExit={() => setScreen('menu')} />}

      {/* Écrans "à venir" très simples */}
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
