import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/state/notificationStore";
import { useUiStore } from "@/state/uiStore";
import "./notifications.css";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationCenter() {
  const open = useUiStore((s) => s.notificationCenterOpen);
  const setOpen = useUiStore((s) => s.setNotificationCenterOpen);
  const notifications = useNotificationStore((s) => s.notifications);
  const dismiss = useNotificationStore((s) => s.dismiss);
  const clearAll = useNotificationStore((s) => s.clearAll);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="notification-center" ref={ref} role="dialog" aria-label="Notification Center">
      <div className="nc-header">
        <span>Notifications</span>
        {notifications.length > 0 && (
          <button type="button" onClick={clearAll}>
            Clear All
          </button>
        )}
      </div>
      <div className="nc-list">
        {notifications.length === 0 ? (
          <div className="nc-empty">No Notifications</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="nc-item">
              <div className="nc-item-header">
                <span className="nc-app-name">{n.appName}</span>
                <span className="nc-time">{relativeTime(n.timestamp)}</span>
                <button type="button" className="nc-dismiss" aria-label="Dismiss notification" onClick={() => dismiss(n.id)}>
                  ×
                </button>
              </div>
              <div className="nc-title">{n.title}</div>
              <div className="nc-message">{n.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
