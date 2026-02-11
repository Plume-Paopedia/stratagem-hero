import { AnimatePresence, motion } from 'framer-motion';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-hd-yellow/10 border-b border-hd-yellow/30 px-4 py-2 text-center"
        >
          <span className="text-xs font-heading text-hd-yellow uppercase tracking-wider">
            You're offline — Your progress is saved locally
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
