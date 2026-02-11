import { Button } from '../ui/Button';

interface HowToPlayScreenProps {
  onClose: () => void;
}

const sections = [
  {
    title: 'Controles',
    items: [
      { keys: 'W / \u2191', action: 'Direction haut' },
      { keys: 'A / \u2190', action: 'Direction gauche' },
      { keys: 'S / \u2193', action: 'Direction bas' },
      { keys: 'D / \u2192', action: 'Direction droite' },
      { keys: 'ESC', action: 'Quitter / Pause' },
      { keys: 'R', action: 'Rejouer vite' },
      { keys: 'Gamepad D-Pad', action: 'Toutes les directions' },
    ],
  },
  {
    title: 'Modes de Jeu',
    items: [
      { keys: 'Pratique Libre', action: 'Choisissez des stratagemes et entrainez-vous a votre rythme. Pas de chrono.' },
      { keys: 'Contre-la-Montre', action: 'Realisez un maximum de combos en 60/90/120 secondes.' },
      { keys: 'Precision', action: 'Completez un nombre defini de combos avec une precision maximale.' },
      { keys: 'Survie', action: 'Une erreur = fin de partie. Le chrono se reduit au fil du temps.' },
      { keys: 'Quiz', action: 'Seul le nom est affiche. Entrez les combos de memoire. 3 vies.' },
      { keys: 'Defi Quotidien', action: 'La meme sequence pour tout le monde chaque jour. Une seule tentative !' },
      { keys: 'Speed Run', action: 'Les 61 stratagemes. Les erreurs ajoutent +2s de penalite.' },
      { keys: 'Endless', action: 'Chrono de 10s reinitialise a chaque succes. Les erreurs retirent 3s.' },
      { keys: 'Categorie', action: 'Choisissez une categorie et affrontez le chrono.' },
      { keys: 'Boss Rush', action: 'Tous les 10 combos = boss (x2 points, chrono reduit).' },
      { keys: 'Personnalise', action: 'Creez vos propres regles, sauvegardez des presets, partagez via URL.' },
    ],
  },
  {
    title: 'Scoring',
    items: [
      { keys: 'Score de Base', action: 'Points par combo selon la vitesse et la longueur.' },
      { keys: 'Serie x2-x5', action: 'Les succes consecutifs multiplient votre score.' },
      { keys: 'Bonus Vitesse', action: 'Completez les combos en moins d\'1 seconde pour des points bonus.' },
      { keys: 'Bonus Boss', action: 'x2 points pendant les combos boss en Boss Rush.' },
    ],
  },
  {
    title: 'Astuces',
    items: [
      { keys: '\u{1F3AF}', action: 'Concentrez-vous d\'abord sur la precision, la vitesse viendra naturellement.' },
      { keys: '\u{1F525}', action: 'Maintenez votre serie pour des multiplicateurs de score massifs.' },
      { keys: '\u{1F4DA}', action: 'Utilisez le mode Quiz pour memoriser les combos sans indices visuels.' },
      { keys: '\u26A1', action: 'Entrainez-vous sur vos stratagemes les plus faibles en Pratique Libre.' },
      { keys: '\u{1F3C6}', action: '50 succes a debloquer dans 6 categories.' },
    ],
  },
];

export function HowToPlayScreen({ onClose }: HowToPlayScreenProps) {
  return (
    <div className="h-full flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-hd-yellow uppercase tracking-wider">
          Comment Jouer
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>Retour</Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="font-display text-sm text-hd-yellow uppercase tracking-wider mb-3 border-b border-hd-border pb-1">
              {section.title}
            </h3>
            <div className="space-y-1.5">
              {section.items.map((item, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="font-heading font-bold text-hd-white whitespace-nowrap min-w-[120px]">
                    {item.keys}
                  </span>
                  <span className="text-hd-gray">{item.action}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
