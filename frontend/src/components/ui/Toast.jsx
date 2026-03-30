import { useCallback, useEffect, useState } from "react";

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-9999 flex flex-col items-end gap-2.5 pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ id, type, message, duration, onRemove }) {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onRemove(id), 300);
  }, [id, onRemove]);

  useEffect(() => {
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [dismiss, duration]);

  const config = TOAST_CONFIG[type];

  return (
    <div
      onClick={dismiss}
      role="alert"
      className="relative pointer-events-auto flex items-start gap-2.5 overflow-hidden rounded-[0.625rem] min-w-[260px] max-w-[380px]"
      style={{
        background: `color-mix(in srgb, ${config.accentVar} 12%, var(--background-muted) 88%)`,
        border: `1px solid color-mix(in srgb, ${config.accentVar} 35%, var(--border-muted) 65%)`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
        padding: "1rem",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateX(0) scale(1)"
          : "translateX(1rem) scale(0.97)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        animation: visible ? "toast-slideIn 0.3s ease forwards" : undefined,
      }}
    >
      <span
        className="flex-1 text-sm leading-snug break-words font-medium"
        style={{ color: "var(--foreground)" }}
      >
        {message}
      </span>
    </div>
  );
}

const TOAST_CONFIG = {
  success: {
    accentVar: "var(--success)",
    icon: "✓",
  },
  error: {
    accentVar: "var(--danger)",
    icon: "✕",
  },
  warning: {
    accentVar: "var(--warning)",
    icon: "⚠",
  },
  info: {
    accentVar: "var(--info)",
    icon: "ℹ",
  },
};

if (
  typeof document !== "undefined" &&
  !document.getElementById("toast-keyframes")
) {
  const style = document.createElement("style");
  style.id = "toast-keyframes";
  style.textContent = `
    @keyframes toast-slideIn {
      from { opacity: 0; transform: translateX(1rem) scale(0.97); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes toast-shrink {
      from { width: 100%; }
      to   { width: 0%; }
    }
  `;
  document.head.appendChild(style);
}
