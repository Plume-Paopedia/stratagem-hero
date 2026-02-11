import { motion } from 'framer-motion';
import type { CustomModeConfig } from '../../types/customMode';
import { useCustomModeStore } from '../../stores/customModeStore';

interface PresetLibraryProps {
  onLoad: (config: CustomModeConfig) => void;
}

export function PresetLibrary({ onLoad }: PresetLibraryProps) {
  const presets = useCustomModeStore((s) => s.presets);
  const deletePreset = useCustomModeStore((s) => s.deletePreset);

  if (presets.length === 0) {
    return (
      <div className="text-center py-8 text-hd-gray font-heading text-sm">
        No saved presets yet. Create one and hit "Save Preset"!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {presets.map((preset) => (
        <motion.div
          key={preset.id}
          whileHover={{ scale: 1.01 }}
          className="flex items-center justify-between p-3 bg-hd-dark border border-hd-border rounded-lg"
        >
          <div className="min-w-0">
            <div className="font-heading font-bold text-sm text-hd-white truncate">
              {preset.config.name}
            </div>
            <div className="text-xs text-hd-gray">
              {preset.config.timerType} | {preset.config.queueSource}
              {preset.config.lives > 0 ? ` | ${preset.config.lives} lives` : ''}
              {' | '}{new Date(preset.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="flex gap-1.5 flex-shrink-0 ml-2">
            <button
              onClick={() => onLoad(preset.config)}
              className="px-2 py-1 text-xs font-heading text-hd-yellow border border-hd-yellow/50 rounded hover:bg-hd-yellow/10 cursor-pointer transition-colors"
            >
              Load
            </button>
            <button
              onClick={() => deletePreset(preset.id)}
              className="px-2 py-1 text-xs font-heading text-hd-red border border-hd-red/50 rounded hover:bg-hd-red/10 cursor-pointer transition-colors"
            >
              Del
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
