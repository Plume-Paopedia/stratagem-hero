import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from '../ui/Button';
import { KeybindEditor } from './KeybindEditor';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const settings = useSettingsStore();
  const [showKeybinds, setShowKeybinds] = useState(false);

  if (showKeybinds) {
    return <KeybindEditor onBack={() => setShowKeybinds(false)} />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto w-full p-6">
      <h2 className="font-display text-2xl text-hd-yellow uppercase tracking-wider">Settings</h2>

      {/* Volume */}
      <div className="flex flex-col gap-2">
        <label className="font-heading text-sm text-hd-gray uppercase tracking-wider">
          Master Volume: {settings.masterVolume}%
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.masterVolume}
          onChange={(e) => settings.setVolume(Number(e.target.value))}
          className="w-full accent-hd-yellow"
        />
      </div>

      {/* SFX Toggle */}
      <ToggleRow
        label="Sound Effects"
        value={settings.sfxEnabled}
        onChange={settings.toggleSfx}
      />

      {/* Music Toggle */}
      <ToggleRow
        label="Music"
        value={settings.musicEnabled}
        onChange={settings.toggleMusic}
      />

      {/* Music Volume */}
      {settings.musicEnabled && (
        <div className="flex flex-col gap-2">
          <label className="font-heading text-sm text-hd-gray uppercase tracking-wider">
            Music Volume: {settings.musicVolume}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.musicVolume}
            onChange={(e) => settings.setMusicVol(Number(e.target.value))}
            className="w-full accent-hd-yellow"
          />
        </div>
      )}

      {/* Colorblind mode */}
      <div className="flex flex-col gap-2">
        <label className="font-heading text-sm text-hd-gray uppercase tracking-wider">
          Colorblind Mode
        </label>
        <div className="flex gap-2 flex-wrap">
          {([
            { value: 'default', label: 'Default' },
            { value: 'protanopia', label: 'Protanopia' },
            { value: 'deuteranopia', label: 'Deuteranopia' },
            { value: 'tritanopia', label: 'Tritanopia' },
          ] as const).map((opt) => (
            <Button
              key={opt.value}
              variant={settings.colorblindMode === opt.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => settings.setColorblindMode(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* High contrast */}
      <ToggleRow
        label="High Contrast"
        value={settings.highContrastMode}
        onChange={settings.toggleHighContrast}
      />

      {/* Reduced motion */}
      <ToggleRow
        label="Reduced Motion"
        value={settings.reducedMotion}
        onChange={settings.toggleReducedMotion}
      />

      {/* Gamepad deadzone */}
      <div className="flex flex-col gap-2">
        <label className="font-heading text-sm text-hd-gray uppercase tracking-wider">
          Gamepad Deadzone: {(settings.gamepadDeadzone * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min={10}
          max={80}
          value={settings.gamepadDeadzone * 100}
          onChange={(e) => settings.setGamepadDeadzone(Number(e.target.value) / 100)}
          className="w-full accent-hd-yellow"
        />
      </div>

      {/* Time Attack Duration */}
      <div className="flex flex-col gap-2">
        <label className="font-heading text-sm text-hd-gray uppercase tracking-wider">
          Time Attack Duration
        </label>
        <div className="flex gap-2">
          {[60, 90, 120].map((d) => (
            <Button
              key={d}
              variant={settings.timeAttackDuration === d ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => settings.setTimeAttackDuration(d)}
            >
              {d}s
            </Button>
          ))}
        </div>
      </div>

      {/* Accuracy Target */}
      <div className="flex flex-col gap-2">
        <label className="font-heading text-sm text-hd-gray uppercase tracking-wider">
          Accuracy Challenge Target
        </label>
        <div className="flex gap-2">
          {[20, 50, 100].map((n) => (
            <Button
              key={n}
              variant={settings.accuracyTargetCount === n ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => settings.setAccuracyTargetCount(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      </div>

      {/* Keybinds */}
      <Button variant="secondary" onClick={() => setShowKeybinds(true)}>
        Configure Key Bindings
      </Button>

      {/* Reset */}
      <Button variant="danger" size="sm" onClick={settings.resetToDefaults}>
        Reset to Defaults
      </Button>

      <Button variant="ghost" onClick={onClose}>
        Back
      </Button>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-heading text-sm text-hd-gray uppercase tracking-wider">{label}</span>
      <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
          value ? 'bg-hd-yellow' : 'bg-hd-border'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
