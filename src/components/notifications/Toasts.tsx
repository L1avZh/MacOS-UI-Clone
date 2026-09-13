import { useNotificationStore } from "@/state/notificationStore";
import "./notifications.css";

export default function Toasts() {
  const toasts = useNotificationStore((s) => s.toasts);
  const dismissToast = useNotificationStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <button key={t.id} type="button" className="toast" onClick={() => dismissToast(t.id)}>
          <div className="toast-header">
            <span className="toast-app-name">{t.appName}</span>
            <span className="toast-time">now</span>
          </div>
          <div className="toast-title">{t.title}</div>
          <div className="toast-message">{t.message}</div>
        </button>
      ))}
    </div>
  );
}
