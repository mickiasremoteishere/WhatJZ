import { useEffect, useCallback, useState, useRef } from 'react';
import { useExam } from '@/contexts/ExamContext';

interface UseAntiCheatOptions {
  onWarning: (message: string) => void;
  onDisqualify: () => void;
  onScreenshotAttempt?: () => void;
  maxWarnings?: number;
}

export const useAntiCheat = ({ 
  onWarning, 
  onDisqualify, 
  onScreenshotAttempt,
  maxWarnings = 2 
}: UseAntiCheatOptions) => {
  const { isExamMode, recordCheatEvent, getWarningCount } = useExam();
  const [isDisqualified, setIsDisqualified] = useState(false);
  const lastScreenshotTime = useRef<number>(0);

  const checkWarningCount = useCallback(() => {
    const count = getWarningCount();
    if (count >= maxWarnings && !isDisqualified) {
      setIsDisqualified(true);
      onDisqualify();
      return true;
    }
    return false;
  }, [getWarningCount, maxWarnings, onDisqualify, isDisqualified]);

  const triggerScreenshotAlert = useCallback(() => {
    const now = Date.now();
    // Debounce: only trigger once per 2 seconds
    if (now - lastScreenshotTime.current < 2000) return;
    lastScreenshotTime.current = now;

    recordCheatEvent({
      type: 'screenshot-attempt',
      description: 'Screenshot attempt detected',
    });
    onScreenshotAttempt?.();
    if (!checkWarningCount()) {
      onWarning('SCREENSHOT DETECTED! This violation has been recorded.');
    }
  }, [recordCheatEvent, onScreenshotAttempt, checkWarningCount, onWarning]);

  // Tab/Window visibility change detection
  useEffect(() => {
    if (!isExamMode || isDisqualified) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordCheatEvent({
          type: 'tab-switch',
          description: 'User switched to another tab or minimized the window',
        });
        
        if (!checkWarningCount()) {
          onWarning('Warning: Tab switching detected! This is a violation of exam rules.');
        }
      }
    };

    const handleBlur = () => {
      recordCheatEvent({
        type: 'tab-switch',
        description: 'Window lost focus',
      });
      
      if (!checkWarningCount()) {
        onWarning('Warning: Window focus lost! Please stay on the exam window.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isExamMode, recordCheatEvent, onWarning, checkWarningCount, isDisqualified]);

  // Prevent right-click
  useEffect(() => {
    if (!isExamMode || isDisqualified) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordCheatEvent({
        type: 'right-click',
        description: 'User attempted to open context menu',
      });
      onWarning('Right-click is disabled during the exam.');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [isExamMode, recordCheatEvent, onWarning, isDisqualified]);

  // Prevent copy/paste
  useEffect(() => {
    if (!isExamMode || isDisqualified) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      recordCheatEvent({
        type: 'copy-paste',
        description: 'User attempted to copy text',
      });
      onWarning('Copy/Paste is disabled during the exam.');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordCheatEvent({
        type: 'copy-paste',
        description: 'User attempted to paste text',
      });
      onWarning('Copy/Paste is disabled during the exam.');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
    };
  }, [isExamMode, recordCheatEvent, onWarning, isDisqualified]);

  // Detect screenshots via multiple methods - NO PERMISSIONS REQUIRED
  useEffect(() => {
    if (!isExamMode || isDisqualified) return;

    // Method 1: Keyboard shortcuts (works without permissions)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key - trigger immediately
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        triggerScreenshotAlert();
        return;
      }

      // Windows Snipping Tool: Win+Shift+S
      if ((e.key === 's' || e.key === 'S') && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        triggerScreenshotAlert();
        return;
      }

      // Mac screenshot: Cmd+Shift+3 or Cmd+Shift+4 or Cmd+Shift+5
      if ((e.key === '3' || e.key === '4' || e.key === '5') && e.shiftKey && e.metaKey) {
        e.preventDefault();
        triggerScreenshotAlert();
        return;
      }

      // Windows Game Bar: Win+G
      if (e.key === 'g' && e.metaKey) {
        e.preventDefault();
        triggerScreenshotAlert();
        return;
      }

      // Ctrl+P (print)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        triggerScreenshotAlert();
        return;
      }

      // Prevent common shortcuts
      if (e.ctrlKey || e.metaKey) {
        const blockedKeys = ['c', 'v', 'x', 'p', 's', 'a', 'u'];
        if (blockedKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }

      // Prevent F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        triggerScreenshotAlert();
      }

      // Prevent Alt+Tab (we can only detect, not prevent)
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
      }
    };

    // Method 2: Key up for PrintScreen (captures after key release)
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        triggerScreenshotAlert();
      }
    };

    // Method 3: Window resize detection (some screenshot tools resize)
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    const handleResize = () => {
      const widthDiff = Math.abs(window.innerWidth - lastWidth);
      const heightDiff = Math.abs(window.innerHeight - lastHeight);
      
      // If screen size suddenly changes dramatically, might be screen recording tool
      if (widthDiff > 200 || heightDiff > 200) {
        recordCheatEvent({
          type: 'suspicious-activity',
          description: 'Suspicious window resize detected',
        });
      }
      
      lastWidth = window.innerWidth;
      lastHeight = window.innerHeight;
    };

    // Method 4: DevTools detection
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        recordCheatEvent({
          type: 'devtools',
          description: 'Developer tools might be open',
        });
        triggerScreenshotAlert();
      }
    };

    // Check periodically
    const devToolsInterval = setInterval(detectDevTools, 2000);

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('resize', handleResize);
      clearInterval(devToolsInterval);
    };
  }, [isExamMode, recordCheatEvent, onWarning, triggerScreenshotAlert, isDisqualified]);

  // Method 5: Detect screen capture API usage - block without asking
  useEffect(() => {
    if (!isExamMode || isDisqualified) return;

    // Override getDisplayMedia to detect screen sharing attempts
    const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia;
    if (originalGetDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = async function() {
        triggerScreenshotAlert();
        throw new Error('Screen capture is not allowed during the exam');
      };
    }

    return () => {
      if (originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
    };
  }, [isExamMode, triggerScreenshotAlert, isDisqualified]);

  return {
    isDisqualified,
    warningCount: getWarningCount(),
  };
};
