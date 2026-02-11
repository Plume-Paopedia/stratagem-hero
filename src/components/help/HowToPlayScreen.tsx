import { Button } from '../ui/Button';

interface HowToPlayScreenProps {
  onClose: () => void;
}

const sections = [
  {
    title: 'Controls',
    items: [
      { keys: 'W / \u2191', action: 'Up direction' },
      { keys: 'A / \u2190', action: 'Left direction' },
      { keys: 'S / \u2193', action: 'Down direction' },
      { keys: 'D / \u2192', action: 'Right direction' },
      { keys: 'ESC', action: 'Quit / Pause' },
      { keys: 'R', action: 'Quick Restart' },
      { keys: 'Gamepad D-Pad', action: 'All directions' },
    ],
  },
  {
    title: 'Game Modes',
    items: [
      { keys: 'Free Practice', action: 'Pick stratagems and practice at your own pace. No timer.' },
      { keys: 'Time Attack', action: 'Score as many combos as possible in 60/90/120 seconds.' },
      { keys: 'Accuracy', action: 'Complete a set number of combos with maximum precision.' },
      { keys: 'Survival', action: 'One mistake = game over. Timer shrinks as you progress.' },
      { keys: 'Quiz', action: 'Only the name is shown. Enter combos from memory. 3 lives.' },
      { keys: 'Daily Challenge', action: 'Same sequence for everyone each day. One attempt!' },
      { keys: 'Speed Run', action: 'All 61 stratagems. Errors add +2s penalty.' },
      { keys: 'Endless', action: '10s timer resets on success. Errors subtract 3s.' },
      { keys: 'Category', action: 'Pick a category and race the clock.' },
      { keys: 'Boss Rush', action: 'Every 10 combos = boss (x2 points, shorter timer).' },
      { keys: 'Custom', action: 'Build your own rules, save presets, share via URL.' },
    ],
  },
  {
    title: 'Scoring',
    items: [
      { keys: 'Base Score', action: 'Points per combo based on speed and combo length.' },
      { keys: 'Streak x2-x5', action: 'Consecutive successes multiply your score.' },
      { keys: 'Speed Bonus', action: 'Complete combos under 1 second for extra points.' },
      { keys: 'Boss Bonus', action: 'x2 points during Boss Rush boss combos.' },
    ],
  },
  {
    title: 'Tips',
    items: [
      { keys: '\u{1F3AF}', action: 'Focus on accuracy first, speed will come naturally.' },
      { keys: '\u{1F525}', action: 'Keep your streak alive for massive score multipliers.' },
      { keys: '\u{1F4DA}', action: 'Use Quiz mode to memorize combos without visual cues.' },
      { keys: '\u26A1', action: 'Practice your weakest stratagems in Free Practice.' },
      { keys: '\u{1F3C6}', action: '50 achievements to unlock across 6 categories.' },
    ],
  },
];

export function HowToPlayScreen({ onClose }: HowToPlayScreenProps) {
  return (
    <div className="h-full flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-hd-yellow uppercase tracking-wider">
          How to Play
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>Back</Button>
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
