import { useEffect } from "react";

interface StatusToastProps {
  show: boolean;
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

function StatusToast({ show, type, message, onClose }: StatusToastProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [show, message, onClose]);

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
      <div
        className={`toast align-items-center border-0 text-white ${
          type === "success" ? "bg-success" : "bg-danger"
        } ${show ? "show" : ""}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">{message}</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={onClose}
            aria-label="Close"
          />
        </div>
      </div>
    </div>
  );
}

export default StatusToast;
