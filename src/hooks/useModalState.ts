import { useState, useCallback } from "react";

export interface UseModalStateReturn<T> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T | null) => void;
  close: () => void;
  toggle: (data?: T | null) => void;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useModalState<T = any>(
  initialState = false,
  initialData: T | null = null
): UseModalStateReturn<T> {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);
  const [data, setData] = useState<T | null>(initialData);

  const open = useCallback((modalData?: T | null) => {
    if (modalData !== undefined) {
      setData(modalData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback((modalData?: T | null) => {
    setIsOpen((prev) => {
      if (!prev && modalData !== undefined) {
        setData(modalData);
      } else if (prev) {
        setData(null);
      }
      return !prev;
    });
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData,
  };
}
