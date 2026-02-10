import { motion, AnimatePresence } from 'framer-motion';

interface GlitchEffectProps {
  trigger: number;
}

/**
 * Full-screen glitch/static effect triggered on errors.
 * RGB split + noise bars + chromatic aberration.
 */
export function GlitchEffect({ trigger }: GlitchEffectProps) {
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <motion.div
          key={`glitch-${trigger}`}
          className="fixed inset-0 pointer-events-none z-[45]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* RGB split bars */}
          {Array.from({ length: 6 }).map((_, i) => {
            const top = Math.random() * 100;
            const height = 2 + Math.random() * 8;
            const color = ['rgba(255,0,0,0.15)', 'rgba(0,255,0,0.1)', 'rgba(0,0,255,0.15)'][i % 3];
            const offsetX = (Math.random() - 0.5) * 20;

            return (
              <motion.div
                key={i}
                className="absolute left-0 right-0"
                style={{
                  top: `${top}%`,
                  height: `${height}px`,
                  backgroundColor: color,
                  transform: `translateX(${offsetX}px)`,
                }}
                initial={{ opacity: 1, scaleX: 1 }}
                animate={{ opacity: 0, scaleX: [1, 1.5, 0.5, 1] }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* Noise static overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay',
            }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Red tint */}
          <motion.div
            className="absolute inset-0 bg-hd-red/5"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
