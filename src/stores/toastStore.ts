import { create } from "zustand";

export type ToastType = "info" | "success" | "warning" | "error";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  icon?: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, icon?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (message, type = "info", icon, duration = 3000) => {
    const id = `toast-${++toastCounter}`;
    const newToast: Toast = { id, message, type, duration, icon };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

// 편의 함수
export const toast = {
  info: (msg: string, icon?: string) => useToastStore.getState().addToast(msg, "info", icon),
  success: (msg: string, icon?: string) => useToastStore.getState().addToast(msg, "success", icon),
  warning: (msg: string, icon?: string) => useToastStore.getState().addToast(msg, "warning", icon),
  error: (msg: string, icon?: string) => useToastStore.getState().addToast(msg, "error", icon),
};

