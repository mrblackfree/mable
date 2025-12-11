"use client";

import { useToastStore, type ToastType } from "@/stores/toastStore";

const TYPE_STYLES: Record<ToastType, { bg: string; border: string; icon: string }> = {
  info: { bg: "bg-blue-900/90", border: "border-blue-500", icon: "ℹ️" },
  success: { bg: "bg-green-900/90", border: "border-green-500", icon: "✅" },
  warning: { bg: "bg-yellow-900/90", border: "border-yellow-500", icon: "⚠️" },
  error: { bg: "bg-red-900/90", border: "border-red-500", icon: "❌" },
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed left-1/2 top-20 z-50 flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((toast) => {
        const style = TYPE_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            className={`animate-slide-down flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${style.bg} ${style.border}`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="text-xl">{toast.icon || style.icon}</span>
            <span className="text-sm font-medium text-white">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

