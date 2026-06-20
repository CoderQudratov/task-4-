import { useEffect, useMemo, useRef } from "react";
import type { User } from "../types/user";
import UserRow from "./UserRow";
import { formatDate } from "../utils/formatDate";

interface UserTableProps {
  users: User[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

function UserTable({ users, selectedIds, onSelectionChange }: UserTableProps) {
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (!a.lastLogin && !b.lastLogin) return 0;
      if (!a.lastLogin) return 1;
      if (!b.lastLogin) return -1;
      return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
    });
  }, [users]);

  const allSelected =
    sortedUsers.length > 0 && selectedIds.length === sortedUsers.length;

  const someSelected =
    selectedIds.length > 0 && selectedIds.length < sortedUsers.length;

  const selectAllRef = useRef<HTMLInputElement>(null);
  const selectAllMobileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
    if (selectAllMobileRef.current) {
      selectAllMobileRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(sortedUsers.map((u) => u.id));
    }
  };

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <>
      {/* Desktop table — hidden on xs, visible sm+ */}
      <div className="d-none d-sm-block table-responsive">
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: "42px" }}>
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="form-check-input"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th style={{ width: "50px" }}>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Last Login</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted py-4">
                  No users found.
                </td>
              </tr>
            ) : (
              sortedUsers.map((user, index) => (
                <UserRow
                  key={user.id}
                  user={user}
                  index={index + 1}
                  isSelected={selectedIds.includes(user.id)}
                  onToggle={handleToggle}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list — visible xs only, hidden sm+ */}
      <div className="d-sm-none">
        {/* Select-all row */}
        <div className="d-flex align-items-center gap-2 py-2 border-bottom mb-2">
          <input
            ref={selectAllMobileRef}
            type="checkbox"
            className="form-check-input"
            checked={allSelected}
            onChange={handleSelectAll}
          />
          <span className="text-muted small">
            {allSelected
              ? "Deselect all"
              : `Select all (${sortedUsers.length})`}
          </span>
        </div>

        {sortedUsers.length === 0 ? (
          <div className="text-center text-muted py-4">No users found.</div>
        ) : (
          sortedUsers.map((user) => {
            const isSelected = selectedIds.includes(user.id);
            return (
              <div
                key={user.id}
                className={`card mb-2 ${isSelected ? "border-primary" : ""}`}
                style={isSelected ? { background: "#f0f4ff" } : undefined}
              >
                <div className="card-body py-2 px-3">
                  <div className="d-flex align-items-start gap-2">
                    <input
                      type="checkbox"
                      className="form-check-input mt-1 flex-shrink-0"
                      checked={isSelected}
                      onChange={() => handleToggle(user.id)}
                    />
                    <div className="flex-fill" style={{ minWidth: 0 }}>
                      <div className="fw-semibold text-truncate">
                        {user.name}
                      </div>
                      <div
                        className="text-muted text-truncate"
                        style={{ fontSize: "0.82rem" }}
                      >
                        {user.email}
                      </div>

                      {/* Status badges */}
                      <div className="mt-1 d-flex flex-wrap gap-1">
                        <span
                          className={`badge px-2 py-1 ${
                            user.status === "ACTIVE"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                          style={{ fontSize: "0.72rem" }}
                        >
                          {user.status}
                        </span>
                        {user.isVerified ? (
                          <span
                            className="badge bg-success px-2 py-1"
                            style={{ fontSize: "0.72rem" }}
                          >
                            Verified
                          </span>
                        ) : (
                          <span
                            className="badge bg-warning text-dark px-2 py-1"
                            style={{ fontSize: "0.72rem" }}
                          >
                            Unverified
                          </span>
                        )}
                      </div>

                      {/* Dates */}
                      <div
                        className="mt-1 text-muted"
                        style={{ fontSize: "0.78rem" }}
                      >
                        <div>Last login: {formatDate(user.lastLogin)}</div>
                        <div>Created: {formatDate(user.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default UserTable;
