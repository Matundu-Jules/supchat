import { useState, useCallback } from 'react';

export type RightPanelView = 'members' | 'roles' | 'settings' | null;

export function useRightPanel() {
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>(null);

  const openPanel = useCallback((view: RightPanelView) => {
    setRightPanelView(view);
  }, []);

  const closePanel = useCallback(() => {
    setRightPanelView(null);
  }, []);

  const togglePanel = useCallback((view: RightPanelView) => {
    setRightPanelView((current) => (current === view ? null : view));
  }, []);

  const isOpen = rightPanelView !== null;

  return {
    rightPanelView,
    isOpen,
    openPanel,
    closePanel,
    togglePanel,
  };
}
