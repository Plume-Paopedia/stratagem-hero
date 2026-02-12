import { useState } from 'react';
import { motion } from 'framer-motion';

import { stratagems, categories } from '../../data/stratagems';
import { StratagemCard } from './StratagemCard';

interface StratagemGridProps {
  selected: Set<string>;
  onToggle: (id: string) => void;
  multiSelect?: boolean;
}

export function StratagemGrid({ selected, onToggle, multiSelect = true }: StratagemGridProps) {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = stratagems.filter((s) => {
    if (filter !== 'all' && s.category !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filter === 'all'
    ? categories
        .map((cat) => ({
          category: cat,
          items: filtered.filter((s) => s.category === cat),
        }))
        .filter((g) => g.items.length > 0)
    : [{ category: filter, items: filtered }];

  return (
    <div className="flex flex-col gap-4 h-full">
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-hd-dark border border-hd-border rounded px-4 py-2
                   font-body text-hd-white placeholder-hd-gray
                   focus:outline-none focus:border-hd-yellow/50"
      />

      <div className="flex gap-1 flex-wrap">
        <TabButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </TabButton>
        {categories.map((cat) => (
          <TabButton
            key={cat}
            active={filter === cat}
            onClick={() => setFilter(cat)}
          >
            {cat.replace('Patriotic Administration Center', 'Eagles')
              .replace('Orbital Cannons', 'Orbital')
              .replace('Engineering Bay', 'Weapons')
              .replace('Robotics Workshop', 'Sentries')
              .replace('General Stratagems', 'General')
              .replace('Mission Stratagems', 'Mission')}
          </TabButton>
        ))}
      </div>

      {multiSelect && (
        <div className="text-sm text-hd-gray font-heading">
          {selected.size} selectionne(s)
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {grouped.map(({ category, items }) => (
          <div key={category}>
            <h3 className="font-heading font-semibold text-hd-yellow/70 text-sm uppercase tracking-wider mb-3">
              {category}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {items.map((strat) => (
                <StratagemCard
                  key={strat.id}
                  stratagem={strat}
                  selected={selected.has(strat.id)}
                  onClick={() => onToggle(strat.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-3 py-1 text-xs font-heading uppercase tracking-wider rounded
        border transition-colors cursor-pointer
        ${active
          ? 'bg-hd-yellow/10 border-hd-yellow text-hd-yellow'
          : 'bg-transparent border-hd-border text-hd-gray hover:text-hd-white hover:border-hd-gray'
        }
      `}
    >
      {children}
    </motion.button>
  );
}
