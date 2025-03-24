import React, { useEffect, useCallback } from 'react';

export type ArrowDirection = 'up' | 'down' | 'left' | 'right';

export interface ArrowKeyEvent {
  direction: ArrowDirection;
  event: KeyboardEvent;
}

export interface ArrowKeyControlsProps {
  onArrowKeyPress?: (keyEvent: ArrowKeyEvent) => void;
  onArrowKeyDown?: (keyEvent: ArrowKeyEvent) => void;
  onArrowKeyUp?: (keyEvent: ArrowKeyEvent) => void;
  enabled?: boolean;
}

export const ArrowKeyControls: React.FC<ArrowKeyControlsProps> = ({
  onArrowKeyPress,
  onArrowKeyDown,
  onArrowKeyUp,
  enabled = true,
}) => {
  const handleKeyEvent = useCallback(
    (eventType: 'keydown' | 'keyup' | 'keypress', event: KeyboardEvent) => {
      if (!enabled) return;

      let direction: ArrowDirection | null = null;

      switch (event.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        default:
          return; // Not an arrow key, ignore
      }

      // Create the event object
      const arrowKeyEvent: ArrowKeyEvent = {
        direction,
        event,
      };

      // Call the appropriate callback
      if (eventType === 'keydown' && onArrowKeyDown) {
        onArrowKeyDown(arrowKeyEvent);
      } else if (eventType === 'keyup' && onArrowKeyUp) {
        onArrowKeyUp(arrowKeyEvent);
      } else if (eventType === 'keypress' && onArrowKeyPress) {
        onArrowKeyPress(arrowKeyEvent);
      }
    },
    [enabled, onArrowKeyDown, onArrowKeyPress, onArrowKeyUp]
  );

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => handleKeyEvent('keydown', e);
    const handleKeyUp = (e: KeyboardEvent) => handleKeyEvent('keyup', e);
    const handleKeyPress = (e: KeyboardEvent) => handleKeyEvent('keypress', e);

    if (onArrowKeyDown) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    if (onArrowKeyUp) {
      window.addEventListener('keyup', handleKeyUp);
    }
    
    if (onArrowKeyPress) {
      window.addEventListener('keypress', handleKeyPress);
    }

    // Clean up
    return () => {
      if (onArrowKeyDown) {
        window.removeEventListener('keydown', handleKeyDown);
      }
      
      if (onArrowKeyUp) {
        window.removeEventListener('keyup', handleKeyUp);
      }
      
      if (onArrowKeyPress) {
        window.removeEventListener('keypress', handleKeyPress);
      }
    };
  }, [enabled, handleKeyEvent, onArrowKeyDown, onArrowKeyPress, onArrowKeyUp]);

  // This component doesn't render anything
  return null;
};

// Hook version for functional components
export const useArrowKeys = (
  callbacks: {
    onArrowKeyDown?: (keyEvent: ArrowKeyEvent) => void;
    onArrowKeyUp?: (keyEvent: ArrowKeyEvent) => void;
    onArrowKeyPress?: (keyEvent: ArrowKeyEvent) => void;
  },
  enabled = true
) => {
  const { onArrowKeyDown, onArrowKeyUp, onArrowKeyPress } = callbacks;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!onArrowKeyDown) return;
      
      let direction: ArrowDirection | null = null;
      
      switch (event.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        default:
          return; // Not an arrow key, ignore
      }
      
      onArrowKeyDown({ direction, event });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!onArrowKeyUp) return;
      
      let direction: ArrowDirection | null = null;
      
      switch (event.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        default:
          return; // Not an arrow key, ignore
      }
      
      onArrowKeyUp({ direction, event });
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (!onArrowKeyPress) return;
      
      let direction: ArrowDirection | null = null;
      
      switch (event.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        default:
          return; // Not an arrow key, ignore
      }
      
      onArrowKeyPress({ direction, event });
    };

    if (onArrowKeyDown) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    if (onArrowKeyUp) {
      window.addEventListener('keyup', handleKeyUp);
    }
    
    if (onArrowKeyPress) {
      window.addEventListener('keypress', handleKeyPress);
    }

    // Clean up
    return () => {
      if (onArrowKeyDown) {
        window.removeEventListener('keydown', handleKeyDown);
      }
      
      if (onArrowKeyUp) {
        window.removeEventListener('keyup', handleKeyUp);
      }
      
      if (onArrowKeyPress) {
        window.removeEventListener('keypress', handleKeyPress);
      }
    };
  }, [enabled, onArrowKeyDown, onArrowKeyUp, onArrowKeyPress]);
};

// Class version for those who prefer class components
export class ArrowKeyController {
  private enabled: boolean;
  private onArrowKeyDown?: (keyEvent: ArrowKeyEvent) => void;
  private onArrowKeyUp?: (keyEvent: ArrowKeyEvent) => void;
  private onArrowKeyPress?: (keyEvent: ArrowKeyEvent) => void;

  constructor(options: {
    onArrowKeyDown?: (keyEvent: ArrowKeyEvent) => void;
    onArrowKeyUp?: (keyEvent: ArrowKeyEvent) => void;
    onArrowKeyPress?: (keyEvent: ArrowKeyEvent) => void;
    enabled?: boolean;
  }) {
    this.enabled = options.enabled ?? true;
    this.onArrowKeyDown = options.onArrowKeyDown;
    this.onArrowKeyUp = options.onArrowKeyUp;
    this.onArrowKeyPress = options.onArrowKeyPress;
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  start() {
    if (!this.enabled) return;

    if (this.onArrowKeyDown) {
      window.addEventListener('keydown', this.handleKeyDown);
    }
    
    if (this.onArrowKeyUp) {
      window.addEventListener('keyup', this.handleKeyUp);
    }
    
    if (this.onArrowKeyPress) {
      window.addEventListener('keypress', this.handleKeyPress);
    }
  }

  stop() {
    if (this.onArrowKeyDown) {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
    
    if (this.onArrowKeyUp) {
      window.removeEventListener('keyup', this.handleKeyUp);
    }
    
    if (this.onArrowKeyPress) {
      window.removeEventListener('keypress', this.handleKeyPress);
    }
  }

  setEnabled(enabled: boolean) {
    if (this.enabled === enabled) return;
    
    this.enabled = enabled;
    
    if (enabled) {
      this.start();
    } else {
      this.stop();
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.enabled || !this.onArrowKeyDown) return;
    this.processArrowKey(event, this.onArrowKeyDown);
  }

  private handleKeyUp(event: KeyboardEvent) {
    if (!this.enabled || !this.onArrowKeyUp) return;
    this.processArrowKey(event, this.onArrowKeyUp);
  }

  private handleKeyPress(event: KeyboardEvent) {
    if (!this.enabled || !this.onArrowKeyPress) return;
    this.processArrowKey(event, this.onArrowKeyPress);
  }

  private processArrowKey(event: KeyboardEvent, callback: (keyEvent: ArrowKeyEvent) => void) {
    let direction: ArrowDirection | null = null;
    
    switch (event.key) {
      case 'ArrowUp':
        direction = 'up';
        break;
      case 'ArrowDown':
        direction = 'down';
        break;
      case 'ArrowLeft':
        direction = 'left';
        break;
      case 'ArrowRight':
        direction = 'right';
        break;
      default:
        return; // Not an arrow key, ignore
    }
    
    callback({ direction, event });
  }
}

export default ArrowKeyControls; 