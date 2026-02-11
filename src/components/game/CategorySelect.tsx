import { motion } from 'framer-motion';
import type { StratagemCategory } from '../../types';
import { categories } from '../../data/stratagems';
import { getByCategory } from '../../data/stratagems';
import { Button } from '../ui/Button';

interface CategorySelectProps {
  onSelect: (category: StratagemCategory) => void;
  onBack: () => void;
}

const categoryIcons: Record<StratagemCategory, string> = {
  'General Stratagems': '\u{1FA96}',
  'Patriotic Administration Center': '\u{2708}\uFE0F',
  'Orbital Cannons': '\u{1F6F0}\uFE0F',
  'Bridge': '\u{1F3AF}',
  'Engineering Bay': '\u{1F527}',
  'Robotics Workshop': '\u{1F916}',
  'Hangar': '\u{1F681}',
  'Mission Stratagems': '\u{1F4CB}',
};

export function CategorySelect({ onSelect, onBack }: CategorySelectProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="text-center">
        <h2 className="font-display text-xl text-hd-yellow uppercase tracking-wider">
          Defi Categorie
        </h2>
        <p className="text-sm text-hd-gray mt-1">Completez tous les stratagemes d'une categorie le plus vite possible</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
        {categories.map((cat, i) => {
          const count = getByCategory(cat).length;
          return (
            <motion.button
              key={cat}
              onClick={() => onSelect(cat)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-4 bg-hd-panel border border-hd-border rounded-lg
                         hover:border-hd-yellow/50 transition-colors text-left cursor-pointer"
            >
              <span className="text-2xl">{categoryIcons[cat]}</span>
              <div>
                <span className="font-heading font-bold text-hd-white uppercase tracking-wider text-sm block">
                  {cat}
                </span>
                <span className="text-xs text-hd-gray">{count} stratagemes</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <Button variant="ghost" size="sm" onClick={onBack}>
        Retour
      </Button>
    </div>
  );
}
