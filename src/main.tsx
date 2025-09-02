/**
 * Point d'entrée React de l'application.
 * - Monte <App /> dans la div #root de index.html
 * - Charge la feuille de styles globale.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* React.StrictMode aide à détecter les erreurs en dev (double appel de certains effets) */}
    <App />
  </React.StrictMode>,
);
