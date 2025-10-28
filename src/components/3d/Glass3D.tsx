import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { getSpringConfig, getDepth, glassClasses } from '@/lib/3d-utils';

interface Glass3DProps {
  children: ReactNode;
  depth?: 'close' | 'medium' | 'far';
  hoverEffect?: boolean;
  className?: string;
  asChild?: boolean;
}

/**
 * Glass3D Component
 * Reusable wrapper that applies glass effect with 3D depth
 */
export function Glass3D({
  children,
  depth = 'close',
  hoverEffect = true,
  className,
}: Glass3DProps) {
  const springConfig = getSpringConfig();
  const depthValue = getDepth(depth);

  return (
    <motion.div
      initial={{ translateZ: 0 }}
      animate={{ translateZ: depthValue }}
      whileHover={
        hoverEffect
          ? {
              rotateX: 4,
              rotateY: 4,
              translateZ: depthValue + 8,
            }
          : undefined
      }
      transition={springConfig}
      style={{
        transformStyle: 'preserve-3d',
      }}
      className={cn(glassClasses.full, 'rounded-lg', className)}
    >
      {children}
    </motion.div>
  );
}
