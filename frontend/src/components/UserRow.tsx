import type { User } from "../types/user";
import { formatDate } from "../utils/formatDate";

interface UserRowProps {
  user: User;
  index: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

function UserRow({ user, index, isSelected, onToggle }: UserRowProps) {
  return (
    <tr className={isSelected ? "table-active" : ""}>
      <td>
        <input
          type="checkbox"
          className="form-check-input"
          checked={isSelected}
          onChange={() => onToggle(user.id)}
        />
      </td>

      <td className="text-muted">{index}</td>
      <td>{user.name}</td>
      <td>{user.email}</td>

      <td>
        <span
          className={`badge px-2 py-1 d-inline-block text-wrap ${
            user.status === "ACTIVE" ? "bg-success" : "bg-danger"
          }`}
          style={{ fontSize: "0.75rem", maxWidth: "100%" }}
        >
          {user.status}
        </span>
      </td>

      <td>
        {user.isVerified ? (
          <span
            className="badge bg-success px-2 py-1 d-inline-block text-wrap"
            style={{ fontSize: "0.75rem", maxWidth: "100%" }}
          >
            Verified
          </span>
        ) : (
          <span
            className="badge bg-warning text-dark px-2 py-1 d-inline-block text-wrap"
            style={{ fontSize: "0.75rem", maxWidth: "100%" }}
          >
            Unverified
          </span>
        )}
      </td>

      <td>{formatDate(user.lastLogin)}</td>
      <td>{formatDate(user.createdAt)}</td>
    </tr>
  );
}

export default UserRow;
