"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setNotifications((prev) => [...prev, { ...notification, id }]);

    if (notification.duration !== 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, notification.duration ?? 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAll }}
    >
      {children}
      <ToastContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

function ToastContainer({
  notifications,
  onRemove,
}: {
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
      <AnimatePresence>
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onClose={() => onRemove(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-accent" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
      className="glass-card p-4 relative overflow-hidden"
    >
      <div className="flex items-start gap-3">
        {icons[notification.type]}
        <div className="flex-1">
          <p className="font-medium text-sm">{notification.title}</p>
          {notification.message && (
            <p className="text-xs text-muted mt-1">{notification.message}</p>
          )}
          {notification.action && (
            <button
              className="text-xs text-accent mt-2 hover:underline"
              onClick={notification.action.onClick}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-accent/10 transition-colors"
        >
          <X className="w-4 h-4 text-muted" />
        </button>
      </div>

      {notification.duration !== 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-accent/30"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{
            duration: (notification.duration ?? 5000) / 1000,
            ease: "linear",
          }}
        />
      )}
    </motion.div>
  );
}
