import { motion } from 'framer-motion';
import type { GameMode } from '../../types';

const gameModes: { id: GameMode; name: string; icon: string; desc: string }[] = [
  { id: 'free-practice', name: 'Entrainement Libre', icon: '\u{1F3CB}\uFE0F', desc: 'Pratiquez a votre rythme. Pas de chrono, pas de pression.' },
  { id: 'time-attack', name: 'Contre-la-Montre', icon: '\u23F1\uFE0F', desc: 'Marquez un max de combos avant la fin du temps.' },
  { id: 'accuracy', name: 'Defi Precision', icon: '\u{1F3AF}', desc: 'Completez un nombre defini de combos avec un max de precision.' },
  { id: 'survival', name: 'Survie', icon: '\u{1F525}', desc: 'Combos infinis avec un chrono qui retrecit. Une erreur = game over.' },
  { id: 'quiz', name: 'Quiz', icon: '\u{1F4DA}', desc: 'Entrez les combos de memoire. Seul le nom est affiche. 3 vies.' },
  { id: 'daily-challenge', name: 'Defi du Jour', icon: '\u{1F3B2}', desc: 'Meme defi pour tout le monde aujourd\'hui. Une seule tentative !' },
  { id: 'speed-run', name: 'Speed Run', icon: '\u{1F3C3}', desc: 'Completez les 61 stratagemes le plus vite possible. Erreurs = +2s.' },
  { id: 'endless', name: 'Infini', icon: '\u267E\uFE0F', desc: 'Le chrono se reinitialise a chaque succes. Erreurs = -3s.' },
  { id: 'category-challenge', name: 'Categorie', icon: '\u{1F4C2}', desc: 'Maitrisez une categorie. Choisissez votre specialite et battez le chrono.' },
  { id: 'boss-rush', name: 'Boss Rush', icon: '\u{1F480}', desc: 'Tous les 10 combos un boss apparait. Combos plus durs, points doubles.' },
  { id: 'custom', name: 'Personnalise', icon: '\u{1F6E0}\uFE0F', desc: 'Creez vos propres regles. Sauvegardez des presets. Partagez par URL.' },
];

export function MainMenu({ onModeSelect }: { onModeSelect: (mode: GameMode) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-5xl mb-3">&#x1F985;</div>
        <h1 className="font-display text-3xl md:text-4xl text-hd-yellow tracking-[0.3em] uppercase">
          Stratagem Hero
        </h1>
        <p className="font-heading text-hd-gray mt-2 tracking-wider uppercase text-sm">
          Entraineur de Combos Helldivers 2
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {gameModes.map((mode, i) => (
          <motion.button
            key={mode.id}
            onClick={() => onModeSelect(mode.id)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="flex flex-col items-start gap-2 p-5 bg-hd-panel border border-hd-border rounded-lg
                       hover:border-hd-yellow/50 transition-colors text-left cursor-pointer
                       hover:shadow-[0_0_20px_rgba(245,197,24,0.08)]"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{mode.icon}</span>
              <span className="font-heading font-bold text-hd-white uppercase tracking-wider">
                {mode.name}
              </span>
            </div>
            <p className="text-xs text-hd-gray leading-relaxed">{mode.desc}</p>
          </motion.button>
        ))}
      </motion.div>

      <div className="text-xs text-hd-gray/30 text-center font-heading uppercase tracking-wider md:hidden">
        Meilleure experience au clavier ou a la manette
      </div>
    </div>
  );
}
