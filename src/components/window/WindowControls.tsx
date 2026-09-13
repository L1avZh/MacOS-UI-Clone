import "./window-controls.css";

interface WindowControlsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  focused: boolean;
}

export default function WindowControls({ onClose, onMinimize, onMaximize, focused }: WindowControlsProps) {
  return (
    <div className={`window-controls ${focused ? "" : "unfocused"}`} data-no-drag>
      <button
        type="button"
        className="window-control close"
        aria-label="Close window"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <svg viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        className="window-control minimize"
        aria-label="Minimize window"
        onClick={(e) => {
          e.stopPropagation();
          onMinimize();
        }}
      >
        <svg viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 5h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        className="window-control maximize"
        aria-label="Maximize window"
        onClick={(e) => {
          e.stopPropagation();
          onMaximize();
        }}
      >
        <svg viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2.3 6.3 6.3 2.3M2.3 3.5V6.3H5.1M7.7 3.7 3.7 7.7M7.7 6.5V3.7H4.9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
