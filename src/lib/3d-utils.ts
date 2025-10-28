/**
 * 3D Glassmorphic Utilities
 * Helper functions for 3D transformations and reduced motion detection
 */

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get spring config based on reduced motion preference
 */
export const getSpringConfig = (customConfig?: { stiffness?: number; damping?: number }) => {
  if (prefersReducedMotion()) {
    return { duration: 0.01 };
  }
  return {
    type: "spring",
    stiffness: customConfig?.stiffness || 300,
    damping: customConfig?.damping || 30,
  };
};

/**
 * Calculate depth value based on level
 */
export const getDepth = (level: 'close' | 'medium' | 'far' = 'close'): number => {
  const depths = {
    close: 24,
    medium: 48,
    far: 80,
  };
  return depths[level];
};

/**
 * Calculate light tracking position
 */
export const calculateLightPosition = (
  mouseX: number,
  mouseY: number,
  elementRect: DOMRect
): { x: number; y: number } => {
  const centerX = elementRect.left + elementRect.width / 2;
  const centerY = elementRect.top + elementRect.height / 2;
  
  const deltaX = (mouseX - centerX) / elementRect.width;
  const deltaY = (mouseY - centerY) / elementRect.height;
  
  return { x: deltaX * 10, y: deltaY * 10 };
};

/**
 * Get 3D transform string
 */
export const get3DTransform = (
  rotateX: number = 0,
  rotateY: number = 0,
  translateZ: number = 0
): string => {
  return `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
};

/**
 * Glass effect class names
 */
export const glassClasses = {
  base: 'backdrop-blur-[12px] bg-white/[0.08] dark:bg-white/[0.08] border border-white/[0.16]',
  hover: 'hover:bg-white/[0.12] dark:hover:bg-white/[0.12]',
  full: 'backdrop-blur-[12px] bg-white/[0.08] dark:bg-white/[0.08] border border-white/[0.16] hover:bg-white/[0.12] dark:hover:bg-white/[0.12]',
};
