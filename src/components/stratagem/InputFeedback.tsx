import { motion, AnimatePresence } from 'framer-motion';

interface InputFeedbackProps {
  successTrigger: number;
  errorTrigger: number;
  multiplier?: number;
}

export function InputFeedback({ successTrigger, errorTrigger, multiplier = 1 }: InputFeedbackProps) {
  const m = Math.min(multiplier, 4);

  const successOpacity = m === 1 ? 0.4 : m === 2 ? 0.5 : m === 3 ? 0.6 : 0.7;
  const successDuration = m === 1 ? 0.25 : m === 2 ? 0.3 : m === 3 ? 0.35 : 0.4;
  const successBg = m >= 4
    ? 'bg-white/15'
    : m >= 3
      ? 'bg-hd-yellow/12'
      : m >= 2
        ? 'bg-hd-yellow/10'
        : 'bg-hd-yellow/8';

  return (
    <>
      <AnimatePresence>
        {successTrigger > 0 && (
          <motion.div
            key={`success-${successTrigger}`}
            className={`fixed inset-0 pointer-events-none z-30 ${successBg}`}
            initial={{ opacity: successOpacity }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: successDuration }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successTrigger > 0 && m >= 4 && (
          <motion.div
            key={`whiteflash-${successTrigger}`}
            className="fixed inset-0 pointer-events-none z-30 bg-white/20"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successTrigger > 0 && m >= 3 && (
          <motion.div
            key={`vignette-${successTrigger}`}
            className="fixed inset-0 pointer-events-none z-30"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(245,197,24,0.12) 100%)',
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorTrigger > 0 && (
          <motion.div
            key={`error-${errorTrigger}`}
            className="fixed inset-0 pointer-events-none z-40 bg-hd-red/10"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
