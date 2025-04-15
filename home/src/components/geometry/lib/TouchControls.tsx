import React, { useEffect, useRef, useState } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeEvent {
  direction: SwipeDirection;
  distance: number;
  velocity: number;
}

export interface TouchControlsProps {
  onSwipe?: (swipeEvent: SwipeEvent) => void;
  enabled?: boolean;
  threshold?: number; // Minimum distance for a swipe to be recognized
  velocityThreshold?: number; // Minimum velocity for a swipe to be recognized
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onSwipe,
  enabled = true,
  threshold = 50,
  velocityThreshold = 0.3,
}) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isTouching, setIsTouching] = useState(false);

  useEffect(() => {
    if (!enabled || !onSwipe) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return; // Only handle single touch
      
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      setIsTouching(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default to avoid scrolling while swiping
      if (isTouching) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;
      
      // Determine if this was a swipe
      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        let direction: SwipeDirection;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          // Vertical swipe
          direction = deltaY > 0 ? 'down' : 'up';
        }
        
        // Only trigger if velocity is above threshold
        if (velocity > velocityThreshold) {
          onSwipe({
            direction,
            distance: Math.abs(deltaX) > Math.abs(deltaY) ? Math.abs(deltaX) : Math.abs(deltaY),
            velocity,
          });
        }
      }
      
      touchStartRef.current = null;
      setIsTouching(false);
    };

    const handleTouchCancel = () => {
      touchStartRef.current = null;
      setIsTouching(false);
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);

    // Clean up
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [enabled, onSwipe, threshold, velocityThreshold, isTouching]);

  // This component doesn't render anything
  return null;
};

// Hook version for functional components
export const useTouchControls = (
  callbacks: {
    onSwipe?: (swipeEvent: SwipeEvent) => void;
  },
  options: {
    enabled?: boolean;
    threshold?: number;
    velocityThreshold?: number;
  } = {}
) => {
  const { onSwipe } = callbacks;
  const { enabled = true, threshold = 50, velocityThreshold = 0.3 } = options;
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isTouching, setIsTouching] = useState(false);

  useEffect(() => {
    if (!enabled || !onSwipe) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return; // Only handle single touch
      
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      setIsTouching(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default to avoid scrolling while swiping
      if (isTouching) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;
      
      // Determine if this was a swipe
      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        let direction: SwipeDirection;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          // Vertical swipe
          direction = deltaY > 0 ? 'down' : 'up';
        }
        
        // Only trigger if velocity is above threshold
        if (velocity > velocityThreshold) {
          onSwipe({
            direction,
            distance: Math.abs(deltaX) > Math.abs(deltaY) ? Math.abs(deltaX) : Math.abs(deltaY),
            velocity,
          });
        }
      }
      
      touchStartRef.current = null;
      setIsTouching(false);
    };

    const handleTouchCancel = () => {
      touchStartRef.current = null;
      setIsTouching(false);
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);

    // Clean up
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [enabled, onSwipe, threshold, velocityThreshold, isTouching]);
};

export default TouchControls; 