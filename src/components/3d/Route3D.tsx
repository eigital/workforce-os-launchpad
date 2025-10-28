import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getSpringConfig } from '@/lib/3d-utils';

interface Route3DProps {
  children: ReactNode;
}

/**
 * Route3D Wrapper Component
 * Provides 3D page transition animations with spring physics
 */
export function Route3D({ children }: Route3DProps) {
  const location = useLocation();
  const springConfig = getSpringConfig();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{
          opacity: 0,
          rotateX: -5,
          translateZ: -50,
        }}
        animate={{
          opacity: 1,
          rotateX: 0,
          translateZ: 0,
        }}
        exit={{
          opacity: 0,
          rotateX: 5,
          translateZ: -50,
        }}
        transition={springConfig}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1100px',
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
