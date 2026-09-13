import { create } from "zustand";
import { createId } from "@/utils/id";

export interface AppNotification {
  id: string;
  appName: string;
  title: string;
  message: string;
  timestamp: number;
  /** Toasts auto-dismiss from the on-screen banner but stay in Notification Center until cleared. */
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  toasts: AppNotification[];
  push: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  dismissToast: (id: string) => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

const TOAST_LIFETIME_MS = 5500;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  toasts: [],
  push: (n) => {
    const notification: AppNotification = {
      ...n,
      id: createId("notif"),
      timestamp: Date.now(),
      read: false,
    };
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      toasts: [...state.toasts, notification],
    }));
    setTimeout(() => get().dismissToast(notification.id), TOAST_LIFETIME_MS);
  },
  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
  dismiss: (id) => {
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }));
  },
  clearAll: () => {
    set({ notifications: [] });
  },
}));
