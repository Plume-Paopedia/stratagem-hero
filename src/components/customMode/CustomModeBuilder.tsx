import { useState, useCallback } from 'react';
import type { CustomModeConfig } from '../../types/customMode';
import type { StratagemCategory, StratagemTier } from '../../types';
import { categories } from '../../data/stratagems';
import { defaultConfig, useCustomModeStore } from '../../stores/customModeStore';
import { getShareUrl } from '../../utils/customModeEncoding';
import { Button } from '../ui/Button';
import { PresetLibrary } from './PresetLibrary';

interface CustomModeBuilderProps {
  onStart: (config: CustomModeConfig) => void;
  onClose: () => void;
  initialConfig?: CustomModeConfig;
}

export function CustomModeBuilder({ onStart, onClose, initialConfig }: CustomModeBuilderProps) {
  const [config, setConfig] = useState<CustomModeConfig>(initialConfig ?? { ...defaultConfig });
  const [tab, setTab] = useState<'timer' | 'rules' | 'queue' | 'presets'>('timer');
  const [copied, setCopied] = useState(false);
  const savePreset = useCustomModeStore((s) => s.savePreset);

  const update = useCallback(<K extends keyof CustomModeConfig>(key: K, val: CustomModeConfig[K]) => {
    setConfig((c) => ({ ...c, [key]: val }));
  }, []);

  const handleShare = useCallback(() => {
    const url = getShareUrl(config);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [config]);

  const handleSave = useCallback(() => {
    savePreset(config);
  }, [config, savePreset]);

  const handleLoadPreset = useCallback((loaded: CustomModeConfig) => {
    setConfig(loaded);
    setTab('timer');
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-hd-yellow uppercase tracking-wider">
          Mode Personnalise
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Retour</Button>
        </div>
      </div>

      <input
        type="text"
        value={config.name}
        onChange={(e) => update('name', e.target.value)}
        maxLength={30}
        className="bg-hd-dark border border-hd-border rounded px-3 py-2 text-hd-white font-heading text-sm focus:border-hd-yellow outline-none"
        placeholder="Nom du mode..."
      />

      <div className="flex gap-1">
        {(['timer', 'rules', 'queue', 'presets'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-heading uppercase tracking-wider rounded cursor-pointer transition-colors ${
              tab === t ? 'bg-hd-yellow/10 text-hd-yellow border border-hd-yellow' : 'text-hd-gray border border-hd-border hover:text-hd-white'
            }`}
          >
            {{ timer: 'chrono', rules: 'regles', queue: 'file', presets: 'presets' }[t]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'timer' && (
          <div className="flex flex-col gap-4">
            <FieldGroup label="Type de Chrono">
              <RadioGroup
                value={config.timerType}
                onChange={(v) => update('timerType', v as CustomModeConfig['timerType'])}
                options={[
                  { value: 'none', label: 'Pas de Chrono' },
                  { value: 'countdown', label: 'Compte a Rebours' },
                  { value: 'countup', label: 'Chrono Croissant' },
                  { value: 'survival', label: 'Survie (reset)' },
                ]}
              />
            </FieldGroup>
            {(config.timerType === 'countdown' || config.timerType === 'survival') && (
              <FieldGroup label={`Duree : ${config.timerDuration}s`}>
                <input
                  type="range"
                  min={5}
                  max={300}
                  step={5}
                  value={config.timerDuration}
                  onChange={(e) => update('timerDuration', Number(e.target.value))}
                  className="w-full accent-hd-yellow"
                />
              </FieldGroup>
            )}
            <FieldGroup label={`Multiplicateur de Score : ${config.scoreMultiplier}x`}>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.25}
                value={config.scoreMultiplier}
                onChange={(e) => update('scoreMultiplier', Number(e.target.value))}
                className="w-full accent-hd-yellow"
              />
            </FieldGroup>
          </div>
        )}

        {tab === 'rules' && (
          <div className="flex flex-col gap-4">
            <FieldGroup label={`Vies : ${config.lives === 0 ? 'Illimitees' : config.lives}`}>
              <input
                type="range"
                min={0}
                max={5}
                value={config.lives}
                onChange={(e) => update('lives', Number(e.target.value))}
                className="w-full accent-hd-yellow"
              />
            </FieldGroup>
            <FieldGroup label="En Cas d'Erreur">
              <RadioGroup
                value={config.errorBehavior}
                onChange={(v) => update('errorBehavior', v as CustomModeConfig['errorBehavior'])}
                options={[
                  { value: 'reset-streak', label: 'Reset Serie' },
                  { value: 'lose-life', label: 'Perdre une Vie' },
                  { value: 'time-penalty', label: 'Penalite de Temps' },
                  { value: 'end-game', label: 'Game Over' },
                ]}
              />
            </FieldGroup>
            {config.errorBehavior === 'time-penalty' && (
              <FieldGroup label={`Penalite : ${(config.timePenaltyMs / 1000).toFixed(1)}s`}>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={500}
                  value={config.timePenaltyMs}
                  onChange={(e) => update('timePenaltyMs', Number(e.target.value))}
                  className="w-full accent-hd-yellow"
                />
              </FieldGroup>
            )}
          </div>
        )}

        {tab === 'queue' && (
          <div className="flex flex-col gap-4">
            <FieldGroup label="Source des Stratagemes">
              <RadioGroup
                value={config.queueSource}
                onChange={(v) => update('queueSource', v as CustomModeConfig['queueSource'])}
                options={[
                  { value: 'all', label: 'Tous les Stratagemes' },
                  { value: 'category', label: 'Par Categorie' },
                  { value: 'tier', label: 'Par Tier' },
                ]}
              />
            </FieldGroup>
            {config.queueSource === 'category' && (
              <FieldGroup label="Categorie">
                <select
                  value={config.category ?? ''}
                  onChange={(e) => update('category', e.target.value as StratagemCategory)}
                  className="bg-hd-dark border border-hd-border rounded px-3 py-2 text-hd-white font-heading text-sm focus:border-hd-yellow outline-none w-full"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </FieldGroup>
            )}
            {config.queueSource === 'tier' && (
              <FieldGroup label="Tier">
                <RadioGroup
                  value={config.tier ?? 'basic'}
                  onChange={(v) => update('tier', v as StratagemTier)}
                  options={[
                    { value: 'basic', label: 'Basique' },
                    { value: 'advanced', label: 'Avance' },
                    { value: 'expert', label: 'Expert' },
                  ]}
                />
              </FieldGroup>
            )}
            <FieldGroup label={`Taille de la File : ${config.queueLength === 0 ? 'Tous' : config.queueLength}`}>
              <input
                type="range"
                min={0}
                max={61}
                value={config.queueLength}
                onChange={(e) => update('queueLength', Number(e.target.value))}
                className="w-full accent-hd-yellow"
              />
            </FieldGroup>
            <label className="flex items-center gap-2 text-sm text-hd-gray cursor-pointer">
              <input
                type="checkbox"
                checked={config.shuffle}
                onChange={(e) => update('shuffle', e.target.checked)}
                className="accent-hd-yellow"
              />
              <span className="font-heading">Melanger la file</span>
            </label>
          </div>
        )}

        {tab === 'presets' && (
          <PresetLibrary onLoad={handleLoadPreset} />
        )}
      </div>

      <div className="flex gap-2 border-t border-hd-border pt-3">
        <Button variant="primary" onClick={() => onStart(config)}>
          Jouer
        </Button>
        <Button variant="secondary" size="sm" onClick={handleSave}>
          Sauvegarder
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          {copied ? 'Copie !' : 'Partager l\'URL'}
        </Button>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-heading text-hd-gray uppercase tracking-wider mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function RadioGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-heading rounded border cursor-pointer transition-colors ${
            value === opt.value
              ? 'border-hd-yellow text-hd-yellow bg-hd-yellow/10'
              : 'border-hd-border text-hd-gray hover:text-hd-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
