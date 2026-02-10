import { motion, AnimatePresence } from 'framer-motion';

interface InputFeedbackProps {
  /** Increment to trigger success flash */
  successTrigger: number;
  /** Increment to trigger error flash */
  errorTrigger: number;
}

export function InputFeedback({ successTrigger, errorTrigger }: InputFeedbackProps) {
  return (
    <>
      <AnimatePresence>
        {successTrigger > 0 && (
          <motion.div
            key={`success-${successTrigger}`}
            className="fixed inset-0 pointer-events-none z-30 bg-hd-yellow/8"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
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
