import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  blockUsers,
  unblockUsers,
  deleteUsers,
  deleteUnverifiedUsers,
} from "../api/users";
import { getStoredUser, clearUser } from "../utils/authStore";
import StatusToast from "./StatusToast";

interface ToolbarProps {
  selectedIds: string[];
  onActionComplete: () => void;
  onClearSelection: () => void;
}

interface ToastState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

interface SelfCheck {
  message: string;
  check: (me: { id: string; status: string }) => boolean;
}

function Toolbar({ selectedIds, onActionComplete, onClearSelection }: ToolbarProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "success",
    message: "",
  });

  const count = selectedIds.length;
  const hasSelection = count > 0;

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const runAction = async (
    action: () => Promise<unknown>,
    successMsg: string,
    selfCheck?: SelfCheck
  ) => {
    setLoading(true);
    try {
      await action();

      if (selfCheck) {
        const me = getStoredUser();
        if (me && selfCheck.check(me)) {
          clearUser();
          navigate("/login", {
            replace: true,
            state: { message: selfCheck.message },
          });
          return;
        }
      }

      showToast("success", successMsg);
      onClearSelection();
      onActionComplete();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Something went wrong. Please try again.";
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = () => {
    runAction(
      () => blockUsers(selectedIds),
      `${count} user${count > 1 ? "s" : ""} blocked.`,
      {
        message: "Your account was blocked.",
        check: (me) => selectedIds.includes(me.id),
      }
    );
  };

  const handleUnblock = () => {
    runAction(
      () => unblockUsers(selectedIds),
      `${count} user${count > 1 ? "s" : ""} unblocked.`
    );
  };

  const handleDelete = () => {
    runAction(
      () => deleteUsers(selectedIds),
      `${count} user${count > 1 ? "s" : ""} deleted.`,
      {
        message: "Your account was deleted.",
        check: (me) => selectedIds.includes(me.id),
      }
    );
  };

  const handleDeleteUnverified = () => {
    runAction(
      () => deleteUnverifiedUsers(),
      "All unverified users deleted.",
      {
        message: "Your account was deleted.",
        check: (me) => me.status === "UNVERIFIED",
      }
    );
  };

  return (
    <>
      {/* Toolbar */}
      <div className="bg-white border-bottom py-2 mb-3 sticky-top">
        <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
          <button
            className="btn btn-outline-warning btn-sm py-2"
            onClick={handleBlock}
            disabled={!hasSelection || loading}
            title="Block selected users"
          >
            Block
          </button>

          <button
            className="btn btn-outline-success btn-sm py-2"
            onClick={handleUnblock}
            disabled={!hasSelection || loading}
            title="Unblock selected users"
          >
            Unblock
          </button>

          <button
            className="btn btn-outline-danger btn-sm py-2"
            onClick={handleDelete}
            disabled={!hasSelection || loading}
            title="Delete selected users"
          >
            Delete
          </button>

          <button
            className="btn btn-outline-secondary btn-sm py-2"
            onClick={handleDeleteUnverified}
            disabled={loading}
            title="Delete all unverified users (no selection needed)"
          >
            Delete Unverified
          </button>

          {/* Selection count indicator */}
          {hasSelection && (
            <span className="text-muted ms-sm-2" style={{ fontSize: "0.875rem" }}>
              {count} selected
            </span>
          )}

          {/* Loading indicator */}
          {loading && (
            <span className="ms-sm-2">
              <span
                className="spinner-border spinner-border-sm text-secondary"
                role="status"
                aria-hidden="true"
              />
              <span className="text-muted ms-1" style={{ fontSize: "0.875rem" }}>
                Processing...
              </span>
            </span>
          )}
        </div>
      </div>

      <StatusToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={hideToast}
      />
    </>
  );
}

export default Toolbar;
