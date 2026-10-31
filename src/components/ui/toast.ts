import { create } from 'zustand';

export type ToastTone = 'info' | 'success' | 'error' | 'warning';

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastState {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let id = 0;
export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  show: (toast) => {
    const next = { ...toast, id: ++id };
    set((s) => ({ toasts: [...s.toasts, next].slice(-4) }));
    window.setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== next.id) })), toast.tone === 'error' ? 8000 : 4500);
  },
  dismiss: (toastId) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) })),
}));

export const toast = {
  success: (title: string, description?: string) => useToasts.getState().show({ tone: 'success', title, description }),
  error: (title: string, description?: string) => useToasts.getState().show({ tone: 'error', title, description }),
  info: (title: string, description?: string) => useToasts.getState().show({ tone: 'info', title, description }),
  warning: (title: string, description?: string) => useToasts.getState().show({ tone: 'warning', title, description }),
};
