# Stratagem Hero

> Entraineur de combos de stratagemes Helldivers 2 — 11 modes de jeu, succes, classements, stats et OST officiel. PWA jouable hors-ligne.

<br>

## Demarrage rapide

```bash
npm install
npm run dev
```

| Commande | |
|---|---|
| `npm run dev` | Serveur de dev (HMR) |
| `npm run build` | Type check + build prod |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitaires |
| `npm run test:coverage` | Couverture de code |
| `npm run preview` | Preview du build |

<br>

## Stack

React 19 · TypeScript 5.9 (strict) · Vite 7 · Tailwind CSS 4 · Zustand 5 · Framer Motion 12 · Vitest · vite-plugin-pwa

<br>

## Modes de jeu

| Mode | Description |
|---|---|
| Entrainement Libre | Sans chrono, selection libre |
| Contre-la-Montre | Max de combos en temps limite |
| Precision | N combos avec precision max |
| Survie | Chrono decroissant, erreur = game over |
| Quiz | Combos de memoire, 3 vies |
| Defi du Jour | Meme defi pour tous, 1 tentative/jour |
| Speed Run | 61 stratagemes le plus vite possible |
| Infini | Timer reset par combo, erreurs = -3s |
| Categorie | Maitriser une categorie entiere |
| Boss Rush | Boss tous les 10 combos |
| Personnalise | Regles custom, presets, partage URL |

<br>

## Fonctionnalites

- 61 stratagemes avec icones SVG authentiques HD2
- 50 succes deblocables
- Classements locaux par mode
- Stats detaillees + historique de sessions + export/import JSON
- Support manette (deadzone configurable)
- Raccourcis clavier personnalisables
- Modes daltonien, haut contraste, mouvement reduit
- Tutoriel interactif
- Musique et SFX (OST HD2)
- PWA installable, jouable offline

<br>

## Structure

```
src/
  components/    Composants React (game, ui, layout, achievements, ...)
  hooks/         useGameLogic, useStratagemInput, useAudio, useTimer, ...
  stores/        Zustand — settings, stats, leaderboard, achievements, custom
  data/          61 stratagemes, 50 succes, categories
  config/        Configuration par mode de jeu
  types/         Types TypeScript
  utils/         Scoring, storage, audio, export
  styles/        CSS globaux + accessibilite
public/
  icons/         65 icones SVG HD2
  images/        Backgrounds
  audio/         OST + SFX
```

<br>

## Deploiement

Push sur `master` → deploy automatique sur **Vercel**.

<br>

## Licence

Projet personnel. Helldivers 2 est une marque d'Arrowhead Game Studios / Sony Interactive Entertainment.
