import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/3d-utils';

/**
 * PointerGlow Component
 * Renders a radial gradient spotlight that follows the cursor
 */
export function PointerGlow() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const mouseX = useSpring(0, { stiffness: 150, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 150, damping: 30 });

  useEffect(() => {
    setMounted(true);
    if (prefersReducedMotion()) return;

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  if (!mounted || prefersReducedMotion()) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      <motion.div
        className="absolute h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: mouseX,
          top: mouseY,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
    </motion.div>
  );
}
