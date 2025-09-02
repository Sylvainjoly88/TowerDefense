# 🎮 RPG-TD — Tower Defense en React + Canvas

Un petit jeu **Tower Defense** écrit en **React + TypeScript + Vite**, avec rendu en **Canvas 2D**.  
Déployé automatiquement sur **Netlify** via GitHub.

👉 [Jouer en ligne](https://rpg-td.netlify.app)  

---

## 🚀 Lancer le projet en local (ou Codespaces)

```bash
npm install
npm run dev
```

Puis ouvrir le lien (généralement [http://localhost:5173](http://localhost:5173)).

Pour un build de production :

```bash
npm run build
npm run preview
```

---

## 📂 Architecture du projet

```
src/
 ├── App.tsx                # Navigation simple entre les écrans
 ├── main.tsx               # Point d'entrée React
 ├── styles.css             # Styles globaux (HUD, panneaux, modales...)
 │
 ├── screens/               # Composants React pour chaque "écran"
 │    ├── Menu.tsx          # Menu principal (Jouer, sections à venir)
 │    ├── Placeholder.tsx   # Écran générique "à venir"
 │    └── GameScreen.tsx    # Écran du jeu (HUD + canvas + interactions)
 │
 └── td/                    # "Moteur" Tower Defense (indépendant de React)
      ├── core/             
      │    ├── types.ts     # Définitions de types (Tower, Enemy, Bullet, GameState)
      │    └── Game.ts      # Boucle principale (raf → update + render)
      │
      ├── state/
      │    └── level.ts     # Génération du niveau (grille, chemin, valeurs de base)
      │
      └── systems/
           ├── render.ts    # Rendu Canvas (grille, tours, ennemis, projectiles)
           └── update.ts    # Logique du jeu (déplacement, tirs, collisions, vagues)
```

---

## 🧩 Comment ça marche ?

### Boucle de jeu
- `Game.ts` crée une boucle `requestAnimationFrame`.
- Chaque frame :
  1. Calcule `dt` (temps écoulé en secondes, ajusté par `timeScale` pour ×1/×1.5/×2).
  2. Appelle `update(state, dt)` → logique du jeu.
  3. Appelle `render(ctx, state)` → dessine la scène.

### GameState
L’objet central `GameState` contient **toute la partie** :  
- Grille (`grid`), chemin (`path`)  
- Tours (`towers`), ennemis (`enemies`), projectiles (`bullets`)  
- Ressources joueur (`gold`, `life`)  
- État global (`wave`, `running`, `timeScale`)  

👉 **React n’est pas utilisé pour chaque frame** (trop lourd).  
React ne gère que : HUD, boutons, modales et événements (clics, touches).

### Placement de tours
- Dans `GameScreen.tsx`, clic/touch sur une case herbe → ouvre la modale.
- Choix Mage/Combat → on ajoute un objet `Tower` dans `state.towers`.
- `update.ts` s’occupe de la cadence, des tirs et des dégâts.

### Ennemis
- `spawnWave(state)` génère une vague d’ennemis (nombre, vie, vitesse augmentent).
- Chaque ennemi suit le chemin cellule par cellule.
- Arrivé à la fin → enlève 1 point de vie au joueur.

---

## ⚡ Fonctionnalités actuelles

✅ Menu principal  
✅ Écran de jeu avec HUD (❤️ vie, 🪙 or, Wave)  
✅ Pause / Play  
✅ Vitesse ×1 / ×1.5 / ×2  
✅ Placement obligatoire de 6 tours au début  
✅ Tours Mage 🧙‍♂️ et Combat 🛡️ avec stats et coûts différents  
✅ Gain d’or par ennemi tué  
✅ Déploiement auto Netlify

---

## 🔮 Pistes d’amélioration

- **Économie** : coûts d’upgrade, vente de tours, récompenses variables.
- **Tours** : ajouter de nouveaux types (archer, canon, ralentisseur...).
- **Ennemis** : différents types (rapide, tank, volant).
- **Interface** : icônes pour boutons Pause/Vitesse, compteur `2/5` pour les vagues.
- **Progression** : niveaux multiples, difficulté croissante.
- **Sauvegarde** : persistance en LocalStorage.
- **Mobile** : meilleure adaptation tactile (zoom, drag, boutons optimisés).

---

## 🛠️ Notes techniques

- **Typescript strict** : aide à éviter les erreurs de typage.
- **Canvas 2D** : léger et suffisant pour ce jeu.
- **Mutations directes** sur `state` : volontaire, pour performance.  
  React n’est pas notifié de chaque frame → mais HUD et UI restent cohérents.
- **Styles.css** : simple mais organisé pour pouvoir facilement customiser (thème, couleurs, tailles...).

---

## 🌐 Déploiement Netlify

- Branch principale : `main`  
- Commande de build : `npm run build`  
- Dossier de publication : `dist`  

Un fichier `netlify.toml` peut être ajouté pour verrouiller la config :

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

✍️ **Astuce pour contribuer** :  
- Ajoute un nouveau type de tour → définir ses stats dans `placeTower` (GameScreen.tsx) + adapter rendu si besoin.  
- Modifier le chemin → dans `createLevel()` (`level.ts`).  
- Équilibrer la difficulté → ajuster `spawnWave()` (`update.ts`).  
