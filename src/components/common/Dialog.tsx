import { useEffect, useRef } from "react";
import "./dialog.css";

interface DialogProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
}

export default function Dialog({ title, children, onClose, actions }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    // Clicking the backdrop is a mouse-only convenience for dismissing the dialog;
    // Escape (handled above) is the keyboard-equivalent close action.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog-box" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <h2 className="dialog-title">{title}</h2>
        <div className="dialog-content">{children}</div>
        <div className="dialog-actions">
          {actions ?? (
            <button type="button" className="dialog-btn dialog-btn-primary" onClick={onClose} autoFocus>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
